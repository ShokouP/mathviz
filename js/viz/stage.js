/**
 * mathviz — js/viz/stage.js
 * Stage：可视化舞台。管理一个 Canvas 元素的上下文、高 DPR 适配、resize、
 * 以及 rAF 主循环。提供数学坐标 ↔ 屏幕像素的视口变换（Viewport）。
 *
 * 设计：
 *   - 一个 Stage 绑定一个 canvas；可被 dispose 释放（取消 rAF、移除 resize 监听）
 *   - 视口（viewport）定义数学坐标范围 [xMin,xMax]×[yMin,yMax]，映射到 canvas 像素区
 *   - drawFrame 回调每帧调用，接收 (ctx, viewport, t) 三参；t 是时间戳
 *   - 同一时刻一个 canvas 只有一个 Stage（重复 mount 自动释放旧的）
 *
 * 暴露 window.MVstage.create(canvas, opts) → stage 实例
 */
(function (global) {
  'use strict';

  const REGISTRY = new WeakMap(); // canvas → stage，防重复挂载

  /** 数学视口：把数学坐标映射到画布像素，y 轴翻转（数学向上 vs 屏幕向下） */
  function makeViewport(xRange, yRange, width, height, padding) {
    padding = padding || 0;
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;
    const w = Math.max(1, width - padding * 2);
    const h = Math.max(1, height - padding * 2);
    const sx = w / (xMax - xMin);
    const sy = h / (yMax - yMin);
    return {
      xRange, yRange, width, height, padding,
      // 数学 x → 屏幕 px（左上原点）
      sx: (x) => padding + (x - xMin) * sx,
      // 数学 y → 屏幕 px（翻转 y）
      sy: (y) => padding + (yMax - y) * sy,
      // 屏幕 px → 数学 x
      ux: (px) => xMin + (px - padding) / sx,
      // 屏幕 px → 数学 y
      uy: (py) => yMax - (py - padding) / sy,
      // 每数学单位的像素数（线宽/字号缩放参考）
      pxPerUnitX: sx,
      pxPerUnitY: sy,
    };
  }

  function create(canvas, opts) {
    opts = opts || {};
    if (REGISTRY.has(canvas)) {
      // 重复挂载：先释放旧的（满足"不产生两个并行渲染循环"）
      REGISTRY.get(canvas).dispose();
    }
    const ctx = canvas.getContext('2d');
    let dpr = global.devicePixelRatio || 1;
    let cssW = 0, cssH = 0;
    let viewport = null;
    let rafId = null;
    let disposed = false;
    let lastT = 0;
    // 默认视口范围（可被 setViewport 覆盖）
    let view = {
      xRange: opts.xRange || [-6, 6],
      yRange: opts.yRange || [-4, 4],
    };
    let bgColor = opts.background !== undefined ? opts.background : null; // null=透明
    let onResizeCb = opts.onResize || null;
    let drawFn = opts.drawFrame || null; // 绘制回调（始终保留最后一次）
    let animating = false; // 是否运行 rAF 动画循环

    function resize() {
      const rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 600));
      cssH = Math.max(1, Math.floor(rect.height || canvas.clientHeight || 400));
      dpr = global.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 后续用 CSS 像素绘制
      rebuildViewport();
      if (onResizeCb) onResizeCb(stage);
      // resize 后必须重绘（否则缩放窗口画面会消失）
      renderStatic();
    }

    function rebuildViewport() {
      viewport = makeViewport(view.xRange, view.yRange, cssW, cssH, opts.padding || 24);
    }

    function clear() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      if (bgColor !== null) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cssW, cssH);
      }
    }

    function loop(t) {
      if (disposed) return;
      if (!lastT) lastT = t;
      const dt = t - lastT;
      lastT = t;
      if (drawFn) {
        try {
          drawFn(ctx, viewport, { t, dt, redraw: renderStatic });
        } catch (e) { console.error('[Stage frame]', e); animating = false; }
      }
      if (animating) rafId = global.requestAnimationFrame(loop);
      else rafId = null;
    }

    /** 一次性静态渲染：用当前 drawFn 画一帧，不启动循环 */
    function renderStatic() {
      if (disposed || !drawFn || !viewport) return;
      try { drawFn(ctx, viewport, { t: performance.now(), dt: 0, redraw: null }); }
      catch (e) { console.error('[Stage renderStatic]', e); }
    }

    /**
     * 设置绘制回调。
     * @param fn 绘制函数；传 null 表示清空（之后不再绘制）
     * @param animate 是否启动 rAF 循环；默认 false（静态一次渲染）
     */
    function setDrawFrame(fn, animate) {
      drawFn = fn;
      lastT = 0;
      if (!fn) {
        animating = false;
        if (rafId) { global.cancelAnimationFrame(rafId); rafId = null; }
        return;
      }
      animating = !!animate;
      if (animating) {
        if (!rafId) rafId = global.requestAnimationFrame(loop);
      } else {
        if (rafId) { global.cancelAnimationFrame(rafId); rafId = null; }
        renderStatic();
      }
    }

    function setViewport(xRange, yRange) {
      if (xRange) view.xRange = xRange;
      if (yRange) view.yRange = yRange;
      rebuildViewport();
      renderStatic();
    }

    function getViewport() { return viewport; }
    function getSize() { return { w: cssW, h: cssH, dpr }; }

    function dispose() {
      disposed = true;
      if (rafId) global.cancelAnimationFrame(rafId);
      rafId = null;
      drawFn = null;
      animating = false;
      if (resizeObserver) resizeObserver.disconnect();
      if (resizeHandler) global.removeEventListener('resize', resizeHandler);
      REGISTRY.delete(canvas);
    }

    // resize 监听：优先 ResizeObserver，回退 window resize
    let resizeObserver = null;
    let resizeHandler = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(canvas);
    } else {
      resizeHandler = () => resize();
      global.addEventListener('resize', resizeHandler);
    }

    const stage = {
      canvas, ctx,
      resize, clear, renderStatic,
      setDrawFrame, setViewport, getViewport, getSize,
      get view() { return view; },
      setBg(c) { bgColor = c; },
      dispose,
    };

    resize(); // 初始化尺寸
    REGISTRY.set(canvas, stage);
    return stage;
  }

  global.MVstage = { create, makeViewport, get(canvas) { return REGISTRY.get(canvas); } };
})(window);
