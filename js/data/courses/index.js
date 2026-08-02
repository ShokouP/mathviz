/**
 * mathviz — js/data/courses/index.js
 * 课案注册中心。各课案文件加载时调用 COURSES.register(course)，
 * 本文件提供 byId 查找与 list 枚举供首页/路由使用。
 *
 * 任务 9-12 才填充具体课案数据；在此之前 list 为空。
 */
(function (global) {
  'use strict';
  const COURSES = {
    _byId: {},
    register(course) {
      if (!course || !course.id) { console.warn('[COURSES] 注册失败：缺 id'); return; }
      this._byId[course.id] = course;
    },
    get byId() { return this._byId; },
    get list() {
      // 固定展示顺序
      const ORDER = ['intro', 'limit', 'limit-laws', 'derivative', 'derivative-rules', 'mean-value-theorem', 'lhopital', 'convexity', 'integral', 'indefinite-integral', 'integral-applications', 'taylor', 'series-basics', 'positive-series', 'fourier-series', 'ode', 'partial-derivative', 'gradient', 'double-integral', 'lagrange-multiplier'];
      const all = Object.values(this._byId);
      const ordered = ORDER.map((id) => this._byId[id]).filter(Boolean);
      // 兜底：补上 ORDER 之外的课案
      all.forEach((c) => { if (!ordered.includes(c)) ordered.push(c); });
      return ordered;
    },
  };
  global.COURSES = COURSES;
})(window);
