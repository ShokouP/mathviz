/**
 * mathviz — js/data/courses/infinitesimals.js
 * 课案：无穷小的比较（北大高数 §2.5，o(x) / O(x) / 等价无穷小）。
 *
 * 四步：
 *   1. 无穷小的概念        x, x^2, x^3, sin(x) 都趋于 0——"趋于 0 的量"
 *   2. 无穷小的阶          o(x)/O(x) 记号：谁比谁更快地"消失"
 *   3. 等价无穷小与替换    f~g ⟺ 比值趋于 1；乘除中可替换，加减不可乱换
 *   4. 常用等价无穷小表    sin~tan~arcsin~ln(1+x)~e^x-1~x，1-cos~x^2/2，…
 *
 * 设计说明：
 *   - 核心可视化：多条趋于 0 的函数曲线在同一坐标系对比（x, x^2, x^3, sin(x)）。
 *   - onControl 直接 mutate scene.layers，不用 bind（一次控件可联动多个 layer）。
 *   - 表达式幂用 ^，变量 x。
 *   - 颜色调色板：蓝 #4f9cf9 / 橙 #ff8c42 / 紫 #9d7aff / 绿 #4ade80。
 */
(function () {
  'use strict';

  // ---- 调色板 ----
  var BLUE = '#4f9cf9';   // x（线性）
  var ORANGE = '#ff8c42'; // x^2 / 标记
  var PURPLE = '#9d7aff'; // x^3 / 阶数更高的
  var GREEN = '#4ade80';  // sin(x)（等价于 x）/ 结论

  var course = {
    id: 'infinitesimals',
    title: '无穷小的比较',
    summary: 'o(x) 与 O(x) 记号、等价无穷小替换法则与常用替换表。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="100" y1="10" x2="100" y2="103" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/><line x1="20" y1="56" x2="180" y2="56" stroke="rgba(255,255,255,0.18)" stroke-width="1"/><path d="M40 78 L160 34" fill="none" stroke="#4f9cf9" stroke-width="2.4" stroke-linecap="round"/><path d="M70 64 Q100 56 130 48" fill="none" stroke="#ff8c42" stroke-width="2.2" stroke-linecap="round"/><path d="M85 58 Q100 56 115 54" fill="none" stroke="#9d7aff" stroke-width="2.2" stroke-linecap="round"/><circle cx="100" cy="56" r="3" fill="#4ade80"/><text x="100" y="26" fill="#e6edf3" font-size="12" text-anchor="middle" font-family="sans-serif">x, x², x³ → 0</text></svg>',

    steps: [
      // ===== Step 1：无穷小的概念 =====
      {
        title: '无穷小是什么',
        narrative: `所谓**无穷小量**，并不是"很小的数"，而是一个**极限为零的变量**：

> 若 $\\lim_{x \\to x_0} f(x) = 0$，则称 $f(x)$ 是 $x \\to x_0$ 时的无穷小。

比如 $x \\to 0$ 时，下面这些都是无穷小：$x,\\ x^2,\\ x^3,\\ \\sin(x),\\ \\sqrt{x},\\ \\ln(1+x)$。它们都奔向 0——但奔向 0 的**速度**天差地别。

拖动右侧"观察点 $x$"滑块逼近原点，看四条曲线如何挤向原点：**蓝色** $x$ 走得最从容；**橙色** $x^2$ 一进原点附近就急剧下坠；**紫色** $x^3$ 几乎贴着 x 轴趴下去；**绿色** $\\sin(x)$ 与蓝色 $x$ 几乎完全重合——这正是下一节要细讲的事。

注意：**无穷小是相对过程而言的**。说 "$x^2$ 是无穷小"，必须同时指明是在 "$x \\to ?$" 这个过程下；脱离极限过程谈无穷小没有意义。`,
        scene: {
          axes: { xRange: [-1.2, 1.2], yRange: [-0.6, 1.1] },
          layers: [
            // [0] y = x（线性无穷小）
            { type: 'plot', fn: 'x', color: BLUE, lineWidth: 2.5, range: [-1, 1], samples: 60 },
            // [1] y = x^2（高阶无穷小）
            { type: 'plot', fn: 'x^2', color: ORANGE, lineWidth: 2.5, range: [-1, 1], samples: 80 },
            // [2] y = x^3（更高阶无穷小）
            { type: 'plot', fn: 'x^3', color: PURPLE, lineWidth: 2.5, range: [-1, 1], samples: 80 },
            // [3] y = sin(x)（与 x 等价）
            { type: 'plot', fn: 'sin(x)', color: GREEN, lineWidth: 2, range: [-1, 1], samples: 80 },
            // [4] 观察点竖直辅助线
            { type: 'line', from: [0.5, -0.6], to: [0.5, 1.1], color: 'rgba(230,237,243,0.35)', dashed: true, lineWidth: 1 },
            // [5] 观察点上的四个标记（与四条曲线对齐）
            { type: 'point', x: 0.5, y: 0.5, radius: 4, color: BLUE },
            { type: 'point', x: 0.5, y: 0.25, radius: 4, color: ORANGE },
            { type: 'point', x: 0.5, y: 0.125, radius: 4, color: PURPLE },
            { type: 'point', x: 0.5, y: 0.4794, radius: 4, color: GREEN },
            // [9] 数值标注
            { type: 'text', x: 0.56, y: 0.95, text: 'x=0.50:  x=0.500  x²=0.250  x³=0.125  sin=0.479', color: '#9aa7b4', fontSize: 11, align: 'left' }
          ]
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 0）', type: 'slider', min: -1, max: 1, step: 0.02, value: 0.5 }
        ],
        // x 改变时同步移动辅助线 [4]、四个标记点 [5..8] 与数值标注 [9]
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x = value;
          var yx = x;
          var yx2 = x * x;
          var yx3 = x * x * x;
          var ysin = Math.sin(x);
          var L = scene.layers;
          L[4].from = [x, -0.6];
          L[4].to = [x, 1.1];
          L[5].x = x; L[5].y = yx;
          L[6].x = x; L[6].y = yx2;
          L[7].x = x; L[7].y = yx3;
          L[8].x = x; L[8].y = ysin;
          L[9].text = 'x=' + x.toFixed(2) + ':  x=' + yx.toFixed(3) +
            '  x²=' + yx2.toFixed(3) + '  x³=' + yx3.toFixed(3) + '  sin=' + ysin.toFixed(3);
        }
      },

      // ===== Step 2：无穷小的阶（o / O 记号） =====
      {
        title: '无穷小的阶：o 与 O',
        narrative: `同为无穷小，谁"消失"得更快？我们用一个比值来比较。设 $\\alpha, \\beta$ 都是 $x \\to x_0$ 时的无穷小，看比值 $\\dfrac{\\beta}{\\alpha}$ 的极限：

$$\\lim_{x \\to x_0} \\frac{\\beta}{\\alpha} = \\begin{cases} 0 & \\Rightarrow\\ \\beta = o(\\alpha) \\\\ c \\neq 0 & \\Rightarrow\\ \\beta = O(\\alpha)\\ \\text{（同阶）} \\\\ 1 & \\Rightarrow\\ \\beta \\sim \\alpha\\ \\text{（等价）} \\end{cases}$$

- $\\beta = o(\\alpha)$（小 o）：$\\beta$ 比 $\\alpha$ **更快**地趋于 0。如 $x^2 = o(x)$，因 $\\dfrac{x^2}{x} = x \\to 0$。
- $\\beta = O(\\alpha)$（大 O）：比值趋于非零常数，二者**同阶**。如 $\\sin(x) = O(x)$。

小 o 项在极限中可被"丢掉"——这正是泰勒展开里尾项的来历：$\\sin(x) = x - \\dfrac{x^3}{6} + o(x^3)$，那个 $o(x^3)$ 是"比 $x^3$ 还高阶、可忽略"的尾巴。

右侧画出三条曲线的**比值**：橙色 $x^2/x = x$（趋于 0 ⇒ $x^2=o(x)$），紫色 $x^3/x = x^2$（更快趋于 0），绿色 $\\sin(x)/x$（水平贴着 1 ⇒ $\\sin x \\sim x$）。拖动 $x$ 逼近 0，看它们各自的"归宿"。`,
        scene: {
          axes: { xRange: [-1.2, 1.2], yRange: [-0.3, 1.3] },
          layers: [
            // [0] 极限参考线 y = 1（sin(x)/x 的归宿）
            { type: 'line', from: [-1.2, 1], to: [1.2, 1], color: GREEN, dashed: true, lineWidth: 1.2 },
            // [1] 极限参考线 y = 0（x^2/x 与 x^3/x 的归宿）
            { type: 'line', from: [-1.2, 0], to: [1.2, 0], color: 'rgba(255,255,255,0.18)', lineWidth: 1 },
            // [2] 比值 x^2 / x = x
            { type: 'plot', fn: 'x', color: ORANGE, lineWidth: 2.5, range: [-1, 1], samples: 60 },
            // [3] 比值 x^3 / x = x^2
            { type: 'plot', fn: 'x^2', color: PURPLE, lineWidth: 2.5, range: [-1, 1], samples: 80 },
            // [4] 比值 sin(x)/x（定义域避开 0，由引擎断点处理；用大采样平滑）
            { type: 'plot', fn: 'sin(x)/x', color: GREEN, lineWidth: 2, range: [-1, 1], samples: 200 },
            // [5] 观察点辅助线
            { type: 'line', from: [0.5, -0.3], to: [0.5, 1.3], color: 'rgba(230,237,243,0.35)', dashed: true, lineWidth: 1 },
            // [6] 三个比值在 x 处的标记点
            { type: 'point', x: 0.5, y: 0.5, radius: 4, color: ORANGE },
            { type: 'point', x: 0.5, y: 0.25, radius: 4, color: PURPLE },
            { type: 'point', x: 0.5, y: 0.9589, radius: 4, color: GREEN },
            // [9] 标注
            { type: 'text', x: -1.15, y: 1.18, text: '橙:x²/x→0 ⇒ x²=o(x)    紫:x³/x→0 更快    绿:sin(x)/x→1 ⇒ sin~x', color: '#9aa7b4', fontSize: 10.5, align: 'left' }
          ]
        },
        controls: [
          { name: 'x', label: '观察点 x（趋于 0）', type: 'slider', min: -1, max: 1, step: 0.02, value: 0.5 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x = value;
          var r2 = x;                       // x^2 / x = x
          var r3 = x * x;                   // x^3 / x = x^2
          var rs = (x === 0) ? 1 : Math.sin(x) / x;
          var L = scene.layers;
          L[5].from = [x, -0.3];
          L[5].to = [x, 1.3];
          L[6].x = x; L[6].y = r2;
          L[7].x = x; L[7].y = r3;
          L[8].x = x; L[8].y = rs;
        }
      },

      // ===== Step 3：等价无穷小与替换法则 =====
      {
        title: '等价无穷小与替换法则',
        narrative: `当比值极限恰好为 1，我们给这对无穷小一个专门记号：

> $\\alpha \\sim \\beta$（"$\\alpha$ 等价于 $\\beta$"） $\\;\\Longleftrightarrow\\; \\displaystyle\\lim_{x \\to x_0}\\frac{\\beta}{\\alpha} = 1$。

等价是"差不多大"的精确化。当 $x \\to 0$ 时，经典的一组是 $\\sin(x) \\sim \\tan(x) \\sim \\ln(1+x) \\sim e^x - 1 \\sim x$。

**替换法则**（求极限的神器）：在**乘除法**中，任何因子都可用其等价无穷小替换，极限不变。比如

$$\\lim_{x \\to 0} \\frac{\\sin(x)\\, \\ln(1+x)}{x^2} \\;\\stackrel{\\sin x \\sim x,\\ \\ln(1+x) \\sim x}{=}\\; \\lim_{x \\to 0}\\frac{x \\cdot x}{x^2} = 1.$$

右侧对比了这四条曲线与参照线 $y=x$：在原点附近它们几乎**完全重合**——这就是"等价"的几何含义。拖动 $x$ 远离 0，差异才显现（$\\tan x$ 上升最快，$\\ln(1+x)$ 最缓）。

**务必当心**：替换只对**乘除因子**安全，**绝不能**用于加减中的单独一项！例如 $\\lim_{x\\to 0}\\dfrac{\\tan x - \\sin x}{x^3}$，若各替成 $x$ 便得 $0$，但正确答案是 $\\dfrac{1}{2}$。根源是：加减会把"高阶差"放大成主项，而替换丢掉的恰是高阶部分。`,
        scene: {
          axes: { xRange: [-0.8, 1.6], yRange: [-0.8, 2.0] },
          layers: [
            // [0] 参照线 y = x（虚线）
            { type: 'plot', fn: 'x', color: '#3a4452', lineWidth: 1.5, range: [-0.7, 1.5], samples: 40 },
            // [1] sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.4, range: [-0.7, 1.5], samples: 100 },
            // [2] tan(x)
            { type: 'plot', fn: 'tan(x)', color: PURPLE, lineWidth: 2, range: [-0.7, 1.4], samples: 100 },
            // [3] ln(1+x)
            { type: 'plot', fn: 'ln(1+x)', color: GREEN, lineWidth: 2, range: [-0.69, 1.5], samples: 100 },
            // [4] e^x - 1
            { type: 'plot', fn: 'exp(x) - 1', color: ORANGE, lineWidth: 2, range: [-0.7, 1.5], samples: 100 },
            // [5] 原点标记
            { type: 'point', x: 0, y: 0, color: '#e6edf3', radius: 4 },
            // [6] 观察点辅助线
            { type: 'line', from: [0.3, -0.8], to: [0.3, 2.0], color: 'rgba(230,237,243,0.35)', dashed: true, lineWidth: 1 },
            // [7] 观察点处四条曲线的标记
            { type: 'point', x: 0.3, y: 0.2955, radius: 4, color: BLUE },
            { type: 'point', x: 0.3, y: 0.3093, radius: 4, color: PURPLE },
            { type: 'point', x: 0.3, y: 0.2624, radius: 4, color: GREEN },
            { type: 'point', x: 0.3, y: 0.3499, radius: 4, color: ORANGE },
            // [12] 图例 / 数值
            { type: 'text', x: -0.75, y: 1.8, text: '灰:y=x  蓝:sin  紫:tan  绿:ln(1+x)  橙:eˣ-1', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: -0.75, y: 1.55, text: 'x=0.30 时 sin=0.2955  tan=0.3093  ln=0.2624  eˣ-1=0.3499', color: '#9aa7b4', fontSize: 9.5, align: 'left' }
          ]
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -0.6, max: 1.4, step: 0.02, value: 0.3 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x = value;
          var L = scene.layers;
          L[6].from = [x, -0.8];
          L[6].to = [x, 2.0];
          var vs = Math.sin(x);
          var vt = Math.tan(x);
          var vl = Math.log(1 + x);
          var ve = Math.exp(x) - 1;
          L[7].x = x; L[7].y = vs;
          L[8].x = x; L[8].y = vt;
          L[9].x = x; L[9].y = vl;
          L[10].x = x; L[10].y = ve;
          L[12].text = 'x=' + x.toFixed(2) + ' 时 sin=' + vs.toFixed(4) +
            '  tan=' + vt.toFixed(4) + '  ln=' + vl.toFixed(4) + '  eˣ-1=' + ve.toFixed(4);
        }
      },

      // ===== Step 4：常用等价无穷小表 =====
      {
        title: '常用等价无穷小表',
        narrative: `求极限时，下面这张表几乎要**背下来**——它们是替换法则的标准"零件库"。当 $x \\to 0$ 时：

$$\\sin x \\sim \\tan x \\sim \\arcsin x \\sim \\arctan x \\sim \\ln(1+x) \\sim e^x\\!-\\!1 \\sim x$$
$$a^x\\!-\\!1 \\sim x\\ln a,\\qquad 1\\!-\\!\\cos x \\sim \\tfrac{1}{2}x^2,\\qquad (1+x)^a\\!-\\!1 \\sim ax$$

**记忆诀窍**：前七个都 $\\sim x$（"线性族"），因为它们在原点的**一阶泰勒展开**首项都是 $x$；而 $1-\\cos(x)$ 是二阶的（$\\cos$ 的一阶项为 0，要从 $x^2$ 起算）。

**复合口诀**：若 $\\square \\to 0$，则 $\\sin\\square \\sim \\square$、$\\ln(1+\\square) \\sim \\square$ 等等都成立——把 $x$ 换成任何趋于 0 的"整体"，替换照样适用，这是它的真正威力。

右侧把表中**最易混淆**的代表画在一起：橙色 $\\sin(x)$ 与绿色 $\\tan(x)$ 在原点附近几乎贴合紫色虚线 $y=x$，但当 $x$ 稍大，$\\tan(x)$ 就明显翘起——这正解释了为何 "$\\tan x - \\sin x$" 不能各替成 $x$：它们的**差**才是主项（约 $\\tfrac{1}{2}x^3$）。观察点会标出三者的精确值，方便随时校验替换是否"够准"。`,
        scene: {
          axes: { xRange: [-1.0, 1.4], yRange: [-0.9, 1.6] },
          layers: [
            // [0] 参照 y = x（虚线）
            { type: 'plot', fn: 'x', color: PURPLE, lineWidth: 1.6, range: [-0.9, 1.2], samples: 40 },
            // 给参照线加 dashed 视觉：用一条短虚线段叠在原点附近示意
            { type: 'line', from: [-0.9, -0.9], to: [1.2, 1.2], color: 'rgba(157,122,255,0.55)', dashed: true, lineWidth: 1.2 },
            // [2] sin(x)
            { type: 'plot', fn: 'sin(x)', color: ORANGE, lineWidth: 2.4, range: [-0.9, 1.2], samples: 100 },
            // [3] tan(x)
            { type: 'plot', fn: 'tan(x)', color: GREEN, lineWidth: 2.2, range: [-0.9, 1.1], samples: 100 },
            // [4] 原点
            { type: 'point', x: 0, y: 0, color: '#e6edf3', radius: 4 },
            // [5] 观察点辅助线
            { type: 'line', from: [0.4, -0.9], to: [0.4, 1.6], color: 'rgba(230,237,243,0.35)', dashed: true, lineWidth: 1 },
            // [6] 三标记
            { type: 'point', x: 0.4, y: 0.4, radius: 4, color: PURPLE },
            { type: 'point', x: 0.4, y: 0.3894, radius: 4, color: ORANGE },
            { type: 'point', x: 0.4, y: 0.4228, radius: 4, color: GREEN },
            // [9] 表格摘要（文字层堆叠模拟"表"）
            { type: 'text', x: -0.95, y: 1.45, text: '常用等价无穷小（x → 0）：', color: '#e6edf3', fontSize: 11, align: 'left' },
            { type: 'text', x: -0.95, y: 1.22, text: 'sin x ~ tan x ~ arcsin x ~ arctan x ~ ln(1+x) ~ eˣ-1 ~ x', color: '#9aa7b4', fontSize: 9.5, align: 'left' },
            { type: 'text', x: -0.95, y: 1.02, text: 'aˣ-1 ~ x·ln(a)    1-cos x ~ ½x²    (1+x)^a-1 ~ a·x', color: '#9aa7b4', fontSize: 9.5, align: 'left' },
            // [12] 数值
            { type: 'text', x: -0.95, y: -0.75, text: 'x=0.40:  x=0.400  sin=0.3894  tan=0.4228', color: '#9aa7b4', fontSize: 9.5, align: 'left' }
          ]
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -0.8, max: 1.1, step: 0.02, value: 0.4 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x = value;
          var L = scene.layers;
          L[5].from = [x, -0.9];
          L[5].to = [x, 1.6];
          var vx = x;
          var vs = Math.sin(x);
          var vt = Math.tan(x);
          L[6].x = x; L[6].y = vx;
          L[7].x = x; L[7].y = vs;
          L[8].x = x; L[8].y = vt;
          L[12].text = 'x=' + x.toFixed(2) + ':  x=' + vx.toFixed(4) +
            '  sin=' + vs.toFixed(4) + '  tan=' + vt.toFixed(4);
        }
      }
    ]
  };

  window.COURSES.register(course);
})();
