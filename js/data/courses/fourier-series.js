/**
 * mathviz — js/data/courses/fourier-series.js
 * 课案：傅里叶级数（北大高数 §8.4，批次 2 收尾）。
 *
 * 四步：
 *   1. 周期函数与三角基    任何周期函数都能拆成正弦/余弦的和
 *   2. 方波的傅里叶逼近    奇次谐波叠加逐渐逼近方波
 *   3. 频谱与吉布斯现象    高频过冲不随项数消失
 *   4. 收敛条件            狄利克雷条件
 *
 * 设计：onControl 直接 mutate scene.layers。表达式幂用 ^。颜色调色板。
 *   核心可视化：用 plot 叠加多个正弦谐波，再加一条合成波。
 *   方波的傅里叶级数：Σ sin((2k-1)x)/(2k-1)，前 N 项部分和。
 */
(function () {
  'use strict';

  var BLUE = '#4f9cf9';   // 合成波（目标）
  var ORANGE = '#ff8c42'; // 单个谐波
  var PURPLE = '#9d7aff'; // 第二/第三谐波
  var GREEN = '#4ade80';  // 理想方波 / 结论

  // 计算方波傅里叶级数前 N 项的值：f(x) = Σ_{k=1}^{N} sin((2k-1)x)/(2k-1)
  function fourierSquare(x, N) {
    var s = 0;
    for (var k = 1; k <= N; k++) {
      s += Math.sin((2 * k - 1) * x) / (2 * k - 1);
    }
    return s * 4 / Math.PI; // 乘 4/π 得到振幅 ±1 的方波
  }

  var course = {
    id: 'fourier-series',
    title: '傅里叶级数',
    summary: '任何周期函数都能拆成正弦波的叠加——频率世界的视角。',
    coverSVG: '<svg viewBox="0 0 200 113" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="113" fill="#0d1117"/><path d="M20 56 Q40 20 60 56 T100 56 T140 56 T180 56" fill="none" stroke="#4f9cf9" stroke-width="2.5"/><path d="M20 56 Q35 35 50 56 T80 56 T110 56" fill="none" stroke="#ff8c42" stroke-width="1.5" opacity="0.6"/><path d="M20 56 Q30 46 40 56 T60 56" fill="none" stroke="#9d7aff" stroke-width="1.2" opacity="0.5"/><text x="100" y="98" fill="#9aa7b4" font-size="10" text-anchor="middle" font-family="sans-serif">谐波叠加 → 方波</text></svg>',

    steps: [
      // ===== Step 1：周期函数与三角基 =====
      {
        title: '周期函数与三角基',
        narrative: `泰勒级数用**多项式**逼近函数，但多项式无法高效表达**周期性**（振荡、波）。
傅里叶的洞察：换一套"基"——用**三角函数** $\\sin(nx)$、$\\cos(nx)$ 的叠加：

$$f(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left(a_n \\cos nx + b_n \\sin nx\\right)$$

每个 $\\sin(nx)$ 是频率为 $n$ 的纯振动（基频 $n=1$，倍频 $n=2,3,\\ldots$）。
傅里叶级数就是把函数**分解成不同频率的纯音**——这就是频谱分析的数学基础。

**为什么是三角函数？** 因为 $\\{1, \\cos nx, \\sin nx\\}$ 在一个周期上**正交**：
不同频率的三角函数"互相独立"，像坐标轴一样。系数 $a_n$、$b_n$ 通过积分提取：

$$a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos nx\\,dx, \\quad b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin nx\\,dx$$

右侧演示三个基频：蓝色 $\\sin x$（基频）、橙色 $\\sin 3x$（三倍频）、紫色 $\\sin 5x$（五倍频）。
注意频率越高，振荡越密——它们是构造任意周期波的"乐高积木"。`,

        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-1.8, 1.8] },
          layers: [
            { type: 'plot', fn: 'sin(x)', color: BLUE, lineWidth: 2.5, range: [-6.2, 6.2], samples: 120 },
            { type: 'plot', fn: 'sin(3*x)', color: ORANGE, lineWidth: 2, range: [-6.2, 6.2], samples: 150 },
            { type: 'plot', fn: 'sin(5*x)', color: PURPLE, lineWidth: 1.8, range: [-6.2, 6.2], samples: 180 },
            { type: 'text', x: -6, y: 1.5, text: '蓝:sin x（基频） 橙:sin 3x 紫:sin 5x', color: '#9aa7b4', fontSize: 11, align: 'left' },
            { type: 'text', x: -6, y: 1.1, text: '频率越高，振荡越密', color: GREEN, fontSize: 12, align: 'left' },
          ],
        },
      },

      // ===== Step 2：方波的傅里叶逼近 =====
      {
        title: '方波的傅里叶逼近',
        narrative: `最震撼的例子——用正弦波叠加逼近**方波**（理想开关信号）。

方波的傅里叶级数**只含奇次正弦**：

$$f(x) = \\frac{4}{\\pi}\\sum_{k=1}^{\\infty} \\frac{\\sin(2k-1)x}{2k-1} = \\frac{4}{\\pi}\\left(\\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\cdots\\right)$$

- 第 1 项 $\\frac{4}{\\pi}\\sin x$：一个普通正弦波
- 加第 2 项 $\\frac{4}{3\\pi}\\sin 3x$：波形开始"变方"
- 加更多奇次谐波：越来越接近垂直跳变的方波

右侧演示。绿色是理想方波，蓝色是前 $N$ 项部分和。
拖动 $N$ 滑块增加谐波数：$N=1$ 只是正弦波，$N=10$ 已经相当方了，$N=50$ 几乎完美。

> **直觉**：方波的"尖角"需要无穷高频来构造。项数越多，能表达的细节越精细。
> 这就是"频域"思维——**时域的形状 = 频域的配方**。`,

        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-1.8, 1.8] },
          layers: [
            // 理想方波（用两段水平线 + 跳变近似，这里用 plot 画 sign(sin x)）
            { type: 'plot', fn: 'abs(sin(x))/sin(x)', color: GREEN, lineWidth: 1.5, range: [-6.2, 6.2], samples: 500 },
            // 傅里叶部分和（初始 N=3）—— 用 plot 但需自定义函数，改用多条 plot 近似
            // 这里用 plot 画 fourierSquare 的近似表达式较难，改用 onControl 动态生成采样点
          ],
        },
        controls: [
          { name: 'N', label: '谐波数 N', type: 'slider', min: 1, max: 50, step: 1, value: 3 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 用大量 point 画傅里叶部分和采样曲线（近似连续）
          var pts = [];
          var samples = 400;
          for (var i = 0; i <= samples; i++) {
            var x = -6.2 + (12.4 * i / samples);
            var y = fourierSquare(x, N);
            pts.push({ type: 'point', x: x, y: y, color: BLUE, radius: 1.2 });
          }
          // 保留方波参照层，替换为采样点
          scene.layers = scene.layers.slice(0, 1).concat(pts);
        },
      },

      // ===== Step 3：频谱与吉布斯现象 =====
      {
        title: '频谱与吉布斯现象',
        narrative: `傅里叶级数有个反直觉的现象——**吉布斯现象**：

> 在方波的跳变处，部分和会**过冲**约 9%（$\\frac{2}{\\pi}\\int_0^\\pi \\frac{\\sin t}{t}dt - 1 \\approx 0.0895$），
> 而且这个过冲**不随项数增加而消失**！增加 $N$ 只让过冲**变窄**，不会变低。

这违反了"项数越多越精确"的直觉。原因是方波在跳变处**不连续**，
而三角函数都是连续的——连续函数的部分和无法完美"追上"瞬时跳变。

**频谱视角**：方波的系数 $b_{2k-1} = \\frac{4}{(2k-1)\\pi}$ 随频率衰减（$\\sim 1/n$）。
把"频率-振幅"画成图就是**频谱**——它告诉你方波"含哪些频率、各占多少"。

右侧用 $N=20$ 展示吉布斯过冲（蓝色部分和在跳变处超出绿色方波的尖角）。
拖动 $N$ 滑块，看过冲区域**变窄但不降低**。

> 吉布斯现象是信号处理的常识：任何有限带宽系统都无法完美重建阶跃信号。`,

        scene: {
          axes: { xRange: [2.5, 4.5], yRange: [-0.3, 1.5] },
          layers: [
            // 放大跳变处 x=π≈3.14 附近
            // 方波（值=1）
            { type: 'line', from: [2.5, 1], to: [3.14159, 1], color: GREEN, lineWidth: 2 },
            { type: 'line', from: [3.14159, -1], to: [4.5, -1], color: GREEN, lineWidth: 2 },
            { type: 'line', from: [3.14159, -0.3], to: [3.14159, 1.5], color: '#3a4452', dashed: true, lineWidth: 1 },
            { type: 'text', x: 3.2, y: 1.35, text: 'x=π（跳变点）', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ],
        },
        controls: [
          { name: 'N', label: '谐波数 N', type: 'slider', min: 5, max: 60, step: 1, value: 20 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          var pts = [];
          var samples = 400;
          for (var i = 0; i <= samples; i++) {
            var x = 2.5 + (2.0 * i / samples);
            var y = fourierSquare(x, N);
            if (y > -1.5 && y < 1.5) {
              pts.push({ type: 'point', x: x, y: y, color: BLUE, radius: 1.2 });
            }
          }
          // 保留前 4 个固定层，替换采样点
          scene.layers = scene.layers.slice(0, 4).concat(pts);
        },
      },

      // ===== Step 4：收敛条件 =====
      {
        title: '收敛条件：狄利克雷',
        narrative: `傅里叶级数何时收敛到原函数？**狄利克雷条件**给出充分条件：

> 若 $f(x)$ 在一个周期内满足：
> 1. **分段连续**（只有有限个第一类间断点）
> 2. **分段单调**（只有有限个极值）
>
> 则傅里叶级数**处处收敛**，且：
> - 在连续点，级数 $= f(x)$
> - 在间断点，级数 $= \\frac{f(x^+) + f(x^-)}{2}$（左右极限的平均）

这就是为什么方波在跳变处收敛到 $0$（$\\frac{1+(-1)}{2}=0$），而不是 $1$ 或 $-1$。

**傅里叶级数 vs 泰勒级数**：
| | 泰勒级数 | 傅里叶级数 |
|---|---|---|
| 基 | 多项式 $x^n$ | 三角函数 $\\sin nx, \\cos nx$ |
| 擅长 | 光滑函数（解析） | 周期/分段函数 |
| 收敛 | 局部（一点附近） | 全局（整个周期） |
| 物理 | 几何逼近 | 频率分解 |

右侧展示傅里叶级数的两个面孔：时域（蓝色波形）与频域（橙色频谱柱）。
**同一个信号，两种语言**——这是信号处理、压缩（JPEG/MPEG）、量子力学的共同根基。`,

        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-1.8, 1.8] },
          layers: [
            // 时域：锯齿波的前几项傅里叶部分和（用 sin(nx)/n 叠加）
          ],
        },
        controls: [
          { name: 'N', label: '谐波数 N', type: 'slider', min: 1, max: 40, step: 1, value: 8 },
        ],
        onControl: function (name, value, scene) {
          if (name !== 'N') return;
          var N = Math.round(value);
          // 锯齿波傅里叶级数：f(x) = (2/π)Σ(-1)^(n+1) sin(nx)/n，但简化用 sin 叠加
          var pts = [];
          var samples = 400;
          for (var i = 0; i <= samples; i++) {
            var x = -6.2 + (12.4 * i / samples);
            var y = 0;
            for (var n = 1; n <= N; n++) {
              y += Math.pow(-1, n + 1) * Math.sin(n * x) / n;
            }
            y = y * 2 / Math.PI;
            pts.push({ type: 'point', x: x, y: y, color: BLUE, radius: 1.2 });
          }
          scene.layers = pts.concat([
            { type: 'text', x: -6, y: 1.5, text: '锯齿波傅里叶部分和（N=' + N + ' 项）', color: '#9aa7b4', fontSize: 11, align: 'left' },
          ]);
        },
      },
    ],
  };

  window.COURSES.register(course);
})();
