/**
 * mathviz — js/ai/client.js
 * DeepSeek 流式对话客户端。
 *
 * 功能：
 *   - chat(messages, { onToken, onReasoning, onDone, onError, signal })
 *     流式读取 chat/completions，逐 token 回调
 *   - 区分正文 content 与思维链 reasoning_content
 *   - 注入 system prompt
 *   - 按 config 注入 thinking:{type, reasoning_effort}
 *   - 错误分类（401/429/5xx/网络中断/超时）
 *
 * 协议：OpenAI Chat Completions 兼容（DeepSeek 兼容）。
 * 流式：stream:true，响应为 SSE，每行 data: {json}，末尾 data: [DONE]。
 *
 * 暴露 window.AIClient.chat(...)
 */
(function (global) {
  'use strict';

  /**
   * 发起一次流式对话。
   * @param {Array} messages 对话历史 [{role, content}, ...]（不含 system，本函数注入）
   * @param {Object} handlers
   *   - onToken(text): 正文 content 增量
   *   - onReasoning(text): 思维链 reasoning_content 增量
   *   - onDone({full, reasoning, usage}): 完成回调
   *   - onError(err): {type, message, status?} type∈[auth,rate,server,network,timeout,unknown]
   *   - signal: AbortSignal（用于取消）
   * @returns {Promise<void>}
   */
  async function chat(messages, handlers) {
    handlers = handlers || {};
    const cfg = global.AIConfig.read();
    if (!cfg.apiKey || !cfg.baseURL) {
      handlers.onError && handlers.onError({ type: 'config', message: '未配置 API 凭据，请到设置页填写。' });
      return;
    }

    // 组装 messages：system 在首
    const fullMessages = [{ role: 'system', content: global.AISystemPrompt }];
    messages.forEach((m) => {
      if (m.role === 'system') return; // 避免重复
      fullMessages.push({ role: m.role, content: m.content });
    });

    const body = {
      model: cfg.model,
      messages: fullMessages,
      stream: true,
    };
    if (cfg.thinkingMode === 'enabled') {
      body.thinking = { type: 'enabled', reasoning_effort: cfg.reasoningEffort };
    } else {
      body.thinking = { type: 'disabled' };
    }

    const url = cfg.baseURL + '/chat/completions';
    const controller = new AbortController();
    const userSignal = handlers.signal;
    if (userSignal) {
      if (userSignal.aborted) controller.abort();
      else userSignal.addEventListener('abort', () => controller.abort());
    }
    const timer = setTimeout(() => controller.abort(), handlers.timeout || 120000);

    let resp;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + cfg.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') {
        handlers.onError && handlers.onError({ type: userSignal && userSignal.aborted ? 'cancel' : 'timeout', message: '请求已取消或超时。' });
      } else {
        handlers.onError && handlers.onError({ type: 'network', message: '无法连接到 ' + cfg.baseURL + '：' + (e.message || '网络错误') });
      }
      return;
    }

    if (!resp.ok) {
      clearTimeout(timer);
      let detail = '';
      try { const e = await resp.json(); detail = e.error?.message || e.message || ''; } catch (e) {}
      const err = classifyHttp(resp.status, detail);
      handlers.onError && handlers.onError(err);
      return;
    }

    // 流式解析 SSE
    let fullContent = '';
    let fullReasoning = '';
    let usage = null;
    try {
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE 按行处理，行以 \n 结尾；保留最后不完整行在 buffer
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 最后一段可能不完整
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;
          let chunk;
          try { chunk = JSON.parse(payload); } catch (e) { continue; }
          // usage（最后一块可能带）
          if (chunk.usage) usage = chunk.usage;
          const delta = chunk.choices && chunk.choices[0] && chunk.choices[0].delta;
          if (!delta) continue;
          // 思维链
          if (delta.reasoning_content) {
            fullReasoning += delta.reasoning_content;
            handlers.onReasoning && handlers.onReasoning(delta.reasoning_content);
          }
          // 正文
          if (delta.content) {
            fullContent += delta.content;
            handlers.onToken && handlers.onToken(delta.content);
          }
        }
      }
    } catch (e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') {
        // 流中断：把已收到的内容交给 onDone（标记中断）
        handlers.onDone && handlers.onDone({ full: fullContent, reasoning: fullReasoning, usage, interrupted: true });
        return;
      }
      handlers.onError && handlers.onError({ type: 'network', message: '流读取中断：' + (e.message || '') });
      return;
    }
    clearTimeout(timer);
    handlers.onDone && handlers.onDone({ full: fullContent, reasoning: fullReasoning, usage, interrupted: false });
  }

  function classifyHttp(status, detail) {
    if (status === 401) return { type: 'auth', message: 'API Key 无效或已过期（401）。请到设置页检查。', status };
    if (status === 403) return { type: 'auth', message: '访问被拒（403）。Key 可能无该模型权限。', status };
    if (status === 404) return { type: 'config', message: '端点或模型不存在（404）。请检查 Base URL 与模型名。', status };
    if (status === 429) return { type: 'rate', message: '请求过于频繁（429）。请稍后重试。', status };
    if (status >= 500) return { type: 'server', message: '模型服务暂时不可用（' + status + '）。请稍后再试。', status };
    return { type: 'unknown', message: '请求失败（' + status + '）' + (detail ? '：' + detail : ''), status };
  }

  global.AIClient = { chat };
})(window);
