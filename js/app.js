/**
 * mathviz — js/app.js
 * 应用内核：页面注册表 + 启动入口。
 * 各 pages/* 模块在加载时调用 App.register(name, module) 自注册。
 */
(function (global) {
  'use strict';

  const App = {
    pages: {},
    register(name, mod) {
      if (this.pages[name]) console.warn('[App] 页面 "' + name + '" 重复注册，覆盖');
      this.pages[name] = mod;
    },
    start() {
      MVutil.ready(() => {
        // KaTeX 若尚未就绪，等它（vendor 是 defer，DOMReady 时通常已加载）
        const go = () => {
          if (global.Router) global.Router.init(this);
          else console.error('[App] Router 未加载');
          this._bindGlobalKeys();
        };
        // 轮询等待 katex（最多 2s）
        let waited = 0;
        const tick = () => {
          if (typeof global.katex !== 'undefined' || waited >= 2000) go();
          else { waited += 100; setTimeout(tick, 100); }
        };
        tick();
      });
    },

    /** 全局键盘快捷键（Alt+字母导航 + ? 帮助） */
    _bindGlobalKeys() {
      const NAV = {
        h: '/home', p: '/practice', e: '/exam',
        c: '/chat', s: '/settings',
      };
      document.addEventListener('keydown', (ev) => {
        // 不拦截输入框/textarea/select 内的按键
        const tag = ev.target && ev.target.tagName;
        if (tag && /^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        // ? 显示/隐藏帮助浮层
        if (ev.key === '?' && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
          ev.preventDefault();
          this._toggleHelp();
          return;
        }
        // Esc 关闭帮助
        if (ev.key === 'Escape') {
          const h = document.getElementById('kbd-help');
          if (h) { h.remove(); return; }
        }
        // Alt+字母 导航
        if (ev.altKey && !ev.ctrlKey && !ev.metaKey) {
          const k = ev.key.toLowerCase();
          if (NAV[k]) {
            ev.preventDefault();
            global.Router.go(NAV[k]);
          }
        }
      });
    },

    _toggleHelp() {
      const existing = document.getElementById('kbd-help');
      if (existing) { existing.remove(); return; }
      const overlay = document.createElement('div');
      overlay.id = 'kbd-help';
      overlay.className = 'kbd-help-overlay';
      overlay.innerHTML = `
        <div class="kbd-help-card" onclick="event.stopPropagation()">
          <h3 style="margin:0 0 12px">键盘快捷键</h3>
          <div class="kbd-row"><kbd>Alt</kbd>+<kbd>H</kbd> <span>首页</span></div>
          <div class="kbd-row"><kbd>Alt</kbd>+<kbd>P</kbd> <span>练习</span></div>
          <div class="kbd-row"><kbd>Alt</kbd>+<kbd>E</kbd> <span>考试</span></div>
          <div class="kbd-row"><kbd>Alt</kbd>+<kbd>C</kbd> <span>AI 对话</span></div>
          <div class="kbd-row"><kbd>Alt</kbd>+<kbd>S</kbd> <span>设置</span></div>
          <div class="kbd-row"><kbd>←</kbd> <kbd>→</kbd> <span>课案切步骤</span></div>
          <div class="kbd-row"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> <span>发送对话</span></div>
          <div class="kbd-row"><kbd>?</kbd> <span>显示/隐藏本帮助</span></div>
          <div class="kbd-row"><kbd>Esc</kbd> <span>关闭本帮助</span></div>
          <p class="dim" style="margin:12px 0 0;font-size:12px">输入框内时快捷键不生效</p>
        </div>`;
      overlay.addEventListener('click', () => overlay.remove());
      document.body.appendChild(overlay);
    },
  };

  global.App = App;
  App.start();
})(window);
