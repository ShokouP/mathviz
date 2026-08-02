/**
 * mathviz — js/data/courses/taylor.js
 * 课案 4：泰勒级数（3b1b 名篇）
 *
 * 主线：从"用常数值模仿一个函数"出发，一阶一阶地让多项式吞噬原函数，
 *       再揭示收敛半径的边界，最后强调泰勒展开是"局部"逼近。
 *
 * 颜色约定：
 *   原函数曲线  plot  #4f9cf9（主蓝）
 *   泰勒多项式  taylor #9d7aff（紫，引擎默认色）
 *   标记/辅助   point/line/text #ff8c42（橙）或半透明白
 *
 * 控件 bind 说明：引擎 setPath 仅识别点路径（按 '.' 切分，数字段作数组下标），
 *   故用 "layers.1.order" 而非 "layers[1].order"。步骤 4 需联动多个 layer，
 *   改用 step.onControl(name, v, scene) 手动 mutate 拷贝后的 scene。
 */
(function () {
  'use strict';

  // 主蓝：原函数；紫：泰勒多项式；橙：标记点
  const BLUE = '#4f9cf9';
  const PURPLE = '#9d7aff';
  const ORANGE = '#ff8c42';

  const course = {
    id: 'taylor',
    title: '泰勒级数',
    summary: '用一串多项式逐阶吞噬一个函数',
    coverSVG: '<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="120" height="70" fill="#0d1117"/>' +
      '<line x1="10" y1="35" x2="110" y2="35" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>' +
      '<line x1="60" y1="8" x2="60" y2="62" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>' +
      '<path d="M12,35 C26,12 40,58 60,35 C80,12 94,58 108,35" fill="none" stroke="' + BLUE + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M28,35 Q60,6 92,35" fill="none" stroke="' + PURPLE + '" stroke-width="2" stroke-dasharray="3.5,2.5" stroke-linecap="round"/>' +
      '<circle cx="60" cy="35" r="2.4" fill="' + ORANGE + '"/>' +
      '</svg>',

    steps: [
      // ============================================================
      // 步骤 1：0 阶与 1 阶逼近（f=sin x，x₀=0）
      // ============================================================
      {
        title: '从一条水平线到一条切线',
        narrative:
'泰勒级数想回答一个朴素的问题：**能不能用一串简单的多项式，去模仿任意一个复杂的函数？**\n\n' +
'多项式是数学里最"听话"的孩子——只有加减乘除，没有极限、没有无穷。但只要它学得够像，那些难缠的函数就都能用多项式来近似计算。\n\n' +
'我们请出老朋友 $f(x)=\\sin(x)$，把"模仿的舞台"钉在原点 $x_0=0$。\n\n' +
'最朴素的模仿是 **0 阶逼近**——只问一件事：在 $x_0$ 这一点，函数值是多少？ $\\sin(0)=0$。那好，就让多项式处处等于这个值：\n\n' +
'$$T_0(x) = f(x_0)$$\n\n' +
'这就是一条水平线（把下方"阶数"滑块拨到 **0** 看看，紫线贴着 x 轴）。\n\n' +
'但水平线显然太懒了。把滑块拨到 **1**，紫线立刻倾斜起来——这是 **1 阶逼近**，它额外要求一阶导数（斜率）也和原函数一致：\n\n' +
'$$T_1(x) = f(x_0) + f\'(x_0)\\,(x-x_0)$$\n\n' +
'这正是 $\\sin(x)$ 在原点的切线，方程就是 $y=x$。再拨到 **2**，紫线开始弯曲，连二阶导（凹凸）也对上了。\n\n' +
'**每升一阶，多项式就多学会一个"姿势"。**',
        scene: {
          axes: { xRange: [-4, 4], yRange: [-2, 2] },
          layers: [
            // 0: 原函数 sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5 },
            // 1: 泰勒多项式（阶数由滑块控制）
            { type: 'taylor', fn: 'sin(x)', at: 0, order: 1, color: PURPLE, lineWidth: 2.5 },
            // 2: 展开点标记
            { type: 'point', x: 0, y: 0, radius: 5, color: ORANGE, label: 'x₀=0' },
            // 3: 图例
            { type: 'text', x: -3.7, y: 1.7, text: 'sin(x)', color: BLUE, fontSize: 13, align: 'left' },
            { type: 'text', x: -3.7, y: 1.3, text: 'T_n(x)', color: PURPLE, fontSize: 13, align: 'left' },
          ],
        },
        controls: [
          { name: 'order', label: '阶数 n', type: 'slider', min: 0, max: 2, step: 1, value: 1, bind: 'layers.1.order' },
        ],
      },

      // ============================================================
      // 步骤 2：高阶多项式逐次叠加（f=sin x，给出一般公式）
      // ============================================================
      {
        title: '一阶一阶地吞噬原函数',
        narrative:
'把上一节的直觉推到极致：**每提高一阶，就让多项式在 $x_0$ 处多匹配一阶导数。** 0 阶对函数值，1 阶对斜率，2 阶对弯曲，3 阶对"弯曲的变化率"……一路下去，就得到鼎鼎大名的**泰勒公式**：\n\n' +
'$$T_n(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(x_0)}{k!}\\,(x-x_0)^k$$\n\n' +
'读懂它的结构：$(x-x_0)^k$ 是越来越高次的幂；前面的系数，是 $f$ 在 $x_0$ 处的 $k$ 阶导数除以 $k!$。**阶乘 $k!$ 在这里扮演"刹车"**——它让高次项的贡献迅速缩小，保证级数乖乖收敛。\n\n' +
'把 $\\sin(x)$ 在原点展开，你会得到那串熟悉的式子：\n\n' +
'$$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\cdots$$\n\n' +
'现在拖动阶数滑块，从 0 一路拨到 9：**看紫色的多项式如何一阶一阶地"吞噬"蓝色的正弦曲线。** 在原点附近，两者贴合得越来越紧；可一旦走远，多项式就开始力不从心——这正是下一节要揭开的谜底。',
        scene: {
          axes: { xRange: [-4, 4], yRange: [-2, 2] },
          layers: [
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5 },
            { type: 'taylor', fn: 'sin(x)', at: 0, order: 3, color: PURPLE, lineWidth: 2.5 },
            { type: 'point', x: 0, y: 0, radius: 5, color: ORANGE, label: 'x₀=0' },
          ],
        },
        controls: [
          { name: 'order', label: '阶数 n', type: 'slider', min: 0, max: 9, step: 1, value: 3, bind: 'layers.1.order' },
        ],
      },

      // ============================================================
      // 步骤 3：收敛半径的直觉（f=ln(1+x)，R=1）
      // ============================================================
      {
        title: '收敛半径：多项式的势力范围',
        narrative:
'换个目标： $f(x) = \\ln(1+x)$ （定义域 $x>-1$），仍在原点 $x_0=0$ 处展开。\n\n' +
'它的泰勒级数是 $\\ln(1+x) = x - \\dfrac{x^2}{2} + \\dfrac{x^3}{3} - \\dfrac{x^4}{4} + \\cdots$ 。把阶数滑块往高拨，请仔细观察——\n\n' +
'在 $|x|<1$ 的区间（橙色虚线左侧），紫线**越贴越紧**，几乎和 $\\ln(1+x)$ 完全重合；可一旦越过那条 $x=1$ 的虚线，多项式就像脱缰的野马，**阶数越高反而偏得越离谱**。\n\n' +
'这条虚线就是**收敛半径** $R=1$ 。它划出一道无形的边界：泰勒多项式再聪明，也只能在 $x_0$ 周围半径 $R$ 的范围内忠实模仿原函数。边界之外，无穷级数不再收敛，多项式自顾自地飞走。\n\n' +
'所以泰勒级数并非万能——它有自己够得着的"势力范围"。至于这个 $R$ 从何而来，答案是藏在高阶系数里的**相邻项之比的极限**，背后还牵扯到复变函数里更深的秘密（奇点把级数"拽住"了）。',
        scene: {
          axes: { xRange: [-0.5, 2], yRange: [-1.5, 2.5] },
          layers: [
            // 0: 原函数 ln(1+x)
            { type: 'plot', fn: 'ln(1+x)', color: BLUE, lineWidth: 2.5 },
            // 1: 收敛半径边界 x=1
            { type: 'line', from: [1, -1.5], to: [1, 2.5], color: 'rgba(255,140,66,0.6)', dashed: true, lineWidth: 1.5 },
            // 2: 泰勒多项式（阶数由滑块控制）
            { type: 'taylor', fn: 'ln(1+x)', at: 0, order: 3, color: PURPLE, lineWidth: 2.5 },
            // 3: 展开点标记
            { type: 'point', x: 0, y: 0, radius: 5, color: ORANGE, label: 'x₀=0' },
            // 4: 边界标注
            { type: 'text', x: 1, y: 2.25, text: 'x=1  (R=1)', color: ORANGE, fontSize: 12 },
          ],
        },
        controls: [
          { name: 'order', label: '阶数 n', type: 'slider', min: 1, max: 10, step: 1, value: 3, bind: 'layers.2.order' },
        ],
      },

      // ============================================================
      // 步骤 4：不同展开点（f=sin x，at 由滑块控制，order 固定 5）
      // ============================================================
      {
        title: '换个展开点，势力范围跟着搬',
        narrative:
'最后提醒一个常被忽略的事实：**泰勒展开是局部逼近**——它眼里只有 $x_0$ 的邻域。\n\n' +
'拖动下方"展开点"滑块改变 $x_0$ ，紫线立刻"搬家"：在新的 $x_0$ 处重新紧贴 $\\sin(x)$ ，但远离 $x_0$ 的区域就顾不上了。**同一个 5 阶多项式，$x_0=0$ 时贴合中央，$x_0=2$ 时贴合右侧**——展开点在哪，"势力范围"的中心就在哪。\n\n' +
'这也解释了工程师为何很少只用一个泰勒展开：想要在大范围内近似一个函数，要么拼命提高阶数（但可能撞上收敛半径），要么干脆**多取几个展开点、各管一段**——后者正是数值方法里"分段多项式"（比如样条 spline）的思想根源。\n\n' +
'至此，泰勒级数的故事讲完：从一条切线起步，一阶一阶长出弯曲、长出扭转，最终在收敛半径内，用一串无穷的多项式完美复刻出一个函数。这就是微积分最优雅的"造物"之一。',
        scene: {
          axes: { xRange: [-5, 5], yRange: [-2.2, 2.2] },
          layers: [
            // 0: 原函数 sin(x)
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5 },
            // 1: 泰勒多项式（at 由滑块控制，order 固定 5）
            { type: 'taylor', fn: 'sin(x)', at: 0, order: 5, color: PURPLE, lineWidth: 2.5 },
            // 2: 展开点标记（位置随 at 联动，由 onControl 更新）
            { type: 'point', x: 0, y: 0, radius: 5, color: ORANGE, label: 'x₀' },
          ],
        },
        controls: [
          { name: 'at', label: '展开点 x₀', type: 'slider', min: -3, max: 3, step: 0.1, value: 0 },
        ],
        // 同时联动 taylor.at 与标记点坐标（bind 只能写一个路径，故用 onControl）
        onControl: function (name, v, scene) {
          if (name !== 'at' || !scene || !scene.layers) return;
          for (let i = 0; i < scene.layers.length; i++) {
            const layer = scene.layers[i];
            if (layer.type === 'taylor') {
              layer.at = v;
            } else if (layer.type === 'point') {
              layer.x = v;
              layer.y = Math.sin(v);
            }
          }
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
