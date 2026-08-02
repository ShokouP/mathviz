/**
 * mathviz — js/ai/config.js
 * API 凭据读写：baseURL / apiKey / model / thinkingMode / reasoningEffort。
 *
 * 存储：
 *   - 默认 localStorage（键 mathviz.ai.config）
 *   - 勾选"仅本会话"则改用 sessionStorage（关闭标签页即清除）
 *
 * baseURL 规范化：
 *   - 去尾斜杠
 *   - DeepSeek 官方端点 https://api.deepseek.com 的 chat/completions 在根路径，
 *     不补 /v1（与 OpenAI 不同）。仅当用户显式写 /v1 时保留。
 *
 * 暴露 window.AIConfig。
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'mathviz.ai.config';
  const SESSION_KEY = 'mathviz.ai.config.session';

  const DEFAULTS = {
    baseURL: 'https://api.deepseek.com',
    apiKey: '',
    model: 'deepseek-v4-flash',
    thinkingMode: 'enabled',
    reasoningEffort: 'high',
    sessionOnly: false,
  };
  const VALID_THINKING = ['enabled', 'disabled'];
  const VALID_EFFORT = ['low', 'high', 'max'];

  /** 规范化 baseURL：去尾斜杠；不自动补 /v1（DeepSeek chat/completions 在根路径） */
  function normalizeBaseURL(url) {
    if (!url || typeof url !== 'string') return DEFAULTS.baseURL;
    let u = url.trim();
    u = u.replace(/\/+$/, ''); // 去尾斜杠
    // 去掉可能误加的 /chat/completions 后缀（用户可能整段粘贴 endpoint）
    u = u.replace(/\/chat\/completions\/?$/i, '');
    return u || DEFAULTS.baseURL;
  }

  function read() {
    // 优先读 sessionStorage（仅本会话模式），其次 localStorage
    let raw = null;
    try { raw = sessionStorage.getItem(SESSION_KEY); } catch (e) {}
    if (raw) {
      const cfg = JSON.parse(raw);
      cfg.sessionOnly = true;
      return Object.assign({}, DEFAULTS, cfg);
    }
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
    return Object.assign({}, DEFAULTS);
  }

  function write(cfg) {
    const clean = sanitize(cfg);
    if (clean.sessionOnly) {
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(clean)); } catch (e) {}
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    } else {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clean)); } catch (e) {
        if (e && (e.name === 'QuotaExceededError' || e.code === 22)) throw e;
      }
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    }
    return clean;
  }

  /** 校验+清洗输入；非法值钳到默认 */
  function sanitize(cfg) {
    cfg = cfg || {};
    const out = {
      baseURL: normalizeBaseURL(cfg.baseURL),
      apiKey: (cfg.apiKey || '').trim(),
      model: (cfg.model || DEFAULTS.model).trim(),
      thinkingMode: VALID_THINKING.indexOf(cfg.thinkingMode) >= 0 ? cfg.thinkingMode : DEFAULTS.thinkingMode,
      reasoningEffort: VALID_EFFORT.indexOf(cfg.reasoningEffort) >= 0 ? cfg.reasoningEffort : DEFAULTS.reasoningEffort,
      sessionOnly: !!cfg.sessionOnly,
    };
    return out;
  }

  /** 是否已配置可用凭据 */
  function isConfigured() {
    const c = read();
    return !!(c.baseURL && c.apiKey && c.model);
  }

  /** 脱敏显示 key：仅前 4 位 + *** */
  function maskKey(key) {
    if (!key) return '';
    if (key.length <= 8) return key.slice(0, 2) + '***';
    return key.slice(0, 4) + '***' + key.slice(-2);
  }

  global.AIConfig = {
    DEFAULTS, VALID_THINKING, VALID_EFFORT,
    STORAGE_KEY, SESSION_KEY,
    read, write, sanitize, normalizeBaseURL, isConfigured, maskKey,
  };
})(window);
