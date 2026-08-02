# 可视化指令协议 v1

本文件定义 **AI 对话**与**可视化引擎**之间的桥接协议。

当用户在对话中提出需要可视化的请求时（如「画一下 sin(x)」「展示导数的切线」），
AI 除返回文字解释外，还应输出一个 ` ```viz ` 围栏代码块，内部是一个符合本协议的
JSON **scene** 对象。前端识别围栏、解析 JSON、校验后调用 `VIZ.execute(scene)` 渲染。

> 设计目标：让 LLM 用结构化输出驱动图形，而非让前端解析自然语言。

---

## 1. Scene 结构

```json
{
  "protocol": "v1",
  "axes": { "xRange": [-6, 6], "yRange": [-4, 4] },
  "layers": [ { "type": "plot", "fn": "sin(x)" } ]
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `protocol` | 否 | 协议版本，当前 `"v1"`。缺失视为 v1 |
| `axes` | 否 | 坐标系配置。省略则用默认范围 `[-6,6]×[-4,4]` |
| `layers` | **是** | 图层数组，按顺序绘制（后绘制在上层） |
| `timeline` | 否 | 动画配置（AI 通常只产 duration，animate 函数由前端注入） |

### axes 字段
```json
{ "xRange": [-5, 5], "yRange": [-3, 3], "grid": true, "axis": true, "labels": true }
```
- `xRange` / `yRange`：`[min, max]` 两个数字，定义可视数学范围
- `grid` / `axis` / `labels`：布尔，控制网格、坐标轴、刻度标签是否绘制（默认全 true）

---

## 2. Layer 类型

每个 layer 是一个对象，至少含 `type` 字段。下面列出各类型及其字段。

### `plot` — 函数曲线
```json
{ "type": "plot", "fn": "sin(x)", "color": "#4f9cf9", "lineWidth": 2.5, "range": [-6, 6], "samples": 200 }
```
- `fn`（必填）：表达式字符串。变量为 `x`。支持 `+ - * / ^ %`、括号、
  函数 `sin cos tan asin acos atan sinh cosh tanh exp ln log sqrt abs floor ceil round sign`、
  常量 `pi e`。例：`"sin(x) * exp(-x^2/4)"`、`"x^2/4 - 1"`
- `color`：CSS 颜色字符串
- `range`：绘制区间 `[a, b]`，默认覆盖整个 xRange
- `samples`：采样点数，越多越平滑（默认按画布宽度）

### `point` — 标记点
```json
{ "type": "point", "x": 1, "y": 1, "radius": 5, "color": "#ff8c42", "label": "P" }
```
- `x` / `y`：坐标（默认 0,0）
- `label`：可选文字标注

### `tangent` — 切线
```json
{ "type": "tangent", "fn": "x^2", "at": 1, "color": "#ff8c42", "dashed": true }
```
- `fn`（必填）：原函数表达式
- `at`：切点的 x 坐标（默认 0）
- `dashed`：是否虚线（默认 true）
- 引擎用数值求导计算斜率，并标出切点

### `riemann` — 黎曼矩形
```json
{ "type": "riemann", "fn": "x^2", "range": [0, 1], "n": 10, "mode": "mid", "color": "rgba(74,222,128,0.35)" }
```
- `fn`（必填）：被积函数
- `range`：积分区间 `[a, b]`
- `n`：矩形数量（≥1）
- `mode`：取样方式 `"left"` / `"right"` / `"mid"`

### `taylor` — 泰勒多项式逼近
```json
{ "type": "taylor", "fn": "sin(x)", "at": 0, "order": 5, "color": "#9d7aff" }
```
- `fn`（必填）：原函数
- `at`：展开点 x₀（默认 0）
- `order`：阶数（0-12）
- 引擎用数值求各阶导，叠加绘制多项式

### `line` — 任意线段
```json
{ "type": "line", "from": [0, 0], "to": [2, 2], "color": "#9aa7b4", "dashed": false }
```

### `text` — 标注文字
```json
{ "type": "text", "x": 2, "y": 1, "text": "极大值", "color": "#e6edf3", "fontSize": 14 }
```

### `clear` — 清空画布（特殊层）
```json
{ "type": "clear" }
```
绘制时清空整个画布（不画图形）。用于在复杂动画中重置。

### `vectorField` — 向量场
```json
{ "type": "vectorField", "dx": "-y", "dy": "x", "nx": 12, "ny": 8, "color": "#9d7aff" }
```
- `dx` / `dy`：分量表达式，变量为 `x` 和 `y`（第二变量）。例：`"-y"`、`"x"`、`"sin(x)*cos(y)"`
- `nx` / `ny`：网格采样密度（默认 12×8）
- 用于展示微分方程方向场、梯度场。箭头长度按模长归一化。

### `areaFill` — 面积填充
```json
{ "type": "areaFill", "fn": "sin(x)", "range": [0, 3.14159], "color": "rgba(74,222,128,0.25)" }
```
- `fn`（必填）：函数表达式
- `range`：填充区间 `[a, b]`
- 比 `riemann` 更适合展示"真实面积"（连续填充），引擎同时返回数值积分结果

### `parametric` — 参数曲线
```json
{ "type": "parametric", "fx": "2*cos(t)", "fy": "2*sin(t)", "tRange": [0, 6.2832], "samples": 240, "color": "#4f9cf9" }
```
- `fx` / `fy`（必填）：x、y 关于参数 `t` 的表达式。支持 sin/cos/exp/t 等
- `tRange`：参数范围 `[tMin, tMax]`，默认 `[0, 2π]`
- 用于绘制圆、椭圆、利萨如曲线等闭合或参数化轨迹（`plot` 只能画 y=f(x)，无法画闭合曲线）

### `contour` — 等高线
```json
{ "type": "contour", "fn": "x^2 + y^2", "levels": [1, 4, 9, 16], "nx": 60, "ny": 40, "color": "#9d7aff", "opacity": 0.7 }
```
- `fn`（必填）：二元函数表达式，变量为 `x` 和 `y`。例：`"x^2+y^2"`、`"sin(x)*cos(y)"`
- `levels`：要画的等高线高度值数组。每条线是 `{(x,y) : f(x,y) = level}`
- `nx` / `ny`：采样网格密度（默认 60×40）
- 用 marching squares 算法绘制。用于多元函数地形图（偏导/梯度/二重积分）

---

## 3. 输出格式（给 AI 的约束）

当需要可视化时，在回答的合适位置插入一个围栏代码块：

````markdown
下面是 $f(x)=\sin(x)$ 的图像与在 $x=1$ 处的切线：

```viz
{
  "protocol": "v1",
  "axes": { "xRange": [-6, 6], "yRange": [-2, 2] },
  "layers": [
    { "type": "plot", "fn": "sin(x)", "color": "#4f9cf9" },
    { "type": "tangent", "fn": "sin(x)", "at": 1, "color": "#ff8c42" }
  ]
}
```

可以看到切线斜率约为 $\cos(1)\approx 0.540$。
````

**规则**：
1. 围栏语言标记**必须**是 `viz`（三个反引号后紧跟 `viz`）
2. 围栏内**必须**是合法 JSON（不能有注释、尾逗号）
3. 一个回答中可以出现**多个** viz 围栏，会按顺序执行（后者替换前者，除非显式保留）
4. 不需要可视化时**不要**输出 viz 围栏，正常用 `$...$` / `$$...$$` 写公式即可

---

## 4. 校验与容错

前端对每个 viz 围栏做两步校验：

1. **JSON 解析**：非法 JSON → 围栏位置显示「指令格式错误，已跳过」，不中断对话
2. **协议校验**：缺 `layers`、layer 缺 `type`、未知 `type` 等致命错误 → 显示字段级明细
   （如 `$.layers[0].type: 缺少 type 字段`），不执行该 scene

非致命问题（如未知可选字段、协议版本不符）只警告不阻塞。

---

## 5. 完整示例

### 示例 1：导数几何意义
```json
{
  "protocol": "v1",
  "axes": { "xRange": [-1, 4], "yRange": [-1, 6] },
  "layers": [
    { "type": "plot", "fn": "x^2", "color": "#4f9cf9" },
    { "type": "tangent", "fn": "x^2", "at": 2, "color": "#ff8c42" },
    { "type": "point", "x": 2, "y": 4, "label": "(2,4)" }
  ]
}
```

### 示例 2：黎曼和逼近积分
```json
{
  "protocol": "v1",
  "axes": { "xRange": [-0.5, 2.5], "yRange": [-0.5, 4] },
  "layers": [
    { "type": "riemann", "fn": "x^2", "range": [0, 2], "n": 8, "mode": "mid" },
    { "type": "plot", "fn": "x^2", "color": "#4f9cf9" }
  ]
}
```

### 示例 3：泰勒展开
```json
{
  "protocol": "v1",
  "axes": { "xRange": [-4, 4], "yRange": [-2, 2] },
  "layers": [
    { "type": "plot", "fn": "sin(x)", "color": "#4f9cf9" },
    { "type": "taylor", "fn": "sin(x)", "at": 0, "order": 5, "color": "#9d7aff" },
    { "type": "taylor", "fn": "sin(x)", "at": 0, "order": 9, "color": "#9d7aff" }
  ]
}
```

---

## 6. 扩展

新增 layer 类型需在 `js/viz/primitives.js` 注册 handler，并在
`js/viz/protocol.js` 的 `LAYER_SPECS` 添加字段约束，最后在本文件补充说明。
