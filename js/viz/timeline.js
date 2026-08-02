/**
 * mathviz — js/viz/timeline.js
 * 关键帧驱动的动画时间轴。
 *
 * 用法：
 *   const tl = Timeline.create({
 *     duration: 2000,           // 总时长 ms
 *     easing: 'easeInOutCubic', // 缓动名或函数
 *     onProgress(p),            // 每帧回调，p∈[0,1]（已缓动）
 *     onComplete(),             // 到达 1 时
 *     loop: false,              // 是否循环
 *   });
 *   tl.play(); tl.pause(); tl.seek(0.5);
 *
 * 进度 p 由时间换算（已减去 pause），再经 easing。play 接入 stage 的 rAF（避免双循环）。
 *
 * 暴露 window.Timeline.create(opts) → tl
 */
(function (global) {
  'use strict';

  function create(opts) {
    opts = opts || {};
    const duration = Math.max(1, opts.duration || 1000);
    const easingFn = global.MVeasing.get(opts.easing || 'easeInOutCubic');
    const loop = !!opts.loop;
    let rawProgress = 0;   // 原始线性进度 0..1
    let playing = false;
    let lastTs = 0;
    let rafId = null;
    let visibilityHandler = null;

    function eased() { return easingFn(rawProgress); }

    function tick(ts) {
      if (!playing) return;
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;
      rawProgress += dt / duration;
      if (rawProgress >= 1) {
        if (loop) {
          rawProgress = rawProgress % 1;
        } else {
          rawProgress = 1;
          playing = false;
          rafId = null;
          emit();
          if (opts.onComplete) try { opts.onComplete(); } catch (e) { console.error(e); }
          return;
        }
      }
      emit();
      rafId = global.requestAnimationFrame(tick);
    }

    function emit() {
      if (opts.onProgress) {
        try { opts.onProgress(eased(), rawProgress); } catch (e) { console.error('[Timeline.onProgress]', e); }
      }
    }

    function play() {
      if (playing) return;
      if (rawProgress >= 1) rawProgress = 0; // 已完成则重头播
      playing = true;
      lastTs = 0;
      rafId = global.requestAnimationFrame(tick);
      attachVisibility();
    }
    function pause() {
      playing = false;
      if (rafId) { global.cancelAnimationFrame(rafId); rafId = null; }
      detachVisibility();
    }
    function seek(p) {
      rawProgress = global.MVutil.clamp(p, 0, 1);
      playing = false;
      if (rafId) { global.cancelAnimationFrame(rafId); rafId = null; }
      emit();
    }
    function reset() {
      rawProgress = 0;
      pause();
      emit();
    }

    // 页面切到后台自动暂停（满足"不可见时暂停"）
    function attachVisibility() {
      if (visibilityHandler) return;
      visibilityHandler = () => {
        if (document.hidden && playing) {
          pause();
          // 标记：恢复时需手动 play，或自动续——这里自动续
          const autoResume = () => {
            if (!document.hidden) {
              document.removeEventListener('visibilitychange', autoResume);
              // 仅在用户未手动 pause 时恢复
              if (!playing && rawProgress < 1) play();
            }
          };
          document.addEventListener('visibilitychange', autoResume);
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
    function detachVisibility() {
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = null;
      }
    }

    function dispose() {
      pause();
      detachVisibility();
    }

    return {
      play, pause, seek, reset, dispose,
      get progress() { return eased(); },
      get rawProgress() { return rawProgress; },
      get playing() { return playing; },
      get duration() { return duration; },
    };
  }

  global.Timeline = { create };
})(window);
