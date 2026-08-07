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
    {
      id: 'q-ode-3', courseId: 'ode', chapter: '简谐振动', difficulty: 2, type: 'single',
      stem: '简谐运动方程 $\\frac{d^2 x}{dt^2} = -\\omega^2 x$ 的通解是？',
      options: ['A. $x = Ce^{\\omega t}$', 'B. $x = A\\cos(\\omega t) + B\\sin(\\omega t)$', 'C. $x = At + B$', 'D. $x = A\\cos t$'],
      answer: 1,
 explain: '特征方程 $r^2 + \\omega^2 = 0$，$r = \\pm i\\omega$，通解 $x = A\\cos(\\omega t) + B\\sin(\\omega t)$，可合并为 $R\\cos(\\omega t + \\varphi)$。',
      points: ['二阶常系数齐次方程', '简谐振动'],
    },
    {
      id: 'q-ode-4', courseId: 'ode', chapter: '方向场', difficulty: 2, type: 'judge',
      stem: '方向场（向量场）图的每根小箭头表示该点处解曲线的切线方向。',
      options: ['对', '错'],
      answer: true,
      explain: '方向场在每个点 $(x,y)$ 画一个斜率为 $f(x,y)$ 的小箭头（对 $y\'=f(x,y)$），解曲线处处与方向场相切——这是 ODE 几何直觉的核心。',
      points: ['方向场', '解曲线'],
    },

    // ============ function-properties（函数特性）============
    {
      id: 'q-fp-1', courseId: 'function-properties', chapter: '函数性质', difficulty: 1, type: 'single',
      stem: '函数 $f(x) = x^2$ 在 $(-\\infty, +\\infty)$ 上的奇偶性是？',
      options: ['A. 奇函数', 'B. 偶函数', 'C. 非奇非偶', 'D. 既奇又偶'],
      answer: 1,
      explain: '$f(-x) = (-x)^2 = x^2 = f(x)$，满足 $f(-x)=f(x)$，是偶函数。图像关于 $y$ 轴对称。',
      points: ['奇偶性', '偶函数'],
    },
    {
      id: 'q-fp-2', courseId: 'function-properties', chapter: '函数性质', difficulty: 2, type: 'single',
      stem: '下列函数中，在 $(-\\infty, +\\infty)$ 上**有界**的是？',
      options: ['A. $f(x)=x^2$', 'B. $f(x)=\\sin x$', 'C. $f(x)=e^x$', 'D. $f(x)=1/x$（$x\\neq 0$）'],
      answer: 1,
      explain: '$|\\sin x| \\le 1$ 对所有 $x$ 成立，故 $\\sin x$ 有界。$x^2$、$e^x$ 无上界，$1/x$ 在 $x\\to 0$ 时无界。',
      points: ['有界性'],
    },
    {
      id: 'q-fp-3', courseId: 'function-properties', chapter: '函数性质', difficulty: 2, type: 'multi',
      stem: '关于 $f(x) = \\sin x$ 的性质，下列说法**正确**的有（多选）？',
      options: ['A. 是奇函数', 'B. 是周期为 $2\\pi$ 的函数', 'C. 在 $(-\\infty,+\\infty)$ 上有界', 'D. 是单调递增函数'],
      answer: [0, 1, 2],
      explain: '$\\sin(-x)=-\\sin x$（奇），周期 $2\\pi$，$|\\sin x|\\le 1$（有界）。但它不是单调的（在波峰波谷处增减交替），D 错。',
      points: ['正弦函数性质', '奇偶性', '周期性', '有界性'],
    },
    {
      id: 'q-fp-4', courseId: 'function-properties', chapter: '函数性质', difficulty: 3, type: 'judge',
      stem: '"$f(x)$ 单调递增"等价于"$f(x)$ 有下界"。',
      options: ['对', '错'],
      answer: false,
      explain: '单调递增只能保证 $f$ 有下界（取不到比 $f$ 任意一点更小的值），但不能保证有上界。例如 $f(x)=x$ 单调递增却无上界。两者不等价。',
      points: ['单调性', '有界性'],
    },

    // ============ inverse-composite（反函数与复合函数）============
    {
      id: 'q-ic-1', courseId: 'inverse-composite', chapter: '反函数', difficulty: 1, type: 'single',
      stem: '函数 $f(x) = 2x + 1$ 的反函数 $f^{-1}(x)$ 是？',
      options: ['A. $\\frac{x-1}{2}$', 'B. $\\frac{x+1}{2}$', 'C. $\\frac{1}{2x+1}$', 'D. $2x-1$'],
      answer: 0,
      explain: '令 $y=2x+1$，反解 $x=(y-1)/2$，交换变量得 $f^{-1}(x)=\\frac{x-1}{2}$。验证：$f^{-1}(f(x))=x$。',
      points: ['反函数', '线性函数'],
    },
    {
      id: 'q-ic-2', courseId: 'inverse-composite', chapter: '反函数存在条件', difficulty: 2, type: 'single',
      stem: '函数存在反函数的**充要条件**是？',
      options: ['A. 函数连续', 'B. 函数单调（或严格单调）', 'C. 函数可导', 'D. 函数有界'],
      answer: 1,
      explain: '函数存在反函数 $\\Leftrightarrow$ 它是**一一对应**的；对于定义域到值域的函数，等价于严格单调（递增或递减）。',
      points: ['反函数存在定理', '一一对应'],
    },
    {
      id: 'q-ic-3', courseId: 'inverse-composite', chapter: '复合函数', difficulty: 2, type: 'fill',
      stem: '设 $f(x)=x^2$，$g(x)=x+1$，则复合函数 $(f \\circ g)(x) = f(g(x))$ 的表达式是？（展开）',
      options: [],
      answer: 'x^2+2x+1',
      explain: '$f(g(x)) = f(x+1) = (x+1)^2 = x^2+2x+1$。注意 $(f\\circ g)\\neq(g\\circ f)$：$g(f(x))=x^2+1$。',
      points: ['复合函数', '函数复合顺序'],
    },
    {
      id: 'q-ic-4', courseId: 'inverse-composite', chapter: '反函数导数', difficulty: 3, type: 'single',
      stem: '若 $y=f(x)$ 可导且 $f\'(x)\\neq 0$，则反函数 $x=f^{-1}(y)$ 的导数 $\\frac{dx}{dy}=$ ？',
      options: ['A. $f\'(x)$', 'B. $-f\'(x)$', 'C. $\\frac{1}{f\'(x)}$', 'D. $f\'(1/x)$'],
      answer: 2,
      explain: '反函数求导法则：$\\frac{dx}{dy} = 1\\big/\\frac{dy}{dx} = \\frac{1}{f\'(x)}$。例：$y=e^x$，反函数 $x=\\ln y$，$\\frac{dx}{dy}=1/y=1/e^x$。',
      points: ['反函数求导法则'],
    },

    // ============ elementary-functions（初等函数族）============
    {
      id: 'q-ef-1', courseId: 'elementary-functions', chapter: '指数函数', difficulty: 1, type: 'single',
      stem: '指数函数 $f(x) = e^x$ 的值域是？',
      options: ['A. $(-\\infty, +\\infty)$', 'B. $(0, +\\infty)$', 'C. $[0, +\\infty)$', 'D. $(-\\infty, 0)$'],
      answer: 1,
      explain: '$e^x > 0$ 恒成立，且 $e^x\\to 0$（$x\\to-\\infty$）、$e^x\\to+\\infty$（$x\\to+\\infty$），值域 $(0,+\\infty)$。',
      points: ['指数函数', '值域'],
    },
    {
      id: 'q-ef-2', courseId: 'elementary-functions', chapter: '对数函数', difficulty: 2, type: 'single',
      stem: '$\\log_2 8 + \\log_2 32$ 的值是？',
      options: ['A. 5', 'B. 7', 'C. 8', 'D. 40'],
      answer: 2,
      explain: '$\\log_2 8 = 3$（因 $2^3=8$），$\\log_2 32 = 5$（因 $2^5=32$），和 $=3+5=8$。或用 $\\log a + \\log b = \\log(ab)=\\log_2 256=8$。',
      points: ['对数运算', '对数性质'],
    },
    {
      id: 'q-ef-3', courseId: 'elementary-functions', chapter: '三角函数', difficulty: 2, type: 'judge',
      stem: '$\\sin^2 x + \\cos^2 x = 1$ 对所有实数 $x$ 成立。',
      options: ['对', '错'],
      answer: true,
      explain: '这是毕达哥拉斯恒等式，对所有 $x\\in\\mathbb{R}$ 成立。它是三角函数最根本的恒等式之一。',
      points: ['三角恒等式'],
    },
    {
      id: 'q-ef-4', courseId: 'elementary-functions', chapter: '反三角函数', difficulty: 3, type: 'fill',
      stem: '$\\arcsin(1/2) + \\arccos(1/2) =$ ？（给出弧度值，用 $\\pi$ 表示，如 pi/2）',
      options: [],
      answer: 'pi/2',
      explain: '恒等式 $\\arcsin x + \\arccos x = \\pi/2$。证明：令 $\\arcsin x = \\alpha$，则 $\\arccos x = \\pi/2 - \\alpha$（因 $\\sin\\alpha=x\\Rightarrow\\cos(\\pi/2-\\alpha)=x$）。',
      points: ['反三角函数', '反三角恒等式'],
    },

    // ============ polar-parametric（极坐标与参数方程）============
    {
      id: 'q-pp-1', courseId: 'polar-parametric', chapter: '极坐标', difficulty: 1, type: 'single',
      stem: '直角坐标点 $(1, 1)$ 的极坐标 $(r, \\theta)$ 中，$r$ 等于？',
      options: ['A. $1$', 'B. $\\sqrt{2}$', 'C. $2$', 'D. $\\pi$'],
      answer: 1,
      explain: '$r = \\sqrt{x^2+y^2} = \\sqrt{1+1} = \\sqrt{2}$。$\\theta = \\arctan(y/x) = \\arctan 1 = \\pi/4$。',
      points: ['极坐标变换', '直角坐标转极坐标'],
    },
    {
      id: 'q-pp-2', courseId: 'polar-parametric', chapter: '极坐标曲线', difficulty: 2, type: 'single',
      stem: '极坐标方程 $r = 2\\cos\\theta$ 表示什么曲线？',
      options: ['A. 直线', 'B. 圆', 'C. 抛物线', 'D. 双曲线'],
      answer: 1,
      explain: '$r=2a\\cos\\theta$ 是过原点、圆心在 $(a,0)$ 的圆。这里 $a=1$，是过原点、圆心 $(1,0)$、半径 1 的圆。',
      points: ['极坐标曲线', '圆的极坐标方程'],
    },
    {
      id: 'q-pp-3', courseId: 'polar-parametric', chapter: '参数方程', difficulty: 2, type: 'multi',
      stem: '关于参数方程 $x=\\cos t,\\ y=\\sin t$（$0\\le t\\le 2\\pi$），下列**正确**的有（多选）？',
      options: ['A. 表示单位圆', 'B. $x^2+y^2=1$', 'C. 是闭合曲线', 'D. 是玫瑰线'],
      answer: [0, 1, 2],
      explain: '$\\cos^2 t+\\sin^2 t=1$，故 $x^2+y^2=1$（单位圆）；$t$ 从 $0$ 到 $2\\pi$ 回到起点（闭合）。玫瑰线形如 $r=a\\cos(k\\theta)$，与此不同，D 错。',
      points: ['参数方程', '圆的参数化'],
    },
    {
      id: 'q-pp-4', courseId: 'polar-parametric', chapter: '参数方程求导', difficulty: 3, type: 'single',
      stem: '参数方程 $x=t^2,\\ y=t^3$ 在 $t=1$ 处的 $\\frac{dy}{dx}=$ ？',
      options: ['A. $1$', 'B. $3/2$', 'C. $2/3$', 'D. $3$'],
      answer: 1,
      explain: '$\\frac{dy}{dx}=\\frac{dy/dt}{dx/dt}=\\frac{3t^2}{2t}=\\frac{3t}{2}$。代入 $t=1$ 得 $3/2$。',
      points: ['参数方程求导'],
    },

    // ============ infinitesimals（无穷小的比较）============
    {
      id: 'q-inf-1', courseId: 'infinitesimals', chapter: '无穷小比较', difficulty: 1, type: 'single',
      stem: '当 $x\\to 0$ 时，下列哪个是无穷小量？',
      options: ['A. $\\sin x$', 'B. $\\cos 0$', 'C. $e^x$ 当 $x\\to +\\infty$', 'D. $\\ln 1$'],
      answer: 0,
      explain: '$\\sin x \\to 0$（$x\\to 0$），是无穷小。无穷小 = 极限为 0 的量。',
      points: ['无穷小定义'],
    },
    {
      id: 'q-inf-2', courseId: 'infinitesimals', chapter: '等价无穷小', difficulty: 2, type: 'single',
      stem: '当 $x\\to 0$ 时，$\\tan x$ 的等价无穷小是？',
      options: ['A. $x$', 'B. $x^2$', 'C. $1$', 'D. $\\sqrt{x}$'],
      answer: 0,
      explain: '$\\lim_{x\\to 0}\\frac{\\tan x}{x} = 1$，故 $\\tan x \\sim x$。常用等价无穷小：$\\sin x\\sim\\tan x\\sim\\arcsin x\\sim x$。',
      points: ['等价无穷小', 'tan x ~ x'],
    },
    {
      id: 'q-inf-3', courseId: 'infinitesimals', chapter: '无穷小阶数', difficulty: 2, type: 'fill',
      stem: '当 $x\\to 0$ 时，$1-\\cos x$ 关于 $x$ 的阶数是？（填数字，如 $1-\\cos x$ 与 $x^k$ 同阶）',
      options: [],
      answer: '2',
      explain: '$1-\\cos x = 2\\sin^2(x/2) \\sim 2\\cdot(x/2)^2 = x^2/2$，故 $1-\\cos x$ 是 $x$ 的 2 阶无穷小。',
      points: ['无穷小阶数', '1-cos x'],
    },
    {
      id: 'q-inf-4', courseId: 'infinitesimals', chapter: '等价无穷小替换', difficulty: 3, type: 'single',
      stem: '$\\lim_{x\\to 0}\\frac{e^{x^2}-1}{\\cos x - 1}=$ ？',
      options: ['A. $0$', 'B. $-2$', 'C. $2$', 'D. $\\infty$'],
      answer: 1,
      explain: '替换：$e^{x^2}-1\\sim x^2$，$\\cos x - 1\\sim -x^2/2$。故极限 $= \\frac{x^2}{-x^2/2} = -2$。',
      points: ['等价无穷小替换', '极限计算'],
    },

    // ============ cv-continuity（闭区间连续函数性质）============
    {
      id: 'q-cvc-1', courseId: 'cv-continuity', chapter: '连续性', difficulty: 1, type: 'single',
      stem: '函数 $f(x) = \\frac{1}{x}$ 在 $x=0$ 处？',
      options: ['A. 连续', 'B. 不连续（无定义）', 'C. 左连续但不右连续', 'D. 极限存在但不连续'],
      answer: 1,
      explain: '$f(0)$ 无定义，故 $x=0$ 不在定义域内，谈不上连续。$1/x$ 在其定义域 $(-\\infty,0)\\cup(0,+\\infty)$ 上是连续的。',
      points: ['连续性', '定义域'],
    },
    {
      id: 'q-cvc-2', courseId: 'cv-continuity', chapter: '最值定理', difficulty: 2, type: 'single',
      stem: '闭区间 $[a,b]$ 上**连续**函数的图像，下列哪个结论**成立**？',
      options: ['A. 必有最大值和最小值', 'B. 只有最大值', 'C. 不一定有最值', 'D. 必有零点'],
      answer: 0,
      explain: '这是**最值定理**：闭区间上连续函数必取得最大值与最小值。注意"闭区间"和"连续"两个条件缺一不可。',
      points: ['最值定理', '闭区间连续'],
    },
    {
      id: 'q-cvc-3', courseId: 'cv-continuity', chapter: '介值定理', difficulty: 2, type: 'single',
      stem: '$f(x)$ 在 $[a,b]$ 上连续，$f(a)=-1,\\ f(b)=3$。下列哪个值 $f$ **一定**能取到？',
      options: ['A. $4$', 'B. $0$', 'C. $-2$', 'D. $5$'],
      answer: 1,
      explain: '**介值定理**：连续函数能取到 $f(a)$ 与 $f(b)$ 之间的所有值。$0\\in(-1,3)$，故必存在 $c\\in(a,b)$ 使 $f(c)=0$（零点定理）。',
      points: ['介值定理', '零点定理'],
    },
    {
      id: 'q-cvc-4', courseId: 'cv-continuity', chapter: '一致连续', difficulty: 3, type: 'judge',
      stem: '开区间 $(0, 1)$ 上的连续函数一定一致连续。',
      options: ['对', '错'],
      answer: false,
      explain: '反例：$f(x)=1/x$ 在 $(0,1)$ 连续，但 $x\\to 0^+$ 时 $f\\to+\\infty$，不一致连续。一致连续需要闭区间（或更严格条件）。开区间上连续不保证一致连续。',
      points: ['一致连续', '康托尔定理'],
    },

    // ============ implicit-derivative（隐函数与参数求导）============
    {
      id: 'q-id-1', courseId: 'implicit-derivative', chapter: '隐函数求导', difficulty: 1, type: 'single',
      stem: '圆 $x^2 + y^2 = 1$ 上点 $(0, 1)$ 处的 $\\frac{dy}{dx}=$ ？',
      options: ['A. $0$', 'B. $\\infty$（切线竖直）', 'C. $1$', 'D. $-1$'],
      answer: 0,
      explain: '两边对 $x$ 求导：$2x + 2y\\frac{dy}{dx}=0$，$\\frac{dy}{dx}=-x/y$。代入 $(0,1)$ 得 $-0/1=0$。该点切线水平。',
      points: ['隐函数求导'],
    },
    {
      id: 'q-id-2', courseId: 'implicit-derivative', chapter: '隐函数求导', difficulty: 2, type: 'fill',
      stem: '由 $x^2 + y^2 = 25$ 确定的隐函数，$\\frac{dy}{dx}=$ ？（用 $x, y$ 表示）',
      options: [],
      answer: '-x/y',
      explain: '两边对 $x$ 求导：$2x + 2y\\,y\' = 0$，解得 $y\' = -x/y$。',
      points: ['隐函数求导', '圆方程'],
    },
    {
      id: 'q-id-3', courseId: 'implicit-derivative', chapter: '参数方程求导', difficulty: 2, type: 'single',
      stem: '摆线 $x=t-\\sin t,\\ y=1-\\cos t$ 在 $t=\\pi$ 处的 $\\frac{dy}{dx}=$ ？',
      options: ['A. $0$', 'B. $-1$', 'C. $1$', 'D. 不存在'],
      answer: 0,
      explain: '$\\frac{dy}{dx}=\\frac{dy/dt}{dx/dt}=\\frac{\\sin t}{1-\\cos t}$。$t=\\pi$ 时 $\\sin\\pi=0$，$1-\\cos\\pi=2\\neq 0$，故 $\\frac{dy}{dx}=0$（摆线顶点切线水平）。',
      points: ['参数方程求导', '摆线'],
    },
    {
      id: 'q-id-4', courseId: 'implicit-derivative', chapter: '对数求导法', difficulty: 3, type: 'single',
      stem: '用对数求导法求 $y = x^x$（$x>0$）的导数 $y\'=$ ？',
      options: ['A. $x\\cdot x^{x-1}$', 'B. $x^x(\\ln x + 1)$', 'C. $x^x \\ln x$', 'D. $x^{x+1}$'],
      answer: 1,
      explain: '取对数 $\\ln y = x\\ln x$，两边求导 $\\frac{y\'}{y} = \\ln x + 1$，故 $y\' = x^x(\\ln x + 1)$。',
      points: ['对数求导法', '幂指函数'],
    },

    // ============ differential（微分及其应用）============
    {
      id: 'q-df-1', courseId: 'differential', chapter: '微分定义', difficulty: 1, type: 'single',
      stem: '函数 $y = x^2$ 在 $x=3$ 处的微分 $dy=$ ？（用 $\\Delta x$ 表示）',
      options: ['A. $6\\,\\Delta x$', 'B. $2\\,\\Delta x$', 'C. $9\\,\\Delta x$', 'D. $3\\,\\Delta x$'],
      answer: 0,
      explain: '$dy = f\'(x)\\,dx = 2x\\,\\Delta x$。$x=3$ 时 $dy = 6\\,\\Delta x$。',
      points: ['微分定义', 'dy=f\'(x)dx'],
    },
    {
      id: 'q-df-2', courseId: 'differential', chapter: '微分几何意义', difficulty: 2, type: 'single',
      stem: '微分的几何意义是？',
      options: ['A. 曲线在某点的弧长', 'B. 切线纵坐标的增量', 'C. 函数在该点的值', 'D. 曲线的斜率'],
      answer: 1,
      explain: '$dy$ 是切线纵坐标的增量，而 $\\Delta y$ 是曲线纵坐标的真实增量。$dy\\approx\\Delta y$（$\\Delta x$ 很小时）。',
      points: ['微分几何意义', '切线增量'],
    },
    {
      id: 'q-df-3', courseId: 'differential', chapter: '近似计算', difficulty: 2, type: 'fill',
      stem: '用微分近似计算 $\\sqrt{4.1}\\approx$ ？（保留三位小数）',
      options: [],
      answer: '2.025',
      explain: '$\\sqrt{4.1}=\\sqrt{4+0.1}\\approx\\sqrt{4}+\\frac{1}{2\\sqrt 4}\\cdot 0.1 = 2 + 0.025 = 2.025$。公式：$f(x_0+\\Delta x)\\approx f(x_0)+f\'(x_0)\\Delta x$。',
      points: ['微分近似计算'],
    },
    {
      id: 'q-df-4', courseId: 'differential', chapter: '误差传递', difficulty: 3, type: 'single',
      stem: '测得球半径 $r=10\\pm 0.1$（cm），则体积 $V=\\frac{4}{3}\\pi r^3$ 的**相对误差**约为？',
      options: ['A. $1\\%$', 'B. $3\\%$', 'C. $0.1\\%$', 'D. $10\\%$'],
      answer: 1,
      explain: '$\\frac{dV}{V} = \\frac{4\\pi r^2\\,dr}{\\frac{4}{3}\\pi r^3} = 3\\frac{dr}{r} = 3\\times\\frac{0.1}{10} = 0.03 = 3\\%$。体积相对误差是半径相对误差的 3 倍。',
      points: ['误差传递', '相对误差'],
    },

    // ============ monotonicity-extrema（单调性与极值）============
    {
      id: 'q-me-1', courseId: 'monotonicity-extrema', chapter: '单调性判别', difficulty: 1, type: 'single',
      stem: '函数 $f(x) = x^3$ 在 $(-\\infty, +\\infty)$ 上的单调性是？',
      options: ['A. 单调递增', 'B. 单调递减', 'C. 先增后减', 'D. 非单调'],
      answer: 0,
      explain: '$f\'(x)=3x^2\\ge 0$，且仅在 $x=0$ 处为 0（不改变符号），故 $f$ 在整个实数轴单调递增。',
      points: ['单调性', '导数判别'],
    },
    {
      id: 'q-me-2', courseId: 'monotonicity-extrema', chapter: '极值第一判别法', difficulty: 2, type: 'single',
      stem: '若 $f\'(x_0)=0$ 且 $f\'$ 在 $x_0$ 左正右负，则 $x_0$ 是？',
      options: ['A. 极大值点', 'B. 极小值点', 'C. 拐点', 'D. 不是极值点'],
      answer: 0,
      explain: '第一判别法：$f\'$ 由正变负（"先升后降"）→ 极大值点。形象记忆："+"到"-"是山顶。',
      points: ['极值第一判别法'],
    },
    {
      id: 'q-me-3', courseId: 'monotonicity-extrema', chapter: '极值第二判别法', difficulty: 2, type: 'fill',
      stem: '$f(x)=x^3-3x$ 的驻点是 $x=-1$ 和 $x=1$。用 $f\'\'(x)=6x$ 判断：$x=1$ 是极___值点（填"大"或"小"）。',
      options: [],
      answer: '小',
      explain: '$f\'\'(1)=6>0$，第二判别法：凹（碗底）→ 极小值。$f(1)=-2$。$x=-1$ 处 $f\'\'=-6<0$ → 极大。',
      points: ['极值第二判别法'],
    },
    {
      id: 'q-me-4', courseId: 'monotonicity-extrema', chapter: '闭区间最值', difficulty: 3, type: 'single',
      stem: '$f(x)=2x^3-9x^2+12x-3$ 在 $[0,3]$ 上的最大值出现在？',
      options: ['A. 驻点 $x=1$', 'B. 驻点 $x=2$', 'C. 端点 $x=3$', 'D. 端点 $x=0$'],
      answer: 2,
      explain: '$f(0)=-3,\\ f(1)=2,\\ f(2)=1,\\ f(3)=6$。比较所有驻点与端点，最大值 $f(3)=6$ 在**端点**。这正是"端点常是冠军"的典型例子。',
      points: ['闭区间最值', '驻点与端点比较'],
    },

    // ============ curvature（曲率）============
    {
      id: 'q-cu-1', courseId: 'curvature', chapter: '曲率定义', difficulty: 1, type: 'single',
      stem: '直线的曲率是？',
      options: ['A. $1$', 'B. $0$', 'C. $\\infty$', 'D. 取决于方向'],
      answer: 1,
      explain: '直线不弯曲（切线方向不变），曲率 $\\kappa=0$。曲率衡量曲线"弯的程度"，越弯 $\\kappa$ 越大。',
      points: ['曲率', '直线'],
    },
    {
      id: 'q-cu-2', courseId: 'curvature', chapter: '曲率公式', difficulty: 2, type: 'single',
      stem: '半径为 $R$ 的圆，曲率 $\\kappa=$ ？',
      options: ['A. $R$', 'B. $1/R$', 'C. $R^2$', 'D. $0$'],
      answer: 1,
      explain: '圆处处弯曲程度相同，曲率 $\\kappa=1/R$。半径越大（圆越大），弯曲越缓，曲率越小。',
      points: ['圆的曲率', '曲率半径'],
    },
    {
      id: 'q-cu-3', courseId: 'curvature', chapter: '曲率半径', difficulty: 2, type: 'judge',
      stem: '曲率半径 $\\rho$ 与曲率 $\\kappa$ 互为倒数：$\\rho = 1/\\kappa$。',
      options: ['对', '错'],
      answer: true,
      explain: '曲率半径定义 $\\rho=1/\\kappa$，是与曲线在该点"贴合最紧"的圆（曲率圆/密切圆）的半径。',
      points: ['曲率半径', '曲率圆'],
    },
    {
      id: 'q-cu-4', courseId: 'curvature', chapter: '抛物线曲率', difficulty: 3, type: 'single',
      stem: '抛物线 $y=x^2$ 的曲率在何处最大？',
      options: ['A. $x=0$（顶点）', 'B. $x=1$', 'C. $x\\to\\pm\\infty$', 'D. 各点相同'],
      answer: 0,
      explain: '抛物线在顶点 $(0,0)$ 处弯曲最厉害，曲率最大；向两端越走越平（趋近直线），曲率减小趋近 0。',
      points: ['抛物线', '曲率最大点'],
    },

    // ============ newtons-method（牛顿法）============
    {
      id: 'q-nm-1', courseId: 'newtons-method', chapter: '迭代公式', difficulty: 1, type: 'single',
      stem: '牛顿法求 $f(x)=0$ 的根，迭代公式是？',
      options: ['A. $x_{n+1}=x_n+f(x_n)/f\'(x_n)$', 'B. $x_{n+1}=x_n-f(x_n)/f\'(x_n)$', 'C. $x_{n+1}=x_n-f\'(x_n)/f(x_n)$', 'D. $x_{n+1}=f(x_n)/f\'(x_n)$'],
      answer: 1,
      explain: '在 $x_n$ 处作切线 $y=f(x_n)+f\'(x_n)(x-x_n)$，令 $y=0$ 解出 $x_{n+1}=x_n-f(x_n)/f\'(x_n)$。即"切线与 $x$ 轴交点"。',
      points: ['牛顿迭代公式'],
    },
    {
      id: 'q-nm-2', courseId: 'newtons-method', chapter: '迭代计算', difficulty: 2, type: 'fill',
      stem: '用牛顿法求 $\\sqrt{2}$（即 $f(x)=x^2-2=0$ 的正根）。取 $x_0=2$，求 $x_1=$ ？（保留三位小数）',
      options: [],
      answer: '1.500',
      explain: '$f(2)=2$，$f\'(2)=4$。$x_1=2-2/4=1.5$。再迭代：$x_2=1.5-0.25/3≈1.4167$，已接近 $\\sqrt{2}≈1.4142$。',
      points: ['牛顿法计算', '求根'],
    },
    {
      id: 'q-nm-3', courseId: 'newtons-method', chapter: '收敛速度', difficulty: 2, type: 'single',
      stem: '在根附近，牛顿法的收敛速度是？',
      options: ['A. 线性收敛（每步误差成比例减小）', 'B. 二次收敛（每步误差平方衰减）', 'C. 不收敛', 'D. 与初值无关'],
      answer: 1,
      explain: '牛顿法在根附近**二次收敛**：$e_{n+1}≈C\\,e_n^2$，有效位数每步翻倍。这比二分法（线性收敛）快得多。',
      points: ['二次收敛', '收敛阶'],
    },
    {
      id: 'q-nm-4', courseId: 'newtons-method', chapter: '陷阱', difficulty: 3, type: 'multi',
      stem: '牛顿法可能失效或变慢的情形有（多选）？',
      options: ['A. $f\'(x_n)=0$（切线水平）', 'B. 初值离根太远', 'C. 根是重根（如 $f(x)=x^3$ 的根 $0$）', 'D. 函数处处可导且初值靠近单根'],
      answer: [0, 1, 2],
      explain: 'A：分母为 0 公式崩溃；B：可能发散或收敛到错误的根；C：重根处导数趋于 0，收敛退化为线性甚至更慢。D 是牛顿法**正常工作**的条件，不是失效情形。',
      points: ['牛顿法陷阱', '驻点失效', '重根'],
    },

    // ============ alternating-series（交错级数）============
    {
      id: 'q-as-1', courseId: 'alternating-series', chapter: '交错级数', difficulty: 1, type: 'single',
      stem: '交错级数 $\\sum_{n=1}^{\\infty} (-1)^{n-1} a_n$（$a_n>0$）的通项特征是？',
      options: ['A. 各项正负相同', 'B. 各项正负交替出现', 'C. 各项恒为正', 'D. 各项恒为负'],
      answer: 1,
      explain: '交错级数因 $(-1)^{n-1}$ 使各项**正负交替**：$a_1 - a_2 + a_3 - a_4 + \\cdots$。经典例子是交错调和级数 $1 - 1/2 + 1/3 - \\cdots = \\ln 2$。',
      points: ['交错级数定义'],
    },
    {
      id: 'q-as-2', courseId: 'alternating-series', chapter: '莱布尼茨判别法', difficulty: 2, type: 'multi',
      stem: '莱布尼茨判别法判定 $\\sum (-1)^{n-1} a_n$ 收敛，需要哪两个条件（多选）？',
      options: ['A. $a_n$ 单调递减', 'B. $\\lim_{n\\to\\infty} a_n = 0$', 'C. $\\sum a_n$ 收敛', 'D. $a_n$ 有界'],
      answer: [0, 1],
      explain: '莱布尼茨判别法：$a_n$ 单调递减 **且** $a_n\\to 0$，则交错级数收敛。两条件缺一不可：递减保证步长缩短，趋零保证步长消失。C、D 不是该判别法的条件。',
      points: ['莱布尼茨判别法', '收敛充分条件'],
    },
    {
      id: 'q-as-3', courseId: 'alternating-series', chapter: '截断误差', difficulty: 2, type: 'fill',
      stem: '用莱布尼茨判别法收敛的交错级数，前 $n$ 项部分和 $S_n$ 近似真值 $S$ 的截断误差 $|R_n| \\le$ ？（用通项表示）',
      options: [],
      answer: 'a_{n+1}',
      explain: '$|R_n| = |S - S_n| \\le a_{n+1}$，即误差**不超过第一个被舍弃的项**。这是交错级数独有的优势——正项级数没有这么干净的误差控制。',
      points: ['截断误差', '莱布尼茨误差估计'],
    },
    {
      id: 'q-as-4', courseId: 'alternating-series', chapter: 'Riemann 重排定理', difficulty: 3, type: 'single',
      stem: '关于**条件收敛**的级数（$\\sum a_n$ 收敛但 $\\sum |a_n|$ 发散），Riemann 重排定理说的是？',
      options: ['A. 重排后和不变', 'B. 适当重排可使级数收敛到任意实数（或发散到 $\\pm\\infty$）', 'C. 重排后必然发散', 'D. 只有绝对收敛级数才能重排'],
      answer: 1,
      explain: 'Riemann 重排定理：条件收敛级数通过**适当重排顺序**，可收敛到任意实数，甚至发散到 $\\pm\\infty$。例如交错调和级数（和 $\\ln 2$）"2 正 1 负"重排后和变为 $\\frac{3}{2}\\ln 2$。这揭示了条件收敛级数依赖顺序。',
      points: ['Riemann 重排定理', '条件收敛', '绝对收敛 vs 条件收敛'],
    },

    // ============ absolute-convergence（绝对收敛与条件收敛）============
    {
      id: 'q-ac-1', courseId: 'absolute-convergence', chapter: '收敛分类', difficulty: 1, type: 'single',
      stem: '若 $\\sum |a_n|$ 收敛，则 $\\sum a_n$ 称为？',
      options: ['A. 绝对收敛', 'B. 条件收敛', 'C. 发散', 'D. 无法判断'],
      answer: 0,
      explain: '**绝对收敛**的定义：$\\sum |a_n|$ 收敛。这是"稳固"的收敛——即使去掉所有负号级数仍收敛，说明正负项总量都有限。',
      points: ['绝对收敛定义'],
    },
    {
      id: 'q-ac-2', courseId: 'absolute-convergence', chapter: '判别', difficulty: 2, type: 'single',
      stem: '级数 $\\sum_{n=1}^{\\infty} \\frac{(-1)^n}{\\sqrt{n}}$ 是？',
      options: ['A. 绝对收敛', 'B. 条件收敛', 'C. 发散', 'D. 无法判断'],
      answer: 1,
      explain: '取绝对值得 $\\sum 1/\\sqrt{n} = \\sum 1/n^{1/2}$，$p=1/2 \\le 1$ 发散。但原级数是交错的，$a_n=1/\\sqrt{n}$ 递减且趋于 0，由莱布尼茨判别法收敛。故为**条件收敛**。',
      points: ['条件收敛判别', '莱布尼茨判别法', 'p 级数'],
    },
    {
      id: 'q-ac-3', courseId: 'absolute-convergence', chapter: '绝对收敛性质', difficulty: 2, type: 'judge',
      stem: '"若 $\\sum a_n$ 收敛，则 $\\sum |a_n|$ 也收敛"。',
      options: ['对', '错'],
      answer: false,
      explain: '反例：交错调和级数 $\\sum (-1)^{n-1}/n$ 收敛到 $\\ln 2$，但其绝对值级数 $\\sum 1/n$（调和级数）发散。这正是**条件收敛**——原级数收敛但绝对值级数发散。正确命题是反向的：$\\sum|a_n|$ 收敛 ⟹ $\\sum a_n$ 收敛。',
      points: ['绝对收敛 vs 条件收敛', '逆命题'],
    },
    {
      id: 'q-ac-4', courseId: 'absolute-convergence', chapter: '判别流程', difficulty: 3, type: 'multi',
      stem: '关于任意项级数 $\\sum a_n$ 的判别，下列说法**正确**的有（多选）？',
      options: ['A. 若 $\\sum |a_n|$ 收敛，则 $\\sum a_n$ 收敛', 'B. 若用比值法得 $\\lim |a_{n+1}/a_n| > 1$，则 $\\sum a_n$ 发散', 'C. 若 $\\sum |a_n|$ 发散（比较法），则 $\\sum a_n$ 必发散', 'D. 绝对收敛级数任意重排后和不变'],
      answer: [0, 1, 3],
      explain: 'A：绝对收敛 ⟹ 收敛（基本定理）。B：比值 $>1$ 时 $|a_n|\\not\\to 0$ 故 $a_n\\not\\to 0$，发散。D：绝对收敛的重排不变性（Riemann 重排定理的逆否）。C **错**：比较法判 $\\sum|a_n|$ 发散不能推出原级数发散（可能条件收敛，如交错调和级数）。',
      points: ['判别流程', '比值法', '重排定理'],
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
