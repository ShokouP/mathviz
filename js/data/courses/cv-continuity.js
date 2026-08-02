/**
 * mathviz — js/data/courses/cv-continuity.js
 * 课案：闭区间上连续函数的性质（北大高数 §2.7，连续函数的整体性态）。
 *
 * 四步：
 *   1. 最大值最小值定理   闭区间上连续函数必取到最大值与最小值
 *   2. 有界性定理        闭区间上连续函数必有界
 *   3. 介值定理（零点存在）连续函数取遍两端点值之间的一切值；推论：零点定理
 *   4. 一致连续性        闭区间上连续 ⇒ 一致连续（Cantor 定理）
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^，变量 x。
 * 颜色调色板：蓝 #4f9cf9、橙 #ff8c42、紫 #9d7aff、绿 #4ade80。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主函数曲线
  var ORANGE = '#ff8c42'; // 端点 / 关键点
  var PURPLE = '#9d7aff'; // 辅助界 / 第二对象
  var GREEN = '#4ade80';  // 结论 / 最值点 / 界

  // Step 4（一致连续）跨滑块调用的状态：两个滑块都更新它，任一变化都重绘。
  // 文件为 IIFE 单例，此状态唯一，无并发问题。
  var step4State = { eps: 0.3, x0: 1.0 };

  /** 把 (eps, x0) 同步写入 Step 4 的 layers。 */
  function applyUniformContinuity(eps, x0, layers) {
    // layers[3] 上沿 y=+ε，layers[4] 下沿 y=-ε
    layers[3].from = [-0.3, eps];
    layers[3].to = [4.5, eps];
    layers[4].from = [-0.3, -eps];
    layers[4].to = [4.5, -eps];
    // layers[5]：x0 处水平基准线 y = √x0
    var y0 = Math.sqrt(x0);
    layers[5].from = [-0.3, y0];
    layers[5].to = [4.5, y0];
    // 统一 δ：对 f(x)=√x 在 [0,4] 上，取 δ = ε²（经验值，全区间一致成立）。
    // 难点在 x=0 处（最陡），δ=ε² 恰好保证 |√x - √0|<ε。
    var delta = eps * eps;
    var left = Math.max(0, x0 - delta);
    var right = Math.min(4, x0 + delta);
    // layers[6] 左沿，layers[7] 右沿（紫色竖带）
    layers[6].from = [left, -0.5];
    layers[6].to = [left, 2.5];
    layers[7].from = [right, -0.5];
    layers[7].to = [right, 2.5];
    // layers[8]：观察中心点
    layers[8].x = x0;
    layers[8].y = y0;
    layers[8].label = 'x₀=' + x0.toFixed(2);
    // layers[9] / layers[10]：文字
    layers[9].text = 'ε=' + eps.toFixed(2) + ' → 统一 δ=' + delta.toFixed(3) + '（全区间通用）';
    layers[10].text = '把 x₀ 挪到任意位置，同一 (ε,δ) 都管用 ⇒ 一致连续';
  }

  var course = {
    id: 'cv-continuity',
    title: '闭区间上连续函数的性质',
    summary: '最值、有界、介值、一致连续——"闭区间 + 连续"四把整体性金钥匙。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><line x1="22" y1="22" x2="22" y2="92" stroke="#3a4452" stroke-width="1.2"/><line x1="22" y1="92" x2="182" y2="92" stroke="#3a4452" stroke-width="1.2"/><path d="M22 78 Q60 18 100 58 Q140 100 178 32" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><line x1="22" y1="14" x2="178" y2="14" stroke="#ff8c42" stroke-width="1.2" stroke-dasharray="4 3"/><line x1="22" y1="100" x2="178" y2="100" stroke="#9d7aff" stroke-width="1.2" stroke-dasharray="4 3"/><circle cx="100" cy="18" r="4" fill="#4ade80"/><circle cx="178" cy="32" r="4" fill="#4ade80"/><text x="100" y="10" fill="#e6edf3" font-size="10" text-anchor="middle" font-family="sans-serif">闭区间 · 必有最值</text></svg>',

    steps: [
      // ===== Step 1：最大值最小值定理 =====
      {
        title: '最大值最小值定理',
        narrative: `连续函数在**开区间**上可以"跑没影"——比如 $f(x)=1/x$ 在 $(0,1)$ 上无界。但只要把区间**封口**为闭区间，事情就完全变了。

> **最大值最小值定理**：若 $f$ 在**闭区间 $[a,b]$** 上连续，则 $f$ 在 $[a,b]$ 上**必能取到**最大值 $M$ 与最小值 $m$。
> 也就是说，存在 $x_1, x_2 \\in [a,b]$，使
> $$f(x_1) = M = \\max_{[a,b]} f, \\quad f(x_2) = m = \\min_{[a,b]} f.$$

直觉：闭区间是"紧"的（没有缝可钻），连续函数"画一笔"必须经过它起伏的每一个顶点和谷底，不可能无限逼近却够不着。

**两个条件缺一不可**：
- **闭区间**：开区间 $(0,1)$ 上的 $f(x)=x$ 没有最大值（总差一点到不了 1）。
- **连续**：在 $x=1$ 处有跳跃间断的函数，最大值会"够不着"。

右侧蓝色是 $f(x) = x^3 - 3x$ 在 $[-2, 2]$ 上。绿色点标出最大值（$x=-1$ 处 $f=2$）与最小值（$x=1$ 处 $f=-2$）。
拖动观察点 $c$——无论 $c$ 落在哪，$f(c)$ 都被夹在绿色上下界 $[-2, 2]$ 之间，永远**跑不出**最值划定的笼子。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-3.5, 3.5] },
          layers: [
            // f = x^3 - 3x 在 [-2,2]
            { type: 'plot', fn: 'x^3 - 3*x', color: BLUE, lineWidth: 2.5, range: [-2, 2], samples: 100 },
            // 上界线 y = 2（最大值）
            { type: 'line', from: [-2.5, 2], to: [2.5, 2], color: GREEN, lineWidth: 1.2, dashed: true },
            // 下界线 y = -2（最小值）
            { type: 'line', from: [-2.5, -2], to: [2.5, -2], color: GREEN, lineWidth: 1.2, dashed: true },
            // 区间端点
            { type: 'point', x: -2, y: -2, color: ORANGE, radius: 4, label: 'a' },
            { type: 'point', x: 2, y: 2, color: ORANGE, radius: 4, label: 'b' },
            // 最大值点 x=-1, 最小值点 x=1
            { type: 'point', x: -1, y: 2, color: GREEN, radius: 6, label: 'max=2' },
            { type: 'point', x: 1, y: -2, color: GREEN, radius: 6, label: 'min=-2' },
            // 观察点 c（初始 0）
            { type: 'point', x: 0, y: 0, color: PURPLE, radius: 5, label: 'c=0.0' },
            // 区间端点竖直辅助线
            { type: 'line', from: [-2, -3.5], to: [-2, 3.5], color: '#3a4452', lineWidth: 1 },
            { type: 'line', from: [2, -3.5], to: [2, 3.5], color: '#3a4452', lineWidth: 1 },
            { type: 'text', x: -2.3, y: 3.2, text: '闭区间[a,b]上连续 ⇒ 必有最值', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'c', label: '观察点 c', type: 'slider', min: -2, max: 2, step: 0.05, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'c') return;
          var layers = scene.layers;
          // layers[6] = 观察点 c
          layers[6].x = value;
          layers[6].y = value * value * value - 3 * value;
          layers[6].label = 'c=' + value.toFixed(2);
          // 是否被夹在 [-2,2] 内
          var inside = layers[6].y >= -2 && layers[6].y <= 2;
          layers[9].text = inside
            ? 'f(c)=' + layers[6].y.toFixed(2) + ' ∈ [-2, 2]（夹在最值之间）'
            : '（异常：跑出最值笼子）';
          layers[9].color = inside ? GREEN : '#ff6b6b';
        },
      },

      // ===== Step 2：有界性定理 =====
      {
        title: '有界性定理',
        narrative: `最大值最小值定理的一个直接推论——但因为它足够重要，单独列为一条。

> **有界性定理**：若 $f$ 在闭区间 $[a,b]$ 上连续，则 $f$ 在 $[a,b]$ 上**有界**。
> 即存在常数 $M > 0$，使对一切 $x \\in [a,b]$ 都有 $|f(x)| \\le M$。

证明几乎是一句话：由最值定理，$f$ 取到最大值 $M_1$ 与最小值 $m_1$，取 $M = \\max\\{|M_1|, |m_1|\\}$ 即可。

**反例：为什么"闭"和"连续"都不能少。**
- 开区间：$f(x) = \\tan(x)$ 在 $(-\\pi/2, \\pi/2)$ 上连续却无界——靠近端点时冲向无穷。
- 不连续：$f(x) = 1/x$ 在 $[-1,1]\\setminus\\{0\\}$ 上无定义；即便补成 $f(0)=0$ 也在 $0$ 处不连续，仍然无界。

右侧蓝色是 $f(x) = \\sin(x) + 0.5\\cos(2x)$ 在 $[0, 2\\pi]$ 上。紫色虚线标出**界** $\\pm M$。
拖动 $M$ 滑块（$M$ 从 1.0 到 3.0）：当 $M$ 足够大（盖住绿色最值点）时，整条蓝线被关进紫色笼子——函数有界；
当 $M$ 太小时，蓝线会"穿出"紫色笼子，说明这个 $M$ 不够当界。**关键不在 M 取多少，而在于总存在一个够用的 M。**`,

        scene: {
          axes: { xRange: [-0.5, 6.5], yRange: [-3.5, 3.5] },
          layers: [
            // 区间端点竖线
            { type: 'line', from: [0, -3.5], to: [0, 3.5], color: '#3a4452', lineWidth: 1 },
            { type: 'line', from: [6.2832, -3.5], to: [6.2832, 3.5], color: '#3a4452', lineWidth: 1 },
            // f = sin(x) + 0.5cos(2x) 在 [0, 2π]
            { type: 'plot', fn: 'sin(x) + 0.5*cos(2*x)', color: BLUE, lineWidth: 2.5, range: [0, 6.2832], samples: 120 },
            // 界 M 与 -M（初始 M=1.5）
            { type: 'line', from: [-0.5, 1.5], to: [6.5, 1.5], color: PURPLE, lineWidth: 1.2, dashed: true },
            { type: 'line', from: [-0.5, -1.5], to: [6.5, -1.5], color: PURPLE, lineWidth: 1.2, dashed: true },
            // 端点
            { type: 'point', x: 0, y: 0.5, color: ORANGE, radius: 4, label: 'a' },
            { type: 'point', x: 6.2832, y: 0.5, color: ORANGE, radius: 4, label: 'b' },
            // 最大值点：sin(x)+0.5cos(2x) 在 x≈1.209 取 ≈1.366（数值）；最小值点 x≈4.351 取 ≈-1.366
            { type: 'point', x: 1.209, y: 1.366, color: GREEN, radius: 5, label: 'max≈1.37' },
            { type: 'point', x: 4.351, y: -1.366, color: GREEN, radius: 5, label: 'min≈-1.37' },
            // 文字
            { type: 'text', x: 2.6, y: 3.1, text: 'M=1.50：紫色笼子', color: PURPLE, fontSize: 11, align: 'left' },
            { type: 'text', x: 2.6, y: 2.6, text: '增大 M 直到盖住蓝线 ⇒ 有界', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'M', label: '界 M', type: 'slider', min: 1.0, max: 3.0, step: 0.05, value: 1.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'M') return;
          var layers = scene.layers;
          // layers[3] = 上界, layers[4] = 下界
          layers[3].from = [-0.5, value];
          layers[3].to = [6.5, value];
          layers[4].from = [-0.5, -value];
          layers[4].to = [6.5, -value];
          // 最值绝对值 ≈1.366；M 够用即盖住
          var bounded = value >= 1.366;
          layers[8].text = 'M=' + value.toFixed(2) + '：' + (bounded ? '✓ 盖住蓝线（有界）' : '✗ 蓝线穿出（M 太小）');
          layers[8].color = bounded ? GREEN : '#ff6b6b';
          layers[9].text = bounded
            ? '存在够用的 M ⇒ f 在 [a,b] 有界'
            : '这个 M 不够；但总存在够用的 M';
        },
      },

      // ===== Step 3：介值定理（零点存在）=====
      {
        title: '介值定理：连续则不跳',
        narrative: `连续函数的"连续"，本质是**不跳跃**。从这一点能推出一个极实用的结论。

> **介值定理**：若 $f$ 在闭区间 $[a,b]$ 上连续，且 $f(a) \\neq f(b)$，则对 $f(a)$ 与 $f(b)$ 之间的任一值 $\\mu$，
> 至少存在一点 $c \\in (a,b)$ 使 $f(c) = \\mu$。

等价说法：连续函数把区间 $[a,b]$ **整体地**映成 $[m, M]$，中间不会"漏掉"任何值。

**最重要的推论——零点定理（Bolzano）**：若 $f(a)$ 与 $f(b)$ **异号**，则 $(a,b)$ 内至少有一个零点。
这正是"二分法求根"的理论根基：只要盯住变号区间，反复对折，根就无处可藏。

**反例：不连续就不成立。** 阶跃函数 $f(x) = \\mathrm{sign}(x)$ 在 $[-1,1]$ 上从 $-1$ 跳到 $1$，**跳过了 0**——
没有 $c$ 使 $f(c) = 0$，因为它在原点不连续。

右侧蓝色是 $f(x) = x^3 - x - 1$ 在 $[1, 2]$ 上：$f(1) = -1 < 0$，$f(2) = 5 > 0$，**异号 ⇒ 必有零点**。
橙色是水平线 $y=\\mu$。拖动 $\\mu$ 滑块（在 $f(1)$ 与 $f(2)$ 之间）：紫色交点指出对应的 $c$。
特别地 $\\mu=0$ 时紫色点就是方程 $x^3 - x - 1 = 0$ 的实根（约 $1.325$）——连续性"承诺"它一定存在。`,

        scene: {
          axes: { xRange: [0.5, 2.5], yRange: [-2, 6] },
          layers: [
            // x 轴参照
            { type: 'line', from: [0.5, 0], to: [2.5, 0], color: '#3a4452', lineWidth: 1 },
            // f = x^3 - x - 1 在 [1,2]
            { type: 'plot', fn: 'x^3 - x - 1', color: BLUE, lineWidth: 2.5, range: [1, 2], samples: 80 },
            // 水平线 y = μ（初始 μ=0）
            { type: 'line', from: [0.5, 0], to: [2.5, 0], color: ORANGE, lineWidth: 1.5, dashed: true },
            // 端点 a=1, b=2
            { type: 'point', x: 1, y: -1, color: ORANGE, radius: 4, label: 'f(1)=-1' },
            { type: 'point', x: 2, y: 5, color: ORANGE, radius: 4, label: 'f(2)=5' },
            // 交点 c（μ=0 ⇒ c≈1.3247）
            { type: 'point', x: 1.3247, y: 0, color: PURPLE, radius: 6, label: 'c≈1.32' },
            // 文字
            { type: 'text', x: 0.6, y: 5.5, text: 'μ=0.0：异号 ⇒ 必有零点', color: GREEN, fontSize: 11, align: 'left' },
            { type: 'text', x: 0.6, y: 4.8, text: '拖 μ 在 (-1, 5) 间，紫色 c 跟随', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'mu', label: '介值 μ', type: 'slider', min: -1, max: 5, step: 0.05, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'mu') return;
          var layers = scene.layers;
          // layers[2] = 水平线 y=μ
          layers[2].from = [0.5, value];
          layers[2].to = [2.5, value];
          // 求 x^3 - x - 1 = μ 在 [1,2] 的根（牛顿法几次迭代，从 1.5 起）
          var c = 1.5;
          for (var i = 0; i < 40; i++) {
            var fc = c * c * c - c - 1 - value;     // g(c) = f(c) - μ
            var dgc = 3 * c * c - 1;                  // g'(c) = 3c² - 1
            if (Math.abs(dgc) < 1e-9) break;
            c = c - fc / dgc;
            if (c < 1) c = 1.0001;
            if (c > 2) c = 1.9999;
          }
          layers[5].x = c;
          layers[5].y = value;
          layers[5].label = 'c≈' + c.toFixed(2);
          // 提示：异号 ⇒ 零点存在
          var isZero = Math.abs(value) < 0.02;
          layers[6].text = isZero
            ? 'μ=0.0：f(1)<0<f(2) ⇒ 零点存在（二分法）'
            : 'μ=' + value.toFixed(2) + '：连续 ⇒ 必有 c 使 f(c)=μ';
          layers[6].color = isZero ? GREEN : '#9aa7b4';
        },
      },

      // ===== Step 4：一致连续性 =====
      {
        title: '一致连续性',
        narrative: `连续是"点点"性质（每个点处都连续），而**一致连续**是"整体"性质——更强的要求。

> $f$ 在 $D$ 上**一致连续**：对任意 $\\varepsilon > 0$，存在 $\\delta > 0$，
> 使对 $D$ 中**任意** $x_1, x_2$，只要 $|x_1 - x_2| < \\delta$，就有 $|f(x_1) - f(x_2)| < \\varepsilon$。

区别在于：普通连续里 $\\delta$ 同时依赖于 $\\varepsilon$ **和点 $x$**；一致连续里 $\\delta$ **只依赖于 $\\varepsilon$**，对全区间通用——
形象说，"用同一把尺子 $\\delta$ 就能管住整段曲线的抖动"。

**反例：开区间上连续未必一致连续。** $f(x) = 1/x$ 在 $(0, 1)$ 上连续，但靠近 $0$ 时越来越陡，
同一把 $\\delta$ 永远不够用——它**不一致连续**。

> **Cantor 定理（一致连续性定理）**：若 $f$ 在**闭区间 $[a,b]$** 上连续，则 $f$ 在 $[a,b]$ 上**一致连续**。
> 直觉：闭区间是"紧"的（Heine-Borel 有限覆盖），不存在让 $\\delta$ 失效的"漏洞"。

右侧蓝色是 $f(x) = \\sqrt{x}$ 在 $[0, 4]$ 上（$0$ 处最陡，是对 $\\delta$ 要求最苛刻的点）。
拖动 $\\varepsilon$ 滑块，绿色横带是容差 $\\pm\\varepsilon$，紫色竖带宽度即"统一 $\\delta$"。
关键观察：**不管把观察点 $x_0$ 挪到哪段，同一对 $(\\varepsilon, \\delta)$ 始终管用**——这就是一致连续。`,

        scene: {
          axes: { xRange: [-0.3, 4.5], yRange: [-0.5, 2.5] },
          layers: [
            // f = sqrt(x) 在 [0,4]
            { type: 'plot', fn: 'sqrt(x)', color: BLUE, lineWidth: 2.5, range: [0, 4], samples: 100 },
            // 区间端点竖线
            { type: 'line', from: [0, -0.5], to: [0, 2.5], color: '#3a4452', lineWidth: 1 },
            { type: 'line', from: [4, -0.5], to: [4, 2.5], color: '#3a4452', lineWidth: 1 },
            // 容差横带 ±ε（初始 ε=0.3），用两条水平虚线 + 两条观察点水平线
            { type: 'line', from: [-0.3, -0.3], to: [4.5, -0.3], color: GREEN, lineWidth: 1, dashed: true },
            { type: 'line', from: [-0.3, 0.3], to: [4.5, 0.3], color: GREEN, lineWidth: 1, dashed: true },
            // 观察中心点 x0（初始 1.0）处的水平 ±ε 带
            { type: 'line', from: [-0.3, 1.0], to: [4.5, 1.0], color: ORANGE, lineWidth: 1.2, dashed: true },
            // 统一 δ 竖带（紫色），中心 x0=1，半宽 δ=ε²/... 这里取经验值
            { type: 'line', from: [0.6, -0.5], to: [0.6, 2.5], color: PURPLE, lineWidth: 1.2, dashed: true },
            { type: 'line', from: [1.4, -0.5], to: [1.4, 2.5], color: PURPLE, lineWidth: 1.2, dashed: true },
            // 观察中心点
            { type: 'point', x: 1, y: 1, color: ORANGE, radius: 5, label: 'x₀=1.0' },
            // 文字
            { type: 'text', x: 0, y: 2.3, text: 'ε=0.30 → 统一 δ 对全区间通用', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 0, y: 1.8, text: '闭区间连续 ⇒ 一致连续（Cantor）', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'eps', label: '容差 ε', type: 'slider', min: 0.08, max: 0.6, step: 0.02, value: 0.3 },
          { name: 'x0', label: '观察点 x₀', type: 'slider', min: 0.1, max: 3.9, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'eps' && name !== 'x0') return;
          if (name === 'eps') { step4State.eps = value; }
          if (name === 'x0') { step4State.x0 = value; }
          applyUniformContinuity(step4State.eps, step4State.x0, scene.layers);
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
