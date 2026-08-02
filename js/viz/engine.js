/**
 * mathviz — js/viz/engine.js
 * 引擎门面：统一对外接口 window.VIZ。
 *
 * scene 模型：
 *   {
 *     protocol: "v1",
 *     axes: { xRange:[min,max], yRange:[min,max], grid?:bool, ... },
 *     layers: [ {type, ...props}, ... ],
 *     timeline?: { duration, easing?, onProgress?(p, scene) | animate?: fn(p) }
 *   }
 *
 * 接口：
 *   VIZ.mount(canvas)                 挂载舞台
 *   VIZ.execute(scene)                执行一个 scene（静态或带动画）
 *   VIZ.clear()                       清空画布
 *   VIZ.play() / pause() / seek(p)    动画控制
 *   VIZ.dispose()                     卸载
 *
 * 动画机制：若 scene.timeline 存在，execute 会创建 Timeline 并把 onProgress
 * 绑定到 stage 的重绘；若无 timeline，做一次静态渲染。
 */
(function (global) {
  'use strict';

  let stage = null;
  let currentScene = null;
  let timeline = null;
  let mounted = false;

  function assertMounted() {
    if (!mounted || !stage) throw new Error('VIZ not mounted');
  }

  function mount(canvas) {
    if (stage) { stage.dispose(); stage = null; }
    stage = global.MVstage.create(canvas, {});
    mounted = true;
    currentScene = null;
    if (timeline) { timeline.dispose(); timeline = null; }
    return VIZ;
  }

  function clear() {
    assertMounted();
    if (timeline) { timeline.dispose(); timeline = null; }
    currentScene = null;
    stage.setDrawFrame(null);
    stage.clear();
  }

  /**
   * 执行一个 scene。
   * scene.layers 中每个 layer 会按顺序绘制（后绘制在上层）。
   * 若 scene.timeline 存在，启动动画；否则静态渲染。
   */
  function execute(scene) {
    assertMounted();
    if (!scene || typeof scene !== 'object') {
      throw new Error('VIZ.execute: scene 必须是对象');
    }
    if (timeline) { timeline.dispose(); timeline = null; }
    currentScene = normalizeScene(scene);

    // 设置视口
    const axes = currentScene.axes || {};
    stage.setViewport(axes.xRange || [-6, 6], axes.yRange || [-4, 4]);

    const drawScene = (ctx, vp) => {
      ctx.clearRect(0, 0, vp.width, vp.height);
      // 底层：坐标系
      global.MVaxes.draw(ctx, vp, axes);
      // 数据层
      const layers = currentScene.layers || [];
      const layerResults = [];
      for (let i = 0; i < layers.length; i++) {
        // 动画时允许 timeline.animate 修改 layer 属性（已在外部 mutate）
        const r = global.MVprimitives.drawLayer(ctx, vp, layers[i]);
        if (r) layerResults.push({ index: i, data: r });
      }
      currentScene._lastResults = layerResults;
    };

    const tl = currentScene.timeline;
    if (tl && (tl.animate || tl.onProgress)) {
      // 动画模式：stage 走静态渲染，由 timeline.onProgress 在每帧 mutate 后调 renderStatic
      stage.setDrawFrame(drawScene, false);
      timeline = global.Timeline.create({
        duration: tl.duration || 1500,
        easing: tl.easing,
        loop: !!tl.loop,
        onProgress: (p) => {
          // animate 接收进度 p，负责 mutate scene.layers 中的属性
          if (tl.animate) {
            try { tl.animate(p, currentScene); } catch (e) { console.error('[VIZ.animate]', e); }
          }
          if (tl.onProgress) {
            try { tl.onProgress(p, currentScene); } catch (e) { console.error('[VIZ.onProgress]', e); }
          }
          stage.renderStatic();
        },
      });
    } else {
      // 静态模式
      stage.setDrawFrame(drawScene, false);
    }
    return VIZ;
  }

  function play() {
    assertMounted();
    if (timeline) timeline.play();
  }
  function pause() {
    if (timeline) timeline.pause();
  }
  function seek(p) {
    if (timeline) timeline.seek(p);
    else if (stage) stage.renderStatic();
  }

  function dispose() {
    if (timeline) { timeline.dispose(); timeline = null; }
    if (stage) { stage.dispose(); stage = null; }
    mounted = false;
    currentScene = null;
  }

  // ---- 内部：scene 规范化（浅拷贝保留函数引用 + sane 默认）----
  // 注意：不能用 JSON 序列化（会丢失函数），改用一层浅拷贝。
  // layers 数组复制为新数组，每个 layer 对象保留原引用（execute 多次时由调用方负责）；
  // animate/onProgress 等函数必须原样保留。
  function normalizeScene(scene) {
    const copy = Object.assign({}, scene);
    copy.axes = Object.assign({
      xRange: [-6, 6], yRange: [-4, 4], grid: true, axis: true, labels: true,
    }, scene.axes || {});
    copy.layers = (scene.layers || []).slice();
    if (scene.timeline) copy.timeline = Object.assign({}, scene.timeline);
    return copy;
  }

  const VIZ = {
    mount, execute, clear, play, pause, seek, dispose,
    get mounted() { return mounted; },
    get scene() { return currentScene; },
    get stage() { return stage; },
    get timeline() { return timeline; },
    get progress() { return timeline ? timeline.progress : 0; },
  };

  global.VIZ = VIZ;
})(window);
