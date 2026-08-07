/**
 * mathviz — js/data/courses/derivative-rules.js
 * 课案：求导法则（北大高数 §3.2，derivative 课案的深化）。
 *
 * 四步：
 *   1. 四则运算法则     (u±v)' / (uv)' / (u/v)' 的几何图示
 *   2. 链式法则         复合函数 f(g(x)) 的导数 = f'(g)·g'(x)
 *   3. 反函数求导       ln(x) 与 e^x 互为反函数，斜率互为倒数
 *   4. 三角函数族       sin→cos→-sin→-cos 的循环链
 *
 * 设计说明：
 *   - onControl 直接 mutate scene.layers[i]，不用 bind（避免 setPath 下标问题）。
 *   - 表达式幂运算用 ^，变量为 x，常量 pi/e。
 *   - 颜色调色板：蓝 #4f9cf9（原函数）、橙 #ff8c42（导数/切线）、紫 #9d7aff（第二对象）、绿 #4ade80。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';
  var ORANGE = '#ff8c42';
  var PURPLE = '#9d7aff';
  var GREEN = '#4ade80';

  var course = {
    id: 'derivative-rules',
    title: '求导法则',
    summary: '四则、链式、反函数、三角——把求导变成机械操作的四把钥匙。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M20 90 Q60 60 100 50 T180 30" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><path d="M20 80 Q80 50 180 20" fill="none" stroke="#ff8c42" stroke-width="2" stroke-dasharray="5 3"/><text x="100" y="105" fill="#9aa7b4" font-size="11" text-anchor="middle" font-family="sans-serif">f(x) 与 f&apos;(x)</text></svg>',

    steps: [
      // ===== Step 1：四则运算法则 =====
      {
        title: '四则运算法则',
        narrative: `前面我们学会了对单个函数求导（比如 $(x^2)' = 2x$）。
但真实世界里的函数往往是几个简单函数**组合**出来的：$x^2 + \\sin x$、$x \\cdot \\ln x$、$\\frac{e^x}{x}$。
对它们逐个用定义求导太慢——好在有四条**机械法则**。

设 $u(x)$、$v(x)$ 都可导：

$$[u \\pm v]' = u' \\pm v'$$

$$[u \\cdot v]' = u'v + uv' \\qquad \\text{（不是 } u'v' \\text{！）}$$

$$\\left[\\frac{u}{v}\\right]' = \\frac{u'v - uv'}{v^2}$$

**和差的导数 = 导数的和差**，这条直觉上很自然。但**乘法法则最容易踩坑**：
$(uv)'$ 不是 $u'v'$，而是 $u'v + uv'$——你可以记成"轮流求导，另一项不变"。

右侧蓝色是 $f(x) = x^2$，紫色是 $g(x) = \\sin x$，橙色是它们的和 $h(x) = x^2 + \\sin x$。
拖动 $x$ 滑块，观察三者切线斜率：你会发现 $h'(x) = 2x + \\cos x$，正好是 $f'(x) + g'(x)$。
**和的切线斜率，等于切线斜率之和**——这就是和差法则的几何真相。`,

        scene: {
          axes: { xRange: [-2, 4], yRange: [-2, 8] },
          layers: [
            // f = x^2
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2, range: [-1.8, 2.8] },
            // g = sin(x)
            { type: 'plot', fn: 'sin(x)', color: PURPLE, lineWidth: 2, range: [-1.8, 2.8] },
            // h = x^2 + sin(x)
            { type: 'plot', fn: 'x^2 + sin(x)', color: ORANGE, lineWidth: 2.5, range: [-1.8, 2.8] },
            // 三条切线
            { type: 'tangent', fn: 'x^2', at: 1.5, color: BLUE, dashed: true, halfLen: 1, lineWidth: 1.5 },
            { type: 'tangent', fn: 'sin(x)', at: 1.5, color: PURPLE, dashed: true, halfLen: 1, lineWidth: 1.5 },
            { type: 'tangent', fn: 'x^2 + sin(x)', at: 1.5, color: ORANGE, dashed: false, halfLen: 1, lineWidth: 2 },
            // 图例
            { type: 'text', x: 2.2, y: 7.5, text: 'f=x²', color: BLUE, fontSize: 12, align: 'left' },
            { type: 'text', x: 2.2, y: 6.8, text: 'g=sin x', color: PURPLE, fontSize: 12, align: 'left' },
            { type: 'text', x: 2.2, y: 6.1, text: 'h=f+g', color: ORANGE, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -1.5, max: 2.5, step: 0.1, value: 1.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[3].at = value;
          scene.layers[4].at = value;
          scene.layers[5].at = value;
        },
      },

      // ===== Step 2：链式法则 =====
      {
        title: '链式法则',
        narrative: `最强大、也最需要直觉的一条法则——**链式法则**，处理**复合函数** $f(g(x))$。

$$[f(g(x))]' = f'(g(x)) \\cdot g'(x)$$

比如 $\\sin(x^2)$，外层是 $\\sin$（作用在 $g=x^2$ 上），内层是 $x^2$：
$$[\\sin(x^2)]' = \\cos(x^2) \\cdot 2x$$

记法："**由外向内，逐层求导，相乘**"。每剥一层皮，就把那层的导数乘进去。

**为什么是乘法？** 看右侧。蓝色是内层 $u = g(x) = x^2$，橙色是外层 $y = f(u) = \\sin(u)$，
绿色是复合结果 $y = \\sin(x^2)$。

复合的"变化率传递"像齿轮：$x$ 动一点 → $u$ 动 $g'(x)$ 倍 → $y$ 又动 $f'(u)$ 倍，
总放大率就是两个放大率**相乘**。这就是链式法则的本质——**变化率的接力放大**。

拖动 $x$ 滑块，三个观察点同步移动，注意绿色曲线的陡度，等于另两个陡度的乘积。`,

        scene: {
          axes: { xRange: [-2, 4], yRange: [-2, 5] },
          layers: [
            // 内层 g(x)=x^2（画在主坐标系，作为 u）
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2, range: [-1.8, 2.2] },
            // 复合 sin(x^2)
            { type: 'plot', fn: 'sin(x^2)', color: GREEN, lineWidth: 2.5, range: [-1.8, 2.2] },
            // 观察点：x 处的复合值（初始 x=1.5，sin(2.25)≈0.778）
            { type: 'point', x: 1.5, y: 0.778, color: GREEN, radius: 5, label: 'sin(x²)' },
            // 内层点
            { type: 'point', x: 1.5, y: 2.25, color: BLUE, radius: 4, label: 'u=x²' },
            // 复合的切线
            { type: 'tangent', fn: 'sin(x^2)', at: 1.5, color: GREEN, dashed: false, halfLen: 0.9, lineWidth: 2 },
            { type: 'text', x: -1.8, y: 4.5, text: '蓝: u=x²  绿: sin(x²)', color: '#9aa7b4', fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '内层输入 x', type: 'slider', min: -1.5, max: 2, step: 0.1, value: 1.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var u = value * value;
          var y = Math.sin(u);
          scene.layers[2].x = value;
          scene.layers[2].y = y;
          scene.layers[3].x = value;
          scene.layers[3].y = u;
          scene.layers[4].at = value;
        },
      },

      // ===== Step 3：反函数求导 =====
      {
        title: '反函数求导',
        narrative: `一对互为反函数的函数，它们的图像关于直线 $y = x$ **对称**。
最经典的例子：$e^x$ 与 $\\ln x$。

$$[\\ln x]' = \\frac{1}{x}, \\qquad [e^x]' = e^x$$

而反函数求导法则把它们联系成一条美妙公式：

$$[f^{-1}(x)]' = \\frac{1}{f'(f^{-1}(x))}$$

意思是：**反函数在某点的斜率，等于原函数在对称点处斜率的倒数**。

看右侧。蓝色是 $e^x$，橙色是它的反函数 $\\ln x$，绿色虚线是对称轴 $y = x$。
它们关于这条绿线镜像对称。

拖动 $x$ 滑块，两个观察点会**对称地移动**（一个在 $e^x$ 上的 $(a, e^a)$，
另一个在 $\\ln x$ 上的 $(e^a, a)$）。你会发现两条切线的斜率**互为倒数**——
当 $e^x$ 的切线很陡时，$\\ln x$ 对应处的切线就很平。这就是反函数求导的几何意义。`,

        scene: {
          axes: { xRange: [-3, 4], yRange: [-2, 5] },
          layers: [
            // 对称轴 y=x
            { type: 'line', from: [-2, -2], to: [4.5, 4.5], color: GREEN, dashed: true, lineWidth: 1.2 },
            // e^x
            { type: 'plot', fn: 'exp(x)', color: BLUE, lineWidth: 2.5, range: [-2.5, 1.6] },
            // ln(x)
            { type: 'plot', fn: 'ln(x)', color: ORANGE, lineWidth: 2.5, range: [0.1, 4.5] },
            // 观察点对：(a, e^a) 与 (e^a, a)
            { type: 'point', x: 1, y: 2.718, color: BLUE, radius: 5, label: '(a, eᵃ)' },
            { type: 'point', x: 2.718, y: 1, color: ORANGE, radius: 5, label: '(eᵃ, a)' },
            // 切线对
            { type: 'tangent', fn: 'exp(x)', at: 1, color: BLUE, dashed: true, halfLen: 1, lineWidth: 1.5 },
            { type: 'tangent', fn: 'ln(x)', at: 2.718, color: ORANGE, dashed: true, halfLen: 1, lineWidth: 1.5 },
            { type: 'text', x: 2, y: 4.5, text: 'y=x', color: GREEN, fontSize: 12 },
          ],
        },
        controls: [
          { name: 'a', label: '原函数点 a', type: 'slider', min: -1, max: 1.5, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'a') return;
          var ea = Math.exp(value);
          scene.layers[3].x = value;
          scene.layers[3].y = ea;
          scene.layers[3].label = '(a, eᵃ)';
          scene.layers[4].x = ea;
          scene.layers[4].y = value;
          scene.layers[4].label = '(eᵃ, a)';
          scene.layers[5].at = value;
          scene.layers[6].at = ea;
        },
      },

      // ===== Step 4：三角函数族 =====
      {
        title: '三角函数族',
        narrative: `记住这一组循环，三角函数的求导就通了：

$$\\sin x \\xrightarrow{\\,\\prime\\,} \\cos x \\xrightarrow{\\,\\prime\\,} -\\sin x \\xrightarrow{\\,\\prime\\,} -\\cos x \\xrightarrow{\\,\\prime\\,} \\sin x$$

求四次导又回到起点——这是一个长度为 4 的**循环**。
而 $\\tan x$ 与 $\\sec x$ 之类，可以由商法则推出：

$$[\\tan x]' = \\frac{1}{\\cos^2 x} = \\sec^2 x$$

右侧画的就是这条循环链。拖动 $k$ 滑块（$0/1/2/3$）切换显示 $\\sin x$ 求导 $k$ 次的结果：
- $k=0$：蓝色 $\\sin x$
- $k=1$：橙色 $\\cos x$
- $k=2$：紫色 $-\\sin x$（即 $\\sin x$ 翻转）
- $k=3$：绿色 $-\\cos x$

注意 $k=4$ 时又会变回 $\\sin x$。这个"每求一次导，曲线向左平移 $\\pi/2$"的现象，
正是三角函数描述**振动与波**的根本原因——求导 = 相位前移。`,

        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-2, 2] },
          layers: [
            // 当前 k 对应的曲线，onControl 切换 fn
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 3, range: [-6.2, 6.2] },
            // 原始 sin 作为半透明参照
            { type: 'plot', fn: 'sin(x)', color: '#3a4452', lineWidth: 1.5, range: [-6.2, 6.2] },
            // 标注
            { type: 'text', x: 0, y: 1.7, text: "k=0: sin x（求导 0 次）", color: BLUE, fontSize: 14 },
          ],
        },
        controls: [
          { name: 'k', label: '求导次数 k (0/1/2/3)', type: 'slider', min: 0, max: 3, step: 1, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'k') return;
          var k = Math.round(value);
          var fns = ['sin(x)', 'cos(x)', '-sin(x)', '-cos(x)'];
          var colors = [BLUE, ORANGE, PURPLE, GREEN];
          var labels = ['sin x', 'cos x', '-sin x', '-cos x'];
          scene.layers[0].fn = fns[k];
          scene.layers[0].color = colors[k];
          scene.layers[0]._fn = undefined;
          scene.layers[2].text = 'k=' + k + ': ' + labels[k] + '（求导 ' + k + ' 次）';
          scene.layers[2].color = colors[k];
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
