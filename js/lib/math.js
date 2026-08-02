/**
 * mathviz — js/lib/math.js
 * 公式渲染封装：扫描节点内的 $...$ / $$...$$ / \(...\) / \[...\]
 * 调用 KaTeX 渲染。提供 renderMath(node) 与 renderToString(tex) 两接口。
 *
 * 依赖：window.katex（vendor 副本，index.html 已 defer 引入）
 */
(function (global) {
  'use strict';

  // 跳过这些标签内的公式（避免把代码块里的 $ 当公式）
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT']);

  // 匹配顺序很重要：先块级 $$...$$ 再行内 $...$；\( \) 与 \[ \] 是 LaTeX 原生写法
  // 用占位符思路：把文本节点中的公式片段替换为 <span data-tex="...">，再交给 katex 渲染
  const PATTERNS = [
    // 块级 $$...$$ 或 \[...\]
    { name: 'block', re: /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g, display: true },
    // 行内 $...$ 或 \(...\)（$ 后/前不能是空白或另一个 $，避免 "$5 and $6" 误匹配）
    { name: 'inline', re: /(^|[^\\$])\$(?!\s)([^\n$]+?)(?<!\s)\$(?!\$)|\\\(([\s\S]+?)\\\)/g, display: false },
  ];

  function hasKatex() {
    return typeof global.katex !== 'undefined' && global.katex && global.katex.render;
  }

  /**
   * 把含公式语法的 HTML 字符串中的公式部分转为 KaTeX HTML。
   * 用于 Markdown 渲染后再过一道公式。流式渲染时增量调用安全。
   * @param {string} html
   * @returns {string}
   */
  /**
   * 把含公式语法的纯文本转为 HTML：非公式部分 escapeHtml，公式部分用 KaTeX 渲染。
   * 输入应是纯文本（如 textContent），不含 HTML 标签。
   * 流式对话场景下也调用此函数（输入是累积的 Markdown 文本，可能含标签——
   * 这种情况下标签会被 escape，但公式仍正确渲染）。
   * @param {string} text 纯文本
   * @returns {string} HTML
   */
  function renderInHtml(text) {
    if (!hasKatex()) return text;
    // 策略：先抽出公式（块级 $$...$$ 与行内 $...$ 和 \(...\)、\[...\]），用占位符保护；
    // 再对剩余文本 escapeHtml；最后还原占位符并交给 KaTeX 渲染。
    const store = [];
    const protect = (m) => { store.push(m); return '\u0001M' + (store.length - 1) + '\u0001'; };
    let s = String(text)
      .replace(/\$\$[\s\S]+?\$\$/g, protect)          // 块级 $$...$$
      .replace(/\\\[([\s\S]+?)\\\]/g, protect)         // 块级 \[...\]
      .replace(/(^|[^\\$])\$(?!\s)([^\n$]+?)(?<!\s)\$(?!\$)/g, (m, pre, inner) => pre + protect('$' + inner + '$'))  // 行内 $...$
      .replace(/\\\(([\s\S]+?)\\\)/g, protect);        // 行内 \(...\)
    // escape 非公式部分
    s = escapeHtml(s);
    // 还原并渲染公式
    s = s.replace(/\u0001M(\d+)\u0001/g, (m, i) => {
      const raw = store[parseInt(i, 10)];
      // 判断块级还是行内
      if (raw.startsWith('$$')) return katexHtml(raw.slice(2, -2).trim(), true);
      if (raw.startsWith('\\[')) return katexHtml(raw.slice(2, -2).trim(), true);
      if (raw.startsWith('\\(')) return katexHtml(raw.slice(2, -2).trim(), false);
      return katexHtml(raw.slice(1, -1).trim(), false); // $...$
    });
    return s;
  }

  function katexHtml(tex, display) {
    if (!hasKatex()) return display ? '$$' + tex + '$$' : '$' + tex + '$';
    try {
      return global.katex.renderToString(tex, {
        displayMode: !!display,
        throwOnError: false,
        strict: 'ignore',
        output: 'html',
      });
    } catch (e) {
      // throwOnError:false 已防绝大多数，这里再兜底
      return '<span class="katex-error" style="color:var(--danger)">' + escapeHtml(tex) + '</span>';
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * 扫描 DOM 节点子树，对文本节点中的公式语法就地渲染。
   * 若 KaTeX 尚未就绪，自动等待其加载后重试（最多 ~10s），避免早加载/慢网络场景
   * 下公式被永久固化成原文。
   * @param {Node} root
   * @returns {Promise<void>} 渲染完成时 resolve（已就绪则同步 resolve）
   */
  function renderMath(root) {
    root = root || document.body;
    if (hasKatex()) {
      doRender(root);
      return Promise.resolve();
    }
    // katex 未就绪：轮询等待，就绪后渲染
    return waitForKatex().then((ok) => {
      if (ok && root.isConnected) doRender(root);
      else if (!ok) console.warn('[math.js] KaTeX 等待超时，公式未渲染');
    });
  }

  /** 真正执行扫描与替换 */
  function doRender(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !/\$|\\\(|\\\[/.test(node.nodeValue)) {
          return NodeFilter.FILTER_REJECT;
        }
        let p = node.parentNode;
        while (p && p !== root) {
          if (SKIP_TAGS.has(p.nodeName)) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const targets = [];
    let n;
    while ((n = walker.nextNode())) targets.push(n);

    targets.forEach((textNode) => {
      const text = textNode.nodeValue;
      // renderInHtml 内部会 escape 非公式部分并渲染公式，输入应是纯文本（textContent）
      const html = renderInHtml(text);
      if (html !== text) {
        const span = document.createElement('span');
        span.innerHTML = html;
        textNode.parentNode.replaceChild(span, textNode);
      }
    });
  }

  /** 等待 katex 就绪，最多 ~10s。返回 Promise<boolean> */
  let _katexReady = null;
  function waitForKatex() {
    if (_katexReady) return _katexReady;
    _katexReady = new Promise((resolve) => {
      if (hasKatex()) return resolve(true);
      let waited = 0;
      const tick = setInterval(() => {
        if (hasKatex()) { clearInterval(tick); resolve(true); }
        else if (waited >= 10000) { clearInterval(tick); resolve(false); }
        waited += 100;
      }, 100);
    });
    return _katexReady;
  }

  global.MathViz = global.MathViz || {};
  global.MathViz.math = {
    renderMath,
    renderInHtml,
    renderToString: (tex, display) => katexHtml(tex, display),
    hasKatex,
    waitForKatex,
  };
})(window);
