/**
 * mathviz — js/data/courses/curvature.js
 * 课案：曲率（§4.6）。
 *
 * 四步：
 *   1. 弧微分      ds = √(1+f'²) dx，弧长元素的几何来源
 *   2. 曲率的定义  κ = |dα/ds|，切线倾角随弧长的变化率
 *   3. 曲率公式    κ = |y''| / (1+y'²)^(3/2)
 *   4. 曲率圆      密切圆，半径 ρ = 1/κ，圆心在主法线上
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。
 *   parametric 原语画曲率圆：{ type:'parametric', fx, fy, tRange:[0,2π], ... }
 *   变量统一用 t（parametric）或 x（plot）。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 主曲线
  var ORANGE = '#ff8c42'; // 切线 / 标记 / ds
  var PURPLE = '#9d7aff'; // 二阶导 / 曲率函数 / 角度
  var GREEN = '#4ade80';  // 曲率圆 / 结论

  var course = {
    id: 'curvature',
    title: '曲率',
    summary: '曲线弯曲有多厉害——用切线转角除以弧长，κ=|dα/ds|=|y″|/(1+y′²)^(3/2)。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M18 92 Q70 88 100 60 T182 26" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><circle cx="124" cy="41" r="2.6" fill="#ff8c42"/><circle cx="124" cy="41" r="18" fill="none" stroke="#4ade80" stroke-width="1.6" stroke-dasharray="3 3"/><line x1="124" y1="41" x2="124" y2="23" stroke="#9d7aff" stroke-width="1.4"/><line x1="96" y1="60" x2="152" y2="22" stroke="#ff8c42" stroke-width="1.4" stroke-dasharray="4 3"/><text x="100" y="104" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">κ = |dα/ds|</text></svg>',

    steps: [
      // ===== Step 1：弧微分 =====
      {
        title: '弧微分：弧长元素',
        narrative: `要度量曲线的弯曲，先得会量曲线的**长度**。但曲线长不能像直线那样"两端一连"得到，得把它切成无数小段，每段近似成直线，再把长度加起来取极限——这就是**弧长积分**的思路。而它的微分形式，就是**弧微分** $ds$。

考察曲线上相邻两点，横坐标差 $dx$，纵坐标差 $dy = f'(x)\\,dx$。当这一段足够小，它就近乎一条直角三角形的斜边：

$$ds^2 = dx^2 + dy^2 \\;\\Rightarrow\\; ds = \\sqrt{1 + f'(x)^2}\\,dx$$

这就是弧微分公式。它的几何画面非常实在：$dx$ 是水平的底边，$dy$ 是竖直的高，$ds$ 是贴着曲线的那条斜边。无论曲线多弯，**就地把这一小段当成直线**，斜边长就是 $ds$。

注意 $ds \\geq dx$ 永远成立——曲线总比它在水平方向的投影长，多出来的部分来自 $f'$。$f'$ 越大（越陡），$\\sqrt{1+f'^2}$ 越大，$ds$ 偏离 $dx$ 越远。在水平的切点处 $f'=0$，$ds=dx$，二者重合。

右侧蓝色是 $f(x)=\\sin x$，橙色小三角直观显示 $dx$（水平）、$dy$（竖直）、$ds$（沿曲线的斜边）。拖动 $x$ 滑块，观察三角形的形状如何随曲线陡缓变化：在峰谷处 $f'=0$，三角形"压扁"成水平线；在最陡处 $|f'|$ 最大，$ds$ 最长。`,
        scene: {
          axes: { xRange: [-3.6, 3.6], yRange: [-1.8, 1.8] },
          layers: [
            // f = sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-3.4, 3.4], samples: 160 },
            // ds 斜边（沿切线方向），初始 x=1
            { type: 'line', from: [1, 1.8415], to: [1.5, 1.8415], color: ORANGE, lineWidth: 2.5 },
            // dx 水平边
            { type: 'line', from: [1, 1.8415], to: [1.5, 1.8415], color: ORANGE, lineWidth: 1.5, dashed: true },
            // dy 竖直边
            { type: 'line', from: [1.5, 1.8415], to: [1.5, 1.3989], color: ORANGE, lineWidth: 1.5, dashed: true },
            // 切点
            { type: 'point', x: 1, y: 0.8415, color: ORANGE, radius: 5, label: 'P' },
            { type: 'text', x: -3.5, y: 1.6, text: 'ds = √(1+f′²) dx', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -3.5, y: 1.2, text: '橙斜边=ds  虚横=dx  虚竖=dy', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '点 x', type: 'slider', min: -3.2, max: 3.2, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x0 = value;
          var fx = Math.sin(x0);
          var dfx = Math.cos(x0);          // f'(x)
          var h = 0.5;                     // 局部三角形宽度
          // 斜边端点（沿切线方向走 h）：(x0+h, f(x0)+f'*h)
          var xb = x0 + h, yb = fx + dfx * h;
          // layers[1] ds 斜边：从切点到切线上的延伸点
          scene.layers[1].from = [x0, fx];
          scene.layers[1].to = [xb, yb];
          // layers[2] dx 水平边：从切点到 (xb, fx)
          scene.layers[2].from = [x0, fx];
          scene.layers[2].to = [xb, fx];
          // layers[3] dy 竖直边：从 (xb, fx) 到 (xb, yb)
          scene.layers[3].from = [xb, fx];
          scene.layers[3].to = [xb, yb];
          // 切点
          scene.layers[4].x = x0;
          scene.layers[4].y = fx;
          // 读数
          var ds = Math.sqrt(1 + dfx * dfx) * h;
          scene.layers[6].text = 'ds = √(1+f′²) dx   |  f′=' + dfx.toFixed(2) + '  ds=' + ds.toFixed(2);
        },
      },

      // ===== Step 2：曲率的定义 =====
      {
        title: '曲率的定义：切线转角 / 弧长',
        narrative: `直不直、弯多狠，怎么量化？关键观察：**弯曲越厉害，切线方向转得越快**。一条直线，切线方向从头到尾不变，根本不弯；一个急弯，走一小段切线就转过大角度。

设曲线在 $P$ 点的切线与 $x$ 轴正向夹角为 $\\alpha$（即 $\\tan\\alpha = f'(x)$）。当动点从 $P$ 沿曲线走过一小段弧长 $\\Delta s$ 到达 $P'$，切线倾角变成 $\\alpha+\\Delta\\alpha$。定义 $P$ 点的**曲率**：

$$\\kappa = \\left|\\frac{d\\alpha}{ds}\\right|$$

即"单位弧长上切线倾角的平均变化率的绝对值"。它刻画"走过单位长度，方向转了多少"。$\\kappa$ 越大，弯得越急。

两个极端帮助建立直觉：
- **直线**：$\\alpha$ 恒定，$d\\alpha=0$，故 $\\kappa=0$——完全不弯。
- **半径 $R$ 的圆**：走弧长 $ds=R\\,d\\alpha$，故 $\\kappa=d\\alpha/ds=1/R$。圆越小（$R$ 越小）弯得越急，$\\kappa$ 越大；这与"小圆急转、大圆缓转"的直觉完全吻合。圆是**处处曲率相同**的唯一曲线。

右侧蓝色是 $f(x)=\\sin x$，橙色是切线，紫色弧标出倾角 $\\alpha$。拖动 $x$ 滑块：在峰谷附近曲线近乎平直、切线几乎不转（$\\kappa$ 小）；在拐点附近切线转得最快（$\\kappa$ 大）。曲率描述的正是这种"局部急弯"的程度。`,
        scene: {
          axes: { xRange: [-3.6, 3.6], yRange: [-1.8, 1.8] },
          layers: [
            // f = sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-3.4, 3.4], samples: 160 },
            // 极轴参考
            { type: 'line', from: [-3.4, 0], to: [3.4, 0], color: '#3a4452', lineWidth: 1, dashed: true },
            // 切线（橙色），初始 x=1
            { type: 'tangent', fn: 'sin(x)', at: 1, color: ORANGE, dashed: true, halfLen: 1.2, lineWidth: 2 },
            // 倾角弧 α（紫色）半径 0.5，从极轴扫到切线方向
            { type: 'parametric', fx: '0.5*cos(t)', fy: '0.5*sin(t)', tRange: [0, 0.7854], color: PURPLE, lineWidth: 2 },
            // 切点
            { type: 'point', x: 1, y: 0.8415, color: ORANGE, radius: 5, label: 'P' },
            { type: 'text', x: -3.5, y: 1.6, text: 'κ = |dα/ds|', color: GREEN, fontSize: 12, align: 'left' },
            { type: 'text', x: -3.5, y: 1.2, text: 'α = 切线倾角 = atan(f′)', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '点 x', type: 'slider', min: -3.2, max: 3.2, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x0 = value;
          var fx = Math.sin(x0);
          var dfx = Math.cos(x0);                   // f'(x) = tan(α)
          var alpha = Math.atan(dfx);               // 切线倾角
          // 切线
          scene.layers[2].at = x0;
          // 倾角弧：从 0 扫到 α（参数化半径 0.5，圆心在原点）
          scene.layers[3].tRange = [0, alpha];
          // 切点
          scene.layers[4].x = x0;
          scene.layers[4].y = fx;
          // 读数
          var deg = (alpha * 180 / Math.PI).toFixed(1);
          scene.layers[6].text = 'α = atan(f′) = ' + deg + '°   (f′=' + dfx.toFixed(2) + ')';
        },
      },

      // ===== Step 3：曲率公式 =====
      {
        title: '曲率公式：κ = |y″| / (1+y′²)^(3/2)',
        narrative: `把定义 $\\kappa=|d\\alpha/ds|$ 展开，就得到便于计算的**显式公式**。关键是用 $x$ 作自变量，把 $\\alpha$ 和 $s$ 都表成 $x$ 的函数：

- $\\tan\\alpha = f'(x)$，两边对 $x$ 求导得 $\\sec^2\\alpha\\,d\\alpha = f''(x)\\,dx$，即 $d\\alpha = \\dfrac{f''(x)}{1+f'(x)^2}\\,dx$；
- 又 $ds = \\sqrt{1+f'(x)^2}\\,dx$。

两式相除（取绝对值）：

$$\\boxed{\\;\\kappa = \\frac{|f''(x)|}{\\bigl(1+f'(x)^2\\bigr)^{3/2}}\\;}$$

这就是曲率计算公式。它只用到一阶、二阶导，无需真的去测弧长。分母 $(1+f'^2)^{3/2}$ 表明：曲线越陡（$|f'|$ 大），同一 $|f''|$ 带来的曲率越小——因为"陡着走"时，竖直方向的弯折被长长的斜边稀释了。

几个标志性例子：
- **直线** $f=ax+b$：$f''=0\\Rightarrow\\kappa=0$。
- **抛物线** $f=x^2$：在顶点 $f'=0,f''=2\\Rightarrow\\kappa=2$（最弯）；越往两边越平坦。
- **圆** $x^2+y^2=R^2$：处处 $\\kappa=1/R$，与定义一致。

右侧蓝色是 $f=\\sin x$，紫色是按上式算出的曲率 $\\kappa(x)$（放大显示）。紫色越高，蓝色在该点弯得越急。注意 $\\sin x$ 在**拐点**（$x=0,\\pm\\pi$）处 $f''=0\\Rightarrow\\kappa=0$——拐点恰恰是"瞬时变直"的地方。拖动 $x$ 滑块，对照紫线高低体会局部弯曲的强弱。`,
        scene: {
          axes: { xRange: [-3.6, 3.6], yRange: [-1.8, 1.8] },
          layers: [
            // f = sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-3.4, 3.4], samples: 160 },
            // κ(x) = |−sin x| / (1+cos²x)^(3/2)，放大 4 倍便于观察
            { type: 'plot', fn: '4*abs(-sin(x))/(1+cos(x)^2)^1.5', color: PURPLE, lineWidth: 2, range: [-3.4, 3.4], samples: 160 },
            // y=0 参照线
            { type: 'line', from: [-3.4, 0], to: [3.4, 0], color: '#3a4452', lineWidth: 1 },
            // 观察线
            { type: 'line', from: [1, -1.8], to: [1, 1.8], color: ORANGE, dashed: true, lineWidth: 1 },
            // 观察点
            { type: 'point', x: 1, y: 0.8415, color: ORANGE, radius: 5 },
            { type: 'text', x: -3.5, y: 1.6, text: '蓝:f=sin x   紫:κ(x)×4', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -3.5, y: 1.2, text: 'κ=|y″|/(1+y′²)^(3/2)', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -3.2, max: 3.2, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x0 = value;
          var fx = Math.sin(x0);
          // 观察线
          scene.layers[3].from = [x0, -1.8];
          scene.layers[3].to = [x0, 1.8];
          // 观察点
          scene.layers[4].x = x0;
          scene.layers[4].y = fx;
          // 计算 κ 数值（用于读数）
          var dfx = Math.cos(x0);
          var ddfx = -Math.sin(x0);
          var kappa = Math.abs(ddfx) / Math.pow(1 + dfx * dfx, 1.5);
          scene.layers[6].text = 'κ=' + kappa.toFixed(3) + '   ρ=1/κ=' + (1 / kappa > 999 ? '∞' : (1 / kappa).toFixed(2));
        },
      },

      // ===== Step 4：曲率圆与曲率半径 =====
      {
        title: '曲率圆与曲率半径',
        narrative: `曲率有了，就能给曲线在每个点配一个"最贴身的圆"——**曲率圆**（又称密切圆，osculating circle）。它的定义是：

- **半径** $\\rho = \\dfrac{1}{\\kappa}$（曲率半径，曲率越大半径越小）；
- **圆心**在曲线的**凹侧**，位于该点的主法线上，到该点距离恰为 $\\rho$。

这个圆与曲线在该点**二阶相切**：不仅经过同一点、有相同切线，还有相同的二阶导（相同的弯曲方向与程度）。因此在这一点附近，没有任何圆比它更贴近曲线——用曲率圆局部代替曲线，是工程与物理里常用的近似（如道路弯道设计、轨道受力分析）。

圆心坐标可由法向量推出。对 $y=f(x)$，在点 $(x_0,f(x_0))$ 处（设 $f''(x_0)\\neq 0$）：

$$\\text{圆心} = \\left(x_0 - \\frac{f'(x_0)\\bigl(1+f'(x_0)^2\\bigr)}{f''(x_0)},\\; f(x_0) + \\frac{1+f'(x_0)^2}{f''(x_0)}\\right)$$

当 $f''>0$（凹）圆心在曲线上方，$f''<0$（凸）在下方——自动落在凹侧。

两个直觉：抛物线顶点处弯得最急、曲率圆最小；越往两边越平坦、圆越来越大，趋于"半径无穷大的圆"即直线。直线的曲率圆就是它自己（$\\rho=\\infty$）。

右侧蓝色是 $f=x^2$，绿色虚线圆是该点的曲率圆，橙色是切线、紫色是法线（指向圆心）。拖动 $x$ 滑块从顶点向两侧移动：顶点处圆最小最紧贴，越往两边圆越大越平，到远处几乎与直线无异——这正是"曲率刻画局部弯曲"的最直观体现。`,
        scene: {
          axes: { xRange: [-3, 3], yRange: [-0.6, 4.2] },
          layers: [
            // f = x^2
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2.5, range: [-1.8, 1.8], samples: 120 },
            // 曲率圆（parametric）默认 x0=0：圆心 (0, 0.5)，半径 0.5
            { type: 'parametric', fx: '0.5*cos(t)', fy: '0.5+0.5*sin(t)', tRange: [0, 6.2832], samples: 120, color: GREEN, lineWidth: 2, dashed: true },
            // 切线（橙色）默认 x0=0：水平
            { type: 'line', from: [-0.6, 0], to: [0.6, 0], color: ORANGE, lineWidth: 2 },
            // 法线（紫色）从切点指向圆心
            { type: 'line', from: [0, 0], to: [0, 0.5], color: PURPLE, lineWidth: 1.8, dashed: true },
            // 切点 P
            { type: 'point', x: 0, y: 0, color: ORANGE, radius: 5, label: 'P' },
            // 曲率中心 C
            { type: 'point', x: 0, y: 0.5, color: GREEN, radius: 4, label: 'C' },
            { type: 'text', x: -2.9, y: 3.9, text: '蓝:f=x²   绿虚:曲率圆', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -2.9, y: 3.4, text: 'ρ=1/κ，圆心在凹侧法线上', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '点 x', type: 'slider', min: -0.6, max: 0.6, step: 0.02, value: 0 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          var x0 = value;
          var fx = x0 * x0;           // f = x^2
          var dfx = 2 * x0;            // f' = 2x
          var ddfx = 2;                // f'' = 2
          var D = 1 + dfx * dfx;       // 1 + f'^2
          // 曲率与半径
          var kappa = Math.abs(ddfx) / Math.pow(D, 1.5);
          var rho = 1 / kappa;         // = D^1.5 / 2
          // 圆心（f''=2>0，落在凹侧即曲线上方）
          var cx = x0 - dfx * D / ddfx;
          var cy = fx + D / ddfx;
          // 曲率圆参数化
          scene.layers[1].fx = cx + '+' + rho + '*cos(t)';
          scene.layers[1].fy = cy + '+' + rho + '*sin(t)';
          scene.layers[1]._fx = null; scene.layers[1]._fy = null; // 清缓存重编译
          // 切线：沿切线方向走 ±0.6
          scene.layers[2].from = [x0 - 0.6, fx + dfx * (-0.6)];
          scene.layers[2].to = [x0 + 0.6, fx + dfx * 0.6];
          // 法线：从切点指向圆心
          scene.layers[3].from = [x0, fx];
          scene.layers[3].to = [cx, cy];
          // 切点 / 圆心
          scene.layers[4].x = x0; scene.layers[4].y = fx;
          scene.layers[5].x = cx; scene.layers[5].y = cy;
          // 读数
          scene.layers[7].text = 'ρ=' + rho.toFixed(2) + '   κ=' + kappa.toFixed(3) + '   C=(' + cx.toFixed(2) + ',' + cy.toFixed(2) + ')';
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
