/**
 * mathviz — js/ai/protocol-bridge.js
 * 流中可视化指令的识别与派发：文本 → 图形的桥。
 *
 * 工作方式（状态机，流式安全）：
 *   - 维护累积缓冲 buffer 与扫描游标 scanPos
 *   - 每收到 token 调 feed(text) → 推进 scan()
 *   - scan 用正则从 scanPos 搜 ```viz 开围栏；找到则进入"累积 raw"状态
 *   - 在 raw 累积期间，每次 feed 都尝试用正则搜闭合 ```；闭合则 parse+execute+onExecute
 *   - 处理完一个围栏，scanPos 跳过它，继续向后搜下一个
 *
 * getDisplayText() 返回去除围栏内容后的文本（围栏位置用 \u0000VIZ:n\u0000 占位）。
 *
 * 暴露 window.MVbridge.create({ onExecute, onError })
 */
(function (global) {
  'use strict';

  const FENCE_OPEN = /```viz\b[ \t]*\n?/;
  const FENCE_CLOSE = /\n?[ \t]*```/;

  function create(opts) {
    opts = opts || {};
    const onExecute = opts.onExecute || function () {};
    const onError = opts.onError || function () {};

    let buffer = '';        // 全部累积文本（含围栏）
    let scanPos = 0;        // 已扫描到的位置（避免重复匹配已处理围栏）
    let inFence = false;    // 是否正在围栏内
    let fenceOpenEnd = -1;  // 当前围栏开标记的结束位置（raw 起点）
    let ranges = [];        // 已处理围栏区间

    function feed(text) {
      buffer += text;
      scan();
    }

    function scan() {
      // 循环处理，直到当前缓冲内没有可处理的围栏事件
      // 用 guard 防死循环：每轮必须推进 scanPos 或改变 inFence
      let guard = 0;
      while (guard++ < 1000) {
        if (!inFence) {
          // 从 scanPos 搜开围栏
          FENCE_OPEN.lastIndex = 0;
          const m = FENCE_OPEN.exec(buffer.slice(scanPos));
          if (!m) {
            // 没有完整开围栏；但需保留可能的半截 ``` 在末尾待下一段 feed
            // 简化：保留 scanPos 不动（下次 feed 重新搜）。但为避免无限匹配，
            // 当 buffer 末尾不含可能的 ``` 前缀时，可推进 scanPos 到末尾-3。
            const tail = buffer.slice(scanPos);
            const lastBacktick = tail.lastIndexOf('`');
            if (lastBacktick >= 0 && lastBacktick >= tail.length - 3) {
              // 末尾可能有未完整的 ``` ，保留到 lastBacktick 之前
              scanPos = scanPos + lastBacktick;
            } else {
              scanPos = buffer.length;
            }
            return;
          }
          // 找到开围栏
          const openStart = scanPos + m.index;
          fenceOpenEnd = openStart + m[0].length;
          inFence = true;
          // 立即检查是否已有闭合（同一段 feed 可能开闭合都在）
          if (!tryClose()) {
            // 没闭合，等下次 feed。scanPos 留在 fenceOpenEnd 之前不推进
            // （这样下次 feed 会重新从 fenceOpenEnd 开始找闭合）
            return;
          }
          // tryClose 成功处理了一个围栏，继续循环找下一个
        } else {
          if (!tryClose()) return; // 仍在围栏内，等更多 feed
        }
      }
    }

    /** 尝试闭合当前围栏。成功处理返回 true，否则 false。 */
    function tryClose() {
      // 从 fenceOpenEnd 搜闭合标记
      FENCE_CLOSE.lastIndex = 0;
      const m = FENCE_CLOSE.exec(buffer.slice(fenceOpenEnd));
      if (!m) return false;
      const raw = buffer.slice(fenceOpenEnd, fenceOpenEnd + m.index);
      const closeEnd = fenceOpenEnd + m.index + m[0].length;
      handleFence(raw, /*openStart*/ findOpenStart(), closeEnd);
      // 推进：跳过整个围栏
      scanPos = closeEnd;
      inFence = false;
      fenceOpenEnd = -1;
      return true;
    }

    /** 反推当前围栏开标记的起始位置（用于占位区间） */
    function findOpenStart() {
      // 开标记在 fenceOpenEnd 之前，是 ```viz...\n
      const before = buffer.slice(0, fenceOpenEnd);
      const idx = before.lastIndexOf('```viz');
      return idx >= 0 ? idx : fenceOpenEnd - 7;
    }

    function handleFence(raw, start, end) {
      const r = global.MVprotocol.parse(raw);
      const range = { start, end, status: r.ok ? 'ok' : (r.parseError ? 'parse' : 'validate') };
      if (r.ok) {
        try {
          global.VIZ.execute(r.scene);
          range.scene = r.scene;
          onExecute(r.scene, range);
        } catch (e) {
          range.status = 'error';
          range.errors = [{ msg: e.message }];
          onError([{ msg: e.message }], range);
        }
      } else {
        range.errors = r.errors;
        onError(r.errors, range);
      }
      ranges.push(range);
    }

    /** 展示文本：围栏区间替换为占位符 \u0000VIZ:n\u0000 */
    function getDisplayText() {
      let text = buffer;
      // 若当前正在围栏内，截断到围栏起点并加 pending 占位
      if (inFence) {
        text = buffer.slice(0, fenceStart()) + '\u0000VIZ:pending\u0000';
      }
      // 从后往前替换已处理围栏
      const sorted = ranges.slice().sort((a, b) => b.start - a.start);
      sorted.forEach((range) => {
        const idx = ranges.indexOf(range);
        const ph = '\u0000VIZ:' + idx + '\u0000';
        text = text.slice(0, range.start) + ph + text.slice(range.end);
      });
      return text;
    }

    function fenceStart() {
      const before = buffer.slice(0, fenceOpenEnd);
      const idx = before.lastIndexOf('```viz');
      return idx >= 0 ? idx : fenceOpenEnd;
    }

    function reset() {
      buffer = '';
      scanPos = 0;
      inFence = false;
      fenceOpenEnd = -1;
      ranges = [];
    }

    return { feed, getDisplayText, reset, get ranges() { return ranges; } };
  }

  global.MVbridge = { create };
})(window);
