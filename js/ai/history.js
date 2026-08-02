/**
 * mathviz — js/ai/history.js
 * 对话历史本地持久化：多会话管理（新建/切换/重命名/删除/清空）。
 *
 * 存储：localStorage 键 mathviz.chat.sessions，值为会话数组。
 * 每个会话：{ id, title, createdAt, updatedAt, messages: [...] }
 * 每条消息：{ role, content, reasoning?, vizScenes?[] }
 *   vizScenes：该助手消息产生的合法 scene 列表（供"应用到画布"重放）。
 *
 * 暴露 window.ChatHistory。
 */
(function (global) {
  'use strict';

  const KEY = 'mathviz.chat.sessions';

  function loadAll() {
    return global.MVutil.store.get(KEY, []);
  }
  function saveAll(sessions) {
    global.MVutil.store.set(KEY, sessions);
  }

  /** 列出所有会话，按 updatedAt 倒序 */
  function list() {
    return loadAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  /** 新建空会话，返回会话对象 */
  function create(title) {
    const sessions = loadAll();
    const now = Date.now();
    const session = {
      id: 's_' + now.toString(36) + Math.random().toString(36).slice(2, 6),
      title: title || '新对话 ' + new Date(now).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    sessions.push(session);
    saveAll(sessions);
    return session;
  }

  function get(id) {
    return loadAll().find((s) => s.id === id) || null;
  }

  /** 更新会话（合并 messages 等），自动更新 updatedAt 与 title（首条用户消息） */
  function update(id, patch) {
    const sessions = loadAll();
    const s = sessions.find((x) => x.id === id);
    if (!s) return null;
    Object.assign(s, patch);
    s.updatedAt = Date.now();
    // 自动标题：首条用户消息前 20 字
    if (s.messages && s.messages.length && (!patch.title || s.title.startsWith('新对话'))) {
      const firstUser = s.messages.find((m) => m.role === 'user');
      if (firstUser) s.title = firstUser.content.slice(0, 24) + (firstUser.content.length > 24 ? '…' : '');
    }
    saveAll(sessions);
    return s;
  }

  /** 追加一条消息到会话 */
  function appendMessage(id, message) {
    const s = get(id);
    if (!s) return null;
    s.messages.push(message);
    return update(id, { messages: s.messages });
  }

  function rename(id, title) {
    return update(id, { title });
  }

  function remove(id) {
    const sessions = loadAll().filter((s) => s.id !== id);
    saveAll(sessions);
  }

  function clearAll() {
    saveAll([]);
  }

  global.ChatHistory = { KEY, list, create, get, update, appendMessage, rename, remove, clearAll };
})(window);
