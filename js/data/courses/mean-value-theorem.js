/**
 * mathviz — js/data/courses/mean-value-theorem.js
 * 课案：微分中值定理（北大高数 §4.1，导数的核心应用）。
 *
 * 四步：
 *   1. 罗尔定理        f(a)=f(b) → 存在 ξ 使 f'(ξ)=0（水平切线）
 *   2. 拉格朗日中值定理  割线斜率 = 某点切线斜率，f'(ξ)=(f(b)-f(a))/(b-a)
 *   3. 柯西中值定理     两个函数的"参数化"版本
 *   4. 应用            证明方程根的存在性、推导不等式
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 函数曲线
  var ORANGE = '#ff8c42'; // 切线 / 割线 / 关键点
  var PURPLE = '#9d7aff'; // ξ 点 / 第二对象
  var GREEN = '#4ade80';  // 水平线 / 结论

  var course = {
    id: 'mean-value-theorem',
    title: '微分中值定理',
    summary: '罗尔、拉格朗日、柯西——"切线总能平行于割线"的三个层次。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M20 90 Q60 30 100 50 T180 70" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><line x1="20" y1="90" x2="180" y2="70" stroke="#ff8c42" stroke-width="1.8" stroke-dasharray="5 3"/><line x1="55" y1="55" x2="145" y2="55" stroke="#9d7aff" stroke-width="2"/><circle cx="100" cy="55" r="4" fill="#9d7aff"/><text x="100" y="22" fill="#e6ed3f" font-size="11" text-anchor="middle" font-family="sans-serif">f&apos;(ξ)=割线斜率</text></svg>',

    steps: [
      // ===== Step 1：罗尔定理 =====
      {
        title: '罗尔定理',
        narrative: `微分中值定理最简单的形式——**罗尔定理**：

> 若 $f$ 在 $[a,b]$ 连续、$(a,b)$ 可导，且 $f(a) = f(b)$，
> 则存在 $\\xi \\in (a,b)$ 使 $f'(\\xi) = 0$。

几何意义极其直观：曲线两端**等高**，中间必有某处的切线**水平**。

想象你从 $a$ 点出发走到 $b$ 点（高度相同）。途中要么一直平的（处处 $f'=0$），
要么先上升后下降——而在最高点或最低点，切线必然水平。

**注意条件缺一不可**：
- 不连续？结论可能不成立（函数跳过水平点）
- 端点不等高？至少存在某处切线**平行于割线**（这就是下一步的拉格朗日）

右侧蓝色是 $f(x) = \\sin(x)$ 在 $[0, \\pi]$ 上，端点 $f(0)=f(\\pi)=0$。
紫色 ξ 点在 $x=\\pi/2$（波峰），那里的切线水平（绿色虚线）。拖动 ξ 滑块，
只有当 ξ 落在波峰 $\\pi/2$ 时切线才水平——这就是罗尔定理"指认"的位置。`,

        scene: {
          axes: { xRange: [-0.5, 3.5], yRange: [-0.5, 1.5] },
          layers: [
            // sin(x) 在 [0, π]
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [0, 3.14159], samples: 80 },
            // 端点连线（水平，因为 f(0)=f(π)=0）
            { type: 'line', from: [0, 0], to: [3.14159, 0], color: ORANGE, lineWidth: 1.8, dashed: true },
            // 端点
            { type: 'point', x: 0, y: 0, color: ORANGE, radius: 5, label: 'a' },
            { type: 'point', x: 3.14159, y: 0, color: ORANGE, radius: 5, label: 'b' },
            // ξ 点处的切线（初始 ξ=π/2，水平）
            { type: 'tangent', fn: 'sin(x)', at: 1.5708, color: PURPLE, dashed: false, halfLen: 1, lineWidth: 2 },
            { type: 'point', x: 1.5708, y: 1, color: PURPLE, radius: 5, label: 'ξ' },
            { type: 'text', x: 2.6, y: 1.3, text: 'f′(ξ)=0 处水平', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'xi', label: 'ξ 位置', type: 'slider', min: 0.3, max: 2.8, step: 0.05, value: 1.5708 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'xi') return;
          scene.layers[4].at = value;
          scene.layers[5].x = value;
          scene.layers[5].y = Math.sin(value);
          // ξ=π/2≈1.5708 时切线水平
          var isHorizontal = Math.abs(value - 1.5708) < 0.15;
          scene.layers[6].text = isHorizontal ? '✓ f′(ξ)=0（罗尔点）' : 'f′(ξ)≠0（继续找）';
          scene.layers[6].color = isHorizontal ? GREEN : '#9aa7b4';
        },
      },

      // ===== Step 2：拉格朗日中值定理 =====
      {
        title: '拉格朗日中值定理',
        narrative: `去掉 $f(a)=f(b)$ 的限制，就得到**拉格朗日中值定理**——微积分最常用的定理之一：

> 若 $f$ 在 $[a,b]$ 连续、$(a,b)$ 可导，则存在 $\\xi \\in (a,b)$ 使
> $$f'(\\xi) = \\frac{f(b) - f(a)}{b - a}$$

右边是**割线 $AB$ 的斜率**。所以几何意义是：

> **曲线弧 $AB$ 上必有一点 $\\xi$，该点切线平行于割线 $AB$。**

直觉：把割线 $AB$ 平移着往上"顶"，总有一个时刻它恰好在某点与曲线相切——那个点就是 $\\xi$。

右侧蓝色是 $f(x) = x^2$ 在 $[1,3]$ 上。橙色虚线是割线 $AB$，斜率 $= (9-1)/(3-1) = 4$。
紫色 ξ 点在 $x=2$（因为 $f'(x)=2x$，令 $2\\xi=4$ 得 $\\xi=2$），那里的紫色切线**恰好平行于**橙色割线。

拖动 ξ 滑块，只有 ξ=2 时两条线才平行。这就是拉格朗日定理"承诺"的存在性。`,

        scene: {
          axes: { xRange: [0, 4], yRange: [-0.5, 10] },
          layers: [
            // f=x^2 在 [1,3]
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2.5, range: [1, 3], samples: 60 },
            // 割线 AB：从 (1,1) 到 (3,9)，斜率 4
            { type: 'line', from: [1, 1], to: [3, 9], color: ORANGE, lineWidth: 2, dashed: true },
            // 端点
            { type: 'point', x: 1, y: 1, color: ORANGE, radius: 5, label: 'A(1,1)' },
            { type: 'point', x: 3, y: 9, color: ORANGE, radius: 5, label: 'B(3,9)' },
            // ξ 处切线（初始 ξ=2）
            { type: 'tangent', fn: 'x^2', at: 2, color: PURPLE, dashed: false, halfLen: 1.2, lineWidth: 2 },
            { type: 'point', x: 2, y: 4, color: PURPLE, radius: 5, label: 'ξ=2' },
            { type: 'text', x: 2.2, y: 9.3, text: '割线斜率=4，f′(2)=4 ✓', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'xi', label: 'ξ 位置', type: 'slider', min: 1.1, max: 2.9, step: 0.05, value: 2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'xi') return;
          scene.layers[4].at = value;
          scene.layers[5].x = value;
          scene.layers[5].y = value * value;
          var slope = 2 * value; // f'(ξ)=2ξ
          var parallel = Math.abs(slope - 4) < 0.2;
          scene.layers[5].label = 'ξ=' + value.toFixed(2);
          scene.layers[6].text = parallel ? '✓ f′(ξ)=' + slope.toFixed(2) + '=割线斜率' : 'f′(ξ)=' + slope.toFixed(2) + '≠4';
          scene.layers[6].color = parallel ? GREEN : '#9aa7b4';
        },
      },

      // ===== Step 3：柯西中值定理 =====
      {
        title: '柯西中值定理',
        narrative: `把拉格朗日定理推广到**两个函数** $f$、$g$，就是**柯西中值定理**：

> 若 $f$、$g$ 都在 $[a,b]$ 连续、$(a,b)$ 可导，且 $g'(x) \\neq 0$，则存在 $\\xi \\in (a,b)$ 使
> $$\\frac{f'(\\xi)}{g'(\\xi)} = \\frac{f(b) - f(a)}{g(b) - g(a)}$$

理解它最好的方式是**参数化**：把 $(g(t), f(t))$ 看作平面上的一条曲线（$t$ 从 $a$ 到 $b$），
那么柯西定理说的就是：这条参数曲线上存在一点，其切线平行于起点到终点的割线。
当 $g(t) = t$ 时，它就退化回拉格朗日定理。

右侧演示：取 $g(t) = t$（横轴），$f(t) = t^3$（纵轴对应值）。
蓝色是 $f$ 关于 $g$ 的曲线，橙色虚线是割线。
在 $\\xi$ 处（紫色），切线斜率 $f'(\\xi)/g'(\\xi) = 3\\xi^2$ 应等于割线斜率。

拖动 ξ 滑块寻找平行位置——这就是柯西定理的几何含义。`,

        scene: {
          axes: { xRange: [0, 2.5], yRange: [-0.5, 9] },
          layers: [
            // 参数曲线 (g=t, f=t³)，在 (t,t³) 视角下就是 y=x³
            { type: 'plot', fn: 'x^3', color: BLUE, lineWidth: 2.5, range: [0.5, 2], samples: 60 },
            // 割线 (0.5, 0.125) 到 (2, 8)，斜率=(8-0.125)/(2-0.5)=5.25
            { type: 'line', from: [0.5, 0.125], to: [2, 8], color: ORANGE, lineWidth: 2, dashed: true },
            { type: 'point', x: 0.5, y: 0.125, color: ORANGE, radius: 4, label: '起点' },
            { type: 'point', x: 2, y: 8, color: ORANGE, radius: 4, label: '终点' },
            // ξ 切线（f'=3x²，ξ≈1.32 时 3ξ²≈5.25）
            { type: 'tangent', fn: 'x^3', at: 1.32, color: PURPLE, dashed: false, halfLen: 0.6, lineWidth: 2 },
            { type: 'point', x: 1.32, y: 2.3, color: PURPLE, radius: 5, label: 'ξ' },
            { type: 'text', x: 0.6, y: 8.5, text: '蓝:y=x³  橙:割线  紫:ξ 切线', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'xi', label: 'ξ 位置', type: 'slider', min: 0.7, max: 1.8, step: 0.02, value: 1.32 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'xi') return;
          scene.layers[4].at = value;
          scene.layers[5].x = value;
          scene.layers[5].y = value * value * value;
          var slope = 3 * value * value;
          var parallel = Math.abs(slope - 5.25) < 0.4;
          scene.layers[5].label = 'ξ=' + value.toFixed(2);
          scene.layers[6].text = parallel ? '✓ 切线∥割线' : 'f′/g′=' + slope.toFixed(2);
          scene.layers[6].color = parallel ? GREEN : '#9aa7b4';
        },
      },

      // ===== Step 4：应用 =====
      {
        title: '中值定理的应用',
        narrative: `中值定理是**理论工具**，常用于三类问题：

**1. 证明方程有根**（罗尔定理的推论）
若 $f(a)$ 与 $f(b)$ 异号，且 $f$ 连续，则 $(a,b)$ 内必有 $f$ 的零点。
（介值定理，连续函数的化身）

**2. 证明不等式**
要证 $|f(b) - f(a)| \\leq M(b-a)$，只需说明 $|f'(x)| \\leq M$，再由拉格朗日定理：
$$f(b) - f(a) = f'(\\xi)(b-a), \\quad |f'(\\xi)| \\leq M$$
例如证 $|\\sin b - \\sin a| \\leq |b - a|$（因为 $|\\cos x| \\leq 1$）。

**3. 证明恒等式**
若 $f'(x) \\equiv 0$，则 $f$ 是常数（拉格朗日定理的逆用）。
比如证 $\\arcsin x + \\arccos x = \\pi/2$：求导得 0，故恒为常数。

右侧可视化第 2 类：蓝色 $\\sin x$ 在任意区间 $[a,b]$ 上的增量，
其绝对值不超过橙色割线的"最大可能斜率 1 × 区间长"。绿色虚线标出 $\\xi$ 处切线（斜率 $\\cos\\xi$，绝对值 ≤1）。

**核心思想**：把"整体变化"（$f(b)-f(a)$）归结到"某一点的瞬时变化率"（$f'(\\xi)$）——
这就是中值定理的威力：**用局部信息控制全局**。`,

        scene: {
          axes: { xRange: [-1, 4], yRange: [-1.5, 2] },
          layers: [
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-0.5, 3.5], samples: 80 },
            // 割线 [0.5, 2.8]
            { type: 'line', from: [0.5, 0.479], to: [2.8, 0.335], color: ORANGE, lineWidth: 2, dashed: true },
            { type: 'point', x: 0.5, y: 0.479, color: ORANGE, radius: 4, label: 'a' },
            { type: 'point', x: 2.8, y: 0.335, color: ORANGE, radius: 4, label: 'b' },
            // ξ 切线
            { type: 'tangent', fn: 'sin(x)', at: 1.65, color: GREEN, dashed: false, halfLen: 1, lineWidth: 2 },
            { type: 'point', x: 1.65, y: 0.997, color: GREEN, radius: 5, label: 'ξ' },
            { type: 'text', x: 2, y: 1.7, text: '|Δf| ≤ |b-a|（因 |cos|≤1）', color: '#9aa7b4', fontSize: 12, align: 'left' },
          ],
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
