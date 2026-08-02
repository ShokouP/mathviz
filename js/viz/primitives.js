/**
 * mathviz — js/viz/primitives.js
 * 绘图原语集：每个函数在给定 ctx + viewport 下绘制一种图形。
 * 对应 scene.layers[].type：
 *   plot    函数曲线 y=f(x)
 *   point   标记点
 *   tangent 某点切线
 *   riemann 黎曼矩形（左/右/中点取样）
 *   taylor  泰勒多项式逼近
 *   line    任意线段（两点）
 *   text    标注文字
 *   vectorField  向量场（dx/dt, dy/dt 在网格点画箭头）
 *   areaFill     曲线与 x 轴之间的面积填充
 *
 * 表达式求值依赖 window.MVeval.compile。每层可携带 compiled fn 缓存以避免重编译。
 *
 * 暴露 window.MVprimitives.drawLayer(ctx, vp, layer) 与各原语单独函数。
 */
(function (global) {
  'use strict';

  const COLORS = {
    plot: '#4f9cf9',
    point: '#ff8c42',
    tangent: '#ff8c42',
    riemann: 'rgba(74,222,128,0.35)',
    riemannEdge: '#4ade80',
    taylor: '#9d7aff',
    line: '#9aa7b4',
    text: '#e6edf3',
    vectorField: '#9d7aff',
    areaFill: 'rgba(74,222,128,0.25)',
    parametric: '#4f9cf9',
    contour: '#9d7aff',
  };

  /** 取层颜色，layer.color 优先，否则按 type 默认 */
  function colorOf(layer) {
    return layer.color || COLORS[layer.type] || COLORS.line;
  }

  /** 编译表达式为函数（带缓存） */
  function fnOf(layer) {
    if (typeof layer._fn === 'function') return layer._fn;
    if (typeof layer.fn === 'function') { layer._fn = layer.fn; return layer._fn; }
    if (typeof layer.fn === 'string') {
      const r = global.MVeval.tryCompile(layer.fn);
      if (r.ok) { layer._fn = r.fn; return layer._fn; }
      console.warn('[primitives] 表达式编译失败:', layer.fn, r.error);
      layer._fn = () => NaN;
      return layer._fn;
    }
    return () => NaN;
  }

  // ---- plot：函数曲线 ----
  function drawPlot(ctx, vp, layer) {
    const fn = fnOf(layer);
    const [xMin, xMax] = vp.xRange;
    const range = layer.range || [xMin, xMax];
    const samples = layer.samples || Math.max(60, Math.floor(vp.width));
    const [a, b] = range;
    const step = (b - a) / samples;
    const lw = layer.lineWidth || 2.5;

    ctx.save();
    ctx.strokeStyle = colorOf(layer);
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    let pen = false;
    let prevY = NaN;
    for (let i = 0; i <= samples; i++) {
      const x = a + i * step;
      let y;
      try { y = fn(x); } catch (e) { y = NaN; }
      if (!isFinite(y) || Math.abs(y) > 1e6) { pen = false; continue; }
      // 不连续检测：相邻点跳跃过大则断开
      if (pen && isFinite(prevY) && Math.abs(y - prevY) > (vp.yRange[1] - vp.yRange[0]) * 2) {
        pen = false;
      }
      const px = vp.sx(x), py = vp.sy(y);
      if (!pen) { ctx.moveTo(px, py); pen = true; } else { ctx.lineTo(px, py); }
      prevY = y;
    }
    ctx.stroke();
    ctx.restore();
  }

  // ---- parametric：参数曲线 (x(t), y(t)) ----
  // 用于绘制圆、椭圆、利萨如曲线等闭合或参数化轨迹。
  // fx/fy 是关于变量 t 的表达式字符串（MVeval 支持 x、t 两变量，此处用 t）。
  function drawParametric(ctx, vp, layer) {
    const fx = paramFnOf(layer, 'fx');
    const fy = paramFnOf(layer, 'fy');
    const tRange = layer.tRange || [0, 6.2831853]; // 默认 [0, 2π]
    const samples = layer.samples || 240;
    const [tMin, tMax] = tRange;
    const dt = (tMax - tMin) / samples;
    const lw = layer.lineWidth || 2.5;

    ctx.save();
    ctx.strokeStyle = colorOf(layer);
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    let pen = false;
    let prevPx = NaN, prevPy = NaN;
    for (let i = 0; i <= samples; i++) {
      const t = tMin + i * dt;
      let x, y;
      try { x = fx(t); y = fy(t); } catch (e) { x = NaN; y = NaN; }
      if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 1e6 || Math.abs(y) > 1e6) {
        pen = false; continue;
      }
      const px = vp.sx(x), py = vp.sy(y);
      // 不连续检测：相邻像素跳跃过大则断开
      if (pen && isFinite(prevPx) && (Math.abs(px - prevPx) > vp.width * 0.5 || Math.abs(py - prevPy) > vp.height * 0.5)) {
        pen = false;
      }
      if (!pen) { ctx.moveTo(px, py); pen = true; } else { ctx.lineTo(px, py); }
      prevPx = px; prevPy = py;
    }
    ctx.stroke();
    ctx.restore();
  }

  /** 编译 parametric 的 fx/fy 表达式（关于 t）。带缓存，存到 layer._fx/_fy。 */
  function paramFnOf(layer, key) {
    const cacheKey = '_' + key;
    if (typeof layer[cacheKey] === 'function') return layer[cacheKey];
    const expr = layer[key];
    if (typeof expr === 'function') { layer[cacheKey] = expr; return expr; }
    if (typeof expr === 'string') {
      const r = global.MVeval.tryCompile(expr);
      if (r.ok) { layer[cacheKey] = r.fn; return r.fn; }
      console.warn('[parametric] ' + key + ' 编译失败:', expr, r.error);
      layer[cacheKey] = () => NaN;
      return layer[cacheKey];
    }
    return () => NaN;
  }

  // ---- point：标记点 ----
  function drawPoint(ctx, vp, layer) {
    const x = layer.x !== undefined ? layer.x : 0;
    const y = layer.y !== undefined ? layer.y : 0;
    const r = layer.radius || 5;
    ctx.save();
    ctx.fillStyle = colorOf(layer);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(vp.sx(x), vp.sy(y), r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 可选标签
    if (layer.label) {
      ctx.fillStyle = colorOf(layer);
      ctx.font = '13px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(layer.label, vp.sx(x) + r + 4, vp.sy(y) - r);
    }
    ctx.restore();
  }

  // ---- tangent：切线 ----
  // 数值求导：f'(x0) ≈ (f(x0+h)-f(x0-h))/(2h)
  function deriv(fn, x0, h) {
    h = h || 1e-5;
    return (fn(x0 + h) - fn(x0 - h)) / (2 * h);
  }
  function drawTangent(ctx, vp, layer) {
    const fn = fnOf(layer);
    const x0 = layer.at !== undefined ? layer.at : 0;
    const slope = deriv(fn, x0);
    const y0 = fn(x0);
    // 切线方程 y = y0 + slope*(x - x0)，画一段跨越视口的线
    const [xMin, xMax] = vp.xRange;
    const halfLen = layer.halfLen || Math.max(xMax - xMin, 4) / 1.6;
    const xa = x0 - halfLen, xb = x0 + halfLen;
    ctx.save();
    ctx.strokeStyle = colorOf(layer);
    ctx.lineWidth = layer.lineWidth || 2;
    ctx.setLineDash(layer.dashed === false ? [] : [6, 4]);
    ctx.beginPath();
    ctx.moveTo(vp.sx(xa), vp.sy(y0 + slope * (xa - x0)));
    ctx.lineTo(vp.sx(xb), vp.sy(y0 + slope * (xb - x0)));
    ctx.stroke();
    ctx.setLineDash([]);
    // 切点
    ctx.fillStyle = colorOf(layer);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(vp.sx(x0), vp.sy(y0), 5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ---- riemann：黎曼矩形 ----
  function drawRiemann(ctx, vp, layer) {
    const fn = fnOf(layer);
    const range = layer.range || [0, 1];
    const n = Math.max(1, Math.floor(layer.n || 10));
    const mode = layer.mode || 'left'; // left | right | mid
    const [a, b] = range;
    const dx = (b - a) / n;
    ctx.save();
    ctx.fillStyle = colorOf(layer);
    ctx.strokeStyle = COLORS.riemannEdge;
    ctx.lineWidth = 1;
    let area = 0;
    for (let i = 0; i < n; i++) {
      const xl = a + i * dx;
      const sampleX = mode === 'left' ? xl : mode === 'right' ? xl + dx : xl + dx / 2;
      const h = fn(sampleX);
      if (!isFinite(h)) continue;
      area += h * dx;
      const px = vp.sx(xl);
      const pw = vp.sx(xl + dx) - px;
      const py = vp.sy(h);
      const py0 = vp.sy(0);
      const top = Math.min(py, py0);
      const hgt = Math.abs(py - py0);
      ctx.fillRect(px, top, Math.max(0.5, pw), hgt);
      ctx.strokeRect(px, top, Math.max(0.5, pw), hgt);
    }
    ctx.restore();
    return { area };
  }

  // ---- taylor：泰勒多项式 ----
  // 在 x0 处对 fn 做 order 阶泰勒展开，数值求各阶导（有限差分，阶数不宜过高）
  function drawTaylor(ctx, vp, layer) {
    const fn = fnOf(layer);
    const x0 = layer.at !== undefined ? layer.at : 0;
    const order = Math.max(0, Math.min(12, Math.floor(layer.order != null ? layer.order : 3)));
    // 用解析方式不可行（任意表达式），改用数值微分求各阶导数系数
    const derivs = numericalDerivs(fn, x0, order);
    const coeffs = derivs.map((d, k) => d / factorial(k));
    // 多项式函数
    const poly = (x) => {
      let s = 0, xp = 1;
      for (let k = 0; k <= order; k++) {
        s += coeffs[k] * xp;
        xp *= (x - x0);
      }
      return s;
    };
    // 画多项式曲线（复用 plot 逻辑）
    const taylorLayer = Object.assign({}, layer, { _fn: poly, color: layer.color || COLORS.taylor });
    drawPlot(ctx, vp, taylorLayer);
    return { coeffs };
  }

  // 数值求 0..order 阶导数（中心差分，步长随阶数调整）
  function numericalDerivs(fn, x0, order) {
    const out = [fn(x0)];
    // 用复步长（complex step）不行（fn 是实函数），退而用高阶有限差分公式
    // 这里采用递归中心差分：D_k f(x) ≈ (D_{k-1}f(x+h) - D_{k-1}f(x-h))/(2h)
    // 简化实现，阶数 ≤ 8 时精度尚可
    const h = 1e-3;
    function D(k, x) {
      if (k === 0) return fn(x);
      return (D(k - 1, x + h) - D(k - 1, x - h)) / (2 * h);
    }
    for (let k = 1; k <= order; k++) out.push(D(k, x0));
    return out;
  }
  function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }

  // ---- line：任意线段 ----
  function drawLine(ctx, vp, layer) {
    const from = layer.from || [0, 0];
    const to = layer.to || [1, 1];
    ctx.save();
    ctx.strokeStyle = colorOf(layer);
    ctx.lineWidth = layer.lineWidth || 1.5;
    if (layer.dashed) ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(vp.sx(from[0]), vp.sy(from[1]));
    ctx.lineTo(vp.sx(to[0]), vp.sy(to[1]));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ---- text：标注 ----
  function drawText(ctx, vp, layer) {
    const x = layer.x !== undefined ? layer.x : 0;
    const y = layer.y !== undefined ? layer.y : 0;
    ctx.save();
    ctx.fillStyle = colorOf(layer);
    ctx.font = (layer.fontSize || 14) + 'px -apple-system, sans-serif';
    ctx.textAlign = layer.align || 'center';
    ctx.textBaseline = layer.baseline || 'middle';
    ctx.fillText(String(layer.text != null ? layer.text : ''), vp.sx(x), vp.sy(y));
    ctx.restore();
  }

  // ---- vectorField：向量场 ----
  // 给定 dx/dt 与 dy/dt 两个表达式（或合写成 [dx,dy]），在网格采样点上画箭头。
  // 用于展示微分方程方向场、梯度场等。
  function drawVectorField(ctx, vp, layer) {
    const dxFn = compileFieldFn(layer.dx, 'x', 'y');
    const dyFn = compileFieldFn(layer.dy, 'x', 'y');
    const [xMin, xMax] = vp.xRange;
    const [yMin, yMax] = vp.yRange;
    const nx = layer.nx || 12;
    const ny = layer.ny || 8;
    const stepX = (xMax - xMin) / nx;
    const stepY = (yMax - yMin) / ny;
    // 先采样求最大模长，用于归一化箭头长度
    let maxMag = 1e-9;
    const samples = [];
    for (let i = 0; i <= nx; i++) {
      for (let j = 0; j <= ny; j++) {
        const x = xMin + i * stepX;
        const y = yMin + j * stepY;
        let dx, dy;
        try { dx = dxFn(x, y); dy = dyFn(x, y); } catch (e) { dx = NaN; dy = NaN; }
        if (!isFinite(dx) || !isFinite(dy)) continue;
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag > maxMag) maxMag = mag;
        samples.push({ x, y, dx, dy, mag });
      }
    }
    // 归一化：箭头长度按模长比例，但不超过一个网格步的 0.8 倍（视觉清晰）
    const maxLenPx = Math.min(vp.pxPerUnitX * stepX, vp.pxPerUnitY * stepY) * 0.8;
    ctx.save();
    ctx.strokeStyle = colorOf(layer);
    ctx.fillStyle = colorOf(layer);
    ctx.lineWidth = layer.lineWidth || 1.2;
    ctx.lineCap = 'round';
    samples.forEach((s) => {
      const scale = (s.mag / maxMag) * maxLenPx;
      if (scale < 1) return; // 太短不画
      const px = vp.sx(s.x), py = vp.sy(s.y);
      const ux = s.dx / s.mag, uy = -s.dy / s.mag; // 屏幕 y 翻转
      const ex = px + ux * scale, ey = py + uy * scale;
      // 主线
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      // 箭头头部（小三角）
      const ang = Math.atan2(uy, ux);
      const head = Math.min(5, scale * 0.4);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - head * Math.cos(ang - 0.5), ey - head * Math.sin(ang - 0.5));
      ctx.lineTo(ex - head * Math.cos(ang + 0.5), ey - head * Math.sin(ang + 0.5));
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
    return { sampleCount: samples.length, maxMag };
  }

  // 编译含双变量 (x,y) 的表达式。
  // MVeval.compile 只支持单变量 x（第二变量 t），无法直接处理 y。
  // 这里先做安全字符校验（仅允许数学字符），再用 new Function 构造双变量函数。
  // 表达式来源：课案数据（可信）或 AI（经协议校验），非直接用户输入执行。
  function compileFieldFn(expr) {
    if (typeof expr === 'function') return expr;
    if (typeof expr === 'string') {
      const s = expr.trim();
      if (!s) return () => NaN;
      // 安全白名单：数字、字母、+-*/^%().,空格。禁止 = ; [ ] { } ` ' " 等
      if (!/^[0-9a-zA-Z_+\-*/^%().,\s]*$/.test(s)) {
        console.warn('[vectorField] 表达式含非法字符:', s);
        return () => NaN;
      }
      // 把 ^ 替换为 **（new Function 支持），y 直接作为变量名
      const safe = s.replace(/\^/g, '**');
      try {
        // 注入数学函数与常量到作用域
        const F = global.MVeval.FUNCS;
        const C = global.MVeval.CONSTS;
        // eslint-disable-next-line no-new-func
        const fn = new Function('x', 'y', 'F', 'C',
          'with(F){with(C){try{return (' + safe + ')}catch(e){return NaN}}}');
        return (x, y) => fn(x, y, F, C);
      } catch (e) {
        console.warn('[vectorField] 表达式编译失败:', s, e.message);
        return () => NaN;
      }
    }
    return () => NaN;
  }

  // ---- areaFill：曲线与 x 轴之间的面积填充 ----
  // 比 riemann 更适合展示"真实面积"（连续填充而非矩形）。
  function drawAreaFill(ctx, vp, layer) {
    const fn = fnOf(layer);
    const range = layer.range || vp.xRange;
    const [a, b] = range;
    const samples = layer.samples || Math.max(80, Math.floor(vp.width));
    const step = (b - a) / samples;
    ctx.save();
    ctx.fillStyle = colorOf(layer);
    ctx.beginPath();
    // 从 (a, 0) 出发，沿曲线到 (b, fn(b))，再回到 (b, 0)
    const startY = vp.sy(0);
    ctx.moveTo(vp.sx(a), startY);
    let pen = false;
    for (let i = 0; i <= samples; i++) {
      const x = a + i * step;
      let y;
      try { y = fn(x); } catch (e) { y = NaN; }
      if (!isFinite(y)) { pen = false; continue; }
      ctx.lineTo(vp.sx(x), vp.sy(y));
      pen = true;
    }
    ctx.lineTo(vp.sx(b), startY);
    ctx.closePath();
    ctx.fill();
    // 可选描边
    if (layer.edge !== false) {
      ctx.strokeStyle = COLORS.riemannEdge;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
    // 计算面积（梯形法）供显示
    let area = 0;
    let prevX = a, prevY = NaN;
    try { prevY = fn(a); } catch (e) {}
    for (let i = 1; i <= samples; i++) {
      const x = a + i * step;
      let y;
      try { y = fn(x); } catch (e) { y = NaN; }
      if (isFinite(prevY) && isFinite(y)) {
        area += ((prevY + y) / 2) * (x - prevX);
      }
      prevX = x; prevY = y;
    }
    return { area };
  }

  // ---- contour：等高线（二元函数 f(x,y) 的水平集）----
  // 用 marching squares 算法对每个 level 画 {f=c} 曲线。
  // 用于多元函数可视化：偏导/梯度/二重积分的地形图。
  function drawContour(ctx, vp, layer) {
    const fn = compileFieldFn(layer.fn);
    const levels = layer.levels || [0];
    const [xMin, xMax] = vp.xRange;
    const [yMin, yMax] = vp.yRange;
    const nx = layer.nx || 60;
    const ny = layer.ny || 40;
    const dx = (xMax - xMin) / nx;
    const dy = (yMax - yMin) / ny;

    // 采样网格
    const grid = new Array(nx + 1);
    for (let i = 0; i <= nx; i++) {
      grid[i] = new Array(ny + 1);
      for (let j = 0; j <= ny; j++) {
        const x = xMin + i * dx;
        const y = yMin + j * dy;
        let v;
        try { v = fn(x, y); } catch (e) { v = NaN; }
        grid[i][j] = isFinite(v) ? v : NaN;
      }
    }

    ctx.save();
    ctx.strokeStyle = colorOf(layer);
    ctx.lineWidth = layer.lineWidth || 1.2;
    ctx.globalAlpha = layer.opacity != null ? layer.opacity : 0.7;

    // 对每个 level 做 marching squares
    levels.forEach((level) => {
      ctx.beginPath();
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          const v00 = grid[i][j], v10 = grid[i + 1][j];
          const v01 = grid[i][j + 1], v11 = grid[i + 1][j + 1];
          if (!isFinite(v00) || !isFinite(v10) || !isFinite(v01) || !isFinite(v11)) continue;
          // 四角相对 level 的符号（above=1, below=0）
          const c = (v) => (v >= level ? 1 : 0);
          const code = (c(v00) << 3) | (c(v10) << 2) | (c(v11) << 1) | c(v01);
          if (code === 0 || code === 15) continue; // 全同侧，无交点

          // 四条边的插值交点（线性插值）
          const x0 = xMin + i * dx, x1 = x0 + dx;
          const y0 = yMin + j * dy, y1 = y0 + dy;
          // 边上的插值点（返回数学坐标）
          const lerp = (va, vb, xa, xb) => xa + (level - va) / (vb - va) * (xb - xa);
          // 底边 (i,j)-(i+1,j)
          const pBot = () => [lerp(v00, v10, x0, x1), y0];
          // 右边 (i+1,j)-(i+1,j+1)
          const pRight = () => [x1, lerp(v10, v11, y0, y1)];
          // 顶边 (i,j+1)-(i+1,j+1)
          const pTop = () => [lerp(v01, v11, x0, x1), y1];
          // 左边 (i,j)-(i,j+1)
          const pLeft = () => [x0, lerp(v00, v01, y0, y1)];
          const draw = (pa, pb) => {
            const a = pa(), b = pb();
            ctx.moveTo(vp.sx(a[0]), vp.sy(a[1]));
            ctx.lineTo(vp.sx(b[0]), vp.sy(b[1]));
          };
          // 16 种情况的等高线段
          switch (code) {
            case 1: case 14: draw(pLeft, pBot); break;
            case 2: case 13: draw(pBot, pRight); break;
            case 3: case 12: draw(pLeft, pRight); break;
            case 4: case 11: draw(pTop, pRight); break;
            case 5: draw(pLeft, pTop); draw(pBot, pRight); break; // 鞍点，两段
            case 6: case 9: draw(pBot, pTop); break;
            case 7: case 8: draw(pLeft, pTop); break;
            case 10: draw(pLeft, pBot); draw(pTop, pRight); break; // 鞍点，两段
            default: break;
          }
        }
      }
      ctx.stroke();
    });
    ctx.restore();
    return { levels };
  }

  // ---- 派发 ----
  const HANDLERS = {
    plot: drawPlot,
    point: drawPoint,
    tangent: drawTangent,
    riemann: drawRiemann,
    taylor: drawTaylor,
    line: drawLine,
    text: drawText,
    vectorField: drawVectorField,
    areaFill: drawAreaFill,
    parametric: drawParametric,
    contour: drawContour,
  };

  /** 绘制一个 layer；未知类型跳过并 warn。返回该层的附加数据（如 area/coeffs） */
  function drawLayer(ctx, vp, layer) {
    if (!layer || !layer.type) return null;
    const h = HANDLERS[layer.type];
    if (!h) {
      console.warn('Unknown layer type: ' + layer.type);
      return null;
    }
    try {
      return h(ctx, vp, layer) || null;
    } catch (e) {
      console.error('[drawLayer ' + layer.type + ']', e);
      return null;
    }
  }

  global.MVprimitives = {
    drawLayer, drawPlot, drawPoint, drawTangent, drawRiemann, drawTaylor,
    drawLine, drawText, drawVectorField, drawAreaFill, drawParametric, drawContour, deriv, colorOf, COLORS,
  };
})(window);
