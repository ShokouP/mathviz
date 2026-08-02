/**
 * mathviz — js/data/courses/polar-parametric.js
 * 课案：极坐标与参数方程（§1.5）。
 *
 * 四步：
 *   1. 极坐标概念          (r,θ) 与直角坐标 (x,y) 的相互转换
 *   2. 极坐标方程的图形    玫瑰线 / 心形线
 *   3. 参数方程概念        摆线 —— 圆周上一点滚出的轨迹
 *   4. 参数方程画曲线      参数化的统一视角
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。
 *   parametric 原语：{ type:'parametric', fx, fy, tRange:[a,b], samples, color }
 *   变量统一用 t（parametric）或 x（plot）。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 极坐标曲线 / 主曲线
  var ORANGE = '#ff8c42'; // 摆线 / 强调
  var PURPLE = '#9d7aff'; // 玫瑰线 / 第二色
  var GREEN = '#4ade80';  // 心形线 / 结论

  var course = {
    id: 'polar-parametric',
    title: '极坐标与参数方程',
    summary: '换个坐标描述世界——用角度与半径，用第三个变量串起整条曲线。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><polyline points="128.0,56.0 127.3,57.9 125.3,59.6 122.2,60.7 118.0,61.2 113.2,60.8 107.9,59.5 102.6,57.4 97.5,54.4 93.0,50.9 89.3,47.0 86.5,43.0 84.8,39.2 84.3,35.8 84.7,33.3 86.0,31.8 88.0,31.4 90.4,32.3 93.0,34.5 95.5,37.8 97.6,42.2 99.1,47.4 99.9,53.1 99.9,58.9 99.1,64.6 97.6,69.8 95.5,74.2 93.0,77.5 90.4,79.7 88.0,80.6 86.0,80.2 84.7,78.7 84.3,76.2 84.8,72.8 86.5,69.0 89.3,65.0 93.0,61.1 97.5,57.6 102.6,54.6 107.9,52.5 113.2,51.2 118.0,50.8 122.2,51.3 125.3,52.4 127.3,54.1 128.0,56.0" fill="none" stroke="#9d7aff" stroke-width="1.8"/><line x1="100" y1="56" x2="128" y2="56" stroke="#ff8c42" stroke-width="1.5"/><line x1="100" y1="56" x2="100" y2="84" stroke="#4f9cf9" stroke-width="1.5"/><circle cx="100" cy="56" r="2" fill="#4ade80"/><text x="100" y="98" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">极坐标 ↔ 参数方程</text></svg>',

    steps: [
      // ===== Step 1：极坐标概念 =====
      {
        title: '极坐标概念',
        narrative: `直角坐标用"横纵两个距离"$(x, y)$ 定位一点。但自然界有很多运动是**绕一个中心旋转**的——行星绕日、雷达扫描、磁场分布、花朵的花瓣。这时更自然的是**极坐标**：给定一个极点 $O$ 与极轴，用**半径 $r$** 和**角度 $\\theta$** 来定位：

$$x = r\\cos\\theta, \\quad y = r\\sin\\theta$$
$$r = \\sqrt{x^2 + y^2}, \\quad \\theta = \\arctan\\frac{y}{x}$$

同一组 $(x,y)$，可以对应多组 $(r,\\theta)$：$\\theta$ 与 $\\theta + 2\\pi$ 指向同一点，甚至 $r<0$ 也合法（沿反方向延伸）。这种"多对一"恰恰让很多曲线的方程**骤然变简单**。圆心在原点的圆，直角坐标下是 $x^2+y^2=R^2$，极坐标下只是一行 $r=R$；而射线 $\\theta=\\theta_0$ 在直角坐标下要分段描述。

**何时该换极坐标？** 看对称性。若问题关于某点呈**旋转对称**（圆、环、扇形、花瓣），极坐标几乎总是更顺手；若是关于直线对称（抛物线、矩形），直角坐标更直接。选对坐标系，是解题的第一步智慧。

右侧演示：橙色是极径 $r$，紫色弧是极角 $\\theta$ 的扫掠，紫色点是 $(r\\cos\\theta, r\\sin\\theta)$。拖动 $r$ 与 $\\theta$ 两个滑块，看 $(r,\\theta)$ 如何在平面游走，并对照它对应的直角坐标读数。`,

        scene: {
          axes: { xRange: [-2.8, 2.8], yRange: [-2.2, 2.2] },
          layers: [
            // 参考圆（半径=当前 r）
            { type: 'parametric', fx: '1.5*cos(t)', fy: '1.5*sin(t)', tRange: [0, 6.2832], color: '#3a4452', lineWidth: 1 },
            // 角度扫掠扇形边界（两条半径 + 弧），用 line 近似
            { type: 'line', from: [0, 0], to: [1.5, 0], color: '#3a4452', lineWidth: 1 },
            // 极径 r（橙色）
            { type: 'line', from: [0, 0], to: [1.5, 0], color: ORANGE, lineWidth: 2.5 },
            // 角度弧（紫色）半径 0.5
            { type: 'parametric', fx: '0.5*cos(t)', fy: '0.5*sin(t)', tRange: [0, 0], color: PURPLE, lineWidth: 2 },
            // 极轴
            { type: 'line', from: [-2.6, 0], to: [2.6, 0], color: '#3a4452', lineWidth: 1, dashed: true },
            // 点 P
            { type: 'point', x: 1.5, y: 0, color: PURPLE, radius: 6, label: 'P' },
            { type: 'point', x: 0, y: 0, color: ORANGE, radius: 4, label: 'O' },
            { type: 'text', x: -2.7, y: 2.0, text: '橙:r 极径  紫:θ 极角', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.7, y: 1.6, text: 'P = (r·cosθ, r·sinθ)', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'r', label: '极径 r', type: 'slider', min: 0.2, max: 2.2, step: 0.05, value: 1.5 },
          { name: 'theta', label: '极角 θ（弧度）', type: 'slider', min: -3.14, max: 3.14, step: 0.05, value: 0 },
        ],
        onControl: function (name, value, scene) {
          var r = (name === 'r') ? value : scene._r;
          var th = (name === 'theta') ? value : scene._theta;
          r = (r === undefined) ? 1.5 : r;
          th = (th === undefined) ? 0 : th;
          scene._r = r; scene._theta = th;
          var px = r * Math.cos(th), py = r * Math.sin(th);
          // 参考圆（layers[0]）半径跟随 r
          scene.layers[0].fx = r + '*cos(t)';
          scene.layers[0].fy = r + '*sin(t)';
          scene.layers[0]._fx = null; scene.layers[0]._fy = null; // 清缓存重编译
          // 极径终点 = P
          scene.layers[2].to = [px, py];
          // 角度弧范围 [0, θ]（处理负角）
          scene.layers[3].tRange = [0, th];
          // P 点坐标
          scene.layers[5].x = px; scene.layers[5].y = py;
          scene.layers[8].text = 'P = (' + px.toFixed(2) + ', ' + py.toFixed(2) + ')   r=' + r.toFixed(2) + ' θ=' + th.toFixed(2);
        },
      },

      // ===== Step 2：极坐标方程的图形 =====
      {
        title: '极坐标方程的图形',
        narrative: `把 $r$ 写成 $\\theta$ 的函数 $r = r(\\theta)$，就得到一条**极坐标曲线**。两个最经典的例子：

**玫瑰线** $r = a\\cos(n\\theta)$。当 $n$ 为奇数，画出 $n$ 片花瓣；当 $n$ 为偶数，画出 $2n$ 片花瓣。图中紫色是 $r = 3\\cos(3\\theta)$——三瓣花。它的参数化就是把极坐标"翻译"成直角坐标：$x = r\\cos\\theta$，$y = r\\sin\\theta$，让 $\\theta$ 从 $0$ 跑到 $2\\pi$，点 $(x,y)$ 便自动描出花瓣。

**心形线（cardioid）** $r = a(1 - \\cos\\theta)$，绿色那条。它像一颗倒置的心，是"一个圆在另一个相等的圆外缘滚动时，圆上一点的轨迹"——与下一页的摆线同源。心形线在声学、天线方向图中频频出现，因为它有明确的"指向"：尖端朝向极轴方向，开口背向极轴。

注意玫瑰线让 $\\theta$ 跑过 $[0, 2\\pi]$，但由于 $\\cos(3\\theta)$ 的对称性，曲线会**重复经过**某些花瓣——这正是极坐标"多对一"的体现，方程虽短，却蕴含丰富的对称信息。

拖动滑块在玫瑰线与心形线之间切换，体会同一族方程如何绽放出截然不同的形状——这便是极坐标语言的简洁之美。`,

        scene: {
          axes: { xRange: [-4.8, 2.2], yRange: [-3.2, 3.2] },
          layers: [
            // 默认显示玫瑰线 r=3cos(3θ)
            { type: 'parametric', fx: '3*cos(3*t)*cos(t)', fy: '3*cos(3*t)*sin(t)', tRange: [0, 6.2832], samples: 400, color: PURPLE, lineWidth: 2.5 },
            // 极轴参考
            { type: 'line', from: [-4.6, 0], to: [2, 0], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'line', from: [0, -3], to: [0, 3], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'text', x: -4.7, y: 2.9, text: '玫瑰线 r = 3cos(3θ)', color: PURPLE, fontSize: 12, align: 'left' },
            { type: 'text', x: -4.7, y: 2.4, text: '极坐标方程 → 参数化', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'curve', label: '曲线（0=玫瑰线 1=心形线）', type: 'slider', min: 0, max: 1, step: 1, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'curve') return;
          var L = scene.layers;
          if (Math.round(value) === 0) {
            // 玫瑰线
            L[0].fx = '3*cos(3*t)*cos(t)';
            L[0].fy = '3*cos(3*t)*sin(t)';
            L[3].text = '玫瑰线 r = 3cos(3θ)';
            L[3].color = PURPLE;
            L[0].color = PURPLE;
          } else {
            // 心形线 r = 2(1 - cos θ)
            L[0].fx = '2*(1-cos(t))*cos(t)';
            L[0].fy = '2*(1-cos(t))*sin(t)';
            L[3].text = '心形线 r = 2(1-cosθ)';
            L[3].color = GREEN;
            L[0].color = GREEN;
          }
          L[0]._fx = null; L[0]._fy = null; // 清缓存重编译
        },
      },

      // ===== Step 3：参数方程概念（摆线） =====
      {
        title: '参数方程概念：摆线',
        narrative: `有些曲线**根本不是函数**——一个 $x$ 对应多个 $y$，或者根本没有 $y = f(x)$ 的简洁表达（比如一条打结的闭合曲线）。这时引入**第三个变量 $t$**（常表时间），让 $x$、$y$ 都由 $t$ 决定：

$$x = x(t), \\quad y = y(t)$$

$t$ 跑过一段区间，$(x(t), y(t))$ 就描出一条轨迹。这就是**参数方程**。它把"形状问题"变成"运动问题"——比起死抠"哪个 $y$ 对应哪个 $x$"，跟踪一个动点要自然得多。

最经典的例子是**摆线（cycloid）**：一个轮子在直线上**无滑动地滚动**，轮缘上一点描出的轨迹。设轮半径 $a$，滚动角 $t$，则

$$x = a(t - \\sin t), \\quad y = a(1 - \\cos t)$$

每滚一圈画出一个"拱"，拱底贴地、拱顶高 $2a$。摆线有惊人的性质：**沿摆线下滑的物体，无论起点在哪儿，到达拱底的时间相同**（最速下降曲线，brachistochrone）——这是变分法的开山之作，伽利略猜错、伯努利兄弟证对的著名问题。

右侧橙色是摆线（$a=1$），紫色虚线圆是滚动的轮子，绿色描点就是轮缘上的那一点。拖动 $t$ 看轮子如何"画出"摆线：轮心的水平速度恒定，但描点在拱底**瞬时贴地、在拱顶几乎平飞**——这正是 $\\sin t$、$\\cos t$ 项带来的精妙节奏。`,

        scene: {
          axes: { xRange: [-1, 9], yRange: [-0.6, 2.8] },
          layers: [
            // 地面
            { type: 'line', from: [-0.8, 0], to: [8.8, 0], color: '#3a4452', lineWidth: 1.5 },
            // 完整摆线（淡色参考）a=1
            { type: 'parametric', fx: 't-sin(t)', fy: '1-cos(t)', tRange: [0, 8.0], samples: 300, color: ORANGE, lineWidth: 2.2, opacity: 0.35 },
            // 已画出的部分（高亮）
            { type: 'parametric', fx: 't-sin(t)', fy: '1-cos(t)', tRange: [0, 3.0], samples: 200, color: ORANGE, lineWidth: 2.8 },
            // 滚动的轮子（半径1），圆心在 (t, 1)
            { type: 'parametric', fx: '3+cos(t)', fy: '1+sin(t)', tRange: [0, 6.2832], samples: 80, color: PURPLE, lineWidth: 1.5, dashed: true },
            // 描点（轮缘点）→ 即摆线在当前 t 的点
            { type: 'point', x: 3, y: 2, color: GREEN, radius: 6, label: '描点' },
            // 轮心
            { type: 'point', x: 3, y: 1, color: PURPLE, radius: 4 },
            // 轮心到描点的半径线
            { type: 'line', from: [3, 1], to: [3, 2], color: PURPLE, lineWidth: 1.5 },
            { type: 'text', x: -0.8, y: 2.6, text: '摆线 x=t-sin t, y=1-cos t', color: ORANGE, fontSize: 11, align: 'left' },
            { type: 'text', x: -0.8, y: 2.2, text: '轮子滚动 → 轮缘描出拱形', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 't', label: '滚动角 t', type: 'slider', min: 0, max: 8, step: 0.05, value: 3 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 't') return;
          var t = value;
          var cx = t, cy = 1;
          // 描点：x=t-sin t, y=1-cos t
          var px = t - Math.sin(t), py = 1 - Math.cos(t);
          // 高亮已画出部分 [0, t]
          scene.layers[2].tRange = [0, t];
          // 轮子圆心 (t, 1)
          scene.layers[3].fx = t + '+cos(t)';
          scene.layers[3].fy = '1+sin(t)';
          scene.layers[3]._fx = null; scene.layers[3]._fy = null;
          // 描点
          scene.layers[4].x = px; scene.layers[4].y = py;
          // 轮心
          scene.layers[5].x = cx; scene.layers[5].y = cy;
          // 半径线
          scene.layers[6].from = [cx, cy];
          scene.layers[6].to = [px, py];
        },
      },

      // ===== Step 4：参数方程画曲线 =====
      {
        title: '参数方程画曲线',
        narrative: `参数方程的威力在于：它统一了**所有曲线**的描述方式。前面三页的三条曲线——极坐标的转换、玫瑰线、摆线——本质上都是参数方程 $\\big(x(t), y(t)\\big)$ 的特例。一旦会画参数曲线，就拥有了表达任意轨迹的通用语言。

**圆**：$x=\\cos t,\\ y=\\sin t$；**椭圆**：$x=a\\cos t,\\ y=b\\sin t$；**利萨如曲线**：$x=\\sin(3t),\\ y=\\sin(2t)$（示波器上的经典花纹）；**螺线**：$x=t\\cos t,\\ y=t\\sin t$（半径随角度增长，向外旋开）。圆、椭圆、玫瑰线、心形线、摆线，全都可以写成 $\\big(x(t),y(t)\\big)$——参数方程是它们的"最大公约数"。

更深的用途：当 $t$ 表时间，$(x(t),y(t))$ 就是物体的**运动轨迹**，导数 $\\big(x'(t),y'(t)\\big)$ 是速度向量，二阶导是加速度。于是几何（曲线的形状）与物理（质点的运动）通过参数方程**无缝衔接**——这是后续学习曲线弧长、曲率、矢量微积分的共同入口。

右侧演示利萨如曲线 $x=3\\sin(3t),\\ y=3\\sin(2t)$（蓝色）。两个方向的频率比 $3:2$ 决定了它绕几圈后**精确闭合**。拖动滑块改变 $y$ 的频率 $n$，看花纹如何从椭圆 $\\to$ 抛物线状 $\\to$ 复杂网格——这正是示波器上两个正弦信号叠加时出现的图案，工程师据此读出两个信号的频率比。`,

        scene: {
          axes: { xRange: [-3.8, 3.8], yRange: [-3.5, 3.5] },
          layers: [
            // 利萨如曲线 x=3sin(3t), y=3sin(2t)（默认 n=2）
            { type: 'parametric', fx: '3*sin(3*t)', fy: '3*sin(2*t)', tRange: [0, 6.2832], samples: 600, color: BLUE, lineWidth: 2.2 },
            // 参考轴
            { type: 'line', from: [-3.5, 0], to: [3.5, 0], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'line', from: [0, -3.3], to: [0, 3.3], color: '#3a4452', lineWidth: 1, dashed: true },
            { type: 'text', x: -3.6, y: 3.2, text: '利萨如 x=3sin(3t), y=3sin(2t)', color: BLUE, fontSize: 11, align: 'left' },
            { type: 'text', x: -3.6, y: 2.7, text: '频率比 3:2 → 闭合花纹', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'n', label: 'y 的频率 n', type: 'slider', min: 1, max: 5, step: 1, value: 2 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'n') return;
          var n = Math.round(value);
          scene.layers[0].fy = '3*sin(' + n + '*t)';
          scene.layers[0]._fy = null; // 清缓存重编译
          scene.layers[3].text = '利萨如 x=3sin(3t), y=3sin(' + n + 't)';
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
