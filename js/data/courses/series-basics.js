/**
 * mathviz — js/data/courses/series-basics.js
 * 课案：常数项级数（北大高数 §7.1，无穷级数起点）。
 *
 * 四步：
 *   1. 级数 = 无穷个数的和   部分和序列 S_n，收敛 ⟺ S_n 收敛
 *   2. 等比级数              |r|<1 收敛，几何直观与求和公式
 *   3. 调和级数发散          a_n→0 但级数发散的经典反例
 *   4. 级数的基本性质        线性、增减有限项不改变敛散性
 *
 * 设计说明：
 *   - 核心可视化：用 plot 画"部分和序列"（以 n 为横轴的离散点序列，用 point 画点 + line 连线）。
 *   - onControl 直接 mutate scene.layers[i]。
 *   - 表达式幂用 ^，变量 x。
 *   - 颜色：蓝 #4f9cf9（部分和）、橙 #ff8c42（极限/标记）、紫 #9d7aff（通项）、绿 #4ade80（目标值）。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 部分和 S_n
  var ORANGE = '#ff8c42'; // 标记 / 关注
  var PURPLE = '#9d7aff'; // 通项 a_n
  var GREEN = '#4ade80';  // 目标 / 极限值

  // 把一个序列 [s0,s1,...,sN] 转成 layers：N 个 point + 连线（用 line 拼）。
  // 为简化，这里只画离散点 point，连线由调用方按需添加（避免巨多层）。
  function seqToPoints(seq, color) {
    var pts = [];
    for (var i = 0; i < seq.length; i++) {
      pts.push({ type: 'point', x: i + 1, y: seq[i], color: color, radius: 3 });
    }
    return pts;
  }

  var course = {
    id: 'series-basics',
    title: '常数项级数',
    summary: '无穷多个数相加到底是什么意思？从部分和序列看级数收敛。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="20" y1="56" x2="180" y2="56" stroke="#3a4452" stroke-width="1"/><g fill="#4f9cf9">' +
      '<circle cx="30" cy="80" r="2.5"/><circle cx="45" cy="72" r="2.5"/><circle cx="60" cy="66" r="2.5"/><circle cx="75" cy="62" r="2.5"/><circle cx="90" cy="59" r="2.5"/><circle cx="105" cy="58" r="2.5"/><circle cx="120" cy="57" r="2.5"/><circle cx="135" cy="56.5" r="2.5"/><circle cx="150" cy="56.2" r="2.5"/><circle cx="165" cy="56.1" r="2.5"/>' +
      '</g><line x1="20" y1="56" x2="180" y2="56" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4 3"/><text x="100" y="30" fill="#e6edf3" font-size="13" text-anchor="middle" font-family="sans-serif">S_n → S</text></svg>',

    steps: [
      // ===== Step 1：级数 = 无穷个数的和 =====
      {
        title: '级数 = 无穷个数的和',
        narrative: `把一串数 $a_1, a_2, a_3, \\ldots$ 用加号连起来：

$$\\sum_{n=1}^{\\infty} a_n = a_1 + a_2 + a_3 + \\cdots$$

这就是**级数**。但"无穷多个数相加"到底是什么意思？总不能真的加到无穷。

办法是：先加**有限项**，看前 $n$ 项的和 $S_n = a_1 + a_2 + \\cdots + a_n$，
它叫**部分和**。当 $n$ 越来越大，$S_n$ 会趋向某个**有限值** $S$ 吗？

> 如果部分和序列 $S_n$ 收敛于 $S$，就说级数 $\\sum a_n$ **收敛**，和为 $S$。
> 如果 $S_n$ 不收敛（震荡或趋于无穷），就说级数**发散**。

于是"无穷求和"被翻译成了一个我们已会的概念——**数列的极限**。

右侧蓝点就是某个级数的部分和 $S_1, S_2, \\ldots$，绿色虚线是它的极限 $S$。
你会看到随着 $n$ 增大，蓝点越来越贴近绿线——这正是"收敛"的画面。
拖动 $N$ 滑块改变展示的部分和项数，感受 $S_n$ 如何逼近 $S$。`,

        scene: {
          axes: { xRange: [-1, 16], yRange: [-0.5, 4] },
          layers: [
            // 极限参考线 S = 2（取 1 + 1/2 + 1/4 + ... = 2 的几何级数示意）
            { type: 'line', from: [-1, 2], to: [16, 2], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 14, y: 2.3, text: 'S = 2', color: GREEN, fontSize: 13 },
            // 部分和点（取几何级数 r=1/2: S_n = 2 - 2*(1/2)^n）
          ].concat(buildGeometricPartialSums(10, 0.5, BLUE, 2)),
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 1, max: 15, step: 1, value: 10 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 重建部分和点：保留前 2 个固定层（参考线 + 文本），其余替换
          scene.layers = scene.layers.slice(0, 2).concat(buildGeometricPartialSums(N, 0.5, BLUE, 2));
        },
      },

      // ===== Step 2：等比级数 =====
      {
        title: '等比级数',
        narrative: `最重要的级数——**等比级数** $\\sum_{n=0}^{\\infty} r^n = 1 + r + r^2 + r^3 + \\cdots$。

它的和有一个干净公式（当 $|r| < 1$ 时）：

$$\\sum_{n=0}^{\\infty} r^n = \\frac{1}{1 - r}, \\qquad |r| < 1$$

直觉：每一项都是前一项乘 $r$。当 $|r| < 1$，项越来越小，"加的量"迅速衰减，总和收敛；
当 $|r| \\geq 1$，项不衰减甚至增大，部分和一路飞走，级数发散。

右侧画的是部分和 $S_N = \\frac{1 - r^{N+1}}{1 - r}$，绿色虚线是理论极限 $\\frac{1}{1-r}$。
拖动 $r$ 滑块在 $-0.95$ 到 $0.95$ 之间：

- $r = 0.5$：$S_N$ 平稳爬升到 $\\frac{1}{1-0.5} = 2$
- $r = 0.9$：爬得很慢，但终将逼近 $10$
- $r = -0.5$：$S_N$ 在极限附近**来回震荡**着收敛（奇偶项交替）
- $r$ 接近 $\pm 1$：收敛极慢

注意 $r$ 越接近 $1$，需要的项数越多——这正是"收敛慢"的典型。`,

        scene: {
          axes: { xRange: [-1, 16], yRange: [-1, 6] },
          layers: [
            // 极限线（初始 r=0.5, S=2）
            { type: 'line', from: [-1, 2], to: [16, 2], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 13, y: 2.4, text: '1/(1-r)', color: GREEN, fontSize: 12 },
          ].concat(buildGeometricPartialSums(12, 0.5, BLUE, null)),
        },
        controls: [
          { name: 'r', label: '公比 r', type: 'slider', min: -0.95, max: 0.95, step: 0.05, value: 0.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'r') return;
          var r = value;
          var S = 1 / (1 - r); // 理论极限
          scene.layers[0].from = [-1, S];
          scene.layers[0].to = [16, S];
          scene.layers = scene.layers.slice(0, 2).concat(buildGeometricPartialSums(12, r, BLUE, null));
        },
      },

      // ===== Step 3：调和级数发散 =====
      {
        title: '调和级数发散',
        narrative: `一个反直觉的经典例子——**调和级数**：

$$\\sum_{n=1}^{\\infty} \\frac{1}{n} = 1 + \\frac{1}{2} + \\frac{1}{3} + \\frac{1}{4} + \\cdots$$

它的通项 $a_n = 1/n \\to 0$——每一项都越来越小，看起来"应该收敛"。
但事实是：**它发散到 $+\\infty$**！

这是级数里最重要的警示：

> **$a_n \\to 0$ 是级数收敛的必要条件，但不是充分条件。**
> 项趋于零，不代表和会收敛。

为什么调和级数发散？把项分组：$1 + \\frac{1}{2} + (\\frac{1}{3}+\\frac{1}{4}) + (\\frac{1}{5}+\\cdots+\\frac{1}{8}) + \\cdots$
每一组都大于 $\\frac{1}{2}$，而这样的组有无穷多个，所以总和超过任意大的数。

右侧画的就是调和级数的部分和 $H_N = \\sum_{n=1}^{N} \\frac{1}{n}$。
**没有绿色极限线**——因为它根本没有极限。拖动 $N$ 滑块，看 $H_N$ 一路攀升、永不封顶。
对比紫色曲线 $\\ln(N)$：你会发现 $H_N \\approx \\ln(N) + \\gamma$（$\\gamma$ 是欧拉常数），
它增长得和 $\\ln N$ 一样慢——但终究趋于无穷。`,

        scene: {
          axes: { xRange: [-1, 22], yRange: [-0.5, 6] },
          layers: [
            // 提示文字
            { type: 'text', x: 12, y: 5.5, text: '调和级数部分和 H_N（无极限！）', color: ORANGE, fontSize: 13 },
            { type: 'text', x: 12, y: 5, text: '紫色参照: ln(N)', color: PURPLE, fontSize: 12 },
          ].concat(buildHarmonicPartialSums(20, BLUE))
            .concat(buildLogCurve(PURPLE)),
        },
        controls: [
          { name: 'N', label: '部分和项数 N', type: 'slider', min: 5, max: 20, step: 1, value: 20 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 保留前 2 个固定层（提示文字），替换部分和点，保留末尾 ln 曲线（最后 60 个采样点）
          var lnLayers = scene.layers.slice(-1); // buildLogCurve 只产生 1 个 plot 层
          scene.layers = scene.layers.slice(0, 2).concat(buildHarmonicPartialSums(N, BLUE)).concat(lnLayers);
        },
      },

      // ===== Step 4：级数的基本性质 =====
      {
        title: '级数的基本性质',
        narrative: `收敛级数有一些"很像有限和"的好性质，掌握它们能让判断和计算变快。

**1. 线性性**：若 $\\sum a_n = A$，$\\sum b_n = B$ 都收敛，则

$$\\sum (\\alpha a_n + \\beta b_n) = \\alpha A + \\beta B$$

常数可以提出、两个收敛级数可以逐项相加——和有限和完全一样。

**2. 去掉或加上有限项，不改变敛散性。**
级数的收敛与否，"前面的有限项说了不算"，只看"尾巴"。
所以判断敛散时，前几项哪怕是 $0$ 或 $100$ 都无所谓。

**3. 收敛级数可以任意加括号**（结合律成立）。
但**发散级数加括号可能变收敛**——这是发散级数的陷阱，不能滥用结合律。

**4. 收敛的必要条件**：$\\sum a_n$ 收敛 $\\Rightarrow a_n \\to 0$。
逆否命题（更实用）：**若 $a_n \\not\\to 0$，则级数一定发散**。
（再次提醒：$a_n \\to 0$ 不能保证收敛，调和级数就是反例。）

右侧用两个级数对比：蓝色是收敛的几何级数 $\\sum (0.6)^n$，紫色是发散的 $\\sum 1$（通项不趋于 0）。
看紫色点排成水平线、永不下降——它的通项 $a_n = 1 \\not\\to 0$，级数必然发散。
**通项趋于 0 是收敛的入场券，但不是免检通行证。**`,

        scene: {
          axes: { xRange: [-1, 14], yRange: [-0.5, 6] },
          layers: [
            // 收敛级数部分和（几何 r=0.6, S=1/(1-0.6)=2.5）
            { type: 'line', from: [-1, 2.5], to: [14, 2.5], color: GREEN, dashed: true, lineWidth: 1.2 },
            { type: 'text', x: 11, y: 2.9, text: '收敛→2.5', color: GREEN, fontSize: 12 },
          ].concat(buildGeometricPartialSums(12, 0.6, BLUE, null))
            .concat([
              // 发散级数 ∑1：部分和 = n
              { type: 'text', x: 8, y: 5.5, text: '紫: ∑1（通项≠0，发散）', color: PURPLE, fontSize: 12 },
            ])
            .concat(buildDivergentOnes(12, PURPLE)),
        },
      },
    ],
  };

  // ---- 辅助：构造几何级数部分和点序列 ----
  // 几何级数 ∑_{n=0}^{N} r^n，部分和 S_k = (1-r^{k+1})/(1-r)（r≠1）
  function buildGeometricPartialSums(N, r, color, _unused) {
    var pts = [];
    var S = 0;
    var term = 1; // a_0 = r^0 = 1
    for (var k = 0; k < N; k++) {
      S += term;
      pts.push({ type: 'point', x: k + 1, y: S, color: color, radius: 3.2 });
      term *= r;
    }
    return pts;
  }

  // ---- 辅助：调和级数部分和点序列 H_k = ∑_{n=1}^{k} 1/n ----
  function buildHarmonicPartialSums(N, color) {
    var pts = [];
    var H = 0;
    for (var n = 1; n <= N; n++) {
      H += 1 / n;
      pts.push({ type: 'point', x: n, y: H, color: color, radius: 3.2 });
    }
    return pts;
  }

  // ---- 辅助：ln(x) 曲线（用 plot，作为参照）----
  function buildLogCurve(color) {
    return [{ type: 'plot', fn: 'ln(x)', color: color, lineWidth: 1.8, range: [1, 21], samples: 80 }];
  }

  // ---- 辅助：发散级数 ∑1 的部分和（S_k = k）----
  function buildDivergentOnes(N, color) {
    var pts = [];
    for (var k = 1; k <= N; k++) {
      pts.push({ type: 'point', x: k, y: k, color: color, radius: 3.2 });
    }
    return pts;
  }

  window.COURSES.register(course);
})();
