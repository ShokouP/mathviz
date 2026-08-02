/**
 * mathviz — js/data/courses/indefinite-integral.js
 * 课案：不定积分（北大高数 §5.1-5.3，定积分的前置）。
 *
 * 四步：
 *   1. 原函数与不定积分    ∫f dx = F + C，一族平移的曲线
 *   2. 基本积分表          幂/指/三角的直接结果
 *   3. 换元积分法          第一类换元（凑微分）
 *   4. 分部积分法          ∫u dv = uv - ∫v du
 *
 * 设计说明：
 *   - 不定积分几何直观弱（导数的逆），可视化重点放在"原函数族"——
 *     差一个常数 C 的一组曲线，用 plot 叠加多条展示。
 *   - onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主原函数
  var ORANGE = '#ff8c42'; // 被积函数 / 标记
  var PURPLE = '#9d7aff'; // 其他原函数族成员
  var GREEN = '#4ade80';  // 验证 / 结论

  var course = {
    id: 'indefinite-integral',
    title: '不定积分',
    summary: '导数的逆运算：从 f(x) 找回 F(x)，一族相差常数 C 的曲线。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><g fill="none" stroke-width="2"><path d="M20 95 Q60 40 100 30 T180 25" stroke="#4f9cf9"/><path d="M20 105 Q60 50 100 40 T180 35" stroke="#9d7aff" opacity="0.7"/><path d="M20 85 Q60 30 100 20 T180 15" stroke="#9d7aff" opacity="0.7"/></g><text x="100" y="62" fill="#ff8c42" font-size="22" text-anchor="middle" font-family="serif" font-style="italic">∫</text><text x="100" y="105" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">F(x)+C 一族曲线</text></svg>',

    steps: [
      // ===== Step 1：原函数与不定积分 =====
      {
        title: '原函数与不定积分',
        narrative: `导数是"已知 $F$ 求 $F'$"。不定积分反过来——**已知 $f$，找一个 $F$ 使 $F' = f$**。
这样的 $F$ 叫 $f$ 的**原函数**，记作：

$$\\int f(x)\\,dx = F(x) + C$$

**为什么有 $+C$？** 因为常数的导数是 0：$(x^2)' = (x^2 + 3)' = (x^2 - 7)' = 2x$。
所以 $2x$ 的原函数不唯一，而是 $x^2 + C$（$C$ 是任意常数）——它们是**一族纵向平移的曲线**，形状完全相同。

右侧就是 $\\int 2x\\,dx = x^2 + C$ 的原函数族。蓝色是 $C=0$（即 $x^2$），
紫色是 $C=1, 2, 3$ 的几条。拖动 $C$ 滑块，看主曲线（蓝）上下平移——
**导数（切线斜率）处处相同**，因为它们都来自同一个 $f = 2x$。

> 求不定积分，就是求导的逆运算：先猜一个，再**求导验证**。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-2, 7] },
          layers: [
            // 几条参考原函数（固定 C=-1,1,2），细线弱化
            { type: 'plot', fn: 'x^2 - 1', color: PURPLE, lineWidth: 1, range: [-2.2, 2.2], samples: 60 },
            { type: 'plot', fn: 'x^2 + 1', color: PURPLE, lineWidth: 1, range: [-2.2, 2.2], samples: 60 },
            { type: 'plot', fn: 'x^2 + 2', color: PURPLE, lineWidth: 1, range: [-2.2, 2.2], samples: 60 },
            // 主曲线 C=0
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 3, range: [-2.2, 2.2], samples: 60 },
            // 被积函数标记（在 x=1 处标注切线斜率=2）
            { type: 'tangent', fn: 'x^2', at: 1, color: ORANGE, dashed: true, halfLen: 0.9, lineWidth: 1.8 },
            { type: 'text', x: -2.1, y: 6.2, text: '蓝: x²+C（C=0）  紫: 其他 C', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 1.3, y: 2.5, text: "f'=2x（处处相同）", color: ORANGE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'C', label: '常数 C（主曲线平移）', type: 'slider', min: -1.5, max: 3, step: 0.2, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'C') return;
          // 主曲线随 C 平移：fn 改为 x^2 + C
          scene.layers[3].fn = 'x^2 + ' + value;
          scene.layers[3]._fn = undefined;
        },
      },

      // ===== Step 2：基本积分表 =====
      {
        title: '基本积分表',
        narrative: `把基本求导公式**反过来**，就得到积分表。这是所有积分技巧的地基，必须熟记：

$$\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$
$$\\int \\frac{1}{x}\\,dx = \\ln|x| + C \\qquad \\int e^x\\,dx = e^x + C$$
$$\\int \\sin x\\,dx = -\\cos x + C \\qquad \\int \\cos x\\,dx = \\sin x + C$$
$$\\int \\sec^2 x\\,dx = \\tan x + C \\qquad \\int \\frac{1}{1+x^2}\\,dx = \\arctan x + C$$

**记忆窍门**：积分公式 = 把求导公式的左右两边对调。比如 $(\\sin x)' = \\cos x$，
反过来就是 $\\int \\cos x\\,dx = \\sin x + C$。

右侧演示 $\\int \\cos x\\,dx = \\sin x + C$：橙色是 $\\cos x$（被积函数），
蓝色是 $\\sin x$（原函数）。**蓝线的切线斜率 = 橙线的高度**——
这正是 $F' = f$ 的几何含义。在波峰（$\\sin=1$）处蓝线最陡，
而橙线恰好达到最大值 1。`,

        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-1.8, 1.8] },
          layers: [
            // 原函数 sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-6.2, 6.2], samples: 120 },
            // 被积函数 cos(x)
            { type: 'plot', fn: 'cos(x)', color: ORANGE, lineWidth: 2, range: [-6.2, 6.2], samples: 120 },
            // 切线：在 x=π/2 处 sin 的切线斜率=cos(π/2)=0（水平）
            { type: 'tangent', fn: 'sin(x)', at: 1.5708, color: PURPLE, dashed: false, halfLen: 1.2, lineWidth: 2 },
            // 标记点
            { type: 'point', x: 1.5708, y: 1, color: BLUE, radius: 4, label: 'F=sin' },
            { type: 'point', x: 1.5708, y: 0, color: ORANGE, radius: 4, label: 'f=cos' },
            { type: 'text', x: -6, y: 1.6, text: '蓝:F=sin x（原函数）  橙:f=cos x（被积）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 2, y: 1.5, text: 'F′=f：蓝切线斜率=橙高度', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -5, max: 5, step: 0.1, value: 1.5708 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[2].at = value;
          scene.layers[3].x = value;
          scene.layers[3].y = Math.sin(value);
          scene.layers[4].x = value;
          scene.layers[4].y = Math.cos(value);
        },
      },

      // ===== Step 3：换元积分法 =====
      {
        title: '换元积分法（凑微分）',
        narrative: `基本积分表只覆盖少数形式。对于复合函数，最常用的技巧是**第一类换元**（凑微分）：

$$\\int f(g(x)) \\cdot g'(x)\\,dx = \\int f(u)\\,du \\quad (u = g(x))$$

核心思路：把被积式"凑"成 $f(g) \\cdot dg$ 的形式，再换元 $u = g(x)$ 化简。

**例子**：求 $\\int 2x \\cos(x^2)\\,dx$。

注意到 $2x = (x^2)'$，令 $u = x^2$，则 $du = 2x\\,dx$：
$$\\int 2x \\cos(x^2)\\,dx = \\int \\cos u\\,du = \\sin u + C = \\sin(x^2) + C$$

右侧可视化这个"凑微分"过程。蓝色是原函数 $\\sin(x^2)$（结果），
橙色虚线是 $u = x^2$（换元的中间变量），绿色是被积函数 $2x\\cos(x^2)$。

**验证**：对蓝线求导，$(\\sin(x^2))' = \\cos(x^2) \\cdot 2x$，恰好是绿色曲线——凑微分成功。
拖动 $x$ 滑块，三者在每一点都满足"$F' = f$"。`,

        scene: {
          axes: { xRange: [-2, 2.5], yRange: [-2.5, 4] },
          layers: [
            // 结果 F = sin(x²)
            { type: 'plot', fn: 'sin(x^2)', color: BLUE, lineWidth: 2.5, range: [-1.9, 2.2], samples: 150 },
            // 中间变量 u = x²
            { type: 'plot', fn: 'x^2', color: ORANGE, lineWidth: 1.8, range: [-1.9, 2.2], samples: 60 },
            // 被积 f = 2x cos(x²)
            { type: 'plot', fn: '2*x*cos(x^2)', color: GREEN, lineWidth: 2, range: [-1.9, 2.2], samples: 150 },
            // 观察点
            { type: 'point', x: 1, y: 0.841, color: BLUE, radius: 4, label: 'F=sin(x²)' },
            { type: 'text', x: -1.8, y: 3.5, text: '蓝:F=sin(x²)  橙:u=x²  绿:f=2x·cos(x²)', color: '#9aa7b4', fontSize: 10, align: 'left' },
            { type: 'text', x: -1.8, y: 3, text: "验证: F′ = cos(x²)·2x = 绿线", color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -1.8, max: 2, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[3].x = value;
          scene.layers[3].y = Math.sin(value * value);
        },
      },

      // ===== Step 4：分部积分法 =====
      {
        title: '分部积分法',
        narrative: `当被积函数是**两类函数的乘积**（如 $x e^x$、$x \\ln x$、$x \\sin x$），换元往往失效。
这时用**分部积分公式**——它来自乘法求导法则 $(uv)' = u'v + uv'$ 的逆用：

$$\\int u\\,dv = uv - \\int v\\,du$$

**口诀**："选 $u$ 求导，剩 $dv$ 积分"。经验顺序（LIATE）：对数 > 反三角 > 代数 > 三角 > 指数，
**靠前的当 $u$**（因为它求导后会变简单）。

**例子**：求 $\\int x e^x\\,dx$。

按 LIATE，$x$（代数）当 $u$，$e^x$（指数）当 $dv$：
- $u = x \\Rightarrow du = dx$
- $dv = e^x dx \\Rightarrow v = e^x$

代入公式：$\\int x e^x\\,dx = x e^x - \\int e^x\\,dx = x e^x - e^x + C = (x-1)e^x + C$。

右侧蓝色就是结果 $(x-1)e^x$。绿色虚线是 $xe^x$（被积），橙色是 $e^x$（减去的那个积分）。
**验证**：$((x-1)e^x)' = e^x + (x-1)e^x = xe^x$ ✓。

> 分部积分的本质：把"难积的乘积"拆成"好算的 $uv$"减去"更简单的积分"。`,

        scene: {
          axes: { xRange: [-0.5, 3], yRange: [-2, 12] },
          layers: [
            // 结果 F = (x-1)e^x
            { type: 'plot', fn: '(x-1)*exp(x)', color: BLUE, lineWidth: 2.5, range: [-0.3, 2.8], samples: 80 },
            // 被积 xe^x
            { type: 'plot', fn: 'x*exp(x)', color: GREEN, lineWidth: 2, range: [-0.3, 2.8], samples: 80 },
            // 减去的 e^x
            { type: 'plot', fn: 'exp(x)', color: ORANGE, lineWidth: 1.8, range: [-0.3, 2.8], samples: 80 },
            { type: 'point', x: 2, y: 7.389, color: BLUE, radius: 4, label: 'F=(x-1)eˣ' },
            { type: 'text', x: 1.5, y: 11, text: '蓝:F=(x-1)eˣ  绿:xeˣ  橙:eˣ', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 0.2, y: 11, text: 'F′ = xeˣ ✓', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
