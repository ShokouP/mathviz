/**
 * mathviz — js/viz/axes.js
 * 笛卡尔坐标系绘制：网格、坐标轴、刻度、标签、原点标记。
 * 在给定 ctx 与 viewport 下绘制，作为 scene 的最底层图层。
 *
 * 暴露 window.MVaxes.draw(ctx, viewport, opts)
 */
(function (global) {
  'use strict';

  /** 自动选择"漂亮"的刻度步长（1/2/5 × 10^n） */
  function niceStep(range, targetCount) {
    targetCount = targetCount || 10;
    const rough = range / targetCount;
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    let step;
    if (norm < 1.5) step = 1;
    else if (norm < 3) step = 2;
    else if (norm < 7) step = 5;
    else step = 10;
    return step * pow;
  }

  function fmtTick(v, step) {
    // 根据步长决定小数位
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
    let s = v.toFixed(decimals);
    // 去尾零
    if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, '');
    return s;
  }

  function draw(ctx, vp, opts) {
    opts = opts || {};
    const showGrid = opts.grid !== false;
    const showAxis = opts.axis !== false;
    const showLabels = opts.labels !== false;
    const colorGrid = opts.colorGrid || 'rgba(255,255,255,0.10)';
    const colorAxis = opts.colorAxis || 'rgba(255,255,255,0.55)';
    const colorLabel = opts.colorLabel || 'rgba(255,255,255,0.62)';
    const xStep = opts.xStep || niceStep(vp.xRange[1] - vp.xRange[0], 10);
    const yStep = opts.yStep || niceStep(vp.yRange[1] - vp.yRange[0], 8);
    const labelFont = opts.labelFont || '12px ' + '-apple-system, sans-serif';

    const [xMin, xMax] = vp.xRange;
    const [yMin, yMax] = vp.yRange;

    // ---- 网格 ----
    if (showGrid) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = colorGrid;
      ctx.beginPath();
      // 竖线
      const x0 = Math.ceil(xMin / xStep) * xStep;
      for (let x = x0; x <= xMax + 1e-9; x += xStep) {
        const px = vp.sx(x);
        ctx.moveTo(px, vp.padding);
        ctx.lineTo(px, vp.height - vp.padding);
      }
      // 横线
      const y0 = Math.ceil(yMin / yStep) * yStep;
      for (let y = y0; y <= yMax + 1e-9; y += yStep) {
        const py = vp.sy(y);
        ctx.moveTo(vp.padding, py);
        ctx.lineTo(vp.width - vp.padding, py);
      }
      ctx.stroke();
    }

    // ---- 坐标轴（穿过原点 0，若不在范围内则画在边界）----
    if (showAxis) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colorAxis;
      const axisY = (0 >= yMin && 0 <= yMax) ? 0 : yMin;
      const axisX = (0 >= xMin && 0 <= xMax) ? 0 : xMin;
      const py0 = vp.sy(axisY);
      const px0 = vp.sx(axisX);
      ctx.beginPath();
      // x 轴
      ctx.moveTo(vp.padding, py0);
      ctx.lineTo(vp.width - vp.padding, py0);
      // y 轴
      ctx.moveTo(px0, vp.padding);
      ctx.lineTo(px0, vp.height - vp.padding);
      ctx.stroke();

      // 轴箭头
      const arrow = 6;
      ctx.fillStyle = colorAxis;
      // 右箭头
      ctx.beginPath();
      ctx.moveTo(vp.width - vp.padding, py0);
      ctx.lineTo(vp.width - vp.padding - arrow, py0 - arrow / 2);
      ctx.lineTo(vp.width - vp.padding - arrow, py0 + arrow / 2);
      ctx.closePath(); ctx.fill();
      // 上箭头
      ctx.beginPath();
      ctx.moveTo(px0, vp.padding);
      ctx.lineTo(px0 - arrow / 2, vp.padding + arrow);
      ctx.lineTo(px0 + arrow / 2, vp.padding + arrow);
      ctx.closePath(); ctx.fill();

      // ---- 刻度标签 ----
      if (showLabels) {
        ctx.fillStyle = colorLabel;
        ctx.font = labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const x0 = Math.ceil(xMin / xStep) * xStep;
        for (let x = x0; x <= xMax + 1e-9; x += xStep) {
          if (Math.abs(x) < xStep * 1e-6) continue; // 跳过原点
          const px = vp.sx(x);
          ctx.fillText(fmtTick(x, xStep), px, py0 + 4);
        }
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const y0 = Math.ceil(yMin / yStep) * yStep;
        for (let y = y0; y <= yMax + 1e-9; y += yStep) {
          if (Math.abs(y) < yStep * 1e-6) continue;
          const py = vp.sy(y);
          ctx.fillText(fmtTick(y, yStep), px0 - 6, py);
        }
        // 原点 O
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('O', px0 - 4, py0 + 4);
        // 轴名
        ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('x', vp.width - vp.padding + 4, py0 + 12);
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('y', px0 + 6, vp.padding - 12);
      }
    }
  }

  global.MVaxes = { draw, niceStep, fmtTick };
})(window);
