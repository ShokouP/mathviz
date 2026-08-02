/**
 * mathviz — js/data/courses/elementary-functions.js
 * 课案：初等函数族（北大高数 §1.4，批次 1 第一套）。
 *
 * 四步：
 *   1. 幂函数族   y = x^n，不同 n 对比
 *   2. 指数与对数 e^x 与 ln x（互为反函数）
 *   3. 三角函数   sin / cos / tan
 *   4. 反三角函数 arcsin / arccos / arctan
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主曲线 / 第一族
  var ORANGE = '#ff8c42'; // 对比曲线
  var PURPLE = '#9d7aff'; // 第三曲线 / 反函数
  var GREEN = '#4ade80';  // 标记 / 结论

  var course = {
    id: 'elementary-functions',
    title: '初等函数族',
    summary: '幂、指、对、三角、反三角——五类基本初等函数的全景速览。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M20 90 Q60 70 100 50 T180 25" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><path d="M20 95 Q70 92 100 70 T180 40" fill="none" stroke="#ff8c42" stroke-width="2.5"/><path d="M20 92 C70 30 130 95 180 60" fill="none" stroke="#9d7aff" stroke-width="2"/><path d="M20 95 Q70 88 100 80 T180 95" fill="none" stroke="#4ade80" stroke-width="2"/><text x="100" y="14" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">x^n · e^x · ln x · sin x</text></svg>',

    steps: [
      // ===== Step 1：幂函数族 =====
      {
        title: '幂函数 y = x^n',
        narrative: `幂函数是最朴素的初等函数：$y = x^n$，$n$ 为常数。仅一个 $n$ 就衍生出形态迥异的曲线家族。

**正整数幂**（$n=1,2,3$）：随 $n$ 增大，曲线在 $|x|<1$ 内**更贴近 x 轴**（小于 1 的数越乘越小），在 $|x|>1$ 则**陡然攀升**。$n=1$ 是直线，$n=2$ 是抛物线，$n=3$ 是立方曲线。

**关键性质——都过 $(1,1)$**：任何 $n$ 都有 $1^n=1$，这是幂函数的"锚点"。原点处则要看 $n$：$n>0$ 时过 $(0,0)$，$n<0$ 时趋于无穷。$n=-1$ 给出双曲线 $y=1/x$（原点附近垂直爆炸），$n=1/2$ 给出 $y=\\sqrt{x}$（仅 $x\\ge 0$）。

右侧蓝色 $y=x$、橙色 $y=x^2$、紫色 $y=x^3$。拖动 $n$ 滑块连续改变指数，看曲线如何围绕固定的 $(1,1)$ 锚点"旋转"——这正是幂函数族的几何骨架。`,

        scene: {
          axes: { xRange: [-2, 2], yRange: [-2, 4] },
          layers: [
            // y = x
            { type: 'plot', fn: 'x', color: BLUE, lineWidth: 2.5, range: [-1.9, 1.9], samples: 40 },
            // y = x^2
            { type: 'plot', fn: 'x^2', color: ORANGE, lineWidth: 2.5, range: [-1.9, 1.9], samples: 60 },
            // y = x^3
            { type: 'plot', fn: 'x^3', color: PURPLE, lineWidth: 2.5, range: [-1.9, 1.9], samples: 60 },
            // 锚点 (1,1)
            { type: 'point', x: 1, y: 1, color: GREEN, radius: 6, label: '(1,1)' },
            { type: 'text', x: -1.9, y: 3.6, text: '蓝:x   橙:x²   紫:x³', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -1.9, y: 3.1, text: '绿点为公共锚点 (1,1)', color: GREEN, fontSize: 10, align: 'left' },
          ],
        },
        controls: [
          { name: 'n', label: '指数 n（蓝曲线 y=xⁿ）', type: 'slider', min: -2, max: 4, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'n') return;
          // 用蓝曲线动态演示任意 n 的 x^n
          var n = value;
          scene.layers[0].fn = 'x^(' + n + ')';
          // 严重发散区域采样仍受保护；标注当前 n
          scene.layers[5].text = '当前 n=' + (Math.round(n * 10) / 10) + '  蓝:y=xⁿ';
        },
      },

      // ===== Step 2：指数与对数 =====
      {
        title: '指数 e^x 与对数 ln x',
        narrative: `指数函数 $y=e^x$ 与对数函数 $y=\\ln x$ 互为**反函数**，关于直线 $y=x$ 对称。

**指数函数 $e^x$**：定义域全实数，值域 $(0,+\\infty)$，永远为正。它**越涨越快**——导数就是它自己 $(e^x)'=e^x$，每点切线斜率等于函数值。$x\\to+\\infty$ 时爆炸增长，$x\\to-\\infty$ 时以 $y=0$ 为渐近线。

**对数函数 $\\ln x$**：定义域仅 $(0,+\\infty)$，值域全实数，是 $e^x$ 的反函数，增长却**极其缓慢**。$\\ln 1=0$、$\\ln e=1$；$x>1$ 时缓慢爬升，$0<x<1$ 时为负趋向 $-\\infty$。

**反函数的几何意义**：把 $e^x$ 沿 $y=x$ 翻折即得 $\\ln x$，二者**互为镜像**。

右侧蓝色 $e^x$、橙色 $\\ln x$、紫色虚线 $y=x$。拖动观察点看两曲线如何被对角线"粘合"为镜像——$e^x$ 的爆炸攀升与 $\\ln x$ 的从容缓坡，正是指数与对数的本质对照。`,

        scene: {
          axes: { xRange: [-3, 3], yRange: [-3, 3] },
          layers: [
            // 对称轴 y=x
            { type: 'plot', fn: 'x', color: PURPLE, lineWidth: 1.5, range: [-3, 3], samples: 20 },
            // e^x
            { type: 'plot', fn: 'exp(x)', color: BLUE, lineWidth: 2.5, range: [-3, 1.1], samples: 120 },
            // ln x（仅 x>0）
            { type: 'plot', fn: 'ln(x)', color: ORANGE, lineWidth: 2.5, range: [0.05, 3], samples: 120 },
            // 交点标记 (0,1) 与 (1,0)
            { type: 'point', x: 0, y: 1, color: GREEN, radius: 5, label: '(0,1)' },
            { type: 'point', x: 1, y: 0, color: GREEN, radius: 5, label: '(1,0)' },
            { type: 'text', x: -2.9, y: 2.7, text: '蓝:eˣ   橙:ln x   紫:y=x（对称轴）', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: -2.9, y: 2.2, text: '二者关于 y=x 互为镜像', color: GREEN, fontSize: 10, align: 'left' },
            // 动态观察点（onControl 控制）—— layers[7] 与 [8]
            { type: 'point', x: 1, y: 2.718, color: BLUE, radius: 5, label: '(x, eˣ)' },
            { type: 'point', x: 2.718, y: 1, color: ORANGE, radius: 5, label: '(eˣ, x)' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: 0.2, max: 2.8, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          // 在 e^x 上标 (x, eˣ)，利用反函数镜像在 ln x 上标 (eˣ, x)
          var ex = Math.exp(value);
          scene.layers[7].x = value;
          scene.layers[7].y = ex;
          scene.layers[7].label = '(x, eˣ)';
          scene.layers[8].x = ex;
          scene.layers[8].y = value;
          scene.layers[8].label = '(eˣ, x)';
        },
      },

      // ===== Step 3：三角函数 =====
      {
        title: '三角函数 sin / cos / tan',
        narrative: `三角函数刻画周期现象，是描述振荡与波动的基本语言。

**sin 与 cos**：周期 $2\\pi$，值域 $[-1,1]$，形状完全相同，仅**相位相差 $\\pi/2$**：$\\cos x=\\sin(x+\\pi/2)$。把 sin 向左平移 $\\pi/2$ 即得 cos，零点交错排列。

**tan = sin/cos**：在 $\\cos x=0$ 处（$x=\\pi/2+k\\pi$）**无定义并垂直发散**，趋向 $\\pm\\infty$。周期 $\\pi$（比 sin/cos 短一半），值域全实数，由无穷多条"飞天"分支组成。

**导数的闭环**：$(\\sin x)'=\\cos x$，$(\\cos x)'=-\\sin x$。求导在二者间来回切换、差一负号——这正是周期函数自我复归的根源。

右侧蓝色 $\\sin x$、橙色 $\\cos x$、紫色 $\\tan x$（在 $\\pm\\pi/2$ 处截断）。观察 sin 与 cos 如何"咬着"彼此前行，而 tan 在每个端点冲向无穷。`,

        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-3, 3] },
          layers: [
            // tan（先画，置于底层；范围避开渐近线附近以减少发散跨度）
            { type: 'plot', fn: 'tan(x)', color: PURPLE, lineWidth: 1.8, range: [-6.2, 6.2], samples: 400 },
            // sin
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-6.28, 6.28], samples: 200 },
            // cos
            { type: 'plot', fn: 'cos(x)', color: ORANGE, lineWidth: 2.5, range: [-6.28, 6.28], samples: 200 },
            // y=±1 参考线
            { type: 'line', from: [-6.5, 1], to: [6.5, 1], color: GREEN, dashed: true, lineWidth: 1 },
            { type: 'line', from: [-6.5, -1], to: [6.5, -1], color: GREEN, dashed: true, lineWidth: 1 },
            { type: 'text', x: -6.3, y: 2.7, text: '蓝:sin x   橙:cos x   紫:tan x', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: -6.3, y: 2.2, text: '绿虚线:±1（sin/cos 的值域边界）', color: GREEN, fontSize: 9, align: 'left' },
            // 动态观察点（onControl 控制）—— layers[7] 与 [8]
            { type: 'point', x: 0, y: 0, color: BLUE, radius: 5, label: 'sin' },
            { type: 'point', x: 0, y: 1, color: ORANGE, radius: 5, label: 'cos' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -6, max: 6, step: 0.1, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          // 在 sin 与 cos 曲线上各标一个点，体现相位差
          scene.layers[7].x = value;
          scene.layers[7].y = Math.sin(value);
          scene.layers[7].color = BLUE;
          scene.layers[7].label = 'sin';
          scene.layers[8].x = value;
          scene.layers[8].y = Math.cos(value);
          scene.layers[8].color = ORANGE;
          scene.layers[8].label = 'cos';
        },
      },

      // ===== Step 4：反三角函数 =====
      {
        title: '反三角函数 arcsin / arccos / arctan',
        narrative: `三角函数因周期性而非一一对应，但**限制到主值区间**后可反解，得到反三角函数。

**arcsin x**：sin 限制在 $[-\\pi/2,\\pi/2]$（递增），定义域 $[-1,1]$，值域 $[-\\pi/2,\\pi/2]$，把 $[-1,1]$ "拉直"为单调上升曲线，端点处切线垂直。

**arccos x**：cos 限制在 $[0,\\pi]$（递减），定义域 $[-1,1]$，值域 $[0,\\pi]$。与 arcsin 形状相同但**递减且下移**，满足 $\\arcsin x+\\arccos x=\\pi/2$（互补）。

**arctan x**：主值区间 $(-\\pi/2,\\pi/2)$，定义域全实数，有**两条水平渐近线** $y=\\pm\\pi/2$。$(\\arctan x)'=\\frac{1}{1+x^2}>0$，单调递增。

它还是积分"逆向三角替换"的主角：$\\int\\frac{dx}{1+x^2}=\\arctan x+C$。

右侧蓝色 $\\arcsin x$、橙色 $\\arccos x$、紫色 $\\arctan x$。蓝橙仅活在 $[-1,1]$ 窄带，紫色横贯 x 轴并趋近渐近线。`,

        scene: {
          axes: { xRange: [-3, 3], yRange: [-2, 3.5] },
          layers: [
            // arctan（先画，定义域全实数）
            { type: 'plot', fn: 'atan(x)', color: PURPLE, lineWidth: 2.5, range: [-2.95, 2.95], samples: 200 },
            // arcsin（仅 [-1,1]）
            { type: 'plot', fn: 'asin(x)', color: BLUE, lineWidth: 2.5, range: [-0.999, 0.999], samples: 120 },
            // arccos（仅 [-1,1]）
            { type: 'plot', fn: 'acos(x)', color: ORANGE, lineWidth: 2.5, range: [-0.999, 0.999], samples: 120 },
            // 渐近线 y=±π/2（arctan 的水平渐近线）
            { type: 'line', from: [-3, 1.5708], to: [3, 1.5708], color: GREEN, dashed: true, lineWidth: 1 },
            { type: 'line', from: [-3, -1.5708], to: [3, -1.5708], color: GREEN, dashed: true, lineWidth: 1 },
            // 定义域边界 x=±1
            { type: 'line', from: [1, -2], to: [1, 3.5], color: '#9aa7b4', dashed: true, lineWidth: 1 },
            { type: 'line', from: [-1, -2], to: [-1, 3.5], color: '#9aa7b4', dashed: true, lineWidth: 1 },
            { type: 'text', x: -2.9, y: 3.2, text: '蓝:arcsin   橙:arccos   紫:arctan', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: -2.9, y: 2.7, text: '绿虚线:y=±π/2   灰虚线:x=±1', color: GREEN, fontSize: 9, align: 'left' },
            // 动态观察点（onControl 控制）—— layers[8]
            { type: 'point', x: 0.5, y: 0.5236, color: BLUE, radius: 5, label: 'arcsin' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x（注意 |x|≤1 才有 arcsin/arccos）', type: 'slider', min: -1, max: 1, step: 0.05, value: 0.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          // 在 arcsin 曲线上标观察点（slider 已限制 |x|≤1）
          scene.layers[8].x = value;
          scene.layers[8].y = Math.asin(value);
          scene.layers[8].color = BLUE;
          scene.layers[8].label = 'arcsin';
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
