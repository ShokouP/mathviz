/**
 * mathviz — js/pages/exam.js
 * 模拟考试：自动组卷（按章节配比）+ 限时 + 交卷判分 + 成绩单。
 *
 * 组卷规则（覆盖已学课案，按难度混合）：
 *   intro×2, limit×3, derivative×2, derivative-rules×2, integral×2, taylor×2, series-basics×2, ode×1
 *   不足则按题库实际抽取，最少 10 题。
 * 计时：默认 15 分钟，可调。
 * 存储：成绩记录 mathviz.exam.history（最近 5 次）。
 */
(function () {
  'use strict';
  const HISTORY_KEY = 'mathviz.exam.history';
  const DEFAULT_MINUTES = 15;
  const PAPER_SPEC = [
    { courseId: 'intro', count: 2 },
    { courseId: 'limit', count: 3 },
    { courseId: 'limit-laws', count: 2 },
    { courseId: 'derivative', count: 2 },
    { courseId: 'derivative-rules', count: 2 },
    { courseId: 'mean-value-theorem', count: 2 },
    { courseId: 'lhopital', count: 2 },
    { courseId: 'convexity', count: 2 },
    { courseId: 'integral', count: 2 },
    { courseId: 'indefinite-integral', count: 2 },
    { courseId: 'integral-applications', count: 2 },
    { courseId: 'taylor', count: 2 },
    { courseId: 'series-basics', count: 2 },
    { courseId: 'positive-series', count: 2 },
    { courseId: 'fourier-series', count: 2 },
    { courseId: 'ode', count: 1 },
    { courseId: 'partial-derivative', count: 2 },
    { courseId: 'gradient', count: 2 },
    { courseId: 'double-integral', count: 2 },
  ];

  App.register('exam', {
    mount(ctx) {
      this._ctx = ctx;
      this._state = 'intro'; // intro | taking | result
      this._paper = [];
      this._answers = {}; // qId -> picked
      this._timer = null;
      this._endTime = 0;
      this._render(ctx.container);
      return this;
    },

    _render(container) {
      container.innerHTML = `
        <h2>模拟考试</h2>
        <div id="exam-body"></div>`;
      this._showIntro();
    },

    _showIntro() {
      this._state = 'intro';
      const history = MVutil.store.get(HISTORY_KEY, []);
      const lastScore = history.length ? history[history.length - 1].score : null;
      const body = this._ctx.container.querySelector('#exam-body');
      // 构建课案选项：每个课案显示「标题（题数）」
      const courses = (window.COURSES && window.COURSES.list) || [];
      const courseOpts = courses
        .filter((c) => QuestionBank.byCourse(c.id).length > 0)
        .map((c) => {
          const n = QuestionBank.byCourse(c.id).length;
          return '<option value="' + c.id + '">' + c.title + '（' + n + ' 题）</option>';
        }).join('');
      body.innerHTML = `
        <div class="card" style="max-width:560px;margin:20px auto">
          <h3 style="margin-top:0">选择考试范围</h3>
          <div class="field">
            <label>试卷类型</label>
            <select id="exam-scope">
              <option value="">综合卷（全部章节，约 15 题）</option>
              ${courseOpts}
            </select>
            <div class="hint" id="exam-scope-hint">综合卷覆盖所有已学课案，难度混合。</div>
          </div>
          <div class="field">
            <label>限时</label>
            <select id="exam-min" style="width:auto;display:inline-block">
              <option value="10">10 分钟</option>
              <option value="15" selected>15 分钟</option>
              <option value="20">20 分钟</option>
              <option value="0">不限时</option>
            </select>
          </div>
          ${lastScore != null ? '<p class="dim">上次成绩：' + lastScore + ' 分</p>' : ''}
          <button class="primary" id="exam-start" style="width:100%">开始考试</button>
        </div>`;
      // 选卷提示
      body.querySelector('#exam-scope').addEventListener('change', (e) => {
        const hint = body.querySelector('#exam-scope-hint');
        if (e.target.value) {
          const c = window.COURSES.byId[e.target.value];
          const n = QuestionBank.byCourse(e.target.value).length;
          hint.textContent = '单章卷：' + c.title + '，共 ' + n + ' 题';
        } else {
          hint.textContent = '综合卷覆盖所有已学课案，难度混合。';
        }
      });
      body.querySelector('#exam-start').addEventListener('click', () => {
        const min = parseInt(body.querySelector('#exam-min').value, 10);
        const scope = body.querySelector('#exam-scope').value;
        this._start(min, scope);
      });
    },

    _start(minutes, scope) {
      // 组卷：scope 为空=综合卷（按 PAPER_SPEC），否则=指定课案全抽
      if (scope) {
        this._paper = QuestionBank.byCourse(scope).slice();
        // 洗牌
        for (let i = this._paper.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this._paper[i], this._paper[j]] = [this._paper[j], this._paper[i]];
        }
        this._examTitle = (window.COURSES.byId[scope] || {}).title || scope;
      } else {
        this._paper = QuestionBank.compose(PAPER_SPEC);
        // 题库不足时至少抽 10 题（兜底）
        if (this._paper.length < 10) {
          const extra = QuestionBank.all().filter((q) => !this._paper.includes(q));
          this._paper = this._paper.concat(extra.slice(0, 10 - this._paper.length));
        }
        this._examTitle = '综合卷';
      }
      this._answers = {};
      this._state = 'taking';
      this._endTime = minutes > 0 ? Date.now() + minutes * 60 * 1000 : 0;
      this._renderExam();
      if (minutes > 0) this._startTimer();
    },

    _startTimer() {
      this._tick();
      this._timer = setInterval(() => this._tick(), 1000);
    },

    _tick() {
      const remain = this._endTime - Date.now();
      if (remain <= 0) {
        clearInterval(this._timer); this._timer = null;
        this._submit(true);
        return;
      }
      const el = this._ctx.container.querySelector('#exam-timer');
      if (el) {
        const m = Math.floor(remain / 60000);
        const s = Math.floor((remain % 60000) / 1000);
        el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        if (remain < 60000) el.style.color = 'var(--danger)';
      }
    },

    _renderExam() {
      const body = this._ctx.container.querySelector('#exam-body');
      body.innerHTML = `
        <div class="exam-header">
          <span><b>${MVutil.escapeHtml(this._examTitle || '考试')}</b> · 共 ${this._paper.length} 题</span>
          <span class="mono" id="exam-timer">--:--</span>
          <button class="primary" id="exam-submit" style="margin-left:auto">交卷</button>
        </div>
        <div id="exam-questions"></div>`;
      body.querySelector('#exam-submit').addEventListener('click', () => {
        if (confirm('确定交卷？未作答的题计为错误。')) this._submit(false);
      });
      const qbody = body.querySelector('#exam-questions');
      this._paper.forEach((q, i) => qbody.appendChild(this._renderExamQ(q, i + 1)));
      if (window.MathViz) MathViz.math.renderMath(qbody);
    },

    _renderExamQ(q, num) {
      const wrap = MVutil.h('div', { class: 'question-card' });
      const meta = MVutil.h('div', { class: 'q-meta dim' }, '第 ' + num + ' 题 · ' + this._typeName(q.type));
      const stem = MVutil.h('div', { class: 'q-stem' });
      stem.innerHTML = window.MVmd ? MVmd.render(q.stem) : MVutil.escapeHtml(q.stem);
      wrap.appendChild(meta); wrap.appendChild(stem);

      const optWrap = MVutil.h('div', { class: 'q-options' });
      wrap.appendChild(optWrap);

      if (q.type === 'fill') {
        const input = MVutil.h('input', { type: 'text', placeholder: '填入答案…', dataset: { qid: q.id } });
        input.addEventListener('input', () => { this._answers[q.id] = input.value; });
        optWrap.appendChild(input);
      } else {
        const isMulti = q.type === 'multi';
        q.options.forEach((opt, i) => {
          const btn = MVutil.h('button', { class: 'q-option', dataset: { idx: String(i), qid: q.id } });
          btn.innerHTML = window.MVmd ? MVmd.inline(opt) : MVutil.escapeHtml(opt);
          btn.addEventListener('click', () => {
            if (isMulti) {
              btn.classList.toggle('picked');
              const arr = Array.from(optWrap.querySelectorAll('.q-option.picked')).map((b) => parseInt(b.dataset.idx, 10));
              this._answers[q.id] = arr;
            } else {
              optWrap.querySelectorAll('.q-option').forEach((b) => b.classList.remove('picked'));
              btn.classList.add('picked');
              this._answers[q.id] = (q.type === 'judge') ? ((i === 1)) : i;
            }
          });
          optWrap.appendChild(btn);
        });
      }
      return wrap;
    },

    _submit(timeout) {
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
      this._state = 'result';
      // 判分
      let correct = 0;
      const detail = [];
      this._paper.forEach((q) => {
        const picked = this._answers[q.id];
        let isCorrect = false;
        if (q.type === 'fill') {
          const val = (picked || '').trim().replace(/\s+/g, '').toLowerCase();
          const ans = String(q.answer).trim().replace(/\s+/g, '').toLowerCase();
          const norm = (s) => s.replace(/[()]/g, '').replace(/\*/g, '');
          isCorrect = val && norm(val) === norm(ans);
        } else if (q.type === 'multi') {
          const arr = Array.isArray(picked) ? picked : [];
          isCorrect = arr.length === q.answer.length && arr.every((i) => q.answer.includes(i));
        } else if (q.type === 'judge') {
          isCorrect = picked === q.answer;
        } else {
          isCorrect = picked === q.answer;
        }
        if (isCorrect) correct++;
        detail.push({ q, picked, isCorrect });
      });
      const total = this._paper.length;
      const score = Math.round((correct / total) * 100);
      // 存历史
      const history = MVutil.store.get(HISTORY_KEY, []);
      history.push({ score, correct, total, ts: Date.now(), timeout, title: this._examTitle || '综合卷' });
      while (history.length > 5) history.shift();
      try { MVutil.store.set(HISTORY_KEY, history); } catch (e) {}
      this._showResult(score, correct, total, detail, timeout);
    },

    _showResult(score, correct, total, detail, timeout) {
      const body = this._ctx.container.querySelector('#exam-body');
      const grade = score >= 90 ? '优秀' : score >= 75 ? '良好' : score >= 60 ? '及格' : '需加油';
      const gradeColor = score >= 75 ? 'var(--accent-4)' : score >= 60 ? 'var(--warn)' : 'var(--danger)';
      body.innerHTML = `
        <div class="exam-result card" style="text-align:center;max-width:520px;margin:20px auto">
          <div class="exam-score" style="font-size:48px;font-weight:700;color:${gradeColor}">${score}</div>
          <div class="dim">${correct}/${total} 题正确 · ${grade}${timeout ? ' · 已超时自动交卷' : ''}</div>
          <div style="margin-top:16px;display:flex;gap:10px;justify-content:center">
            <button class="primary" id="exam-again">再考一次</button>
            <button id="exam-review">查看解析</button>
          </div>
        </div>
        <div id="exam-review-body" style="display:none"></div>`;
      body.querySelector('#exam-again').addEventListener('click', () => this._showIntro());
      body.querySelector('#exam-review').addEventListener('click', () => {
        const rv = body.querySelector('#exam-review-body');
        if (rv.style.display === 'none') {
          MVutil.clear(rv);
          detail.forEach((d, i) => rv.appendChild(this._renderReview(d, i + 1)));
          if (window.MathViz) MathViz.math.renderMath(rv);
          rv.style.display = 'block';
          body.querySelector('#exam-review').textContent = '收起解析';
        } else {
          rv.style.display = 'none';
          body.querySelector('#exam-review').textContent = '查看解析';
        }
      });
    },

    _renderReview(d, num) {
      const wrap = MVutil.h('div', { class: 'question-card' });
      const verdict = MVutil.h('div', { class: 'q-verdict ' + (d.isCorrect ? 'ok' : 'wrong') },
        '第 ' + num + ' 题 ' + (d.isCorrect ? '✓ 答对' : '✗ 答错'));
      const stem = MVutil.h('div', { class: 'q-stem' });
      stem.innerHTML = window.MVmd ? MVmd.render(d.q.stem) : MVutil.escapeHtml(d.q.stem);
      wrap.appendChild(verdict); wrap.appendChild(stem);

      // 显示你的答案 vs 正确答案
      let yourAns, rightAns;
      if (d.q.type === 'fill') {
        yourAns = d.picked || '（未作答）';
        rightAns = d.q.answer;
      } else if (d.q.type === 'judge') {
        yourAns = d.picked === undefined ? '（未作答）' : (d.picked ? '对' : '错');
        rightAns = d.q.answer ? '对' : '错';
      } else if (d.q.type === 'multi') {
        yourAns = (Array.isArray(d.picked) ? d.picked : []).map((i) => d.q.options[i]).join(' / ') || '（未作答）';
        rightAns = d.q.answer.map((i) => d.q.options[i]).join(' / ');
      } else {
        yourAns = (d.picked !== undefined && d.q.options[d.picked]) ? d.q.options[d.picked] : '（未作答）';
        rightAns = d.q.options[d.q.answer];
      }
      const ans = MVutil.h('div', { class: 'q-ans' });
      ans.innerHTML = '<div><b>你的答案：</b><span class="' + (d.isCorrect ? 'ans-ok' : 'ans-wrong') + '">' +
        MVutil.escapeHtml(yourAns) + '</span></div>' +
        (d.isCorrect ? '' : '<div><b>正确答案：</b><span class="ans-ok">' + MVutil.escapeHtml(rightAns) + '</span></div>');
      wrap.appendChild(ans);

      const ex = MVutil.h('div', { class: 'q-explain-body' });
      ex.innerHTML = '<b>解析：</b>' + (window.MVmd ? MVmd.inline(d.q.explain) : MVutil.escapeHtml(d.q.explain));
      wrap.appendChild(ex);
      return wrap;
    },

    _typeName(t) {
      return { single: '单选', multi: '多选', judge: '判断', fill: '填空' }[t] || t;
    },

    unmount() {
      if (this._timer) clearInterval(this._timer);
    },
  });
})();
