/**
 * mathviz — js/data/courses/derivative.js
 * 课案 2：导数与微分
 *
 * 设计要点（与引擎契约对齐）：
 *   - course.js 的 setPath 只按 '.' 切分，不支持 "layers[1].at" 这种带括号的下标路径，
 *     因此凡是需要写到 layers 子项属性的地方，一律用 step.onControl(name,value,scene)
 *     直接 mutate scene.layers[i]，而不是用 controls[i].bind。
 *   - course.js 的 _applyScene 会 JSON 深拷贝 scene（函数会被丢弃），故本课案不使用
 *     scene.timeline；4 步全部由滑块静态驱动，状态由 onControl 重算写入 layers。
 *   - 颜色调色板：主蓝 #4f9cf9、橙 #ff8c42、紫 #9d7aff、绿 #4ade80。
 *   - 表达式幂运算用 ^（math-eval 支持），变量为 x，常量 pi/e。
 */
(function () {
  'use strict';

  // ---- 公共：f(x)=x^2 的求值（与字符串表达式 "x^2" 同语义）----
  // 这里直接给数值，避免在 onControl 里再走一遍表达式编译。
  function sq(x) { return x * x; }

  const course = {
    id: 'derivative',
    title: '导数与微分',
    summary: '从割线到切线，看见“瞬时变化”的诞生。',
    coverSVG: '<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M10 70 Q60 -10 110 70" fill="none" stroke="#4f9cf9" stroke-width="3"/>' +
      '<line x1="20" y1="62" x2="100" y2="22" stroke="#ff8c42" stroke-width="2.5" stroke-dasharray="6 4"/>' +
      '<circle cx="60" cy="20" r="4" fill="#ff8c42"/>' +
      '<text x="64" y="16" fill="#e6edf3" font-size="11" font-family="sans-serif">f&apos;(x₀)</text>' +
      '</svg>',

    steps: [
      // ============================================================
      // 步骤 1：平均变化率与割线
      // ============================================================
      {
        title: '平均变化率与割线',
        narrative: [
          '我们先从一个最朴素的问题开始：**函数变化得有多快？**',
          '',
          '拿 $f(x)=x^2$ 来说。在 $x_0=1$ 这一点，函数值是 $f(1)=1$。把自变量往前走一小步到 $x_0+h$，',
          '函数值就变成 $f(x_0+h)$。这一段路上的**平均变化率**写作：',
          '',
          '$$\\bar{k}=\\frac{f(x_0+h)-f(x_0)}{h}$$',
          '',
          '在几何上，它就是连接两点 $(x_0,f(x_0))$ 与 $(x_0+h,f(x_0+h))$ 的**割线**的斜率。',
          '拖动右下角的 $h$ 滑块：当 $h$ 很大，割线又高又陡；当 $h$ 缩小，两个点逐渐靠拢，',
          '割线也在悄悄地“收敛”向某个确定的方向——那就是下一步要登场的主角。',
          '',
          '**关键直觉**：平均变化率回答的是“这一整段路平均下来多陡”，它对“中间发生了什么”视而不见。'
        ].join('\n'),
        scene: {
          axes: { xRange: [-1, 5], yRange: [-1, 9] },
          layers: [
            // 0：函数曲线
            { type: 'plot', fn: 'x^2', color: '#4f9cf9', lineWidth: 3, range: [-1, 5], samples: 200 },
            // 1：割线（onControl 重算 from/to）
            { type: 'line', from: [1, 1], to: [2, 4], color: '#ff8c42', lineWidth: 2.5 },
            // 2：左端点 (x0, f(x0))
            { type: 'point', x: 1, y: 1, radius: 6, color: '#ff8c42', label: 'P' },
            // 3：右端点 (x0+h, f(x0+h))
            { type: 'point', x: 2, y: 4, radius: 6, color: '#4ade80', label: 'Q' },
            // 4：从两点向 x 轴的虚线辅助，帮助看出 h 的水平距离
            { type: 'line', from: [1, 1], to: [2, 1], color: '#9aa7b4', dashed: true, lineWidth: 1.5 },
            // 5：实时显示斜率
            { type: 'text', x: 3.6, y: 7.6, text: '斜率 = 3.000', color: '#ff8c42', fontSize: 16 }
          ]
          // 故意不放 timeline：本步由滑块静态驱动
        },
        controls: [
          { name: 'h', label: 'h  (步长)', type: 'slider', min: 0.05, max: 3, step: 0.05, value: 1 }
        ],
        // onControl 直接重写 layers[1/3/4/5]，避开 setPath 的下标限制
        onControl: function (name, value, scene) {
          if (name !== 'h') return;
          const h = value;
          const x0 = 1;
          const y0 = sq(x0);
          const x1 = x0 + h;
          const y1 = sq(x1);
          const slope = (y1 - y0) / h;
          const layers = scene.layers;
          // 割线两端点
          layers[1].from = [x0, y0];
          layers[1].to = [x1, y1];
          // 右端点 Q
          layers[3].x = x1;
          layers[3].y = y1;
          // 水平辅助线（突出 h 的长度）
          layers[4].from = [x0, y0];
          layers[4].to = [x1, y0];
          // 斜率文字
          layers[5].text = '割线斜率 = ' + slope.toFixed(3);
        }
      },

      // ============================================================
      // 步骤 2：割线转切线（h → 0）
      // ============================================================
      {
        title: '割线转切线（h→0）',
        narrative: [
          '现在做一件 3b1b 最喜欢的事：**让 $h$ 趋于 0**。',
          '',
          '当 $h\\to 0$，右端点 $Q$ 沿着曲线滑向 $P$，割线随之旋转、稳定，',
          '最终停留在一条唯一的直线上——这条直线只在 $P$ 点“贴着”曲线，我们叫它**切线**。',
          '',
          '$$f\'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}$$',
          '',
          '画面里同时画了两样东西：橙色虚线是 $h$ 当前取值对应的**割线**，',
          '紫色直线是 $h\\to 0$ 的极限——也就是**切线**。把 $h$ 拖到接近 0，',
          '你会看到两条线几乎完全重合：**切线就是割线的极限位置**。',
          '',
          '对 $f(x)=x^2$，在 $x_0=1$ 处切线斜率恰好是 $2$，也就是 $f\'(1)=2$。',
          '这并非巧合——下一页我们会看到这个“斜率”正是导数。'
        ].join('\n'),
        scene: {
          axes: { xRange: [-1, 5], yRange: [-1, 9] },
          layers: [
            // 0：曲线
            { type: 'plot', fn: 'x^2', color: '#4f9cf9', lineWidth: 3, range: [-1, 5], samples: 200 },
            // 1：切线（极限目标，固定画在 x0=1）
            { type: 'tangent', fn: 'x^2', at: 1, color: '#9d7aff', lineWidth: 2.5, dashed: false },
            // 2：割线（onControl 动态算 from/to）
            { type: 'line', from: [1, 1], to: [2, 4], color: '#ff8c42', lineWidth: 2, dashed: true },
            // 3：左端点 P
            { type: 'point', x: 1, y: 1, radius: 6, color: '#ff8c42', label: 'P' },
            // 4：右端点 Q
            { type: 'point', x: 2, y: 4, radius: 6, color: '#4ade80', label: 'Q' },
            // 5：说明文字
            { type: 'text', x: 3.7, y: 7.6, text: 'h = 1.000', color: '#e6edf3', fontSize: 15 }
          ]
        },
        controls: [
          // 注意：min 不能为 0（否则割线退化为点，且 0/0 无定义）；取一个很小的正数即可
          { name: 'h', label: 'h  (拖向 0)', type: 'slider', min: 0.02, max: 3, step: 0.02, value: 1 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'h') return;
          const h = value;
          const x0 = 1;
          const y0 = sq(x0);
          const x1 = x0 + h;
          const y1 = sq(x1);
          const layers = scene.layers;
          layers[2].from = [x0, y0];
          layers[2].to = [x1, y1];
          layers[4].x = x1;
          layers[4].y = y1;
          layers[5].text = 'h = ' + h.toFixed(3) + (h < 0.1 ? '  (≈0，割线≈切线)' : '');
        }
      },

      // ============================================================
      // 步骤 3：瞬时变化率与导数定义
      // ============================================================
      {
        title: '瞬时变化率与导数',
        narrative: [
          '把上一页的极限写成定义，就得到了**导数**：',
          '',
          '$$f\'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}$$',
          '',
          '它的几何意义非常直接——**切线的斜率就是导数值**。这一页换成更生动的 $f(x)=\\sin x$：',
          '拖动 $x_0$ 滑块，切点沿正弦曲线游走，你会看到切线一会儿上扬、一会儿水平、一会儿下倾。',
          '',
          '几个值得在脑子里记住的瞬间：',
          '',
          '- 在 $x_0=0$ 处，$\\sin x$ 的切线斜率是 $1$，所以 $\\sin\'(0)=\\cos(0)=1$；',
          '- 在波峰 $x_0=\\pi/2$ 处切线水平，$\\sin\'(\\pi/2)=0$；',
          '- 在 $x_0=\\pi$ 处切线向下，$\\sin\'(\\pi)=-1$。',
          '',
          '这正是 $\\sin\' x=\\cos x$ 的几何证据：**导函数 $f\'(x)$ 把每一点的瞬时斜率重新连成一条新曲线**。',
          '下一页我们就顺着这个思路，往上再求一次导。'
        ].join('\n'),
        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-2.5, 2.5] },
          layers: [
            // 0：sin 曲线
            { type: 'plot', fn: 'sin(x)', color: '#4f9cf9', lineWidth: 3, range: [-6.5, 6.5], samples: 300 },
            // 1：切线（onControl 改 at）
            { type: 'tangent', fn: 'sin(x)', at: 0, color: '#ff8c42', lineWidth: 2.5, dashed: false },
            // 2：切点（tangent 会自带一个切点圆，这里再画一个大的醒目点 + 标签）
            { type: 'point', x: 0, y: 0, radius: 7, color: '#ff8c42', label: '切点' },
            // 3：斜率读数
            { type: 'text', x: 0, y: 2.05, text: "x₀ = 0.00   f'(x₀) = 1.000", color: '#ff8c42', fontSize: 16 }
          ]
        },
        controls: [
          { name: 'x0', label: 'x₀  (切点位置)', type: 'slider', min: -6, max: 6, step: 0.05, value: 0 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'x0') return;
          const x0 = value;
          // 数值求导：sin 的导数 = cos
          const slope = Math.cos(x0);
          const y0 = Math.sin(x0);
          const layers = scene.layers;
          layers[1].at = x0;
          layers[2].x = x0;
          layers[2].y = y0;
          layers[3].x = x0;
          layers[3].text = 'x₀ = ' + x0.toFixed(2) + "   f'(x₀) = " + slope.toFixed(3);
        }
      },

      // ============================================================
      // 步骤 4：高阶导数
      // ============================================================
      {
        title: '高阶导数',
        narrative: [
          '导函数 $f\'(x)$ 本身也是一个函数，那它当然还可以再求导——这就得到**二阶导数** $f\'\'(x)$，',
          '再求一次就是三阶 $f\'\'\'(x)$，以此类推。',
          '',
          '以 $f(x)=\\sin x$ 为例，它的各阶导数形成一条优美的“轮转链”：',
          '',
          '$$\\sin x \\;\\xrightarrow{\\;d\\;}\\; \\cos x \\;\\xrightarrow{\\;d\\;}\\; -\\sin x \\;\\xrightarrow{\\;d\\;}\\; -\\cos x \\;\\xrightarrow{\\;d\\;}\\; \\sin x$$',
          '',
          '用 order 滑块切换显示的导函数曲线（紫色），它叠在原函数（蓝色）之上：',
          '',
          '- **一阶 $f\'=\\cos x$**：瞬时速度。波峰处 $\\sin$ 切线水平，对应 $\\cos=0$；',
          '- **二阶 $f\'\'=-\\sin x$**：加速度，描述“速度本身变化得多快”。注意它和原函数关于 x 轴对称；',
          '- **三阶 $f\'\'\'=-\\cos x$**：加加速度（jerk），工程里关乎乘坐舒适度的那一项。',
          '',
          '**物理直觉**：若 $f$ 是位置，$f\'$ 是速度，$f\'\'$ 是加速度，$f\'\'\'$ 就是加速度的变化率。',
          '每求一次导，我们就把镜头拉近一档，去看“变化的变化”。'
        ].join('\n'),
        scene: {
          axes: { xRange: [-6.5, 6.5], yRange: [-2.5, 2.5] },
          layers: [
            // 0：原函数 sin（始终显示，作为参照）
            { type: 'plot', fn: 'sin(x)', color: '#4f9cf9', lineWidth: 3, range: [-6.5, 6.5], samples: 300 },
            // 1：当前阶数的导函数曲线（onControl 切换 fn/color/说明）
            { type: 'plot', fn: 'cos(x)', color: '#9d7aff', lineWidth: 2.5, range: [-6.5, 6.5], samples: 300 },
            // 2：图例/标题
            { type: 'text', x: -5.5, y: 2.1, text: "f(x) = sin(x)   ——   f'(x) = cos(x)", color: '#9d7aff', fontSize: 15 }
          ]
        },
        controls: [
          { name: 'order', label: '阶数 (1/2/3)', type: 'slider', min: 1, max: 3, step: 1, value: 1 }
        ],
        onControl: function (name, value, scene) {
          if (name !== 'order') return;
          // 阶数取整，防止滑块浮点漂移
          const order = Math.round(value);
          // sin 的 n 阶导 = sin(x + n*pi/2)
          const FNS = ['cos(x)', '-sin(x)', '-cos(x)'];
          const LABELS = [
            "f(x) = sin(x)   ——   f'(x) = cos(x)",
            "f(x) = sin(x)   ——   f''(x) = -sin(x)",
            "f(x) = sin(x)   ——   f'''(x) = -cos(x)"
          ];
          const idx = order - 1;
          const layers = scene.layers;
          // 切换导函数曲线：换 fn 字符串即可，primitives 会重新编译
          layers[1].fn = FNS[idx];
          // 清掉可能的编译缓存，确保新表达式生效
          layers[1]._fn = undefined;
          layers[2].text = LABELS[idx];
        }
      }
    ]
  };

  window.COURSES.register(course);
})();
