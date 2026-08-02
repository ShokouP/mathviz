/**
 * mathviz — js/pages/practice.js
 * 练习页：按课案/难度筛选 → 答题 → 即时判分+解析 → 错题本。
 *
 * 数据：window.QuestionBank
 * 存储：错题本 localStorage 键 mathviz.practice.wrong
 */
(function () {
  'use strict';
  const WRONG_KEY = 'mathviz.practice.wrong';

  App.register('practice', {
    mount(ctx) {
      this._ctx = ctx;
      this._filter = { courseId: '', difficulty: 0 }; // 0=不限
      this._mode = 'list'; // list | wrongbook
      this._answered = {}; // 本次会话已答：qId -> {picked, correct}
      this._render(ctx.container);
      this._showList();
      return this;
    },

    _render(container) {
      container.innerHTML = `
        <h2>练习</h2>
        <div class="practice-toolbar">
          <select id="pf-course"><option value="">全部章节</option></select>
          <select id="pf-diff">
            <option value="0">全部难度</option>
            <option value="1">基础</option>
            <option value="2">进阶</option>
            <option value="3">挑战</option>
          </select>
          <span class="practice-stat dim" id="pf-stat"></span>
          <button class="ghost" id="pf-wrongbook" style="margin-left:auto">错题本</button>
          <button id="pf-back" style="display:none">返回列表</button>
        </div>
        <div id="practice-body"></div>`;
      // 填充章节下拉
      const courseSel = container.querySelector('#pf-course');
      const courses = (window.COURSES && window.COURSES.list) || [];
      courses.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = c.title;
        courseSel.appendChild(opt);
      });
      courseSel.addEventListener('change', () => {
        this._filter.courseId = courseSel.value;
        if (this._mode === 'list') this._showList();
      });
      container.querySelector('#pf-diff').addEventListener('change', (e) => {
        this._filter.difficulty = parseInt(e.target.value, 10);
        if (this._mode === 'list') this._showList();
      });
      container.querySelector('#pf-wrongbook').addEventListener('click', () => this._showWrongbook());
      container.querySelector('#pf-back').addEventListener('click', () => this._showList());
    },

    _currentQuestions() {
      let qs;
      if (this._mode === 'wrongbook') {
        const wrong = MVutil.store.get(WRONG_KEY, {});
        qs = QuestionBank.all().filter((q) => wrong[q.id]);
      } else {
        qs = QuestionBank.filter({
          courseId: this._filter.courseId || undefined,
          difficulty: this._filter.difficulty || undefined,
        });
      }
      return qs;
    },

    _showList() {
      this._mode = 'list';
      this._ctx.container.querySelector('#pf-wrongbook').style.display = '';
      this._ctx.container.querySelector('#pf-back').style.display = 'none';
      const qs = this._currentQuestions();
      this._ctx.container.querySelector('#pf-stat').textContent =
        qs.length + ' 题';
      this._renderQuestions(qs);
    },

    _showWrongbook() {
      this._mode = 'wrongbook';
      this._ctx.container.querySelector('#pf-wrongbook').style.display = 'none';
      this._ctx.container.querySelector('#pf-back').style.display = '';
      const wrong = MVutil.store.get(WRONG_KEY, {});
      const count = Object.keys(wrong).length;
      this._ctx.container.querySelector('#pf-stat').textContent =
        '错题本：' + count + ' 题';
      const qs = this._currentQuestions();
      if (!qs.length) {
        this._ctx.container.querySelector('#practice-body').innerHTML =
          '<p class="muted" style="padding:30px;text-align:center">错题本为空。答错的题会自动收集到这里，方便重做。</p>';
        return;
      }
      this._renderQuestions(qs);
    },

    _renderQuestions(qs) {
      const body = this._ctx.container.querySelector('#practice-body');
      MVutil.clear(body);
      if (!qs.length) {
        body.innerHTML = '<p class="muted" style="padding:30px;text-align:center">没有符合条件的题目。</p>';
        return;
      }
      qs.forEach((q, idx) => body.appendChild(this._renderOne(q, idx + 1)));
      // 渲染公式
      if (window.MathViz) MathViz.math.renderMath(body);
    },

    _renderOne(q, num) {
      const diffLabel = ['', '基础', '进阶', '挑战'][q.difficulty];
      const courseName = (window.COURSES.byId[q.courseId] || {}).title || q.courseId;
      const wrap = MVutil.h('div', { class: 'question-card' });
      const meta = MVutil.h('div', { class: 'q-meta dim' },
        '第 ' + num + ' 题 · ' + courseName + ' · ' + diffLabel + ' · ' + this._typeName(q.type));
      const stem = MVutil.h('div', { class: 'q-stem' });
      stem.innerHTML = window.MVmd ? MVmd.render(q.stem) : MVutil.escapeHtml(q.stem);
      if (window.MathViz) MathViz.math.renderMath(stem);
      wrap.appendChild(meta);
      wrap.appendChild(stem);

      // 选项 / 作答区
      const optWrap = MVutil.h('div', { class: 'q-options' });
      wrap.appendChild(optWrap);
      const explainWrap = MVutil.h('div', { class: 'q-explain', style: { display: 'none' } });
      wrap.appendChild(explainWrap);

      const state = this._answered[q.id];

      if (q.type === 'fill') {
        const input = MVutil.h('input', { type: 'text', placeholder: '填入答案…', style: { width: '70%' } });
        const btn = MVutil.h('button', { class: 'primary' }, '提交');
        const judge = () => {
          const val = input.value.trim().replace(/\s+/g, '').toLowerCase();
          const ans = String(q.answer).trim().replace(/\s+/g, '').toLowerCase();
          // 归一化：把 ln(x) 与 lnx 等视作等价（去括号比较）
          const norm = (s) => s.replace(/[()]/g, '').replace(/\*/g, '');
          const correct = norm(val) === norm(ans);
          this._recordAnswer(q, correct);
          input.disabled = true; btn.disabled = true;
          this._showResult(wrap, optWrap, explainWrap, q, correct, val);
        };
        btn.addEventListener('click', judge);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') judge(); });
        const row = MVutil.h('div', { class: 'q-fill-row' });
        row.appendChild(input); row.appendChild(btn);
        optWrap.appendChild(row);
        if (state) { input.value = state.picked; judge(); }
      } else {
        // single / multi / judge
        const isMulti = q.type === 'multi';
        q.options.forEach((opt, i) => {
          const btn = MVutil.h('button', { class: 'q-option', dataset: { idx: String(i) } });
          btn.innerHTML = window.MVmd ? MVmd.inline(opt) : MVutil.escapeHtml(opt);
          if (window.MathViz) MathViz.math.renderMath(btn);
          btn.addEventListener('click', () => {
            if (btn.classList.contains('locked')) return;
            if (isMulti) {
              btn.classList.toggle('picked');
            } else {
              // 单选/判断：直接判定
              optWrap.querySelectorAll('.q-option').forEach((b) => b.classList.remove('picked'));
              btn.classList.add('picked');
              const correct = (i === q.answer) || (q.type === 'judge' && ((i === 1) === q.answer));
              this._recordAnswer(q, correct);
              optWrap.querySelectorAll('.q-option').forEach((b) => b.classList.add('locked'));
              this._showResult(wrap, optWrap, explainWrap, q, correct, isMulti ? null : i);
            }
          });
          optWrap.appendChild(btn);
        });
        // 多选：加提交按钮
        if (isMulti) {
          const submit = MVutil.h('button', { class: 'primary', style: { marginTop: '8px' } }, '提交多选');
          submit.addEventListener('click', () => {
            const picked = Array.from(optWrap.querySelectorAll('.q-option.picked')).map((b) => parseInt(b.dataset.idx, 10));
            const correct = picked.length === q.answer.length && picked.every((i) => q.answer.includes(i));
            this._recordAnswer(q, correct);
            optWrap.querySelectorAll('.q-option').forEach((b) => b.classList.add('locked'));
            submit.disabled = true;
            this._showResult(wrap, optWrap, explainWrap, q, correct, picked);
          });
          optWrap.appendChild(submit);
        }
      }
      return wrap;
    },

    _showResult(wrap, optWrap, explainWrap, q, correct, picked) {
      // 标记选项对错
      if (q.type !== 'fill' && q.type !== 'multi' && q.type !== 'judge' && typeof q.answer === 'number') {
        optWrap.querySelectorAll('.q-option').forEach((b) => {
          const i = parseInt(b.dataset.idx, 10);
          if (i === q.answer) b.classList.add('correct');
          else if (b.classList.contains('picked')) b.classList.add('wrong');
        });
      }
      if (q.type === 'judge') {
        optWrap.querySelectorAll('.q-option').forEach((b) => {
          const i = parseInt(b.dataset.idx, 10);
          if ((i === 1) === q.answer) b.classList.add('correct');
          else if (b.classList.contains('picked')) b.classList.add('wrong');
        });
      }
      // 解析
      const badge = MVutil.h('div', { class: 'q-verdict ' + (correct ? 'ok' : 'wrong') },
        correct ? '✓ 答对' : '✗ 答错');
      const ex = MVutil.h('div', { class: 'q-explain-body' });
      ex.innerHTML = '<b>解析：</b>' + (window.MVmd ? MVmd.renderInline ? MVmd.renderInline(q.explain) : MVmd.inline(q.explain) : MVutil.escapeHtml(q.explain));
      // MVmd.render 不适合，直接 inline + renderMath
      ex.innerHTML = '<b>解析：</b>' + (window.MVmd ? MVmd.inline(q.explain) : MVutil.escapeHtml(q.explain));
      if (window.MathViz) MathViz.math.renderMath(ex);
      explainWrap.appendChild(badge);
      explainWrap.appendChild(ex);
      explainWrap.style.display = 'block';
    },

    _recordAnswer(q, correct) {
      this._answered[q.id] = { correct };
      const wrong = MVutil.store.get(WRONG_KEY, {});
      if (correct) {
        // 答对则从错题本移除（已掌握）
        delete wrong[q.id];
      } else {
        wrong[q.id] = { ts: Date.now() };
      }
      try { MVutil.store.set(WRONG_KEY, wrong); } catch (e) {}
    },

    _typeName(t) {
      return { single: '单选', multi: '多选', judge: '判断', fill: '填空' }[t] || t;
    },

    unmount() {},
  });
})();
