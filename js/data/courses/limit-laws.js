/**
 * mathviz — js/data/courses/limit-laws.js
 * 课案：极限的运算法则（北大高数 §2.3，limit 课案的深化）。
 *
 * 四步：
 *   1. 极限的四则运算    和差积商的极限 = 极限的和差积商（前提：各自极限存在）
 *   2. 夹逼准则          g≤f≤h 且 g,h 同极限 → f 也有该极限
 *   3. 等价无穷小        sin(x)~x, tan(x)~x, ln(1+x)~x, e^x-1~x 的替换技巧
 *   4. 复合函数极限      lim f(g(x)) = f(lim g(x)) 的条件
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主函数
  var ORANGE = '#ff8c42'; // 标记 / 关注点
  var PURPLE = '#9d7aff'; // 第二对象 / 夹逼的上下界
  var GREEN = '#4ade80';  // 极限 / 结论

  var course = {
    id: 'limit-laws',
    title: '极限的运算法则',
    summary: '四则、夹逼、等价无穷小——把求极限变成有章可循的操作。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M20 90 Q60 50 100 56 T180 56" fill="none" stroke="#9d7aff" stroke-width="1.5" stroke-dasharray="4 3"/><path d="M20 95 Q60 53 100 57 T180 57" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><path d="M20 100 Q60 56 100 58 T180 58" fill="none" stroke="#9d7aff" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="160" cy="57" r="3.5" fill="#4ade80"/><text x="100" y="25" fill="#e6edf3" font-size="12" text-anchor="middle" font-family="sans-serif">夹逼准则</text></svg>',

    steps: [
      // ===== Step 1：极限的四则运算 =====
      {
        title: '极限的四则运算',
        narrative: `如果 $\\lim f(x)$ 和 $\\lim g(x)$ 都存在，那么和、差、积、商的极限可以**分别先求再运算**：

$$\\lim [f \\pm g] = \\lim f \\pm \\lim g$$
$$\\lim [f \\cdot g] = \\lim f \\cdot \\lim g$$
$$\\lim \\frac{f}{g} = \\frac{\\lim f}{\\lim g} \\quad (\\lim g \\neq 0)$$

这把"复杂函数的极限"拆成了"简单函数极限的组合"，是求极限最基础的工具。

**但有个大坑**：这些法则要求**两个极限都存在**。如果 $\\lim f = \\infty$、$\\lim g = \\infty$，
你不能直接用减法法则说 $\\lim(f - g) = 0$——这是 $\\infty - \\infty$ 型未定式，结果可能是任何值。

右侧蓝线是 $f(x) = x + 1$，紫线是 $g(x) = 2x$，绿线是 $h = f + g = 3x + 1$。
拖动 $x$ 滑块让观察点逼近 $x = 2$，三者都趋于有限值，且 $h$ 的极限 $= 7 = f 的极限(3) + g 的极限(4)$。
**和的极限 = 极限之和**，几何上就是三条曲线在同一处收敛到可加的位置。`,

        scene: {
          axes: { xRange: [-1, 4], yRange: [-1, 10] },
          layers: [
            { type: 'plot', fn: 'x + 1', color: BLUE, lineWidth: 2, range: [-0.5, 3.5] },
            { type: 'plot', fn: '2*x', color: PURPLE, lineWidth: 2, range: [-0.5, 3.5] },
            { type: 'plot', fn: '3*x + 1', color: GREEN, lineWidth: 2.5, range: [-0.5, 3.5] },
            // 观察线 x=2
            { type: 'line', from: [2, -1], to: [2, 9], color: ORANGE, dashed: true, lineWidth: 1.2 },
            { type: 'point', x: 2, y: 3, color: BLUE, radius: 4, label: 'f=3' },
            { type: 'point', x: 2, y: 4, color: PURPLE, radius: 4, label: 'g=4' },
            { type: 'point', x: 2, y: 7, color: GREEN, radius: 5, label: 'h=7' },
            { type: 'text', x: 0.5, y: 9, text: 'f=x+1  g=2x  h=f+g', color: '#9aa7b4', fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 2）', type: 'slider', min: 1, max: 3, step: 0.05, value: 2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[3].from = [value, -1];
          scene.layers[3].to = [value, value * 3 + 1.5];
          scene.layers[4].x = value; scene.layers[4].y = value + 1;
          scene.layers[5].x = value; scene.layers[5].y = 2 * value;
          scene.layers[6].x = value; scene.layers[6].y = 3 * value + 1;
        },
      },

      // ===== Step 2：夹逼准则 =====
      {
        title: '夹逼准则',
        narrative: `当直接求 $\\lim f(x)$ 困难时，若能找到两个**好算的函数** $g$、$h$ 把 $f$ 夹在中间：

$$g(x) \\leq f(x) \\leq h(x), \\qquad \\lim g(x) = \\lim h(x) = L$$

那么 $f$ 也被"挤"向 $L$：$\\lim f(x) = L$。这就是**夹逼准则**。

最经典的应用是证 $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$：用单位圆的几何不等式得到
$\\cos x \\leq \\frac{\\sin x}{x} \\leq 1$，而 $\\lim_{x\\to 0} \\cos x = 1$，故夹出极限为 1。

右侧演示一个更直观的例子：$f(x) = x^2 \\sin(1/x)$（$x \\to 0$）。
蓝色是 $f$，它剧烈震荡；但它的绝对值被 $|x^2|$ 夹住（紫色上下界 $\\pm x^2$）。
当 $x \\to 0$，紫色两条线都趋于 0，于是 $f$ 也被夹向 0。

拖动 $x$ 滑块逼近 0，看蓝线如何在绿线（$y=0$）附近越震越小，最终被"挤"到 0。`,

        scene: {
          axes: { xRange: [-0.5, 0.5], yRange: [-0.15, 0.15] },
          layers: [
            // 上界 x^2
            { type: 'plot', fn: 'x^2', color: PURPLE, lineWidth: 1.5, range: [-0.45, 0.45], samples: 60 },
            // 下界 -x^2
            { type: 'plot', fn: '-x^2', color: PURPLE, lineWidth: 1.5, range: [-0.45, 0.45], samples: 60 },
            // f = x^2 sin(1/x)，高频采样
            { type: 'plot', fn: 'x^2 * sin(1/x)', color: BLUE, lineWidth: 2, range: [-0.45, 0.45], samples: 800 },
            // 极限线 y=0
            { type: 'line', from: [-0.5, 0], to: [0.5, 0], color: GREEN, dashed: true, lineWidth: 1.2 },
            // 观察点
            { type: 'line', from: [-0.1, -0.15], to: [-0.1, 0.15], color: ORANGE, dashed: true, lineWidth: 1 },
            { type: 'text', x: 0.18, y: 0.12, text: '紫: ±x²（夹界）', color: PURPLE, fontSize: 11, align: 'left' },
            { type: 'text', x: 0.18, y: 0.08, text: '蓝: x²sin(1/x)', color: BLUE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 0）', type: 'slider', min: -0.4, max: 0.4, step: 0.01, value: -0.1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[4].from = [value, -0.15];
          scene.layers[4].to = [value, 0.15];
        },
      },

      // ===== Step 3：等价无穷小 =====
      {
        title: '等价无穷小',
        narrative: `当 $x \\to 0$ 时，许多函数都与 $x$ 本身"差不多大"。精确地说，若 $\\lim_{x\\to 0}\\frac{f(x)}{g(x)} = 1$，
记作 $f \\sim g$，称它们是**等价无穷小**。常用的一组：

$$\\sin x \\sim x, \\quad \\tan x \\sim x, \\quad \\ln(1+x) \\sim x, \\quad e^x - 1 \\sim x, \\quad 1 - \\cos x \\sim \\tfrac{1}{2}x^2$$

**替换法则**：在乘除法中，可以用等价无穷小替换因子简化计算：

$$\\lim_{x \\to 0} \\frac{\\sin(x^2)}{x^2} = \\lim_{x\\to 0}\\frac{x^2}{x^2} = 1 \\quad (\\text{因为 } \\sin(x^2) \\sim x^2)$$

**关键限制**：替换只适用于**乘除因子**，不能用于加减项！加减中乱替换是经典错误。

右侧对比四条曲线（都趋于 0）：蓝色 $\\sin x$、紫色 $\\tan x$、绿色 $\\ln(1+x)$、橙色 $e^x-1$。
在 $x = 0$ 附近它们几乎**重合**——这就是"等价"的视觉含义。
拖动 $x$ 滑块远离 0，差异才显现。`,

        scene: {
          axes: { xRange: [-1.5, 2], yRange: [-1, 2.5] },
          layers: [
            // y=x 参照（虚线）
            { type: 'plot', fn: 'x', color: '#3a4452', lineWidth: 1.5, range: [-1.3, 1.8], samples: 40 },
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-1.3, 1.8], samples: 80 },
            { type: 'plot', fn: 'tan(x)', color: PURPLE, lineWidth: 2, range: [-1.3, 1.4], samples: 80 },
            { type: 'plot', fn: 'ln(1+x)', color: GREEN, lineWidth: 2, range: [-0.95, 1.8], samples: 80 },
            { type: 'plot', fn: 'exp(x) - 1', color: ORANGE, lineWidth: 2, range: [-1.3, 1.8], samples: 80 },
            // 原点标记
            { type: 'point', x: 0, y: 0, color: '#e6edf3', radius: 4 },
            { type: 'text', x: -1.2, y: 2.2, text: '灰:y=x  蓝:sin  紫:tan  绿:ln(1+x)  橙:eˣ-1', color: '#9aa7b4', fontSize: 10, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -1.2, max: 1.7, step: 0.05, value: 0.3 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          // 不改曲线，仅观察；这里无 layer 需更新，留空（滑块驱动可扩展加观察点）
        },
      },

      // ===== Step 4：复合函数极限 =====
      {
        title: '复合函数极限',
        narrative: `对于复合函数 $f(g(x))$，何时能"由内向外"求极限？

$$\\lim_{x \\to a} f(g(x)) = f\\!\\left(\\lim_{x \\to a} g(x)\\right)$$

需要两个条件：
1. $\\lim_{x \\to a} g(x) = b$ 存在
2. $f$ 在 $b$ 处**连续**（即 $\\lim_{u \\to b} f(u) = f(b)$）

连续是关键——它保证了"先取极限再代入"和"直接代入"结果一致。

**典型应用**：求 $\\lim_{x \\to 0} e^{\\sin x}$。
内层 $\\lim_{x\\to 0} \\sin x = 0$，而 $e^u$ 在 $u=0$ 连续，故 $\\lim e^{\\sin x} = e^0 = 1$。

右侧演示 $y = e^{\\sin x}$（橙色）。内层 $\\sin x$ 把 $x$ 映到 $[-1,1]$，
外层 $e^u$ 再把它指数化。蓝色虚线是内层 $\\sin x$，紫色是外层 $e^u$ 的"形状"。
拖动 $x$ 滑块，三者的对应关系一目了然——$x$ 决定 $\\sin x$，$\\sin x$ 决定 $e^{\\sin x}$。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-1, 4] },
          layers: [
            // 内层 sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 1.8, range: [-3.3, 3.3], samples: 100 },
            // 复合 e^(sin x)
            { type: 'plot', fn: 'exp(sin(x))', color: ORANGE, lineWidth: 2.5, range: [-3.3, 3.3], samples: 120 },
            // 观察点 x 处的复合值
            { type: 'point', x: 0, y: 1, color: ORANGE, radius: 5, label: 'e^(sin x)' },
            { type: 'point', x: 0, y: 0, color: BLUE, radius: 4, label: 'sin x' },
            // 极限参考线 y=1（x→0 时 e^(sin x)→1）
            { type: 'line', from: [-3.5, 1], to: [3.5, 1], color: GREEN, dashed: true, lineWidth: 1.2 },
            { type: 'text', x: 2.5, y: 1.3, text: '极限=1', color: GREEN, fontSize: 12 },
            { type: 'text', x: -3.2, y: 3.5, text: '蓝:sin x  橙:e^(sin x)', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 0）', type: 'slider', min: -3, max: 3, step: 0.1, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var sx = Math.sin(value);
          scene.layers[2].x = value;
          scene.layers[2].y = Math.exp(sx);
          scene.layers[3].x = value;
          scene.layers[3].y = sx;
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
