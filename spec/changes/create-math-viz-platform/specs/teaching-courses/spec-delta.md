# 规范差异：预设课案

本文件定义对 `spec/specs/teaching-courses/spec.md` 的规范变更。
该能力为全新引入，所有需求均为 ADDED。

## ADDED 需求

### Requirement: 课案数据结构
WHEN 定义一个课案，
系统 SHALL 以统一数据结构描述：`{id, title, summary, coverSVG, steps[]}`，
其中每 step 含 `{title, narrative (KaTeX 文本), scene, controls?[]}`。

#### Scenario: 课案数据完整
GIVEN 课案对象 `derivative`
THEN 它 SHALL 含 id="derivative"
AND title 为非空字符串
AND steps 为非空数组
AND 每个 step 含 narrative 与 scene 两字段

#### Scenario: 步骤缺字段被拒绝
GIVEN 一个 step 缺少 scene 字段
WHEN 课案加载时校验
THEN 系统 SHALL 拒绝加载并提示 "步骤缺少 scene：步骤 N"

---

### Requirement: 课案通用框架
WHEN 用户进入任意课案路由 `#/course/<id>`，
系统 SHALL 用通用框架渲染：标题区、KaTeX 叙事区、可视化画布区、步骤条、控件栏。

#### Scenario: 课案页布局
GIVEN 用户访问 `#/course/derivative`
THEN 页面 SHALL 显示课案标题
AND 显示当前步骤的叙事文本（含已渲染 KaTeX）
AND 显示可视化画布（已 execute 当前 step 的 scene）
AND 显示步骤条与控件栏

#### Scenario: 步骤切换
GIVEN 用户在课案页 step 2
WHEN 点击步骤条的 step 3
THEN 叙事区更新为 step 3 文本
AND 画布 clear 后 execute step 3 的 scene
AND 步骤条高亮移到 step 3

---

### Requirement: 参数控件双向绑定
WHEN step 配置了 `controls`（如滑块 n、order、x0），
系统 SHALL 渲染对应控件，并将控件值绑定到 scene 的对应参数，拖动时实时重绘。

#### Scenario: 滑块拖动重绘
GIVEN 当前 step 含控件 `{name:"n", min:1, max:200, value:10}`
WHEN 用户将 n 拖到 50
THEN 画布立即以 n=50 重绘黎曼矩形
AND 拖动过程中帧率不低于 30fps（桌面端）

#### Scenario: 控件值越界
GIVEN 控件 min=1 max=200
WHEN 外部尝试设置 n=500
THEN 系统 SHALL 钳制到 200
AND 在 console 提示值被钳制

---

### Requirement: 课案 1 — 极限与连续
系统 SHALL 提供课案 `limit`，通过分步可视化呈现数列极限、函数极限的 ε-δ 定义、
连续与间断的对比。

#### Scenario: ε-δ 双带可视化
GIVEN 课案 limit 的 ε-δ 步骤
WHEN 用户调节 ε 滑块
THEN 画布 SHALL 显示水平 ε 带与对应 δ 带
AND 当 ε 减小时 δ 同步收窄
AND 在 narrative 中用 KaTeX 显示当前 ε、δ 数值

#### Scenario: 间断点对比
GIVEN limit 课案的间断对比步骤
WHEN 显示 step
THEN 画布同时呈现连续函数与含跳跃间断的函数
AND narrative 解释二者在极限存在性上的差异

---

### Requirement: 课案 2 — 导数与微分
系统 SHALL 提供课案 `derivative`，可视化平均变化率的割线、h→0 割线转切线的过程、
dy/dx 的几何意义。

#### Scenario: 割线转切线动画
GIVEN derivative 课案的割线步骤
WHEN 用户播放动画或拖动 h 滑块从 1 → 0
THEN 画布 SHALL 显示割线随 h 减小逐渐旋转贴合为切线
AND 切点高亮显示
AND narrative 实时显示当前割线斜率数值趋近导数值

#### Scenario: 高阶导数
GIVEN derivative 课案的高阶导数步骤
WHEN 用户切换 1 阶/2 阶/3 阶
THEN 画布 SHALL 显示对应阶导函数曲线
AND narrative 解释其几何含义

---

### Requirement: 课案 3 — 积分与黎曼和
系统 SHALL 提供课案 `integral`，通过黎曼矩形细分逼近定积分面积，可视化 n→∞ 的收敛。

#### Scenario: n 增大逼近面积
GIVEN integral 课案的黎曼和步骤
WHEN 用户将 n 从 4 增大到 200
THEN 画布 SHALL 重绘对应数量矩形
AND 显示矩形面积之和的数值
AND 该数值随 n 增大趋近真实定积分值（误差 < 1% 当 n≥100）

#### Scenario: 取样模式切换
GIVEN 黎曼和步骤
WHEN 用户在左/右/中点模式间切换
THEN 矩形取值点改变
AND 中点模式在同等 n 下误差明显更小（narrative 给出数值对比）

---

### Requirement: 课案 4 — 泰勒级数
系统 SHALL 提供课案 `taylor`，可视化多项式阶数递增时对原函数的逐次逼近，
并直觉呈现收敛半径的概念。

#### Scenario: 阶数递增逼近
GIVEN taylor 课案的逐阶叠加步骤
WHEN 用户将 order 从 0 增大到 10
THEN 画布 SHALL 叠加绘制 0..order 阶多项式（颜色渐变区分）
AND 高阶多项式在展开点附近更贴合原函数

#### Scenario: 收敛半径直觉
GIVEN taylor 课案以 f=ln(1+x) 为例
WHEN order 持续增大
THEN 画布 SHALL 显示在 |x|<1 区间逼近越来越好
AND 在 |x|>1 区间多项式发散偏离
AND narrative 用 KaTeX 给出收敛半径 R=1

---

### Requirement: 课案总览首页
WHEN 用户访问首页 `#/home`，
系统 SHALL 显示四张课案卡片（封面、标题、简介）与通往 AI 对话、设置的入口。

#### Scenario: 首页卡片导航
GIVEN 用户访问 #/home
THEN 页面 SHALL 显示 4 张课案卡片
AND 每卡含封面 SVG、标题、简介、"进入"按钮
AND 卡片点击跳转到 `#/course/<id>`

#### Scenario: 首页入口完整
GIVEN 首页已加载
THEN 页面 SHALL 含"AI 对话"与"设置"两个入口
AND 二者可分别跳转到 #/chat 与 #/settings

---

### Requirement: 课案可扩展性
WHEN 内容作者新增一个课案，
系统 SHALL 仅通过在 `js/data/courses/` 下新增一个遵循课案数据结构的文件并注册到首页，
即可在不改动引擎与框架代码的前提下让其可用。

#### Scenario: 新增课案零引擎改动
GIVEN 引擎与 course.js 框架已实现
WHEN 作者新增 `js/data/courses/series.js` 并在首页注册
THEN 该课案可通过 `#/course/series` 访问
AND 无需修改 js/viz/ 下任何文件
