/**
 * mathviz — js/viz/easing.js
 * 常用缓动函数：t∈[0,1] → eased 值（通常也在 [0,1]）。
 * 暴露 window.MVeasing。
 */
(function (global) {
  'use strict';
  const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : ((t) - 1) * (2 * t - 2) * (2 * (t) - 2) + 1),
    easeOutBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeOutElastic: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    /** 选取：传入名字字符串或函数 */
    get: (nameOrFn) => {
      if (typeof nameOrFn === 'function') return nameOrFn;
      return Easing[nameOrFn] || Easing.easeInOutCubic;
    },
  };
  global.MVeasing = Easing;
})(window);
