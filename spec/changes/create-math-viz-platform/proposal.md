# 提案：创建 3b1b 式高等数学可视化教学站

## Why

**背景**：
- 高等数学（微积分为主）的核心概念——极限、导数、积分、级数——本质是动态过程：
  ε-δ 的逼近、切线的趋近、黎曼和的细分、多项式的逐次叠加。这些过程用静态板书或
  PDF 难以传达其"动"，恰恰是可视化最擅长的领域。
- 3Blue1Brown（Grant Sanderson）以 Manim 证明：把抽象数学过程做成可控、有节奏、
  有美感的动画，能极大降低理解门槛。但 Manim 是 Python 离线渲染视频工具，
  产出的是 MP4 而非可交互、可对话的网页。
- 同期大语言模型（DeepSeek 等）已具备解释数学概念、推导公式、甚至生成结构化
  指令的能力，但单纯"对话框"形式无法让学习者"看见"模型在说什么。

**当前状态**：
- `math/` 目录为空，无任何代码与依赖。
- 该目录虽位于 MindSecGo 仓库工作树内（其 `.git` 在上层 `Yianzhixing/`），
  但用户明确要求本项目为**完全独立新项目**：不沿用 MindSecGo 的零依赖哲学、
  SPA 壳、品牌与组件，自由选型、独立部署。

**期望状态**：
- 一个独立的纯前端教学站（HTML/CSS/JS），用 KaTeX 渲染公式 + 自研轻量
  Canvas/SVG 动画引擎，呈现 3b1b 风格的高数可视化课案。
- 用户能与 DeepSeek 模型实时对话；模型除返回文字解释外，还能返回**可视化指令**，
  前端解析后实时驱动动画引擎（画函数、移动切点、改变多项式阶数等）。
- API 凭据（baseURL / key / 模型名）由用户在站内设置页自填，存 localStorage；
  对话历史本地持久化，刷新不丢。

**核心设计张力与解法**：
- 大模型是文本流，动画引擎是图形 API，二者之间需要一座桥。
- 解法：设计一套**可视化指令协议**——约定一组 JSON 指令（如 `plot`、`tangent`、
  `taylor`、`animate`），在 system prompt 中教会模型在需要可视化时用围栏代码块
  返回指令；前端在流式输出中识别围栏、增量解析 JSON、派发到引擎执行。
  文字解释仍正常渲染为 Markdown+KaTeX。

**DeepSeek API 核查结论**（2026-08-02 官网核实）：
- 目标模型 `deepseek-v4-flash`（对应 DeepSeek-V4-Flash-0731）真实存在，为当前在售模型。
- 思考模式开关：请求体 `thinking:{type:"enabled"|"disabled", reasoning_effort:"low"|"high"|"max"}`。
- 思维链内容返回在 `reasoning_content` 字段（区别于正文 `content`），前端需分区渲染。
- base URL：`https://api.deepseek.com`（chat/completions 在根路径，不补 /v1）。
- 旧别名 `deepseek-chat`/`deepseek-reasoner` 已于 2026-07-24 弃用，代码中不得依赖。
- 另有 `deepseek-v4-pro`（Pro 正式版待发布，MVP 不使用）。

## What Changes

- **新建项目骨架**：`math/` 下从零搭建独立前端项目（独立 README、目录结构、
  极简 dev server），不与 MindSecGo 主站共享任何代码或约束。
- **引入 KaTeX**（vendored 本地副本，非 CDN）作为公式渲染基座。
- **自研轻量可视化引擎** `viz/`：基于 Canvas 2D（主）+ SVG（辅），提供坐标系、
  函数曲线、切线、黎曼矩形、泰勒多项式叠加等原语，支持时间轴驱动的动画。
- **设计可视化指令协议** `viz-protocol.md`：JSON Schema 约定的指令集 +
  system prompt 模板，让 DeepSeek 能稳定产出前端可执行的指令。
- **实现 DeepSeek 对话层** `ai/`：流式 SSE 解析、围栏代码块增量识别、
  指令派发、Markdown 渲染、错误处理与重试。
- **实现设置页**：baseURL / API key / 模型名 三项自填，存 localStorage，
  支持连通性测试。
- **预设四套课案**（MVP 范围，3b1b 最经典题材）：
  1. 极限与连续（ε-δ 逼近可视化）
  2. 导数与微分（切线斜率、瞬时变化率）
  3. 积分与黎曼和（矩形细分逼近面积）
  4. 泰勒级数（多项式逐项叠加逼近）
- **对话历史本地持久化**：localStorage 存储，支持多会话、清空、删除。

## Impact

### 受影响的规范（全部为新增能力）
- `spec/specs/visualization-engine/spec.md` - 动画引擎、坐标系、动画原语、指令协议
- `spec/specs/teaching-courses/spec.md` - 四套预设课案的内容与交互契约
- `spec/specs/ai-dialog/spec.md` - 对话、设置、本地存储、流式与指令派发

### 受影响的代码（全部为新建）
- `index.html`、`css/`、`server.js`、`README.md` - 项目骨架
- `vendor/katex/` - KaTeX 本地副本（vendored）
- `js/lib/` - 公式渲染、Markdown、工具函数
- `js/viz/` - 可视化引擎核心
- `js/ai/` - DeepSeek 对话层
- `js/data/courses.js` - 四套课案数据
- `js/pages/` - 课案页、对话页、设置页

### 用户影响
- 学习者：获得可交互、可对话、看得见的高数学习体验。
- 内容作者：可参照指令协议扩展更多课案，无需改引擎。

### API 变更
- 无后端 API。前端直接调用用户自填的 DeepSeek 兼容端点（OpenAI Chat Completions 兼容协议）。

### 需要迁移
- [ ] 数据库迁移 — 不适用（纯前端 + localStorage）
- [x] 文档更新 — 需新建 README、viz-protocol.md
- [ ] API 版本提升 — 不适用

## 时间线评估

**中等偏大**。预估 5 阶段、约 17 个任务（详见 tasks.json）。
最重工作量集中在：可视化引擎（任务 6-8）、指令协议与 AI 对话层（任务 10-12）、
四套课案内容（任务 14-17）。建议分批交付：先打通"引擎 + 一套课案 + 对话闭环"
的最小可用版本，再补齐其余课案。

## 风险

- **风险：模型不稳定产出合规指令。**
  缓解：用 EARS 场景固化指令协议；system prompt 给出少样本示例；前端对非法
  指令做容错（跳过并提示），不阻塞对话。
- **风险：KaTeX vendored 体积与版本管理。**
  缓解：仅引入渲染所需核心文件（css + js + fonts），固定版本，记入 README。
- **风险：Canvas 动画在高 DPR / 移动端性能。**
  缓解：使用 `devicePixelRatio` 适配；动画用 `requestAnimationFrame`；
  复杂场景降帧或暂停不可见动画。
- **风险：API key 存 localStorage 的安全性。**
  缓解：README 明确警示；提供"仅本会话"选项；不做任何外发。
- **风险：与 MindSecGo 主站的边界混乱。**
  缓解：本提案明确为独立项目；README 顶部声明独立边界；不共享 git 历史。
