/**
 * mathviz — js/data/questions.js
 * 题库数据层。每题结构：
 *   {
 *     id: 'q-xxx',
 *     courseId: 'limit' | 'derivative' | ...,  对应课案
 *     chapter: '函数极限',                       章节名
 *     difficulty: 1 | 2 | 3,                    难度（基础/进阶/挑战）
 *     type: 'single' | 'multi' | 'judge' | 'fill',  题型
 *     stem: '题干（含 $...$ 公式）',
 *     options: ['A. ...','B. ...','C. ...','D. ...'],  选项（judge 用 ['对','错']）
 *     answer: 0 | [0,2] | true | 'sin(x)',     正确答案（single=索引，multi=索引数组，judge=bool，fill=字符串）
 *     explain: '解析（含公式）',
 *     points: ['ε-δ 定义','夹逼准则']           关联知识点
 *   }
 *
 * 暴露 window.QUESTIONS（数组）与 window.QuestionBank（查询接口）。
 */
(function (global) {
  'use strict';

  const QUESTIONS = [
    // ============ intro（微积分启程）基础概念 ============
    {
      id: 'q-intro-1', courseId: 'intro', chapter: '函数', difficulty: 1, type: 'single',
      stem: '微积分主要研究的是哪一类问题？',
      options: ['A. 静态图形的几何性质', 'B. 量的变化与累积', 'C. 数字的因式分解', 'D. 方程的整数解'],
      answer: 1,
      explain: '微积分的核心是描述**变化**：微分研究"某一刻变化多快"，积分研究"总共累积了多少"。',
      points: ['微积分的研究对象'],
    },
    {
      id: 'q-intro-2', courseId: 'intro', chapter: '函数', difficulty: 1, type: 'single',
      stem: '函数 $f(x) = x^2$ 在 $x = 3$ 处的值是？',
      options: ['A. 6', 'B. 8', 'C. 9', 'D. 12'],
      answer: 2,
      explain: '$f(3) = 3^2 = 9$。函数是"输入一个数、输出一个数"的机器。',
      points: ['函数求值'],
    },
    {
      id: 'q-intro-3', courseId: 'intro', chapter: '瞬时变化', difficulty: 2, type: 'single',
      stem: '为什么"瞬时速度"看似是个矛盾的概念？',
      options: ['A. 因为速度无法测量', 'B. 因为瞬间没有时间长度，速度=路程/时间 出现 0÷0', 'C. 因为物体在瞬间静止', 'D. 因为仪表盘不准确'],
      answer: 1,
      explain: '瞬时速度 = 路程 ÷ 时间，但"瞬间"时间是 0、路程也是 0，得到 $0/0$ 无定义。微积分用**极限**解决：让时间间隔趋于 0，取极限。',
      points: ['瞬时速度的矛盾', '极限思想'],
    },

    // ============ limit（极限与连续） ============
    {
      id: 'q-limit-1', courseId: 'limit', chapter: '数列极限', difficulty: 1, type: 'single',
      stem: '$\\lim_{n \\to \\infty} \\frac{1}{n}$ 的值是？',
      options: ['A. 1', 'B. 0', 'C. $\\infty$', 'D. 不存在'],
      answer: 1,
      explain: '当 $n$ 越来越大，$1/n$ 越来越接近 0，故极限为 0。',
      points: ['数列极限'],
    },
    {
      id: 'q-limit-2', courseId: 'limit', chapter: '重要极限', difficulty: 2, type: 'single',
      stem: '$\\lim_{x \\to 0} \\frac{\\sin x}{x}$ 的值是？',
      options: ['A. 0', 'B. 1', 'C. $\\infty$', 'D. 不存在'],
      answer: 1,
      explain: '这是微积分最重要的极限之一，由夹逼准则可证 $\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1$。',
      points: ['重要极限', '夹逼准则'],
    },
    {
      id: 'q-limit-3', courseId: 'limit', chapter: '连续性', difficulty: 2, type: 'single',
      stem: '函数 $f(x)$ 在 $a$ 点连续需要满足哪三个条件？',
      options: ['A. 有定义、有极限、极限等于函数值', 'B. 可导、可积、连续', 'C. 单调、有界、有极限', 'D. 大于0、可导、连续'],
      answer: 0,
      explain: '连续的三要件：$f(a)$ 有定义；$\\lim_{x\\to a} f(x)$ 存在；二者相等。',
      points: ['连续的定义'],
    },
    {
      id: 'q-limit-4', courseId: 'limit', chapter: '函数极限', difficulty: 3, type: 'single',
      stem: '$\\lim_{x \\to 0} \\frac{x^2 \\sin(1/x)}{\\sin x}$ 的值是？',
      options: ['A. 1', 'B. 0', 'C. $\\infty$', 'D. 不存在'],
      answer: 1,
      explain: '原式 = $\\frac{x}{\\sin x} \\cdot x \\sin(1/x)$。前因子→1，后因子 $|x\\sin(1/x)| \\leq |x| \\to 0$（夹逼），故极限为 0。',
      points: ['夹逼准则', '重要极限', '无穷小'],
    },
    {
      id: 'q-limit-5', courseId: 'limit', chapter: '间断点', difficulty: 2, type: 'judge',
      stem: '$f(x) = \\frac{|x|}{x}$ 在 $x=0$ 处是可去间断点。',
      options: ['对', '错'],
      answer: false,
      explain: '该函数左极限为 -1、右极限为 1，左右极限都存在但不相等，属于**跳跃间断点**（第一类），不是可去间断点。',
      points: ['间断点分类', '跳跃间断'],
    },

    // ============ limit-laws（极限运算法则） ============
    {
      id: 'q-ll-1', courseId: 'limit-laws', chapter: '夹逼准则', difficulty: 2, type: 'single',
      stem: '$\\lim_{x \\to 0} x^2 \\sin(1/x)$ 的值是？',
      options: ['A. 1', 'B. 0', 'C. $\\infty$', 'D. 不存在'],
      answer: 1,
      explain: '由 $|x^2\\sin(1/x)| \\leq x^2 \\to 0$（夹逼），故极限为 0。注意 $\\sin(1/x)$ 震荡无极限，但被 $x^2$ 压住。',
      points: ['夹逼准则', '震荡函数'],
    },
    {
      id: 'q-ll-2', courseId: 'limit-laws', chapter: '等价无穷小', difficulty: 2, type: 'single',
      stem: '$\\lim_{x \\to 0} \\frac{\\ln(1+x)}{x}$ 的值是？',
      options: ['A. 0', 'B. 1', 'C. $e$', 'D. 不存在'],
      answer: 1,
      explain: '$\\ln(1+x) \\sim x$（等价无穷小），故 $\\frac{\\ln(1+x)}{x} \\sim \\frac{x}{x} = 1$。',
      points: ['等价无穷小', '对数'],
    },
    {
      id: 'q-ll-3', courseId: 'limit-laws', chapter: '复合函数极限', difficulty: 2, type: 'single',
      stem: '$\\lim_{x \\to 0} e^{\\sin x}$ 的值是？',
      options: ['A. 0', 'B. 1', 'C. $e$', 'D. 不存在'],
      answer: 1,
      explain: '内层 $\\lim_{x\\to0}\\sin x = 0$，外层 $e^u$ 在 $u=0$ 连续，故 $\\lim e^{\\sin x} = e^0 = 1$。',
      points: ['复合函数极限', '连续性'],
    },
    {
      id: 'q-ll-4', courseId: 'limit-laws', chapter: '等价无穷小', difficulty: 3, type: 'judge',
      stem: '在求极限时，等价无穷小替换可用于加减法中的任意一项。',
      options: ['对', '错'],
      answer: false,
      explain: '等价无穷小替换**只适用于乘除因子**，加减项中乱替换是经典错误（可能改变精度导致结果错误）。',
      points: ['等价无穷小', '替换法则限制'],
    },

    // ============ derivative（导数与微分） ============
    {
      id: 'q-der-1', courseId: 'derivative', chapter: '导数定义', difficulty: 1, type: 'single',
      stem: '$f(x) = x^3$ 的导数是？',
      options: ['A. $3x^2$', 'B. $x^2$', 'C. $3x$', 'D. $3$'],
      answer: 0,
      explain: '由幂函数求导法则 $(x^n)\' = nx^{n-1}$，得 $(x^3)\' = 3x^2$。',
      points: ['幂函数求导'],
    },
    {
      id: 'q-der-2', courseId: 'derivative', chapter: '导数定义', difficulty: 2, type: 'single',
      stem: '函数 $f(x) = \\sin x$ 在 $x = \\pi/2$ 处的切线斜率是？',
      options: ['A. 1', 'B. 0', 'C. -1', 'D. $\\pi/2$'],
      answer: 1,
      explain: '$(\\sin x)\' = \\cos x$，在 $x=\\pi/2$ 处 $\\cos(\\pi/2) = 0$，切线水平。这正是波峰处"变化停止"的体现。',
      points: ['三角函数求导', '切线斜率'],
    },
    {
      id: 'q-der-3', courseId: 'derivative', chapter: '高阶导数', difficulty: 2, type: 'single',
      stem: '$\\sin x$ 的第 4 阶导数是？',
      options: ['A. $\\sin x$', 'B. $\\cos x$', 'C. $-\\sin x$', 'D. $-\\cos x$'],
      answer: 0,
      explain: '求导循环链：$\\sin \\to \\cos \\to -\\sin \\to -\\cos \\to \\sin$。每求 4 次回到原函数。',
      points: ['高阶导数', '三角函数循环'],
    },

    // ============ derivative-rules（求导法则） ============
    {
      id: 'q-drr-1', courseId: 'derivative-rules', chapter: '链式法则', difficulty: 2, type: 'single',
      stem: '$\\frac{d}{dx}[\\sin(x^2)]$ 的结果是？',
      options: ['A. $\\cos(x^2)$', 'B. $2x\\cos(x^2)$', 'C. $\\cos(2x)$', 'D. $2x\\cos(x)$'],
      answer: 1,
      explain: '链式法则：外层 $\\sin$ 的导数 $\\cos$ 乘内层 $x^2$ 的导数 $2x$，得 $\\cos(x^2)\\cdot 2x$。',
      points: ['链式法则'],
    },
    {
      id: 'q-drr-2', courseId: 'derivative-rules', chapter: '乘法法则', difficulty: 2, type: 'fill',
      stem: '$\\frac{d}{dx}[x \\cdot \\ln x] = $ ？（填最简表达式，用 * 表示乘法）',
      options: [],
      answer: 'ln(x)+1',
      explain: '乘法法则 $(uv)\' = u\'v + uv\'$：$u=x, v=\\ln x$，$(x\\ln x)\' = 1\\cdot\\ln x + x\\cdot\\frac{1}{x} = \\ln x + 1$。填 `ln(x)+1` 或等价形式。',
      points: ['乘法法则'],
    },
    {
      id: 'q-drr-3', courseId: 'derivative-rules', chapter: '反函数求导', difficulty: 3, type: 'single',
      stem: '$\\frac{d}{dx}[\\ln x]$ 在 $x = e$ 处的值，与 $\\frac{d}{dx}[e^x]$ 在 $x=1$ 处的值之积是？',
      options: ['A. 0', 'B. 1', 'C. $e$', 'D. $1/e$'],
      answer: 1,
      explain: '$(\\ln x)\'|_{x=e} = 1/e$；$(e^x)\'|_{x=1} = e$。乘积 $= (1/e)\\cdot e = 1$。这体现了互为反函数的导数在对应点**互为倒数**。',
      points: ['反函数求导', '导数互倒'],
    },
    {
      id: 'q-drr-4', courseId: 'derivative-rules', chapter: '商法则', difficulty: 2, type: 'single',
      stem: '$\\frac{d}{dx}[\\tan x]$ 等于？',
      options: ['A. $\\sec^2 x$', 'B. $\\frac{1}{\\cos^2 x}$', 'C. $1 + \\tan^2 x$', 'D. 以上都对'],
      answer: 3,
      explain: '由商法则 $(\\tan x)\' = (\\frac{\\sin x}{\\cos x})\' = \\frac{1}{\\cos^2 x}$，而 $\\sec^2 x = 1/\\cos^2 x$，且 $1+\\tan^2 x = \\sec^2 x$，三者等价。',
      points: ['商法则', '三角恒等式'],
    },

    // ============ mean-value-theorem（中值定理） ============
    {
      id: 'q-mvt-1', courseId: 'mean-value-theorem', chapter: '罗尔定理', difficulty: 2, type: 'single',
      stem: '罗尔定理要求 $f$ 满足的条件中，下列哪个**不是**必需的？',
      options: ['A. $[a,b]$ 上连续', 'B. $(a,b)$ 内可导', 'C. $f(a)=f(b)$', 'D. $f$ 是多项式'],
      answer: 3,
      explain: '罗尔定理只需连续、可导、端点等高三个条件，与函数是否多项式无关。$\\sin x$、$\\ln x$ 等都适用。',
      points: ['罗尔定理条件'],
    },
    {
      id: 'q-mvt-2', courseId: 'mean-value-theorem', chapter: '拉格朗日', difficulty: 2, type: 'fill',
      stem: '对 $f(x)=x^2$ 在 $[1,3]$ 上用拉格朗日定理，求出的 $\\xi = $ ？',
      options: [],
      answer: '2',
      explain: '$f\'(\\xi)=2\\xi$，割线斜率 $=(9-1)/(3-1)=4$，令 $2\\xi=4$ 得 $\\xi=2$。',
      points: ['拉格朗日中值定理', '求 ξ'],
    },
    {
      id: 'q-mvt-3', courseId: 'mean-value-theorem', chapter: '不等式', difficulty: 3, type: 'single',
      stem: '由拉格朗日定理可证 $|\\sin b - \\sin a| \\leq |b-a|$，其依据是？',
      options: ['A. $|\\sin x| \\leq 1$', 'B. $|\\cos x| \\leq 1$', 'C. $\\sin$ 单调', 'D. $\\sin$ 有界'],
      answer: 1,
      explain: '$\\sin b - \\sin a = \\cos\\xi \\cdot (b-a)$，而 $|\\cos\\xi|\\leq 1$，故 $|\\sin b-\\sin a|\\leq|b-a|$。',
      points: ['拉格朗日定理应用', '不等式证明'],
    },
    {
      id: 'q-mvt-4', courseId: 'mean-value-theorem', chapter: '柯西定理', difficulty: 3, type: 'judge',
      stem: '柯西中值定理中，当 $g(x) = x$ 时就退化为拉格朗日中值定理。',
      options: ['对', '错'],
      answer: true,
      explain: '代入 $g(x)=x$：$g\'=1$，$g(b)-g(a)=b-a$，公式 $\\frac{f\'}{g\'}=\\frac{f(b)-f(a)}{g(b)-g(a)}$ 变为 $f\'(\\xi)=\\frac{f(b)-f(a)}{b-a}$，正是拉格朗日。',
      points: ['柯西定理', '与拉格朗日关系'],
    },

    // ============ lhopital（洛必达法则） ============
    {
      id: 'q-lh-1', courseId: 'lhopital', chapter: '0/0 型', difficulty: 2, type: 'single',
      stem: '$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$ 的值是？',
      options: ['A. 0', 'B. 1/2', 'C. 1', 'D. 2'],
      answer: 1,
      explain: '0/0 型，洛必达：$\\frac{\\sin x}{2x}$ 仍 0/0，再洛必达 $\\frac{\\cos x}{2}\\to\\frac{1}{2}$。也可用等价无穷小 $1-\\cos x \\sim x^2/2$。',
      points: ['0/0 型', '多次洛必达'],
    },
    {
      id: 'q-lh-2', courseId: 'lhopital', chapter: '∞/∞ 型', difficulty: 2, type: 'single',
      stem: '$\\lim_{x \\to \\infty} \\frac{\\ln x}{x}$ 的值是？',
      options: ['A. 0', 'B. 1', 'C. $\\infty$', 'D. 不存在'],
      answer: 0,
      explain: '∞/∞ 型，洛必达：$\\frac{1/x}{1} = \\frac{1}{x} \\to 0$。对数增长远慢于线性。',
      points: ['∞/∞ 型', '增长速度'],
    },
    {
      id: 'q-lh-3', courseId: 'lhopital', chapter: '陷阱', difficulty: 3, type: 'judge',
      stem: '若 $\\lim f\'(x)/g\'(x)$ 不存在，则 $\\lim f(x)/g(x)$ 也一定不存在。',
      options: ['对', '错'],
      answer: false,
      explain: '反例：$f=\\sin x+x$，$g=x$（$x\\to\\infty$）。$f\'/g\'=\\cos x+1$ 震荡无极限，但 $f/g=1+\\sin x/x \\to 1$。**导数比无极限 ≠ 原极限无**。',
      points: ['洛必达陷阱', '逆否不成立'],
    },
    {
      id: 'q-lh-4', courseId: 'lhopital', chapter: '使用条件', difficulty: 2, type: 'single',
      stem: '下列哪个极限**不能**直接用洛必达法则？',
      options: ['A. $\\lim_{x\\to0}\\frac{e^x-1}{x}$', 'B. $\\lim_{x\\to0}\\frac{x}{x+1}$', 'C. $\\lim_{x\\to0}\\frac{\\sin x}{x}$', 'D. $\\lim_{x\\to0}\\frac{\\ln(1+x)}{x}$'],
      answer: 1,
      explain: 'B 选项 $\\frac{x}{x+1}$ 在 $x\\to0$ 代入得 $\\frac{0}{1}=0$，**不是未定式**，不能用洛必达。强行用会得 $\\frac{1}{1}=1$，错误。',
      points: ['洛必达使用条件', '未定式判定'],
    },

    // ============ convexity（凹凸与拐点） ============
    {
      id: 'q-cv-1', courseId: 'convexity', chapter: '二阶导判别', difficulty: 2, type: 'single',
      stem: '若在区间 $I$ 上 $f\'\'(x) > 0$，则 $f$ 在 $I$ 上是？',
      options: ['A. 凸（concave down）', 'B. 凹（concave up）', 'C. 单调递增', 'D. 单调递减'],
      answer: 1,
      explain: '$f\'\'>0$ 表示切线斜率在增大，曲线"开口朝上"能盛水，是**凹**（concave up）。单调性由 $f\'$ 决定，与 $f\'\'$ 无直接关系。',
      points: ['二阶导判别', '凹凸定义'],
    },
    {
      id: 'q-cv-2', courseId: 'convexity', chapter: '拐点', difficulty: 2, type: 'single',
      stem: '$f(x) = x^3$ 的拐点是？',
      options: ['A. $x = 1$', 'B. $x = 0$', 'C. $x = -1$', 'D. 没有拐点'],
      answer: 1,
      explain: '$f\'\'=6x$，在 $x=0$ 处 $f\'\'=0$ 且左右变号（左负右正），凹凸反转，故 $x=0$ 是拐点。',
      points: ['拐点判定'],
    },
    {
      id: 'q-cv-3', courseId: 'convexity', chapter: '拐点', difficulty: 3, type: 'single',
      stem: '$f(x) = x^4$ 在 $x = 0$ 处 $f\'\'(0) = 0$，下列哪个正确？',
      options: ['A. $x=0$ 是拐点', 'B. $x=0$ 不是拐点', 'C. $x=0$ 是极值点也是拐点', 'D. 无法判断'],
      answer: 1,
      explain: '$f\'\'=12x^2 \\geq 0$ 恒成立，在 $x=0$ 左右**不变号**（都非负），故不是拐点。$f\'\'=0$ 只是必要条件，需检查变号。',
      points: ['拐点判定', 'f′′=0 非充分'],
    },
    {
      id: 'q-cv-4', courseId: 'convexity', chapter: '极值判别', difficulty: 2, type: 'single',
      stem: '若 $f\'(x_0) = 0$ 且 $f\'\'(x_0) > 0$，则 $x_0$ 是？',
      options: ['A. 极大值点', 'B. 极小值点', 'C. 拐点', 'D. 无法判断'],
      answer: 1,
      explain: '驻点处 $f\'\'>0$（凹）→ 碗底 → **极小值**。这是极值第二判别法。$f\'\'<0$（凸）则为极大。',
      points: ['极值第二判别法'],
    },

    // ============ integral（积分） ============
    {
      id: 'q-int-1', courseId: 'integral', chapter: '定积分', difficulty: 1, type: 'single',
      stem: '$\\int_0^1 x\\,dx$ 的值是？',
      options: ['A. 1/2', 'B. 1', 'C. 1/3', 'D. 2'],
      answer: 0,
      explain: '由 $\\int x\\,dx = x^2/2$，得 $[x^2/2]_0^1 = 1/2$。几何上是底 1、高 1 的三角形面积。',
      points: ['定积分计算', '几何意义'],
    },
    {
      id: 'q-int-2', courseId: 'integral', chapter: '微积分基本定理', difficulty: 2, type: 'single',
      stem: '$\\int_0^2 x^2\\,dx$ 的值是？',
      options: ['A. 2', 'B. 8/3', 'C. 4', 'D. 4/3'],
      answer: 1,
      explain: '原函数 $x^3/3$，$[x^3/3]_0^2 = 8/3$。这正是「积分与黎曼和」课案步骤4 展示的结论。',
      points: ['牛顿-莱布尼茨公式'],
    },
    {
      id: 'q-int-3', courseId: 'integral', chapter: '黎曼和', difficulty: 2, type: 'judge',
      stem: '当 $n \\to \\infty$ 时，黎曼和 $R_n$ 一定收敛到真实积分值。',
      options: ['对', '错'],
      answer: true,
      explain: '对**可积函数**（如连续函数），黎曼和在 $n\\to\\infty$ 时收敛到定积分值。这是定积分的定义。',
      points: ['黎曼和', '定积分定义'],
    },

    // ============ indefinite-integral（不定积分） ============
    {
      id: 'q-iint-1', courseId: 'indefinite-integral', chapter: '原函数', difficulty: 1, type: 'single',
      stem: '$\\int 2x\\,dx$ 等于？',
      options: ['A. $x^2$', 'B. $x^2 + C$', 'C. $2x^2 + C$', 'D. $x + C$'],
      answer: 1,
      explain: '因为 $(x^2)\\prime = 2x$，故原函数为 $x^2 + C$。**注意 $+C$ 不能漏**——不定积分结果必含任意常数。',
      points: ['原函数', '+C 任意常数'],
    },
    {
      id: 'q-iint-2', courseId: 'indefinite-integral', chapter: '基本积分表', difficulty: 1, type: 'single',
      stem: '$\\int \\cos x\\,dx$ 等于？',
      options: ['A. $\\sin x + C$', 'B. $-\\cos x + C$', 'C. $-\\sin x + C$', 'D. $\\tan x + C$'],
      answer: 0,
      explain: '因为 $(\\sin x)\\prime = \\cos x$，故 $\\int \\cos x\\,dx = \\sin x + C$。积分公式 = 求导公式左右对调。',
      points: ['基本积分表', '三角函数'],
    },
    {
      id: 'q-iint-3', courseId: 'indefinite-integral', chapter: '换元法', difficulty: 3, type: 'single',
      stem: '$\\int 2x \\cos(x^2)\\,dx$ 等于？',
      options: ['A. $\\sin(x^2) + C$', 'B. $\\cos(x^2) + C$', 'C. $x^2 \\sin(x^2) + C$', 'D. $-\\sin(x^2) + C$'],
      answer: 0,
      explain: '令 $u=x^2$，$du=2x\\,dx$，原式 $= \\int \\cos u\\,du = \\sin u + C = \\sin(x^2) + C$。这是凑微分的典型例子。',
      points: ['换元积分法', '凑微分'],
    },
    {
      id: 'q-iint-4', courseId: 'indefinite-integral', chapter: '分部积分', difficulty: 3, type: 'single',
      stem: '$\\int x e^x\\,dx$ 等于？',
      options: ['A. $xe^x + C$', 'B. $(x+1)e^x + C$', 'C. $(x-1)e^x + C$', 'D. $e^x + C$'],
      answer: 2,
      explain: '分部积分：$u=x, dv=e^x dx$，$\\int xe^x = xe^x - \\int e^x = xe^x - e^x + C = (x-1)e^x + C$。',
      points: ['分部积分法'],
    },

    // ============ integral-applications（定积分应用） ============
    {
      id: 'q-ia-1', courseId: 'integral-applications', chapter: '面积', difficulty: 1, type: 'single',
      stem: '$\\int_0^\\pi \\sin x\\,dx$ 等于曲线 $y=\\sin x$ 在 $[0,\\pi]$ 上的什么？',
      options: ['A. 弧长', 'B. 与 x 轴围成的面积', 'C. 旋转体积', 'D. 平均值'],
      answer: 1,
      explain: '$\\int_0^\\pi \\sin x\\,dx = [-\\cos x]_0^\\pi = 2$，几何意义是 sin 在 $[0,\\pi]$ 与 x 轴围成的面积。',
      points: ['定积分的面积意义'],
    },
    {
      id: 'q-ia-2', courseId: 'integral-applications', chapter: '旋转体积', difficulty: 2, type: 'single',
      stem: '$y = x$（$0 \\le x \\le 1$）绕 $x$ 轴旋转的体积 $V = $ ？',
      options: ['A. $\\pi/3$', 'B. $2\\pi/3$', 'C. $\\pi$', 'D. $\\pi/2$'],
      answer: 0,
      explain: '圆盘法 $V=\\pi\\int_0^1 x^2\\,dx = \\pi/3$。得到的是底半径 1、高 1 的圆锥。',
      points: ['圆盘法', '旋转体体积'],
    },
    {
      id: 'q-ia-3', courseId: 'integral-applications', chapter: '弧长', difficulty: 3, type: 'fill',
      stem: '曲线 $y = x$（$0 \\le x \\le 1$）的弧长 = ？',
      options: [],
      answer: '1.414',
      explain: '$f\'=1$，$L=\\int_0^1\\sqrt{1+1}\\,dx=\\sqrt{2}\\approx 1.414$。其实就是从 (0,0) 到 (1,1) 的直线距离。',
      points: ['弧长公式'],
    },
    {
      id: 'q-ia-4', courseId: 'integral-applications', chapter: '圆柱壳法', difficulty: 3, type: 'judge',
      stem: '对同一旋转体，圆盘法与圆柱壳法算出的体积必定相等。',
      options: ['对', '错'],
      answer: true,
      explain: '两种方法只是切法不同（垂直/平行于旋转轴），对同一立体体积必然一致。选择哪种取决于哪个积分更好算。',
      points: ['圆柱壳法', '与圆盘法等价'],
    },

    // ============ taylor（泰勒级数） ============
    {
      id: 'q-tay-1', courseId: 'taylor', chapter: '泰勒展开', difficulty: 2, type: 'single',
      stem: '$e^x$ 在 $x=0$ 处的二阶泰勒多项式是？',
      options: ['A. $1 + x + x^2$', 'B. $1 + x + x^2/2$', 'C. $1 + x + x^2/4$', 'D. $1 + x + x^2/6$'],
      answer: 1,
      explain: '$e^x$ 各阶导在 0 处都是 1，系数 $= f^{(k)}(0)/k! = 1/k!$，故 $T_2 = 1 + x + x^2/2$。',
      points: ['泰勒系数', '指数函数展开'],
    },
    {
      id: 'q-tay-2', courseId: 'taylor', chapter: '收敛半径', difficulty: 3, type: 'single',
      stem: '$\\ln(1+x)$ 的麦克劳林级数收敛半径 $R$ 是？',
      options: ['A. $\\infty$', 'B. 2', 'C. 1', 'D. 1/2'],
      answer: 2,
      explain: '$\\ln(1+x) = \\sum (-1)^{n-1} x^n/n$，在 $|x|<1$ 收敛、$|x|>1$ 发散，故 $R=1$。这正是泰勒课案步骤3 展示的现象。',
      points: ['收敛半径', '对数级数'],
    },
    {
      id: 'q-tay-3', courseId: 'taylor', chapter: '泰勒展开', difficulty: 2, type: 'single',
      stem: '$\\sin x$ 在 $x=0$ 处的三阶泰勒多项式是？',
      options: ['A. $x - x^3/6$', 'B. $x - x^3/3$', 'C. $x - x^3/2$', 'D. $x + x^3/6$'],
      answer: 0,
      explain: '$\\sin x$ 的奇数阶导在 0 处交替为 $1, -1, ...$，偶数阶为 0。$T_3 = x - x^3/3! = x - x^3/6$。',
      points: ['正弦函数展开', '泰勒系数'],
    },

    // ============ series-basics（级数） ============
    {
      id: 'q-ser-1', courseId: 'series-basics', chapter: '等比级数', difficulty: 1, type: 'single',
      stem: '$\\sum_{n=0}^{\\infty} (1/2)^n$ 的和是？',
      options: ['A. 1', 'B. 2', 'C. 3', 'D. $\\infty$'],
      answer: 1,
      explain: '等比级数公式 $\\sum r^n = 1/(1-r)$，$r=1/2$ 时和 $= 1/(1-1/2) = 2$。',
      points: ['等比级数', '求和公式'],
    },
    {
      id: 'q-ser-2', courseId: 'series-basics', chapter: '调和级数', difficulty: 2, type: 'single',
      stem: '下列级数中哪个**发散**？',
      options: ['A. $\\sum (1/2)^n$', 'B. $\\sum 1/n^2$', 'C. $\\sum 1/n$', 'D. $\\sum 1/n!$'],
      answer: 2,
      explain: '$\\sum 1/n$ 是调和级数，**发散**（虽然通项→0）。其余三个均收敛（几何、p=2 的 p 级数、阶乘倒数）。',
      points: ['调和级数发散', '收敛判定'],
    },
    {
      id: 'q-ser-3', courseId: 'series-basics', chapter: '收敛必要条件', difficulty: 2, type: 'judge',
      stem: '若级数 $\\sum a_n$ 收敛，则 $\\lim_{n\\to\\infty} a_n = 0$。',
      options: ['对', '错'],
      answer: true,
      explain: '这是收敛的**必要条件**（逆命题不成立——调和级数通项→0 却发散）。',
      points: ['收敛必要条件'],
    },

    // ============ positive-series（正项级数审敛法） ============
    {
      id: 'q-ps-1', courseId: 'positive-series', chapter: 'p 级数', difficulty: 2, type: 'single',
      stem: '$\\sum_{n=1}^{\\infty} \\frac{1}{n^{1.5}}$ 收敛还是发散？',
      options: ['A. 收敛', 'B. 发散', 'C. 无法判定', 'D. 条件收敛'],
      answer: 0,
      explain: 'p 级数 $\\sum 1/n^p$ 当 $p>1$ 收敛。$1.5 > 1$，故收敛。',
      points: ['p 级数', 'p>1 收敛'],
    },
    {
      id: 'q-ps-2', courseId: 'positive-series', chapter: '比值判别法', difficulty: 3, type: 'single',
      stem: '用比值判别法，$\\sum_{n=1}^{\\infty} \\frac{n!}{n^n}$ 的敛散性是？',
      options: ['A. 收敛', 'B. 发散', 'C. 无法判定（ρ=1）', 'D. 条件收敛'],
      answer: 0,
      explain: '$a_{n+1}/a_n = (n/(n+1))^n \\to 1/e \\approx 0.368 < 1$，故收敛。',
      points: ['比值判别法', '阶乘级数'],
    },
    {
      id: 'q-ps-3', courseId: 'positive-series', chapter: '根值判别法', difficulty: 3, type: 'single',
      stem: '$\\sum_{n=1}^{\\infty} \\left(\\frac{n}{2n+1}\\right)^n$ 的敛散性是？',
      options: ['A. 收敛', 'B. 发散', 'C. 无法判定', 'D. 条件收敛'],
      answer: 0,
      explain: '根值判别法：$\\sqrt[n]{a_n} = n/(2n+1) \\to 1/2 < 1$，故收敛。根值法对含 $n$ 次幂的通项特别有效。',
      points: ['根值判别法'],
    },
    {
      id: 'q-ps-4', courseId: 'positive-series', chapter: '比较判别法', difficulty: 2, type: 'judge',
      stem: '若 $\\lim_{n\\to\\infty} a_n/b_n = 0$ 且 $\\sum b_n$ 收敛，则 $\\sum a_n$ 收敛。',
      options: ['对', '错'],
      answer: true,
      explain: '极限形式：$c=0 \\in [0,+\\infty)$。$b_n$ 收敛且 $a_n$ 比 $b_n$ 更小（高阶无穷小），故 $a_n$ 也收敛。',
      points: ['比较判别法极限形式'],
    },

    // ============ fourier-series（傅里叶级数） ============
    {
      id: 'q-fs-1', courseId: 'fourier-series', chapter: '三角基', difficulty: 2, type: 'single',
      stem: '傅里叶级数用什么函数作为"基"来分解周期函数？',
      options: ['A. 多项式 $x^n$', 'B. 三角函数 $\\sin nx, \\cos nx$', 'C. 指数函数 $e^{nx}$', 'D. 对数函数'],
      answer: 1,
      explain: '傅里叶级数用三角函数 $\\{1, \\cos nx, \\sin nx\\}$ 作为正交基。多项式是泰勒级数的基，二者擅长不同。',
      points: ['傅里叶基', '正交性'],
    },
    {
      id: 'q-fs-2', courseId: 'fourier-series', chapter: '方波', difficulty: 2, type: 'single',
      stem: '方波的傅里叶级数包含哪些频率分量？',
      options: ['A. 所有整数频率', 'B. 仅奇次频率（1,3,5,...）', 'C. 仅偶次频率', 'D. 仅基频'],
      answer: 1,
      explain: '方波是奇函数且具半波对称性，只含奇次正弦分量 $\\sin x, \\sin 3x, \\sin 5x, \\ldots$。',
      points: ['方波傅里叶级数', '奇次谐波'],
    },
    {
      id: 'q-fs-3', courseId: 'fourier-series', chapter: '吉布斯现象', difficulty: 3, type: 'single',
      stem: '傅里叶级数逼近方波时，跳变处的过冲（吉布斯现象）会随项数增加如何变化？',
      options: ['A. 完全消失', 'B. 高度降低', 'C. 高度不变但变窄', 'D. 振荡加剧'],
      answer: 2,
      explain: '吉布斯现象：过冲约 9% **不随项数消失**，增加项数只让过冲区域**变窄**。这是有限带宽系统无法完美重建阶跃的体现。',
      points: ['吉布斯现象', '不连续点收敛'],
    },
    {
      id: 'q-fs-4', courseId: 'fourier-series', chapter: '狄利克雷条件', difficulty: 3, type: 'single',
      stem: '在狄利克雷条件下，傅里叶级数在间断点收敛到什么值？',
      options: ['A. 左极限', 'B. 右极限', 'C. 左右极限的平均', 'D. 0'],
      answer: 2,
      explain: '间断点处级数收敛到 $\\frac{f(x^+)+f(x^-)}{2}$（左右极限平均）。如方波在跳变处收敛到 0 而非 ±1。',
      points: ['狄利克雷条件', '间断点收敛值'],
    },

    // ============ partial-derivative（偏导数） ============
    {
      id: 'q-pd-1', courseId: 'partial-derivative', chapter: '偏导计算', difficulty: 2, type: 'single',
      stem: '$f(x,y) = x^2 y$，则 $\\frac{\\partial f}{\\partial x} =$ ？',
      options: ['A. $2xy$', 'B. $x^2$', 'C. $x^2 y$', 'D. $2x$'],
      answer: 0,
      explain: '求 $\\partial f/\\partial x$ 时 $y$ 当常数：$(x^2 y)$ 对 $x$ 求导 $= 2xy$。',
      points: ['偏导数计算', '幂函数'],
    },
    {
      id: 'q-pd-2', courseId: 'partial-derivative', chapter: '偏导计算', difficulty: 3, type: 'single',
      stem: '$f(x,y) = e^{xy}$，则 $\\frac{\\partial f}{\\partial y} =$ ？',
      options: ['A. $e^{xy}$', 'B. $x\\,e^{xy}$', 'C. $y\\,e^{xy}$', 'D. $xy\\,e^{xy}$'],
      answer: 1,
      explain: '对 $y$ 求导，$x$ 当常数：$(e^{xy})\'_y = e^{xy} \\cdot \\frac{\\partial(xy)}{\\partial y} = x\\,e^{xy}$（链式法则）。',
      points: ['偏导数计算', '链式法则', '指数函数'],
    },
    {
      id: 'q-pd-3', courseId: 'partial-derivative', chapter: '混合偏导', difficulty: 3, type: 'single',
      stem: '克莱罗定理说，在什么条件下 $\\frac{\\partial^2 f}{\\partial x\\,\\partial y} = \\frac{\\partial^2 f}{\\partial y\\,\\partial x}$？',
      options: ['A. $f$ 连续', 'B. 两个混合偏导连续', 'C. $f$ 可微', 'D. 总是成立'],
      answer: 1,
      explain: '克莱罗定理要求**两个混合偏导都连续**。仅 $f$ 连续或可微不够。不连续时混合偏导可能不等。',
      points: ['克莱罗定理', '混合偏导连续性'],
    },
    {
      id: 'q-pd-4', courseId: 'partial-derivative', chapter: '几何意义', difficulty: 2, type: 'single',
      stem: '$\\frac{\\partial f}{\\partial x}$ 的几何意义是？',
      options: ['A. 沿 $y$ 方向的切线斜率', 'B. 沿 $x$ 方向的切线斜率', 'C. 曲面的法向量', 'D. 函数的最大值'],
      answer: 1,
      explain: '$\\partial f/\\partial x$ 是固定 $y$、只让 $x$ 变化时切面曲线的斜率，即沿 $x$ 方向看坡度。',
      points: ['偏导数几何意义'],
    },

    // ============ gradient（方向导数与梯度） ============
    {
      id: 'q-gr-1', courseId: 'gradient', chapter: '梯度定义', difficulty: 2, type: 'single',
      stem: '$f(x,y) = x^2 + y^2$ 在点 $(1, 2)$ 处的梯度 $\\nabla f =$ ？',
      options: ['A. $(1, 2)$', 'B. $(2, 4)$', 'C. $(2x, 2y)$', 'D. $(4, 2)$'],
      answer: 1,
      explain: '$\\partial f/\\partial x = 2x = 2$，$\\partial f/\\partial y = 2y = 4$，故 $\\nabla f = (2, 4)$。注意 $(2x,2y)$ 是表达式不是具体值。',
      points: ['梯度计算'],
    },
    {
      id: 'q-gr-2', courseId: 'gradient', chapter: '梯度性质', difficulty: 2, type: 'single',
      stem: '梯度 $\\nabla f$ 与过该点的等高线有什么几何关系？',
      options: ['A. 平行', 'B. 垂直', 'C. 成 45° 角', 'D. 无固定关系'],
      answer: 1,
      explain: '梯度**垂直于等高线**，指向 $f$ 增大方向。因为沿等高线 $f$ 不变，方向导数 $\\nabla f \\cdot \\mathbf{u} = 0$。',
      points: ['梯度垂直等高线'],
    },
    {
      id: 'q-gr-3', courseId: 'gradient', chapter: '方向导数', difficulty: 3, type: 'single',
      stem: '若 $|\\nabla f| = 5$，方向 $\\mathbf{u}$ 与 $\\nabla f$ 夹角 $\\theta = 60°$，则方向导数 $D_{\\mathbf{u}}f =$ ？',
      options: ['A. 5', 'B. 2.5', 'C. $5\\sqrt{3}/2$', 'D. 0'],
      answer: 1,
      explain: '$D_{\\mathbf{u}}f = |\\nabla f|\\cos\\theta = 5 \\times \\cos 60° = 5 \\times 0.5 = 2.5$。',
      points: ['方向导数公式'],
    },
    {
      id: 'q-gr-4', courseId: 'gradient', chapter: '最速下降', difficulty: 3, type: 'judge',
      stem: '最速下降法中，每一步沿 $-\\nabla f$ 方向移动，这是因为 $-\\nabla f$ 是 $f$ 下降最快的方向。',
      options: ['对', '错'],
      answer: true,
      explain: '梯度方向是增大最快，反方向 $-\\nabla f$ 自然是下降最快。这是梯度下降优化的理论基础。',
      points: ['最速下降法', '梯度方向'],
    },

    // ============ double-integral（二重积分） ============
    {
      id: 'q-di-1', courseId: 'double-integral', chapter: '概念', difficulty: 2, type: 'single',
      stem: '$\\iint_D f(x,y)\\,dA$ 当 $f(x,y) > 0$ 时的几何意义是？',
      options: ['A. 曲线的弧长', 'B. 曲面的面积', 'C. 曲顶柱体的体积', 'D. 区域 D 的面积'],
      answer: 2,
      explain: '$f>0$ 时二重积分表示曲面 $z=f(x,y)$ 下方、区域 $D$ 上方的**曲顶柱体体积**。',
      points: ['二重积分几何意义'],
    },
    {
      id: 'q-di-2', courseId: 'double-integral', chapter: '累次积分', difficulty: 2, type: 'single',
      stem: '$\\int_0^1 \\int_0^1 (x+y)\\,dy\\,dx$ 的值是？',
      options: ['A. 1/2', 'B. 1', 'C. 3/2', 'D. 2'],
      answer: 1,
      explain: '内层 $\\int_0^1(x+y)dy = x+1/2$，外层 $\\int_0^1(x+1/2)dx = 1/2+1/2 = 1$。',
      points: ['累次积分计算'],
    },
    {
      id: 'q-di-3', courseId: 'double-integral', chapter: '极坐标', difficulty: 3, type: 'single',
      stem: '极坐标下二重积分的面积微元 $dA =$ ？',
      options: ['A. $dr\\,d\\theta$', 'B. $r\\,dr\\,d\\theta$', 'C. $r^2\\,dr\\,d\\theta$', 'D. $\\frac{1}{r}dr\\,d\\theta$'],
      answer: 1,
      explain: '极坐标小格面积 $\\approx r\\,\\Delta r\\,\\Delta\\theta$（外圈比内圈宽），故 $dA = r\\,dr\\,d\\theta$。**多了一个 $r$** 是最常见的考点。',
      points: ['极坐标面积微元'],
    },
    {
      id: 'q-di-4', courseId: 'double-integral', chapter: '极坐标', difficulty: 3, type: 'single',
      stem: '$\\iint_{x^2+y^2 \\le 1} 1\\,dA$（单位圆面积）用极坐标计算的结果是？',
      options: ['A. 1', 'B. $\\pi$', 'C. $2\\pi$', 'D. $\\pi/2$'],
      answer: 1,
      explain: '$\\int_0^{2\\pi}\\int_0^1 r\\,dr\\,d\\theta = 2\\pi \\cdot 1/2 = \\pi$。正是单位圆面积公式。',
      points: ['极坐标二重积分', '圆面积'],
    },

    // ============ lagrange-multiplier（拉格朗日乘数法） ============
    {
      id: 'q-lm-1', courseId: 'lagrange-multiplier', chapter: '核心方程', difficulty: 2, type: 'single',
      stem: '拉格朗日乘数法的核心方程是？',
      options: ['A. $\\nabla f = 0$', 'B. $\\nabla f = \\lambda \\nabla g$', 'C. $f = \\lambda g$', 'D. $\\nabla g = 0$'],
      answer: 1,
      explain: '条件极值点处 $\\nabla f$ 与 $\\nabla g$ 共线，即 $\\nabla f = \\lambda \\nabla g$。加上约束 $g=c$ 解方程组。',
      points: ['拉格朗日方程'],
    },
    {
      id: 'q-lm-2', courseId: 'lagrange-multiplier', chapter: '几何意义', difficulty: 2, type: 'single',
      stem: '拉格朗日乘数法中，极值点处目标等高线与约束曲线的关系是？',
      options: ['A. 相交', 'B. 相切', 'C. 垂直', 'D. 无关系'],
      answer: 1,
      explain: '极值点处等高线与约束曲线**相切**（有公共切线），所以两梯度都垂直于切线 → 共线。',
      points: ['等高线与约束相切'],
    },
    {
      id: 'q-lm-3', courseId: 'lagrange-multiplier', chapter: 'λ 的含义', difficulty: 3, type: 'single',
      stem: '拉格朗日乘数 $\\lambda$ 的经济学含义是？',
      options: ['A. 目标函数的最大值', 'B. 约束的松弛量', 'C. 约束放松一个单位时目标的最优变化率', 'D. 约束的梯度模长'],
      answer: 2,
      explain: '$\\lambda = df^*/dc$，即"影子价格"——约束放松一点，目标能改善多少。',
      points: ['乘数 λ 的含义', '影子价格'],
    },
    {
      id: 'q-lm-4', courseId: 'lagrange-multiplier', chapter: '计算', difficulty: 3, type: 'fill',
      stem: '原点到直线 $x+y=4$ 的最短距离 = ？',
      options: [],
      answer: '2.828',
      explain: '拉格朗日：$f=x^2+y^2$，$g=x+y-4=0$。解得 $x=y=2$，距离 $= \\sqrt{4+4} = 2\\sqrt{2} \\approx 2.828$。',
      points: ['拉格朗日计算', '点到直线距离'],
    },

    // ============ ode（微分方程） ============
    {
      id: 'q-ode-1', courseId: 'ode', chapter: '指数增长', difficulty: 1, type: 'single',
      stem: '方程 $\\frac{dy}{dx} = ky$（$k$ 为常数）的通解是？',
      options: ['A. $y = kx + C$', 'B. $y = Ce^{kx}$', 'C. $y = e^{x/k}$', 'D. $y = C/x$'],
      answer: 1,
      explain: '分离变量 $dy/y = k\\,dx$，积分得 $\\ln|y| = kx + C_0$，故 $y = Ce^{kx}$。',
      points: ['可分离变量方程', '指数解'],
    },
    {
      id: 'q-ode-2', courseId: 'ode', chapter: '逻辑斯谛', difficulty: 3, type: 'single',
      stem: '逻辑斯谛方程 $\\frac{dy}{dx} = ky(1 - y/L)$ 的解曲线形状是？',
      options: ['A. 指数增长', 'B. 衰减曲线', 'C. S 型（sigmoid）', 'D. 正弦波'],
      answer: 2,
      explain: '小 $y$ 时近似指数增长，接近 $L$ 时被 $(1-y/L)$ 刹住，整体呈 S 型，常见于种群与传染病模型。',
      points: ['逻辑斯谛方程', 'sigmoid'],
    },
  ];

  // ---- 查询接口 ----
  const QuestionBank = {
    all() { return QUESTIONS.slice(); },
    byCourse(courseId) { return QUESTIONS.filter((q) => q.courseId === courseId); },
    byDifficulty(d) { return QUESTIONS.filter((q) => q.difficulty === d); },
    filter(opts) {
      opts = opts || {};
      return QUESTIONS.filter((q) =>
        (!opts.courseId || q.courseId === opts.courseId)
        && (!opts.difficulty || q.difficulty === opts.difficulty)
      );
    },
    /** 按章节配比随机组卷 */
    compose(paper) {
      // paper = [{courseId, count}, ...]，返回抽到的题（随机不重复）
      const result = [];
      const used = new Set();
      paper.forEach((sec) => {
        const pool = QUESTIONS.filter((q) => q.courseId === sec.courseId && !used.has(q.id));
        // 洗牌
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        pool.slice(0, sec.count).forEach((q) => { result.push(q); used.add(q.id); });
      });
      return result;
    },
    get count() { return QUESTIONS.length; },
  };

  global.QUESTIONS = QUESTIONS;
  global.QuestionBank = QuestionBank;
})(window);
