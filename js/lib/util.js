/**
 * mathviz — js/lib/util.js
 * 通用工具：DOM、事件、本地存储、clamp、格式化等。
 * 暴露 window.MVutil。
 */
(function (global) {
  'use strict';

  const MVutil = {
    /** 创建元素并设置属性/子节点。h('div',{class:'x'},[child1,'text']) */
    h(tag, attrs, children) {
      const el = document.createElement(tag);
      if (attrs) {
        for (const k in attrs) {
          const v = attrs[k];
          if (k === 'class') el.className = v;
          else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
          else if (k.startsWith('on') && typeof v === 'function') {
            el.addEventListener(k.slice(2).toLowerCase(), v);
          } else if (k === 'dataset' && typeof v === 'object') {
            for (const d in v) el.dataset[d] = v[d];
          } else if (v !== null && v !== undefined && v !== false) {
            el.setAttribute(k, v === true ? '' : v);
          }
        }
      }
      if (children != null) {
        (Array.isArray(children) ? children : [children]).forEach((c) => {
          if (c == null || c === false) return;
          el.appendChild(typeof c === 'string' || typeof c === 'number'
            ? document.createTextNode(String(c)) : c);
        });
      }
      return el;
    },

    /** 清空元素子节点 */
    clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); },

    /** debounce */
    debounce(fn, ms) {
      let t = null;
      const debounced = function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
      };
      debounced.cancel = () => clearTimeout(t);
      return debounced;
    },

    clamp(v, min, max) {
      if (v < min) return min;
      if (v > max) return max;
      return v;
    },

    lerp(a, b, t) { return a + (b - a) * t; },

    /** 安全 localStorage 读写（带命名空间前缀） */
    store: {
      get(key, fallback) {
        try {
          const raw = localStorage.getItem(key);
          if (raw == null) return fallback;
          return JSON.parse(raw);
        } catch (e) {
          console.warn('[store.get]', key, e);
          return fallback;
        }
      },
      set(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
            console.error('[store.set] 配额溢出', key);
            throw e;
          }
          console.warn('[store.set]', key, e);
          return false;
        }
      },
      remove(key) {
        try { localStorage.removeItem(key); } catch (e) {}
      },
    },

    /** sessionStorage 同款 */
    session: {
      get(key, fallback) {
        try {
          const raw = sessionStorage.getItem(key);
          if (raw == null) return fallback;
          return JSON.parse(raw);
        } catch (e) { return fallback; }
      },
      set(key, value) {
        try { sessionStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (e) { return false; }
      },
      remove(key) { try { sessionStorage.removeItem(key); } catch (e) {} },
    },

    /** 格式化数字，去浮点尾数 */
    fmt(n, digits = 4) {
      if (typeof n !== 'number' || !isFinite(n)) return String(n);
      return parseFloat(n.toFixed(digits)).toString();
    },

    /** 唯一 id */
    uid() {
      return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },

    /** 转义 HTML 文本 */
    escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    /**
     * 在 DOM 与所有 defer 脚本就绪后执行 fn。
     * 注意：defer 脚本执行时 readyState 为 'interactive'（DOMContentLoaded 尚未触发），
     * 故仅在 'complete' 时立即执行，否则监听 DOMContentLoaded（所有 defer 跑完后才触发）。
     */
    ready(fn) {
      if (document.readyState === 'complete') fn();
      else document.addEventListener('DOMContentLoaded', fn);
    },
  };

  global.MVutil = MVutil;
})(window);
