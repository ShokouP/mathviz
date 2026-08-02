/**
 * mathviz — js/pages/settings.js
 * 设置页：API 凭据表单（5 字段）+ 连通性测试 + 仅本会话选项。
 */
(function () {
  'use strict';
  App.register('settings', {
    mount(ctx) {
      this._ctx = ctx;
      const cfg = window.AIConfig ? AIConfig.read() : { ...AIConfig.DEFAULTS };
      ctx.container.innerHTML = `
        <div class="settings-wrap">
          <h2>API 设置</h2>
          <p class="muted">配置 DeepSeek（或任意 OpenAI Chat Completions 兼容端点）的访问凭据。
          数据仅保存在本浏览器，不上传任何服务器。</p>

          <div class="field">
            <label>Base URL</label>
            <input id="cfg-baseurl" type="text" value="${MVutil.escapeHtml(cfg.baseURL)}" placeholder="https://api.deepseek.com" />
            <div class="hint">API 端点根地址。DeepSeek 官方为 <code>https://api.deepseek.com</code>
            （chat/completions 在根路径，无需补 /v1）。</div>
          </div>

          <div class="field">
            <label>API Key</label>
            <input id="cfg-apikey" type="password" value="${MVutil.escapeHtml(cfg.apiKey)}" placeholder="sk-..." />
            <div class="hint">在 DeepSeek 开放平台获取。当前保存：
            <code>${AIConfig.maskKey(cfg.apiKey) || '（未设置）'}</code></div>
          </div>

          <div class="field">
            <label>模型</label>
            <input id="cfg-model" type="text" value="${MVutil.escapeHtml(cfg.model)}" placeholder="deepseek-v4-flash" />
            <div class="hint">DeepSeek 当前在售：<code>deepseek-v4-flash</code>（推荐）/
            <code>deepseek-v4-pro</code>。旧别名 deepseek-chat/deepseek-reasoner 已于 2026-07-24 弃用。</div>
          </div>

          <div class="field">
            <label>思考模式</label>
            <div class="row">
              <select id="cfg-thinking">
                <option value="enabled">开启（thinking）</option>
                <option value="disabled">关闭</option>
              </select>
              <select id="cfg-effort">
                <option value="low">推理强度: low</option>
                <option value="high">推理强度: high（默认）</option>
                <option value="max">推理强度: max</option>
              </select>
            </div>
            <div class="hint">开启思考模式后，模型会先输出思维链（<code>reasoning_content</code>），
            在对话气泡顶部以折叠区单独呈现。</div>
          </div>

          <div class="field">
            <label><input type="checkbox" id="cfg-session" style="width:auto;display:inline-block;margin-right:6px"
              ${cfg.sessionOnly ? 'checked' : ''} />
              仅本会话（关闭标签页即清除 Key，不写入 localStorage）</label>
          </div>

          <div class="row">
            <button class="primary" id="btn-save">保存</button>
            <button id="btn-test">测试连接</button>
          </div>
          <div id="test-result"></div>

          <hr style="border:none;border-top:1px solid var(--border);margin:24px 0" />
          <p class="dim">⚠ <strong>安全提示</strong>：API Key 存 localStorage 会暴露给同源 JavaScript。
          请勿在公共电脑上持久保存，也不要把含 Key 的浏览器数据分享出去。</p>
          <p><a href="#/home">← 返回首页</a></p>
        </div>`;

      // 回填 select
      const tSel = ctx.container.querySelector('#cfg-thinking');
      const eSel = ctx.container.querySelector('#cfg-effort');
      tSel.value = cfg.thinkingMode;
      eSel.value = cfg.reasoningEffort;

      this._bindEvents(ctx.container);
      return this;
    },

    _bindEvents(container) {
      const saveBtn = container.querySelector('#btn-save');
      const testBtn = container.querySelector('#btn-test');
      const result = container.querySelector('#test-result');

      const gather = () => ({
        baseURL: container.querySelector('#cfg-baseurl').value,
        apiKey: container.querySelector('#cfg-apikey').value,
        model: container.querySelector('#cfg-model').value,
        thinkingMode: container.querySelector('#cfg-thinking').value,
        reasoningEffort: container.querySelector('#cfg-effort').value,
        sessionOnly: container.querySelector('#cfg-session').checked,
      });

      saveBtn.addEventListener('click', () => {
        try {
          const cfg = AIConfig.write(gather());
          this._showResult(result, 'ok', '保存成功。模型：' + cfg.model + '，端点：' + cfg.baseURL);
        } catch (e) {
          this._showResult(result, 'err', '保存失败：' + (e.name === 'QuotaExceededError' ? '本地存储已满' : e.message));
        }
      });

      testBtn.addEventListener('click', async () => {
        // 先保存再测试（用最新输入）
        let cfg;
        try { cfg = AIConfig.write(gather()); } catch (e) { cfg = AIConfig.sanitize(gather()); }
        if (!cfg.apiKey) { this._showResult(result, 'err', '请先填写 API Key'); return; }
        if (!cfg.baseURL) { this._showResult(result, 'err', '请先填写 Base URL'); return; }
        this._showResult(result, 'warn', '测试中…');
        try {
          const r = await this._testConnection(cfg);
          if (r.ok) {
            this._showResult(result, 'ok', '连接正常。返回模型：' + (r.model || cfg.model));
          } else {
            this._showResult(result, 'err', r.message);
          }
        } catch (e) {
          this._showResult(result, 'err', '测试失败：' + e.message);
        }
      });
    },

    /** 发最小请求测试连通性，10s 超时 */
    async _testConnection(cfg) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const url = cfg.baseURL + '/chat/completions';
        const body = {
          model: cfg.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
          stream: false,
        };
        if (cfg.thinkingMode === 'enabled') {
          body.thinking = { type: 'enabled', reasoning_effort: cfg.reasoningEffort };
        } else {
          body.thinking = { type: 'disabled' };
        }
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cfg.apiKey,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (resp.ok) {
          const data = await resp.json().catch(() => ({}));
          return { ok: true, model: data.model };
        }
        // 错误分类
        if (resp.status === 401) return { ok: false, message: 'API Key 无效（401）。请检查 Key 是否正确或已过期。' };
        if (resp.status === 403) return { ok: false, message: '访问被拒（403）。Key 可能无该模型权限。' };
        if (resp.status === 404) return { ok: false, message: '端点不存在（404）。请检查 Base URL 与模型名。' };
        if (resp.status === 429) return { ok: false, message: '请求过于频繁（429）。请稍后重试。' };
        if (resp.status >= 500) return { ok: false, message: '模型服务暂时不可用（' + resp.status + '）。请稍后再试。' };
        let detail = '';
        try { const e = await resp.json(); detail = e.error?.message || e.message || ''; } catch (e) {}
        return { ok: false, message: '请求失败（' + resp.status + '）' + (detail ? '：' + detail : '') };
      } catch (e) {
        if (e.name === 'AbortError') return { ok: false, message: '连接超时（10s）。请检查 Base URL 是否可达。' };
        return { ok: false, message: '网络错误：' + (e.message || '无法连接到 ' + cfg.baseURL) };
      } finally {
        clearTimeout(timer);
      }
    },

    _showResult(el, type, msg) {
      el.innerHTML = '<div class="test-result ' + type + '">' + MVutil.escapeHtml(msg) + '</div>';
    },

    unmount() {},
  });
})();
