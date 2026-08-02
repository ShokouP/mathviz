/**
 * mathviz — js/viz/protocol.js
 * 可视化指令协议：定义 scene 的 JSON Schema 并提供校验。
 *
 * 协议 v1：scene = {
 *   protocol?: "v1",
 *   axes?: { xRange:[a,b], yRange:[a,b], grid?, axis?, labels?, ... },
 *   layers: [ Layer, ... ],
 *   timeline?: { duration, easing?, loop?, animate?: <不支持 JSON，仅本地>, onProgress?: <同> }
 * }
 *
 * Layer 按 type 派发（与 primitives.js 一致）：
 *   plot    { type, fn, color?, range?, samples?, lineWidth? }
 *   point   { type, x, y, radius?, color?, label? }
 *   tangent { type, fn, at, color?, dashed?, halfLen? }
 *   riemann { type, fn, range:[a,b], n, mode:"left"|"right"|"mid", color? }
 *   taylor  { type, fn, at, order, color? }
 *   line    { type, from:[x,y], to:[x,y], color?, lineWidth?, dashed? }
 *   text    { type, x, y, text, color?, fontSize?, align?, baseline? }
 *   clear   { type }  ——特殊：清空画布（不绘制）
 *
 * 校验返回 { ok:boolean, errors:[{path, msg}], scene? }
 * 暴露 window.MVprotocol.validate(sceneObj) 与 window.MVprotocol.parse(jsonStr)
 */
(function (global) {
  'use strict';

  const PROTOCOL_VERSION = 'v1';

  // 每种 layer type 的必填字段与字段类型约束
  const LAYER_SPECS = {
    plot:    { req: ['fn'], opt: { color: 'string', range: 'array2num', samples: 'number', lineWidth: 'number' } },
    point:   { req: [], opt: { x: 'number', y: 'number', radius: 'number', color: 'string', label: 'string' } },
    tangent: { req: ['fn'], opt: { at: 'number', color: 'string', dashed: 'boolean', halfLen: 'number', lineWidth: 'number' } },
    riemann: { req: ['fn'], opt: { range: 'array2num', n: 'number', mode: 'mode', color: 'string' } },
    taylor:  { req: ['fn'], opt: { at: 'number', order: 'number', color: 'string' } },
    line:    { req: [], opt: { from: 'array2num', to: 'array2num', color: 'string', lineWidth: 'number', dashed: 'boolean' } },
    text:    { req: [], opt: { x: 'number', y: 'number', text: 'string', color: 'string', fontSize: 'number', align: 'string', baseline: 'string' } },
    vectorField: { req: [], opt: { dx: 'string', dy: 'string', nx: 'number', ny: 'number', color: 'string', lineWidth: 'number' } },
    areaFill: { req: ['fn'], opt: { range: 'array2num', color: 'string', samples: 'number', edge: 'boolean' } },
    parametric: { req: ['fx', 'fy'], opt: { tRange: 'array2num', samples: 'number', color: 'string', lineWidth: 'number' } },
    contour: { req: ['fn'], opt: { levels: 'array', nx: 'number', ny: 'number', color: 'string', lineWidth: 'number', opacity: 'number' } },
    clear:   { req: [], opt: {} },
  };
  const VALID_MODES = ['left', 'right', 'mid'];

  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function isStr(v) { return typeof v === 'string'; }
  function isArr(v) { return Array.isArray(v); }
  function isArr2Num(v) { return isArr(v) && v.length === 2 && isNum(v[0]) && isNum(v[1]); }

  /** 校验单个字段类型 */
  function checkField(val, type) {
    switch (type) {
      case 'number': return isNum(val);
      case 'string': return isStr(val);
      case 'boolean': return typeof val === 'boolean';
      case 'array2num': return isArr2Num(val);
      case 'mode': return VALID_MODES.indexOf(val) >= 0;
      default: return true;
    }
  }

  /**
   * 校验一个 scene 对象。
   * @param {*} scene
   * @returns {{ok:boolean, errors:Array, scene?:object}}
   */
  function validate(scene) {
    const errors = [];
    if (!scene || typeof scene !== 'object' || Array.isArray(scene)) {
      return { ok: false, errors: [{ path: '$', msg: 'scene 必须是对象', fatal: true }] };
    }
    // protocol 字段（可选）
    if (scene.protocol !== undefined && scene.protocol !== PROTOCOL_VERSION) {
      // 不致命：只是提示
      errors.push({ path: '$.protocol', msg: '协议版本非 v1（"' + scene.protocol + '"），可能不兼容' });
    }
    // axes（可选）
    if (scene.axes !== undefined && scene.axes !== null) {
      if (typeof scene.axes !== 'object' || Array.isArray(scene.axes)) {
        errors.push({ path: '$.axes', msg: 'axes 必须是对象' });
      } else {
        if (scene.axes.xRange !== undefined && !isArr2Num(scene.axes.xRange)) {
          errors.push({ path: '$.axes.xRange', msg: 'xRange 必须是 [min,max] 两个数字' });
        }
        if (scene.axes.yRange !== undefined && !isArr2Num(scene.axes.yRange)) {
          errors.push({ path: '$.axes.yRange', msg: 'yRange 必须是 [min,max] 两个数字' });
        }
      }
    }
    // layers（必填）
    if (!isArr(scene.layers)) {
      errors.push({ path: '$.layers', msg: 'layers 必须是数组', fatal: true });
    } else {
      scene.layers.forEach((layer, i) => {
        const path = '$.layers[' + i + ']';
        if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
          errors.push({ path, msg: 'layer 必须是对象', fatal: true });
          return;
        }
        if (!layer.type) {
          errors.push({ path: path + '.type', msg: '缺少 type 字段', fatal: true });
          return;
        }
        const spec = LAYER_SPECS[layer.type];
        if (!spec) {
          errors.push({ path: path + '.type', msg: '未知 layer 类型："' + layer.type + '"', fatal: true });
          return;
        }
        // 必填字段
        spec.req.forEach((f) => {
          if (layer[f] === undefined || layer[f] === null) {
            errors.push({ path: path + '.' + f, msg: '缺少必填字段 ' + f, fatal: true });
          } else if (f === 'fn' && !isStr(layer.fn) && typeof layer.fn !== 'function') {
            errors.push({ path: path + '.' + f, msg: 'fn 必须是字符串表达式或函数', fatal: true });
          }
        });
        // 可选字段类型检查（存在时才查）
        Object.keys(spec.opt).forEach((f) => {
          if (layer[f] !== undefined && layer[f] !== null) {
            if (!checkField(layer[f], spec.opt[f])) {
              errors.push({ path: path + '.' + f, msg: '字段类型应为 ' + spec.opt[f] + '，实际为 ' + typeof layer[f] });
            }
          }
        });
      });
    }
    // timeline：仅做存在性提示（函数无法 JSON 传输，AI 产出的 timeline 只能含 duration/easing）
    if (scene.timeline !== undefined && scene.timeline !== null) {
      if (typeof scene.timeline !== 'object') {
        errors.push({ path: '$.timeline', msg: 'timeline 必须是对象' });
      }
    }

    // 致命错误（缺 layers、layer 无 type、未知 type、缺必填字段）才算 ok:false。
    // 用 fatal 标记而非正则匹配消息文本，避免中文消息匹配不稳。
    const fatal = errors.some((e) => e.fatal);
    return { ok: !fatal, errors, scene: fatal ? undefined : scene };
  }

  /**
   * 解析 JSON 字符串为 scene。先 JSON.parse，再 validate。
   * @param {string} jsonStr
   * @returns {{ok:boolean, errors:Array, scene?:object}}
   *   JSON.parse 失败时返回 { ok:false, errors:[{msg:'JSON 解析失败: ...'}], parseError:true }
   */
  function parse(jsonStr) {
    if (typeof jsonStr !== 'string') {
      return { ok: false, errors: [{ path: '$', msg: '输入非字符串' }], parseError: true };
    }
    let obj;
    try {
      obj = JSON.parse(jsonStr);
    } catch (e) {
      return { ok: false, errors: [{ path: '$', msg: 'JSON 解析失败: ' + e.message }], parseError: true };
    }
    return validate(obj);
  }

  /** 把 errors 数组格式化为给用户看的字符串 */
  function formatErrors(errors) {
    if (!errors || !errors.length) return '';
    return errors.map((e) => e.path + ': ' + e.msg).join('；');
  }

  global.MVprotocol = {
    version: PROTOCOL_VERSION,
    LAYER_SPECS,
    validate,
    parse,
    formatErrors,
  };
})(window);
