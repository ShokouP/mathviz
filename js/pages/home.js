/**
 * mathviz — js/pages/home.js
 * 首页：hero + 课案卡片网格（含封面 SVG）+ AI/设置入口。
 */
(function () {
  'use strict';
  App.register('home', {
    mount(ctx) {
      const courses = (window.COURSES && window.COURSES.list) || [];
      const progress = MVutil.store.get('mathviz.course.progress', {});
      // 统计完成数
      const completedCount = courses.filter((c) => {
        const p = progress[c.id];
        return p && Array.isArray(p.visited) && p.visited.length >= c.steps.length;
      }).length;
      const cards = courses.map((c) => {
        const badge = c.id === 'intro'
          ? '<span class="course-badge">推荐起点</span>' : '';
        // 完成状态
        const p = progress[c.id];
        const visitedCount = (p && Array.isArray(p.visited)) ? p.visited.length : 0;
        const isDone = visitedCount >= c.steps.length;
        const progressText = isDone
          ? '<span class="cover-meta done">✓ 已完成</span>'
          : (visitedCount > 0
            ? '<span class="cover-meta dim">学习中 ' + visitedCount + '/' + c.steps.length + '</span>'
            : '<span class="cover-meta dim">' + c.steps.length + ' 步 · 进入 →</span>');
        return `
        <a class="course-card${c.id === 'intro' ? ' course-card-featured' : ''}${isDone ? ' course-card-done' : ''}" href="#/course/${c.id}">
          <div class="cover">${c.coverSVG || '<span style="font-size:40px;color:var(--accent)">∫</span>'}</div>
          ${badge}
          <h3>${MVutil.escapeHtml(c.title)}</h3>
          <p>${MVutil.escapeHtml(c.summary || '')}</p>
          ${progressText}
        </a>`;
      }).join('');

      ctx.container.innerHTML = `
        <section class="home-hero">
          <h1>看见微积分</h1>
          <p class="sub">3b1b 风格的高等数学可视化课案——把极限、导数、积分、泰勒级数
          的<strong>动态过程</strong>做成可交互的动画。配合 DeepSeek 实时对话，
          用自然语言驱动可视化。</p>
          ${courses.length ? '<div class="home-progress dim">学习进度：已完成 <b style="color:var(--accent-4)">' + completedCount + '</b> / ' + courses.length + ' 套课案</div>' : ''}
        </section>
        ${courses.length
          ? `<h2 class="home-section-title">课案</h2><div class="course-grid">${cards}</div>`
          : '<p class="muted">课案准备中…</p>'}
        <h2 class="home-section-title">练习与考试</h2>
        <div class="home-links">
          <a href="#/practice"><button class="primary">✎ 题库练习</button></a>
          <a href="#/exam"><button>📝 模拟考试</button></a>
          <span class="dim" style="align-self:center;font-size:13px">${window.QuestionBank ? QuestionBank.count : 0} 题</span>
        </div>
        <h2 class="home-section-title">AI 辅助</h2>
        <div class="home-links">
          <a href="#/chat"><button class="primary">进入 AI 对话 →</button></a>
          <a href="#/settings"><button>⚙ API 设置</button></a>
        </div>
        <p class="dim home-tip">提示：在 AI 对话中问"画一下 sin(x) 在 1 处的切线"，
        模型会用可视化指令实时绘图。</p>`;

      // 渲染封面里可能的公式（coverSVG 通常是纯 SVG，但兜底）
      if (window.MathViz) window.MathViz.math.renderMath(ctx.container);
      return this;
    },
    unmount() {},
  });
})();
