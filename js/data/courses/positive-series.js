/**
 * mathviz — js/data/courses/positive-series.js
 * 课案：正项级数审敛法（北大高数 §7.2，批次 2 第四套）。
 *
 * 四步：
 *   1. p 级数与比较判别法   Σ1/n^p 的 p>1 收敛、p≤1 发散，与已知级数比大小
 *   2. 比较判别法的极限形式  lim a_n/b_n = c>0 → 同敛散
 *   3. 比值判别法（达朗贝尔）lim a_{n+1}/a_n = ρ，ρ<1 收敛
 *   4. 根值判别法（柯西）    lim ⁿ√a_n = ρ，ρ<1 收敛
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 *   可视化核心：用 point 画部分和序列 S_n，收敛级数点集趋于水平线，发散级数点集攀升。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 收敛级数
  var ORANGE = '#ff8c42'; // 发散级数 / 标记
  var PURPLE = '#9d7aff'; // 待判级数
  var GREEN = '#4ade80';  // 极限线 / 结论

  var course = {
    id: 'positive-series',
    title: '正项级数审敛法',
    summary: '比较、比值、根值——三把尺子判断正项级数收敛还是发散。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><g fill="#4f9cf9"><circle cx="25" cy="85" r="2"/><circle cx="45" cy="75" r="2"/><circle cx="65" cy="68" r="2"/><circle cx="85" cy="63" r="2"/><circle cx="105" cy="60" r="2"/><circle cx="125" cy="58" r="2"/><circle cx="145" cy="57" r="2"/></g><g fill="#ff8c42"><circle cx="25" cy="88" r="2"/><circle cx="45" cy="78" r="2"/><circle cx="65" cy="65" r="2"/><circle cx="85" cy="48" r="2"/><circle cx="105" cy="28" r="2"/><circle cx="125" cy="15" r="2"/></g><line x1="20" y1="57" x2="160" y2="57" stroke="#4ade80" stroke-width="1" stroke-dasharray="3 2"/><text x="100" y="105" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">蓝:收敛  橙:发散</text></svg>',

    steps: [
      // ===== Step 1：p 级数与比较判别法 =====
      {
        title: 'p 级数与比较判别法',
        narrative: `判断正项级数收敛与否，**p 级数**是最重要的参照物：

$$\\sum_{n=1}^{\\infty} \\frac{1}{n^p} \\quad \\begin{cases} \\text{收敛}, & p > 1 \\\\ \\text{发散}, & p \\leq 1 \\end{cases}$$

$p=1$ 就是发散的调和级数；$p=2,3,\\ldots$ 收敛。记住 $p=1$ 这条分界线。

**比较判别法**：若 $0 \\leq a_n \\leq b_n$，
- $\\sum b_n$ 收敛 $\\Rightarrow$ $\\sum a_n$ 收敛（大的收敛，小的更收敛）
- $\\sum a_n$ 发散 $\\Rightarrow$ $\\sum b_n$ 发散（小的发散，大的更发散）

右侧对比三个 p 级数的部分和。蓝色 $p=2$（收敛，趋于 $\\pi^2/6 \\approx 1.645$），
橙色 $p=1$（调和级数，发散攀升），紫色 $p=0.5$（发散更快）。
拖动 $N$ 滑块增加项数：蓝色贴住绿色极限线，橙紫持续上升。

> **比较判别法的直觉**：把未知级数"夹"在已知级数之间，借已知判未知。`,

        scene: {
          axes: { xRange: [-1, 22], yRange: [-0.5, 5] },
          layers: [
            // p=2 的极限线 π²/6 ≈ 1.645
            { type: 'line', from: [-1, 1.645], to: [22, 1.645], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 18, y: 1.9, text: 'π²/6≈1.645', color: GREEN, fontSize: 11 },
          ].concat(buildPSeries(20, 2, BLUE))
            .concat(buildPSeries(20, 1, ORANGE))
            .concat(buildPSeries(20, 0.5, PURPLE))
            .concat([
              { type: 'text', x: 12, y: 4.5, text: '蓝:p=2(收敛) 橙:p=1(发散) 紫:p=0.5(发散)', color: '#9aa7b4', fontSize: 10, align: 'left' },
            ]),
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 5, max: 20, step: 1, value: 20 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 保留前 2 个固定层（极限线+文本）和最后 1 个图例文本，中间替换为三组点
          var legend = scene.layers[scene.layers.length - 1];
          scene.layers = scene.layers.slice(0, 2)
            .concat(buildPSeries(N, 2, BLUE))
            .concat(buildPSeries(N, 1, ORANGE))
            .concat(buildPSeries(N, 0.5, PURPLE))
            .concat([legend]);
        },
      },

      // ===== Step 2：比较判别法的极限形式 =====
      {
        title: '比较判别法的极限形式',
        narrative: `直接找 $b_n$ 使 $a_n \\leq b_n$ 不容易。**极限形式**更实用：

> 若 $\\lim_{n\\to\\infty} \\frac{a_n}{b_n} = c$，且 $0 < c < +\\infty$，则 $\\sum a_n$ 与 $\\sum b_n$ **同敛散**。

直觉：两个通项"差不多大"（比值趋于正的有限常数），则它们的部分和要么都收敛要么都发散。

**例子**：判断 $\\sum \\frac{1}{2n^2 - 1}$ 的敛散性。

取 $b_n = \\frac{1}{n^2}$（已知 $p=2$ 收敛）：
$$\\lim_{n\\to\\infty} \\frac{1/(2n^2-1)}{1/n^2} = \\lim_{n\\to\\infty} \\frac{n^2}{2n^2-1} = \\frac{1}{2}$$

$c = 1/2 \\in (0,+\\infty)$，故 $\\sum \\frac{1}{2n^2-1}$ 与 $\\sum \\frac{1}{n^2}$ **同敛散**——收敛。

右侧蓝色是 $\\sum \\frac{1}{2n^2-1}$，紫色是参照的 $\\sum \\frac{1}{n^2}$。
两者部分和都趋于有限值（绿色虚线区域），**形状几乎平行**——这就是"同敛散"的画面。`,

        scene: {
          axes: { xRange: [-1, 18], yRange: [-0.3, 2.5] },
          layers: [
            { type: 'text', x: 8, y: 2.3, text: '蓝:Σ1/(2n²-1)  紫:Σ1/n²（参照）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 1.9, text: '两者都收敛（极限比=1/2）', color: GREEN, fontSize: 11, align: 'left' },
          ].concat(buildCustomSeries(15, function (n) { return 1 / (2 * n * n - 1); }, BLUE))
            .concat(buildCustomSeries(15, function (n) { return 1 / (n * n); }, PURPLE)),
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 2, max: 40, step: 1, value: 15 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 保留前 2 个图例文本，中间替换为两组点集
          var legends = scene.layers.slice(0, 2);
          scene.layers = legends
            .concat(buildCustomSeries(N, function (n) { return 1 / (2 * n * n - 1); }, BLUE))
            .concat(buildCustomSeries(N, function (n) { return 1 / (n * n); }, PURPLE));
        },
      },

      // ===== Step 3：比值判别法（达朗贝尔） =====
      {
        title: '比值判别法（达朗贝尔）',
        narrative: `**比值判别法**只看级数自身相邻项的比值，无需找参照级数：

> 设 $\\lim_{n\\to\\infty} \\frac{a_{n+1}}{a_n} = \\rho$：
> - $\\rho < 1$ $\\Rightarrow$ 级数**收敛**
> - $\\rho > 1$（或 $=+\\infty$）$\\Rightarrow$ 级数**发散**
> - $\\rho = 1$ $\\Rightarrow$ **无法判定**（需用其他方法）

**为什么有效？** $\\rho < 1$ 意味着相邻项的比值小于 1，通项以几何级数的速度衰减——
而几何级数 $\\sum r^n$（$r<1$）收敛。所以"比值趋于 $\\rho<1$"本质是"被几何级数控制"。

**经典应用**：$\\sum \\frac{n!}{n^n}$。
$$\\frac{a_{n+1}}{a_n} = \\frac{(n+1)!/(n+1)^{n+1}}{n!/n^n} = \\frac{n^n}{(n+1)^n} = \\left(\\frac{n}{n+1}\\right)^n \\to \\frac{1}{e} \\approx 0.368 < 1$$

故 $\\sum \\frac{n!}{n^n}$ 收敛。

右侧蓝色是 $\\sum \\frac{1}{n!}$（$\\rho = \\frac{1}{n+1} \\to 0 < 1$，收敛，趋于 $e$）。
拖动 $\\rho$ 滑块模拟不同比值的几何级数：$\\rho<1$ 蓝线贴住极限，$\\rho>1$ 改为发散（橙线攀升）。`,

        scene: {
          axes: { xRange: [-1, 18], yRange: [-0.5, 5] },
          layers: [
            // 极限线（初始 ρ=0.5，和=1/(1-0.5)=2）
            { type: 'line', from: [-1, 2], to: [18, 2], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 14, y: 2.4, text: 'S=1/(1-ρ)', color: GREEN, fontSize: 11 },
          ].concat(buildGeometricPS(15, 0.5, BLUE))
            .concat([
              { type: 'text', x: 8, y: 4.5, text: 'ρ=0.5<1 → 收敛', color: BLUE, fontSize: 12, align: 'left' },
            ]),
        },
        controls: [
          { name: 'rho', label: '比值 ρ', type: 'slider', min: 0.1, max: 1.3, step: 0.05, value: 0.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'rho') return;
          var rho = value;
          var converge = rho < 1;
          // 重建：保留前 2 层（极限线+文本），替换点集和结论
          if (converge) {
            var S = 1 / (1 - rho);
            scene.layers[0].from = [-1, S];
            scene.layers[0].to = [18, S];
            scene.layers = scene.layers.slice(0, 2)
              .concat(buildGeometricPS(15, rho, BLUE))
              .concat([{ type: 'text', x: 8, y: 4.5, text: 'ρ=' + rho.toFixed(2) + '<1 → 收敛（S=' + S.toFixed(2) + ')', color: BLUE, fontSize: 12, align: 'left' }]);
          } else {
            scene.layers[0].from = [-1, -0.5];
            scene.layers[0].to = [18, -0.5];
            scene.layers[1].text = '发散（无极限）';
            scene.layers = scene.layers.slice(0, 2)
              .concat(buildGeometricPS(15, rho, ORANGE))
              .concat([{ type: 'text', x: 8, y: 4.5, text: 'ρ=' + rho.toFixed(2) + '>1 → 发散', color: ORANGE, fontSize: 12, align: 'left' }]);
          }
        },
      },

      // ===== Step 4：根值判别法（柯西） =====
      {
        title: '根值判别法（柯西）',
        narrative: `**根值判别法**与比值法平行，但用 $n$ 次根号：

> 设 $\\lim_{n\\to\\infty} \\sqrt[n]{a_n} = \\rho$：
> - $\\rho < 1$ $\\Rightarrow$ 收敛
> - $\\rho > 1$ $\\Rightarrow$ 发散
> - $\\rho = 1$ $\\Rightarrow$ 无法判定

**何时用根值法而非比值法？** 当通项含 $n$ 次幂时，根值法更方便。

**经典例子**：$\\sum \\left(\\frac{n}{2n+1}\\right)^n$。
$$\\sqrt[n]{a_n} = \\frac{n}{2n+1} \\to \\frac{1}{2} < 1$$

故收敛。若用比值法，$\\frac{a_{n+1}}{a_n}$ 会很复杂；根值法一步到位。

**总结三把尺子的选择顺序**：
1. 通项像 $1/n^p$？→ **比较判别法**（与 p 级数比）
2. 通项含阶乘、指数嵌套？→ **比值判别法**
3. 通项整体带 $n$ 次幂？→ **根值判别法**
4. 三者都失效（$\\rho=1$）？→ 用更精细的方法（拉阿伯、积分判别法等）

右侧演示 $\\sum \\left(\\frac{n}{2n+1}\\right)^n$ 的部分和（蓝色），迅速趋于极限（绿色虚线）。
$n$ 次幂让通项极快衰减——这正是根值法判断"收敛"的威力。`,

        scene: {
          axes: { xRange: [-1, 16], yRange: [-0.3, 2] },
          layers: [
            // 极限线（近似值，前几项和约 0.5）
            { type: 'line', from: [-1, 0.5], to: [16, 0.5], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 12, y: 0.8, text: 'S≈0.5', color: GREEN, fontSize: 11 },
          ].concat(buildCustomSeries(14, function (n) { return Math.pow(n / (2 * n + 1), n); }, BLUE))
            .concat([
              { type: 'text', x: 6, y: 1.7, text: '蓝:Σ(n/(2n+1))ⁿ  ⁿ√aₙ→1/2<1 → 收敛', color: '#9aa7b4', fontSize: 11, align: 'left' },
            ]),
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 2, max: 30, step: 1, value: 14 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 保留前 2 层（极限线+文本），替换点集（末尾图例随之）
          var head = scene.layers.slice(0, 2);
          scene.layers = head
            .concat(buildCustomSeries(N, function (n) { return Math.pow(n / (2 * n + 1), n); }, BLUE))
            .concat([
              { type: 'text', x: 6, y: 1.7, text: '蓝:Σ(n/(2n+1))ⁿ  ⁿ√aₙ→1/2<1 → 收敛', color: '#9aa7b4', fontSize: 11, align: 'left' },
            ]);
        },
      },
    ],
  };

  // ---- 辅助：p 级数部分和点序列 Σ_{n=1}^{N} 1/n^p ----
  function buildPSeries(N, p, color) {
    var pts = [];
    var S = 0;
    for (var n = 1; n <= N; n++) {
      S += 1 / Math.pow(n, p);
      pts.push({ type: 'point', x: n, y: S, color: color, radius: p === 2 ? 3.5 : 3 });
    }
    return pts;
  }

  // ---- 辅助：自定义通项的部分和点序列 ----
  function buildCustomSeries(N, termFn, color) {
    var pts = [];
    var S = 0;
    for (var n = 1; n <= N; n++) {
      S += termFn(n);
      pts.push({ type: 'point', x: n, y: S, color: color, radius: 3.2 });
    }
    return pts;
  }

  // ---- 辅助：几何级数部分和 Σ r^n ----
  function buildGeometricPS(N, r, color) {
    var pts = [];
    var S = 0;
    var term = 1;
    for (var k = 0; k < N; k++) {
      S += term;
      pts.push({ type: 'point', x: k + 1, y: S, color: color, radius: 3.2 });
      term *= r;
    }
    return pts;
  }

  window.COURSES.register(course);
})();
