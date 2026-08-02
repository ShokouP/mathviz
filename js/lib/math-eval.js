/**
 * mathviz — js/lib/math-eval.js
 * 安全的数学表达式求值器：把字符串（如 "sin(x) + x^2"）编译为 JS 函数。
 *
 * 设计目标：
 *   - 不使用 eval / new Function 直接执行用户串（AI 产出的 fn 字符串不可信）
 *   - 支持变量 x（引擎主自变量），可选第二变量 t
 *   - 支持常见函数：sin cos tan asin acos atan sinh cosh tanh
 *     exp ln/log sqrt abs floor ceil round sign
 *   - 常量：pi e
 *   - 运算：+ - * / ^ %，一元负号，括号
 *
 * 实现：词法 → 中缀 → 逆波兰（RPN）→ 闭包求值。编译一次可多次调用。
 * 暴露 window.MVeval.compile(str) → fn(x, t) 与 parse(str) → AST 校验。
 */
(function (global) {
  'use strict';

  const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2,
    sinh: Math.sinh || ((x) => (Math.exp(x) - Math.exp(-x)) / 2),
    cosh: Math.cosh || ((x) => (Math.exp(x) + Math.exp(-x)) / 2),
    tanh: Math.tanh || ((x) => { const e1 = Math.exp(x), e2 = Math.exp(-x); return (e1 - e2) / (e1 + e2); }),
    exp: Math.exp,
    ln: Math.log, log: Math.log10 || ((x) => Math.log(x) / Math.LN10), log2: Math.log2,
    sqrt: Math.sqrt, cbrt: Math.cbrt,
    abs: Math.abs, floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
    min: Math.min, max: Math.max, pow: Math.pow,
  };
  const CONSTS = { pi: Math.PI, e: Math.E, tau: Math.PI * 2 };

  // ---- 词法 ----
  function tokenize(input) {
    const tokens = [];
    let i = 0;
    const s = input.replace(/\s+/g, '');
    while (i < s.length) {
      const c = s[i];
      // 数字（含小数与科学计数）
      if (/[0-9.]/.test(c)) {
        let j = i + 1;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        // 科学计数 e/E 后跟可选符号与数字（注意与常量 e 区分：此处紧跟数字才算）
        if (j < s.length && /[eE]/.test(s[j]) && /[0-9+\-]/.test(s[j + 1] || '')) {
          j++;
          if (/[+\-]/.test(s[j])) j++;
          while (j < s.length && /[0-9]/.test(s[j])) j++;
        }
        tokens.push({ t: 'num', v: parseFloat(s.slice(i, j)) });
        i = j;
        continue;
      }
      // 标识符（函数/常量/变量）
      if (/[a-zA-Z_]/.test(c)) {
        let j = i + 1;
        while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) j++;
        tokens.push({ t: 'id', v: s.slice(i, j) });
        i = j;
        continue;
      }
      // 运算符
      if ('+-*/%^(),'.indexOf(c) >= 0) {
        tokens.push({ t: 'op', v: c });
        i++;
        continue;
      }
      throw new SyntaxError('math-eval: 非法字符 "' + c + '" 在位置 ' + i);
    }
    return tokens;
  }

  // ---- 中缀 → RPN（Shunting-yard）----
  const PREC = { '+': 2, '-': 2, '*': 3, '/': 3, '%': 3, '^': 4, uMinus: 5 };
  const RIGHT_ASSOC = new Set(['^', 'uMinus']);

  function toRPN(tokens) {
    const out = [];
    const ops = [];
    let prev = null; // 前一个 token，用于识别一元负号
    for (let k = 0; k < tokens.length; k++) {
      const tk = tokens[k];
      if (tk.t === 'num') out.push(tk);
      else if (tk.t === 'id') {
        // 函数 or 常量/变量：函数后必须紧跟 (
        const next = tokens[k + 1];
        if (next && next.t === 'op' && next.v === '(') {
          ops.push({ t: 'fn', v: tk.v });
        } else {
          out.push(tk); // 常量或变量，求值阶段决定
        }
      } else if (tk.t === 'op') {
        if (tk.v === '(') {
          ops.push(tk);
        } else if (tk.v === ')') {
          while (ops.length && ops[ops.length - 1].v !== '(') out.push(ops.pop());
          if (!ops.length) throw new SyntaxError('math-eval: 括号不匹配');
          ops.pop(); // 弹出 (
          // 若栈顶是函数，弹出到输出
          if (ops.length && ops[ops.length - 1].t === 'fn') out.push(ops.pop());
        } else if (tk.v === ',') {
          while (ops.length && ops[ops.length - 1].v !== '(') out.push(ops.pop());
        } else {
          // 区分一元负号：当 - 出现在表达式开头，或紧跟运算符/左括号时
          let op = tk.v;
          const isUnary = op === '-' && (prev === null || (prev.t === 'op' && prev.v !== ')'));
          if (isUnary) op = 'uMinus';
          while (ops.length) {
            const top = ops[ops.length - 1];
            if (top.t === 'fn' || top.v === '(') break;
            if (top.t === 'op' || top.v === 'uMinus') {
              const topPrec = PREC[top.v] || 0;
              const curPrec = PREC[op] || 0;
              if (topPrec > curPrec || (topPrec === curPrec && !RIGHT_ASSOC.has(op))) {
                out.push(ops.pop());
                continue;
              }
            }
            break;
          }
          ops.push({ t: 'op', v: op });
        }
      }
      prev = tk;
    }
    while (ops.length) {
      const o = ops.pop();
      if (o.v === '(' || o.v === ')') throw new SyntaxError('math-eval: 括号不匹配');
      out.push(o);
    }
    return out;
  }

  // ---- RPN → 闭包 ----
  function compileRPN(rpn) {
    // 生成一个 fn(x, t)
    const code = [];
    code.push('var S=Object.create(null);');
    // 预置常量
    for (const k in CONSTS) code.push('S.' + k + '=' + CONSTS[k] + ';');
    code.push('S.x=x; if(t!==undefined)S.t=t;');
    code.push('var st=[];');
    rpn.forEach((tk) => {
      if (tk.t === 'num') code.push('st.push(' + tk.v + ');');
      else if (tk.t === 'id') {
        // 变量/常量在 S 中查
        code.push('st.push(S.' + tk.v + '!==undefined?S.' + tk.v + ':NaN);');
      } else if (tk.t === 'op') {
        if (tk.v === 'uMinus') {
          code.push('st.push(-st.pop());');
        } else {
          const map = { '+': '+', '-': '-', '*': '*', '/': '/', '%': '%', '^': '**' };
          code.push('var b=st.pop(),a=st.pop();st.push(a' + (map[tk.v] || tk.v) + 'b);');
        }
      } else if (tk.t === 'fn') {
        const fn = '__f_' + tk.v;
        // 双参函数 min/max/atan2/pow 取两个，其余取一个
        code.push('st.push(__fn_' + tk.v + '.apply(null,(st.pop2?st.splice(st.length-2):[st.pop()])));');
      }
    });
    code.push('return st.pop();');
    // 注入函数表
    const fns = {};
    Object.keys(FUNCS).forEach((name) => { fns['__fn_' + name] = FUNCS[name]; });
    // 由于 min/max/atan2/pow 需两参，给 st 加 pop2 行为：上面用 splice(length-2)
    // 修正：重新生成更稳的代码
    const body = rpnToBody(rpn);
    try {
      // eslint-disable-next-line no-new-func
      return new Function('x', 't', '__F', body);
    } catch (e) {
      throw new SyntaxError('math-eval: 编译失败 ' + e.message);
    }
  }

  function rpnToBody(rpn) {
    const lines = ['var st=[];'];
    rpn.forEach((tk) => {
      if (tk.t === 'num') {
        lines.push('st.push(' + tk.v + ');');
      } else if (tk.t === 'id') {
        const c = CONSTS[tk.v];
        if (c !== undefined) lines.push('st.push(' + c + ');');
        else if (tk.v === 'x') lines.push('st.push(x);');
        else if (tk.v === 't') lines.push('st.push(t===undefined?0:t);');
        else throw new SyntaxError('math-eval: 未知标识符 "' + tk.v + '"');
      } else if (tk.t === 'op') {
        if (tk.v === 'uMinus') lines.push('st.push(-st.pop());');
        else if (tk.v === '^') lines.push('var b=st.pop(),a=st.pop();st.push(Math.pow(a,b));');
        else lines.push('var b=st.pop(),a=st.pop();st.push(a ' + tk.v + ' b);');
      } else if (tk.t === 'fn') {
        const arity = (tk.v === 'min' || tk.v === 'max' || tk.v === 'atan2' || tk.v === 'pow') ? 2 : 1;
        if (arity === 2) lines.push('var b=st.pop(),a=st.pop();st.push(__F.' + tk.v + '(a,b));');
        else lines.push('st.push(__F.' + tk.v + '(st.pop()));');
      }
    });
    lines.push('return st.length===1?st[0]:NaN;');
    return lines.join('\n');
  }

  /** 编译表达式为函数；编译失败抛 SyntaxError */
  function compile(str) {
    if (typeof str !== 'string') throw new SyntaxError('math-eval: 输入非字符串');
    const trimmed = str.trim();
    if (!trimmed) throw new SyntaxError('math-eval: 空表达式');
    const tokens = tokenize(trimmed);
    const rpn = toRPN(tokens);
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', 't', '__F', rpnToBody(rpn));
    return function compiled(x, t) {
      try {
        const v = fn(x, t, FUNCS);
        return typeof v === 'number' ? v : NaN;
      } catch (e) { return NaN; }
    };
  }

  /** 安全编译：失败返回 null，并附 .error */
  function tryCompile(str) {
    try {
      return { ok: true, fn: compile(str) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  global.MVeval = { compile, tryCompile, FUNCS, CONSTS };
})(window);
