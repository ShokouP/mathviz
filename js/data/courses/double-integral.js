/**
 * mathviz — js/data/courses/double-integral.js
 * 课案：二重积分（北大高数 §10.1-10.2，批次 3 第三套）。
 *
 * 四步：
 *   1. 二重积分的概念    曲顶柱体体积 = ∬ f(x,y) dA
 *   2. 累次积分（矩形域）  ∫∫ = ∫[∫f dy]dx，先内后外
 *   3. 一般区域上的积分    型区域（X型/Y型）
 *   4. 极坐标下的二重积分  ∬ f·r dr dθ，圆形域的利器
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 曲面/积分区域
  var ORANGE = '#ff8c42'; // 切片/标记
  var PURPLE = '#9d7aff'; // 等高线/极坐标
  var GREEN = '#4ade80';  // 体积填充/结论

  var course = {
    id: 'double-integral',
    title: '二重积分',
    summary: '从曲边梯形面积到曲顶柱体体积——积分从一维升到二维。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M30 85 Q70 30 100 45 T170 55 L170 85 L30 85 Z" fill="#4ade80" opacity="0.25"/><path d="M30 85 Q70 30 100 45 T170 55" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><line x1="30" y1="85" x2="170" y2="85" stroke="#ff8c42" stroke-width="1.5"/><line x1="70" y1="85" x2="70" y2="55" stroke="#ff8c42" stroke-width="1" stroke-dasharray="3 2"/><text x="100" y="20" fill="#e6edf3" font-size="12" text-anchor="middle" font-family="sans-serif">∬ f(x,y) dA = V</text></svg>',

    steps: [
      // ===== Step 1：二重积分的概念 =====
      {
        title: '曲顶柱体的体积',
        narrative: `定积分 $\\int_a^b f(x)\\,dx$ 算的是曲线下方的**面积**。
二重积分把它推广到二元函数——算的是曲面下方的**体积**（曲顶柱体）：

$$\\iint_D f(x,y)\\,dA = \\lim \\sum f(x_i, y_j)\\,\\Delta A$$

把区域 $D$ 切成无数小格 $\\Delta A$，每格上立一根高 $\\approx f(x,y)$ 的柱子，
所有柱子体积求和取极限——就是曲面 $z = f(x,y)$ 与 $xy$ 平面之间的体积。

**几何意义**：$f > 0$ 时是"山顶"在 $xy$ 平面上方的体积；
$f < 0$ 时是"坑"在平面下方的体积（取负）。

右侧演示 $f(x,y) = 4 - x^2 - y^2$（倒置抛物面）在方形域上的体积。
等高线（紫色同心圆）显示函数值的分布，绿色填充表示积分区域。
拖动 $n$ 滑块增加网格密度，看离散求和如何逼近连续体积。

> 一元积分是"切竖条"，二元积分是"切小方块"——本质相同，只是维度升高。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-2, 2] },
          layers: [
            // f = 4-x²-y² 的等高线
            { type: 'contour', fn: '4 - x^2 - y^2', levels: [0.5, 1.5, 2.5, 3.5], nx: 70, ny: 60, color: PURPLE, lineWidth: 1.3, opacity: 0.6 },
            // 积分域矩形 [-1.5,1.5]×[-1,1] 边界
            { type: 'line', from: [-1.5, -1], to: [1.5, -1], color: GREEN, lineWidth: 2 },
            { type: 'line', from: [1.5, -1], to: [1.5, 1], color: GREEN, lineWidth: 2 },
            { type: 'line', from: [1.5, 1], to: [-1.5, 1], color: GREEN, lineWidth: 2 },
            { type: 'line', from: [-1.5, 1], to: [-1.5, -1], color: GREEN, lineWidth: 2 },
            // 网格分割示意（用 point 画网格点）
            { type: 'text', x: -2.3, y: 1.7, text: '紫:等高线  绿:积分域', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.3, y: 1.3, text: '网格越密→体积越精确', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'n', label: '网格密度 n', type: 'slider', min: 3, max: 12, step: 1, value: 5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'n') return;
          var n = Math.round(value);
          if (n < 1) n = 1; // 保护:n=0 会导致除零,网格至少 1×1
          // 在积分域 [-1.5,1.5]×[-1,1] 上画 n×n 网格点
          var pts = [];
          for (var i = 0; i <= n; i++) {
            for (var j = 0; j <= n; j++) {
              var x = -1.5 + 3 * i / n;
              var y = -1 + 2 * j / n;
              pts.push({ type: 'point', x: x, y: y, color: ORANGE, radius: 1.8 });
            }
          }
          // 保留前 7 个固定层，替换网格点
          scene.layers = scene.layers.slice(0, 7).concat(pts);
        },
      },

      // ===== Step 2：累次积分（矩形域） =====
      {
        title: '累次积分：先内后外',
        narrative: `二重积分怎么算？**化成两次一元积分**——累次积分：

$$\\iint_D f(x,y)\\,dA = \\int_a^b \\left[ \\int_c^d f(x,y)\\,dy \\right] dx$$

**口诀**："先积的变量对应**内层**积分，后积的对应**外层**"。

- 内层 $\\int_c^d f(x,y)\\,dy$：固定 $x$，对 $y$ 积分，得到一个关于 $x$ 的函数
- 外层 $\\int_a^b [\\cdots]\\,dx$：再对这个函数积 $x$

**例子**：$\\int_0^1 \\int_0^1 (x+y)\\,dy\\,dx$
- 内层：$\\int_0^1 (x+y)\\,dy = [xy + y^2/2]_0^1 = x + 1/2$
- 外层：$\\int_0^1 (x+1/2)\\,dx = [x^2/2 + x/2]_0^1 = 1$

右侧演示这个过程。蓝色竖条表示"固定 $x$，对 $y$ 积分"的那一刀切面，
橙色横轴是 $x$ 的外层积分范围。拖动 $x$ 滑块移动竖条，理解"先内后外"。`,

        scene: {
          axes: { xRange: [-0.5, 2.5], yRange: [-0.5, 2.5] },
          layers: [
            // 积分域 [0,1]×[0,1]
            { type: 'line', from: [0, 0], to: [1, 0], color: GREEN, lineWidth: 2 },
            { type: 'line', from: [1, 0], to: [1, 1], color: GREEN, lineWidth: 2 },
            { type: 'line', from: [1, 1], to: [0, 1], color: GREEN, lineWidth: 2 },
            { type: 'line', from: [0, 1], to: [0, 0], color: GREEN, lineWidth: 2 },
            // 竖条（固定 x，对 y 积分的切面）
            { type: 'line', from: [0.5, 0], to: [0.5, 1], color: BLUE, lineWidth: 3 },
            // 面积填充示意
            { type: 'areaFill', fn: '1', range: [0.45, 0.55], color: 'rgba(79,156,249,0.2)' },
            { type: 'point', x: 0.5, y: 0, color: ORANGE, radius: 4, label: 'x=0.5' },
            { type: 'text', x: 1.5, y: 2.2, text: '蓝:内层∫dy的切面', color: BLUE, fontSize: 12, align: 'left' },
            { type: 'text', x: 1.5, y: 1.8, text: '绿:积分域 [0,1]×[0,1]', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: 1.5, y: 1.4, text: '先积dy（竖条），再积dx', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '内层切面 x', type: 'slider', min: 0, max: 1, step: 0.05, value: 0.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[4].from = [value, 0];
          scene.layers[4].to = [value, 1];
          scene.layers[5].range = [value - 0.05, value + 0.05];
          scene.layers[6].x = value;
          scene.layers[6].label = 'x=' + value.toFixed(2);
        },
      },

      // ===== Step 3：一般区域 =====
      {
        title: '一般区域：X型与Y型',
        narrative: `积分域不总是矩形。对一般区域，分两种类型：

**X型区域**：$a \\le x \\le b$，$\\varphi_1(x) \\le y \\le \\varphi_2(x)$
$$\\iint_D f\\,dA = \\int_a^b \\int_{\\varphi_1(x)}^{\\varphi_2(x)} f\\,dy\\,dx$$
上下边界是 $x$ 的函数，竖条从下边界扫到上边界。

**Y型区域**：$c \\le y \\le d$，$\\psi_1(y) \\le x \\le \\psi_2(y)$
$$\\iint_D f\\,dA = \\int_c^d \\int_{\\psi_1(y)}^{\\psi_2(y)} f\\,dx\\,dy$$
左右边界是 $y$ 的函数，横条从左扫到右。

**选择原则**：哪种类型让内层积分更好算就用哪种。有些区域必须分块处理。

右侧演示一个 X 型区域：$0 \\le x \\le 2$，$0 \\le y \\le x^2/2$（抛物线下方）。
绿色边界画出区域，蓝色竖条从 $y=0$ 扫到 $y=x^2/2$。
拖动 $x$ 滑块，竖条高度随 $x^2/2$ 变化。`,

        scene: {
          axes: { xRange: [-0.5, 2.5], yRange: [-0.5, 2.5] },
          layers: [
            // 区域填充
            { type: 'areaFill', fn: 'x^2/2', range: [0, 2], color: 'rgba(74,222,128,0.15)' },
            // 上边界 y=x²/2
            { type: 'plot', fn: 'x^2/2', color: GREEN, lineWidth: 2.5, range: [0, 2], samples: 60 },
            // 下边界 y=0
            { type: 'line', from: [0, 0], to: [2, 0], color: GREEN, lineWidth: 2 },
            // 竖边界
            { type: 'line', from: [2, 0], to: [2, 2], color: GREEN, lineWidth: 1.5 },
            // 竖条
            { type: 'line', from: [1, 0], to: [1, 0.5], color: BLUE, lineWidth: 3 },
            { type: 'point', x: 1, y: 0.5, color: ORANGE, radius: 4, label: '上界=x²/2' },
            { type: 'text', x: 1.5, y: 2.2, text: 'X型: 0≤y≤x²/2', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: 1.5, y: 1.8, text: '蓝:竖条从0扫到x²/2', color: BLUE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '竖条位置 x', type: 'slider', min: 0.1, max: 1.9, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var yTop = value * value / 2;
          scene.layers[4].from = [value, 0];
          scene.layers[4].to = [value, yTop];
          scene.layers[5].x = value;
          scene.layers[5].y = yTop;
          scene.layers[5].label = '上界=' + yTop.toFixed(2);
        },
      },

      // ===== Step 4：极坐标下的二重积分 =====
      {
        title: '极坐标：圆形域的利器',
        narrative: `当积分域是**圆、环、扇形**时，直角坐标的累次积分很痛苦。
换**极坐标**则化繁为简：

$$\\iint_D f(x,y)\\,dA = \\int_{\\alpha}^{\\beta} \\int_0^{r(\\theta)} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta$$

**关键**：面积微元 $dA = r\\,dr\\,d\\theta$（多了一个 $r$！），不是简单的 $dr\\,d\\theta$。
这是因为极坐标的小格面积 $\\approx r\\,\\Delta r\\,\\Delta\\theta$（外圈比内圈宽）。

**经典例子**：求圆 $x^2+y^2 \\le R^2$ 上的 $\\iint \\sqrt{x^2+y^2}\\,dA$。

极坐标下 $\\sqrt{x^2+y^2} = r$，域是 $0 \\le r \\le R$，$0 \\le \\theta \\le 2\\pi$：
$$\\int_0^{2\\pi}\\int_0^R r \\cdot r\\,dr\\,d\\theta = 2\\pi \\cdot \\frac{R^3}{3} = \\frac{2\\pi R^3}{3}$$

直角坐标算这个会非常痛苦，极坐标三行搞定。

右侧用 parametric 画极坐标网格（紫色同心圆 + 辐射线），
绿色是圆形积分域 $r \\le 1.5$。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-2, 2] },
          layers: [
            // 同心圆（极坐标网格）
            { type: 'parametric', fx: '0.5*cos(t)', fy: '0.5*sin(t)', tRange: [0, 6.2832], color: PURPLE, lineWidth: 1, opacity: 0.4 },
            { type: 'parametric', fx: '1.0*cos(t)', fy: '1.0*sin(t)', tRange: [0, 6.2832], color: PURPLE, lineWidth: 1, opacity: 0.4 },
            // 积分域圆 r=1.5
            { type: 'parametric', fx: '1.5*cos(t)', fy: '1.5*sin(t)', tRange: [0, 6.2832], color: GREEN, lineWidth: 2.5 },
            // 当前扫描的辐射线（由 θ 滑块控制）
            { type: 'line', from: [0, 0], to: [1.5, 0], color: ORANGE, lineWidth: 2.5 },
            // 当前辐射线外端点
            { type: 'point', x: 1.5, y: 0, color: ORANGE, radius: 5, label: 'r=1.5' },
            // 标注
            { type: 'point', x: 0, y: 0, color: ORANGE, radius: 3 },
            { type: 'text', x: 1.6, y: 0.2, text: 'r=1.5', color: GREEN, fontSize: 11 },
            { type: 'text', x: -2.3, y: 1.7, text: 'dA = r·dr·dθ（注意多一个r）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.3, y: 1.3, text: 'θ=0.00  扫描圆域：先 r 后 θ', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'theta', label: '扫描角度 θ', type: 'slider', min: 0, max: 6.28, step: 0.05, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'theta') return;
          var th = value;
          var R = 1.5;
          var ex = R * Math.cos(th), ey = R * Math.sin(th);
          // 当前辐射线
          scene.layers[3].to = [ex, ey];
          scene.layers[4].x = ex;
          scene.layers[4].y = ey;
          scene.layers[4].label = 'r=' + R + ' θ=' + th.toFixed(2);
          // 此辐射线上的微元累积：∫₀ᴿ r·dr = R²/2（每条辐射贡献的"面积积分"）
          var rayContrib = R * R / 2;
          scene.layers[7].text = 'θ=' + th.toFixed(2) + '（' + (th * 180 / Math.PI).toFixed(0) + '°）  此射线面积微元和=' + rayContrib.toFixed(3);
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
