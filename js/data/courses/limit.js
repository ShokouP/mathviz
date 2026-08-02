/**
 * mathviz — js/data/courses/limit.js
 * 课案 1：极限与连续（3b1b 风格叙事 + 可视化）。
 *
 * 四步：
 *   1. 数列极限的直觉      (1+1/n)^n → e
 *   2. 函数极限与 ε-δ 定义  f(x)=x^2 @ x=1
 *   3. 连续 vs 间断         x^2 与 sgn(x) 对比
 *   4. 重要极限             lim(x→0) sin(x)/x = 1
 *
 * 设计说明：
 *   - 各步交互控件不使用 bind，而是在 step.onControl(name, value, scene)
 *     中直接改写 scene.layers 的对应属性。这样既绕开了点路径
 *     （course.js 的 setPath 不解析 "layers[1].n" 这类下标记法），
 *     又便于一次控件改动联动更新多个图层（如 ε 改变时同步重算 δ）。
 *   - 颜色统一使用项目调色板：蓝 #4f9cf9 / 橙 #ff8c42 / 紫 #9d7aff / 绿 #4ade80。
 */
(function () {
  'use strict';

  // ---- 调色板 ----
  var BLUE = '#4f9cf9';   // 主曲线
  var ORANGE = '#ff8c42'; // 标记点 / 极限线
  var PURPLE = '#9d7aff'; // δ 带 / 投影线
  var GREEN = '#4ade80';  // ε 带 / 目标值

  var course = {
    id: 'limit',
    title: '极限与连续',
    summary: '从数列极限到 ε-δ 语言，再到 sin(x)/x 与夹逼准则。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="10" y1="74" x2="190" y2="74" stroke="#ff8c42" stroke-width="1.5" stroke-dasharray="5 4"/><path d="M12 104 Q70 84 120 76 T188 74.4" fill="none" stroke="#4f9cf9" stroke-width="2.5" stroke-linecap="round"/><circle cx="168" cy="74.5" r="3.2" fill="#ff8c42"/><text x="100" y="34" fill="#e6edf3" font-size="13" text-anchor="middle" font-family="-apple-system,sans-serif">lim a_n = e</text></svg>',

    steps: [
      // ===== Step 1：数列极限的直觉 =====
      {
        title: '数列极限的直觉',
        narrative: `从一个看似简单的数列开始：

$$a_n = \\left(1 + \\frac{1}{n}\\right)^n$$

把前几项算出来：$a_1 = 2$，$a_2 = 2.25$，$a_5 \\approx 2.488$……它一直在涨，却涨得越来越慢。一个自然的问题浮上来：它会停在哪里？

拖动下方的 $n$ 滑块，观察橙色点的高度。它在悄悄逼近一个神秘的常数——

$$\\lim_{n\\to\\infty} \\left(1+\\frac{1}{n}\\right)^n = e \\approx 2.71828\\ldots$$

这就是 $e$，自然对数的底。所谓「极限」，是说：当 $n$ 足够大时，$a_n$ 与 $e$ 的距离可以**任意小**。形式化地讲：

> 对任意 $\\varepsilon > 0$，都存在 $N$，使得只要 $n > N$，就有 $|a_n - e| < \\varepsilon$。

注意「任意小」三个字——不是逼近到某个固定的精度，而是你要多近就能多近。这就是数列极限的 $\\varepsilon$-$N$ 直觉。`,
        scene: {
          axes: { xRange: [0, 40], yRange: [1.8, 3.05] },
          layers: [
            // [0] 函数曲线 a(x) = (1+1/x)^x
            { type: 'plot', fn: '(1+1/x)^x', color: BLUE, range: [0.8, 40] },
            // [1] 极限水平线 y = e
            { type: 'line', from: [0.8, Math.E], to: [40, Math.E], color: ORANGE, dashed: true },
            // [2] 当前项对应的点 (n, a_n)
            { type: 'point', x: 5, y: Math.pow(1.2, 5), radius: 6, color: ORANGE, label: 'a_5 = 2.4883' },
            // [3] 从 x 轴投到曲线点的竖直辅助线
            { type: 'line', from: [5, 1.8], to: [5, Math.pow(1.2, 5)], color: PURPLE, dashed: true }
          ]
        },
        controls: [
          { name: 'n', label: 'n', type: 'slider', min: 1, max: 40, step: 1, value: 5 }
        ],
        // n 改变时联动更新点 [2] 与辅助线 [3]
        onControl: function (name, value, scene) {
          if (name !== 'n') return;
          var n = value;
          var a = Math.pow(1 + 1 / n, n);
          var L = scene.layers;
          L[2].x = n;
          L[2].y = a;
          L[2].label = 'a_' + n.toFixed(0) + ' = ' + a.toFixed(4);
          L[3].from = [n, 1.8];
          L[3].to = [n, a];
        }
      },

      // ===== Step 2：函数极限与 ε-δ 定义 =====
      {
        title: '函数极限与 ε-δ 定义',
        narrative: `现在换到函数的世界。考察 $f(x) = x^2$ 在 $x = 1$ 处的行为，直觉告诉我们：

$$\\lim_{x \\to 1} x^2 = 1$$

可「趋近」到底意味着什么？我们需要一套**严格**的语言来抓住它——这就是著名的 $\\varepsilon$-$\\delta$ 定义：

> $\\lim_{x \\to a} f(x) = L$ 意味着：对任意 $\\varepsilon > 0$，都存在 $\\delta > 0$，使得当 $0 < |x - a| < \\delta$ 时，必有 $|f(x) - L| < \\varepsilon$。

画面上：**两条绿色水平线**是 $\\varepsilon$ 带，把输出 $f(x)$ 框在 $L \\pm \\varepsilon$ 之间；**两条紫色竖线**是 $\\delta$ 带，把输入 $x$ 框在 $a \\pm \\delta$ 之间。

拖动 $\\varepsilon$ 滑块——你会看到 $\\varepsilon$ 越小，所需的 $\\delta$ 也同步收窄。这正是定义的精髓：**无论对手把 $\\varepsilon$ 提得多刁钻，你总能找到一个 $\\delta$ 接招。** 对 $f(x)=x^2$ 在 $x=1$ 处，可取

$$\\delta = \\min\\!\\left(\\sqrt{1+\\varepsilon}-1,\\; 1-\\sqrt{1-\\varepsilon}\\right).$$

水平的绿带是「应满足的精度」，竖直的紫带是「为此允许的输入范围」——$\\delta$ 的存在性，就是极限的存在性。`,
        scene: {
          axes: { xRange: [-0.5, 2.5], yRange: [-0.3, 2.8] },
          layers: [
            // [0] 函数曲线 f(x) = x^2
            { type: 'plot', fn: 'x^2', color: BLUE },
            // [1] ε 上界水平线  y = 1 + ε
            { type: 'line', from: [-0.5, 1.4], to: [2.5, 1.4], color: GREEN, dashed: true },
            // [2] ε 下界水平线  y = 1 - ε
            { type: 'line', from: [-0.5, 0.6], to: [2.5, 0.6], color: GREEN, dashed: true },
            // [3] δ 左界竖直线  x = 1 - δ
            { type: 'line', from: [1 - 0.183, -0.3], to: [1 - 0.183, 2.8], color: PURPLE, dashed: true },
            // [4] δ 右界竖直线  x = 1 + δ
            { type: 'line', from: [1 + 0.183, -0.3], to: [1 + 0.183, 2.8], color: PURPLE, dashed: true },
            // [5] 极限点 (1, 1)
            { type: 'point', x: 1, y: 1, radius: 6, color: ORANGE },
            // [6] 标注当前 ε 与 δ 的取值
            { type: 'text', x: 1.1, y: 2.55, text: 'ε = 0.400,  δ = 0.183', color: GREEN, fontSize: 14 }
          ]
        },
        controls: [
          { name: 'eps', label: 'ε', type: 'slider', min: 0.05, max: 1.0, step: 0.05, value: 0.4 }
        ],
        // ε 改变时重算 δ 并同步移动四条带状线与标注
        onControl: function (name, value, scene) {
          if (name !== 'eps') return;
          var eps = value;
          // 解 |x^2 - 1| < ε 得 1-δ = √(1-ε), 1+δ = √(1+ε)，取两侧较小者
          var delta = Math.min(Math.sqrt(1 + eps) - 1, 1 - Math.sqrt(1 - eps));
          var L = scene.layers;
          L[1].from = [-0.5, 1 + eps]; L[1].to = [2.5, 1 + eps];
          L[2].from = [-0.5, 1 - eps]; L[2].to = [2.5, 1 - eps];
          L[3].from = [1 - delta, -0.3]; L[3].to = [1 - delta, 2.8];
          L[4].from = [1 + delta, -0.3]; L[4].to = [1 + delta, 2.8];
          L[6].text = 'ε = ' + eps.toFixed(3) + ',  δ = ' + delta.toFixed(3);
        }
      },

      // ===== Step 3：连续 vs 间断 =====
      {
        title: '连续 vs 间断',
        narrative: `有了极限的语言，就能精确区分「连续」与「间断」。

函数 $f$ 在 $a$ 点**连续**，要求三件事同时成立：

$$\\lim_{x \\to a} f(x) = f(a)$$

也就是：左极限、右极限都存在、相等，并且恰好等于函数值。

对比图中的两条曲线（拖动滑块让 $h \\to 0$，观察四个标记点）：

- **蓝色** $f(x) = x^2$：从 $0$ 的左右两侧逼近时，两个蓝色点都落向 $(0, 0)$，且 $f(0)=0$——左右极限相等且等于函数值，故**连续**。
- **橙色**符号函数 $\\operatorname{sgn}(x) = \\dfrac{x}{|x|}$：从右侧逼近恒为 $+1$，从左侧逼近恒为 $-1$，

$$\\lim_{x \\to 0^-} \\operatorname{sgn}(x) = -1 \\;\\neq\\; +1 = \\lim_{x \\to 0^+} \\operatorname{sgn}(x)$$

左右极限**不相等**，所以 $x = 0$ 处的极限根本不存在——这是一个**跳跃间断点**。

连续的本质，是极限值与函数值「无缝衔接」；而间断，正是这种衔接在某处断裂。`,
        scene: {
          axes: { xRange: [-1.7, 1.7], yRange: [-1.5, 2.7] },
          layers: [
            // [0] 连续函数 f(x) = x^2
            { type: 'plot', fn: 'x^2', color: BLUE, range: [-1.5, 1.5] },
            // [1] 符号函数左支 (x<0，值 -1)
            { type: 'plot', fn: 'abs(x)/x', color: ORANGE, range: [-1.5, -0.03] },
            // [2] 符号函数右支 (x>0，值 +1)
            { type: 'plot', fn: 'abs(x)/x', color: ORANGE, range: [0.03, 1.5] },
            // [3] x^2 右侧逼近点 (h, h^2)
            { type: 'point', x: 0.3, y: 0.09, radius: 6, color: BLUE },
            // [4] x^2 左侧逼近点 (-h, h^2)
            { type: 'point', x: -0.3, y: 0.09, radius: 6, color: BLUE },
            // [5] sgn 右侧逼近点 (h, 1)
            { type: 'point', x: 0.3, y: 1, radius: 6, color: ORANGE },
            // [6] sgn 左侧逼近点 (-h, -1)
            { type: 'point', x: -0.3, y: -1, radius: 6, color: ORANGE },
            // [7] 连续说明
            { type: 'text', x: 0, y: 2.4, text: 'x²：左右极限相等 → 连续', color: BLUE, fontSize: 14, align: 'center' },
            // [8] 间断说明
            { type: 'text', x: 0, y: -1.35, text: 'sgn(x)：左右极限不等 → 间断', color: ORANGE, fontSize: 14, align: 'center' }
          ]
        },
        controls: [
          { name: 'h', label: 'h (逼近距离)', type: 'slider', min: 0.03, max: 1.0, step: 0.01, value: 0.3 }
        ],
        // h 改变时同步移动四个逼近点
        onControl: function (name, value, scene) {
          if (name !== 'h') return;
          var h = value;
          var hh = h * h;
          var L = scene.layers;
          L[3].x = h;  L[3].y = hh;
          L[4].x = -h; L[4].y = hh;
          L[5].x = h;  L[5].y = 1;
          L[6].x = -h; L[6].y = -1;
        }
      },

      // ===== Step 4：重要极限 sin(x)/x =====
      {
        title: '重要极限：sin(x)/x',
        narrative: `最后，见证微积分里最著名的一个极限：

$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$

乍看有点反直觉——分子分母在 $x = 0$ 处都为 $0$，结果怎么会是 $1$？拖动滑块让观察点 $x_0$ 趋近 $0$，你会看到橙色点稳稳地落在高度为 $1$ 的绿色虚线上。

它的严格证明用的是**夹逼准则**(Squeeze Theorem)。在单位圆里比较面积，可得经典不等式：

$$\\cos x \\;\\le\\; \\frac{\\sin x}{x} \\;\\le\\; 1 \\qquad (0 < |x| < \\tfrac{\\pi}{2})$$

当 $x \\to 0$ 时，$\\cos x \\to 1$。左右两边都夹着它趋向 $1$，中间的 $\\dfrac{\\sin x}{x}$ 被「夹」在当中，别无选择，也只能趋向 $1$。

> 夹逼准则：若 $g(x) \\le f(x) \\le h(x)$，且 $\\lim g = \\lim h = L$，则 $\\lim f = L$。

这个极限之所以重要，是因为它是推导 $\\sin x$ 与 $\\cos x$ 导数公式的基石——整个微分学的发条，正是从这里开始转动的。`,
        scene: {
          axes: { xRange: [-6, 6], yRange: [-0.4, 1.4] },
          layers: [
            // [0] 函数曲线 f(x) = sin(x)/x
            { type: 'plot', fn: 'sin(x)/x', color: BLUE, range: [-6, 6] },
            // [1] 极限水平线 y = 1
            { type: 'line', from: [-6, 1], to: [6, 1], color: GREEN, dashed: true },
            // [2] 观察点处的竖直辅助线
            { type: 'line', from: [1.5, -0.4], to: [1.5, Math.sin(1.5) / 1.5], color: PURPLE, dashed: true },
            // [3] 观察点 (x0, sin(x0)/x0)
            { type: 'point', x: 1.5, y: Math.sin(1.5) / 1.5, radius: 6, color: ORANGE, label: 'sin(1.50)/1.50 = 0.6650' }
          ]
        },
        controls: [
          { name: 'x0', label: 'x₀', type: 'slider', min: -3, max: 3, step: 0.05, value: 1.5 }
        ],
        // x0 改变时更新辅助线 [2] 与观察点 [3]；x0≈0 时点出极限值
        onControl: function (name, value, scene) {
          if (name !== 'x0') return;
          var x0 = value;
          var val = (x0 === 0) ? 1 : Math.sin(x0) / x0;
          var L = scene.layers;
          L[2].from = [x0, -0.4];
          L[2].to = [x0, val];
          L[3].x = x0;
          L[3].y = val;
          if (Math.abs(x0) < 0.05) {
            L[3].label = '极限 → 1';
          } else {
            L[3].label = 'sin(' + x0.toFixed(2) + ')/' + x0.toFixed(2) + ' = ' + val.toFixed(4);
          }
        }
      }
    ]
  };

  window.COURSES.register(course);
})();
