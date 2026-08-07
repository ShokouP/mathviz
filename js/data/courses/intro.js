/**
 * mathviz — js/data/courses/intro.js
 * 课案 0：微积分启程（给大一新生的第一课，零基础）。
 *
 * 五步：
 *   1. 变化的世界      生活例子引出"研究变化"的需求
 *   2. 函数：描述世界的语言   补函数概念（输入→输出机器的类比）
 *   3. 坐标系与图形    几何直觉，画出函数长什么样
 *   4. 瞬时变化之谜    核心矛盾：某一瞬间的速度是多少？
 *   5. 通往微积分      预告四大主题，过渡到其他课案
 *
 * 设计说明：
 *   - 叙事刻意口语化、多用生活类比，不假设高中以上基础。
 *   - 公式克制使用，先讲直觉再给符号。
 *   - 每步都有可视化（哪怕只是简单的点和线），让"看见"先于"计算"。
 *   - 颜色统一调色板：蓝 #4f9cf9 / 橙 #ff8c42 / 紫 #9d7aff / 绿 #4ade80。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主对象
  var ORANGE = '#ff8c42'; // 标记 / 关注点
  var PURPLE = '#9d7aff'; // 辅助 / 第二对象
  var GREEN = '#4ade80';  // 目标 / 结论

  var course = {
    id: 'intro',
    title: '微积分启程（零基础入门）',
    summary: '给大一新生的第一课：从"为什么要研究变化"到看懂微积分的全貌。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M15 95 Q60 88 100 70 T185 25" fill="none" stroke="#4f9cf9" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="70" r="5" fill="#ff8c42"/><text x="100" y="20" fill="#e6edf3" font-size="14" text-anchor="middle" font-family="-apple-system,sans-serif" font-weight="600">START</text><text x="100" y="108" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="-apple-system,sans-serif">从这里出发</text></svg>',

    steps: [
      // ===== Step 1：变化的世界 =====
      {
        title: '变化的世界',
        narrative: `欢迎来到微积分。先别怕那些符号——我们从一个最普通的问题开始。

**这个世界，无时无刻不在变化。**

你从家走到教室，位置在变；手机充电时，电量在变；刚倒好的热水，温度在变；
甚至你的身高，从小学到现在也在变（虽然现在可能不太变了）。

物理学、生物学、经济学、计算机科学……几乎所有学科都在研究同一件事：
**某个量，如何随时间（或其他东西）变化。**

- 速度是「位置随时间变化的快慢」
- 加速度是「速度随时间变化的快慢」
- 利率是「钱随时间增长的快慢」

微积分，就是人类发明出来**精确描述"变化"的数学语言**。它的核心只有两个问题：

> 给定一个变化的过程，**这一刻它变化得多快？**
> 给定它每一刻变化得多快，**总共积累了多少？**

这两个问题，分别对应微积分的两半——**微分**和**积分**。
后面几步，我们一步步把这两件事讲清楚。先看图：橙色曲线可以是一辆车的位置记录，
它**整体的形状**就在告诉你这辆车是怎么开的。`,

        scene: {
          axes: { xRange: [-0.5, 10], yRange: [-0.5, 8] },
          layers: [
            // 一条示意性的"位置-时间"曲线（用 plot 画一条二次曲线，表示加速）
            { type: 'plot', fn: '0.08*x^2', color: ORANGE, lineWidth: 3, range: [0, 9.5] },
            // 起点和终点标记
            { type: 'point', x: 0, y: 0, color: GREEN, label: '出发' },
            { type: 'point', x: 9.5, y: 7.2, color: BLUE, label: '到达' },
            // 当前时刻的车（沿曲线移动）
            { type: 'point', x: 4, y: 1.28, color: PURPLE, radius: 6, label: '此刻' },
            // 竖线投影到 x 轴
            { type: 'line', from: [4, 0], to: [4, 1.28], color: PURPLE, dashed: true, lineWidth: 1 },
            { type: 'text', x: 7, y: -0.3, text: '时间 →', color: '#9aa7b4', fontSize: 13 },
            { type: 'text', x: -0.3, y: 6, text: '位置', color: '#9aa7b4', fontSize: 13 },
            { type: 'text', x: 4.3, y: 2, text: 't=4.0  位置=1.28', color: PURPLE, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 't', label: '时间 t（让车开起来）', type: 'slider', min: 0, max: 9.5, step: 0.1, value: 4 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 't') return;
          var t = value;
          var pos = 0.08 * t * t;
          scene.layers[2].x = t;
          scene.layers[2].y = pos;
          scene.layers[3].from = [t, 0];
          scene.layers[3].to = [t, pos];
          // 速度 = 导数 = 0.16t，越开越快（曲线越往后越陡）
          var v = 0.16 * t;
          scene.layers[6].text = 't=' + t.toFixed(1) + '  位置=' + pos.toFixed(2) + '  此刻速度≈' + v.toFixed(2);
        },
      },

      // ===== Step 2：函数：描述世界的语言 =====
      {
        title: '函数：描述世界的语言',
        narrative: `在研究变化之前，我们需要一个工具把"变化"记录下来。这个工具叫**函数**。

如果你已经熟悉函数，可以快速跳过这一步。如果不熟，记住这一个比喻就够：

> **函数是一台机器：你丢进去一个数，它吐出来另一个数。**

比如函数 $f(x) = x^2$，就是一台「把数平方」的机器：
丢进去 $2$，吐出来 $4$；丢进去 $3$，吐出来 $9$；丢进去 $-1$，吐出来 $1$。

我们关心的是**变化的量**：上面那个位置记录，其实就是一台机器——
丢进去「时间 $t$」，吐出来「那一刻的位置」。写成符号就是 $位置 = f(时间)$。

函数不限于数字。但微积分里，我们主要研究**把一个数变成另一个数的函数**，尤其是"平滑变化"的那种。
右侧画的就是 $f(x) = x^2$。蓝色曲线是它所有"输入-输出"对的连线。
拖动 $x$ 滑块，看输出 $f(x)$ 怎么跟着变——这就是函数的全部秘密。`,

        scene: {
          axes: { xRange: [-3, 3], yRange: [-1, 6] },
          layers: [
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2.5 },
            // 当前 x 处的点，由 onControl 控制
            { type: 'point', x: 1.5, y: 2.25, color: ORANGE, radius: 6, label: 'f(x)' },
            // 投影线（从 x 轴到曲线点）
            { type: 'line', from: [1.5, 0], to: [1.5, 2.25], color: ORANGE, dashed: true, lineWidth: 1.5 },
            { type: 'line', from: [0, 2.25], to: [1.5, 2.25], color: ORANGE, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 1.8, y: 0.4, text: 'x', color: ORANGE, fontSize: 14 },
          ],
        },
        controls: [
          { name: 'x', label: '输入 x', type: 'slider', min: -2.5, max: 2.5, step: 0.1, value: 1.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var y = value * value; // f(x) = x^2
          scene.layers[1].x = value;
          scene.layers[1].y = y;
          scene.layers[2].from = [value, 0];
          scene.layers[2].to = [value, y];
          scene.layers[3].from = [0, y];
          scene.layers[3].to = [value, y];
          scene.layers[4].x = value + 0.3;
          scene.layers[4].y = 0.4;
        },
      },

      // ===== Step 3：坐标系与图形 =====
      {
        title: '坐标系与图形',
        narrative: `上一张图里那条蓝色的线，就是函数的**图形**。我们正式认识一下它。

**坐标系**就是两条垂直的数轴：水平的叫 $x$ 轴，竖直的叫 $y$ 轴，交点是原点 $(0,0)$。
平面上任何一个点，都能用一对数 $(x, y)$ 表示——$x$ 是左右位置，$y$ 是上下位置。

函数 $f(x) = \\sin(x)$ 的图形，就是把每个 $x$ 对应的 $f(x)$ 当 $y$，描点连线。
你看到的蓝色波浪就是 $\\sin(x)$——它会在 $1$ 和 $-1$ 之间来回摆动，
像钟摆、像潮汐、像交流电。**图形的形状，直接揭示了函数的行为。**

- 曲线在往上走 → 函数值在变大
- 曲线在往下走 → 函数值在变小
- 曲线最陡的地方 → 变化最快的地方

拖动 $a$ 滑块，移动那个橙色观察点。注意它在波峰（最高点）附近时，曲线几乎水平——
这意味着那里的变化**接近停止**。这种"看图说话"的能力，是微积分最重要的直觉。
后面你会学到如何用数字精确描述"有多陡"。`,

        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-2, 2] },
          layers: [
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5 },
            // 观察点
            { type: 'point', x: 1.57, y: 1, color: ORANGE, radius: 6, label: '观察点' },
            // 一条短切线示意（用 tangent 原语，数值求导）
            { type: 'tangent', fn: 'sin(x)', at: 1.57, color: ORANGE, dashed: true, lineWidth: 1.5, halfLen: 1.2 },
          ],
        },
        controls: [
          { name: 'a', label: '观察点 a', type: 'slider', min: -6, max: 6, step: 0.1, value: 1.57 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'a') return;
          scene.layers[1].x = value;
          scene.layers[1].y = Math.sin(value);
          scene.layers[2].at = value;
        },
      },

      // ===== Step 4：瞬时变化之谜 =====
      {
        title: '瞬时变化之谜',
        narrative: `现在遇到微积分的**真正起点**——一个看起来简单、其实深刻的问题。

> 你坐在车里，仪表盘显示「时速 60 公里」。请问：**在这个瞬间**，你真的在以 60 公里/小时移动吗？

仔细想：速度 = 路程 ÷ 时间。但「一个瞬间」是没有时间长度的（时间是 0），
路程也是 0。$0 \\div 0$ 是多少？数学上它**没有定义**。

可你的仪表盘确实给出了一个数。这意味着什么？

关键洞察来了：**我们用"很短一段时间内的平均速度"，去逼近"这一瞬间的速度"。**

看右侧的图。蓝色曲线是位置随时间的变化。橙色割线连接「现在」和「稍后」两个位置，
它的斜率就是这段时间内的**平均速度**。

拖动 $h$ 滑块，让"稍后"越来越接近"现在"（$h \\to 0$）。你会看到橙色割线**逐渐变成切线**——
那条切线的斜率，就是「这一瞬间的速度」。

> 把时间段缩到无穷短，平均速度就变成了**瞬时速度**。

这个"无限逼近"的操作，叫**极限**。它就是整个微积分的地基。
下一套课案「极限与连续」会正式把它讲清楚。`,

        scene: {
          axes: { xRange: [-0.5, 5], yRange: [-1, 8] },
          layers: [
            // 位置曲线（用 x^2 模拟加速运动）
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2.5, range: [0, 4.5] },
            // 当前点（t0=2, 位置=4）
            { type: 'point', x: 2, y: 4, color: ORANGE, radius: 5, label: '现在' },
            // 割线：从 (2,4) 到 (2+h, (2+h)^2)，onControl 动态
            { type: 'line', from: [2, 4], to: [3, 9], color: ORANGE, lineWidth: 2 },
            // 割线终点
            { type: 'point', x: 3, y: 9, color: GREEN, radius: 4, label: '稍后' },
          ],
        },
        controls: [
          { name: 'h', label: '时间间隔 h', type: 'slider', min: 0.05, max: 2, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'h') return;
          var t0 = 2, p0 = 4; // 现在：t=2, 位置=4
          var t1 = t0 + value, p1 = t1 * t1;
          scene.layers[2].to = [t1, p1];
          scene.layers[3].x = t1;
          scene.layers[3].y = p1;
        },
      },

      // ===== Step 5：通往微积分 =====
      {
        title: '通往微积分',
        narrative: `恭喜——你已经摸到了微积分的门。回顾一下我们走过的路：

1. 世界在**变化**，我们需要数学语言描述它
2. **函数**把"输入→输出"的关系固定下来
3. 函数的**图形**让我们能"看见"变化
4. **极限**让我们能描述"某一瞬间的变化"

接下来就是微积分的两根支柱：

- **微分（导数）**：精确计算"这一刻变化多快"。
  就是上一张图里那条切线的斜率。学完它，你就能算瞬时速度、最大值最小值、函数的增减。
  → 进入课案 **「导数与微分」**

- **积分**：反过来——知道每一刻的变化，求"总共积累了多少"。
  算曲线下方的面积、算总路程、算总水量。
  → 进入课案 **「积分与黎曼和」**

中间还会用 **「极限与连续」** 打牢地基，用 **「泰勒级数」** 看如何用多项式逼近任何函数。

> 不用一次学完。每个课案都是独立的，挑你最感兴趣的那个开始。
> 记住：微积分的本质不是背公式，而是**学会用变化的眼光看世界**。

右侧画了一个小小的"地图"——四条曲线交汇，象征微积分的几个主题彼此相连。
准备好了，就从「极限与连续」出发吧。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-2.5, 2.5] },
          layers: [
            // 四条曲线象征四大主题
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2, range: [-3, 3] },       // 极限/振荡
            { type: 'plot', fn: 'x^2/4', color: ORANGE, lineWidth: 2, range: [-2.8, 2.8] },  // 导数/抛物线
            { type: 'plot', fn: 'cos(x)', color: PURPLE, lineWidth: 2, range: [-3, 3] },      // 积分/波浪
            { type: 'parametric', fx: '2*cos(t)', fy: '1.5*sin(t)', tRange: [0, 6.2832], color: GREEN, lineWidth: 2 }, // 泰勒/闭合
            { type: 'text', x: 0, y: -2.2, text: '极限 · 导数 · 积分 · 级数', color: '#9aa7b4', fontSize: 13 },
          ],
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
