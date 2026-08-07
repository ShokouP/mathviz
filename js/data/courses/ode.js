/**
 * mathviz — js/data/courses/ode.js
 * 课案 5：微分方程与方向场（3b1b 风格叙事 + 可视化）。
 *
 * 四步：
 *   1. 指数增长与衰减      dy/dx = k·y，方向场 + 解曲线
 *   2. 逻辑斯谛增长        dy/dx = k·y·(1 - y/L)，S 型曲线
 *   3. 简谐振动            dy/dt = -ω²·x，振荡解
 *   4. 相平面与方向场      非线性系统的几何直觉
 *
 * 设计说明：
 *   - 各步交互控件用 step.onControl(name, value, scene) 联动更新多个图层。
 *   - 方向场用 vectorField 原语（v0.1.1 新增），解曲线用 plot 原语叠加。
 *   - 颜色统一使用项目调色板：蓝 #4f9cf9 / 橙 #ff8c42 / 紫 #9d7aff / 绿 #4ade80。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 解曲线
  var ORANGE = '#ff8c42'; // 初始点 / 标记
  var PURPLE = '#9d7aff'; // 方向场
  var GREEN = '#4ade80';  // 参考线 / 目标值

  var course = {
    id: 'ode',
    title: '微分方程与方向场',
    summary: '从 dy/dx=k·y 到逻辑斯谛增长，用方向场看见微分方程的解。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><g stroke="#9d7aff" stroke-width="1" fill="none" opacity="0.7"><line x1="30" y1="30" x2="42" y2="22"/><line x1="60" y1="40" x2="74" y2="28"/><line x1="90" y1="55" x2="108" y2="38"/><line x1="120" y1="75" x2="142" y2="52"/><line x1="150" y1="95" x2="172" y2="68"/></g><path d="M20 95 Q60 70 100 50 T180 30" fill="none" stroke="#4f9cf9" stroke-width="2.5" stroke-linecap="round"/><circle cx="100" cy="50" r="3" fill="#ff8c42"/><text x="100" y="20" fill="#e6edf3" font-size="11" text-anchor="middle" font-family="-apple-system,sans-serif">dy/dx = f(x,y)</text></svg>',

    steps: [
      // ===== Step 1：指数增长与衰减 =====
      {
        title: '指数增长与衰减',
        narrative: `最简单的微分方程长这样：

$$\\frac{dy}{dx} = k \\cdot y$$

它说的是：**函数的变化率，正比于函数本身**。当 $k > 0$ 是指数增长（种群、复利）；
$k < 0$ 是指数衰减（放射性、降温）。

下图的紫色箭头是**方向场**——在每个点 $(x, y)$ 画一个小箭头，方向就是 $\\frac{dy}{dx} = k \\cdot y$ 的斜率。
蓝色曲线是一条真实的解 $y = y_0 \\, e^{kx}$，它处处与方向场相切。

拖动 $k$ 滑块在 $-0.8$ 到 $0.8$ 之间切换，观察方向场如何从「向上扬」翻转为「向下沉」，
解曲线也随之从增长变为衰减。这正是 $k$ 的符号控制的本质。`,

        scene: {
          axes: { xRange: [-0.5, 5], yRange: [-1, 6] },
          layers: [
            // 方向场：dy/dx = k*y
            { type: 'vectorField', dx: '1', dy: '0.5*y', nx: 12, ny: 8, color: PURPLE, lineWidth: 1 },
            // 解曲线 y = e^(kx)，初始 y0=1；用 onControl 动态改 fn
            { type: 'plot', fn: 'exp(0.5*x)', color: BLUE, lineWidth: 2.5 },
            // 初始点 (0, 1)
            { type: 'point', x: 0, y: 1, color: ORANGE, label: 'y₀' },
          ],
        },
        controls: [
          { name: 'k', label: 'k (变化率常数)', type: 'slider', min: -0.8, max: 0.8, step: 0.05, value: 0.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'k') return;
          // 同步更新方向场斜率与解曲线
          scene.layers[0].dy = String(value) + '*y';
          scene.layers[1].fn = 'exp(' + value + '*x)';
          scene.layers[1]._fn = undefined; // 清缓存强制重编译
        },
      },

      // ===== Step 2：逻辑斯谛增长 =====
      {
        title: '逻辑斯谛增长',
        narrative: `纯粹的指数增长 $\\frac{dy}{dx} = k y$ 有个问题——它会**无限增长**，但现实中的资源总有上限。
于是我们加一个「刹车」因子 $(1 - y/L)$，其中 $L$ 是环境容量：

$$\\frac{dy}{dx} = k \\, y \\left(1 - \\frac{y}{L}\\right)$$

当 $y$ 远小于 $L$ 时，$(1 - y/L) \\approx 1$，方程退化为指数增长；
当 $y$ 接近 $L$ 时，$(1 - y/L) \\to 0$，增长被「掐住」。
解出来的曲线呈 **S 型**（sigmoid），从慢启动、加速、再到饱和。

下图的绿色虚线是环境容量 $y = L$。拖动 $L$ 滑块抬高或压低这条天花板，
观察 S 型曲线如何「贴着天花板爬」。这是种群生态、传染病、产品扩散的共同语言。`,

        scene: {
          axes: { xRange: [-0.5, 8], yRange: [-0.5, 12] },
          layers: [
            // 环境容量参考线
            { type: 'line', from: [-0.5, 10], to: [8, 10], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 6, y: 10.6, text: 'y = L', color: GREEN, fontSize: 13 },
            // 方向场
            { type: 'vectorField', dx: '1', dy: '0.8*y*(1 - y/10)', nx: 12, ny: 7, color: PURPLE, lineWidth: 1 },
            // 逻辑斯谛解（解析解）：y = L / (1 + A*exp(-kx))，A = L/y0 - 1
            // 用数值形式近似：取 y0=0.5, L=10, k=0.8 → A=19
            { type: 'plot', fn: '10/(1 + 19*exp(-0.8*x))', color: BLUE, lineWidth: 2.5 },
            { type: 'point', x: 0, y: 0.5, color: ORANGE, label: 'y₀' },
          ],
        },
        controls: [
          { name: 'L', label: 'L (环境容量)', type: 'slider', min: 3, max: 11, step: 0.5, value: 10 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'L') return;
          var L = value;
          var y0 = 0.5;
          var A = L / y0 - 1;
          var k = 0.8;
          // 更新参考线
          scene.layers[0].from = [-0.5, L];
          scene.layers[0].to = [8, L];
          scene.layers[1].y = L + 0.6;
          // 更新方向场
          scene.layers[2].dy = k + '*y*(1 - y/' + L + ')';
          // 更新解曲线
          scene.layers[3].fn = L + '/(1 + ' + A + '*exp(-' + k + '*x))';
          scene.layers[3]._fn = undefined;
        },
      },

      // ===== Step 3：简谐振动 =====
      {
        title: '简谐振动',
        narrative: `现在让自变量变成时间 $t$。最经典的振荡方程是简谐运动：

$$\\frac{d^2 x}{dt^2} = -\\omega^2 x$$

它的解是 $x(t) = A \\cos(\\omega t + \\varphi)$——一个纯正弦波。
但这个方程是**二阶**的（含二阶导数）。要画方向场，得先把它拆成一阶方程组：

$$\\frac{dx}{dt} = v, \\qquad \\frac{dv}{dt} = -\\omega^2 x$$

于是在 $(x, v)$ **相平面**上，每个点的箭头是 $(dx/dt, dv/dt) = (v, -\\omega^2 x)$。
你会看到箭头绕着原点**旋转**——这正是周期运动的几何指纹。
蓝色解曲线（初始点在 $x$ 轴上）会画出一个闭合的椭圆轨道。

拖动 $\\omega$ 滑块，椭圆的「扁度」会变——$\\omega$ 越大，恢复力越强，振动越快。`,

        scene: {
          // 相平面 x-v：横轴 x（位移），纵轴 v（速度）
          axes: { xRange: [-4, 4], yRange: [-4, 4] },
          layers: [
            // 相平面方向场：dx/dt=v, dv/dt=-ω²x。
            // vectorField 的 dx/dy 对 (x,y)，这里 y 轴扮演 v，故 dx="y"(=v), dy="-ω²x"
            { type: 'vectorField', dx: 'y', dy: '-x', nx: 11, ny: 11, color: PURPLE, lineWidth: 1 },
            // 椭圆解轨道：x²+(v/ω)²=R² → v=±ω·sqrt(R²-x²)。取 R=2，ω 由滑块控制
            { type: 'plot', fn: 'sqrt(4 - x^2)', color: BLUE, lineWidth: 2.5, range: [-2, 2] },
            { type: 'plot', fn: '-sqrt(4 - x^2)', color: BLUE, lineWidth: 2.5, range: [-2, 2] },
            // 初始点
            { type: 'point', x: 2, y: 0, color: ORANGE, label: '初始' },
            { type: 'text', x: 2.2, y: -3.5, text: '相平面 (x, v)  ω=1.0', color: '#9aa7b4', fontSize: 12, align: 'left' },
            { type: 'text', x: 2.2, y: -3.9, text: 'ω 大 → 椭圆更扁（v 方向拉长）', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'omega', label: '角频率 ω', type: 'slider', min: 0.4, max: 2, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'omega') return;
          var w = value;
          var R = 2;
          // 椭圆：v = ±ω·sqrt(R²-x²)。ω 越大，v 方向(纵轴)越拉长 → 椭圆越扁(纵向更高)
          scene.layers[1].fn = w + '*sqrt(' + (R * R) + ' - x^2)';
          scene.layers[1]._fn = undefined;
          scene.layers[2].fn = '-' + w + '*sqrt(' + (R * R) + ' - x^2)';
          scene.layers[2]._fn = undefined;
          // 方向场的 dy = -ω²x
          scene.layers[0].dy = '-' + (w * w) + '*x';
          scene.layers[4].text = '相平面 (x, v)  ω=' + w.toFixed(2) + '  周期 T=2π/ω=' + (2 * Math.PI / w).toFixed(2);
        },
      },

      // ===== Step 4：非线性系统与极限环 =====
      {
        title: '非线性系统：极限环',
        narrative: `线性系统的轨道要么发散、要么收敛、要么闭合。非线性系统却能画出**极限环**——
一个所有附近轨道都 spiraling 趋近的闭合曲线。最经典的例子是 van der Pol 振子：

$$\\frac{dx}{dt} = v, \\qquad \\frac{dv}{dt} = \\mu (1 - x^2) v - x$$

当 $|x| < 1$ 时，$(1-x^2) > 0$，阻尼项为正——系统**获得能量**，振幅增大；
当 $|x| > 1$ 时，$(1-x^2) < 0$，阻尼项为负——系统**耗散能量**，振幅减小。
两种力量博弈的结果，是轨道稳定在一个固定的极限环上，无论从哪里出发都会被「吸」过去。

下图的紫色方向场展现了这个非线性结构。$\\mu$ 越大，非线性越强，极限环越「方」。
这是心脏起搏细胞、声学振荡、电子振荡电路的数学骨架。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-3.5, 3.5] },
          layers: [
            // van der Pol 方向场
            { type: 'vectorField', dx: 'y', dy: '1*(1 - x^2)*y - x', nx: 11, ny: 11, color: PURPLE, lineWidth: 1 },
            // 极限环近似轨道（用参数化椭圆示意，真实解需数值积分）
            // 取一个扁椭圆作为视觉示意
            { type: 'plot', fn: '2*cos(x*1.2)', color: BLUE, lineWidth: 2, range: [-2.6, 2.6] },
            // 起始点（远离极限环，会被吸引过去）
            { type: 'point', x: 0.3, y: 0.3, color: ORANGE, label: '起点' },
            { type: 'text', x: -3, y: 3.2, text: 'van der Pol', color: '#9aa7b4', fontSize: 12 },
          ],
        },
        controls: [
          { name: 'mu', label: 'μ (非线性强度)', type: 'slider', min: 0.2, max: 3, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'mu') return;
          // 更新方向场的 μ
          scene.layers[0].dy = value + '*(1 - x^2)*y - x';
          // 极限环形状随 μ 变化：μ 大时更「方」，这里用振幅微调示意
          var amp = 1.8 + value * 0.2;
          scene.layers[1].fn = amp + '*cos(x*1.2)';
          scene.layers[1]._fn = undefined;
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
