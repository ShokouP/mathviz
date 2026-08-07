/**
 * mathviz — js/data/courses/newtons-method.js
 * 课案：牛顿法（北大高数 §4.7，方程近似解）。
 *
 * 四步：
 *   1. 迭代公式        x_{n+1} = x_n - f(x_n)/f'(x_n)
 *   2. 几何直觉        切线与 x 轴交点 = 下一个近似
 *   3. 二次收敛        误差平方衰减，位数翻倍
 *   4. 陷阱与对策      初值敏感、f'=0 失效、循环
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 *   示例函数 f(x)=x^2-2（求 √2），迭代 x_{n+1}=(x_n+2/x_n)/2。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 原函数 f
  var ORANGE = '#ff8c42'; // 当前点 / 切线
  var PURPLE = '#9d7aff'; // 根 / 收敛点
  var GREEN = '#4ade80';  // 结论 / 误差

  // 求解 f(x)=x^2-2=0，真根 √2≈1.41421
  var TRUE_ROOT = Math.sqrt(2);

  // 牛顿迭代一步：x_{n+1} = x_n - f(x_n)/f'(x_n) = x_n - (x_n^2-2)/(2x_n)
  function newtonStep(x) {
    return x - (x * x - 2) / (2 * x);
  }

  var course = {
    id: 'newtons-method',
    title: '牛顿法：方程求根',
    summary: '用切线代替曲线，让交点一步步逼近方程的根。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="10" y1="95" x2="190" y2="95" stroke="rgba(255,255,255,0.2)" stroke-width="1"/><path d="M20 95 Q50 30 100 20 T180 10" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><line x1="70" y1="55" x2="130" y2="95" stroke="#ff8c42" stroke-width="2" stroke-dasharray="4,3"/><circle cx="70" cy="55" r="4" fill="#ff8c42"/><circle cx="130" cy="95" r="4" fill="#9d7aff"/><text x="100" y="108" fill="#9aa7b4" font-size="9" text-anchor="middle" font-family="sans-serif">切线交点→根</text></svg>',

    steps: [
      // ===== Step 1：迭代公式 =====
      {
        title: '迭代公式：切线代曲线',
        narrative: `求方程 $f(x) = 0$ 的根，是数学里最古老的问题之一。$x^2 = 2$ 的根 $\\sqrt{2}$，两千年前就让毕达哥拉斯学派抓狂。

**牛顿法的核心思想**：函数曲线太复杂，但**切线很简单**——用切线代替曲线，找切线与 $x$ 轴的交点，作为根的新近似。

设在 $x_n$ 处作切线，切线方程为：
$$y = f(x_n) + f'(x_n)(x - x_n)$$

令 $y=0$（与 $x$ 轴交点），解出：
$$\\boxed{\\,x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}\\,}$$

这就是**牛顿迭代公式**。每一步把 $x_n$ 换成切线交点 $x_{n+1}$，反复进行。

**例子**：求 $f(x)=x^2-2=0$ 的正根（即 $\\sqrt{2}$）。
$f'(x)=2x$，代入公式：
$$x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n} = \\frac{1}{2}\\left(x_n + \\frac{2}{x_n}\\right)$$

右侧蓝色是 $f(x)=x^2-2$，橙色切线在当前 $x_n$ 处与 $x$ 轴交于 $x_{n+1}$（紫色）。
拖动 $x_n$ 滑块，观察切线交点如何靠近真根 $\\sqrt{2}\\approx 1.414$。`,

        scene: {
          axes: { xRange: [-0.5, 3.5], yRange: [-2.5, 8] },
          layers: [
            // f(x) = x^2 - 2
            { type: 'plot', fn: 'x^2 - 2', color: BLUE, lineWidth: 2.5, range: [0, 3], samples: 80 },
            // x 轴
            { type: 'line', from: [-0.5, 0], to: [3.5, 0], color: '#3a4452', lineWidth: 1 },
            // 真根 √2
            { type: 'point', x: TRUE_ROOT, y: 0, color: PURPLE, radius: 6, label: '√2≈1.414' },
            // 当前点 (x_n, f(x_n))
            { type: 'point', x: 2.5, y: 4.25, color: ORANGE, radius: 5, label: '(xₙ, f(xₙ))' },
            // 切线（在 x_n=2.5 处，斜率=2·2.5=5）
            { type: 'tangent', fn: 'x^2 - 2', at: 2.5, color: ORANGE, dashed: false, halfLen: 2, lineWidth: 2 },
            // 切线与 x 轴交点 x_{n+1}
            { type: 'point', x: 1.65, y: 0, color: GREEN, radius: 5, label: 'x₊₁=1.65' },
            { type: 'text', x: 1.8, y: 7, text: '蓝:f=x²−2  橙:切线  紫:真根  绿:x₊₁', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: 1.8, y: 6.3, text: '拖 xₙ 看切线交点逼近 √2', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'xn', label: '当前点 xₙ', type: 'slider', min: 1.1, max: 3.2, step: 0.05, value: 2.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'xn') return;
          var xn = value;
          var fxn = xn * xn - 2;
          // x_{n+1} = xn - f(xn)/f'(xn)
          var xnext = newtonStep(xn);
          // 当前点
          scene.layers[3].x = xn;
          scene.layers[3].y = fxn;
          scene.layers[3].label = '(xₙ=' + xn.toFixed(2) + ', f=' + fxn.toFixed(2) + ')';
          // 切线 at 更新
          scene.layers[4].at = xn;
          // 交点 x_{n+1}
          scene.layers[5].x = xnext;
          scene.layers[5].label = 'x₊₁=' + xnext.toFixed(3);
          scene.layers[7].text = 'xₙ=' + xn.toFixed(2) + ' → x₊₁=' + xnext.toFixed(3) + '（真根 1.414，误差 ' + Math.abs(xnext - TRUE_ROOT).toFixed(3) + '）';
        },
      },

      // ===== Step 2：几何直觉 =====
      {
        title: '几何画面：交点逐级逼近',
        narrative: `把牛顿法画出来，你会看到一条优美的**收敛轨迹**。

每一步：在当前 $x_n$ 处向上/下走到曲线（点 $(x_n, f(x_n))$），作切线，切线与 $x$ 轴的交点就是 $x_{n+1}$。然后从 $x_{n+1}$ 重复。

右侧追踪前 3 次迭代（从 $x_0=3$ 出发）：
- $x_0 = 3.000$（远离根，切线很陡）
- $x_1 = 1.833$（一步就跨过大半距离！）
- $x_2 = 1.462$（已经很接近 $\\sqrt{2}$）
- $x_3 = 1.415$（误差 $< 10^{-3}$）

拖动滑块**设定起始点 $x_0$**，看迭代序列如何迅速收向 $\\sqrt{2}$。橙色折线是 $x$ 轴上的逼近路径，绿色竖线标出每步位置。

> 几何直觉：切线把曲线"拉直"，交点天然比原点更靠近根。这正是"以直代曲"的威力。`,

        scene: {
          axes: { xRange: [0, 3.5], yRange: [-2.5, 8] },
          layers: [
            // f(x)
            { type: 'plot', fn: 'x^2 - 2', color: BLUE, lineWidth: 2.5, range: [0.1, 3.3], samples: 80 },
            // x 轴
            { type: 'line', from: [0, 0], to: [3.5, 0], color: '#3a4452', lineWidth: 1 },
            // 真根
            { type: 'point', x: TRUE_ROOT, y: 0, color: PURPLE, radius: 6, label: '√2' },
            // 迭代点（绿色竖线 + 标记）—— 由 onControl 重建
            { type: 'line', from: [3, 0], to: [3, 8], color: GREEN, dashed: true, lineWidth: 1.2 },
            { type: 'point', x: 3, y: 0, color: GREEN, radius: 4, label: 'x₀' },
            { type: 'point', x: 1.833, y: 0, color: GREEN, radius: 4, label: 'x₁' },
            { type: 'point', x: 1.462, y: 0, color: GREEN, radius: 4, label: 'x₂' },
            { type: 'point', x: 1.415, y: 0, color: GREEN, radius: 4, label: 'x₃' },
            { type: 'text', x: 1.8, y: 7, text: '从 x₀=3.00 出发，4 步收敛到 √2', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 1.8, y: 6.3, text: 'x: 3.000→1.833→1.462→1.415', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x0', label: '起始点 x₀', type: 'slider', min: 1.2, max: 3.2, step: 0.05, value: 3 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x0') return;
          // 跑 4 次牛顿迭代
          var xs = [value];
          for (var i = 0; i < 3; i++) xs.push(newtonStep(xs[i]));
          // 更新四个迭代点 + 起始竖线
          scene.layers[3].from = [xs[0], 0];
          scene.layers[3].to = [xs[0], 8];
          scene.layers[4].x = xs[0]; scene.layers[4].label = 'x₀=' + xs[0].toFixed(2);
          scene.layers[5].x = xs[1]; scene.layers[5].label = 'x₁=' + xs[1].toFixed(3);
          scene.layers[6].x = xs[2]; scene.layers[6].label = 'x₂=' + xs[2].toFixed(3);
          scene.layers[7].x = xs[3]; scene.layers[7].label = 'x₃=' + xs[3].toFixed(4);
          scene.layers[9].text = '从 x₀=' + xs[0].toFixed(2) + ' 出发，4 步收敛到 √2';
          scene.layers[10].text = 'x: ' + xs[0].toFixed(3) + '→' + xs[1].toFixed(3) + '→' + xs[2].toFixed(3) + '→' + xs[3].toFixed(4);
        },
      },

      // ===== Step 3：二次收敛 =====
      {
        title: '二次收敛：误差平方衰减',
        narrative: `牛顿法最惊人的性质是**二次收敛**（quadratic convergence）：每步迭代，误差大致**平方**地减小。

设 $e_n = x_n - r$（$r$ 是真根），则：
$$e_{n+1} \\approx \\frac{f''(r)}{2f'(r)} \\, e_n^2 = C \\, e_n^2$$

**直觉**：误差从 $0.1$ 到 $0.01$ 需要 1 步，从 $0.01$ 到 $0.0001$ 也只需 1 步——**有效位数每步翻倍**！

右侧用对数刻度展示 $f(x)=x^2-2$ 的误差 $|x_n - \\sqrt{2}|$：
- $e_0 \\approx 1.6$（$x_0=3$）
- $e_1 \\approx 0.42$
- $e_2 \\approx 0.048$
- $e_3 \\approx 0.0008$
- $e_4 \\approx 2\\times 10^{-7}$（突然爆炸到 7 位精度！）

拖动滑块看不同 $x_0$ 的误差序列。对比**二分法**（每步误差仅减半，线性收敛），牛顿法快得多——这就是它成为数值计算主力工具的原因。

> 代价：二次收敛只在**靠近根**时成立。离根远时（尤其初值不好），可能慢、可能发散。下一页讲陷阱。`,

        scene: {
          axes: { xRange: [-0.5, 6], yRange: [-1, 12] },
          layers: [
            // 误差点（对数纵轴：log10(e)）：初始 x0=3
            // 用 point 散点画误差衰减，onControl 重建
            { type: 'point', x: 0, y: 0.2, color: GREEN, radius: 5, label: 'e₀=1.6' },
            { type: 'point', x: 1, y: -0.38, color: GREEN, radius: 5, label: 'e₁=0.42' },
            { type: 'point', x: 2, y: -1.32, color: GREEN, radius: 5, label: 'e₂=0.05' },
            { type: 'point', x: 3, y: -3.1, color: GREEN, radius: 5, label: 'e₃=8e-4' },
            { type: 'point', x: 4, y: -6.7, color: GREEN, radius: 5, label: 'e₄=2e-7' },
            // 参照线：线性收敛（二分法，斜率=1，每步减半 → log10(e) 每步 -0.3）
            { type: 'line', from: [0, 0.2], to: [4, 0.2 - 4 * 0.3], color: ORANGE, lineWidth: 1.5, dashed: true },
            // 坐标轴标注
            { type: 'line', from: [-0.5, -8], to: [6, -8], color: '#3a4452', lineWidth: 1 },
            { type: 'text', x: 4.2, y: 11, text: '绿:牛顿(二次)  橙:二分法(线性)', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: 2.5, y: -2.5, text: '纵轴:log₁₀(误差)，每格 10 倍', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: 4.2, y: 10.3, text: '牛顿法有效位数每步翻倍', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x0', label: '起始点 x₀', type: 'slider', min: 1.3, max: 3, step: 0.05, value: 3 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x0') return;
          // 跑 5 次迭代，算误差的对数
          var xs = [value];
          for (var i = 0; i < 4; i++) xs.push(newtonStep(xs[i]));
          var logE = [];
          for (var j = 0; j < 5; j++) {
            var e = Math.abs(xs[j] - TRUE_ROOT);
            logE.push(e > 1e-15 ? Math.log10(e) : -15);
          }
          // 5 个误差点
          var labels = ['e₀', 'e₁', 'e₂', 'e₃', 'e₄'];
          for (var k = 0; k < 5; k++) {
            scene.layers[k].x = k;
            scene.layers[k].y = logE[k];
            scene.layers[k].label = labels[k] + '=' + (Math.abs(xs[k] - TRUE_ROOT)).toExponential(1);
          }
          // 线性收敛参照（从 e0 起，每步 -0.3）
          scene.layers[5].from = [0, logE[0]];
          scene.layers[5].to = [4, logE[0] - 4 * 0.3];
        },
      },

      // ===== Step 4：陷阱与对策 =====
      {
        title: '陷阱：初值、驻点与循环',
        narrative: `牛顿法很强大，但**不是万能的**。三个经典陷阱：

**陷阱 1：初值离根太远 → 发散或收敛到错误的根**
若 $x_0$ 离根很远，切线方向可能把迭代带向另一个根，甚至越走越远。
对策：先画图估计根的大致位置，或先用二分法缩小范围，再换牛顿法加速。

**陷阱 2：$f'(x_n) = 0$ → 切线水平，永不交 $x$ 轴**
此时 $x_{n+1} = x_n - f(x_n)/0 = \\infty$，公式**崩溃**。
例如求 $f(x)=x^3$ 的根（三重根 $r=0$），在 $x_n$ 接近 0 时 $f'(x_n)=3x_n^2\\to 0$，迭代极慢且不稳定。

**陷阱 3：循环（极限环）**
某些函数的牛顿迭代会陷入**周期循环**——$x_0 \\to x_1 \\to x_0 \\to \\cdots$，永远不收敛。
经典反例：$f(x)=x^3-2x+2$，$x_0=0$ 时迭代在 $0 \\leftrightarrow 2$ 间来回跳。

右侧演示陷阱 2：$f(x)=x^3$（紫色），在 $x=0$ 附近导数趋近 0。
拖动 $x_n$ 滑块靠近 0，看切线（橙色）变得**几乎水平**——交点 $x_{n+1}$ 飞到极远处（发散）。

> 实战对策：限制每步最大位移、检测 $f'(x_n)$ 过小则改用二分法、监控是否循环。鲁棒的求根算法（如 Brent 方法）正是牛顿法与二分法的**自适应混合**。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-4, 4] },
          layers: [
            // f(x) = x^3（三重根，导数在 0 处为 0）
            { type: 'plot', fn: 'x^3', color: PURPLE, lineWidth: 2.5, range: [-1.6, 1.6], samples: 80 },
            // x 轴
            { type: 'line', from: [-2.5, 0], to: [2.5, 0], color: '#3a4452', lineWidth: 1 },
            // 三重根 r=0
            { type: 'point', x: 0, y: 0, color: BLUE, radius: 6, label: '三重根 r=0' },
            // 当前点
            { type: 'point', x: 0.8, y: 0.512, color: ORANGE, radius: 5, label: 'xₙ' },
            // 切线（在 x_n=0.8，斜率=3·0.64=1.92）
            { type: 'tangent', fn: 'x^3', at: 0.8, color: ORANGE, dashed: false, halfLen: 1.5, lineWidth: 2 },
            // 交点 x_{n+1}
            { type: 'point', x: 0.533, y: 0, color: GREEN, radius: 5, label: 'x₊₁' },
            { type: 'text', x: -2.3, y: 3.5, text: '紫:f=x³（三重根，f′(0)=0）', color: PURPLE, fontSize: 11, align: 'left' },
            { type: 'text', x: -2.3, y: 3, text: '拖 xₙ→0：切线变平，x₊₁ 飞远', color: ORANGE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'xn', label: '当前点 xₙ（靠近 0 试试）', type: 'slider', min: -1.5, max: 1.5, step: 0.02, value: 0.8 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'xn') return;
          var xn = value;
          var fxn = xn * xn * xn;       // f(x)=x³
          var dfxn = 3 * xn * xn;        // f'(x)=3x²
          // 当前点
          scene.layers[3].x = xn;
          scene.layers[3].y = fxn;
          scene.layers[3].label = 'xₙ=' + xn.toFixed(2);
          // 切线
          scene.layers[4].at = xn;
          // x_{n+1} = xn - f(xn)/f'(xn)
          var xnext;
          var danger = Math.abs(dfxn) < 0.3;
          if (Math.abs(dfxn) < 1e-6) {
            xnext = xn > 0 ? 1000 : -1000; // 切线水平，发散
          } else {
            xnext = xn - fxn / dfxn;
          }
          scene.layers[5].x = Math.max(-2.5, Math.min(2.5, xnext));
          scene.layers[5].label = danger ? '⚠ f′≈0，发散！' : 'x₊₁=' + xnext.toFixed(3);
          scene.layers[5].color = danger ? '#ff5555' : GREEN;
          scene.layers[7].text = 'xₙ=' + xn.toFixed(2) + '  f′(xₙ)=' + dfn_fmt(dfxn) + (danger ? '  ⚠ 切线太平，迭代失效' : '  x₊₁=' + xnext.toFixed(3));
        },
      },
    ],
  };

  // 辅助：格式化导数
  function dfn_fmt(v) {
    if (Math.abs(v) < 1e-4) return v.toExponential(2);
    return v.toFixed(3);
  }

  window.COURSES.register(course);
})();
