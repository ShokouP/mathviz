/**
 * mathviz — js/data/courses/function-properties.js
 * 课案：函数的几类特性（北大高数 §1.2，函数的有界/单调/奇偶/周期）。
 *
 * 四步：
 *   1. 有界性    存在 M 使 |f(x)| ≤ M；分有界/无界、上下界
 *   2. 单调性    增/减区间；用定义 x1<x2 ⇒ f(x1)<f(x2)
 *   3. 奇偶性    关于原点/ y 轴对称：f(-x)=∓f(x)
 *   4. 周期性    存在 T>0 使 f(x+T)=f(x)；最小正周期
 *
 * 设计要点（与引擎契约对齐）：
 *   - onControl 直接 mutate scene.layers[i]，不用 bind。
 *   - 表达式幂运算用 ^（math-eval 支持），变量为 x，常量 pi/e。
 *   - 颜色调色板：蓝 #4f9cf9、橙 #ff8c42、紫 #9d7aff、绿 #4ade80。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主函数
  var ORANGE = '#ff8c42'; // 标记 / 关注点
  var PURPLE = '#9d7aff'; // 辅助曲线 / 界
  var GREEN = '#4ade80';  // 结论 / 对称像

  var course = {
    id: 'function-properties',
    title: '函数的几类特性',
    summary: '有界、单调、奇偶、周期——四把尺子，刻画函数的整体面貌。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M10 75 Q40 20 70 75 Q100 130 130 75 Q160 20 190 75" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><line x1="10" y1="75" x2="190" y2="75" stroke="#3a4452" stroke-width="1"/><line x1="100" y1="15" x2="100" y2="100" stroke="#9d7aff" stroke-width="1.2" stroke-dasharray="4 3"/><circle cx="100" cy="75" r="3.5" fill="#4ade80"/><text x="100" y="14" fill="#e6edf3" font-size="11" text-anchor="middle" font-family="sans-serif">奇 · 偶 · 周期</text></svg>',

    steps: [
      // ===== Step 1：有界性 =====
      {
        title: '有界性：被关进笼子的函数',
        narrative: `第一条特性看的是函数值能不能"跑出去"。

设 $f$ 在集合 $D$ 上有定义。如果**存在一个常数 $M$**，使得对一切 $x \\in D$ 都有
$$|f(x)| \\leq M,$$
就称 $f$ 在 $D$ 上**有界**；否则称为**无界**。

拆开看，"有界"等价于"既有上界又有下界"：
- **有上界**：存在 $K_1$，使 $f(x) \\leq K_1$；
- **有下界**：存在 $K_2$，使 $f(x) \\geq K_2$。

**反例最直观**：$f(x) = 1/x$ 在 $(0, 1]$ 上没有上界——$x$ 越接近 0，函数值冲向 $+\\infty$，没有任何常数能把它压住，所以无界。

右侧演示 $f(x) = \\sin x$（蓝色）在 $[-6, 6]$ 上的样子。它永远被夹在 $y = 1$ 和 $y = -1$ 之间（紫色两条界），所以**有界**，而且 $M=1$ 就是一个最小的界。

拖动 $M$ 滑块：把界放高一点当然成立（$M=3$ 也对），但只有 $M \\geq 1$ 才"恰好够用"。**界不一定唯一，但最小界揭示函数的"幅度"**。`,

        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-2.5, 2.5] },
          layers: [
            // 上界 y = M
            { type: 'line', from: [-6.5, 1], to: [6.5, 1], color: PURPLE, dashed: true, lineWidth: 1.5 },
            // 下界 y = -M
            { type: 'line', from: [-6.5, -1], to: [6.5, -1], color: PURPLE, dashed: true, lineWidth: 1.5 },
            // sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-6.3, 6.3], samples: 200 },
            // 触碰上界的点
            { type: 'point', x: 1.5708, y: 1, color: ORANGE, radius: 4, label: '触上界' },
            { type: 'point', x: -1.5708, y: -1, color: ORANGE, radius: 4, label: '触下界' },
            // 标注
            { type: 'text', x: -6.1, y: 1.35, text: '上界 y=M', color: PURPLE, fontSize: 12, align: 'left' },
            { type: 'text', x: -6.1, y: -1.5, text: '下界 y=−M', color: PURPLE, fontSize: 12, align: 'left' },
            { type: 'text', x: -6.1, y: 2.1, text: '蓝:f=sin x（有界，M=1 即够）', color: BLUE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'M', label: '界 M', type: 'slider', min: 0.6, max: 2.2, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'M') return;
          var M = value;
          // 上界线
          scene.layers[0].from = [-6.5, M];
          scene.layers[0].to = [6.5, M];
          // 下界线
          scene.layers[1].from = [-6.5, -M];
          scene.layers[1].to = [6.5, -M];
          // 触碰点的显隐与说明：M<1 时 sin 超出界，红色提示
          var tight = M < 1;
          scene.layers[3].label = tight ? '超出！' : '触上界';
          scene.layers[3].color = tight ? '#ff5c5c' : ORANGE;
          scene.layers[4].label = tight ? '超出！' : '触下界';
          scene.layers[4].color = tight ? '#ff5c5c' : ORANGE;
          // 文字结论
          scene.layers[7].text = tight
            ? 'M<1 不够：sin x 会冲出界 → 此 M 非界'
            : '蓝:f=sin x（有界，M=' + M.toFixed(2) + ' 够用）';
          scene.layers[7].color = tight ? '#ff5c5c' : BLUE;
        },
      },

      // ===== Step 2：单调性 =====
      {
        title: '单调性：一路向上还是向下',
        narrative: `第二条特性描述函数"朝哪个方向走"。

设 $f$ 在区间 $I$ 上有定义。
- 若对任意 $x_1 < x_2$ 都有 $f(x_1) < f(x_2)$，称 $f$ 在 $I$ 上**单调递增**；
- 若对任意 $x_1 < x_2$ 都有 $f(x_1) > f(x_2)$，称 $f$ 在 $I$ 上**单调递减**。

（把 $<$ 换成 $\\leq$ 就是"不减/不增"的弱版本。）

**直觉**：递增就是"越往右走越高"。后面学导数你会发现，可导函数**$f' > 0 \\Rightarrow$ 单调增，$f' < 0 \\Rightarrow$ 单调减**——这是单调性的微分判据，本步先用定义看几何。

**例子**：$f(x) = x^2$。
- 在 $[0, +\\infty)$ 上**单调递增**（往右越走越高）；
- 在 $(-\\infty, 0]$ 上**单调递减**（往右越走越低）；
- 在 $x = 0$ 处取得最小值——这正是单调性"换方向"的地方。

右侧蓝色是 $f(x) = x^2$，橙色是连接任意两点 $x_1 < x_2$ 的割线。拖动 $x_2$ 滑块：
- 当 $x_1, x_2$ **同在右侧**（都 $\\geq 0$），割线向上 → 单调增；
- 当 $x_1, x_2$ **同在左侧**（都 $\\leq 0$），割线向下 → 单调减；
- 当 $x_1, x_2$ **跨过原点**，函数先减后增，整体不单调。

看斜率符号就能判断这段区间上是否单调。`,

        scene: {
          axes: { xRange: [-3, 3], yRange: [-0.5, 5] },
          layers: [
            // f = x^2
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2.5, range: [-2.5, 2.5], samples: 120 },
            // 对称轴 x=0
            { type: 'line', from: [0, -0.5], to: [0, 5], color: '#3a4452', lineWidth: 1 },
            // 两观察点（割线）
            { type: 'line', from: [-1, 1], to: [1.5, 2.25], color: ORANGE, lineWidth: 2 },
            // x1 点
            { type: 'point', x: -1, y: 1, color: ORANGE, radius: 5, label: 'x₁' },
            // x2 点
            { type: 'point', x: 1.5, y: 2.25, color: ORANGE, radius: 5, label: 'x₂' },
            // 顶点
            { type: 'point', x: 0, y: 0, color: GREEN, radius: 5, label: '最小值' },
            // 文字结论
            { type: 'text', x: -2.8, y: 4.5, text: '蓝:f=x²  橙:割线（连 x₁ 与 x₂）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.8, y: 3.9, text: '跨原点 → 不单调', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x2', label: '右观察点 x₂', type: 'slider', min: -2.4, max: 2.4, step: 0.1, value: 1.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x2') return;
          var x1 = -1;
          var x2 = value;
          var y1 = x1 * x1;
          var y2 = x2 * x2;
          // 割线
          scene.layers[2].from = [x1, y1];
          scene.layers[2].to = [x2, y2];
          // x2 点
          scene.layers[4].x = x2;
          scene.layers[4].y = y2;
          // 结论
          var slope = (y2 - y1) / (x2 - x1);
          var txt, col;
          if (x1 < 0 && x2 > 0) {
            txt = 'x₁<0<x₂：跨原点 → 整体不单调';
            col = '#ff5c5c';
          } else if (x1 >= 0 && x2 >= 0) {
            txt = '同在 [0,+∞)：割线斜向上 → 单调增';
            col = GREEN;
          } else {
            txt = '同在 (−∞,0]：割线斜向下 → 单调减';
            col = GREEN;
          }
          scene.layers[7].text = txt;
          scene.layers[7].color = col;
          // 避免 slope 未定义的提示干扰，把 slope 信息塞进 x₂ 标签
          scene.layers[4].label = 'x₂ (斜率' + (isFinite(slope) ? slope.toFixed(2) : '∞') + ')';
        },
      },

      // ===== Step 3：奇偶性 =====
      {
        title: '奇偶性：关于原点和 y 轴的对称',
        narrative: `第三条特性看函数图像的**对称性**，分两类：

- **偶函数**：$f(-x) = f(x)$。图像关于 **$y$ 轴对称**，像蝴蝶的左右翅膀。
- **奇函数**：$f(-x) = -f(x)$。图像关于 **原点对称**，转 $180°$ 后和自己重合。

**经典例子**：
- $x^2, \\, \\cos x, \\, |x|$ 是**偶**函数；
- $x^3, \\, \\sin x, \\, x$ 是**奇**函数；
- $\\sin x + x^2$ 既不奇也不偶（两者混合，一般无对称性）。

**两个好用的事实**：
1. 奇函数若在 $x=0$ 有定义，则 $f(0) = 0$（因为 $f(0) = -f(0)$）。
2. 定义域必须关于原点对称，才有资格谈奇偶；否则免谈。

**对称性的威力**：研究偶函数只需看 $x \\geq 0$ 这一半，左半边免费送；计算奇函数在对称区间 $[-a,a]$ 上的积分直接得 0。

右侧让你切换函数观察对称性。蓝色是原函数 $f(x)$，绿色是 $f(-x)$（关于 $y$ 轴的镜像）。
- 若**绿线与蓝线重合** → 偶函数；
- 若**绿线等于蓝线绕原点转 180°** → 奇函数。

拖动右下角的选择滑块（取整数 $0,1,2,3$）换 $\\sin x$（奇）、$\\cos x$（偶）、$x^3$（奇）、$\\sin x + x^2$（非奇非偶）四类观察。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-2, 2] },
          layers: [
            // y 轴（对称轴参考）
            { type: 'line', from: [0, -2], to: [0, 2], color: '#3a4452', lineWidth: 1 },
            // 原 f(x) = sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-3.3, 3.3], samples: 160 },
            // 镜像 f(-x) = sin(-x)
            { type: 'plot', fn: 'sin(-x)', color: GREEN, lineWidth: 2.5, range: [-3.3, 3.3], samples: 160 },
            // 原点提示
            { type: 'point', x: 0, y: 0, color: ORANGE, radius: 4, label: '原点' },
            // 文字图例
            { type: 'text', x: -3.2, y: 1.7, text: '蓝:f(x)   绿:f(−x)（镜像）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            // 文字结论
            { type: 'text', x: -3.2, y: 1.3, text: '当前：sin x —— f(−x)=−f(x)，奇函数', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        // 注：控件渲染器仅支持 'slider'（见 pages/course.js _renderControls），
        // 故用整数滑块 0/1/2/3 在四类函数间切换，避免 select 被忽略。
        controls: [
          { name: 'pick', label: '函数（0:sin  1:cos  2:x³  3:sin+x²）', type: 'slider', min: 0, max: 3, step: 1, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'pick') return;
          var i = Math.round(value);
          var table = [
            { f: 'sin(x)',         m: 'sin(-x)',          label: 'sin x',         sym: 'f(−x)=−f(x)', parity: '奇' },
            { f: 'cos(x)',         m: 'cos(-x)',          label: 'cos x',         sym: 'f(−x)= f(x)', parity: '偶' },
            { f: 'x^3',            m: '(-x)^3',           label: 'x³',            sym: 'f(−x)=−f(x)', parity: '奇' },
            { f: 'sin(x)+x^2',     m: 'sin(-x)+(-x)^2',   label: 'sin x + x²',    sym: 'f(−x)≠±f(x)', parity: '非奇非偶' },
          ];
          var d = table[i] || table[0];
          // 更新两条曲线（清除编译缓存以触发重编译）
          scene.layers[1].fn = d.f;   delete scene.layers[1]._fn;
          scene.layers[2].fn = d.m;   delete scene.layers[2]._fn;
          // 结论文字
          scene.layers[5].text = '当前：' + d.label + ' —— ' + d.sym + '，' + d.parity + '函数';
          scene.layers[5].color = (i === 3) ? '#ff5c5c' : GREEN;
        },
      },

      // ===== Step 4：周期性 =====
      {
        title: '周期性：周而复始的节律',
        narrative: `第四条特性刻画函数是否"自我重复"。

若存在常数 $T > 0$，使对定义域内一切 $x$ 都有
$$f(x + T) = f(x),$$
就称 $f$ 是**周期函数**，$T$ 是它的一个**周期**。所有周期中最小的正数（若存在）叫**最小正周期**（也叫基本周期）。

**最重要的例子**：三角函数。
- $\\sin x, \\, \\cos x$ 的最小正周期是 $T = 2\\pi$；
- $\\tan x, \\, \\cot x$ 的周期是 $T = \\pi$（更短，因为它们在 $\\pi$ 的间隔上就重复一次）。
- 常数函数 $f(x) = c$ 是"病态"的周期函数——任何正数都是周期，所以**没有最小正周期**。

**工程意义**：周期函数描述一切"循环"现象——心电、声波、潮汐、四季。后面傅里叶分析会告诉你，**任何周期函数都能拆成正余弦的和**，这是信号处理的基石。

右侧蓝色是 $f(x) = \\sin(\\omega x)$。拖动 $\\omega$ 滑块：
- $\\omega$ 越大，波**越密**，周期 $T = 2\\pi/\\omega$ 越小；
- $\\omega$ 越小，波**越疏**，周期越大。

绿色虚线标出一个完整周期 $[0, T]$——它把"重复一次"的形状框出来。橙色箭头提示"复制粘贴"的方向：把这一段平移 $T$，就和下一段严丝合缝。`,

        scene: {
          axes: { xRange: [-7, 7], yRange: [-1.6, 1.6] },
          layers: [
            // 一个周期的区间左右界（虚线）
            { type: 'line', from: [0, -1.6], to: [0, 1.6], color: GREEN, dashed: true, lineWidth: 1.2 },
            { type: 'line', from: [6.2832, -1.6], to: [6.2832, 1.6], color: GREEN, dashed: true, lineWidth: 1.2 },
            // sin(ωx)，默认 ω=1
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-6.9, 6.9], samples: 300 },
            // 起点 (0,0) 与周期末端标记
            { type: 'point', x: 0, y: 0, color: ORANGE, radius: 4, label: 'x=0' },
            { type: 'point', x: 6.2832, y: 0, color: ORANGE, radius: 4, label: 'x=T' },
            // 文字
            { type: 'text', x: -6.7, y: 1.3, text: '蓝:sin(ωx)   绿线:一个周期 [0,T]', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -6.7, y: 0.85, text: 'ω=1.00  →  周期 T=2π/ω≈6.28', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'omega', label: '角频率 ω', type: 'slider', min: 0.3, max: 3, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'omega') return;
          var w = value;
          // 保护 w→0 时 T 发散：w 极小时用大周期占位（数学上 ω=0 退化为常数）
          var T = Math.abs(w) < 1e-4 ? 9999 : (2 * Math.PI) / w;
          // 更新曲线表达式（清缓存）
          scene.layers[2].fn = 'sin(' + w + '*x)';
          delete scene.layers[2]._fn;
          // 右界竖线（T 超出视野时不画在画布内,但坐标仍需有限数）
          var Tvis = Math.max(-20, Math.min(20, T));
          scene.layers[1].from = [Tvis, -1.6];
          scene.layers[1].to = [Tvis, 1.6];
          // 周期末端点（取 sin(T)=sin(2π)=0）
          scene.layers[4].x = Tvis;
          scene.layers[4].y = 0;
          scene.layers[4].label = 'x=T';
          // 结论文字
          scene.layers[6].text = 'ω=' + w.toFixed(2) + '  →  周期 T=2π/ω≈' + (isFinite(T) ? T.toFixed(2) : '∞');
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
