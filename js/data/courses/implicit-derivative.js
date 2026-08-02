/**
 * mathviz — js/data/courses/implicit-derivative.js
 * 课案：隐函数与参数方程求导（§3.4）。
 *
 * 四步：
 *   1. 隐函数概念        x²+y²=1 不能解出单一的 y
 *   2. 隐函数求导法      两边对 x 求导，把 y 视为 y(x)
 *   3. 参数方程求导      dy/dx = (dy/dt)/(dx/dt)
 *   4. 对数求导法        y=x^x 取 ln 后两边求导
 *
 * 设计：onControl 直接 mutate scene.layers[i]。表达式幂用 ^，变量为 x（plot）/ t（parametric）。
 *   颜色：蓝 #4f9cf9 主曲线、橙 #ff8c42 上支/切线、紫 #9d7aff 下支、绿 #4ade80 观察点。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';
  var ORANGE = '#ff8c42';
  var PURPLE = '#9d7aff';
  var GREEN = '#4ade80';

  var course = {
    id: 'implicit-derivative',
    title: '隐函数与参数方程求导',
    summary: '当 y 解不出来——两边求导、参数化、取对数，三招破解非显式函数的导数。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="100" y1="22" x2="100" y2="90" stroke="#3a4452" stroke-width="0.8"/><line x1="55" y1="56" x2="145" y2="56" stroke="#3a4452" stroke-width="0.8"/><circle cx="100" cy="56" r="32" fill="none" stroke="#4f9cf9" stroke-width="2.2"/><line x1="66" y1="40" x2="134" y2="72" stroke="#ff8c42" stroke-width="2"/><circle cx="84" cy="48" r="3.5" fill="#4ade80"/><text x="100" y="104" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">隐函数求导</text></svg>',

    steps: [
      // ===== Step 1：隐函数概念 =====
      {
        title: '隐函数概念',
        narrative: `显式函数把 $y$ 直接写成 $y = f(x)$，一个 $x$ 唯一对应一个 $y$。但很多曲线**没有这种表达**——$y$ 与 $x$ 一起藏在**一个方程**里，称为**隐函数**。最经典的例子是单位圆：

$$x^2 + y^2 = 1$$

若硬要解出 $y$，得 $y = \\pm\\sqrt{1 - x^2}$——**正负两个分支**：每给定一个 $x \\in [-1, 1]$，对应**两个 $y$**。这违反函数定义（一对一），所以圆整体上不是函数，只能拆成上下两支分别处理。

更糟的是，许多隐函数**根本解不出来**：$\\sin(xy) + e^{xy^2} = 0$、$x^3 + y^3 = 6xy$（笛卡尔叶形线）。它们仍定义一条曲线——所有满足方程的点 $(x,y)$ 的集合——只是无法写成 $y = f(x)$。

**怎么办？** 绕过"解出 $y$"，直接对方程**两边关于 $x$ 求导**，把 $y$ 当作 $x$ 的函数 $y(x)$，用链式法则处理含 $y$ 的项。这就是下一页的**隐函数求导法**。

右侧蓝色是单位圆，橙色/紫色分别是上下两支。拖动 $x$ 滑块，注意垂直切片（绿色）同时穿过两个点——这正是"隐函数无法简化为单一 $y$"的几何真相。`,

        scene: {
          axes: { xRange: [-1.5, 1.5], yRange: [-1.5, 1.5] },
          layers: [
            // 单位圆（整体）x=cos t, y=sin t
            { type: 'parametric', fx: 'cos(t)', fy: 'sin(t)', tRange: [0, 6.2832], samples: 200, color: BLUE, lineWidth: 2.5 },
            // 上半支 y=sqrt(1-x^2)
            { type: 'plot', fn: 'sqrt(1-x^2)', range: [-1, 1], color: ORANGE, lineWidth: 1.6, opacity: 0.55 },
            // 下半支 y=-sqrt(1-x^2)
            { type: 'plot', fn: '-sqrt(1-x^2)', range: [-1, 1], color: PURPLE, lineWidth: 1.6, opacity: 0.55 },
            // 垂直切片线（默认 x=0.5）
            { type: 'line', from: [0.5, -0.866], to: [0.5, 0.866], color: GREEN, lineWidth: 1.8, dashed: true },
            // 上点
            { type: 'point', x: 0.5, y: 0.866, color: ORANGE, radius: 5, label: '上' },
            // 下点
            { type: 'point', x: 0.5, y: -0.866, color: PURPLE, radius: 5, label: '下' },
            // 坐标轴参考
            { type: 'line', from: [-1.4, 0], to: [1.4, 0], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'line', from: [0, -1.4], to: [0, 1.4], color: '#3a4452', lineWidth: 1, dashed: true },
            // 标注
            { type: 'text', x: -1.45, y: 1.35, text: 'x²+y²=1：一个 x → 两个 y', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -1.45, y: 1.10, text: 'x=0.50  →  y=±0.87', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -0.95, max: 0.95, step: 0.05, value: 0.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x = value;
          var yu = Math.sqrt(Math.max(0, 1 - x * x));
          var yl = -yu;
          // 垂直切片
          scene.layers[3].from = [x, yl];
          scene.layers[3].to = [x, yu];
          // 上下两点
          scene.layers[4].x = x; scene.layers[4].y = yu;
          scene.layers[5].x = x; scene.layers[5].y = yl;
          // 读数
          scene.layers[9].text = 'x=' + x.toFixed(2) + '  →  y=±' + yu.toFixed(2);
        },
      },

      // ===== Step 2：隐函数求导法 =====
      {
        title: '隐函数求导法',
        narrative: `核心招式：**方程两边同时关于 $x$ 求导**，过程中把 $y$ 当作 $y(x)$，凡遇到 $y$ 就用链式法则多乘一个 $y'$。

以 $x^2 + y^2 = 1$ 为例，两边对 $x$ 求导：

$$\\frac{d}{dx}(x^2 + y^2) = \\frac{d}{dx}(1)$$
$$2x + 2y \\cdot y' = 0$$

注意 $y^2$ 项：外层平方求导得 $2y$，再乘 $y'$（链式——$y$ 也是 $x$ 的函数）。解出：

$$y' = -\\frac{x}{y}$$

漂亮——切线斜率直接用**当前点的坐标**表出，无需先把 $y$ 解出来。

**通用流程**：(1) 两边对 $x$ 求导；(2) 凡见 $y$，乘 $y'$；(3) 收集含 $y'$ 的项，解出 $y'$。方程再复杂（$\\sin(xy) + \\ln y = x$）步骤都一样机械。

右侧蓝色圆上绿色点处，橙色切线斜率恰好为 $-x/y$。拖动 $\\theta$ 让点绕圆滑行：顶部（$y\\to 1$）斜率趋于 0（水平），右侧（$y\\to 0$）斜率趋于无穷（垂直切线）——与公式预测完全吻合。`,

        scene: {
          axes: { xRange: [-1.5, 1.5], yRange: [-1.5, 1.5] },
          layers: [
            // 单位圆
            { type: 'parametric', fx: 'cos(t)', fy: 'sin(t)', tRange: [0, 6.2832], samples: 200, color: BLUE, lineWidth: 2.5 },
            // 坐标轴
            { type: 'line', from: [-1.4, 0], to: [1.4, 0], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'line', from: [0, -1.4], to: [0, 1.4], color: '#3a4452', lineWidth: 1, dashed: true },
            // 观察点（默认 θ=0.8）
            { type: 'point', x: 0.697, y: 0.717, color: GREEN, radius: 6, label: 'P' },
            // 切线（默认 slope=-x/y=-0.97，半长 0.5）
            { type: 'line', from: [0.197, 1.203], to: [1.197, 0.231], color: ORANGE, lineWidth: 2.2 },
            // 半径线（原点到 P）
            { type: 'line', from: [0, 0], to: [0.697, 0.717], color: '#3a4452', lineWidth: 1, dashed: true },
            // 标注
            { type: 'text', x: -1.45, y: 1.35, text: "y' = -x/y = -0.97", color: ORANGE, fontSize: 12, align: 'left' },
            { type: 'text', x: -1.45, y: 1.10, text: "2x + 2y·y' = 0  ⇒  y' = -x/y", color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'theta', label: '点位置 θ（弧度）', type: 'slider', min: 0.3, max: 6.0, step: 0.05, value: 0.8 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'theta') return;
          var th = value;
          var px = Math.cos(th), py = Math.sin(th);
          var slope = -px / py;            // y' = -x/y
          var L = 0.5;
          // 观察点
          scene.layers[3].x = px; scene.layers[3].y = py;
          // 切线：y - py = slope·(x - px)
          scene.layers[4].from = [px - L, py - L * slope];
          scene.layers[4].to = [px + L, py + L * slope];
          // 半径线
          scene.layers[5].to = [px, py];
          // 标注
          scene.layers[6].text = "y' = -x/y = " + slope.toFixed(2);
        },
      },

      // ===== Step 3：参数方程求导 =====
      {
        title: '参数方程求导',
        narrative: `若曲线以**参数方程** $x = x(t),\\ y = y(t)$ 给出，怎样求 $\\frac{dy}{dx}$？不必消去 $t$ 化成 $y=f(x)$——直接套链式法则：

$$\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$$

直觉：$dy = (dy/dt)\\,dt$，$dx = (dx/dt)\\,dt$，相除 $dt$ 抵消。所以**切线斜率 = 两个分速度之比**。

以椭圆 $x = 2\\cos t,\\ y = 3\\sin t$ 为例：
$$\\frac{dx}{dt} = -2\\sin t, \\quad \\frac{dy}{dt} = 3\\cos t$$
$$\\frac{dy}{dx} = \\frac{3\\cos t}{-2\\sin t} = -\\frac{3}{2}\\cot t$$

斜率随 $t$ 变化，却无需把椭圆写成显式函数——参数形式直接给出答案。

注意：若 $\\frac{dx}{dt}=0$ 而 $\\frac{dy}{dt}\\neq 0$，斜率为无穷——此时切线竖直，参数法把"无穷"处理得比显式更优雅（不需要单独讨论）。

右侧蓝色椭圆上绿色点处，橙色切线斜率正是 $\\frac{dy/dt}{dx/dt}$。拖动 $t$ 让点沿椭圆滑行，注意切线方向如何随两个分速度 $dx/dt$、$dy/dt$ 的此消彼长而旋转——这就是参数求导的几何意义。`,

        scene: {
          axes: { xRange: [-2.8, 2.8], yRange: [-3.5, 3.5] },
          layers: [
            // 椭圆 x=2cos t, y=3sin t
            { type: 'parametric', fx: '2*cos(t)', fy: '3*sin(t)', tRange: [0, 6.2832], samples: 240, color: BLUE, lineWidth: 2.5 },
            // 坐标轴
            { type: 'line', from: [-2.6, 0], to: [2.6, 0], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'line', from: [0, -3.3], to: [0, 3.3], color: '#3a4452', lineWidth: 1, dashed: true },
            // 观察点（默认 t=0.8: x=1.394, y=2.151）
            { type: 'point', x: 1.394, y: 2.151, color: GREEN, radius: 6, label: 'P' },
            // 切线（默认 slope=-1.46，半长 0.6）
            { type: 'line', from: [0.794, 3.026], to: [1.994, 1.276], color: ORANGE, lineWidth: 2.2 },
            // 标注
            { type: 'text', x: -2.7, y: 3.25, text: 'x=2cos t,  y=3sin t', color: BLUE, fontSize: 12, align: 'left' },
            { type: 'text', x: -2.7, y: 2.95, text: "dx/dt=-1.43  dy/dt=2.09", color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.7, y: 2.65, text: "dy/dx = -1.46", color: ORANGE, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 't', label: '参数 t（弧度）', type: 'slider', min: 0.3, max: 6.0, step: 0.05, value: 0.8 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 't') return;
          var t = value;
          var px = 2 * Math.cos(t), py = 3 * Math.sin(t);
          var dxdt = -2 * Math.sin(t), dydt = 3 * Math.cos(t);
          var slope = dydt / dxdt;
          var L = 0.6;
          // 观察点
          scene.layers[3].x = px; scene.layers[3].y = py;
          // 切线
          scene.layers[4].from = [px - L, py - L * slope];
          scene.layers[4].to = [px + L, py + L * slope];
          // 标注
          scene.layers[6].text = 'dx/dt=' + dxdt.toFixed(2) + '  dy/dt=' + dydt.toFixed(2);
          scene.layers[7].text = 'dy/dx = ' + slope.toFixed(2);
        },
      },

      // ===== Step 4：对数求导法 =====
      {
        title: '对数求导法',
        narrative: `遇到**底和指数都含变量**的函数，如 $y = x^x$，它既不是幂函数（$x^a$）也不是指数函数（$a^x$），基本求导公式都失效。**对数求导法**是通用破解之道。

**第一步**，两边取自然对数（用 $\\ln(x^x) = x\\ln x$ 把幂"拉下来"）：

$$\\ln y = x \\ln x$$

**第二步**，两边关于 $x$ 求导（左边是 $y$ 的函数，用链式；右边用乘积法则）：

$$\\frac{1}{y} \\cdot y' = \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1$$

**第三步**，解出 $y'$ 并把 $y = x^x$ 代回：

$$y' = y(\\ln x + 1) = x^x(\\ln x + 1)$$

**何时用对数求导？** 底与指数都含变量（$x^x$、$(\\sin x)^{\\cos x}$），或多个因子的乘除幂（$\\frac{x^2\\sqrt{\\sin x}}{(1+x)^5}$）——取对数后乘变加、除变减、幂变乘，结构骤然清爽。

右侧蓝色是 $y = x^x$（$x>0$），绿色点处的橙色切线斜率恰为 $x^x(\\ln x + 1)$。拖动 $x$，注意 $x=1$ 处斜率恰好为 1（$\\ln 1=0$，$y'=1^1(0+1)=1$）——这是验证公式的好检查点。`,

        scene: {
          axes: { xRange: [-0.3, 2.5], yRange: [-1, 6] },
          layers: [
            // y = x^x
            { type: 'plot', fn: 'x^x', range: [0.1, 2.2], samples: 160, color: BLUE, lineWidth: 2.5 },
            // 坐标轴
            { type: 'line', from: [-0.2, 0], to: [2.4, 0], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'line', from: [0, -0.8], to: [0, 5.8], color: '#3a4452', lineWidth: 1, dashed: true },
            // 观察点（默认 x=1: y=1）
            { type: 'point', x: 1, y: 1, color: GREEN, radius: 6, label: 'P' },
            // 切线（默认 x=1: slope=1，半长 0.5）
            { type: 'line', from: [0.5, 0.5], to: [1.5, 1.5], color: ORANGE, lineWidth: 2.2 },
            // 标注
            { type: 'text', x: -0.25, y: 5.6, text: 'y = x^x', color: BLUE, fontSize: 12, align: 'left' },
            { type: 'text', x: -0.25, y: 5.15, text: 'y = 1.00', color: GREEN, fontSize: 11, align: 'left' },
            { type: 'text', x: -0.25, y: 4.75, text: "y' = x^x(ln x + 1) = 1.00", color: ORANGE, fontSize: 11, align: 'left' },
            { type: 'text', x: -0.25, y: 4.35, text: 'ln y = x ln x  ⇒  y’/y = ln x + 1', color: '#9aa7b4', fontSize: 10, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: 0.3, max: 2.0, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x = value;
          var y = Math.pow(x, x);
          var slope = y * (Math.log(x) + 1);  // x^x (ln x + 1)
          var L = 0.5;
          // 观察点
          scene.layers[2].x = x; scene.layers[2].y = y;
          // 切线
          scene.layers[3].from = [x - L, y - L * slope];
          scene.layers[3].to = [x + L, y + L * slope];
          // 标注
          scene.layers[5].text = 'y = ' + y.toFixed(2);
          scene.layers[6].text = "y' = x^x(ln x + 1) = " + slope.toFixed(2);
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
