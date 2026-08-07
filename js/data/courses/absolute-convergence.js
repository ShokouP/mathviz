/**
 * mathviz — js/data/courses/absolute-convergence.js
 * 课案：绝对收敛与条件收敛（北大高数 §7.4）。
 *
 * 四步：
 *   1. 两类收敛的定义      绝对收敛 vs 条件收敛
 *   2. 绝对收敛的等价刻画   正负项分别收敛、绝对收敛 ⟹ 收敛
 *   3. 判别流程            先判绝对值级数，绝对发散再判条件
 *   4. 典型例题分类        ∑(-1)ⁿ/n² / ∑(-1)ⁿ/n / ∑(-1)ⁿ
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 *   核心可视化：用 point 画部分和序列，对比原级数与绝对值级数的收敛行为。
 *   关键区分：绝对收敛(蓝)正负项各自收敛和有限；条件收敛(橙)正负项都发散，靠相消收敛。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 原级数部分和（收敛）
  var ORANGE = '#ff8c42'; // 绝对值级数部分和（可能发散）
  var PURPLE = '#9d7aff'; // 正项和 / 标记
  var GREEN = '#4ade80';  // 结论 / 收敛线

  // 计算 ∑_{n=1}^{N} (-1)^(n-1) / n^p 的部分和点列
  function altPSeries(N, p, color) {
    var pts = [];
    var S = 0;
    for (var n = 1; n <= N; n++) {
      S += Math.pow(-1, n - 1) / Math.pow(n, p);
      pts.push({ type: 'point', x: n, y: S, color: color, radius: 3.2 });
    }
    return { pts: pts, finalS: S };
  }

  // 计算 ∑_{n=1}^{N} 1/n^p（绝对值级数）的部分和点列
  function absPSeries(N, p, color) {
    var pts = [];
    var S = 0;
    for (var n = 1; n <= N; n++) {
      S += 1 / Math.pow(n, p);
      pts.push({ type: 'point', x: n, y: S, color: color, radius: 3 });
    }
    return { pts: pts, finalS: S };
  }

  var course = {
    id: 'absolute-convergence',
    title: '绝对收敛与条件收敛',
    summary: '绝对值级数收敛才算"稳固"——条件收敛只是"相消的运气"。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="15" y1="60" x2="185" y2="60" stroke="rgba(255,255,255,0.2)" stroke-width="1"/><g fill="#4f9cf9"><circle cx="25" cy="35" r="2.5"/><circle cx="45" cy="48" r="2.5"/><circle cx="65" cy="52" r="2.5"/><circle cx="85" cy="55" r="2.5"/><circle cx="105" cy="56" r="2.5"/><circle cx="125" cy="57" r="2.5"/></g><g fill="#ff8c42"><circle cx="25" cy="35" r="2.5"/><circle cx="45" cy="50" r="2.5"/><circle cx="65" cy="62" r="2.5"/><circle cx="85" cy="72" r="2.5"/><circle cx="105" cy="80" r="2.5"/><circle cx="125" cy="86" r="2.5"/></g><text x="100" y="105" fill="#9aa7b4" font-size="9" text-anchor="middle" font-family="sans-serif">蓝:原级数(收敛) 橙:绝对值(发散)</text></svg>',

    steps: [
      // ===== Step 1：两类收敛的定义 =====
      {
        title: '绝对收敛与条件收敛',
        narrative: `对于任意项级数 $\\sum a_n$（各项可正可负），收敛有两种"品质"：

- **绝对收敛**：$\\sum |a_n|$ 收敛。
- **条件收敛**：$\\sum a_n$ 收敛，但 $\\sum |a_n|$ 发散。

**核心区别**：绝对收敛是"**稳固**"的收敛——即使把所有负号去掉，级数依然收敛，说明正负项的"总量"都有限。条件收敛只是"**靠相消**"才收敛——正项之和与负项之和各自都发散，靠正负抵消才得到有限值。

**两个经典例子**：
1. $\\sum \\frac{(-1)^{n-1}}{n^2}$：绝对值级数 $\\sum \\frac{1}{n^2}$ 收敛（$p=2>1$）→ **绝对收敛**。
2. $\\sum \\frac{(-1)^{n-1}}{n}$：绝对值级数 $\\sum \\frac{1}{n}$ 发散（调和级数）→ **条件收敛**（上一课已证原级数收敛到 $\\ln 2$）。

右侧对比：蓝色是原交错级数 $\\sum (-1)^{n-1}/n^p$ 的部分和（总收敛），橙色是绝对值级数 $\\sum 1/n^p$ 的部分和。
拖动 $p$ 滑块：
- $p > 1$：橙色也收敛 → 绝对收敛
- $0 < p \\le 1$：橙色发散攀升 → 条件收敛

> 直觉：绝对收敛"经得起去绝对值"，条件收敛"去掉符号就垮"。`,

        scene: {
          axes: { xRange: [-1, 20], yRange: [-0.5, 6] },
          layers: [
            // 极限线（原级数收敛值，p=1 时为 ln2，简化用占位）
            { type: 'line', from: [-1, 0.693], to: [20, 0.693], color: BLUE, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 15, y: 0.9, text: '蓝极限≈0.693', color: BLUE, fontSize: 11 },
          ].concat(altPSeries(18, 1, BLUE).pts).concat(absPSeries(18, 1, ORANGE).pts).concat([
            { type: 'text', x: 8, y: 5.5, text: '蓝:原级数 Σ(-1)ⁿ⁻¹/nᵖ（收敛）', color: BLUE, fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 5, text: '橙:绝对值级数 Σ1/nᵖ', color: ORANGE, fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 4.5, text: 'p=1.00：橙发散 → 条件收敛', color: GREEN, fontSize: 12, align: 'left' },
          ]),
        },
        controls: [
          { name: 'p', label: '通项指数 p', type: 'slider', min: 0.3, max: 2.5, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'p') return;
          var p = value;
          var alt = altPSeries(18, p, BLUE);
          var abs = absPSeries(18, p, ORANGE);
          // 绝对收敛判据:p>1 时 ∑1/n^p 收敛
          var absolute = p > 1;
          // 原级数极限(p=1 时 ln2；p>1 时近似用 alt.finalS；p≤0 时发散)
          var converge = p > 0;
          // 更新极限线：原级数收敛值
          if (converge) {
            scene.layers[0].from = [-1, alt.finalS];
            scene.layers[0].to = [20, alt.finalS];
            scene.layers[1].y = alt.finalS + 0.2;
            scene.layers[1].text = '蓝极限≈' + alt.finalS.toFixed(3);
          }
          // 重建点列（保留前 2 层极限线 + 文本）
          var head = scene.layers.slice(0, 2);
          scene.layers = head.concat(alt.pts).concat(abs.pts).concat([
            { type: 'text', x: 8, y: 5.5, text: '蓝:原级数 Σ(-1)ⁿ⁻¹/n^' + p.toFixed(2) + '（' + (converge ? '收敛' : '发散') + '）', color: BLUE, fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 5, text: '橙:绝对值级数 Σ1/n^' + p.toFixed(2) + '（' + (absolute ? '收敛' : '发散') + '）', color: ORANGE, fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 4.5, text: 'p=' + p.toFixed(2) + '：' + (absolute ? '橙也收敛 → 绝对收敛 ✓' : (converge ? '橙发散 → 条件收敛' : '原级数发散')), color: absolute ? GREEN : (converge ? ORANGE : '#ff5c5c'), fontSize: 12, align: 'left' },
          ]);
        },
      },

      // ===== Step 2：绝对收敛的等价刻画 =====
      {
        title: '绝对收敛 ⟹ 收敛',
        narrative: `绝对收敛有一条极其重要的性质：

$$\\text{若 } \\sum |a_n| \\text{ 收敛，则 } \\sum a_n \\text{ 也收敛（且 } |\\sum a_n| \\le \\sum |a_n| \\text{）}$$

**证明思路**：把 $a_n$ 拆成正部 $a_n^+ = \\max(a_n, 0)$ 和负部 $a_n^- = -\\min(a_n, 0)$。
则 $a_n = a_n^+ - a_n^-$，$|a_n| = a_n^+ + a_n^-$。
因 $0 \\le a_n^+ \\le |a_n|$、$0 \\le a_n^- \\le |a_n|$，由比较判别法，$\\sum a_n^+$ 与 $\\sum a_n^-$ 都收敛。
故 $\\sum a_n = \\sum a_n^+ - \\sum a_n^-$ 收敛。

**几何画面**：右侧把 $\\sum (-1)^{n-1}/n$ 拆开——
- 紫色是正项之和 $\\sum 1/(2k-1)$（发散，趋于 $+\\infty$）
- 橙色是负项之和 $-\\sum 1/(2k)$（发散，趋于 $-\\infty$）
- 两个发散量相减，"恰好"得到收敛的 $\\ln 2$

这就是**条件收敛的脆弱性**：正负项各自无穷大，只是"增长率相同"才相消。一旦改变顺序（Riemann 重排），相消关系被破坏，和就变了。

而**绝对收敛**意味着 $\\sum a_n^+$ 和 $\\sum a_n^-$ 都有限，无论怎么重排，和都不变。

拖动 $N$ 滑块，看紫色（正部和）与橙色（负部和）如何**同步发散**，但它们的差（蓝线）收敛到 $\\ln 2$。`,

        scene: {
          axes: { xRange: [-1, 20], yRange: [-4, 4] },
          layers: [
            // 差的极限线 ln2
            { type: 'line', from: [-1, 0.693], to: [20, 0.693], color: GREEN, dashed: true, lineWidth: 1.5 },
            // 正部和、负部和、差 三个点列 —— 由 onControl 重建
            { type: 'point', x: 1, y: 1, color: PURPLE, radius: 3, label: '正部和' },
            { type: 'point', x: 1, y: 0, color: ORANGE, radius: 3, label: '负部和' },
            { type: 'point', x: 1, y: 1, color: BLUE, radius: 3.5, label: '差 Sₙ' },
            { type: 'text', x: 8, y: 3.5, text: '紫:正项和 Σ1/(2k-1)（发散↑）', color: PURPLE, fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 3, text: '橙:负项和 −Σ1/(2k)（发散↓）', color: ORANGE, fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: -3.5, text: '蓝:差 Sₙ = 正 − 负 → ln2（相消收敛）', color: BLUE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 2, max: 19, step: 1, value: 19 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 正项:1, 1/3, 1/5, ...（奇数倒数）; 负项:-1/2, -1/4, ...（偶数倒数取负）
          var posPts = [], negPts = [], diffPts = [];
          var posSum = 0, negSum = 0, diff = 0;
          for (var n = 1; n <= N; n++) {
            if (n % 2 === 1) {
              posSum += 1 / n;  // 正项
            } else {
              negSum += 1 / n;  // 负项（记录绝对值）
            }
            diff = posSum - negSum;
            posPts.push({ type: 'point', x: n, y: posSum, color: PURPLE, radius: 3 });
            negPts.push({ type: 'point', x: n, y: -negSum, color: ORANGE, radius: 3 });
            diffPts.push({ type: 'point', x: n, y: diff, color: BLUE, radius: 3.5 });
          }
          // 保留极限线（layers[0]），重建三个点列 + 3 个图例（末尾）
          scene.layers = [scene.layers[0]].concat(posPts).concat(negPts).concat(diffPts).concat([
            { type: 'text', x: 8, y: 3.5, text: '紫:正项和 Σ1/(2k-1)=' + posSum.toFixed(2) + '（发散↑）', color: PURPLE, fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: 3, text: '橙:负项和 −Σ1/(2k)=' + (-negSum).toFixed(2) + '（发散↓）', color: ORANGE, fontSize: 11, align: 'left' },
            { type: 'text', x: 8, y: -3.5, text: '蓝:差 Sₙ=' + diff.toFixed(3) + '（→ln2≈0.693）', color: BLUE, fontSize: 11, align: 'left' },
          ]);
        },
      },

      // ===== Step 3：判别流程 =====
      {
        title: '判别流程：先绝对，后条件',
        narrative: `判断任意项级数 $\\sum a_n$ 敛散性，遵循标准流程：

> **第一步：判绝对值级数 $\\sum |a_n|$**
> 用正项级数审敛法（比较/比值/根值）。若收敛 → **绝对收敛**，结束。
>
> **第二步：若 $\\sum |a_n|$ 发散，判原级数 $\\sum a_n$**
> 若是交错级数，试莱布尼茨判别法（$a_n$ 递减 + 趋零）。若满足 → **条件收敛**。
>
> **第三步：若上两步都失败**
> 用更精细的方法（如：$\\lim a_n \\ne 0$ 则发散；拆项求部分和极限；与已知级数比较）。

**关键提醒**：
- 若用比值/根值判别法得出 $\\sum |a_n|$ 发散（$\\rho > 1$），则 $\\sum a_n$ **也发散**（因为此时 $|a_n| \\not\\to 0$，故 $a_n \\not\\to 0$）。
- 但若用比较判别法得出 $\\sum |a_n|$ 发散，**不能**推出 $\\sum a_n$ 发散（它可能条件收敛！）。

右侧用流程图展示。拖动 $\\rho$ 滑块模拟比值判别法的不同结果，看流程如何导向不同结论。

> 实战口诀：**"先取绝对值试一刀，收敛就是绝对好；发散再看交错性，莱布尼茨判条件。"**`,

        scene: {
          axes: { xRange: [-4, 4], yRange: [-1.5, 4] },
          layers: [
            // 流程图节点：用 parametric 画方框 + text 标注
            // 起点：∑aₙ
            { type: 'point', x: 0, y: 3.5, color: BLUE, radius: 8, label: '∑aₙ' },
            // 第一步：∑|aₙ|
            { type: 'point', x: 0, y: 2, color: ORANGE, radius: 8, label: '∑|aₙ|' },
            // 箭头 连线
            { type: 'line', from: [0, 3.42], to: [0, 2.08], color: '#9aa7b4', lineWidth: 1.5 },
            // 左分支：收敛 → 绝对收敛
            { type: 'point', x: -2, y: 0.5, color: GREEN, radius: 7, label: '绝对收敛' },
            { type: 'line', from: [-0.15, 1.92], to: [-1.85, 0.58], color: '#9aa7b4', lineWidth: 1.2 },
            { type: 'text', x: -2.8, y: 1.4, text: '收敛', color: GREEN, fontSize: 11 },
            // 右分支：发散 → 判交错
            { type: 'point', x: 2, y: 0.5, color: PURPLE, radius: 7, label: '判交错' },
            { type: 'line', from: [0.15, 1.92], to: [1.85, 0.58], color: '#9aa7b4', lineWidth: 1.2 },
            { type: 'text', x: 1.6, y: 1.4, text: '发散', color: ORANGE, fontSize: 11 },
            // 当前判别结果标注（由 onControl 更新）
            { type: 'text', x: -3.5, y: -1, text: '拖 ρ 看流程走向', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -3.5, y: -0.3, text: 'ρ=0.80 < 1 → ∑|aₙ|收敛 → 绝对收敛', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'rho', label: '比值判别法的 ρ', type: 'slider', min: 0.3, max: 1.6, step: 0.05, value: 0.8 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'rho') return;
          var rho = value;
          // ρ<1: ∑|aₙ| 收敛 → 绝对收敛；ρ>1: ∑|aₙ| 发散且 aₙ→0 失败 → 发散；ρ=1: 不定
          var result, color, path;
          if (rho < 0.95) {
            result = 'ρ=' + rho.toFixed(2) + ' < 1 → ∑|aₙ| 收敛 → 绝对收敛 ✓';
            color = GREEN;
            path = 'left';
          } else if (rho > 1.05) {
            result = 'ρ=' + rho.toFixed(2) + ' > 1 → ∑|aₙ| 发散，且 aₙ↛0 → 发散 ✗';
            color = '#ff5c5c';
            path = 'right';
          } else {
            result = 'ρ≈1：比值法失效，需改用其他方法（比较/莱布尼茨）';
            color = ORANGE;
            path = 'right';
          }
          // 高亮对应分支：左分支(绝对收敛,layers[3])或右分支(判交错,layers[6])
          scene.layers[3].color = path === 'left' ? GREEN : '#3a4452';   // 左节点(绝对收敛)
          scene.layers[6].color = path === 'right' ? PURPLE : '#3a4452';  // 右节点(判交错)
          scene.layers[10].text = result;
          scene.layers[10].color = color;
        },
      },

      // ===== Step 4：典型例题分类 =====
      {
        title: '例题：三个级数的分类',
        narrative: `用三个典型例子巩固判别流程：

**例 1**：$\\sum_{n=1}^{\\infty} \\frac{(-1)^n}{n^2}$
取绝对值：$\\sum \\frac{1}{n^2}$，$p=2>1$ 收敛。
→ **绝对收敛**。

**例 2**：$\\sum_{n=1}^{\\infty} \\frac{(-1)^n}{\\sqrt{n}}$
取绝对值：$\\sum \\frac{1}{\\sqrt{n}} = \\sum \\frac{1}{n^{1/2}}$，$p=1/2 \\le 1$ 发散。
但原级数是交错级数，$a_n = 1/\\sqrt{n}$ 递减且趋于 0，由莱布尼茨判别法收敛。
→ **条件收敛**。

**例 3**：$\\sum_{n=1}^{\\infty} (-1)^n$
通项 $(-1)^n$ 在 $\\pm 1$ 间震荡，$\\lim (-1)^n \\ne 0$。
→ **发散**（通项不趋零，级数发散的必要条件失败）。

右侧对比三个级数的部分和：蓝色是例1（快速收敛），橙色是例2（之字形收敛但绝对值发散），紫色是例3（震荡不收敛）。

拖动 $N$ 滑块增加项数，观察三类行为的差异：绝对收敛"又快又稳"，条件收敛"震荡着逼近"，发散"根本不收敛"。`,

        scene: {
          axes: { xRange: [-1, 25], yRange: [-1.8, 3] },
          layers: [
            // 例1 ∑(-1)ⁿ/n² 极限（≈-π²/12≈-0.822）
            { type: 'line', from: [-1, -0.822], to: [25, -0.822], color: BLUE, dashed: true, lineWidth: 1.5 },
            // 例2 ∑(-1)ⁿ/√n 极限（存在但非初等，≈-0.6 起震荡）
            // 三组点列 —— 由 onControl 重建
            { type: 'point', x: 1, y: -1, color: BLUE, radius: 3 },
            { type: 'point', x: 1, y: -1, color: ORANGE, radius: 3 },
            { type: 'point', x: 1, y: -1, color: PURPLE, radius: 3 },
            { type: 'text', x: 12, y: 2.7, text: '蓝:Σ(-1)ⁿ/n²（绝对收敛）', color: BLUE, fontSize: 11, align: 'left' },
            { type: 'text', x: 12, y: 2.2, text: '橙:Σ(-1)ⁿ/√n（条件收敛）', color: ORANGE, fontSize: 11, align: 'left' },
            { type: 'text', x: 12, y: 1.7, text: '紫:Σ(-1)ⁿ（发散）', color: PURPLE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 2, max: 24, step: 1, value: 24 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 注意：这三个级数从 n=1 起，(-1)^n/n² 等。例1/例2 用 (-1)^n（与 narrative 一致）
          var p1 = [], p2 = [], p3 = [];
          var s1 = 0, s2 = 0, s3 = 0;
          for (var n = 1; n <= N; n++) {
            s1 += Math.pow(-1, n) / (n * n);          // 例1
            s2 += Math.pow(-1, n) / Math.sqrt(n);    // 例2
            s3 += Math.pow(-1, n);                    // 例3
            p1.push({ type: 'point', x: n, y: s1, color: BLUE, radius: 3 });
            p2.push({ type: 'point', x: n, y: s2, color: ORANGE, radius: 3 });
            p3.push({ type: 'point', x: n, y: s3, color: PURPLE, radius: 3 });
          }
          // 保留极限线(layers[0])，重建三组点 + 3 图例
          scene.layers = [scene.layers[0]].concat(p1).concat(p2).concat(p3).concat([
            { type: 'text', x: 12, y: 2.7, text: '蓝:Σ(-1)ⁿ/n²=' + s1.toFixed(3) + '（→-0.822，绝对收敛）', color: BLUE, fontSize: 11, align: 'left' },
            { type: 'text', x: 12, y: 2.2, text: '橙:Σ(-1)ⁿ/√n=' + s2.toFixed(3) + '（条件收敛，慢）', color: ORANGE, fontSize: 11, align: 'left' },
            { type: 'text', x: 12, y: 1.7, text: '紫:Σ(-1)ⁿ=' + s3 + '（震荡，发散）', color: PURPLE, fontSize: 11, align: 'left' },
          ]);
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
