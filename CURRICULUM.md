# 课程大纲（参照北京大学《高等数学》/《数学分析》体系）

> 覆盖范围：函数与极限 → 一元微积分 → 多元微积分 → 级数与微分方程 → 曲面论初步
> 大致对应大一全学年 + 大二上学期。
> 每节标注对应的课案 id 与状态：✅ 已完成 / 🚧 计划中 / ❌ 尚未规划。
> 配套：每套课案都有可视化交互；练习题库（`#/practice`）与模拟考试（`#/exam`）覆盖已完成课案。
> 最后更新：2026-08-02（v0.1.9）

## 第一篇 函数、极限、连续（大一上 §1）

### 第 1 章 函数
- 1.1 函数概念与表示 — ✅ `intro` 步骤 2（函数=输入输出机器）
- 1.2 函数的几类特性（有界/单调/奇偶/周期）— 🚧 `function-properties`
- 1.3 反函数与复合函数 — 🚧 `inverse-composite`
- 1.4 初等函数（幂/指/对/三角/反三角）— 🚧 `elementary-functions`
- 1.5 极坐标与参数方程 — 🚧 `polar-parametric`（用 parametric 原语）

### 第 2 章 极限与连续
- 2.1 数列极限 — ✅ `limit` 步骤 1
- 2.2 函数极限 — ✅ `limit` 步骤 2
- 2.3 极限的运算（四则/复合/夹逼）— ✅ `limit-laws`（夹逼、等价无穷小、复合极限）
- 2.4 单调有界原理与重要极限 — ✅ `limit` 步骤 4（sin(x)/x）
- 2.5 无穷小与无穷大的比较 — 🚧 `infinitesimals`（o(x)/O(x)/等价无穷小）
- 2.6 连续与间断 — ✅ `limit` 步骤 3
- 2.7 闭区间上连续函数的性质（最值/介值/有界）— 🚧 `cv-continuity`

## 第二篇 一元函数微分学（大一上 §2）

### 第 3 章 导数与微分
- 3.1 导数概念 — ✅ `derivative` 步骤 1-2
- 3.2 求导法则（四则/链式/反函数）— ✅ `derivative-rules`
- 3.3 高阶导数 — ✅ `derivative` 步骤 4
- 3.4 隐函数与参数方程求导 — 🚧 `implicit-derivative`
- 3.5 微分及其应用 — 🚧 `differential`

### 第 4 章 微分中值定理与应用
- 4.1 罗尔/拉格朗日/柯西中值定理 — ✅ `mean-value-theorem`
- 4.2 洛必达法则 — ✅ `lhopital`
- 4.3 泰勒公式 — ✅ `taylor`（全部 4 步）
- 4.4 函数单调性与极值 — 🚧 `monotonicity-extrema`
- 4.5 函数凹凸与拐点 — ✅ `convexity`
- 4.6 曲率 — 🚧 `curvature`
- 4.7 方程近似解（牛顿法）— 🚧 `newtons-method`

## 第三篇 一元函数积分学（大一下 §1）

### 第 5 章 不定积分
- 5.1 不定积分概念与性质 — ✅ `indefinite-integral`
- 5.2 换元积分法 — ✅ `indefinite-integral` 步骤 3
- 5.3 分部积分法 — ✅ `indefinite-integral` 步骤 4
- 5.4 有理函数积分 — 🚧 `rational-integral`

### 第 6 章 定积分与应用
- 6.1 定积分概念（黎曼和）— ✅ `integral` 步骤 1-2
- 6.2 微积分基本定理（牛顿-莱布尼茨）— ✅ `integral` 步骤 4
- 6.3 定积分的换元与分部 — 🚧 `definite-integral-techniques`
- 6.4 反常积分（无穷区间/无界函数）— 🚧 `improper-integral`
- 6.5 定积分应用（面积/体积/弧长/旋转体）— ✅ `integral-applications`

## 第四篇 无穷级数（大一下 §2）

### 第 7 章 数项级数
- 7.1 常数项级数概念与性质 — ✅ `series-basics`
- 7.2 正项级数审敛法（比较/比值/根值）— ✅ `positive-series`
- 7.3 交错级数与莱布尼茨判别法 — 🚧 `alternating-series`
- 7.4 绝对收敛与条件收敛 — 🚧 `absolute-convergence`

### 第 8 章 函数项级数
- 8.1 函数项级数的一致收敛 — 🚧 `uniform-convergence`
- 8.2 幂级数与收敛半径 — ✅ `taylor` 步骤 3（收敛半径直觉）
- 8.3 泰勒级数展开 — ✅ `taylor`（全部）
- 8.4 傅里叶级数 — ✅ `fourier-series`

## 第五篇 多元函数微分学（大二上 §1）

### 第 9 章 多元函数微分
- 9.1 多元函数概念（区域/极限/连续）— 🚧 `multivariable-basics`
- 9.2 偏导数 — ✅ `partial-derivative`
- 9.3 全微分 — 🚧 `total-differential`
- 9.4 复合函数与隐函数求导（多元）— 🚧 `multivariable-chain-rule`
- 9.5 方向导数与梯度 — ✅ `gradient`
- 9.6 多元极值（含拉格朗日乘数法）— ✅ `lagrange-multiplier`

### 第 10 章 重积分
- 10.1 二重积分概念与计算 — ✅ `double-integral`
- 10.2 二重积分换元（极坐标）— ✅ `double-integral` 步骤 4
- 10.3 三重积分 — 🚧 `triple-integral`

### 第 11 章 曲线积分与曲面积分
- 11.1 第一型曲线积分（对弧长）— 🚧 `line-integral-type1`
- 11.2 第二型曲线积分（对坐标）— 🚧 `line-integral-type2`
- 11.3 格林公式 — 🚧 `greens-theorem`
- 11.4 第一型曲面积分 — 🚧 `surface-integral-type1`
- 11.5 第二型曲面积分 — 🚧 `surface-integral-type2`
- 11.6 高斯公式与斯托克斯公式 — 🚧 `gauss-stokes`

## 第六篇 常微分方程（贯穿大一下）

### 第 12 章 常微分方程
- 12.1 基本概念 — ✅ `ode`（全部）
- 12.2 一阶方程（可分离/齐次/线性）— 🚧 `first-order-ode`
- 12.3 二阶常系数线性方程 — 🚧 `second-order-ode`
- 12.4 方向场与相平面（几何视角）— ✅ `ode` 步骤 3-4

## 第七篇 曲面论初步（大二上 拓展）

### 第 13 章 曲面论初步
- 13.1 曲面的参数表示 — 🚧 `surface-parametric`
- 13.2 第一基本形式（弧长/面积/夹角）— 🚧 `first-fundamental-form`
- 13.3 第二基本形式（曲率/法曲率）— 🚧 `second-fundamental-form`
- 13.4 高斯曲率与平均曲率 — 🚧 `gaussian-curvature`
- 13.5 测地线初步 — 🚧 `geodesics`

---

## 进度统计
- ✅ 已完成：20 套（... partial-derivative / gradient / double-integral / lagrange-multiplier）
- 🚧 计划中：约 30 套
- 配套题库：74 题，覆盖全部 20 套课案；考试支持综合卷 + 单章卷
- 🎯 批次 1（一元主线）+ 批次 2（一元进阶）完成；下一步批次 3（多元微积分）
- ❌ 尚未规划：暂无（大纲已覆盖到曲面论初步）
- 🎯 批次 1 完成（一元微积分主线）

## 分阶段实施建议
按知识依赖与教学价值排序，优先补完以下批次（每批 4-6 套）：

- **批次 1（补全一元微积分主线）**：limit-laws / derivative-rules / mean-value-theorem / indefinite-integral / series-basics
- **批次 2（一元进阶）**：lhopital / convexity / integral-applications / positive-series / fourier-series
- **批次 3（多元入门）**：multivariable-basics / partial-derivative / gradient / double-integral
- **批次 4（多元进阶 + 场论）**：lagrange-multiplier / line-integral / greens-theorem / gauss-stokes
- **批次 5（曲面论初步）**：surface-parametric / first-fundamental-form / gaussian-curvature / geodesics

> 本大纲是活文档，每次新增课案后更新对应行的状态与版本号。
