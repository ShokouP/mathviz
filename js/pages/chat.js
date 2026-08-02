/**
 * mathviz — js/pages/chat.js
 * 对话页：双区布局（会话侧栏 + 对话区 + 可视化画布）。
 * 整合 AIClient（流式）+ MVbridge（viz 指令派发）+ ChatHistory（持久化）。
 */
(function () {
  'use strict';

  App.register('chat', {
    mount(ctx) {
      this._ctx = ctx;
      this._currentSessionId = null;
      this._bridge = null;
      this._abortController = null;
      this._pendingReasoning = '';
      this._pendingContent = '';
      this._pendingScenes = [];

      ctx.container.innerHTML = `
        <div class="chat-layout">
          <aside class="chat-sessions">
            <button class="primary" id="new-session" style="width:100%;margin-bottom:10px">+ 新对话</button>
            <div id="session-list"></div>
            <button class="ghost danger" id="clear-all" style="width:100%;margin-top:10px;font-size:12px">清空全部</button>
          </aside>
          <section class="chat-main">
            <div class="chat-messages" id="chat-messages">
              <div class="chat-empty muted" style="padding:40px 20px;text-align:center">
                <p>向 AI 提问，它会用可视化帮你理解微积分。</p>
                <p class="dim" style="font-size:13px">试试："画一下 sin(x) 在 1 处的切线"<br/>或 "用矩形逼近 ∫₀² x² dx"</p>
              </div>
            </div>
            <div class="chat-input">
              <textarea id="chat-textarea" placeholder="输入问题…（Ctrl+Enter 发送）"></textarea>
              <div style="display:flex;flex-direction:column;gap:6px">
                <button class="primary" id="send-btn">发送</button>
                <button class="ghost" id="stop-btn" style="display:none;font-size:12px">停止</button>
              </div>
            </div>
          </section>
          <section class="chat-viz">
            <div class="viz-header">
              <span>可视化画布</span>
              <button class="ghost" id="clear-viz" style="font-size:11px;padding:2px 8px">清空</button>
            </div>
            <canvas id="chat-canvas"></canvas>
            <div class="dim" id="viz-hint" style="font-size:12px;padding:8px">AI 输出可视化指令时，图形会出现在这里。</div>
          </section>
        </div>`;

      this._cacheEls(ctx.container);
      this._bindEvents();
      this._renderSessionList();
      this._mountCanvas();
      return this;
    },

    _cacheEls(container) {
      this._els = {
        sessionList: container.querySelector('#session-list'),
        messages: container.querySelector('#chat-messages'),
        textarea: container.querySelector('#chat-textarea'),
        sendBtn: container.querySelector('#send-btn'),
        stopBtn: container.querySelector('#stop-btn'),
        newBtn: container.querySelector('#new-session'),
        clearBtn: container.querySelector('#clear-all'),
        canvas: container.querySelector('#chat-canvas'),
        clearViz: container.querySelector('#clear-viz'),
        vizHint: container.querySelector('#viz-hint'),
      };
    },

    _bindEvents() {
      this._els.sendBtn.addEventListener('click', () => this._send());
      this._els.stopBtn.addEventListener('click', () => this._stop());
      this._els.newBtn.addEventListener('click', () => this._newSession());
      this._els.clearBtn.addEventListener('click', () => {
        if (confirm('确定清空所有对话历史？此操作不可撤销。')) {
          ChatHistory.clearAll();
          this._currentSessionId = null;
          this._renderSessionList();
          this._clearMessages();
        }
      });
      this._els.textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this._send();
        }
      });
      this._els.clearViz.addEventListener('click', () => {
        if (window.VIZ && VIZ.mounted) VIZ.clear();
        this._els.vizHint.style.display = 'block';
      });
    },

    _mountCanvas() {
      if (window.VIZ) VIZ.mount(this._els.canvas);
    },

    _renderSessionList() {
      const sessions = ChatHistory.list();
      const el = this._els.sessionList;
      MVutil.clear(el);
      sessions.forEach((s) => {
        const item = MVutil.h('div', {
          class: 'session-item' + (s.id === this._currentSessionId ? ' active' : ''),
          dataset: { id: s.id },
        });
        const title = MVutil.h('span', { class: 'session-title' }, s.title);
        const del = MVutil.h('span', { class: 'session-del', style: { color: 'var(--fg-dim)', cursor: 'pointer' } }, '✕');
        del.title = '删除';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('删除该对话？')) {
            ChatHistory.remove(s.id);
            if (this._currentSessionId === s.id) {
              this._currentSessionId = null;
              this._clearMessages();
            }
            this._renderSessionList();
          }
        });
        item.appendChild(title);
        item.appendChild(del);
        item.addEventListener('click', () => this._switchSession(s.id));
        el.appendChild(item);
      });
    },

    _newSession() {
      const s = ChatHistory.create();
      this._currentSessionId = s.id;
      this._renderSessionList();
      this._clearMessages();
      this._els.textarea.focus();
    },

    _switchSession(id) {
      this._currentSessionId = id;
      const s = ChatHistory.get(id);
      this._renderSessionList();
      this._clearMessages();
      if (s && s.messages) {
        s.messages.forEach((m) => this._renderMessage(m, true));
      }
    },

    _clearMessages() {
      this._els.messages.innerHTML = '<div class="chat-empty muted" style="padding:40px 20px;text-align:center"><p>向 AI 提问，它会用可视化帮你理解微积分。</p><p class="dim" style="font-size:13px">试试："画一下 sin(x) 在 1 处的切线"</p></div>';
    },

    async _send() {
      const text = this._els.textarea.value.trim();
      if (!text) return;
      if (!AIConfig.isConfigured()) {
        this._renderMessage({ role: 'system', content: '⚠ 未配置 API 凭据，请先到<a href="#/settings">设置页</a>填写。' });
        return;
      }
      // 确保有会话
      if (!this._currentSessionId) this._newSession();
      const sessionId = this._currentSessionId;

      // 渲染用户消息并持久化
      const userMsg = { role: 'user', content: text };
      this._renderMessage(userMsg);
      ChatHistory.appendMessage(sessionId, userMsg);
      this._els.textarea.value = '';

      // 准备助手消息占位（流式填充）
      const assistantEl = this._createAssistantBubble();
      this._pendingReasoning = '';
      this._pendingContent = '';
      this._pendingScenes = [];
      this._bridge = MVbridge.create({
        onExecute: (scene) => {
          this._pendingScenes.push(scene);
          this._els.vizHint.style.display = 'none';
        },
        onError: (errors) => {
          // 围栏格式错误：占位里体现
        },
      });

      // 发起流式请求
      this._setSending(true);
      this._abortController = new AbortController();
      const history = (ChatHistory.get(sessionId).messages || [])
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      await AIClient.chat(history, {
        signal: this._abortController.signal,
        onReasoning: (t) => {
          this._pendingReasoning += t;
          this._updateAssistantBubble(assistantEl);
        },
        onToken: (t) => {
          this._pendingContent += t;
          this._bridge.feed(t);
          this._updateAssistantBubble(assistantEl);
        },
        onDone: (result) => {
          this._setSending(false);
          const fullText = result.full;
          // 渲染最终消息（Markdown + KaTeX + viz 占位）
          assistantEl.dataset.done = '1';
          this._finalizeAssistantBubble(assistantEl, fullText, result.reasoning);
          // 持久化
          ChatHistory.appendMessage(sessionId, {
            role: 'assistant',
            content: fullText,
            reasoning: result.reasoning || '',
            vizScenes: this._pendingScenes,
            interrupted: !!result.interrupted,
          });
          this._renderSessionList();
        },
        onError: (err) => {
          this._setSending(false);
          this._renderMessage({ role: 'system', content: this._formatError(err) });
        },
      });
    },

    _stop() {
      if (this._abortController) this._abortController.abort();
      this._setSending(false);
    },

    _setSending(sending) {
      this._els.sendBtn.disabled = sending;
      this._els.stopBtn.style.display = sending ? 'block' : 'none';
    },

    _formatError(err) {
      switch (err.type) {
        case 'auth': return '⚠ ' + err.message + ' <a href="#/settings">前往设置</a>';
        case 'rate': return '⚠ ' + err.message;
        case 'server': return '⚠ ' + err.message;
        case 'network': return '⚠ ' + err.message;
        case 'timeout': return '⚠ ' + err.message;
        case 'config': return '⚠ ' + err.message + ' <a href="#/settings">前往设置</a>';
        default: return '⚠ ' + (err.message || '未知错误');
      }
    },

    _createAssistantBubble() {
      // 清空 empty 占位
      const empty = this._els.messages.querySelector('.chat-empty');
      if (empty) empty.remove();
      const wrap = MVutil.h('div', { class: 'msg assistant' });
      const role = MVutil.h('div', { class: 'role' }, 'AI');
      const bubble = MVutil.h('div', { class: 'bubble' });
      wrap.appendChild(role);
      wrap.appendChild(bubble);
      this._els.messages.appendChild(wrap);
      this._els.messages.scrollTop = this._els.messages.scrollHeight;
      wrap._bubble = bubble;
      return wrap;
    },

    _updateAssistantBubble(wrap) {
      const bubble = wrap._bubble;
      // 流式时用纯文本快速渲染（避免每 token 全量 markdown 解析卡顿）
      const showReasoning = this._pendingReasoning;
      const showContent = this._pendingContent || '…';
      const display = this._bridge ? this._bridge.getDisplayText() : showContent;
      // 简单渲染：思维链折叠 + 正文纯文本（转义）+ viz 占位标记
      let html = '';
      if (showReasoning) {
        html += '<details class="reasoning-block"><summary>思考过程…</summary><div>' + MVutil.escapeHtml(showReasoning) + '</div></details>';
      }
      // 把 \u0000VIZ:n\u0000 占位换成可视标记
      const text = MVutil.escapeHtml(display)
        .replace(/\u0000VIZ:(\d+)\u0000/g, '<span class="viz-placeholder">✓ 已渲染可视化 #$1</span>')
        .replace(/\u0000VIZ:pending\u0000/g, '<span class="viz-placeholder">⟳ 渲染中…</span>')
        .replace(/\n/g, '<br>');
      html += '<div class="streaming-text">' + (text || '…') + '</div>';
      bubble.innerHTML = html;
      this._els.messages.scrollTop = this._els.messages.scrollHeight;
    },

    _finalizeAssistantBubble(wrap, fullText, reasoning) {
      const bubble = wrap._bubble;
      let html = '';
      if (reasoning) {
        html += '<details class="reasoning-block"><summary>思考过程（点击展开）</summary><div>' + MVutil.escapeHtml(reasoning) + '</div></details>';
      }
      // 用 markdown 完整渲染，viz 围栏由 MVmd 转成 .viz-fence 占位 div
      let mdHtml = window.MVmd ? window.MVmd.render(fullText) : MVutil.escapeHtml(fullText);
      // 把 .viz-fence 占位换成按钮（点击重新执行）
      mdHtml = mdHtml.replace(/<div class="viz-fence" data-raw="([^"]*)"><\/div>/g, (m, raw) => {
        return '<div class="viz-placeholder" data-replay="' + raw + '">✓ 已渲染可视化（点击重放）</div>';
      });
      html += mdHtml;
      bubble.innerHTML = html;
      // 绑定重放按钮
      bubble.querySelectorAll('.viz-placeholder[data-replay]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const raw = decodeURIComponent(btn.dataset.replay);
          const r = MVprotocol.parse(raw);
          if (r.ok && window.VIZ) {
            VIZ.execute(r.scene);
            this._els.vizHint.style.display = 'none';
          }
        });
      });
      this._els.messages.scrollTop = this._els.messages.scrollHeight;
    },

    _renderMessage(msg, isReplay) {
      const empty = this._els.messages.querySelector('.chat-empty');
      if (empty) empty.remove();
      const wrap = MVutil.h('div', { class: 'msg ' + (msg.role === 'user' ? 'user' : (msg.role === 'system' ? 'system' : 'assistant')) });
      const role = MVutil.h('div', { class: 'role' }, msg.role === 'user' ? '你' : (msg.role === 'system' ? '系统' : 'AI'));
      const bubble = MVutil.h('div', { class: 'bubble' });
      wrap.appendChild(role);
      wrap.appendChild(bubble);
      if (msg.role === 'user') {
        bubble.textContent = msg.content;
      } else if (msg.role === 'system') {
        bubble.innerHTML = msg.content; // 系统消息含简单 HTML（链接）
      } else {
        // assistant
        let html = '';
        if (msg.reasoning) {
          html += '<details class="reasoning-block"><summary>思考过程（点击展开）</summary><div>' + MVutil.escapeHtml(msg.reasoning) + '</div></details>';
        }
        let mdHtml = window.MVmd ? window.MVmd.render(msg.content) : MVutil.escapeHtml(msg.content);
        mdHtml = mdHtml.replace(/<div class="viz-fence" data-raw="([^"]*)"><\/div>/g, (m, raw) => {
          return '<div class="viz-placeholder" data-replay="' + raw + '">✓ 已渲染可视化（点击重放）</div>';
        });
        html += mdHtml;
        if (msg.interrupted) html += '<div class="dim" style="font-size:12px;margin-top:6px">（连接中断）</div>';
        bubble.innerHTML = html;
        bubble.querySelectorAll('.viz-placeholder[data-replay]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const raw = decodeURIComponent(btn.dataset.replay);
            const r = MVprotocol.parse(raw);
            if (r.ok && window.VIZ) { VIZ.execute(r.scene); this._els.vizHint.style.display = 'none'; }
          });
        });
      }
      this._els.messages.appendChild(wrap);
      this._els.messages.scrollTop = this._els.messages.scrollHeight;
    },

    unmount() {
      if (this._abortController) this._abortController.abort();
    },
  });
})();
