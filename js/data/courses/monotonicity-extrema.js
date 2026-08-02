/**
 * mathviz — js/data/courses/monotonicity-extrema.js
 * 课案：函数单调性与极值（北大高数 §4.4）。
 *
 * 四步：
 *   1. 单调性判别      f'>0 增、f'<0 减；f' 的符号决定升降
 *   2. 极值第一判别法  f' 在驻点左变右"变号"→ 极值（增→减=极大，减→增=极小）
 *   3. 极值第二判别法  驻点处看 f'' 符号：f''>0 极小、f''<0 极大
 *   4. 最值问题        闭区间 [a,b] 上：极值 + 端点值，取最大/最小
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 函数曲线
  var ORANGE = '#ff8c42'; // 一阶导 / 切线 / 端点
  var PURPLE = '#9d7aff'; // 二阶导 / 辅助
  var GREEN = '#4ade80';  // 极值点 / 结论

  var course = {
    id: 'monotonicity-extrema',
    title: '函数单调性与极值',
    summary: 'f′ 的符号决定升降，f′ 变号处藏着极值——再从极值中挑出最值。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M15 95 C50 95 75 25 100 25 C125 25 150 95 185 95" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><line x1="15" y1="60" x2="185" y2="60" stroke="#3a4452" stroke-width="1"/><circle cx="100" cy="25" r="5" fill="#4ade80"/><circle cx="100" cy="95" r="0" fill="none"/><path d="M40 78 Q100 92 160 78" fill="none" stroke="#ff8c42" stroke-width="1.6" stroke-dasharray="4 3"/><text x="100" y="16" fill="#e6edf3" font-size="10" text-anchor="middle" font-family="sans-serif">极大值</text></svg>',

    steps: [
      // ===== Step 1：单调性判别 =====
      {
        title: '单调性的导数判别',
        narrative: `函数的**单调性**——什么时候升、什么时候降——完全由**一阶导** $f'(x)$ 的符号决定：

> - $f'(x) > 0$ $\\Rightarrow$ $f$ 在该区间**单调递增**（曲线从左下走向右上）
> - $f'(x) < 0$ $\\Rightarrow$ $f$ 在该区间**单调递减**（曲线从左上走向右下）

**为什么？** $f'(x)$ 是切线斜率。斜率为正，切线"上翘"，函数值随 $x$ 增大而增大；
斜率为负，切线"下倾"，函数值随 $x$ 增大而减小。所以"导数为正"和"函数递增"是同一件事的两种说法。

右侧蓝色是 $f(x) = x^3 - 3x$。橙色是它的一阶导 $f'(x) = 3x^2 - 3$。
拖动观察点 $x$ 滑块，对照橙色导数曲线在 $x$ 轴**上方还是下方**：
- $|x| > 1$：$f' > 0$（橙在上方）$\\Rightarrow$ 蓝色函数**递增**
- $|x| < 1$：$f' < 0$（橙在下方）$\\Rightarrow$ 蓝色函数**递减**

注意 $f'=0$ 的分界点 $x=\\pm 1$——单调性在那里发生反转，正是下一步"极值"的舞台。

**判别步骤**归纳：先求 $f'(x)$；解 $f'(x)>0$ 得递增区间，解 $f'(x)<0$ 得递减区间；分界点（$f'=0$ 或 $f'$ 不存在）就是单调性可能转变的"嫌疑点"。这条流水线是后续极值、最值、作图的共同基础。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-4, 4] },
          layers: [
            // f = x^3 - 3x
            { type: 'plot', fn: 'x^3 - 3*x', color: BLUE, lineWidth: 2.5, range: [-2.2, 2.2], samples: 100 },
            // f' = 3x^2 - 3
            { type: 'plot', fn: '3*x^2 - 3', color: ORANGE, lineWidth: 2, range: [-2.2, 2.2], samples: 80 },
            // y=0 参照线
            { type: 'line', from: [-2.5, 0], to: [2.5, 0], color: '#3a4452', lineWidth: 1 },
            // 竖直观察线（初始 x=1.5）
            { type: 'line', from: [1.5, -4], to: [1.5, 4], color: PURPLE, dashed: true, lineWidth: 1.2 },
            // 观察点（曲线上）
            { type: 'point', x: 1.5, y: 1.5 * 1.5 * 1.5 - 3 * 1.5, color: BLUE, radius: 5, label: '观察点' },
            { type: 'text', x: -2.3, y: 3.4, text: '蓝:f=x³−3x   橙:f′=3x²−3', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 0.2, y: -3.4, text: '橙>0→蓝增   橙<0→蓝减', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -2.2, max: 2.2, step: 0.05, value: 1.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[3].from = [value, -4];
          scene.layers[3].to = [value, 4];
          scene.layers[4].x = value;
          scene.layers[4].y = value * value * value - 3 * value;
          var fp = 3 * value * value - 3;
          var tag = fp > 0.05 ? '增（f′>0）' : (fp < -0.05 ? '减（f′<0）' : '驻点（f′=0）');
          scene.layers[6].text = 'x=' + value.toFixed(2) + ': ' + tag;
          scene.layers[6].color = fp >= 0 ? BLUE : ORANGE;
        },
      },

      // ===== Step 2：极值的第一判别法 =====
      {
        title: '极值的第一判别法',
        narrative: `**极值**（local extremum）是函数"局部最高 / 最低"的点。先看一个**必要条件**：

> 若 $x_0$ 是极值点，且 $f$ 在 $x_0$ 可导，则 $f'(x_0) = 0$。

满足 $f'(x_0)=0$ 的点叫**驻点**。但驻点未必是极值（如 $x^3$ 在原点，$f'(0)=0$ 却不是极值）。
真正的判据是**第一判别法**——看 $f'$ 在 $x_0$ 左右是否**变号**：

> - $f'$ 左正右负（先增后减）$\\Rightarrow$ **极大值**
> - $f'$ 左负右正（先减后增）$\\Rightarrow$ **极小值**
> - $f'$ 左右同号 $\\Rightarrow$ **不是**极值

右侧蓝色仍是 $f = x^3 - 3x$，橙色是一阶导 $f' = 3x^2 - 3$。
两个绿色点标记驻点 $x=-1$（极大）与 $x=1$（极小）。

- 看 $x=-1$：橙线（$f'$）从**上方**穿过 0 到**下方**——左正右负 → **极大**
- 看 $x=1$：橙线从**下方**穿过 0 到**上方**——左负右正 → **极小**

拖动观察点滑块扫过 $x=-1$ 与 $x=1$，留意导数符号（绿字）在"增/减"之间的反转——变号就是极值的信号。

**操作口诀**：找驻点 → 在每个驻点两侧各取一点判 $f'$ 符号 → 同号跳过，异号判极值（左增右减=极大，左减右增=极小）。第一判别法不依赖二阶导，对 $f''$ 不存在或为零的"难缠驻点"依然有效，是判极值最稳妥的通用工具。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-4, 4] },
          layers: [
            // f
            { type: 'plot', fn: 'x^3 - 3*x', color: BLUE, lineWidth: 2.5, range: [-2.2, 2.2], samples: 100 },
            // f'
            { type: 'plot', fn: '3*x^2 - 3', color: ORANGE, lineWidth: 2, range: [-2.2, 2.2], samples: 80 },
            // x 轴
            { type: 'line', from: [-2.5, 0], to: [2.5, 0], color: '#3a4452', lineWidth: 1 },
            // 极大点 (-1, 2)
            { type: 'point', x: -1, y: 2, color: GREEN, radius: 6, label: '极大 (-1,2)' },
            // 极小点 (1, -2)
            { type: 'point', x: 1, y: -2, color: GREEN, radius: 6, label: '极小 (1,-2)' },
            // 竖直观察线
            { type: 'line', from: [-0.2, -4], to: [-0.2, 4], color: PURPLE, dashed: true, lineWidth: 1.2 },
            { type: 'text', x: -2.3, y: 3.4, text: '蓝:f=x³−3x   橙:f′=3x²−3', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 0.2, y: -3.4, text: 'f′ 变号 → 极值', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -2.2, max: 2.2, step: 0.05, value: -0.2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[5].from = [value, -4];
          scene.layers[5].to = [value, 4];
          var fp = 3 * value * value - 3;
          var tag = fp > 0.05 ? 'f′>0：递增' : (fp < -0.05 ? 'f′<0：递减' : 'f′=0：驻点');
          scene.layers[7].text = 'x=' + value.toFixed(2) + '  ' + tag;
          scene.layers[7].color = fp >= 0 ? BLUE : ORANGE;
        },
      },

      // ===== Step 3：极值的第二判别法 =====
      {
        title: '极值的第二判别法',
        narrative: `若驻点处 $f''(x_0)$ 存在且不为零，可用**第二判别法**——一步到位，不必查左右符号：

> 设 $f'(x_0) = 0$。
> - $f''(x_0) > 0$ $\\Rightarrow$ **极小值**（凹，碗底）
> - $f''(x_0) < 0$ $\\Rightarrow$ **极大值**（凸，山顶）
> - $f''(x_0) = 0$ $\\Rightarrow$ **失效**，须退回第一判别法或更高阶判据

**直觉**：$f''$ 描述凹凸。$f''>0$ 是"开口朝上"的碗，驻点自然是碗底（极小）；
$f''<0$ 是"开口朝下"的拱，驻点自然是拱顶（极大）。

右侧蓝色 $f = x^3 - 3x$，紫色是二阶导 $f'' = 6x$。
两个驻点 $x=\\pm1$（$f'=0$）：

- $x=-1$：$f''(-1) = -6 < 0$（紫在下方，凸）$\\Rightarrow$ **极大**
- $x=+1$：$f''(1) = +6 > 0$（紫在上方，凹）$\\Rightarrow$ **极小**

拖动观察点滑块，对照紫色二阶导在 $x$ 轴**上下**的位置与极值的对应：
紫在上方=凹=极小，紫在下方=凸=极大。第二判别法就是"凹凸一眼定极值"。

**两种判别法的分工**：第二判别法只需算一点 $f''(x_0)$，速度快，但 $f''=0$ 时失效（如 $x^4$ 在原点 $f''=0$ 却是极小）；这时回到第一判别法看符号变化，永远不会失效。实战中两法并用——先试第二法，失效即回退第一法。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-6, 6] },
          layers: [
            // f
            { type: 'plot', fn: 'x^3 - 3*x', color: BLUE, lineWidth: 2.5, range: [-2.2, 2.2], samples: 100 },
            // f''
            { type: 'plot', fn: '6*x', color: PURPLE, lineWidth: 2, range: [-2.2, 2.2], samples: 60 },
            // x 轴
            { type: 'line', from: [-2.5, 0], to: [2.5, 0], color: '#3a4452', lineWidth: 1 },
            // 极大点
            { type: 'point', x: -1, y: 2, color: GREEN, radius: 6, label: '极大 f″<0' },
            // 极小点
            { type: 'point', x: 1, y: -2, color: GREEN, radius: 6, label: '极小 f″>0' },
            // 观察线
            { type: 'line', from: [0, -6], to: [0, 6], color: ORANGE, dashed: true, lineWidth: 1.2 },
            { type: 'text', x: -2.3, y: 5, text: '蓝:f=x³−3x   紫:f″=6x', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.3, y: -5, text: 'f″>0 极小 / f″<0 极大', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -2.2, max: 2.2, step: 0.05, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[5].from = [value, -6];
          scene.layers[5].to = [value, 6];
          var fpp = 6 * value;
          var tag = fpp > 0.05 ? 'f″>0：凹（极小倾向）' : (fpp < -0.05 ? 'f″<0：凸（极大倾向）' : 'f″=0：拐点候选');
          scene.layers[7].text = 'x=' + value.toFixed(2) + '  ' + tag;
          scene.layers[7].color = fpp >= 0 ? BLUE : PURPLE;
        },
      },

      // ===== Step 4：最值问题 =====
      {
        title: '闭区间上的最值',
        narrative: `**极值**是"局部"概念，而实际问题（最省材料、最高利润、最快路径）关心的是**整体最值**。
闭区间 $[a,b]$ 上的最值有一条干净利落的结论：

> 闭区间上连续函数的**最大值、最小值**，只可能出现在：
> 1. 区间内部的**极值点**（驻点或不可导点），或
> 2. 区间的**端点** $a$、$b$。

所以求最值的算法很机械：求出 $f'(x)=0$ 的所有点，把它们的函数值与端点值 $f(a)$、$f(b)$ 放在一起比大小，最大的就是最大值、最小的就是最小值。**端点常常被忽略，却往往是冠军**。

右侧蓝色 $f(x) = 2x^3 - 9x^2 + 12x - 3$ 在 $[0,3]$ 上。
求导 $f'(x)=6x^2-18x+12=6(x-1)(x-2)$，驻点 $x=1,2$：
- $f(0)=-3$，$f(1)=2$，$f(2)=1$，$f(3)=6$
- 内部极大 $f(1)=2$、极小 $f(2)=1$，**但端点 $f(3)=6$ 才是最大值**！

橙色点标四个候选值，绿色圈出**全局最大值** $f(3)=6$。它就在端点上——一个"局部只是老二"的点赢下了全场。这就是为什么最值问题一定要把端点拉进候选名单。

**易错提醒**：内部极值再"漂亮"也不能替代端点比较。开区间或无穷区间则要另看趋势（极限值、趋于无穷的行为），此时最值可能不存在。物理、工程、经济里的"最优"几乎都是这套流程：建模成函数 → 求导 → 比驻点与边界 → 取胜者。`,

        scene: {
          axes: { xRange: [-0.5, 3.5], yRange: [-4, 7] },
          layers: [
            // f = 2x^3 - 9x^2 + 12x - 3 在 [0,3]
            { type: 'plot', fn: '2*x^3 - 9*x^2 + 12*x - 3', color: BLUE, lineWidth: 2.8, range: [0, 3], samples: 120 },
            // x 轴
            { type: 'line', from: [-0.5, 0], to: [3.5, 0], color: '#3a4452', lineWidth: 1 },
            // 区间端点竖线（标记 [0,3]）
            { type: 'line', from: [0, -4], to: [0, 7], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'line', from: [3, -4], to: [3, 7], color: '#3a4452', lineWidth: 1, dashed: true },
            // 四个候选点：端点 + 驻点
            { type: 'point', x: 0, y: -3, color: ORANGE, radius: 5, label: 'f(0)=−3' },
            { type: 'point', x: 1, y: 2, color: ORANGE, radius: 5, label: '极大 f(1)=2' },
            { type: 'point', x: 2, y: 1, color: ORANGE, radius: 5, label: '极小 f(2)=1' },
            { type: 'point', x: 3, y: 6, color: GREEN, radius: 7, label: '最大 f(3)=6' },
            // 全局最大水平参照线
            { type: 'line', from: [-0.5, 6], to: [3.5, 6], color: GREEN, lineWidth: 1.2, dashed: true },
            { type: 'text', x: 1.5, y: 6.6, text: '全局最大在端点 x=3', color: GREEN, fontSize: 12, align: 'center' },
            { type: 'text', x: -0.4, y: -3.5, text: '蓝:f=2x³−9x²+12x−3，区间 [0,3]', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
