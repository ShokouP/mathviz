/**
 * mathviz — js/data/courses/convexity.js
 * 课案：函数的凹凸与拐点（北大高数 §4.5，批次 2 第二套）。
 *
 * 四步：
 *   1. 凹凸的几何直觉    曲线"开口朝上/下"，切线在曲线下方/上方
 *   2. 二阶导判别        f''>0 凹，f''<0 凸，f''=0 拐点候选
 *   3. 拐点              凹凸改变的点
 *   4. 应用              詹森不等式、最优化直觉
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 函数曲线
  var ORANGE = '#ff8c42'; // 切线 / 标记
  var PURPLE = '#9d7aff'; // 二阶导 / 辅助
  var GREEN = '#4ade80';  // 拐点 / 结论

  var course = {
    id: 'convexity',
    title: '函数的凹凸与拐点',
    summary: '二阶导的符号决定曲线弯曲方向——凹如碗、凸如拱。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M20 95 Q60 20 100 30 T180 90" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><line x1="40" y1="80" x2="160" y2="80" stroke="#ff8c42" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="100" cy="30" r="4" fill="#4ade80"/><text x="100" y="20" fill="#e6edf3" font-size="11" text-anchor="middle" font-family="sans-serif">拐点</text></svg>',

    steps: [
      // ===== Step 1：凹凸的几何直觉 =====
      {
        title: '凹凸的几何直觉',
        narrative: `观察一条曲线的**弯曲方向**，有两种基本情况：

- **凹（concave up，开口朝上）**：像碗底，能"盛水"。切线在曲线**下方**。
- **凸（concave down，开口朝下）**：像拱顶，会"漏水"。切线在曲线**上方**。

直观判断：把曲线想象成马路。
- 凹：你在谷底开车，左右两边都比你高（**笑脸** $\smile$）
- 凸：你在山顶开车，左右两边都比你低（**哭脸** $\frown$）

右侧蓝色是 $f(x) = x^3$。橙色虚线是切线。拖动 $x$ 滑块从左移到右：
- $x < 0$：切线在曲线上方 → **凸**（哭脸）
- $x > 0$：切线在曲线下方 → **凹**（笑脸）
- $x = 0$：凹凸切换的临界点——这就是**拐点**。

注意：凹凸描述的是"弯曲方向"，和函数**增减**无关。$x^3$ 一直递增，但弯曲方向在原点改变。`,

        scene: {
          axes: { xRange: [-2.5, 2.5], yRange: [-5, 5] },
          layers: [
            // f = x^3
            { type: 'plot', fn: 'x^3', color: BLUE, lineWidth: 2.5, range: [-2.2, 2.2], samples: 80 },
            // 切线（初始 x=1）
            { type: 'tangent', fn: 'x^3', at: 1, color: ORANGE, dashed: true, halfLen: 1.5, lineWidth: 2 },
            // 切点
            { type: 'point', x: 1, y: 1, color: ORANGE, radius: 5, label: '切点' },
            // 拐点（原点）
            { type: 'point', x: 0, y: 0, color: GREEN, radius: 5, label: '拐点' },
            { type: 'text', x: -2, y: 4, text: 'x<0: 凸（哭脸）  x>0: 凹（笑脸）', color: '#9aa7b4', fontSize: 12, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '切点 x', type: 'slider', min: -2, max: 2, step: 0.1, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[1].at = value;
          scene.layers[2].x = value;
          scene.layers[2].y = value * value * value;
          // 标注当前凹凸
          var convexity = value < 0 ? '凸（切线在上方）' : (value > 0 ? '凹（切线在下方）' : '拐点');
          scene.layers[4].text = 'x=' + value.toFixed(1) + ': ' + convexity;
        },
      },

      // ===== Step 2：二阶导判别 =====
      {
        title: '二阶导判别法',
        narrative: `凹凸可以用导数精确描述——而且用的是**二阶导** $f''(x)$：

> - $f''(x) > 0$ $\\Rightarrow$ $f$ 在该区间**凹**（concave up）
> - $f''(x) < 0$ $\\Rightarrow$ $f$ 在该区间**凸**（concave down）

**为什么？** 一阶导 $f'$ 是切线斜率。凹意味着"切线斜率在**增大**"（曲线越走越陡），
而斜率增大就是 $(f')' = f'' > 0$。同理，凸意味着斜率减小，$f'' < 0$。

**例子**：$f(x) = x^4 - 2x^2$。
- $f''(x) = 12x^2 - 4$
- $f'' > 0$ 当 $|x| > 1/\\sqrt{3} \\approx 0.577$ → 凹
- $f'' < 0$ 当 $|x| < 0.577$ → 凹中间夹着一段凸

右侧蓝色是 $f = x^4 - 2x^2$，紫色是二阶导 $f'' = 12x^2 - 4$。
紫色在 0 轴**上方**时蓝色凹、**下方**时蓝色凸。
拖动 $x$ 滑块，看紫线（二阶导）的符号如何决定蓝线的弯曲方向。`,

        scene: {
          axes: { xRange: [-2, 2], yRange: [-3, 5] },
          layers: [
            // f = x^4 - 2x^2
            { type: 'plot', fn: 'x^4 - 2*x^2', color: BLUE, lineWidth: 2.5, range: [-1.8, 1.8], samples: 100 },
            // f'' = 12x^2 - 4
            { type: 'plot', fn: '12*x^2 - 4', color: PURPLE, lineWidth: 2, range: [-1.8, 1.8], samples: 80 },
            // y=0 参照线
            { type: 'line', from: [-2, 0], to: [2, 0], color: '#3a4452', lineWidth: 1 },
            // 观察线
            { type: 'line', from: [0.5, -3], to: [0.5, 5], color: ORANGE, dashed: true, lineWidth: 1 },
            { type: 'text', x: -1.8, y: 4.5, text: '蓝:f=x⁴-2x²  紫:f″=12x²-4', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 0.7, y: -2.5, text: '紫>0→蓝凹 / 紫<0→蓝凸', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -1.7, max: 1.7, step: 0.05, value: 0.5 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[3].from = [value, -3];
          scene.layers[3].to = [value, 5];
        },
      },

      // ===== Step 3：拐点 =====
      {
        title: '拐点：凹凸的转折',
        narrative: `**拐点**（inflection point）是曲线凹凸改变的点。

> $x_0$ 是拐点 $\\iff$ $f''$ 在 $x_0$ 左右**变号**。

寻找拐点的步骤：
1. 求 $f''(x)$，找 $f''(x) = 0$ 或 $f''$ 不存在的点
2. 检查这些点**左右两侧** $f''$ 的符号是否相反
3. 若相反，则是拐点；若同号（如 $f(x) = x^4$ 在 $x=0$），**不是**拐点

**经典例子**：$f(x) = x^3$。
$f''(x) = 6x$，在 $x=0$ 处 $f''=0$。左侧 $f''<0$（凸）、右侧 $f''>0$（凹），变号 → **是拐点**。

**反例**：$f(x) = x^4$。
$f''(x) = 12x^2 \\geq 0$，在 $x=0$ 处 $f''=0$，但左右都 $\\geq 0$（都凹），**不变号 → 不是拐点**。
$x^4$ 在原点只是"平坦了一下"，弯曲方向没变。

右侧对比：蓝色 $x^3$（有拐点），橙色 $x^4$（无拐点）。
绿色标记 $x^3$ 的拐点（原点）。注意 $x^4$ 经过原点时弯曲方向不变。`,

        scene: {
          axes: { xRange: [-1.8, 1.8], yRange: [-3, 5] },
          layers: [
            // x^3（有拐点）
            { type: 'plot', fn: 'x^3', color: BLUE, lineWidth: 2.5, range: [-1.5, 1.5], samples: 80 },
            // x^4（无拐点，缩放显示）
            { type: 'plot', fn: 'x^4', color: ORANGE, lineWidth: 2.5, range: [-1.5, 1.5], samples: 80 },
            // 拐点标记
            { type: 'point', x: 0, y: 0, color: GREEN, radius: 6, label: 'x³ 的拐点' },
            // 参照线
            { type: 'line', from: [-1.8, 0], to: [1.8, 0], color: '#3a4452', lineWidth: 1 },
            // 观察竖线
            { type: 'line', from: [0.8, -3], to: [0.8, 5], color: PURPLE, dashed: true, lineWidth: 1 },
            { type: 'text', x: -1.6, y: 4.2, text: '蓝:x³（有拐点）  橙:x⁴（无拐点）', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -1.6, y: 3.5, text: 'x³：f″=6x 变号；x⁴：f″=12x²≥0 不变号', color: GREEN, fontSize: 11, align: 'left' },
            { type: 'text', x: -1.6, y: 2.8, text: 'x=0.8：x³ 的 f″=4.80，x⁴ 的 f″=7.68', color: PURPLE, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'x', label: '观察点 x', type: 'slider', min: -1.4, max: 1.4, step: 0.05, value: 0.8 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x') return;
          scene.layers[4].from = [value, -3];
          scene.layers[4].to = [value, 5];
          var f3pp = 6 * value;       // (x³)″
          var f4pp = 12 * value * value; // (x⁴)″
          scene.layers[7].text = 'x=' + value.toFixed(2) + '：x³ 的 f″=' + f3pp.toFixed(2) + '，x⁴ 的 f″=' + f4pp.toFixed(2);
        },
      },

      // ===== Step 4：应用 =====
      {
        title: '凹凸的应用',
        narrative: `凹凸性不只是分类标签，它有强大的实际应用。

**1. 极值的第二判别法**
若 $f'(x_0) = 0$（驻点），看二阶导：
- $f''(x_0) > 0$（凹）$\\Rightarrow$ **极小值**（碗底）
- $f''(x_0) < 0$（凸）$\\Rightarrow$ **极大值**（山顶）
- $f''(x_0) = 0$ $\\Rightarrow$ 无法判定（需用更高阶或第一判别法）

**2. 詹森不等式（Jensen 不等式）**
对凹函数 $f$（$f''>0$）：
$$f\\!\\left(\\frac{x_1 + x_2}{2}\\right) \\leq \\frac{f(x_1) + f(x_2)}{2}$$

直觉：凹函数图像在**割线下方**，所以"中点的函数值"不超过"函数值的中点"。
这是信息论（熵）、概率论（期望不等式）、经济学的基石。

**3. 最优化直觉**
凹函数的局部极小就是全局极小；凸函数的局部极大就是全局极大。
机器学习的"凸优化"之所以好解，正是因为凸函数没有"假低谷"。

右侧演示詹森不等式：蓝色凹曲线 $f(x) = x^2$，橙色割线连接 $(−1,1)$ 和 $(1,1)$。
中点 $x=0$ 处，$f(0)=0 \\leq \\frac{f(-1)+f(1)}{2} = 1$（绿色标记）。**凹函数在割线下方**。`,

        scene: {
          axes: { xRange: [-1.8, 1.8], yRange: [-0.5, 2.5] },
          layers: [
            // f = x²（凹）
            { type: 'plot', fn: 'x^2', color: BLUE, lineWidth: 2.5, range: [-1.5, 1.5], samples: 60 },
            // 割线 (-a, a²) 到 (a, a²)，a 由滑块控制
            { type: 'line', from: [-1, 1], to: [1, 1], color: ORANGE, lineWidth: 2 },
            // 端点
            { type: 'point', x: -1, y: 1, color: ORANGE, radius: 4 },
            { type: 'point', x: 1, y: 1, color: ORANGE, radius: 4 },
            // 中点函数值（凹曲线下方）
            { type: 'point', x: 0, y: 0, color: GREEN, radius: 5, label: 'f(中点)=0' },
            // 中点割线值
            { type: 'point', x: 0, y: 1, color: ORANGE, radius: 5, label: '割线中点=1' },
            { type: 'line', from: [0, 0], to: [0, 1], color: GREEN, dashed: true, lineWidth: 1.5 },
            { type: 'text', x: -1.6, y: 2.2, text: '蓝:f=x²（凹）  橙:割线', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: 0.2, y: 0.5, text: 'f(中点) ≤ 割线中点（詹森）', color: GREEN, fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'a', label: '割线半宽 a（端点 ±a）', type: 'slider', min: 0.3, max: 1.5, step: 0.05, value: 1 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'a') return;
          var a = value;
          var fa = a * a; // f(±a)=a²
          // 割线两端
          scene.layers[1].from = [-a, fa];
          scene.layers[1].to = [a, fa];
          scene.layers[2].x = -a; scene.layers[2].y = fa;
          scene.layers[3].x = a; scene.layers[3].y = fa;
          // 中点割线值 = a²（f(中点)=f(0)=0 恒定）
          scene.layers[5].y = fa;
          scene.layers[5].label = '割线中点=' + fa.toFixed(2);
          scene.layers[6].from = [0, 0];
          scene.layers[6].to = [0, fa];
          // 验证詹森：0 ≤ a² 恒成立
          scene.layers[8].text = 'f(0)=0 ≤ 割线中点=' + fa.toFixed(2) + '（差 ' + fa.toFixed(2) + '）';
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
