/**
 * mathviz — js/data/courses/alternating-series.js
 * 课案：交错级数与莱布尼茨判别法（北大高数 §7.3）。
 *
 * 四步：
 *   1. 交错级数概念      Σ(-1)^(n-1) a_n，正负相间
 *   2. 莱布尼茨判别法    a_n 单调递减 + 趋零 → 收敛
 *   3. 截断误差          |R_n| ≤ a_{n+1}，误差不超过首个舍弃项
 *   4. 条件收敛与重排    Riemann 重排定理：换序可改变和
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 *   核心可视化：用 point 画部分和序列 S_n，交错级数在极限值上下"之字形"震荡收敛。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 部分和点列
  var ORANGE = '#ff8c42'; // 通项 a_n / 标记
  var PURPLE = '#9d7aff'; // 舍弃项 / 误差
  var GREEN = '#4ade80';  // 极限值 / 结论

  // 交替调和级数 Σ(-1)^(n-1)/n 的和 = ln2
  var LN2 = Math.log(2);

  // 交替调和级数前 N 项部分和：S_N = Σ_{n=1}^{N} (-1)^(n-1)/n
  function altHarmonic(N) {
    var pts = [];
    var S = 0;
    for (var n = 1; n <= N; n++) {
      S += Math.pow(-1, n - 1) / n;
      pts.push({ type: 'point', x: n, y: S, color: BLUE, radius: 3.2 });
    }
    return pts;
  }

  // 通项 a_n = 1/n 的前 N 个值
  function termsInv(N, color) {
    var pts = [];
    for (var n = 1; n <= N; n++) {
      pts.push({ type: 'point', x: n, y: 1 / n, color: color, radius: 3 });
    }
    return pts;
  }

  var course = {
    id: 'alternating-series',
    title: '交错级数与莱布尼茨判别法',
    summary: '正负相间的级数——只要通项递减趋零，便收敛得清清楚楚。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="15" y1="56" x2="185" y2="56" stroke="rgba(255,255,255,0.2)" stroke-width="1"/><line x1="100" y1="20" x2="100" y2="92" stroke="#4ade80" stroke-width="1" stroke-dasharray="3,2"/><g fill="#4f9cf9"><circle cx="25" cy="20" r="2.5"/><circle cx="45" cy="80" r="2.5"/><circle cx="65" cy="35" r="2.5"/><circle cx="85" cy="72" r="2.5"/><circle cx="105" cy="42" r="2.5"/><circle cx="125" cy="66" r="2.5"/><circle cx="145" cy="48" r="2.5"/><circle cx="165" cy="62" r="2.5"/></g><path d="M25 20 L45 80 L65 35 L85 72 L105 42 L125 66 L145 48 L165 62" fill="none" stroke="#4f9cf9" stroke-width="1.2" opacity="0.5"/><text x="100" y="105" fill="#9aa7b4" font-size="9" text-anchor="middle" font-family="sans-serif">之字形收敛 → ln2</text></svg>',

    steps: [
      // ===== Step 1：交错级数概念 =====
      {
        title: '正负相间的级数',
        narrative: `**交错级数**是各项正负交替出现的级数，一般形式：

$$\\sum_{n=1}^{\\infty} (-1)^{n-1} a_n = a_1 - a_2 + a_3 - a_4 + \\cdots \\quad (a_n > 0)$$

最经典的例子是**交错调和级数**：

$$1 - \\frac{1}{2} + \\frac{1}{3} - \\frac{1}{4} + \\cdots = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n-1}}{n}$$

回忆一下：不带交替的调和级数 $\\sum 1/n$ 是**发散**的。但加上 $(-1)^{n-1}$ 让它正负相消后，竟然**收敛**了！和恰好是 $\\ln 2 \\approx 0.693$。

右侧蓝色点列是前 $N$ 项部分和 $S_N$。注意它的形状——在 $\\ln 2$（绿色虚线）上下**之字形震荡**：奇数项 $S_1, S_3, S_5,\\ldots$ 从上方逼近，偶数项 $S_2, S_4, S_6,\\ldots$ 从下方逼近。

拖动 $N$ 滑块增加项数，看蓝色折线如何被"夹"向绿色极限线 $\\ln 2$。`,

        scene: {
          axes: { xRange: [-1, 22], yRange: [0.2, 1.2] },
          layers: [
            // 极限线 ln2
            { type: 'line', from: [-1, LN2], to: [22, LN2], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 17, y: 0.78, text: 'ln2≈0.693', color: GREEN, fontSize: 11 },
          ].concat(altHarmonic(20)).concat([
            { type: 'text', x: 8, y: 1.12, text: '蓝:部分和 Sₙ（之字形收敛）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 1.05, text: '奇数项从上、偶数项从下夹逼 ln2', color: BLUE, fontSize: 11, align: 'left' },
          ]),
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 2, max: 20, step: 1, value: 20 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 保留前 2 层（极限线+文本），替换点列，末尾保留 2 个图例
          var head = scene.layers.slice(0, 2);
          scene.layers = head.concat(altHarmonic(N)).concat([
            { type: 'text', x: 8, y: 1.12, text: '蓝:部分和 Sₙ（之字形收敛）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 1.05, text: 'N=' + N + '：S=' + altHarmonicSum(N).toFixed(4), color: BLUE, fontSize: 11, align: 'left' },
          ]);
        },
      },

      // ===== Step 2：莱布尼茨判别法 =====
      {
        title: '莱布尼茨判别法',
        narrative: `什么样的交错级数收敛？**莱布尼茨判别法**给出一个干净利落的充分条件：

> 若交错级数 $\\sum (-1)^{n-1} a_n$ 满足：
> 1. **$a_n$ 单调递减**：$a_1 \\ge a_2 \\ge a_3 \\ge \\cdots$
> 2. **$a_n \\to 0$**：$\\lim_{n\\to\\infty} a_n = 0$
>
> 则该级数**收敛**，且和 $S$ 满足 $0 \\le S \\le a_1$。

**两个条件缺一不可**，几何直觉如下：

- **递减**保证"步长越来越短"——每次震荡的幅度 $a_n$ 在缩小，折线被越夹越紧。
- **趋零**保证"步长最终趋于 0"——否则即使递减，若 $a_n \\to c > 0$，部分和会一直在 $S \\pm c$ 间来回跳，不收敛。

**反例**：$\\sum (-1)^{n-1} \\frac{n}{n+1}$。虽然递减性弱，但关键是 $a_n = \\frac{n}{n+1} \\to 1 \\neq 0$，通项不趋零，级数**发散**（部分和之字形不收敛）。

右侧对比：橙色是 $a_n = 1/n$（满足两条件），紫色虚线参照。拖动 $p$ 滑块改变通项 $a_n = 1/n^p$：
- $p > 0$：$a_n \\to 0$（趋零），且 $p$ 越大递减越快 → 收敛
- $p \\le 0$：$a_n \\not\\to 0$ → 发散（点列不收敛）

观察 $p$ 从正变负时，部分和如何从"夹向极限"变成"持续震荡"。`,

        scene: {
          axes: { xRange: [-1, 18], yRange: [-1.5, 2.5] },
          layers: [
            // a_n = 1/n^p 的通项曲线（橙色），初始 p=1
            { type: 'plot', fn: '1/x', color: ORANGE, lineWidth: 2, range: [1, 17], samples: 60 },
            // 极限线 0
            { type: 'line', from: [-1, 0], to: [18, 0], color: '#3a4452', lineWidth: 1 },
            // 部分和点列（之字形）
            { type: 'point', x: 1, y: 1, color: BLUE, radius: 3.5 },
            { type: 'text', x: 8, y: 2.2, text: '橙:aₙ=1/nᵖ（递减趋零？）  蓝:部分和 Sₙ', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 1.7, text: 'p=1：aₙ→0 且递减 → 收敛', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'p', label: '通项指数 p（aₙ=1/nᵖ）', type: 'slider', min: -0.5, max: 2, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'p') return;
          var p = value;
          // 更新通项曲线
          scene.layers[0].fn = '1/(x^' + p + ')';
          scene.layers[0]._fn = undefined;
          // 重建部分和点列：S_N = Σ (-1)^(n-1) / n^p
          var pts = [];
          var S = 0;
          var N = 16;
          for (var n = 1; n <= N; n++) {
            S += Math.pow(-1, n - 1) / Math.pow(n, p);
            pts.push({ type: 'point', x: n, y: S, color: BLUE, radius: 3.5 });
          }
          // 判断收敛：p>0 时 a_n→0 收敛；p≤0 时发散
          var converge = p > 0;
          scene.layers = [scene.layers[0], scene.layers[1]].concat(pts).concat([
            { type: 'text', x: 8, y: 2.2, text: '橙:aₙ=1/n^' + p.toFixed(2) + '  蓝:部分和 Sₙ', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 1.7, text: converge ? ('p=' + p.toFixed(2) + '>0：aₙ→0 且递减 → 收敛') : ('p=' + p.toFixed(2) + '≤0：aₙ不趋零 → 发散（持续震荡）'), color: converge ? GREEN : ORANGE, fontSize: 12, align: 'left' },
          ]);
        },
      },

      // ===== Step 3：截断误差 =====
      {
        title: '截断误差：不超过首个舍弃项',
        narrative: `交错级数最实用的性质——**误差可控**。莱布尼茨判别法不仅判收敛，还给出误差估计：

> 若用前 $n$ 项部分和 $S_n$ 近似代替真值 $S$，则截断误差：
> $$|R_n| = |S - S_n| \\le a_{n+1}$$
>
> 即**误差不超过第一个被舍弃的项** $a_{n+1}$。

这是交错级数独有的"奢侈品"——正项级数的误差很难这么干净地估计。

**直觉**：部分和在真值上下之字形震荡。$S_n$ 停在哪一侧，下一个未加的项 $a_{n+1}$ 就把它"推回"真值方向，但推过头一点点。所以误差恰好被 $a_{n+1}$ 控制。

**例子**：用交错调和级数算 $\\ln 2$。
- 取 $n=10$ 项：$|R_{10}| \\le a_{11} = 1/11 \\approx 0.091$
- 取 $n=100$ 项：$|R_{100}| \\le 1/101 \\approx 0.0099$
- 取 $n=1000$ 项：误差 $< 0.001$

**精度与代价**：要 3 位精度（误差 $< 0.001$），需 $n > 1000$ 项——交错调和级数收敛**慢**。这就是为什么实际计算 $\\ln 2$ 不用它，而用更快收敛的级数。

右侧演示：绿色带是误差范围 $[S - a_{n+1},\\ S + a_{n+1}]$，蓝色 $S_n$ 必落其中。拖动 $n$ 滑块，看误差带如何随 $a_{n+1}$ 缩窄。`,

        scene: {
          axes: { xRange: [-1, 18], yRange: [0.3, 1.1] },
          layers: [
            // 真值线 ln2
            { type: 'line', from: [-1, LN2], to: [18, LN2], color: GREEN, dashed: true, lineWidth: 1.5 },
            // 误差带上界 S_n + a_{n+1}（初始 n=5，a_6=1/6）
            { type: 'line', from: [-1, LN2 + 1 / 6], to: [18, LN2 + 1 / 6], color: PURPLE, lineWidth: 1, opacity: 0.5 },
            // 误差带下界 S_n - a_{n+1}
            { type: 'line', from: [-1, LN2 - 1 / 6], to: [18, LN2 - 1 / 6], color: PURPLE, lineWidth: 1, opacity: 0.5 },
            // 部分和点列
            { type: 'point', x: 5, y: altHarmonicSum(5), color: BLUE, radius: 4, label: 'S₅' },
            { type: 'text', x: 8, y: 1.02, text: '绿:真值 ln2  紫:误差带 [S±aₙ₊₁]  蓝:Sₙ', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: 8, y: 0.95, text: 'n=5：|R₅|≤a₆=0.167', color: PURPLE, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'n', label: '截断处 n', type: 'slider', min: 2, max: 16, step: 1, value: 5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'n') return;
          var n = Math.round(value);
          var an1 = 1 / (n + 1);          // a_{n+1} = 1/(n+1)
          var Sn = altHarmonicSum(n);     // S_n
          // 更新误差带
          scene.layers[1].from = [-1, LN2 + an1]; scene.layers[1].to = [18, LN2 + an1];
          scene.layers[2].from = [-1, LN2 - an1]; scene.layers[2].to = [18, LN2 - an1];
          // 更新当前部分和点
          scene.layers[3].x = n;
          scene.layers[3].y = Sn;
          scene.layers[3].label = 'S' + subscript(n) + '=' + Sn.toFixed(4);
          // 文字
          var actualErr = Math.abs(LN2 - Sn);
          scene.layers[5].text = 'n=' + n + '：|Rₙ|≤a₍ₙ₊₁₎=' + an1.toFixed(4) + '，实际误差=' + actualErr.toFixed(4);
          scene.layers[5].color = actualErr <= an1 + 1e-9 ? GREEN : ORANGE;
        },
      },

      // ===== Step 4：条件收敛与 Riemann 重排 =====
      {
        title: '条件收敛：换序可改变和',
        narrative: `一个惊人的事实：**改变交错调和级数的求和顺序，和会改变**！

这涉及**绝对收敛**与**条件收敛**的区别：

- **绝对收敛**：$\\sum |a_n|$ 收敛。此时**任意重排**级数，和不变（重排定理）。
- **条件收敛**：$\\sum a_n$ 收敛，但 $\\sum |a_n|$ 发散。此时**重排会改变和**！

交错调和级数正是条件收敛的：它本身收敛到 $\\ln 2$，但 $\\sum 1/n$（绝对值级数）发散。

**Riemann 重排定理**（震撼数学界的结论）：
> 对于条件收敛的级数，**适当重排项的顺序**，可以使它收敛到**任意实数**，甚至发散到 $\\pm\\infty$！

具体做法：先取若干正项让和超过目标 $L$，再取负项拉回来，再取正项超过，再拉回……由于 $\\sum a_n^+$ 和 $\\sum a_n^-$ 都发散（条件收敛的等价刻画），这个"锯齿"过程可以无限进行，和任意逼近 $L$。

**例子**：交错调和级数重排为"2 个正项接 1 个负项"：
$$1 + \\frac{1}{3} - \\frac{1}{2} + \\frac{1}{5} + \\frac{1}{7} - \\frac{1}{4} + \\cdots$$
它的和不再是 $\\ln 2$，而是 $\\frac{3}{2}\\ln 2$！

右侧演示这种重排：蓝色是标准顺序的部分和（收敛到 $\\ln 2$），橙色是"2 正 1 负"重排的部分和（收敛到 $\\frac{3}{2}\\ln 2$）。拖动 $N$ 滑块，看两条曲线渐行渐远。

> 这揭示了：条件收敛级数的"和"依赖于**顺序**，它不是绝对可靠的"总量"。这是无穷求和区别于有限求和的根本之处。`,

        scene: {
          axes: { xRange: [-1, 30], yRange: [0.3, 1.4] },
          layers: [
            // 标准顺序和 ln2
            { type: 'line', from: [-1, LN2], to: [30, LN2], color: GREEN, dashed: true, lineWidth: 1.5 },
            // 重排后和 3/2·ln2
            { type: 'line', from: [-1, 1.5 * LN2], to: [30, 1.5 * LN2], color: ORANGE, dashed: true, lineWidth: 1.2 },
            // 标准部分和（蓝）
            { type: 'point', x: 1, y: 1, color: BLUE, radius: 3 },
            // 重排部分和（橙）
            { type: 'point', x: 1, y: 1, color: ORANGE, radius: 3 },
            { type: 'text', x: 12, y: 1.32, text: '蓝:标准顺序→ln2  橙:2正1负重排→(3/2)ln2', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: 12, y: 1.25, text: '重排改变和：条件收敛的本质', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 3, max: 27, step: 3, value: 27 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 标准顺序部分和
          var stdPts = [];
          var S1 = 0;
          for (var n = 1; n <= N; n++) {
            S1 += Math.pow(-1, n - 1) / n;
            stdPts.push({ type: 'point', x: n, y: S1, color: BLUE, radius: 3 });
          }
          // 重排：2 正 1 负。正项取 1/(2k-1)，负项取 -1/(2k)
          // 顺序：+1/1, +1/3, -1/2, +1/5, +1/7, -1/4, ...
          var rearrPts = [];
          var S2 = 0;
          var posIdx = 0, negIdx = 0; // 已取的正/负项数
          var xStep = 0;
          for (var blk = 0; blk < N; blk += 3) {
            // 取 2 个正项（奇数倒数）
            for (var k = 0; k < 2 && xStep < N; k++) {
              posIdx++;
              var odd = 2 * posIdx - 1;
              S2 += 1 / odd;
              xStep++;
              rearrPts.push({ type: 'point', x: xStep, y: S2, color: ORANGE, radius: 3 });
            }
            // 取 1 个负项（偶数倒数）
            if (xStep < N) {
              negIdx++;
              S2 -= 1 / (2 * negIdx);
              xStep++;
              rearrPts.push({ type: 'point', x: xStep, y: S2, color: ORANGE, radius: 3 });
            }
          }
          // 重建：前 2 层（两条极限线）+ 两组点 + 2 个图例
          scene.layers = scene.layers.slice(0, 2).concat(stdPts).concat(rearrPts).concat([
            { type: 'text', x: 12, y: 1.32, text: '蓝:标准→' + S1.toFixed(3) + '(ln2)  橙:重排→' + S2.toFixed(3) + '((3/2)ln2)', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: 12, y: 1.25, text: 'N=' + N + '：重排比标准高约 ' + (S2 - S1).toFixed(3), color: GREEN, fontSize: 11, align: 'left' },
          ]);
        },
      },
    ],
  };

  // 辅助：交错调和级数前 N 项和
  function altHarmonicSum(N) {
    var S = 0;
    for (var n = 1; n <= N; n++) S += Math.pow(-1, n - 1) / n;
    return S;
  }

  // 辅助：数字转下标（用于 Sₙ label）
  function subscript(n) {
    var map = '₀₁₂₃₄₅₆₇₈₉';
    return String(n).split('').map(function (d) { return map[+d] || d; }).join('');
  }

  window.COURSES.register(course);
})();
