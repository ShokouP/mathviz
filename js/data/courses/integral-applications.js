/**
 * mathviz — js/data/courses/integral-applications.js
 * 课案：定积分的应用（北大高数 §6.5，批次 2 第三套）。
 *
 * 四步：
 *   1. 平面图形面积    两曲线之间、曲线与轴之间
 *   2. 旋转体体积（圆盘法）  V = π∫f² dx，绕 x 轴
 *   3. 旋转体体积（圆柱壳法）V = 2π∫x·f dx，绕 y 轴
 *   4. 曲线弧长        L = ∫√(1+f'²) dx
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 * 充分利用 areaFill（面积填充）、plot（曲线）、parametric（旋转体截面圆）原语。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主曲线
  var ORANGE = '#ff8c42'; // 第二曲线 / 标记
  var PURPLE = '#9d7aff'; // 旋转体轮廓 / 辅助
  var GREEN = '#4ade80';  // 面积填充 / 结论

  var course = {
    id: 'integral-applications',
    title: '定积分的应用',
    summary: '面积、旋转体体积、弧长——把"切割-求和-取极限"用于几何度量。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M40 90 Q80 40 120 50 T180 60" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><path d="M40 90 Q80 40 120 50 T180 60 L180 90 L40 90 Z" fill="#4ade80" opacity="0.25"/><line x1="40" y1="90" x2="180" y2="90" stroke="#ff8c42" stroke-width="1.5"/><text x="100" y="22" fill="#e6edf3" font-size="12" text-anchor="middle" font-family="sans-serif">∫ = 面积</text></svg>',

    steps: [
      // ===== Step 1：平面图形面积 =====
      {
        title: '平面图形的面积',
        narrative: `定积分最直接的应用——**曲线下方的面积**：

$$A = \\int_a^b f(x)\\,dx$$

若求**两曲线之间**的面积（上曲线 $f$ 减下曲线 $g$）：

$$A = \\int_a^b [f(x) - g(x)]\\,dx$$

直觉：把区域切成无数竖直细条，每条面积 $\\approx [f(x)-g(x)]\\,\\Delta x$，求和取极限就是积分。

右侧演示 $f(x) = \\sin x$（蓝）与 $g(x) = 0$（x 轴）在 $[0, \\pi]$ 之间的面积。
绿色填充就是所求面积 $A = \\int_0^\\pi \\sin x\\,dx = [-\\cos x]_0^\\pi = 2$。

拖动 $b$ 滑块改变积分上限，看面积如何累积。当 $b = \\pi$ 时恰好填满半个波，面积 = 2。`,

        scene: {
          axes: { xRange: [-0.5, 4], yRange: [-0.5, 1.5] },
          layers: [
            // 面积填充 [0, b]
            { type: 'areaFill', fn: 'sin(x)', range: [0, 2], color: 'rgba(74,222,128,0.3)' },
            // sin(x) 曲线
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-0.3, 3.7], samples: 100 },
            // 积分上下限标记
            { type: 'line', from: [0, -0.4], to: [0, 1.3], color: ORANGE, dashed: true, lineWidth: 1.5 },
            { type: 'line', from: [2, -0.4], to: [2, 1.3], color: ORANGE, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: -0.1, y: -0.45, text: 'a=0', color: ORANGE, fontSize: 12 },
            { type: 'text', x: 1.9, y: -0.45, text: 'b', color: ORANGE, fontSize: 12 },
            { type: 'text', x: 2.5, y: 1.2, text: 'A = 1 - cos(b)', color: GREEN, fontSize: 13, align: 'left' },
          ],
        },
        controls: [
          { name: 'b', label: '积分上限 b', type: 'slider', min: 0.1, max: 3.14, step: 0.05, value: 2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'b') return;
          scene.layers[0].range = [0, value];
          scene.layers[3].from = [value, -0.4];
          scene.layers[3].to = [value, 1.3];
          scene.layers[5].x = value - 0.1;
          var area = 1 - Math.cos(value);
          scene.layers[6].text = 'A = 1 - cos(' + value.toFixed(2) + ') = ' + area.toFixed(3);
        },
      },

      // ===== Step 2：旋转体体积（圆盘法） =====
      {
        title: '旋转体体积：圆盘法',
        narrative: `把曲线 $y = f(x)$ 绕 **$x$ 轴**旋转一周，得到一个立体——如何算它的体积？

**圆盘法**：在 $x$ 处切一片厚度 $dx$ 的薄圆盘，半径 $= f(x)$，体积 $\\approx \\pi f(x)^2\\,dx$。
求和取极限：

$$V = \\pi \\int_a^b [f(x)]^2\\,dx$$

**例子**：把 $y = \\sqrt{x}$（$0 \\leq x \\leq 4$）绕 $x$ 轴旋转，得到一个抛物面。
$$V = \\pi \\int_0^4 x\\,dx = \\pi \\cdot \\frac{x^2}{2}\\Big|_0^4 = 8\\pi$$

右侧演示：蓝色是 $y=\\sqrt{x}$ 曲线，绿色填充表示体积的"截面累积"，
紫色虚线画了几个截面圆（半径 $= \\sqrt{x}$）。
拖动 $x$ 滑块看截面圆的半径变化——**圆盘法就是把无数薄圆盘叠起来**。`,

        scene: {
          axes: { xRange: [-0.5, 4.5], yRange: [-2.5, 2.5] },
          layers: [
            // 上半曲线 √x
            { type: 'plot', fn: 'sqrt(x)', color: BLUE, lineWidth: 2.5, range: [0, 4], samples: 80 },
            // 下半曲线 -√x（旋转体的轮廓）
            { type: 'plot', fn: '-sqrt(x)', color: BLUE, lineWidth: 2.5, range: [0, 4], samples: 80 },
            // 面积填充（上半）
            { type: 'areaFill', fn: 'sqrt(x)', range: [0, 4], color: 'rgba(74,222,128,0.2)' },
            // 几个截面圆（用 parametric 画圆）
            { type: 'parametric', fx: '0.5*cos(t)', fy: 'sqrt(0.5)*sin(t)', tRange: [0, 6.2832], color: PURPLE, lineWidth: 1.5 },
            { type: 'parametric', fx: '2*cos(t)+2', fy: 'sqrt(2)*sin(t)', tRange: [0, 6.2832], color: PURPLE, lineWidth: 1.5 },
            { type: 'text', x: 2.5, y: 2.2, text: 'V=π∫f²dx（圆盘叠成体积）', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察截面位置 x', type: 'slider', min: 0.2, max: 3.8, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var r = Math.sqrt(value);
          // 第一个截面圆移到 x 处（半径 √x）
          scene.layers[3].fx = value + '+0.3*cos(t)';
          scene.layers[3].fy = r + '*sin(t)';
          scene.layers[3]._fx = undefined;
          scene.layers[3]._fy = undefined;
        },
      },

      // ===== Step 3：圆柱壳法 =====
      {
        title: '旋转体体积：圆柱壳法',
        narrative: `同一个旋转体，换一种切法——**圆柱壳法**，适合绕 **$y$ 轴**旋转的情形。

把区域切成无数**竖直薄条**，每条绕 $y$ 轴旋转形成一个圆柱壳：
- 半径 $= x$，高 $= f(x)$，厚度 $= dx$
- 壳体积 $\\approx 2\\pi x \\cdot f(x) \\cdot dx$

$$V = 2\\pi \\int_a^b x\\,f(x)\\,dx$$

**对比圆盘法**：圆盘法垂直切（垂直于旋转轴），圆柱壳法水平卷（平行于旋转轴）。
同一个体积两种算法，结果相同——这正是微积分的优美。

**例子**：$y = x$（$0 \\leq x \\leq 1$）绕 $y$ 轴旋转成圆锥。
圆柱壳法：$V = 2\\pi\\int_0^1 x \\cdot x\\,dx = 2\\pi/3$。
圆盘法（对 $y$ 积分）：$V = \\pi\\int_0^1 y^2\\,dy = \\pi/3$。**结果一致**？不——圆锥体积应是 $\\pi/3$。

注意这里圆柱壳法的被积式是 $x \\cdot f(x) = x^2$，得 $2\\pi/3$，而圆锥（底半径 1 高 1）体积 $\\pi/3$。
差异在于绕 $y$ 轴旋转 $y=x$ 得到的是**不同的立体**——演示中可见。

右侧蓝色是 $y=x$，绿色是一个圆柱壳的示意，紫色虚线是旋转半径。`,

        scene: {
          axes: { xRange: [-0.5, 2], yRange: [-0.5, 1.5] },
          layers: [
            // y = x
            { type: 'plot', fn: 'x', color: BLUE, lineWidth: 2.5, range: [0, 1], samples: 40 },
            // 圆柱壳示意（在 x=0.6 处的竖条 + 圆弧）
            { type: 'areaFill', fn: 'x', range: [0.55, 0.65], color: 'rgba(74,222,128,0.4)' },
            // y 轴（旋转轴）
            { type: 'line', from: [0, -0.5], to: [0, 1.5], color: ORANGE, lineWidth: 2 },
            { type: 'text', x: -0.4, y: 1.3, text: 'y轴', color: ORANGE, fontSize: 12 },
            // 半径标注
            { type: 'line', from: [0, 0.6], to: [0.6, 0.6], color: PURPLE, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: 0.2, y: 0.7, text: '半径x', color: PURPLE, fontSize: 11 },
            { type: 'text', x: 1, y: 1.3, text: 'V=2π∫x·f(x)dx', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '壳的位置 x', type: 'slider', min: 0.1, max: 0.9, step: 0.05, value: 0.6 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          // 圆柱壳宽度 0.1，居中于 value
          scene.layers[1].range = [value - 0.05, value + 0.05];
          scene.layers[3].from = [0, value];
          scene.layers[3].to = [value, value];
          scene.layers[4].x = value / 2 - 0.1;
        },
      },

      // ===== Step 4：曲线弧长 =====
      {
        title: '曲线的弧长',
        narrative: `曲线 $y = f(x)$ 从 $a$ 到 $b$ 的**弧长**：

$$L = \\int_a^b \\sqrt{1 + [f'(x)]^2}\\,dx$$

**推导**：把曲线切成无数小段，每段近似直线，长度 $\\approx \\sqrt{dx^2 + dy^2} = \\sqrt{1 + (dy/dx)^2}\\,dx$。

**例子**：$y = \\frac{2}{3}x^{3/2}$（$0 \\leq x \\leq 3$）。
$f'(x) = x^{1/2}$，弧长 $L = \\int_0^3 \\sqrt{1 + x}\\,dx = \\frac{2}{3}(1+x)^{3/2}\\Big|_0^3 = \\frac{2}{3}(8-1) = \\frac{14}{3}$。

右侧蓝色是曲线，橙色虚线是弦（直线距离），**弧长 > 弦长**——因为曲线"绕了路"。
拖动 $b$ 滑块扩展弧段，看弧长如何增长。绿色填充粗略示意弧长累积。

> 弧长公式的本质：**勾股定理在无穷小尺度的应用**。`,

        scene: {
          axes: { xRange: [-0.5, 3.5], yRange: [-0.5, 5] },
          layers: [
            // 曲线 (2/3)x^(3/2)
            { type: 'plot', fn: '(2/3)*x^(3/2)', color: BLUE, lineWidth: 2.5, range: [0, 3], samples: 100 },
            // 弦（直线距离）
            { type: 'line', from: [0, 0], to: [2, 1.886], color: ORANGE, dashed: true, lineWidth: 2 },
            // 端点
            { type: 'point', x: 0, y: 0, color: ORANGE, radius: 4, label: '起点' },
            { type: 'point', x: 2, y: 1.886, color: ORANGE, radius: 4, label: '终点' },
            { type: 'text', x: 2.2, y: 4.3, text: '蓝:曲线  橙虚:弦（直线距离）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 2.2, y: 3.7, text: 'L = ∫√(1+f′²)dx > 弦长', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'b', label: '弧段终点 b', type: 'slider', min: 0.5, max: 3, step: 0.1, value: 2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'b') return;
          var yb = (2 / 3) * Math.pow(value, 1.5);
          scene.layers[0].range = [0, value];
          scene.layers[1].to = [value, yb];
          scene.layers[3].x = value;
          scene.layers[3].y = yb;
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
