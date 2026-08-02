/**
 * mathviz — js/lib/markdown.js
 * 极简 Markdown → HTML 渲染器（流式安全）。
 * 支持：标题、粗体/斜体、行内代码、代码块、有序/无序清单、链接、段落、引用。
 * 不做完整 CommonSpec，够对话与叙事用即可。流式调用对未闭合块（如代码块）安全：
 * 未闭合 ``` 会被原样显示为行内 code，等下一次再渲染。
 *
 * 公式渲染不在本文件完成——调用方设置 innerHTML 后，用 MathViz.math.renderMath
 * 扫描文本节点统一渲染（支持 katex 未就绪时自动等待重试）。
 * 暴露 window.MVmd.render(md) → html
 */
(function (global) {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function inline(text) {
    // 关键：先保护 $...$ 与 $$...$$ 公式内容，避免被 escapeHtml 把 > < & 转义后
    // KaTeX 收到 &gt; 等实体而渲染失败。公式内的特殊字符由 KaTeX 自行处理。
    const phStore = [];
    const protect = (m) => {
      phStore.push(m);
      return '\u0001F' + (phStore.length - 1) + '\u0001';
    };
    let s = text
      // 先抽出公式（块级 $$...$$ 与行内 $...$），用占位符替换
      .replace(/\$\$[\s\S]+?\$\$/g, protect)
      .replace(/\$[^\n$]+?\$/g, protect)
      // 行内代码也保护（不在公式内的 `code`，且 code 内不渲染公式）
      .replace(/`[^`\n]+`/g, protect);

    // 对剩余文本做 HTML 转义
    s = escapeHtml(s);

    // 还原占位符（公式/代码原样回到文本，公式内的 > < 不被转义）
    s = s.replace(/\u0001F(\d+)\u0001/g, (m, i) => phStore[parseInt(i, 10)]);

    // 行内代码 → <code>（保护时整段含反引号，这里转换）
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    // 粗体 **...** / 斜体 *...*
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    // 链接 [text](url)
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  function render(md) {
    if (!md) return '';
    const lines = String(md).replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let i = 0;
    let para = [];

    function flushPara() {
      if (para.length) {
        out.push('<p>' + inline(para.join(' ')) + '</p>');
        para = [];
      }
    }

    while (i < lines.length) {
      let line = lines[i];

      // 代码块 ```
      const fence = line.match(/^```(.*)$/);
      if (fence) {
        flushPara();
        const lang = fence[1].trim();
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        if (i < lines.length) i++; // 跳过闭合 ```
        // 注意：viz 围栏的图形派发由 protocol-bridge 处理，这里只做 HTML 占位
        if (lang === 'viz') {
          out.push('<div class="viz-fence" data-raw="' + encodeURIComponent(buf.join('\n')) + '"></div>');
        } else {
          out.push('<pre><code class="lang-' + escapeHtml(lang || 'text') + '">' + escapeHtml(buf.join('\n')) + '</code></pre>');
        }
        continue;
      }

      // 标题
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        flushPara();
        const lv = h[1].length;
        out.push('<h' + lv + '>' + inline(h[2]) + '</h' + lv + '>');
        i++;
        continue;
      }

      // 引用 >
      if (/^>\s?/.test(line)) {
        flushPara();
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + inline(buf.join(' ')) + '</blockquote>');
        continue;
      }

      // 无序列表
      if (/^[-*]\s+/.test(line)) {
        flushPara();
        const items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          items.push('<li>' + inline(lines[i].replace(/^[-*]\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }

      // 有序列表
      if (/^\d+\.\s+/.test(line)) {
        flushPara();
        const items = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          items.push('<li>' + inline(lines[i].replace(/^\d+\.\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ol>' + items.join('') + '</ol>');
        continue;
      }

      // 空行
      if (/^\s*$/.test(line)) {
        flushPara();
        i++;
        continue;
      }

      // 普通段落行
      para.push(line);
      i++;
    }
    flushPara();

    let html = out.join('\n');
    // 注意：此处不再调用 renderInHtml 渲染公式。
    // 公式渲染统一交给调用方在 innerHTML 设置后用 MathViz.math.renderMath 处理，
    // 这样可在 katex 未就绪时重试，避免流式/早加载场景下公式被固化成原文。
    // viz 围栏的占位 div 由 inline/代码块逻辑已生成。
    return html;
  }

  global.MVmd = { render, inline, escapeHtml };
})(window);
