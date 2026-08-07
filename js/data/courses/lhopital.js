/**
 * mathviz — js/data/courses/lhopital.js
 * 课案：洛必达法则（北大高数 §4.2，批次 2 第一套）。
 *
 * 四步：
 *   1. 未定式         0/0 与 ∞/∞，直接代入失效
 *   2. 0/0 型洛必达    lim f/g = lim f'/g'
 *   3. ∞/∞ 型          同样适用
 *   4. 多次应用与陷阱  反复求导、注意验证条件
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 分子 f
  var ORANGE = '#ff8c42'; // 分母 g / 标记
  var PURPLE = '#9d7aff'; // 比值 f/g
  var GREEN = '#4ade80';  // 极限值 / 结论

  var course = {
    id: 'lhopital',
    title: '洛必达法则',
    summary: '0/0 与 ∞/∞ 怎么办？对分子分母同时求导再取极限。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M30 95 Q70 50 100 40 T170 35" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><path d="M30 90 Q70 55 100 45 T170 40" fill="none" stroke="#ff8c42" stroke-width="2.5"/><line x1="95" y1="20" x2="95" y2="100" stroke="#9d7aff" stroke-width="1" stroke-dasharray="3 3"/><text x="100" y="18" fill="#4ade80" font-size="12" text-anchor="middle" font-family="sans-serif">lim f/g = L</text><text x="100" y="108" fill="#9aa7b4" font-size="9" text-anchor="middle" font-family="sans-serif">x→a</text></svg>',

    steps: [
      // ===== Step 1：未定式 =====
      {
        title: '什么是未定式',
        narrative: `求 $\\lim_{x \\to a} \\frac{f(x)}{g(x)}$ 时，若直接代入得到 $\\frac{0}{0}$ 或 $\\frac{\\infty}{\\infty}$，
极限法则失效——这就是**未定式**。

**0/0 型**：分子分母同时趋于 0。比如 $\\lim_{x\\to 0}\\frac{\\sin x}{x}$，代入得 $0/0$。
比值到底是多少？0、1、还是别的？**无法直接判断**。

**∞/∞ 型**：分子分母同时趋于无穷。比如 $\\lim_{x\\to\\infty}\\frac{x^2}{e^x}$，两边都爆炸。
谁爆得更快？比值趋于 0 还是 ∞？同样**不确定**。

右侧演示 0/0 型：蓝色分子 $f(x) = 1 - \\cos x$，橙色分母 $g(x) = x^2/2$，
紫色是比值 $f/g$。当 $x \\to 0$，蓝橙都趋于 0，但紫色比值稳定地趋于 **1**（绿色虚线）。

拖动 $x$ 滑块逼近 0，看比值如何贴近 1。这就是未定式"看似无定、实则有定"的本质——
需要更精细的工具（洛必达法则）来揭示。`,

        scene: {
          axes: { xRange: [-1.5, 1.5], yRange: [-0.3, 1.5] },
          layers: [
            // 分子 1-cos(x)
            { type: 'plot', fn: '1 - cos(x)', color: BLUE, lineWidth: 2.5, range: [-1.3, 1.3], samples: 80 },
            // 分母 x²/2
            { type: 'plot', fn: 'x^2/2', color: ORANGE, lineWidth: 2.5, range: [-1.3, 1.3], samples: 60 },
            // 比值 (1-cos x)/(x²/2) = 2(1-cos x)/x²
            { type: 'plot', fn: '2*(1 - cos(x))/(x^2)', color: PURPLE, lineWidth: 2, range: [-1.3, 1.3], samples: 200 },
            // 极限线 y=1
            { type: 'line', from: [-1.5, 1], to: [1.5, 1], color: GREEN, dashed: true, lineWidth: 1.5 },
            // 观察线
            { type: 'line', from: [0.3, -0.3], to: [0.3, 1.5], color: '#9aa7b4', dashed: true, lineWidth: 1 },
            { type: 'text', x: -1.3, y: 1.4, text: '蓝:1-cos x  橙:x²/2  紫:比值→1', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 0）', type: 'slider', min: -1.2, max: 1.2, step: 0.02, value: 0.3 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[4].from = [value, -0.3];
          scene.layers[4].to = [value, 1.5];
        },
      },

      // ===== Step 2：0/0 型洛必达 =====
      {
        title: '0/0 型：对分子分母求导',
        narrative: `洛必达法则的核心洞察——当 $\\frac{f(x)}{g(x)}$ 是 $\\frac{0}{0}$ 型时：

$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}$$

**对分子分母分别求导，再取极限**。如果新的极限存在（或为 ∞），就是答案。

**为什么有效？** 几何直觉：$f(a) = g(a) = 0$ 时，比值 $\\frac{f(x)}{g(x)}$ 在 $a$ 附近的行为，
由两条曲线**离开 0 的速度**决定，而这个速度正是导数 $f'$、$g'$。
所以把 $f/g$ 换成 $f'/g'$ 是合理的。

**经典例子**：$\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}$（0/0 型）。

求导：分子 $\\to e^x - 1$，分母 $\\to 2x$。代入仍得 $\\frac{0}{0}$，**继续洛必达**！
再求导：分子 $\\to e^x$，分母 $\\to 2$。代入得 $\\frac{1}{2}$。

右侧蓝色是 $\\frac{e^x-1-x}{x^2}$，它在 $x=0$ 处趋于 $1/2$（绿色虚线）。
橙色虚线是第一次洛必达后的 $\\frac{e^x-1}{2x}$（仍 0/0），紫色是第二次后的 $\\frac{e^x}{2}$（已定型）。
**每求一次导，曲线就更"平坦"，极限逐渐显形。**`,

        scene: {
          axes: { xRange: [-1, 2], yRange: [-0.3, 2.5] },
          layers: [
            // 原比值（在 x=0 附近用高采样避免 NaN，x=0 处引擎跳过）
            { type: 'plot', fn: '(exp(x) - 1 - x)/(x^2)', color: BLUE, lineWidth: 2.5, range: [-0.95, 1.8], samples: 300 },
            // 第一次洛必达 (e^x-1)/(2x)
            { type: 'plot', fn: '(exp(x) - 1)/(2*x)', color: ORANGE, lineWidth: 1.8, range: [-0.95, 1.8], samples: 200 },
            // 第二次洛必达 e^x/2（定型）
            { type: 'plot', fn: 'exp(x)/2', color: PURPLE, lineWidth: 1.8, range: [-0.95, 1.8], samples: 60 },
            // 极限线 0.5
            { type: 'line', from: [-1, 0.5], to: [2, 0.5], color: GREEN, dashed: true, lineWidth: 1.5 },
            // 观察竖线
            { type: 'line', from: [0.5, -0.3], to: [0.5, 2.5], color: '#9aa7b4', dashed: true, lineWidth: 1 },
            { type: 'text', x: 1, y: 0.4, text: 'L=1/2', color: GREEN, fontSize: 13 },
            { type: 'text', x: -0.9, y: 2.3, text: '蓝:原式  橙:1次洛必达  紫:2次(定型)', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: -0.9, y: 1.9, text: '拖 x→0，三曲线同趋 0.5', color: '#4ade80', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 0）', type: 'slider', min: -0.9, max: 1.8, step: 0.02, value: 0.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x = value;
          scene.layers[4].from = [x, -0.3];
          scene.layers[4].to = [x, 2.5];
          // 三条曲线在 x 处的值(x=0 时取极限 0.5)
          var v1, v2, v3;
          if (Math.abs(x) < 0.001) { v1 = v2 = v3 = 0.5; }
          else {
            v1 = (Math.exp(x) - 1 - x) / (x * x);
            v2 = (Math.exp(x) - 1) / (2 * x);
            v3 = Math.exp(x) / 2;
          }
          scene.layers[7].text = 'x=' + x.toFixed(3) + '  蓝=' + v1.toFixed(3) + '  橙=' + v2.toFixed(3) + '  紫=' + v3.toFixed(3);
        },
      },

      // ===== Step 3：∞/∞ 型 =====
      {
        title: '∞/∞ 型：无穷之间的较量',
        narrative: `洛必达法则同样适用于 $\\frac{\\infty}{\\infty}$ 型：

$$\\lim_{x \\to \\infty} \\frac{f(x)}{g(x)} = \\lim_{x \\to \\infty} \\frac{f'(x)}{g'(x)}$$

关键问题：**两个都趋于无穷的函数，谁增长得更快？**

- 多项式 vs 多项式：看最高次幂。$\\frac{x^3}{x^2} \\to \\infty$（分子更快）
- 多项式 vs 指数：指数永远赢。$\\frac{x^{100}}{e^x} \\to 0$（$e^x$ 暴打任何多项式）
- 指数 vs 对数：指数赢。$\\frac{\\ln x}{x} \\to 0$

**经典例子**：$\\lim_{x \\to \\infty} \\frac{\\ln x}{x}$。

洛必达：分子 $\\to \\frac{1}{x}$，分母 $\\to 1$。$\\frac{1/x}{1} = \\frac{1}{x} \\to 0$。

右侧演示这场较量。蓝色 $\\ln x$（增长极慢），橙色 $x$（线性）。
拖动 $x$ 滑块增大，看蓝色被橙色**远远甩开**——对数增长在多项式面前几乎"停滞"。
紫色虚线是比值 $\\ln x / x$，稳定地贴向 0（绿色虚线）。

> 记住增长速度的阶层：$\\ln x \\ll x^a \\ll b^x \\ll x!$（$a>0, b>1$）。`,

        scene: {
          axes: { xRange: [0.5, 15], yRange: [-0.5, 8] },
          layers: [
            // ln(x)
            { type: 'plot', fn: 'ln(x)', color: BLUE, lineWidth: 2.5, range: [0.6, 14.5], samples: 100 },
            // x
            { type: 'plot', fn: 'x', color: ORANGE, lineWidth: 2.5, range: [0.6, 7.5], samples: 40 },
            // 比值 ln(x)/x
            { type: 'plot', fn: 'ln(x)/x', color: PURPLE, lineWidth: 2, range: [0.6, 14.5], samples: 100 },
            // 极限线 0
            { type: 'line', from: [0.5, 0], to: [15, 0], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 10, y: 7, text: '蓝:ln x（慢）  橙:x（快）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 10, y: 6, text: '紫:比值 ln x/x → 0', color: PURPLE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 ∞）', type: 'slider', min: 1, max: 14, step: 0.5, value: 5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          // 仅观察，曲线不变
        },
      },

      // ===== Step 4：多次应用与陷阱 =====
      {
        title: '多次应用与常见陷阱',
        narrative: `洛必达法则可以**反复使用**——只要每次应用后仍是未定式：

$$\\frac{f}{g} \\xrightarrow{L'H} \\frac{f'}{g'} \\xrightarrow{L'H} \\frac{f''}{g''} \\to \\cdots \\to \\text{定型}$$

但有几个**致命陷阱**，踩中就全错：

**陷阱 1：忘记验证未定式**
洛必达只对 $\\frac{0}{0}$ 或 $\\frac{\\infty}{\\infty}$ 有效。如果直接代入已得 $\\frac{3}{5}$，**不能用**！
错误地对 $\\frac{x}{x+1}$（$x\\to 0$，极限 $\\frac{0}{1}=0$）用洛必达，会得到 $\\frac{1}{1}=1$，完全错误。

**陷阱 2：循环**
求 $\\lim_{x\\to\\infty}\\frac{e^x+e^{-x}}{e^x-e^{-x}}$。洛必达得 $\\frac{e^x-e^{-x}}{e^x+e^{-x}}$，
再做又回到原式——**无限循环**！正确做法是分子分母同除 $e^x$：$\\frac{1+e^{-2x}}{1-e^{-2x}}\\to 1$。

**陷阱 3：导数极限不存在 ≠ 原极限不存在**
若 $\\lim f'/g'$ 不存在（震荡），**不能**推出 $\\lim f/g$ 也不存在——可能原极限存在但洛必达失效。

右侧演示陷阱 2 的循环：蓝橙两条曲线在洛必达后**互换**，永远绕圈。
遇到循环，果断换方法（同除、等价无穷小、泰勒展开）。`,

        scene: {
          axes: { xRange: [-1, 6], yRange: [-0.5, 3] },
          layers: [
            // (e^x + e^-x)/(e^x - e^-x)，真实极限=1
            { type: 'plot', fn: '(exp(x) + exp(-x))/(exp(x) - exp(-x))', color: BLUE, lineWidth: 2.5, range: [0.1, 5.8], samples: 100 },
            // 洛必达后 (e^x - e^-x)/(e^x + e^-x)，与原式互为倒数
            { type: 'plot', fn: '(exp(x) - exp(-x))/(exp(x) + exp(-x))', color: ORANGE, lineWidth: 2.5, range: [0.1, 5.8], samples: 100 },
            // 极限线 1
            { type: 'line', from: [-1, 1], to: [6, 1], color: GREEN, dashed: true, lineWidth: 1.5 },
            // 观察竖线
            { type: 'line', from: [2, -0.5], to: [2, 3], color: '#9aa7b4', dashed: true, lineWidth: 1 },
            { type: 'text', x: 3, y: 2.5, text: '蓝:原式 → 1', color: BLUE, fontSize: 12, align: 'left' },
            { type: 'text', x: 3, y: 2.1, text: '橙:洛必达后 → 1（互为倒数）', color: ORANGE, fontSize: 12, align: 'left' },
            { type: 'text', x: 3, y: 1.7, text: '⚠ 洛必达看似“没用”，但极限确为 1', color: GREEN, fontSize: 11, align: 'left' },
            { type: 'text', x: -0.9, y: 2.8, text: '拖 x 增大，两曲线同趋 1', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 ∞）', type: 'slider', min: 0.2, max: 5.5, step: 0.05, value: 2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x = value;
          scene.layers[3].from = [x, -0.5];
          scene.layers[3].to = [x, 3];
          var ex = Math.exp(x), emx = Math.exp(-x);
          var v1 = (ex + emx) / (ex - emx);
          var v2 = (ex - emx) / (ex + emx);
          scene.layers[7].text = 'x=' + x.toFixed(2) + '  蓝=' + v1.toFixed(3) + '  橙=' + v2.toFixed(3) + '（积=' + (v1 * v2).toFixed(3) + '）';
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
