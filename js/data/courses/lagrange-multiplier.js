/**
 * mathviz — js/data/courses/lagrange-multiplier.js
 * 课案：拉格朗日乘数法（北大高数 §9.6，批次 3 第四套）。
 *
 * 四步：
 *   1. 条件极值问题    在约束 g(x,y)=c 下求 f 的极值
 *   2. 拉格朗日乘数法  ∇f = λ∇g，几何意义：等高线与约束线相切
 *   3. λ 的含义        乘数 λ = 目标函数对约束的灵敏度
 *   4. 应用实例        最优化问题（最小距离、最大体积）
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 *   核心可视化：contour 画 f 的等高线 + line/parametric 画约束曲线，相切点即极值。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 目标函数等高线
  var ORANGE = '#ff8c42'; // 约束曲线
  var PURPLE = '#9d7aff'; // 极值点
  var GREEN = '#4ade80';  // 梯度向量 / 结论

  var course = {
    id: 'lagrange-multiplier',
    title: '拉格朗日乘数法',
    summary: '在约束下求极值——让目标等高线与约束线相切。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><g stroke="#4f9cf9" stroke-width="1" fill="none" opacity="0.4"><ellipse cx="100" cy="56" rx="65" ry="35"/><ellipse cx="100" cy="56" rx="45" ry="24"/><ellipse cx="100" cy="56" rx="25" ry="13"/></g><circle cx="100" cy="56" r="35" fill="none" stroke="#ff8c42" stroke-width="2"/><circle cx="135" cy="50" r="4" fill="#9d7aff"/><line x1="135" y1="50" x2="150" y2="35" stroke="#4ade80" stroke-width="2"/><text x="100" y="100" fill="#9aa7b4" font-size="9" text-anchor="middle" font-family="sans-serif">等高线 ⊥ 约束 → 极值</text></svg>',

    steps: [
      // ===== Step 1：条件极值问题 =====
      {
        title: '什么是条件极值',
        narrative: `普通极值：在**整个定义域**找 $f$ 的最大最小。
**条件极值**：在**约束条件** $g(x,y) = c$ 下找 $f$ 的极值。

**经典例子**：在圆 $x^2 + y^2 = 1$ 上，找 $f(x,y) = xy$ 的最大值。
不能随意取 $(x,y)$，必须在单位圆上！

直觉：想象你站在圆轨道上行走，记录每处的 $xy$ 值，找最高点。
这就是**条件极值**——自由度被约束限制。

右侧蓝色等高线是 $f = xy$（双曲线族），橙色圆是约束 $x^2+y^2=1$。
在圆上移动时，$f$ 值在变化——找到等高线与圆**恰好相切**的点，就是极值。

> 普通极值：$\nabla f = 0$。条件极值：$\nabla f$ 和 $\nabla g$ 共线（下一页）。`,

        scene: {
          axes: { xRange: [-2, 2], yRange: [-2, 2] },
          layers: [
            // f=xy 的等高线
            { type: 'contour', fn: 'x*y', levels: [-1, -0.5, 0.5, 1], nx: 80, ny: 80, color: BLUE, lineWidth: 1.2, opacity: 0.5 },
            // 约束 x²+y²=1
            { type: 'parametric', fx: 'cos(t)', fy: 'sin(t)', tRange: [0, 6.2832], color: ORANGE, lineWidth: 2.5 },
            // 当前观察点（在圆上移动）
            { type: 'point', x: 0.707, y: 0.707, color: GREEN, radius: 5, label: 'P' },
            // 极值点（±1/√2, ±1/√2）
            { type: 'point', x: 0.707, y: 0.707, color: PURPLE, radius: 6, label: 'max' },
            { type: 'point', x: -0.707, y: -0.707, color: PURPLE, radius: 6, label: 'max' },
            { type: 'text', x: -1.8, y: 1.7, text: '蓝:f=xy等高线  橙:约束圆', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -1.8, y: 1.3, text: '相切点 = 条件极值', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -1.8, y: 0.9, text: '拖 θ 看 f 值变化', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'theta', label: '圆上角度 θ', type: 'slider', min: 0, max: 6.28, step: 0.05, value: 0.785 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'theta') return;
          var px = Math.cos(value), py = Math.sin(value);
          // 观察点
          scene.layers[2].x = px; scene.layers[2].y = py;
          var fv = px * py;
          // 判断是否接近相切点(±1/√2)
          var atTangent = Math.abs(Math.abs(px) - 0.707) < 0.08 && Math.abs(Math.abs(py) - 0.707) < 0.08;
          scene.layers[5].color = atTangent ? GREEN : '#9aa7b4';
          scene.layers[5].text = atTangent ? '相切处 f 最大 = 1/2 ✓' : '相切点 = 条件极值';
          scene.layers[7].text = 'θ=' + value.toFixed(2) + '  P=(' + px.toFixed(2) + ',' + py.toFixed(2) + ')  f=xy=' + fv.toFixed(3);
        },
      },

      // ===== Step 2：拉格朗日乘数法 =====
      {
        title: '拉格朗日乘数法',
        narrative: `**拉格朗日乘数法**的核心方程：

$$\\nabla f = \\lambda \\, \\nabla g$$

加上约束 $g(x,y) = c$，共三个方程解三个未知数 $(x, y, \\lambda)$。

**几何意义**：在极值点，$f$ 的等高线与约束曲线 $g=c$ **相切**（有公共切线）。
因为两者的梯度都垂直于切线，所以 $\\nabla f$ 和 $\\nabla g$ **共线**（平行），即 $\\nabla f = \\lambda \\nabla g$。

**例子**：$f = xy$，约束 $x^2+y^2=1$。
- $\\nabla f = (y, x)$，$\\nabla g = (2x, 2y)$
- $y = 2\\lambda x$，$x = 2\\lambda y$
- 解得 $x^2 = y^2$，结合 $x^2+y^2=1$ 得 $x = y = \\pm\\frac{1}{\\sqrt{2}}$
- 最大值 $f = \\frac{1}{2}$

右侧演示：蓝色梯度 $\\nabla f$ 与橙色梯度 $\\nabla g$ 在极值点**共线**（绿色验证）。
拖动 $\\theta$ 滑块沿约束圆移动，只有切点处两梯度平行。`,

        scene: {
          axes: { xRange: [-2, 2], yRange: [-2, 2] },
          layers: [
            // 约束圆
            { type: 'parametric', fx: 'cos(t)', fy: 'sin(t)', tRange: [0, 6.2832], color: ORANGE, lineWidth: 2 },
            // 观察点（在圆上）
            { type: 'point', x: 0.707, y: 0.707, color: ORANGE, radius: 5, label: 'P' },
            // ∇f 向量（蓝色）
            { type: 'line', from: [0.707, 0.707], to: [0.707 + 0.707 * 0.4, 0.707 + 0.707 * 0.4], color: BLUE, lineWidth: 2.5 },
            // ∇g 向量（橙色）
            { type: 'line', from: [0.707, 0.707], to: [0.707 + 2 * 0.707 * 0.2, 0.707 + 2 * 0.707 * 0.2], color: ORANGE, lineWidth: 2.5 },
            { type: 'text', x: -1.8, y: 1.7, text: '蓝:∇f  橙:∇g', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -1.8, y: 1.3, text: '切点处 ∇f ∥ ∇g ✓', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'theta', label: '圆上角度 θ', type: 'slider', min: 0, max: 6.28, step: 0.05, value: 0.785 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'theta') return;
          var px = Math.cos(value), py = Math.sin(value);
          scene.layers[1].x = px; scene.layers[1].y = py;
          // ∇f = (y, x)
          var s1 = 0.4;
          scene.layers[2].from = [px, py];
          scene.layers[2].to = [px + py * s1, py + px * s1];
          // ∇g = (2x, 2y)
          var s2 = 0.2;
          scene.layers[3].from = [px, py];
          scene.layers[3].to = [px + 2 * px * s2, py + 2 * py * s2];
          // 判断共线：∇f=(y,x), ∇g=(2x,2y)，共线当 y/(2x)=x/(2y) 即 y²=x²
          var parallel = Math.abs(px * px - py * py) < 0.05;
          scene.layers[5].text = parallel ? '切点处 ∇f ∥ ∇g ✓ (极值)' : '∇f 不平行 ∇g（非极值）';
          scene.layers[5].color = parallel ? GREEN : '#9aa7b4';
        },
      },

      // ===== Step 3：λ 的含义 =====
      {
        title: '乘数 λ 的含义',
        narrative: `拉格朗日乘数 $\\lambda$ 不只是解方程的副产物——它有深刻的**经济学含义**：

$$\\lambda = \\frac{d f^*}{d c}$$

其中 $f^*$ 是约束 $g = c$ 下的最优值。$\\lambda$ 表示**约束放松一点点，目标能改善多少**。

- $\\lambda > 0$：放松约束（增大 $c$）能提升 $f$（约束"紧"）
- $\\lambda < 0$：放松约束会降低 $f$
- $\\lambda = 0$：约束不起作用（无约束极值就在约束面上）

**经济学应用**：
- $f$ = 利润，$g = c$ = 预算约束。$\\lambda$ = **影子价格**（多花1元预算能赚多少利润）
- $\\lambda$ 帮助决策：若 $\\lambda >$ 边际成本，值得追加预算

**前面的例子**：$f=xy$，$g=x^2+y^2=1$，解得 $\\lambda = \\frac{1}{2}$。
意味着半径从 1 增大到 $1+\\Delta$ 时，最大 $xy$ 值增加约 $\\frac{1}{2}\\Delta$。

右侧用不同约束半径 $r$ 展示：$r$ 增大时最优 $f$ 值的变化率就是 $\\lambda$。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-2, 2] },
          layers: [
            // 不同半径的约束圆
            { type: 'parametric', fx: '0.7*cos(t)', fy: '0.7*sin(t)', tRange: [0, 6.2832], color: '#3a4452', lineWidth: 1.5 },
            { type: 'parametric', fx: '1.0*cos(t)', fy: '1.0*sin(t)', tRange: [0, 6.2832], color: ORANGE, lineWidth: 2 },
            { type: 'parametric', fx: '1.3*cos(t)', fy: '1.3*sin(t)', tRange: [0, 6.2832], color: '#3a4452', lineWidth: 1.5 },
            // 各圆上的最优点
            { type: 'point', x: 0.495, y: 0.495, color: PURPLE, radius: 4, label: 'r=0.7' },
            { type: 'point', x: 0.707, y: 0.707, color: PURPLE, radius: 5, label: 'r=1.0' },
            { type: 'point', x: 0.919, y: 0.919, color: PURPLE, radius: 4, label: 'r=1.3' },
            { type: 'text', x: -2.3, y: 1.7, text: 'f*=r²/2，λ=df*/dc=r/2=0.5', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -2.3, y: 1.3, text: '约束放松 → 最优值增大', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.3, y: 0.9, text: '拖 r 看当前 λ', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'r', label: '约束半径 r', type: 'slider', min: 0.4, max: 1.6, step: 0.05, value: 1.0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'r') return;
          var r = value;
          // 当前活动圆高亮为橙色,其它两圆灰化(保持三个参考半径不动,只重画"当前 r"对应的圆与最优点)
          // 用 layers[2] 的位置表达当前 r:把第三个 parametric 改成当前半径,并放最优点
          // 但为保持"三个固定圆"的视觉对照,这里改为更新 layers[5](当前活动最优点)+ 文字
          // 当前活动点坐标:r/√2 处
          var p = r / Math.SQRT2;
          scene.layers[5].x = p; scene.layers[5].y = p;
          scene.layers[5].color = GREEN;
          scene.layers[5].radius = 6;
          scene.layers[5].label = 'r=' + r.toFixed(2);
          // λ = r/2,f* = r²/2
          var lambda = r / 2;
          var fstar = r * r / 2;
          scene.layers[6].text = '当前 r=' + r.toFixed(2) + '：f*=' + fstar.toFixed(3) + '，λ=r/2=' + lambda.toFixed(3);
        },
      },

      // ===== Step 4：应用实例 =====
      {
        title: '应用：点到直线的最短距离',
        narrative: `**经典问题**：原点到直线 $x + y = 4$ 的最短距离。

用拉格朗日乘数法：$f(x,y) = x^2 + y^2$（距离平方，便于求导），约束 $g = x + y - 4 = 0$。

- $\\nabla f = (2x, 2y)$，$\\nabla g = (1, 1)$
- $2x = \\lambda$，$2y = \\lambda$ → $x = y$
- 代入约束 $2x = 4$ → $x = y = 2$
- 最短距离 $= \\sqrt{4+4} = 2\\sqrt{2}$

**验证**：点 $(2,2)$ 确实在直线 $x+y=4$ 上，且原点到该点的向量 $(2,2)$ 与直线法向 $(1,1)$ 共线——
这正是"垂线最短"的拉格朗日版本！

右侧演示：蓝色同心圆是距离等高线 $x^2+y^2=c$，橙色直线是约束 $x+y=4$。
最小圆与直线**相切**于点 $(2,2)$（紫色），切点即最短距离点。

> 拉格朗日乘数法把"几何直觉（垂线最短）"变成了"代数程序（解方程组）"。`,

        scene: {
          axes: { xRange: [-1, 6], yRange: [-1, 6] },
          layers: [
            // 距离等高线（同心圆）
            { type: 'contour', fn: 'x^2 + y^2', levels: [2, 4, 8, 12, 16, 20], nx: 80, ny: 80, color: BLUE, lineWidth: 1.2, opacity: 0.5 },
            // 约束直线 x+y=c（默认 c=4）
            { type: 'line', from: [0, 4], to: [4, 0], color: ORANGE, lineWidth: 2.5 },
            // 最优点 (c/2, c/2)
            { type: 'point', x: 2, y: 2, color: PURPLE, radius: 6, label: '(2,2) d=2√2' },
            // 原点到最优点
            { type: 'line', from: [0, 0], to: [2, 2], color: GREEN, lineWidth: 2 },
            { type: 'text', x: -0.8, y: 5.5, text: '蓝:距离等高线  橙:约束 x+y=c', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -0.8, y: 5, text: '相切点(c/2,c/2) = 最短距离点', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -0.8, y: 4.5, text: '拖 c 看切点与距离变化', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'c', label: '约束常数 c（直线 x+y=c）', type: 'slider', min: 1, max: 8, step: 0.1, value: 4 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'c') return;
          var c = value;
          // 约束直线从 (0,c) 到 (c,0)
          scene.layers[1].from = [0, c];
          scene.layers[1].to = [c, 0];
          // 最优点 (c/2, c/2)
          var px = c / 2, py = c / 2;
          scene.layers[2].x = px; scene.layers[2].y = py;
          scene.layers[2].label = '(' + px.toFixed(2) + ',' + py.toFixed(2) + ')';
          // 原点到最优点
          scene.layers[3].to = [px, py];
          // 距离 = √(c²/2) = c/√2
          var d = c / Math.SQRT2;
          scene.layers[5].text = '切点(' + px.toFixed(2) + ',' + py.toFixed(2) + ')  距离=' + d.toFixed(3);
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
