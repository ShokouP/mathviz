# 规范差异：AI 对话与本地存储

本文件定义对 `spec/specs/ai-dialog/spec.md` 的规范变更。
该能力为全新引入，所有需求均为 ADDED。

## ADDED 需求

### Requirement: API 凭据自填与持久化
WHEN 用户在设置页填写 baseURL、apiKey、model、thinkingMode、reasoningEffort，
系统 SHALL 将其持久化到 localStorage（键 `mathviz.ai.config`），供对话层读取。
model 字段 SHALL 默认填入 DeepSeek 当前在售模型 `deepseek-v4-flash`。

#### Scenario: 保存凭据
GIVEN 用户在设置页填入 baseURL="https://api.deepseek.com"、apiKey="sk-xxx"、model="deepseek-v4-flash"
WHEN 点击保存
THEN localStorage.mathviz.ai.config SHALL 含全部字段
AND baseURL 被规范化（去尾斜杠；DeepSeek 官方端点保留不带 /v1，因 chat/completions 直接挂在根路径）
AND 页面显示"保存成功"

#### Scenario: 仅本会话模式
GIVEN 用户勾选"仅本会话"
WHEN 点击保存
THEN 系统 SHALL 将凭据存于 sessionStorage 而非 localStorage
AND 关闭标签页后凭据被清除
AND 不在 localStorage 留下 key 痕迹

#### Scenario: 凭据读取
GIVEN localStorage 已存凭据
WHEN 对话层发起请求前
THEN 系统 SHALL 读取凭据并组装为 Authorization: Bearer <key> 头

---

### Requirement: 连通性测试
WHEN 用户点击设置页"测试连接"按钮，
系统 SHALL 向 `{baseURL}/chat/completions` 发起一个最小请求并按响应给反馈。

#### Scenario: 测试成功
GIVEN 凭据正确
WHEN 点击测试
THEN 系统 SHALL 发送 `messages:[{role:"user",content:"ping"}]` 的最小请求
AND 收到 200 响应后显示"连接正常"
AND 显示返回的模型名供用户确认

#### Scenario: 401 鉴权失败
GIVEN apiKey 错误或过期
WHEN 点击测试
THEN 系统 SHALL 显示"API Key 无效（401）"
AND 不泄露完整 key（仅显示前 4 位 + ***）

#### Scenario: 网络错误
GIVEN baseURL 不可达
WHEN 点击测试
THEN 系统 SHALL 显示"无法连接到 baseURL，请检查地址"
AND 不卡死（超时 10s 后给出反馈）

---

### Requirement: 思考模式与思维链
WHEN 凭据配置 `thinkingMode=enabled`，
系统 SHALL 在请求体中附加 `thinking:{type:"enabled", reasoning_effort:<值>}` 对象；
模型返回的思维链内容位于 `reasoning_content` 字段（区别于正文 `content`），
系统 SHALL 将其以可折叠区域单独呈现，不混入正文。

#### Scenario: 开启思考模式
GIVEN 设置页 thinkingMode=enabled 且 reasoningEffort=max
WHEN 对话层组装请求
THEN 请求体 SHALL 含 `"thinking":{"type":"enabled","reasoning_effort":"max"}`
AND 请求 model 为 deepseek-v4-flash

#### Scenario: 思维链独立折叠
GIVEN 流式响应中某个 chunk 的 delta 含 reasoning_content 字段
WHEN 渲染该 chunk
THEN 系统 SHALL 将其追加到助手气泡顶部的"思考过程"折叠区
AND 该区域默认折叠
AND 正文 content 仍渲染到气泡主区域，二者不混淆

#### Scenario: 关闭思考模式
GIVEN 设置页 thinkingMode=disabled
WHEN 对话层组装请求
THEN 请求体 SHALL 含 `"thinking":{"type":"disabled"}`
AND 响应中不出现 reasoning_content（或被忽略）

#### Scenario: reasoning_effort 取值约束
GIVEN reasoningEffort 字段
THEN 其合法取值 SHALL 限于 "low" / "high" / "max"
AND 设置页控件 SHALL 仅提供这三档（默认 high）

---

### Requirement: 流式对话渲染
WHEN 用户在对话页发送消息，
系统 SHALL 以流式（SSE）方式读取模型响应，并逐 token 渲染到助手消息气泡。

#### Scenario: 流式逐字渲染
GIVEN 用户发送"解释导数"
WHEN 模型开始返回 token
THEN 助手气泡 SHALL 在收到每个 token 后立即追加显示
AND 不等待完整响应才显示

#### Scenario: 流式 Markdown 与 KaTeX
GIVEN 模型返回含 Markdown 语法与 `$...$` 公式的内容
WHEN 流式渲染
THEN 气泡内 SHALL 实时渲染 Markdown（粗体、列表、代码块）
AND 行内与块级公式 SHALL 由 KaTeX 渲染

#### Scenario: 流中断
GIVEN 响应流进行中
WHEN 网络中断
THEN 系统 SHALL 在气泡末尾标注"（连接中断）"
AND 提供"重试"按钮重发上一条用户消息

---

### Requirement: 错误分类处理
WHEN 对话请求返回错误状态码，
系统 SHALL 按状态码分类给出可操作的提示，而非通用"出错了"。

#### Scenario: 401 鉴权失败
GIVEN apiKey 失效
WHEN 发送对话
THEN 系统 SHALL 显示"API Key 无效，请到设置页检查"
AND 提供跳转设置页的链接

#### Scenario: 429 限流
GIVEN 触发速率限制
WHEN 发送对话
THEN 系统 SHALL 显示"请求过于频繁，请稍后重试"
AND 在提示旁提供"等待并重试"按钮

#### Scenario: 5xx 服务端错误
GIVEN 服务端返回 500
WHEN 发送对话
THEN 系统 SHALL 显示"模型服务暂时不可用（5xx），请稍后再试"
AND 提供重试按钮

---

### Requirement: 流中可视化指令派发
WHEN 模型响应流中出现 ```viz 围栏代码块，
系统 SHALL 在围栏闭合瞬间解析其内容为指令协议的 scene，校验后派发给可视化引擎执行。

#### Scenario: 单条指令执行
GIVEN 模型在解释中输出一个 ```viz 围栏含合法 scene
WHEN 围栏闭合被识别
THEN 系统 SHALL 校验 JSON
AND 调用 `VIZ.execute(scene)` 在画布区呈现图形
AND 对话区在该围栏位置显示"已渲染可视化"占位（而非原始 JSON）

#### Scenario: 多指令依次执行
GIVEN 模型输出多个 ```viz 围栏
WHEN 依次闭合
THEN 系统 SHALL 按顺序执行每个 scene
AND 后一个 scene 替换前一个（除非 scene 含 `append:true` 标志）

#### Scenario: 非法指令不阻塞
GIVEN ```viz 围栏内 JSON 校验失败
WHEN 识别到围栏闭合
THEN 系统 SHALL 不抛异常中断对话流
AND 在围栏位置显示"指令格式错误，已跳过"
AND 后续文字与指令继续正常处理

---

### Requirement: 双区布局
WHEN 用户进入对话页 `#/chat`，
系统 SHALL 以左右（桌面）/上下（移动）双区布局呈现：一侧对话、一侧可视化画布。

#### Scenario: 桌面双区
GIVEN 视口宽度 > 820px
THEN 对话页 SHALL 左右分栏
AND 左为对话区（消息流 + 输入框）
AND 右为可视化画布区（固定可见）

#### Scenario: 移动端单区切换
GIVEN 视口宽度 ≤ 820px
THEN 对话页 SHALL 默认显示对话区
AND 当执行 viz 指令时自动切换到画布区或以浮层展示
AND 提供返回对话区的按钮

---

### Requirement: System Prompt 注入
WHEN 组装请求的 messages，
系统 SHALL 在数组首部注入一段固定的 system prompt，告知模型可视化指令协议、可用原语、输出格式与少样本示例。

#### Scenario: system prompt 存在
GIVEN 任意对话请求
THEN messages[0].role SHALL === "system"
AND messages[0].content SHALL 含指令协议说明
AND 含至少 2 个少样本示例（如"画 sin(x)"对应 scene）

#### Scenario: 用户消息不被覆盖
GIVEN 用户发送消息
THEN 该消息 SHALL 作为 role:"user" 追加到 messages 数组
AND 不替换 system 消息

---

### Requirement: 对话历史本地持久化
WHEN 一轮对话完成，
系统 SHALL 将该会话（含所有消息与产生的 viz scenes）持久化到 localStorage，键 `mathviz.chat.sessions`。

#### Scenario: 刷新不丢历史
GIVEN 用户进行了 3 轮对话
WHEN 刷新页面
THEN 系统 SHALL 从 localStorage 恢复这 3 轮对话
AND 助手消息中的 viz 指令可重新执行（"应用到画布"）

#### Scenario: 多会话管理
GIVEN 已存在多个会话
THEN 侧栏 SHALL 列出所有会话（按时间倒序）
AND 支持新建、切换、重命名、删除单个会话、清空全部

#### Scenario: 存储配额溢出
GIVEN localStorage 接近配额上限
WHEN 写入新会话抛出 QuotaExceededError
THEN 系统 SHALL 提示"本地存储已满，请删除旧会话"
AND 不静默丢失数据（保留已成功写入的部分）

---

### Requirement: 历史指令重放
WHEN 用户在历史消息中点击某条 viz 指令的"应用到画布"按钮，
系统 SHALL 重新执行该指令对应的 scene 到当前画布。

#### Scenario: 重放历史指令
GIVEN 历史助手消息含一个 viz scene
WHEN 用户点击该消息的"应用到画布"
THEN 系统 SHALL 调用 `VIZ.execute(scene)`
AND 画布更新为该 scene
AND 不重新发送请求到模型

#### Scenario: 历史指令不可用
GIVEN 历史消息的 scene 数据损坏（如手动改过 localStorage）
WHEN 点击"应用到画布"
THEN 系统 SHALL 显示"该指令数据已损坏，无法重放"
AND 不执行任何画布操作
