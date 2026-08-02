# mathviz — 3b1b 式高等数学可视化教学站

一个独立的纯前端项目：用 **KaTeX + 自研 Canvas/SVG 引擎** 把高等数学核心概念
（极限、导数、积分、泰勒级数）做成 3b1b 风格的可交互可视化课案，
并能通过 **DeepSeek 对话**实时驱动可视化。

> **项目边界声明**：本项目位于 `Yianzhixing/` 工作树下，但与同工作树的
> MindSecGo 项目**完全独立**——不共享代码、品牌、组件，也不沿用其零依赖哲学
> 与提交约定。本项目自成体系，独立部署。

## 技术栈

- 纯 HTML / CSS / JS（无构建步骤）
- [KaTeX](https://katex.org/)（vendored 本地副本）渲染数学公式
- 自研轻量 Canvas 2D 可视化引擎（`js/viz/`）
- DeepSeek API（OpenAI Chat Completions 兼容协议，用户自填凭据）
- localStorage 持久化对话历史

## 本地运行

```bash
node server.js
# 默认 http://127.0.0.1:8100/
# 同时打印局域网入口供手机访问
```

也可直接 `file://` 打开 `index.html`，但 `fetch` 调用 DeepSeek API 需要 http(s) 来源，
建议用 server.js。

## 目录结构

```
index.html            入口
server.js             极简静态服务器（端口 8100）
css/                  样式
vendor/katex/         KaTeX 本地副本（css + js + fonts）
js/
  app.js              应用内核（页面注册/挂载）
  router.js           hash 路由
  lib/                工具：公式渲染、Markdown、数学求值
  viz/                可视化引擎：stage / axes / primitives / timeline / engine / protocol
  ai/                 DeepSeek 对话：client / config / history / protocol-bridge
  data/courses/       四套预设课案数据
  pages/              home / course / chat / settings
spec/                 OpenSpec 规范与变更提案
viz-protocol.md       可视化指令协议文档（AI 与引擎的桥）
CHANGELOG.md          版本记录
```

## DeepSeek API 配置

首次使用前，到 **设置页**（`#/settings`）填写：

| 字段 | 说明 | 示例 |
|---|---|---|
| baseURL | API 端点根地址 | `https://api.deepseek.com` |
| apiKey | API 密钥（sk- 开头） | `sk-...` |
| model | 模型名 | `deepseek-v4-flash` |
| thinkingMode | 思考模式开关 | `enabled` / `disabled` |
| reasoningEffort | 推理强度 | `low` / `high` / `max` |

凭据存于 localStorage（键 `mathviz.ai.config`）；勾选"仅本会话"则改存 sessionStorage，
关闭标签页即清除。

> ⚠️ **安全提示**：API key 存 localStorage 会暴露给同源 JS。请勿在公共电脑上持久保存，
> 也不要把含 key 的 localStorage 数据分享出去。

## 可视化指令协议

让 AI 实时驱动可视化的核心机制，详见 [`viz-protocol.md`](./viz-protocol.md)。
简言之：AI 在回答中用 ` ```viz ` 围栏代码块返回符合 JSON Schema 的 scene 指令，
前端解析后调用 `VIZ.execute(scene)` 渲染。

## 扩展课案

在 `js/data/courses/` 下新增一个遵循课案数据结构的 JS 文件并在 `js/data/courses/index.js`
注册，即可在首页出现新卡片，无需改动引擎。详见各课案文件与 `js/pages/course.js`。

## 许可

项目代码自有；KaTeX 遵循其 MIT 许可（vendor/katex/ 内附 LICENSE）。
