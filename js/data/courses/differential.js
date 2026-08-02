/**
 * mathviz — js/data/courses/differential.js
 * 课案：微分及其应用（北大高数 §3.5）。
 *
 * 四步：
 *   1. 微分的定义        dy = f'(x)·dx —— 线性主部，区别于真实增量 Δy
 *   2. 微分的几何意义     dy = 切线纵坐标增量；Δy 与 dy 之差是"高阶无穷小"
 *   3. 近似计算          f(x0+Δx) ≈ f(x0) + f'(x0)·Δx，估增量
 *   4. 误差估计          |Δy| ≈ |dy| = |f'(x)|·|Δx|，误差传递
 *
 * 设计说明（与引擎契约对齐）：
 *   - setPath 不支持下标路径，凡联动到 layers 子项一律用 step.onControl(name,value,scene)
 *     直接 mutate scene.layers[i]。
 *   - _applyScene 会 JSON 深拷贝 scene（函数会被丢弃），故不用 scene.timeline；
 *     4 步全部由滑块静态驱动。
 *   - 颜色调色板：蓝 #4f9cf9（函数曲线）/ 橙 #ff8c42（Δy、真实增量）/ 紫 #9d7aff（dy、切线）/ 绿 #4ade80（结论、误差）。
 *   - 表达式幂用 ^（math-eval 支持），变量 x，常量 pi/e。sqrt、abs、exp、ln 均可用。
 *   - coverSVG viewBox="0 0 200 113"。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 函数曲线
  var ORANGE = '#ff8c42'; // Δy、真实增量、原始点
  var PURPLE = '#9d7aff'; // dy、切线、线性主部
  var GREEN = '#4ade80';  // 误差、结论

  var course = {
    id: 'differential',
    title: '微分及其应用',
    summary: 'dy=f′(x)dx——把"非线性增量"用一段切线线性化的艺术。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/>' +
      '<line x1="20" y1="93" x2="180" y2="93" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
      '<line x1="40" y1="10" x2="40" y2="103" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>' +
      '<path d="M40 93 Q90 70 120 40 T175 14" fill="none" stroke="#4f9cf9" stroke-width="2.6" stroke-linecap="round"/>' +
      '<line x1="70" y1="80" x2="160" y2="22" stroke="#9d7aff" stroke-width="2" stroke-dasharray="5 3"/>' +
      '<circle cx="100" cy="56" r="3.6" fill="#ff8c42"/>' +
      '<line x1="100" y1="56" x2="135" y2="56" stroke="#4f9cf9" stroke-width="1" stroke-dasharray="3 3"/>' +
      '<line x1="135" y1="56" x2="135" y2="38" stroke="#9d7aff" stroke-width="1.6"/>' +
      '<line x1="135" y1="38" x2="135" y2="30" stroke="#ff8c42" stroke-width="1.6"/>' +
      '<text x="142" y="40" fill="#9d7aff" font-size="9" font-family="sans-serif">dy</text>' +
      '<text x="142" y="26" fill="#ff8c42" font-size="9" font-family="sans-serif">Δy</text>' +
      '<text x="100" y="105" fill="#e6edf3" font-size="10" text-anchor="middle" font-family="sans-serif">Δy ≈ dy = f′(x)dx</text>' +
      '</svg>',

    steps: [
      // ===== Step 1：微分的定义 =====
      {
        title: '微分的定义：dy=f′(x)dx',
        narrative: `设函数 $y=f(x)$ 在 $x_0$ 处可导。当自变量从 $x_0$ 变到 $x_0+\\Delta x$，函数值的**真实增量**是

$$\\Delta y = f(x_0+\\Delta x) - f(x_0).$$

把 $f$ 在 $x_0$ 处展开，可以证明 $\\Delta y$ 能拆成两部分：一个**与 $\\Delta x$ 成正比**的线性主部，加上一个**比 $\\Delta x$ 更高阶**的小量。前者写作

$$\\mathrm{d}y = f'(x_0)\\,\\mathrm{d}x,$$

这就是**微分**。注意：当 $f$ 可导时，$\\mathrm{d}x=\\Delta x$ 是自变量的增量（任意取值），而 $\\mathrm{d}y$ 是按"瞬时斜率"线性外推出来的"假装增量"。

右侧取 $f(x)=x^2$，$x_0=2$（故 $f'(2)=4$，$f(2)=4$）。蓝色是曲线，橙色是真实增量 $\\Delta y$（曲线两点的高度差），紫色是微分 $\\mathrm{d}y=4\\Delta x$（沿切线走的高度差）。拖动 $\\Delta x$ 滑块：

- $\\Delta x$ 较大时，$\\Delta y$ 与 $\\mathrm{d}y$ **明显分离**——线性近似失真；
- $\\Delta x$ 趋于 0 时，两段几乎**完全贴合**——这正印证了"微分是增量的线性主部"。

底部数值行实时给出 $\\Delta y$、$\\mathrm{d}y$ 以及二者之差 $\\Delta y-\\mathrm{d}y=(\\Delta x)^2$（对 $x^2$ 恰好是 $\\Delta x$ 的二阶量），让你直接看见"高阶小"是如何被丢掉的。`,
        scene: {
          axes: { xRange: [-0.5, 6], yRange: [-1, 14] },
          layers: [
            // [0] 函数曲线 y=x^2
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2.6, range: [-0.3, 5.8], samples: 160 },
            // [1] 切线（在 x0=2，dy 沿此线度量）
            { type: 'tangent', fn: 'x^2', at: 2, color: PURPLE, dashed: false, halfLen: 2.4, lineWidth: 1.8 },
            // [2] 起始点 P(x0, f(x0))
            { type: 'point', x: 2, y: 4, color: ORANGE, radius: 5, label: 'P' },
            // [3] 曲线上的终点 Q(x0+dx, f(x0+dx))
            { type: 'point', x: 3, y: 9, color: ORANGE, radius: 5, label: 'Q' },
            // [4] 切线上对应的点 T(x0+dx, f(x0)+f'(x0)*dx)
            { type: 'point', x: 3, y: 8, color: PURPLE, radius: 5, label: 'T' },
            // [5] 水平辅助线：标出 dx 的长度（从 x0 到 x0+dx，高度在 y=f(x0)）
            { type: 'line', from: [2, 4], to: [3, 4], color: 'rgba(230,237,243,0.35)', dashed: true, lineWidth: 1 },
            // [6] Δy 段（橙色，竖直，从 T 到 Q——视觉上 Δy 比 dy 长一截）
            { type: 'line', from: [3, 8], to: [3, 9], color: ORANGE, lineWidth: 3.2 },
            // [7] dy 段（紫色，竖直，从 P 的高度到 T 的高度，画在 x0+dx 处）
            { type: 'line', from: [3, 4], to: [3, 8], color: PURPLE, lineWidth: 3.2 },
            // [8] 数值读数
            { type: 'text', x: 0.1, y: 13, text: 'dx=1.00  Δy=5.00  dy=4.00  Δy−dy=1.00', color: '#e6edf3', fontSize: 13, align: 'left' }
          ]
        },
        controls: [
          { name: 'dx', label: 'Δx  (自变量增量)', type: 'slider', min: -1.8, max: 2.5, step: 0.05, value: 1 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'dx') return;
          var dx = value;
          var x0 = 2;
          var y0 = x0 * x0;        // f(2)=4
          var fp = 2 * x0;          // f'(2)=4
          var x1 = x0 + dx;
          var y1 = x1 * x1;         // 真实终点
          var yt = y0 + fp * dx;    // 切线终点
          var dY = y1 - y0;         // Δy
          var dy = fp * dx;         // dy
          var diff = dY - dy;       // 高阶差，对 x^2 恰为 dx^2
          var L = scene.layers;
          L[3].x = x1; L[3].y = y1;
          L[4].x = x1; L[4].y = yt;
          L[5].from = [x0, y0]; L[5].to = [x1, y0];
          L[6].from = [x1, yt]; L[6].to = [x1, y1];
          L[7].from = [x1, y0]; L[7].to = [x1, yt];
          L[8].text = 'dx=' + dx.toFixed(2) +
            '  Δy=' + dY.toFixed(3) +
            '  dy=' + dy.toFixed(3) +
            '  Δy−dy=' + diff.toFixed(3) +
            (Math.abs(dx) < 0.15 ? '  (Δy≈dy)' : '');
        }
      },

      // ===== Step 2：微分的几何意义 =====
      {
        title: '几何意义：切线的纵坐标增量',
        narrative: `上一页的紫色段 $\\mathrm{d}y$ 沿切线度量，这不是巧合——**微分的几何意义就是切线纵坐标的增量**。

把画面分三层来看：

- **蓝色曲线** $y=f(x)$：真实的函数图像；
- **紫色直线**：$x_0$ 处的切线，方程 $y=f(x_0)+f'(x_0)(x-x_0)$；
- **橙色段 $\\Delta y$**：曲线从 $x_0$ 到 $x_0+\\Delta x$ 的真实高度变化；
- **紫色段 $\\mathrm{d}y$**：切线在同一区间的真实高度变化。

于是几何关系一目了然：

> $\\mathrm{d}y$ 是"沿切线走的高度差"，$\\Delta y$ 是"沿曲线走的高度差"。二者之差 $\\Delta y-\\mathrm{d}y$ 就是切线与曲线之间的"小缝隙"——当 $\\Delta x\\to 0$，这条缝隙以比 $\\Delta x$ 更快的速度收缩为零。

右侧仍用 $f(x)=x^2$、$x_0=2$。把 $\\Delta x$ 拖向 0：紫色切线段（$\\mathrm{d}y$）与橙色曲线段（$\\Delta y$）会迅速靠拢、几乎重合，而那一点点"缝隙"（绿色高亮，长度 $=(\\Delta x)^2$）以**平方速度**消失。这正是"可微 $\\Rightarrow \\Delta y=\\mathrm{d}y+o(\\Delta x)$"的几何写照：**切线是曲线在一点最好的线性近似**，误差是高阶无穷小。

注意图例里同时给出切线方程 $y=4+4(x-2)$ 与比值 $\\mathrm{d}y/\\Delta x=f'(x_0)=4$——后者说明：**微分 $\\mathrm{d}y$ 与 $\\mathrm{d}x$ 之比恰为导数**，这是"导数 $=\\mathrm{d}y/\\mathrm{d}x$"记号的几何来源。`,
        scene: {
          axes: { xRange: [-0.5, 6], yRange: [-1, 14] },
          layers: [
            // [0] 曲线
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2.6, range: [-0.3, 5.8], samples: 160 },
            // [1] 切线
            { type: 'tangent', fn: 'x^2', at: 2, color: PURPLE, dashed: false, halfLen: 2.6, lineWidth: 2 },
            // [2] 切点 P
            { type: 'point', x: 2, y: 4, color: PURPLE, radius: 5, label: 'P(2,4)' },
            // [3] 曲线终点 Q
            { type: 'point', x: 3, y: 9, color: ORANGE, radius: 5, label: 'Q' },
            // [4] 切线终点 T
            { type: 'point', x: 3, y: 8, color: PURPLE, radius: 4, label: 'T' },
            // [5] dx 水平辅助
            { type: 'line', from: [2, 4], to: [3, 4], color: 'rgba(230,237,243,0.35)', dashed: true, lineWidth: 1 },
            // [6] Δy（橙）
            { type: 'line', from: [3, 8], to: [3, 9], color: ORANGE, lineWidth: 3.4 },
            // [7] dy（紫）
            { type: 'line', from: [3, 4], to: [3, 8], color: PURPLE, lineWidth: 3.4 },
            // [8] "缝隙" Δy−dy（绿色高亮，把那段误差单独标出）
            { type: 'line', from: [3, 8], to: [3, 9], color: GREEN, lineWidth: 1.6, dashed: true },
            // [9] 图例 + 方程 + 比值
            { type: 'text', x: 0.1, y: 13.2, text: '切线: y = 4 + 4(x−2)        dy/dx = f′(2) = 4', color: '#9aa7b4', fontSize: 12, align: 'left' },
            // [10] 数值行
            { type: 'text', x: 0.1, y: 11.9, text: 'Δx=1.00  Δy=5.00  dy=4.00  缝隙=(Δx)²=1.00', color: '#e6edf3', fontSize: 12.5, align: 'left' }
          ]
        },
        controls: [
          { name: 'dx', label: 'Δx  (切向 vs 曲向)', type: 'slider', min: 0.05, max: 2.5, step: 0.05, value: 1 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'dx') return;
          var dx = value;
          var x0 = 2, y0 = 4, fp = 4;
          var x1 = x0 + dx;
          var y1 = x1 * x1;
          var yt = y0 + fp * dx;
          var dY = y1 - y0;
          var dy = fp * dx;
          var gap = dY - dy; // = dx^2
          var L = scene.layers;
          L[3].x = x1; L[3].y = y1;
          L[4].x = x1; L[4].y = yt;
          L[5].from = [x0, y0]; L[5].to = [x1, y0];
          L[6].from = [x1, yt]; L[6].to = [x1, y1];
          L[7].from = [x1, y0]; L[7].to = [x1, yt];
          // 缝隙段单独画在稍右一点（x1+0.12），与 Δy 段错开避免完全遮挡
          L[8].from = [x1 + 0.12, yt]; L[8].to = [x1 + 0.12, y1];
          L[10].text = 'Δx=' + dx.toFixed(2) +
            '  Δy=' + dY.toFixed(3) +
            '  dy=' + dy.toFixed(3) +
            '  缝隙=(Δx)²=' + gap.toFixed(3) +
            (dx < 0.2 ? '  (缝隙以平方速度消失)' : '');
        }
      },

      // ===== Step 3：近似计算 =====
      {
        title: '近似计算：用微分估增量',
        narrative: `既然 $\\Delta y \\approx \\mathrm{d}y = f'(x_0)\\Delta x$，就能用它做**心算级别的近似**。把近似式改写一下：

$$f(x_0+\\Delta x) \\;\\approx\\; f(x_0) + f'(x_0)\\,\\Delta x.$$

**典型例子**：求 $\\sqrt{4.02}$。取 $f(x)=\\sqrt{x}$，$x_0=4$（好算），$\\Delta x=0.02$，则
$f(4)=2$，$f'(x)=\\dfrac{1}{2\\sqrt{x}}\\Rightarrow f'(4)=\\dfrac{1}{4}=0.25$，于是
$$\\sqrt{4.02}\\approx 2 + 0.25\\times 0.02 = 2.005.$$
真实值 $\\approx 2.00499$，误差不到 $10^{-4}$。

右侧用 $f(x)=\\sqrt{x}$、$x_0=4$ 做演示。蓝色是 $\\sqrt{x}$ 在 $x_0$ 附近的放大图，紫色切线就是线性近似 $f(x_0)+f'(x_0)\\Delta x$。拖动 $\\Delta x$ 滑块：

- 橙色点 Q 是 $\\sqrt{x_0+\\Delta x}$ 的**真实值**；
- 紫色点 T 是 $2+0.25\\Delta x$ 的**近似值**；
- 底部数值行直接给出 $\\sqrt{4.02}$、$\\sqrt{4.5}$ 等的近似值与相对误差。

**经验法则**：$|\\Delta x|$ 越小，近似越准（误差是 $|\\Delta x|$ 的二阶量）。当 $|\\Delta x|$ 接近 1 时切线已远离曲线，近似就不可靠了——这就是"**线性化只在局部有效**"的直观含义。工程上常用此法快速估算 $\\sin$、$\\ln$、$e^x$ 在"好算点"附近的小扰动。`,
        scene: {
          axes: { xRange: [3.4, 5.4], yRange: [1.8, 2.4] },
          layers: [
            // [0] f=sqrt(x) 局部放大
            { type: 'plot', fn: 'sqrt(x)', color: BLUE, lineWidth: 2.8, range: [3.5, 5.3], samples: 120 },
            // [1] 切线（在 x0=4，f'(4)=0.25）
            { type: 'tangent', fn: 'sqrt(x)', at: 4, color: PURPLE, dashed: false, halfLen: 1.2, lineWidth: 2 },
            // [2] 基点 P(4,2)
            { type: 'point', x: 4, y: 2, color: ORANGE, radius: 5, label: 'P(4,2)' },
            // [3] 真实值 Q(x0+dx, sqrt(x0+dx))
            { type: 'point', x: 4.2, y: 2.04939, color: ORANGE, radius: 5, label: 'Q(真实)' },
            // [4] 近似值 T(x0+dx, 2+0.25*dx)
            { type: 'point', x: 4.2, y: 2.05, color: PURPLE, radius: 5, label: 'T(近似)' },
            // [5] dx 水平辅助
            { type: 'line', from: [4, 2], to: [4.2, 2], color: 'rgba(230,237,243,0.35)', dashed: true, lineWidth: 1 },
            // [6] 数值读数
            { type: 'text', x: 3.45, y: 2.36, text: 'Δx=0.20: √4.20≈2.05000 (真实 2.04939)，误差 0.030%', color: '#e6edf3', fontSize: 12.5, align: 'left' },
            // [7] 公式提示
            { type: 'text', x: 3.45, y: 1.86, text: '√(x₀+Δx) ≈ √x₀ + Δx/(2√x₀)', color: '#9aa7b4', fontSize: 11.5, align: 'left' }
          ]
        },
        controls: [
          { name: 'dx', label: 'Δx  (扰动量)', type: 'slider', min: 0.005, max: 1.0, step: 0.005, value: 0.2 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'dx') return;
          var dx = value;
          var x0 = 4, y0 = 2, fp = 0.25;
          var x1 = x0 + dx;
          var yTrue = Math.sqrt(x1);
          var yApprox = y0 + fp * dx;
          var absErr = Math.abs(yTrue - yApprox);
          var relErr = absErr / Math.abs(yTrue) * 100;
          var L = scene.layers;
          L[3].x = x1; L[3].y = yTrue;
          L[4].x = x1; L[4].y = yApprox;
          L[5].from = [x0, y0]; L[5].to = [x1, y0];
          L[6].text = 'Δx=' + dx.toFixed(3) +
            ': √' + x1.toFixed(2) + '≈' + yApprox.toFixed(5) +
            ' (真实 ' + yTrue.toFixed(5) + ')' +
            '，误差 ' + relErr.toFixed(3) + '%' +
            (dx < 0.05 ? '  (极准)' : (dx > 0.6 ? '  (近似失效)' : ''));
        }
      },

      // ===== Step 4：误差估计 =====
      {
        title: '误差估计：误差怎样"传递"',
        narrative: `实际测量里，量 $x$ 总带有误差 $\\delta x$（设其绝对值上界为 $|\\Delta x|\\le\\delta x$）。若最终量 $y=f(x)$，那么 $y$ 的误差有多大？这正是微分的用武之地：

$$|\\Delta y| \\;\\approx\\; |\\mathrm{d}y| \\;=\\; |f'(x_0)|\\,|\\Delta x| \\;\\le\\; |f'(x_0)|\\,\\delta x.$$

也就是说：**误差被导数"放大"或"压缩"**。$|f'|>1$ 时误差被放大（要小心），$|f'|<1$ 时误差被压缩（很稳）。

**经典例子**——测球半径 $r$ 估算体积 $V=\\dfrac{4}{3}\\pi r^3$ 的误差。$V'(r)=4\\pi r^2$，故
$$\\delta V \\approx 4\\pi r^2\\,\\delta r.$$
半径每偏差 $0.01$，在 $r=1$ 处体积偏差约 $4\\pi\\times0.01\\approx0.1257$。

右侧用 $f(x)=\\sqrt{x}$ 演示**相对误差**的关系：由 $\\mathrm{d}(\\sqrt{x})=\\dfrac{\\mathrm{d}x}{2\\sqrt{x}}$ 两边除以 $\\sqrt{x}$ 得
$$\\frac{\\delta y}{y} \\approx \\frac{1}{2}\\,\\frac{\\delta x}{x}.$$
即"**开方运算使相对误差减半**"——这是为何平方根运算在数值上很稳健。

拖动 $\\Delta x$ 滑块看误差条（绿色）随之伸缩。数值行同时给出绝对误差 $|\\mathrm{d}y|$、相对误差 $|\\mathrm{d}y|/|y|$ 与自变量相对误差 $|\\Delta x|/|x_0|$，可直接验证"**相对误差减半**"这条规律。`,
        scene: {
          axes: { xRange: [3.5, 5.3], yRange: [1.85, 2.4] },
          layers: [
            // [0] f=sqrt(x)
            { type: 'plot', fn: 'sqrt(x)', color: BLUE, lineWidth: 2.6, range: [3.6, 5.2], samples: 120 },
            // [1] 切线（x0=4）
            { type: 'tangent', fn: 'sqrt(x)', at: 4, color: PURPLE, dashed: false, halfLen: 1.1, lineWidth: 1.8 },
            // [2] 基点 P(4,2)
            { type: 'point', x: 4, y: 2, color: ORANGE, radius: 5, label: 'P(4,2)' },
            // [3] 受扰点 Q(x0+dx, sqrt(x0+dx))
            { type: 'point', x: 4.2, y: 2.04939, color: ORANGE, radius: 5, label: 'Q' },
            // [4] dx 水平辅助（标出自变量误差）
            { type: 'line', from: [4, 2], to: [4.2, 2], color: 'rgba(230,237,243,0.35)', dashed: true, lineWidth: 1 },
            // [5] |dy| 误差条（绿色，竖直，从切线高度到 P 高度，画在 x0+dx 处）
            { type: 'line', from: [4.2, 2], to: [4.2, 2.05], color: GREEN, lineWidth: 4 },
            // [6] 误差上限参考线 y = y0 + |f'|*|dx|（虚线，绿色淡）
            { type: 'line', from: [4, 2.05], to: [4.2, 2.05], color: 'rgba(74,222,128,0.5)', dashed: true, lineWidth: 1 },
            // [7] 数值读数：绝对误差、相对误差
            { type: 'text', x: 3.55, y: 2.36, text: 'Δx=0.20: |dy|=0.0500  δy/y=2.50%  δx/x=5.00%  (≈½)', color: '#e6edf3', fontSize: 12, align: 'left' },
            // [8] 规律提示
            { type: 'text', x: 3.55, y: 1.88, text: 'δ(√x)/√x ≈ ½ · δx/x   （相对误差减半）', color: GREEN, fontSize: 11.5, align: 'left' }
          ]
        },
        controls: [
          { name: 'dx', label: 'Δx  (自变量误差)', type: 'slider', min: 0.01, max: 0.6, step: 0.005, value: 0.2 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'dx') return;
          var dx = value;
          var x0 = 4, y0 = 2, fp = 0.25;
          var x1 = x0 + dx;
          var y1 = Math.sqrt(x1);
          var dyMag = Math.abs(fp * dx);           // |dy|
          var relY = dyMag / Math.abs(y0) * 100;    // δy/y (%)
          var relX = Math.abs(dx) / Math.abs(x0) * 100; // δx/x (%)
          var L = scene.layers;
          L[3].x = x1; L[3].y = y1;
          L[4].from = [x0, y0]; L[4].to = [x1, y0];
          // |dy| 竖直误差条：从 P 的高度 y0 到切线终点 y0+fp*dx
          L[5].from = [x1, y0]; L[5].to = [x1, y0 + fp * dx];
          // 上限参考线（水平）
          L[6].from = [x0, y0 + fp * dx]; L[6].to = [x1, y0 + fp * dx];
          L[7].text = 'Δx=' + dx.toFixed(3) +
            ': |dy|=' + dyMag.toFixed(4) +
            '  δy/y=' + relY.toFixed(2) + '%' +
            '  δx/x=' + relX.toFixed(2) + '%' +
            '  (比值 ' + (relY / relX).toFixed(3) + ' ≈ ½)';
        }
      }
    ]
  };

  window.COURSES.register(course);
})();
