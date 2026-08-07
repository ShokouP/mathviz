/**
 * mathviz — js/data/courses/gradient.js
 * 课案：方向导数与梯度（北大高数 §9.5，批次 3 第二套）。
 *
 * 四步：
 *   1. 梯度的定义       ∇f = (∂f/∂x, ∂f/∂y)，偏导数组成的向量
 *   2. 梯度垂直于等高线   ∇f 指向 f 增长最快方向
 *   3. 方向导数         D_u f = ∇f · u，任意方向的变率
 *   4. 应用：最速下降    沿 -∇f 走就是最快下山路径
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 *   核心可视化：contour 画等高线 + vectorField 画梯度场 + line 画方向。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 梯度向量
  var ORANGE = '#ff8c42'; // 观察点 / 标记
  var PURPLE = '#9d7aff'; // 等高线 / 方向导数
  var GREEN = '#4ade80';  // 最速方向 / 结论

  var course = {
    id: 'gradient',
    title: '方向导数与梯度',
    summary: '∇f 指向函数增长最快的方向，且垂直于等高线。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><g stroke="#9d7aff" stroke-width="1" fill="none" opacity="0.5"><ellipse cx="100" cy="56" rx="60" ry="35"/><ellipse cx="100" cy="56" rx="40" ry="23"/><ellipse cx="100" cy="56" rx="20" ry="11"/></g><line x1="100" y1="56" x2="145" y2="30" stroke="#4f9cf9" stroke-width="2.5"/><polygon points="145,30 138,32 140,38" fill="#4f9cf9"/><circle cx="100" cy="56" r="4" fill="#ff8c42"/><text x="100" y="100" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">∇f ⊥ 等高线</text></svg>',

    steps: [
      // ===== Step 1：梯度的定义 =====
      {
        title: '梯度的定义',
        narrative: `偏导数 $\\partial f/\\partial x$ 和 $\\partial f/\\partial y$ 分别给出沿坐标轴的变化率。
把它们**组装成一个向量**，就是**梯度**：

$$\\nabla f = \\left(\\frac{\\partial f}{\\partial x},\\; \\frac{\\partial f}{\\partial y}\\right)$$

符号 $\\nabla$（nabla）像一个倒三角，读作"del"。

**例子**：$f(x,y) = x^2 + y^2$。
$$\\nabla f = (2x,\\; 2y)$$

在点 $(1, 2)$ 处，$\\nabla f = (2, 4)$——一个指向右上的向量。

梯度的**模长** $|\\nabla f| = \\sqrt{(2x)^2 + (2y)^2}$ 表示该点**最大变化率**的大小。
等高线越密的地方，$|\\nabla f|$ 越大（坡越陡）。

右侧演示 $f = x^2 + y^2$ 的梯度场（紫色箭头）叠在等高线上。
每个点的箭头都**指向远离原点**的方向（函数值增大的方向），长度与距原点距离成正比。
拖动观察点，看该点梯度向量的方向与大小。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-3, 3] },
          layers: [
            // 等高线
            { type: 'contour', fn: 'x^2 + y^2', levels: [1, 3, 6, 10], nx: 70, ny: 60, color: '#3a4452', lineWidth: 1, opacity: 0.5 },
            // 梯度场 ∇f = (2x, 2y)
            { type: 'vectorField', dx: '2*x', dy: '2*y', nx: 10, ny: 8, color: PURPLE, lineWidth: 1.2 },
            // 观察点
            { type: 'point', x: 1.5, y: 1, color: ORANGE, radius: 6, label: 'P' },
            // 该点梯度向量（蓝色粗箭头）
            { type: 'line', from: [1.5, 1], to: [2.5, 2.4], color: BLUE, lineWidth: 3 },
            { type: 'text', x: -3.2, y: 2.7, text: '∇f=(2x,2y) 指向外（增大方向）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -3.2, y: 2.3, text: 'P 处 ∇f=(3,2), |∇f|=3.6', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'px', label: '观察点 x', type: 'slider', min: -2.5, max: 2.5, step: 0.1, value: 1.5 },
          { name: 'py', label: '观察点 y', type: 'slider', min: -2.5, max: 2.5, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'px' && name !== 'py') return;
          var x = name === 'px' ? value : scene.layers[2].x;
          var y = name === 'py' ? value : scene.layers[2].y;
          scene.layers[2].x = x;
          scene.layers[2].y = y;
          // 梯度 (2x, 2y)
          scene.layers[3].from = [x, y];
          scene.layers[3].to = [x + 2 * x * 0.2, y + 2 * y * 0.2];
          var gx = 2 * x, gy = 2 * y;
          var mag = Math.sqrt(gx * gx + gy * gy);
          scene.layers[5].text = 'P 处 ∇f=(' + gx.toFixed(1) + ',' + gy.toFixed(1) + '), |∇f|=' + mag.toFixed(2);
        },
      },

      // ===== Step 2：梯度垂直于等高线 =====
      {
        title: '梯度垂直于等高线',
        narrative: `梯度最重要的几何性质：

> **梯度向量处处垂直于过该点的等高线，指向函数值增大的方向。**

为什么？等高线 $f(x,y) = c$ 上移动时 $f$ 不变，所以沿等高线方向的方向导数为 0。
而方向导数 $= \\nabla f \\cdot \\mathbf{u}$，为 0 意味着 $\\nabla f \\perp \\mathbf{u}$（等高线切方向）。

**推论**：梯度方向是 $f$ **变化最快**的方向。
- 沿 $\\nabla f$ 方向走：$f$ 增大最快（上山最快）
- 沿 $-\\nabla f$ 方向走：$f$ 减小最快（下山最快）

右侧演示。紫色是 $f = x^2 + y^2$ 的等高线（同心圆），蓝色箭头是观察点处的梯度。
注意蓝色箭头**始终沿半径方向**（垂直于圆），指向外（增大方向）。

拖动观察点绕一圈，梯度始终**法向于**等高线——这就是"梯度是等高线的法向量"。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-3, 3] },
          layers: [
            { type: 'contour', fn: 'x^2 + y^2', levels: [0.5, 2, 5, 9], nx: 70, ny: 60, color: PURPLE, lineWidth: 1.3, opacity: 0.7 },
            // 观察点
            { type: 'point', x: 2, y: 0, color: ORANGE, radius: 6, label: 'P' },
            // 梯度向量（法向于等高线）
            { type: 'line', from: [2, 0], to: [2.8, 0], color: BLUE, lineWidth: 3 },
            // 等高线切线（水平，与梯度垂直）
            { type: 'line', from: [1.7, 0.5], to: [2.3, -0.5], color: GREEN, lineWidth: 1.5 },
            { type: 'text', x: -3.2, y: 2.7, text: '蓝:∇f（⊥等高线）  绿:等高线切线', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -3.2, y: 2.3, text: '梯度 ⊥ 切线，验证 ∇f·u=0', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'angle', label: '观察角度（弧度）', type: 'slider', min: 0, max: 6.28, step: 0.1, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'angle') return;
          // 在半径 2 的圆上移动观察点
          var r = 2;
          var x = r * Math.cos(value);
          var y = r * Math.sin(value);
          scene.layers[1].x = x;
          scene.layers[1].y = y;
          // 梯度方向 = 径向外
          var scale = 0.4;
          scene.layers[2].from = [x, y];
          scene.layers[2].to = [x + x * scale, y + y * scale];
          // 等高线切线（垂直于径向）
          var tx = -y / r, ty = x / r;
          scene.layers[3].from = [x - tx * 0.4, y - ty * 0.4];
          scene.layers[3].to = [x + tx * 0.4, y + ty * 0.4];
        },
      },

      // ===== Step 3：方向导数 =====
      {
        title: '方向导数',
        narrative: `梯度给的是"最大变化率"，但有时我们关心**某个特定方向**的变化率——**方向导数**：

$$D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u} = |\\nabla f| \\cos\\theta$$

其中 $\\mathbf{u}$ 是单位方向向量，$\\theta$ 是 $\\nabla f$ 与 $\\mathbf{u}$ 的夹角。

- $\\theta = 0$（沿梯度方向）：$D_{\\mathbf{u}} f = |\\nabla f|$（最大，正值）
- $\\theta = \\pi$（反梯度方向）：$D_{\\mathbf{u}} f = -|\\nabla f|$（最大负值，下降最快）
- $\\theta = \\pi/2$（沿等高线）：$D_{\\mathbf{u}} f = 0$（不变化）

右侧演示。蓝色是梯度方向，绿色是任意方向 $\\mathbf{u}$（拖动 $\\theta$ 滑块改变）。
橙色数字显示当前方向导数值 $= |\\nabla f|\\cos\\theta$。
当绿色箭头转到与蓝色重合（$\\theta=0$）时方向导数最大。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-3, 3] },
          layers: [
            { type: 'contour', fn: 'x^2 + y^2', levels: [1, 4, 9], nx: 60, ny: 50, color: '#3a4452', lineWidth: 1, opacity: 0.4 },
            // 观察点
            { type: 'point', x: 1.5, y: 1, color: ORANGE, radius: 5, label: 'P' },
            // 梯度方向（蓝色）
            { type: 'line', from: [1.5, 1], to: [2.4, 2.2], color: BLUE, lineWidth: 3 },
            // 任意方向 u（绿色，初始 θ=0 与梯度重合）
            { type: 'line', from: [1.5, 1], to: [2.4, 2.2], color: GREEN, lineWidth: 2 },
            { type: 'text', x: -3.2, y: 2.7, text: '蓝:∇f  绿:方向 u  θ=夹角', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -3.2, y: 2.3, text: 'D_u f = |∇f|cos θ = 3.61', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'theta', label: '方向角 θ（弧度）', type: 'slider', min: 0, max: 6.28, step: 0.1, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'theta') return;
          var px = 1.5, py = 1;
          var gx = 2 * px, gy = 2 * py;
          var gmag = Math.sqrt(gx * gx + gy * gy);
          var gangle = Math.atan2(gy, gx);
          // 方向 u 的角度 = 梯度角度 + θ
          var uangle = gangle + value;
          var ulen = 1.2;
          scene.layers[3].to = [px + Math.cos(uangle) * ulen, py + Math.sin(uangle) * ulen];
          var Duf = gmag * Math.cos(value);
          scene.layers[5].text = 'D_u f = |∇f|cos(' + value.toFixed(2) + ') = ' + Duf.toFixed(2);
        },
      },

      // ===== Step 4：应用——最速下降 =====
      {
        title: '应用：最速下降法',
        narrative: `梯度的最经典应用——**最速下降法**（梯度下降）：

> 想找 $f$ 的最小值？每一步沿 $-\\nabla f$ 方向走，走到梯度为 0 为止。

$$\\mathbf{x}_{n+1} = \\mathbf{x}_n - \\alpha \\, \\nabla f(\\mathbf{x}_n)$$

$\\alpha$ 是步长。当 $\\nabla f = 0$ 时停止——那是极值点（驻点）。

**为什么有效？** 因为 $-\\nabla f$ 是 $f$ 下降最快的方向。每走一步都"最贪婪地"降低 $f$。

**应用场景**：
- 机器学习：训练神经网络 = 最小化损失函数 $L(\\mathbf{w})$
- 物理：小球在曲面上滚到最低点
- 优化：找最优参数

右侧演示 $f = x^2 + y^2$（碗形）的最速下降路径。从起点沿 $-\\nabla f$ 走，
路径是**一条直线指向原点**（因为梯度始终径向）。绿色折线是下降轨迹，蓝色箭头是各点梯度。

> 注意：最速下降对椭圆形等高线（条件数大）会**之字形震荡**，这是其收敛慢的原因。`,

        scene: {
          axes: { xRange: [-3.5, 3.5], yRange: [-3, 3] },
          layers: [
            { type: 'contour', fn: 'x^2 + y^2', levels: [0.3, 1, 3, 6, 10], nx: 70, ny: 60, color: PURPLE, lineWidth: 1, opacity: 0.5 },
            // 梯度场
            { type: 'vectorField', dx: '-2*x*0.3', dy: '-2*y*0.3', nx: 8, ny: 6, color: '#3a4452', lineWidth: 1 },
            // 下降路径（4 段折线，由 φ 滑块重算）
            { type: 'line', from: [2.5, 0], to: [1.6, 0], color: GREEN, lineWidth: 2.5 },
            { type: 'line', from: [1.6, 0], to: [0.96, 0], color: GREEN, lineWidth: 2.5 },
            { type: 'line', from: [0.96, 0], to: [0.38, 0], color: GREEN, lineWidth: 2.5 },
            { type: 'line', from: [0.38, 0], to: [0, 0], color: GREEN, lineWidth: 2.5 },
            // 起点
            { type: 'point', x: 2.5, y: 0, color: ORANGE, radius: 5, label: '起点' },
            // 终点（最小值）
            { type: 'point', x: 0, y: 0, color: BLUE, radius: 6, label: 'min f' },
            { type: 'text', x: -3.2, y: 2.7, text: '绿:最速下降路径  蓝:最小值点', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -3.2, y: 2.3, text: '沿 -∇f 走到 ∇f=0', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -3.2, y: 1.9, text: '拖 φ 换起点：路径恒指向原点', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'phi', label: '起点角度 φ', type: 'slider', min: 0, max: 6.28, step: 0.1, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'phi') return;
          var r0 = 2.5;
          // f=x²+y² 的 -∇f 径向指向原点，路径是直线，每步乘 (1-α)，取 α≈0.36
          var decay = [0.64, 0.64 * 0.64, 0.64 * 0.64 * 0.64, 0.64 * 0.64 * 0.64 * 0.64];
          var sx = r0 * Math.cos(value), sy = r0 * Math.sin(value);
          // 4 段折线：依次衰减
          var pts = [[sx, sy]];
          for (var i = 0; i < 4; i++) pts.push([sx * decay[i], sy * decay[i]]);
          scene.layers[2].from = pts[0]; scene.layers[2].to = pts[1];
          scene.layers[3].from = pts[1]; scene.layers[3].to = pts[2];
          scene.layers[4].from = pts[2]; scene.layers[4].to = pts[3];
          scene.layers[5].from = pts[3]; scene.layers[5].to = pts[4];
          scene.layers[6].x = sx; scene.layers[6].y = sy;
          scene.layers[6].label = '起点(' + sx.toFixed(2) + ',' + sy.toFixed(2) + ')';
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
