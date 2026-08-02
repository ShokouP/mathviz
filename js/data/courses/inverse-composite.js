/**
 * mathviz — js/data/courses/inverse-composite.js
 * 课案：反函数与复合函数（北大高数 §1.3，函数与映射的深化）。
 *
 * 四步：
 *   1. 反函数概念       e^x 与 lnx 关于 y=x 对称，输入输出角色互换
 *   2. 反函数求导回顾   斜率互为倒数，回顾 [f^-1]' = 1 / f'(f^-1(x))
 *   3. 复合函数概念     "嵌套机器"：一台机器的输出喂给下一台
 *   4. 复合函数分解     把 sin(x^2+1) 拆成外层 sin、内层 x^2+1
 *
 * 设计说明：
 *   - onControl 直接 mutate scene.layers[i]，不用 bind（避免 setPath 下标问题）。
 *   - 表达式幂运算用 ^，变量为 x，常量 pi/e；反函数记号在文本里用 ⁻¹。
 *   - 颜色调色板：蓝 #4f9cf9（原/外层）、橙 #ff8c42（反/内层）、紫 #9d7aff（第二对象）、绿 #4ade80（对称轴/结论）。
 *   - layer 类型：plot / point / line / text / parametric(fx/fy/tRange)。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 原函数 / 外层
  var ORANGE = '#ff8c42'; // 反函数 / 内层
  var PURPLE = '#9d7aff'; // 第二对象
  var GREEN = '#4ade80';  // 对称轴 / 结论

  var course = {
    id: 'inverse-composite',
    title: '反函数与复合函数',
    summary: '把函数当成"机器"——反函数是倒着开的机器，复合函数是机器的串接。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="30" y1="95" x2="170" y2="20" stroke="#4ade80" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M30 95 Q70 88 100 70 Q120 55 150 25" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><path d="M30 25 Q60 50 80 60 Q110 75 150 90" fill="none" stroke="#ff8c42" stroke-width="2.5"/><text x="100" y="108" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">eˣ 与 lnx 关于 y=x 对称</text></svg>',

    steps: [
      // ===== Step 1：反函数概念 =====
      {
        title: '反函数概念',
        narrative: `函数 $y = f(x)$ 是一台"机器"：输入 $x$，按规则吐出 $y$。
那么能不能**反过来**——给定一个 $y$，找出当初那个 $x$？

这就是**反函数** $x = f^{-1}(y)$，习惯上仍把自变量记作 $x$，写成 $y = f^{-1}(x)$。
注意 $f^{-1}$ 不是 $\\frac{1}{f}$，它是"**倒着开的同一台机器**"：
$f$ 把 $a$ 变成 $b$，则 $f^{-1}$ 把 $b$ 还原成 $a$。

最经典的例子：**指数与对数互为反函数**。

$$f(x) = e^x \\quad\\Longleftrightarrow\\quad f^{-1}(x) = \\ln x$$

把 $e$ 自乘 $a$ 次得到 $e^a$（蓝色 $e^x$ 做的事），
而 $\\ln$ 告诉你"$e$ 的几次方等于这个数"（橙色 $\\ln x$ 做的事）。

它们图像关于直线 $y = x$ **对称**。为什么？
因为 $e^x$ 上一点 $(a, e^a)$，把它横纵坐标对调就变成 $(e^a, a)$，
而这正是 $\\ln x$ 上的点。**对调输入与输出**，几何上就是关于 $y=x$ 翻折。

右侧绿色虚线是对称轴 $y=x$，蓝色是 $e^x$，橙色是 $\\ln x$。
拖动 $x$ 滑块，蓝点 $(x, e^x)$ 与橙点 $(e^x, x)$ 会像镜像一样同步移动。`,

        scene: {
          axes: { xRange: [-3, 5], yRange: [-3, 5] },
          layers: [
            // 对称轴 y=x
            { type: 'line', from: [-2.8, -2.8], to: [4.8, 4.8], color: GREEN, dashed: true, lineWidth: 1.2 },
            // e^x
            { type: 'plot', fn: 'exp(x)', color: BLUE, lineWidth: 2.5, range: [-2.8, 1.6] },
            // ln(x)
            { type: 'plot', fn: 'ln(x)', color: ORANGE, lineWidth: 2.5, range: [0.08, 4.8] },
            // 观察点对：(x, e^x) 与 (e^x, x)
            { type: 'point', x: 1, y: 2.718, color: BLUE, radius: 5, label: '(x, eˣ)' },
            { type: 'point', x: 2.718, y: 1, color: ORANGE, radius: 5, label: '(eˣ, x)' },
            // 两条连线，把对称关系画成矩形，强化"对调"直觉
            { type: 'line', from: [1, 0], to: [1, 2.718], color: BLUE, dashed: true, lineWidth: 1, opacity: 0.5 },
            { type: 'line', from: [0, 2.718], to: [1, 2.718], color: BLUE, dashed: true, lineWidth: 1, opacity: 0.5 },
            { type: 'text', x: 2.4, y: 4.4, text: '蓝: eˣ   橙: lnx', color: '#9aa7b4', fontSize: 12, align: 'left' },
            { type: 'text', x: -2.7, y: 4.4, text: 'y=x', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '输入 x', type: 'slider', min: -1.5, max: 1.5, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var ex = Math.exp(value);
          scene.layers[3].x = value;
          scene.layers[3].y = ex;
          scene.layers[4].x = ex;
          scene.layers[4].y = value;
          // 矩形辅助线跟随
          scene.layers[5].from = [value, 0];
          scene.layers[5].to = [value, ex];
          scene.layers[6].from = [0, ex];
          scene.layers[6].to = [value, ex];
        },
      },

      // ===== Step 2：反函数求导回顾 =====
      {
        title: '反函数求导回顾',
        narrative: `既然 $e^x$ 与 $\\ln x$ 是同一台机器的正反两种开法，
它们的导数也必定有联系。这条联系写成一条对称而优雅的法则：

$$[f^{-1}(x)]' = \\frac{1}{f'\\bigl(f^{-1}(x)\\bigr)}$$

用大白话讲：**反函数在某点的斜率，等于原函数在对应点处斜率的倒数。**

以 $\\ln x$ 为例：把 $x$ 先用 $\\ln$ 还原成 $\\ln x$，再去看 $e^x$ 在那里的斜率 $e^{\\ln x} = x$，
取倒数就得到：

$$[\\ln x]' = \\frac{1}{x}$$

为什么是"倒数"？看右侧就一目了然。蓝色是 $e^x$，橙色是 $\\ln x$，
两条切线在镜像点上各自画出。
当 $e^x$ 很陡（比如 $x$ 变大时它指数式飙升），$\\ln x$ 在对应处就**很平缓**——
一个变化剧烈，另一个反而变化缓慢，两者的变化率**乘积恒为 1**。

这就是反函数求导的几何本质：**镜像对称把"陡"翻成了"平"，斜率自然互为倒数。**

拖动 $a$ 滑块，两条切线同步移动，注意它们的斜率始终相乘等于 1。`,

        scene: {
          axes: { xRange: [-3, 5], yRange: [-3, 5] },
          layers: [
            // 对称轴 y=x
            { type: 'line', from: [-2.8, -2.8], to: [4.8, 4.8], color: GREEN, dashed: true, lineWidth: 1.2 },
            // e^x
            { type: 'plot', fn: 'exp(x)', color: BLUE, lineWidth: 2.5, range: [-2.8, 1.55] },
            // ln(x)
            { type: 'plot', fn: 'ln(x)', color: ORANGE, lineWidth: 2.5, range: [0.08, 4.8] },
            // 切线对（在切点处用解析导数手算端点；exp'(a)=exp(a)，ln'(b)=1/b）
            { type: 'line', from: [0.6202, 1.6859], to: [1.3798, 3.7506], color: BLUE, dashed: false, lineWidth: 2 },
            { type: 'line', from: [1.6859, 0.6202], to: [3.7506, 1.3798], color: ORANGE, dashed: false, lineWidth: 2 },
            // 观察点对
            { type: 'point', x: 1, y: 2.718, color: BLUE, radius: 5, label: '斜率=e' },
            { type: 'point', x: 2.718, y: 1, color: ORANGE, radius: 5, label: '斜率=1/e' },
            { type: 'text', x: -2.7, y: 4.5, text: '两条切线斜率互为倒数', color: '#9aa7b4', fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'a', label: '原函数点 a', type: 'slider', min: -1, max: 1.4, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'a') return;
          var ea = Math.exp(value);
          // 切线段：以切点为中心、半长 halfLen 沿斜率方向延伸
          function seg(px, py, slope, halfLen) {
            var n = Math.sqrt(1 + slope * slope);
            var dx = halfLen / n, dy = (halfLen * slope) / n;
            return { from: [px - dx, py - dy], to: [px + dx, py + dy] };
          }
          // e^x 在 (a, e^a) 处切线，斜率 = e^a
          var t1 = seg(value, ea, ea, 1.1);
          scene.layers[3].from = t1.from;
          scene.layers[3].to = t1.to;
          // ln x 在 (e^a, a) 处切线，斜率 = 1/e^a（互为倒数）
          var t2 = seg(ea, value, 1 / ea, 1.1);
          scene.layers[4].from = t2.from;
          scene.layers[4].to = t2.to;
          // 观察点同步
          scene.layers[5].x = value;
          scene.layers[5].y = ea;
          scene.layers[5].label = '斜率=' + ea.toFixed(2);
          scene.layers[6].x = ea;
          scene.layers[6].y = value;
          scene.layers[6].label = '斜率=' + (1 / ea).toFixed(3);
        },
      },

      // ===== Step 3：复合函数概念 =====
      {
        title: '复合函数概念：嵌套机器',
        narrative: `反函数是把一台机器**倒着开**，而**复合函数**是把两台机器**串起来开**。

想象一条流水线：第一台机器 $g$ 把原料 $x$ 加工成半成品 $u = g(x)$，
第二台机器 $f$ 再把 $u$ 加工成成品 $y = f(u)$。整条流水线就是一个**复合函数**：

$$y = f(g(x))$$

记作 $f \\circ g$，读作"$f$ 圈 $g$"。注意顺序：**先算内层 $g$，再算外层 $f$**，
和读的顺序（从右到左）一致。

举个具体的例子：$y = \\sin(x^2)$。

- 内层机器 $g(x) = x^2$（蓝色），把 $x$ 压成 $u = x^2$；
- 外层机器 $f(u) = \\sin(u)$（橙色），把 $u$ 喂进正弦波；
- 串起来就是绿色曲线 $y = \\sin(x^2)$——一条"频率越往两边越高"的波。

右侧画的就是这条流水线。蓝色抛物线是内层 $u = x^2$，
绿色是复合结果 $\\sin(x^2)$。
拖动 $x$ 滑块，紫色点会沿抛物线算出 $u = x^2$，
绿色点则在复合曲线上同步移动——你能**看见数据从一台机器流进下一台机器**。

这种"嵌套"结构在数学里无处不在：只要一个函数里**套着另一个函数**，
它就是复合函数，下一节我们要学的**链式法则**，正是为它量身定制的求导工具。`,

        scene: {
          axes: { xRange: [-2, 3], yRange: [-2, 5] },
          layers: [
            // 内层 u = x^2
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2, range: [-1.8, 2.3] },
            // 复合 sin(x^2)
            { type: 'plot', fn: 'sin(x^2)', color: GREEN, lineWidth: 2.5, range: [-1.8, 2.3] },
            // 复合 sin(x^2) 的切线：在切点用解析导数 2x·cos(x²) 手算端点
            { type: 'line', from: [0.4365, 0.7525], to: [1.9635, 1.2304], color: GREEN, dashed: false, lineWidth: 1.8 },
            // 内层点 u=x^2
            { type: 'point', x: 1.2, y: 1.44, color: PURPLE, radius: 5, label: 'u=x²' },
            // 复合点
            { type: 'point', x: 1.2, y: 0.935, color: GREEN, radius: 5, label: 'sin(x²)' },
            // 图例
            { type: 'text', x: 1.5, y: 4.4, text: '蓝: u=x²（内层）', color: BLUE, fontSize: 12, align: 'left' },
            { type: 'text', x: 1.5, y: 3.8, text: '绿: sin(x²)（复合）', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -1.9, y: 4.4, text: 'x → u → y', color: '#9aa7b4', fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '输入 x', type: 'slider', min: -1.7, max: 2.2, step: 0.1, value: 1.2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var u = value * value;
          var y = Math.sin(u);
          // 切线：复合函数导数 = cos(x²)·2x
          var m = Math.cos(u) * 2 * value;
          var halfLen = 0.8;
          var n = Math.sqrt(1 + m * m);
          scene.layers[2].from = [value - halfLen / n, y - (halfLen * m) / n];
          scene.layers[2].to = [value + halfLen / n, y + (halfLen * m) / n];
          scene.layers[3].x = value;
          scene.layers[3].y = u;
          scene.layers[4].x = value;
          scene.layers[4].y = y;
        },
      },

      // ===== Step 4：复合函数分解 =====
      {
        title: '复合函数分解',
        narrative: `会识别复合函数，比会算某一道题更重要——因为它是**链式法则**的入场券。
判断一个函数是不是复合函数、能拆成几层，是后续求导的关键基本功。

方法很朴素：**从外向内，一层层剥**。每问一次"最外层是什么运算？"，就剥掉一层皮，
直到剩下最里面那个纯 $x$（或基本初等函数）为止。

拿 $y = \\sin(x^2 + 1)$ 来分解：

1. 最外层是 $\\sin(\\;\\cdot\\;)$——一个正弦运算，括号里是它的"原料"；
2. 剥开 $\\sin$，里面是 $x^2 + 1$——这又是一个"先平方、再加 1"的运算；
3. 再剥到底，就只剩 $x$ 了。

于是整条流水线写成：

$$y = f(u) = \\sin(u), \\quad u = g(x) = x^2 + 1$$

也就是 $y = f \\circ g$，**两层**。这就是它在右侧被拆成的样子：
紫色虚线箭头把外层 $\\sin$、内层 $x^2+1$、与复合结果 $\\sin(x^2+1)$ 串起来。

判断层数有个口诀：**看 $x$ 被"裹"了几层函数**。
- $\\sin(x^2+1)$：$x$ 被平方加 1，再裹进 $\\sin$——两层；
- $e^{\\sin x}$：$x$ 进 $\\sin$，再进指数——两层；
- $\\ln(\\cos(2x))$：$x$ 乘 2，进 $\\cos$，再进 $\\ln$——三层。

层数数清楚了，链式法则才能"由外向内，逐层求导，相乘"。拖动 $x$ 滑块，
可以看见数据如何依次穿过每一层：紫点是内层 $x^2+1$ 的输出，绿点是最终的复合结果。`,

        scene: {
          axes: { xRange: [-2.5, 3], yRange: [-1.5, 3] },
          layers: [
            // 内层 u = x^2 + 1
            { type: 'plot', fn: 'x^2 + 1', color: ORANGE, lineWidth: 2, range: [-2.3, 2.8] },
            // 复合 sin(x^2 + 1)
            { type: 'plot', fn: 'sin(x^2 + 1)', color: GREEN, lineWidth: 2.5, range: [-2.3, 2.8] },
            // 复合 sin(x^2 + 1) 的切线：解析导数 cos(x²+1)·2x 手算端点
            { type: 'line', from: [0.8648, 1.2599], to: [1.5352, 0.0309], color: GREEN, dashed: false, lineWidth: 1.8 },
            // 内层点
            { type: 'point', x: 1.2, y: 2.44, color: PURPLE, radius: 5, label: 'u=x²+1' },
            // 复合点
            { type: 'point', x: 1.2, y: 0.6496, color: GREEN, radius: 5, label: 'sin(x²+1)' },
            // 分解标注：把"外层 sin / 内层 x²+1"以文字框形式标出
            { type: 'text', x: -2.4, y: 2.6, text: '外层 f = sin(·)', color: BLUE, fontSize: 12, align: 'left' },
            { type: 'text', x: -2.4, y: 2.1, text: '内层 g = x² + 1', color: ORANGE, fontSize: 12, align: 'left' },
            { type: 'text', x: -2.4, y: 1.6, text: '复合 f∘g = sin(x²+1)', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: 1.9, y: 0.2, text: '两层', color: '#9aa7b4', fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '输入 x', type: 'slider', min: -2.2, max: 2.7, step: 0.1, value: 1.2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var u = value * value + 1;
          var y = Math.sin(u);
          // 切线：复合函数导数 = cos(x²+1)·2x
          var m = Math.cos(u) * 2 * value;
          var halfLen = 0.7;
          var n = Math.sqrt(1 + m * m);
          scene.layers[2].from = [value - halfLen / n, y - (halfLen * m) / n];
          scene.layers[2].to = [value + halfLen / n, y + (halfLen * m) / n];
          scene.layers[3].x = value;
          scene.layers[3].y = u;
          scene.layers[4].x = value;
          scene.layers[4].y = y;
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
