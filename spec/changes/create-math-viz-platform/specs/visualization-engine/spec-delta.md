# 规范差异：可视化引擎

本文件定义对 `spec/specs/visualization-engine/spec.md` 的规范变更。
该能力为全新引入，所有需求均为 ADDED。

## ADDED 需求

### Requirement: 引擎独立可用
WHEN 任意页面挂载一个 Canvas 元素并调用 `VIZ.mount(canvas)`，
系统 SHALL 初始化一个独立可视化舞台，支持后续 execute / clear / play / pause / seek 调用。

#### Scenario: 挂载并清理
GIVEN 一个空白的 `<canvas id="cv">`
WHEN 调用 `VIZ.mount(cv)` 后再调用 `VIZ.clear()`
THEN 画布恢复空白背景
AND 不抛出任何异常

#### Scenario: 重复挂载
GIVEN 引擎已挂载到画布 A
WHEN 再次调用 `VIZ.mount(canvasB)`
THEN 引擎 SHALL 释放画布 A 的资源（取消 rAF 循环）
AND 在画布 B 上重新初始化
AND 不产生两个并行渲染循环

---

### Requirement: 高 DPR 清晰渲染
WHERE 目标设备 `devicePixelRatio > 1`，
系统 SHALL 按 DPR 缩放 Canvas 后缓冲区并在 CSS 像素坐标下绘制，使图像在视网膜屏不模糊。

#### Scenario: 视网膜屏清晰
GIVEN `devicePixelRatio === 2` 的设备
WHEN 引擎绘制一条曲线
THEN Canvas 的实际像素尺寸为 CSS 尺寸的 2 倍
AND 曲线边缘无可见锯齿模糊

#### Scenario: 窗口缩放适配
GIVEN 引擎已挂载
WHEN 浏览器窗口尺寸改变
THEN 系统 SHALL 重新计算后缓冲区尺寸
AND 重绘当前场景且不丢失已绘制内容

---

### Requirement: 笛卡尔坐标系
WHEN 传入配置 `{xRange:[-5,5], yRange:[-3,3], grid:true}`，
系统 SHALL 绘制带刻度、网格与轴标签的笛卡尔坐标系作为绘图底层。

#### Scenario: 标准坐标系
GIVEN xRange [-5,5]、yRange [-3,3]
WHEN 执行 scene.axes 配置
THEN 画布显示横纵坐标轴、原点 0、整数刻度标签
AND 网格线以浅色绘制于数据层之下

#### Scenario: 自定义范围
GIVEN xRange [0, 10]、yRange [-1, 1]
WHEN 执行 scene.axes 配置
THEN 坐标轴仅覆盖指定范围
AND 刻度密度自适应（0, 2, 4, 6...）

---

### Requirement: 绘图原语集
系统 SHALL 提供以下基础绘图原语，每个原语作为 scene.layers 数组中的一项：

- `plot`：绘制函数曲线 `y = f(x)`
- `point`：标记坐标点
- `tangent`：在某点绘制函数的切线
- `riemann`：在区间 `[a,b]` 上用 n 个矩形（左/右/中点）逼近函数面积
- `taylor`：在某点用给定阶数绘制泰勒多项式逼近函数

#### Scenario: 函数曲线绘制
GIVEN scene.layers 含 `{type:"plot", fn:"sin(x)", color:"#3b82f6"}`
WHEN 执行 scene
THEN 画布在当前坐标系内绘制 sin(x) 曲线
AND 曲线平滑无断点

#### Scenario: 切线绘制
GIVEN scene.layers 含 `{type:"tangent", fn:"x^2", at:1}`
WHEN 执行 scene
THEN 在 x=1 处绘制 y=2x 的切线段
AND 标记切点 (1,1)

#### Scenario: 黎曼矩形
GIVEN scene.layers 含 `{type:"riemann", fn:"x^2", range:[0,1], n:10, mode:"left"}`
WHEN 执行 scene
THEN 画布显示 10 个左端点取值的矩形
AND 各矩形高度对应函数值

#### Scenario: 泰勒多项式叠加
GIVEN scene.layers 含 `{type:"taylor", fn:"sin(x)", at:0, order:5}`
WHEN 执行 scene
THEN 画布绘制 sin(x) 及其 5 阶泰勒逼近多项式
AND 二者用不同颜色区分

---

### Requirement: 未知原语类型容错
WHEN scene.layers 中出现引擎不识别的 `type` 值，
系统 SHALL 跳过该层并在控制台输出警告，而不中断整次渲染。

#### Scenario: 未知类型跳过
GIVEN scene.layers 含 `{type:"hologram", ...}`（引擎不支持的类型）
WHEN 执行 scene
THEN 引擎 SHALL 跳过该层
AND 在 console.warn 输出 "Unknown layer type: hologram"
AND 同 scene 内其余合法层正常绘制

---

### Requirement: 时间轴驱动的动画
WHEN scene 含 `timeline: {duration, keyframes}`，
系统 SHALL 提供播放、暂停、重播、seek(进度) 接口，并按缓动函数在关键帧间插值。

#### Scenario: 播放动画
GIVEN scene.timeline.duration = 2000ms 且含关键帧
WHEN 调用 `VIZ.play()`
THEN 画布在 2000ms 内按缓动函数呈现参数变化
AND 到达终点自动停止

#### Scenario: seek 跳转
GIVEN 动画总时长 2000ms
WHEN 调用 `VIZ.seek(0.5)`
THEN 画布立即渲染第 1000ms（进度 50%）的中间状态
AND 动画暂停在该位置

#### Scenario: 不可见时暂停
GIVEN 动画正在播放
WHEN 页面切换到后台标签页（visibilitychange → hidden）
THEN 系统 SHALL 自动暂停 rAF 循环
AND 可见后恢复时从暂停处继续

---

### Requirement: 可视化指令协议
系统 SHALL 定义并实现一套 JSON 指令协议，使外部调用方（含 AI 对话层）能以
结构化 JSON 描述一个完整 scene 并交由引擎执行。

协议要求：
- 每个 scene 是一个 JSON 对象，含 `axes`、`layers`（可选 `timeline`）字段
- `layers` 是数组，每项含 `type` 与对应原语的 `props`
- 指令以 ```viz 围栏代码块在文本流中标识
- 协议版本号字段 `protocol`（初版 `"v1"`）用于未来兼容

#### Scenario: 合法指令执行
GIVEN 文本流中出现完整 ```viz 围栏且内部为合法 JSON scene
WHEN 围栏闭合被识别
THEN 系统 SHALL 校验 JSON 通过后调用 `VIZ.execute(scene)`
AND 在画布上呈现对应图形

#### Scenario: 非法 JSON 跳过
GIVEN ```viz 围栏内为损坏的 JSON（如缺引号、缺括号）
WHEN 围栏闭合被识别
THEN 系统 SHALL 不抛异常
AND 在对话气泡内显示"指令格式错误，已跳过"
AND 不执行任何画布操作

#### Scenario: 校验失败但 JSON 合法
GIVEN ```viz 围栏内是合法 JSON 但缺少必填字段（如 layer 无 type）
WHEN 校验器运行
THEN 系统 SHALL 返回字段级错误明细
AND 显示给用户"指令字段缺失：layers[0].type"
AND 不执行该 scene

---

### Requirement: 引擎全局接口
系统 SHALL 暴露单一全局对象 `window.VIZ` 作为对外接口，提供至少以下方法：
`mount(canvas)`、`execute(scene)`、`clear()`、`play()`、`pause()`、`seek(progress)`。

#### Scenario: 全局可用
WHEN 在浏览器控制台输入 `window.VIZ`
THEN 返回一个对象
AND 该对象包含上述所有方法为可调用函数

#### Scenario: 未挂载先调用
GIVEN 引擎尚未 mount
WHEN 调用 `VIZ.execute(scene)`
THEN 系统 SHALL 抛出明确错误 "VIZ not mounted"
AND 不产生未定义行为
