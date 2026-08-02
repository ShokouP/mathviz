/**
 * mathviz — js/router.js
 * 极简 hash 路由：监听 hashchange，解析 #/<path>/... 形式，派发给已注册页面模块。
 *
 * 路由格式：#/<name>/<arg>?<query>
 *   例：#/home            → { name:'home', arg:null, query:{} }
 *       #/course/limit     → { name:'course', arg:'limit' }
 *       #/chat?s=abc       → { name:'chat', query:{s:'abc'} }
 *
 * 页面模块通过 App.register(name, {mount, unmount}) 注册。
 */
(function (global) {
  'use strict';

  function parse(hash) {
    // hash 形如 "#/home/foo?x=1"，去掉前导 #
    let h = (hash || '').replace(/^#/, '');
    if (!h || h === '/') h = '/home';
    if (!h.startsWith('/')) h = '/' + h;
    const [pathPart, queryPart] = h.split('?');
    const segs = pathPart.split('/').filter(Boolean); // ['home'] 或 ['course','limit']
    if (!segs.length) segs[0] = 'home';
    const name = segs[0];
    const arg = segs[1] || null;
    const query = {};
    if (queryPart) {
      queryPart.split('&').forEach((kv) => {
        const [k, v] = kv.split('=');
        if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }
    return { name, arg, query, path: h };
  }

  function highlightNav(name) {
    document.querySelectorAll('.topnav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const target = href.replace(/^#\//, '');
      a.classList.toggle('active', target === name);
    });
  }

  const Router = {
    current: null, // {name, module, ctx}
    init(app) {
      this.app = app;
      global.addEventListener('hashchange', () => this.dispatch());
      // 首次派发
      this.dispatch();
    },
    dispatch() {
      const route = parse(location.hash);
      const mod = this.app.pages[route.name];
      const app = document.getElementById('app');
      if (!app) return;

      // 卸载当前页
      if (this.current && this.current.module && this.current.module.unmount) {
        try { this.current.module.unmount(this.current.ctx); } catch (e) { console.error('[unmount]', e); }
      }
      this.current = null;

      if (!mod) {
        // 未知路由 → 回首页
        app.innerHTML = '<div class="loading">未知页面，<a href="#/home">返回首页</a></div>';
        highlightNav('');
        return;
      }

      MVutil.clear(app);
      app.innerHTML = '<div class="loading">加载中…</div>';
      highlightNav(route.name);

      try {
        const ctx = { route, container: app };
        if (mod.mount) {
          // mount 可以返回一个上下文对象，供 unmount 使用
          Promise.resolve(mod.mount(ctx)).then((mountCtx) => {
            this.current = { name: route.name, module: mod, ctx: mountCtx || ctx };
          }).catch((e) => {
            console.error('[mount]', e);
            app.innerHTML = '<div class="loading">页面加载失败：' + MVutil.escapeHtml(e.message) + '</div>';
          });
        }
      } catch (e) {
        console.error('[mount sync]', e);
        app.innerHTML = '<div class="loading">页面加载失败：' + MVutil.escapeHtml(e.message) + '</div>';
      }
    },
    go(path) {
      // 编程式跳转：go('/course/limit')
      if (!path.startsWith('#')) path = '#' + (path.startsWith('/') ? path : '/' + path);
      if (location.hash === path) {
        // 同址也要重新派发（如刷新数据）
        this.dispatch();
      } else {
        location.hash = path;
      }
    },
  };

  global.Router = Router;
})(window);
