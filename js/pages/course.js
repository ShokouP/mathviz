/**
 * mathviz — js/pages/course.js
 * 通用课案页框架：分步叙事 + 内嵌画布 + 控件栏。
 *
 * 课案数据结构（由 js/data/courses/*.js 提供）：
 *   {
 *     id, title, summary, coverSVG,
 *     steps: [
 *       {
 *         title, narrative (Markdown/KaTeX 文本),
 *         scene: { axes, layers, timeline? },     // 该步的可视化
 *         controls: [ { name, label, type:'slider', min, max, step?, value, bind? } ]
 *       }
 *     ]
 *   }
 *
 * 控件 bind：滑块值会写入 scene 的对应位置（用点路径如 "layers[1].at"），
 * 或调用 step.onControl(name, value, scene) 自定义。
 */
(function () {
  'use strict';

  /**
   * 路径读写：支持点路径 "a.b.c" 与下标 "a[0].b" 两种写法。
   *   getPath(obj, 'layers[1].n') / setPath(obj, 'layers[1].n', 5)
   * 兼容旧式纯点路径 "layers.1.n"。
   */
  function tokenizePath(path) {
    if (!path) return [];
    // 把 "a[0].b[1]" 拆成 ['a','0','b','1']
    return path.split(/[.]/).flatMap((seg) => {
      const m = seg.match(/^([^\[]*)((?:\[\d+\])*)$/);
      if (!m) return [seg];
      const head = m[1];
      const idxs = (m[2] || '').match(/\[(\d+)\]/g) || [];
      return [head, ...idxs.map((s) => s.slice(1, -1))].filter((x) => x !== '');
    });
  }
  function getPath(obj, path) {
    return tokenizePath(path).reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function setPath(obj, path, val) {
    const segs = tokenizePath(path);
    if (!segs.length) return;
    let o = obj;
    for (let i = 0; i < segs.length - 1; i++) {
      const k = segs[i];
      const nextK = segs[i + 1];
      if (o[k] == null) o[k] = /^\d+$/.test(String(nextK)) ? [] : {};
      o = o[k];
    }
    o[segs[segs.length - 1]] = val;
  }

  App.register('course', {
    mount(ctx) {
      const id = ctx.route.arg;
      const course = window.COURSES && window.COURSES.byId[id];
      this._ctx = ctx;
      if (!course) {
        ctx.container.innerHTML = `<p class="muted">未知课案 "${MVutil.escapeHtml(id || '')}"，
          <a href="#/home">返回首页</a></p>`;
        return;
      }
      this._course = course;
      this._courseId = id;
      this._controlState = {}; // 各步控件的当前值

      // 读取持久化进度（step + controlState）
      const saved = this._readProgress(id);
      this._controlState = saved.controls || {};
      const startStep = saved.step || 0;

      this._render(ctx.container, course);
      this._gotoStep(startStep);

      // 键盘导航：← → 切步骤（不拦截输入框/textarea）
      this._keyHandler = (e) => {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.key === 'ArrowLeft') { this._gotoStep(this._stepIdx - 1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { this._gotoStep(this._stepIdx + 1); e.preventDefault(); }
      };
      ctx.container.addEventListener('keydown', this._keyHandler);
      // 让容器可聚焦以接收键盘
      ctx.container.tabIndex = 0;
      return this;
    },

    unmount() {
      // 离开前持久化当前进度
      if (this._courseId != null) this._writeProgress(this._courseId, this._stepIdx, this._controlState);
      if (this._ctx && this._ctx.container && this._keyHandler) {
        this._ctx.container.removeEventListener('keydown', this._keyHandler);
      }
      if (window.VIZ && VIZ.mounted) VIZ.dispose();
      this._course = null;
    },

    /** 把当前画布导出为 PNG 文件下载 */
    _downloadCanvas() {
      const cv = this._canvas;
      if (!cv) return;
      try {
        // canvas 已是高 DPR 后缓冲（设备像素），toDataURL 直接得到高清图
        const dataUrl = cv.toDataURL('image/png');
        const a = document.createElement('a');
        const course = this._course;
        const step = this._course.steps[this._stepIdx];
        const name = (course ? course.id : 'mathviz') + '_' + (this._stepIdx + 1) +
          (step && step.title ? '_' + step.title.replace(/[^\w\u4e00-\u9fa5]/g, '') : '');
        a.download = name + '.png';
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        console.error('[downloadCanvas]', e);
        alert('截图失败：' + (e.message || '未知错误'));
      }
    },

    // ============ 侧边 AI 助手 ============
    _bindSideAI() {
      this._sideSend.addEventListener('click', () => this._sideSendMsg());
      this._sideClear.addEventListener('click', () => {
        if (confirm('清空本课案的 AI 对话？')) {
          this._sideMsgs.innerHTML = '<div class="side-ai-empty dim">向 AI 提问关于当前步骤的内容</div>';
        }
      });
      this._sideInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this._sideSendMsg();
        }
      });
    },

    async _sideSendMsg() {
      const text = this._sideInput.value.trim();
      if (!text) return;
      if (!AIConfig.isConfigured()) {
        this._renderSideMsg('system', '⚠ 未配置 API，请到 <a href="#/settings">设置页</a> 填写。');
        return;
      }
      // 渲染用户消息
      this._renderSideMsg('user', MVutil.escapeHtml(text));
      this._sideInput.value = '';

      // 构造带课案上下文的消息
      const step = this._course.steps[this._stepIdx];
      const contextMsg = `当前正在学习课案《${this._course.title}》第 ${this._stepIdx + 1} 步「${step.title || ''}」。
步骤内容要点：${(step.narrative || '').slice(0, 500).replace(/\$\$?/g, '')}
学生提问：${text}`;

      // 助手占位
      const bubble = this._renderSideMsg('assistant', '…');
      this._sideSend.disabled = true;

      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 60000);
      await AIClient.chat(
        [{ role: 'user', content: contextMsg }],
        {
          signal: ac.signal,
          onToken: (t) => { bubble.innerHTML = (bubble.innerHTML === '…' ? '' : bubble.innerHTML) + MVutil.escapeHtml(t).replace(/\n/g, '<br>'); this._scrollSideBottom(); },
          onDone: (r) => {
            clearTimeout(timer);
            this._sideSend.disabled = false;
            // 用 markdown 重渲染最终内容
            bubble.innerHTML = MVmd.render(r.full);
            if (window.MathViz) MathViz.math.renderMath(bubble);
            this._scrollSideBottom();
          },
          onError: (err) => {
            clearTimeout(timer);
            this._sideSend.disabled = false;
            bubble.innerHTML = '<span class="ans-wrong">' + MVutil.escapeHtml(err.message || '错误') + '</span>';
          },
        }
      );
    },

    _renderSideMsg(role, html) {
      // 清空 empty 占位
      const empty = this._sideMsgs.querySelector('.side-ai-empty');
      if (empty) empty.remove();
      const wrap = MVutil.h('div', { class: 'side-msg side-msg-' + role });
      const bubble = MVutil.h('div', { class: 'side-bubble' });
      bubble.innerHTML = html;
      wrap.appendChild(bubble);
      this._sideMsgs.appendChild(wrap);
      this._scrollSideBottom();
      return bubble;
    },

    _scrollSideBottom() {
      this._sideMsgs.scrollTop = this._sideMsgs.scrollHeight;
    },

    // ============ 高光与批注 ============
    _bindAnnotation() {
      const narr = this._narrativeEl;
      // 监听选区变化
      document.addEventListener('mouseup', (e) => {
        // 仅处理叙事区内的选区
        if (!narr.contains(e.target)) { this._hideAnnoMenu(); return; }
        const sel = window.getSelection();
        const text = sel.toString().trim();
        if (text.length < 2 || text.length > 500) { this._hideAnnoMenu(); return; }
        // 确认选区在 narrative 内
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        if (!narr.contains(range.commonAncestorContainer)) { this._hideAnnoMenu(); return; }
        this._showAnnoMenu(e.clientX, e.clientY, text);
      });
    },

    _showAnnoMenu(x, y, text) {
      this._hideAnnoMenu();
      const menu = MVutil.h('div', { class: 'anno-menu', style: { left: x + 'px', top: y + 'px' } });
      const hlBtn = MVutil.h('button', { class: 'anno-btn hl' }, '🖍 高光');
      const noteBtn = MVutil.h('button', { class: 'anno-btn note' }, '✎ 批注');
      hlBtn.addEventListener('click', () => { this._applyHighlight(text); this._hideAnnoMenu(); window.getSelection().removeAllRanges(); });
      noteBtn.addEventListener('click', () => { this._openNoteEditor(text); this._hideAnnoMenu(); window.getSelection().removeAllRanges(); });
      menu.appendChild(hlBtn);
      menu.appendChild(noteBtn);
      document.body.appendChild(menu);
    },

    _hideAnnoMenu() {
      const m = document.querySelector('.anno-menu');
      if (m) m.remove();
    },

    /** 应用高光：在叙事区找匹配文本并包裹 mark */
    _applyHighlight(text) {
      const key = 'mathviz.ann.' + this._courseId;
      const anns = MVutil.store.get(key, { highlights: [], notes: {} });
      anns.highlights.push({ step: this._stepIdx, text: text });
      MVutil.store.set(key, anns);
      this._renderHighlights();
    },

    _openNoteEditor(text) {
      const key = 'mathviz.ann.' + this._courseId;
      const anns = MVutil.store.get(key, { highlights: [], notes: {} });
      const noteId = 'n_' + Date.now().toString(36);
      const overlay = MVutil.h('div', { class: 'anno-overlay' });
      const card = MVutil.h('div', { class: 'anno-card' });
      card.innerHTML = '<h3 style="margin:0 0 8px">添加批注</h3>' +
        '<div class="anno-quote dim">"' + MVutil.escapeHtml(text.slice(0, 80)) + (text.length > 80 ? '…' : '') + '"</div>' +
        '<textarea class="anno-textarea" placeholder="写下你的理解/疑问…" rows="4"></textarea>' +
        '<div style="display:flex;gap:8px;margin-top:8px"><button class="primary anno-save">保存</button><button class="ghost anno-cancel">取消</button></div>';
      overlay.appendChild(card);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
      const ta = card.querySelector('.anno-textarea');
      ta.focus();
      card.querySelector('.anno-save').addEventListener('click', () => {
        const noteText = ta.value.trim();
        if (noteText) {
          anns.notes[noteId] = { step: this._stepIdx, quote: text, note: noteText };
          MVutil.store.set(key, anns);
          this._renderNotes();
        }
        overlay.remove();
      });
      card.querySelector('.anno-cancel').addEventListener('click', () => overlay.remove());
    },

    /** 渲染高光（简单实现：在文本节点中查找并包裹） */
    _renderHighlights() {
      const key = 'mathviz.ann.' + this._courseId;
      const anns = MVutil.store.get(key, { highlights: [], notes: {} });
      const stepHighlights = anns.highlights.filter((h) => h.step === this._stepIdx);
      if (!stepHighlights.length) return;
      // 简化实现：因叙事已含 HTML（KaTeX 等），直接操作 textNode 风险高。
      // 采用轻量方案：在叙事底部列出高光列表。
      let list = this._narrativeEl.querySelector('.anno-highlight-list');
      if (!list) {
        list = MVutil.h('div', { class: 'anno-highlight-list card' });
        this._narrativeEl.appendChild(list);
      } else {
        MVutil.clear(list);
      }
      const title = MVutil.h('div', { class: 'anno-section-title' }, '🖍 高光（' + stepHighlights.length + '）');
      list.appendChild(title);
      stepHighlights.forEach((h, i) => {
        const item = MVutil.h('div', { class: 'anno-hl-item' }, '「' + h.text.slice(0, 60) + (h.text.length > 60 ? '…' : '') + '」');
        const del = MVutil.h('span', { class: 'anno-del', dataset: { idx: String(i) } }, '✕');
        del.addEventListener('click', () => {
          // 找到原始高光并删除
          const allIdx = anns.highlights.indexOf(h);
          if (allIdx >= 0) { anns.highlights.splice(allIdx, 1); MVutil.store.set(key, anns); this._renderHighlights(); }
        });
        item.appendChild(del);
        list.appendChild(item);
      });
    },

    /** 渲染批注列表 */
    _renderNotes() {
      const key = 'mathviz.ann.' + this._courseId;
      const anns = MVutil.store.get(key, { highlights: [], notes: {} });
      const stepNotes = Object.entries(anns.notes).filter(([, n]) => n.step === this._stepIdx);
      let list = this._narrativeEl.querySelector('.anno-note-list');
      if (!list) {
        list = MVutil.h('div', { class: 'anno-note-list card' });
        this._narrativeEl.appendChild(list);
      } else {
        MVutil.clear(list);
      }
      if (!stepNotes.length) { list.style.display = 'none'; return; }
      list.style.display = 'block';
      const title = MVutil.h('div', { class: 'anno-section-title' }, '✎ 批注（' + stepNotes.length + '）');
      list.appendChild(title);
      stepNotes.forEach(([id, n]) => {
        const item = MVutil.h('div', { class: 'anno-note-item' });
        item.innerHTML = '<div class="anno-note-quote dim">「' + MVutil.escapeHtml(n.quote.slice(0, 50)) + '」</div>' +
          '<div class="anno-note-text">' + MVutil.escapeHtml(n.note) + '</div>';
        const del = MVutil.h('span', { class: 'anno-del', dataset: { id: id } }, '✕');
        del.addEventListener('click', () => {
          delete anns.notes[id];
          MVutil.store.set(key, anns);
          this._renderNotes();
        });
        item.appendChild(del);
        list.appendChild(item);
      });
    },

    // ---- 进度持久化（localStorage 键 mathviz.course.progress）----
    _readProgress(courseId) {
      const all = MVutil.store.get('mathviz.course.progress', {});
      return all[courseId] || {};
    },
    _writeProgress(courseId, step, controls) {
      const all = MVutil.store.get('mathviz.course.progress', {});
      const prev = all[courseId] || {};
      // 维护 visited 数组：记录访问过的步骤索引（去重）
      const visited = Array.isArray(prev.visited) ? prev.visited.slice() : [];
      if (visited.indexOf(step) < 0) visited.push(step);
      all[courseId] = {
        step,
        controls: Object.assign({}, controls),
        visited,
      };
      try { MVutil.store.set('mathviz.course.progress', all); }
      catch (e) { /* 配额满则忽略，不影响功能 */ }
    },

    _render(container, course) {
      const stepsBar = course.steps.map((s, i) =>
        `<button class="step-btn${i === 0 ? ' primary' : ''}" data-step="${i}">${i + 1}</button>`).join('');
      container.innerHTML = `
        <div class="course-layout">
          <div class="course-main">
            <h2>${MVutil.escapeHtml(course.title)}</h2>
            <div class="steps-bar">${stepsBar}
              <span class="dim" style="margin-left:auto;align-self:center;font-size:13px" id="step-title"></span>
            </div>
            <div class="dim" style="font-size:11px;margin-bottom:8px">提示：← → 切步骤；选中文字可高光/批注；进度自动保存。</div>
            <div class="canvas-wrap">
              <canvas id="course-canvas"></canvas>
              <div class="controls" id="course-controls"></div>
            </div>
            <div class="narrative card" id="course-narrative" tabindex="0"></div>
          </div>
          <aside class="course-side">
            <div class="side-ai" id="side-ai">
              <div class="side-ai-header">
                <span>💬 AI 助手</span>
                <button class="ghost side-ai-clear" id="side-ai-clear" style="font-size:11px;padding:2px 8px">清空</button>
              </div>
              <div class="side-ai-messages" id="side-ai-messages"></div>
              <div class="side-ai-input">
                <textarea id="side-ai-textarea" placeholder="问 AI 关于本步内容…（Ctrl+Enter 发送）" rows="2"></textarea>
                <button class="primary" id="side-ai-send">发送</button>
              </div>
            </div>
          </aside>
        </div>`;

      // 绑定步骤切换
      container.querySelectorAll('.step-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this._gotoStep(parseInt(btn.dataset.step, 10));
        });
      });

      this._canvas = container.querySelector('#course-canvas');
      this._narrativeEl = container.querySelector('#course-narrative');
      this._controlsEl = container.querySelector('#course-controls');
      this._stepTitleEl = container.querySelector('#step-title');
      this._stepBtns = container.querySelectorAll('.step-btn');
      this._sideMsgs = container.querySelector('#side-ai-messages');
      this._sideInput = container.querySelector('#side-ai-textarea');
      this._sideSend = container.querySelector('#side-ai-send');
      this._sideClear = container.querySelector('#side-ai-clear');
      this._bindSideAI();
      this._bindAnnotation();
    },

    _gotoStep(idx) {
      const course = this._course;
      if (!course || idx < 0 || idx >= course.steps.length) return;
      this._stepIdx = idx;
      // 更新步骤按钮高亮 + 已访问标记
      const visited = (this._readProgress(this._courseId).visited) || [];
      this._stepBtns.forEach((b, i) => {
        b.classList.toggle('primary', i === idx);
        b.classList.toggle('visited', visited.indexOf(i) >= 0 && i !== idx);
      });
      const step = course.steps[idx];
      this._stepTitleEl.textContent = step.title || '';
      // 全部步骤访问过 → 显示完成提示
      if (visited.length + 1 >= course.steps.length && idx === course.steps.length - 1) {
        this._stepTitleEl.textContent = (step.title || '') + ' · 🎉 已完成全部步骤';
      }

      // 渲染叙事（Markdown + KaTeX）
      this._narrativeEl.innerHTML = window.MVmd ? window.MVmd.render(step.narrative || '') : (step.narrative || '');
      if (window.MathViz) window.MathViz.math.renderMath(this._narrativeEl);
      // 渲染该步骤的高光与批注
      this._renderHighlights();
      this._renderNotes();

      // 初始化控件状态（保留已设置的值，首次用 default）
      const controls = step.controls || [];
      controls.forEach((c) => {
        if (this._controlState[c.name] === undefined) {
          this._controlState[c.name] = c.value;
        }
      });

      // 渲染控件
      this._renderControls(step, controls);

      // 挂载引擎到本页画布（VIZ 是单例，每次进课案都重新指向本 canvas）
      VIZ.mount(this._canvas);
      this._applyScene(step);

      // 持久化当前步骤
      if (this._courseId != null) this._writeProgress(this._courseId, idx, this._controlState);
    },

    _renderControls(step, controls) {
      const el = this._controlsEl;
      MVutil.clear(el);
      // 通用播放控件（仅当 scene 有 timeline 时显示）
      if (step.scene && step.scene.timeline) {
        const playBtn = MVutil.h('button', { class: 'primary' }, '▶ 播放');
        playBtn.addEventListener('click', () => VIZ.play());
        const pauseBtn = MVutil.h('button', {}, '⏸ 暂停');
        pauseBtn.addEventListener('click', () => VIZ.pause());
        const replayBtn = MVutil.h('button', {}, '↺ 重播');
        replayBtn.addEventListener('click', () => { VIZ.seek(0); VIZ.play(); });
        el.appendChild(playBtn);
        el.appendChild(pauseBtn);
        el.appendChild(replayBtn);
      }
      // 参数滑块
      controls.forEach((c) => {
        if (c.type === 'slider') {
          const group = MVutil.h('div', { class: 'slider-group' });
          const label = MVutil.h('label', {}, c.label || c.name);
          const valSpan = MVutil.h('span', { class: 'mono' }, MVutil.fmt(this._controlState[c.name], 3));
          const input = MVutil.h('input', { type: 'range', min: String(c.min), max: String(c.max), step: String(c.step || (c.max - c.min) / 100), value: String(this._controlState[c.name]) });
          const onInput = MVutil.debounce(() => {
            let v = parseFloat(input.value);
            if (isNaN(v)) return;
            v = MVutil.clamp(v, c.min, c.max);
            this._controlState[c.name] = v;
            valSpan.textContent = MVutil.fmt(v, 3);
            this._applyScene(step);
            // 持久化控件值
            if (this._courseId != null) this._writeProgress(this._courseId, this._stepIdx, this._controlState);
          }, 30);
          input.addEventListener('input', onInput);
          group.appendChild(label);
          group.appendChild(input);
          group.appendChild(valSpan);
          el.appendChild(group);
        }
      });
      // 截图导出（所有步骤通用）
      const shotBtn = MVutil.h('button', { class: 'ghost', title: '下载当前画布为 PNG' }, '📷 PNG');
      shotBtn.addEventListener('click', () => this._downloadCanvas());
      el.appendChild(shotBtn);
      // 上一步/下一步导航
      const nav = MVutil.h('div', { style: { marginLeft: 'auto' } });
      if (this._stepIdx > 0) {
        const prev = MVutil.h('button', { class: 'ghost' }, '← 上一步');
        prev.addEventListener('click', () => this._gotoStep(this._stepIdx - 1));
        nav.appendChild(prev);
      }
      if (this._stepIdx < this._course.steps.length - 1) {
        const next = MVutil.h('button', { class: 'primary' }, '下一步 →');
        next.addEventListener('click', () => this._gotoStep(this._stepIdx + 1));
        nav.appendChild(next);
      }
      el.appendChild(nav);
    },

    /** 根据当前控件状态构建并执行 scene */
    _applyScene(step) {
      // 深拷贝 scene，避免控件 mutate 污染原始数据
      const scene = JSON.parse(JSON.stringify(step.scene, (k, v) => (typeof v === 'function' ? v : v)));
      const controls = step.controls || [];
      controls.forEach((c) => {
        const v = this._controlState[c.name];
        if (c.bind) {
          setPath(scene, c.bind, v);
        } else if (step.onControl) {
          step.onControl(c.name, v, scene);
        }
      });
      VIZ.execute(scene);
    },
  });
})();
