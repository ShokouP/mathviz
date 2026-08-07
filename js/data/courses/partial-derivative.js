/**
 * mathviz — js/data/courses/partial-derivative.js
 * 课案：偏导数（北大高数 §9.2，批次 3 第一套，多元微积分起点）。
 *
 * 四步：
 *   1. 多元函数与图像    z=f(x,y) 是曲面，等高线是俯视图
 *   2. 偏导数的几何意义   沿 x/y 方向切面的切线斜率
 *   3. 偏导数的计算       其他变量视为常数，对其中一个求导
 *   4. 高阶偏导与混合偏导  ∂²f/∂x∂y = ∂²f/∂y∂x（克莱罗定理）
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 *   核心可视化：用 contour 画 f(x,y) 的等高线（地形俯视），用 plot 画沿轴切面。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主曲面/切面
  var ORANGE = '#ff8c42'; // 切线 / 标记
  var PURPLE = '#9d7aff'; // 等高线 / 第二方向
  var GREEN = '#4ade80';  // 偏导数值 / 结论

  var course = {
    id: 'partial-derivative',
    title: '偏导数',
    summary: '多元函数沿坐标轴的变化率——把"其他变量冻结"后求导。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><g stroke="#9d7aff" stroke-width="1" fill="none" opacity="0.6"><ellipse cx="100" cy="56" rx="70" ry="40"/><ellipse cx="100" cy="56" rx="50" ry="28"/><ellipse cx="100" cy="56" rx="30" ry="16"/><ellipse cx="100" cy="56" rx="12" ry="6"/></g><circle cx="135" cy="50" r="3.5" fill="#ff8c42"/><line x1="135" y1="50" x2="160" y2="40" stroke="#4f9cf9" stroke-width="2"/><text x="100" y="105" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">∂f/∂x 沿等高线切线</text></svg>',

    steps: [
      // ===== Step 1：多元函数与图像 =====
      {
        title: '多元函数与图像',
        narrative: `一元函数 $y = f(x)$ 的图像是平面上的**曲线**。
二元函数 $z = f(x, y)$ 的图像是三维空间中的**曲面**——比如抛物面 $z = x^2 + y^2$ 是一个碗。

直接画三维曲面困难，但有两种"降维"方式：

**1. 等高线图（俯视图）**：把 $z$ 值相同的点连成线。
地形图就是这样——每条线代表一个海拔。线越密，坡度越陡。

**2. 切面图**：固定一个变量（如 $y = y_0$），看 $z = f(x, y_0)$ 这条曲线。
这相当于用平面 $y = y_0$ 切曲面，看切口形状。

右侧紫色等高线是 $f(x,y) = x^2 + y^2$ 的地形图（同心圆，越外越高）。
拖动观察点（橙色）在地图上移动，理解"高度"如何随位置变化。

> 多元函数的本质：输入不止一个数，输出仍是一个数。图像从曲线升维到曲面。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-3, 3] },
          layers: [
            // 等高线 f = x² + y²，levels 1,2,4,6,9
            { type: 'contour', fn: 'x^2 + y^2', levels: [0.5, 1.5, 3, 5, 7], nx: 70, ny: 60, color: PURPLE, lineWidth: 1.3, opacity: 0.7 },
            // 观察点
            { type: 'point', x: 1.5, y: 1, color: ORANGE, radius: 6, label: '(x₀,y₀)' },
            // 标注高度
            { type: 'text', x: -3.2, y: 2.7, text: 'f=x²+y² 等高线（同心圆）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -3.2, y: 2.3, text: '点处高度 = ' + (1.5*1.5+1*1).toFixed(2), color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x₀', type: 'slider', min: -2.5, max: 2.5, step: 0.1, value: 1.5 },
          { name: 'y', label: '观察点 y₀', type: 'slider', min: -2.5, max: 2.5, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x' && name !== 'y') return;
          var x = name === 'x' ? value : scene.layers[1].x;
          var y = name === 'y' ? value : scene.layers[1].y;
          scene.layers[1].x = x;
          scene.layers[1].y = y;
          scene.layers[3].text = '点处高度 = ' + (x * x + y * y).toFixed(2);
        },
      },

      // ===== Step 2：偏导数的几何意义 =====
      {
        title: '偏导数的几何意义',
        narrative: `**偏导数** $\\frac{\\partial f}{\\partial x}$ 的定义：

$$\\frac{\\partial f}{\\partial x}\\bigg|_{(x_0,y_0)} = \\lim_{\\Delta x \\to 0} \\frac{f(x_0+\\Delta x,\\, y_0) - f(x_0, y_0)}{\\Delta x}$$

几何意义：**固定 $y = y_0$**，只让 $x$ 变化，看 $z = f(x, y_0)$ 这条切面曲线的斜率。
形象地说，你站在山坡上，**只朝东西方向**看坡度有多陡——这就是 $\\partial f / \\partial x$。
朝南北方向看则是 $\\partial f / \\partial y$。

右侧演示 $f = x^2 + y^2$ 在点 $(1.5, 1)$ 处。
- 蓝色曲线是 $y=1$ 切面（$z = x^2 + 1$），橙色切线斜率 $= \\partial f/\\partial x = 2x_0 = 3$。
- 拖动 $x_0$ 滑块，切点移动，切线斜率（即偏导数值）实时更新。

> 偏导数 = "偏着看"的导数。把其他变量当常数，只对一个变量求导。`,

        scene: {
          // 沿 y=y₀ 切面：z = x² + y₀²，画成 2D 图（横轴 x，纵轴 z）
          axes: { xRange: [-2.5, 3], yRange: [-0.5, 6] },
          layers: [
            // 切面曲线 z = x² + 1（y₀=1）
            { type: 'plot', fn: 'x^2 + 1', color: BLUE, lineWidth: 2.5, range: [-2.2, 2.7], samples: 80 },
            // 切线（在 x₀=1.5 处，斜率=2*1.5=3）
            { type: 'tangent', fn: 'x^2 + 1', at: 1.5, color: ORANGE, dashed: false, halfLen: 1.2, lineWidth: 2 },
            // 切点
            { type: 'point', x: 1.5, y: 3.25, color: ORANGE, radius: 5, label: '(x₀, f)' },
            { type: 'text', x: -2.2, y: 5.3, text: '蓝:切面 z=f(x,y₀)  橙:∂f/∂x 切线', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.2, y: 4.8, text: '∂f/∂x = 2x₀ = 3.00', color: GREEN, fontSize: 13, align: 'left' },
          ],
        },
        controls: [
          { name: 'x0', label: '切点 x₀', type: 'slider', min: -2, max: 2.5, step: 0.1, value: 1.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x0') return;
          scene.layers[1].at = value;
          scene.layers[2].x = value;
          scene.layers[2].y = value * value + 1;
          scene.layers[4].text = '∂f/∂x = 2x₀ = ' + (2 * value).toFixed(2);
        },
      },

      // ===== Step 3：偏导数的计算 =====
      {
        title: '偏导数的计算',
        narrative: `计算偏导数的**口诀**：求 $\\frac{\\partial f}{\\partial x}$ 时，把 $y$（及其他变量）当成常数，对 $x$ 用一元求导法则。

**例子 1**：$f(x,y) = x^2 y + \\sin(xy)$

$$\\frac{\\partial f}{\\partial x} = 2xy + y\\cos(xy) \\quad \\text{（}y\\text{ 当常数）}$$
$$\\frac{\\partial f}{\\partial y} = x^2 + x\\cos(xy) \\quad \\text{（}x\\text{ 当常数）}$$

**例子 2**：$f(x,y) = e^{xy}$

$$\\frac{\\partial f}{\\partial x} = y\\,e^{xy}, \\qquad \\frac{\\partial f}{\\partial y} = x\\,e^{xy}$$

注意：偏导数仍是 $x, y$ 的函数（不是单个数），除非在指定点取值。

右侧用等高线展示偏导数的方向性。$f = x^2 - y^2$（马鞍面）：
- 沿 $x$ 方向（水平），等高线变化快 → $|\\partial f/\\partial x|$ 大
- 沿 $y$ 方向（竖直），等高线变化反向 → 偏导符号相反

橙色箭头标出 $\\partial f/\\partial x$ 方向，紫色标 $\\partial f/\\partial y$。`,

        scene: {
          axes: { xRange: [-3, 3], yRange: [-3, 3] },
          layers: [
            // 马鞍面 f = x² - y² 的等高线（双曲线族）
            { type: 'contour', fn: 'x^2 - y^2', levels: [-4, -2, -1, 1, 2, 4], nx: 80, ny: 80, color: PURPLE, lineWidth: 1.2, opacity: 0.6 },
            // 观察点
            { type: 'point', x: 1.2, y: 0.8, color: ORANGE, radius: 5, label: 'P' },
            // ∂f/∂x 方向箭头（沿 x 正方向，长度随 |2x|）
            { type: 'line', from: [1.2, 0.8], to: [2.2, 0.8], color: ORANGE, lineWidth: 2 },
            // ∂f/∂y 方向箭头（沿 y 负方向，因 ∂f/∂y=-2y<0）
            { type: 'line', from: [1.2, 0.8], to: [1.2, -0.2], color: BLUE, lineWidth: 2 },
            { type: 'text', x: -2.8, y: 2.7, text: '橙:∂f/∂x 方向  蓝:∂f/∂y 方向', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.8, y: 2.3, text: '马鞍面 f=x²-y²：∂f/∂x=2x=2.40  ∂f/∂y=-2y=-1.60', color: GREEN, fontSize: 11, align: 'left' },
            { type: 'text', x: -2.8, y: 1.9, text: '拖 x₀/y₀ 看偏导值变化', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x0', label: '观察点 x₀', type: 'slider', min: -2.5, max: 2.5, step: 0.1, value: 1.2 },
          { name: 'y0', label: '观察点 y₀', type: 'slider', min: -2.5, max: 2.5, step: 0.1, value: 0.8 },
        ],
        onControl: function (name, value, scene) {
          var px = name === 'x0' ? value : scene.layers[1].x;
          var py = name === 'y0' ? value : scene.layers[1].y;
          scene.layers[1].x = px; scene.layers[1].y = py;
          // f=x²-y²：∂f/∂x=2x，∂f/∂y=-2y。箭头方向带符号(负则反向)
          var dfx = 2 * px, dfy = -2 * py;
          // 箭头长度按偏导值缩放(限幅)，方向由符号决定
          var lenX = Math.max(-1.2, Math.min(1.2, dfx * 0.4));
          var lenY = Math.max(-1.2, Math.min(1.2, dfy * 0.4));
          scene.layers[2].from = [px, py];
          scene.layers[2].to = [px + lenX, py];
          scene.layers[3].from = [px, py];
          scene.layers[3].to = [px, py + lenY];
          scene.layers[5].text = '马鞍面 f=x²-y²：∂f/∂x=2x=' + dfx.toFixed(2) + '  ∂f/∂y=-2y=' + dfy.toFixed(2);
        },
      },

      // ===== Step 4：高阶偏导与混合偏导 =====
      {
        title: '高阶偏导与混合偏导',
        narrative: `偏导数本身也是多元函数，可以继续求偏导，得到**高阶偏导数**：

$$\\frac{\\partial^2 f}{\\partial x^2}, \\quad \\frac{\\partial^2 f}{\\partial y^2}, \\quad \\frac{\\partial^2 f}{\\partial x\\,\\partial y}, \\quad \\frac{\\partial^2 f}{\\partial y\\,\\partial x}$$

最后两个叫**混合偏导**——先对 $x$ 再对 $y$，或反过来。它们相等吗？

**克莱罗定理**（ Clairaut）：若 $\\frac{\\partial^2 f}{\\partial x\\,\\partial y}$ 和 $\\frac{\\partial^2 f}{\\partial y\\,\\partial x}$ 在点处**连续**，则

$$\\frac{\\partial^2 f}{\\partial x\\,\\partial y} = \\frac{\\partial^2 f}{\\partial y\\,\\partial x}$$

**先对谁求导无所谓**！这是多元微积分的优美结论。

**例子**：$f = x^2 y^3$。
- $f_x = 2xy^3$，$f_{xy} = 6xy^2$
- $f_y = 3x^2 y^2$，$f_{yx} = 6xy^2$
- 确实 $f_{xy} = f_{yx} = 6xy^2$ ✓

右侧用等高线密度变化展示二阶偏导的几何意义：
等高线**间距的变化率**反映了二阶偏导——密→疏表示凹，疏→密表示凸。`,

        scene: {
          axes: { xRange: [-3, 3], yRange: [-3, 3] },
          layers: [
            // f = x²y² 的等高线，等高线间距变化反映二阶偏导
            { type: 'contour', fn: 'x^2 * y^2', levels: [0.2, 0.8, 2, 4, 8], nx: 80, ny: 80, color: PURPLE, lineWidth: 1.2, opacity: 0.6 },
            { type: 'point', x: 1, y: 1, color: ORANGE, radius: 5, label: 'P' },
            { type: 'text', x: -2.8, y: 2.7, text: 'f=x²y² 等高线', color: PURPLE, fontSize: 11, align: 'left' },
            { type: 'text', x: -2.8, y: 2.3, text: 'fₓᵧ = fᵧₓ = 6xy² = 6.00（克莱罗成立 ✓）', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -2.8, y: 1.9, text: '拖 x₀/y₀ 验证两混合偏导恒等', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x0', label: '观察点 x₀', type: 'slider', min: -2, max: 2, step: 0.1, value: 1 },
          { name: 'y0', label: '观察点 y₀', type: 'slider', min: -2, max: 2, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          var px = name === 'x0' ? value : scene.layers[1].x;
          var py = name === 'y0' ? value : scene.layers[1].y;
          scene.layers[1].x = px; scene.layers[1].y = py;
          // f=x²y²：fₓ=2xy²，fₓᵧ=6xy²；fᵧ=2x²y，fᵧₓ=6xy² → 恒等
          var fxy = 6 * px * py * py;
          var fyx = 6 * px * py * py;
          var equal = Math.abs(fxy - fyx) < 1e-9;
          scene.layers[3].text = 'fₓᵧ=' + fxy.toFixed(2) + '，fᵧₓ=' + fyx.toFixed(2) + (equal ? '（克莱罗成立 ✓）' : '（不等 ✗）');
          scene.layers[3].color = equal ? GREEN : ORANGE;
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
