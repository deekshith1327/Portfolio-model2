import { GLYPHS, GLYPHS_BOLD, ProjectItem, TOKENS } from "./data";

export function esc(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normText(str: string): string {
  return String(str)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return function (t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let u = t;
    for (let i = 0; i < 12; i++) {
      u = (lo + hi) * 0.5;
      const mu = 1 - u;
      const x = 3 * mu * mu * u * x1 + 3 * mu * u * u * x2 + u * u * u;
      if (x < t) lo = u;
      else hi = u;
    }
    const mu = 1 - u;
    return 3 * mu * mu * u * y1 + 3 * mu * u * u * y2 + u * u * u;
  };
}

export const easeMorph = cubicBezier(0.7, 0, 0.3, 1);
export const easeAssemble = cubicBezier(0.2, 0, 0, 1);

export interface GlyphCell {
  x: number;
  y: number;
}

export function layoutGlyphLines(
  lines: string[],
  gapRows = 2,
  useBold = false,
  gapCols = 1
): { cols: number; rows: number; cells: GlyphCell[] } {
  const set = useBold ? GLYPHS_BOLD : GLYPHS;
  let maxCols = 0;
  const cells: GlyphCell[] = [];
  let rowOffset = 0;
  for (let l = 0; l < lines.length; l++) {
    const str = lines[l].toUpperCase();
    let colOffset = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const g = set[ch] || set[" "];
      const w = g[0].length;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < w; c++) {
          if (g[r][c] === "#") {
            cells.push({ x: colOffset + c, y: rowOffset + r });
          }
        }
      }
      colOffset += w + (i < str.length - 1 ? gapCols : 0);
    }
    if (colOffset > maxCols) maxCols = colOffset;
    rowOffset += 9 + (l < lines.length - 1 ? gapRows : 0);
  }
  return { cols: maxCols, rows: rowOffset, cells };
}

export function svgBitmapText(
  str: string | string[],
  cellH: number,
  fill?: string,
  opts?: {
    perCell?: boolean;
    fluid?: boolean;
    className?: string;
    ariaHidden?: boolean;
    bold?: boolean;
    gapCols?: number;
  }
): string {
  const o = opts || {};
  const gapCols = o.gapCols ?? 1;
  const layout = layoutGlyphLines(Array.isArray(str) ? str : [str], 2, Boolean(o.bold), gapCols);
  const vbW = Math.max(1, layout.cols * 5);
  const vbH = Math.max(1, layout.rows * 4);
  const color = fill || "currentColor";
  let rects = "";
  if (o.perCell) {
    for (let i = 0; i < layout.cells.length; i++) {
      const cell = layout.cells[i];
      rects += `<rect x="${cell.x * 5}" y="${cell.y * 4}" width="5.25" height="4.25" data-gx="${cell.x}" data-gy="${cell.y}"/>`;
    }
  } else {
    const rowMap = new Map<number, number[]>();
    for (let i = 0; i < layout.cells.length; i++) {
      const cell = layout.cells[i];
      if (!rowMap.has(cell.y)) rowMap.set(cell.y, []);
      rowMap.get(cell.y)!.push(cell.x);
    }
    rowMap.forEach((xs, y) => {
      xs.sort((a, b) => a - b);
      let start = xs[0];
      let prev = xs[0];
      for (let k = 1; k <= xs.length; k++) {
        if (k < xs.length && xs[k] === prev + 1) {
          prev = xs[k];
        } else {
          const span = prev - start + 1;
          rects += `<rect x="${start * 5}" y="${y * 4}" width="${span * 5 + 0.25}" height="4.25"/>`;
          if (k < xs.length) {
            start = xs[k];
            prev = xs[k];
          }
        }
      }
    });
  }
  const wAttr = o.fluid
    ? `width="100%"`
    : `width="${layout.cols * cellH * 1.25}" height="${layout.rows * cellH}"`;
  const cls = o.className ? ` class="${esc(o.className)}"` : "";
  const aria = o.ariaHidden ? ` aria-hidden="true"` : "";
  return `<svg${cls} viewBox="0 0 ${vbW} ${vbH}" ${wAttr} shape-rendering="crispEdges" fill="${color}"${aria}>${rects}</svg>`;
}

export function svgPixelIcon(
  name: "plus" | "minus" | "check" | "arrow-right" | "tri-up" | "tri-down",
  size = 15
): string {
  const grids: Record<string, string[]> = {
    plus: ["..#..", "..#..", "#####", "..#..", "..#.."],
    minus: [".....", ".....", "#####", ".....", "....."],
    check: ["....#", "...#.", "#.#..", ".#...", "....."],
    "arrow-right": ["..#..", "...#.", "#####", "...#.", "..#.."],
    "tri-up": ["..#..", ".###.", "#####", ".....", "....."],
    "tri-down": [".....", ".....", "#####", ".###.", "..#.."]
  };
  const g = grids[name] || grids.plus;
  let rects = "";
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      if (g[y][x] === "#") {
        rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 5 5" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">${rects}</svg>`;
}

export function svgStrike(): string {
  return `<svg class="btn-strike" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
}

export function generateProjectGrid(motif: ProjectItem["motif"]): string[] {
  const g: number[][] = Array.from({ length: 32 }, () => Array(32).fill(0));
  const set = (x: number, y: number, v: number) => {
    const rx = Math.round(x);
    const ry = Math.round(y);
    if (rx >= 0 && rx < 32 && ry >= 0 && ry < 32) g[ry][rx] = v;
  };
  const rect = (x: number, y: number, w: number, h: number, v: number) => {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) set(x + dx, y + dy, v);
    }
  };
  const ring = (cx: number, cy: number, rMin: number, rMax: number, v: number) => {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d >= rMin && d <= rMax) set(x, y, v);
      }
    }
  };

  // Subtle corner frame ticks
  rect(2, 2, 3, 1, 1);
  rect(2, 2, 1, 3, 1);
  rect(27, 29, 3, 1, 1);
  rect(29, 27, 1, 3, 1);

  switch (motif) {
    case "sonar": {
      // Transducer + concentric downward acoustic waves
      rect(13, 4, 6, 4, 2);
      rect(11, 8, 10, 3, 1);
      rect(15, 11, 2, 2, 3);
      for (let y = 13; y < 30; y++) {
        for (let x = 3; x < 29; x++) {
          const d = Math.hypot(x - 16, y - 10);
          if (y > 12 && (Math.abs(d - 6) < 0.7 || Math.abs(d - 11) < 0.7 || Math.abs(d - 16) < 0.7)) {
            if (Math.abs(x - 16) <= (y - 10) * 1.1) set(x, y, d > 13 ? 3 : 1);
          }
        }
      }
      break;
    }
    case "globe": {
      // Planetary sphere + diagonal satellite orbit + ping dots
      ring(16, 16, 0, 8.8, 1);
      ring(16, 16, 7.6, 8.8, 2);
      // Continents
      rect(11, 11, 4, 3, 3);
      rect(13, 14, 3, 4, 3);
      rect(18, 12, 4, 5, 3);
      rect(17, 18, 3, 3, 3);
      // Orbit ring
      for (let t = 0; t < 48; t++) {
        const a = (t / 48) * Math.PI * 2;
        const ox = 16 + Math.cos(a) * 12.5;
        const oy = 16 + Math.sin(a) * 5.2;
        const rx = Math.round((ox - 16) * 0.86 - (oy - 16) * 0.5 + 16);
        const ry = Math.round((ox - 16) * 0.5 + (oy - 16) * 0.86 + 16);
        if (Math.hypot(rx - 16, ry - 16) > 8.8 || ry > 16) set(rx, ry, 2);
      }
      rect(24, 9, 3, 3, 3);
      break;
    }
    case "rover": {
      // Top-down / front ESP32 robot chassis with dual ultrasonic eyes & wheels
      rect(5, 10, 3, 7, 2);
      rect(24, 10, 3, 7, 2);
      rect(5, 20, 3, 7, 2);
      rect(24, 20, 3, 7, 2);
      rect(8, 9, 16, 18, 1);
      rect(10, 11, 12, 6, 3);
      // Ultrasonic transducer eyes
      rect(11, 6, 4, 4, 2);
      rect(17, 6, 4, 4, 2);
      set(12, 7, 3);
      set(18, 7, 3);
      // ESP32 board
      rect(11, 19, 10, 6, 2);
      rect(13, 21, 6, 2, 3);
      break;
    }
    case "linebot": {
      // S-curve track + sensor bot on path
      for (let y = 3; y < 29; y++) {
        const cx = Math.round(16 + Math.sin(y * 0.22) * 7);
        rect(cx - 1, y, 3, 1, 2);
      }
      rect(11, 12, 10, 10, 1);
      rect(9, 14, 2, 6, 2);
      rect(21, 14, 2, 6, 2);
      rect(13, 10, 2, 2, 3);
      rect(17, 10, 2, 2, 3);
      rect(14, 15, 4, 4, 3);
      break;
    }
    case "breadboard": {
      // DIP IC chip + breadboard power rails + jumper wires
      rect(4, 6, 24, 20, 1);
      rect(6, 8, 20, 2, 3);
      rect(6, 22, 20, 2, 3);
      // IC chip
      rect(10, 12, 12, 8, 2);
      for (let px = 11; px <= 20; px += 2) {
        rect(px, 10, 1, 2, 3);
        rect(px, 20, 1, 2, 3);
      }
      // Signal trace
      rect(13, 15, 6, 2, 1);
      break;
    }
    case "tap": {
      // Faucet + IR sensor beam + water drops
      rect(5, 6, 14, 4, 2);
      rect(15, 10, 4, 4, 2);
      rect(7, 10, 3, 3, 1); // IR sensor module
      for (let d = 0; d < 4; d++) set(10 + d * 2, 13 + d, 3);
      // Water drops
      rect(16, 16, 2, 3, 1);
      rect(16, 21, 2, 3, 1);
      rect(15, 25, 4, 2, 3);
      rect(10, 27, 12, 2, 2);
      break;
    }
    case "window": {
      // Portfolio browser / grid layout window
      rect(4, 5, 24, 22, 2);
      rect(5, 6, 22, 3, 1);
      set(7, 7, 3);
      set(9, 7, 3);
      rect(6, 11, 9, 14, 1);
      rect(17, 11, 9, 6, 3);
      rect(17, 19, 9, 6, 1);
      break;
    }
    case "sun": {
      // Daylight progress ring & rays
      ring(16, 16, 6, 9, 1);
      ring(16, 16, 0, 4, 3);
      // Missing arc top-left to look like progress ring
      rect(8, 6, 5, 5, 0);
      rect(15, 3, 2, 3, 2);
      rect(15, 26, 2, 3, 2);
      rect(3, 15, 3, 2, 2);
      rect(26, 15, 3, 2, 2);
      break;
    }
    case "timer": {
      // Pomodoro / Focus Atlas clock
      rect(13, 4, 6, 2, 2);
      rect(15, 6, 2, 2, 2);
      ring(16, 18, 8, 10, 2);
      ring(16, 18, 0, 7.5, 1);
      rect(15, 12, 2, 6, 3);
      rect(15, 17, 5, 2, 3);
      break;
    }
    case "ledger": {
      // Pocket Ledger bars & coin
      rect(5, 6, 22, 20, 1);
      rect(7, 8, 18, 2, 3);
      rect(7, 12, 8, 2, 2);
      rect(7, 16, 12, 2, 2);
      rect(7, 20, 6, 2, 2);
      ring(21, 19, 0, 3.5, 3);
      set(21, 19, 2);
      break;
    }
    case "bowl": {
      // Gather Meal Map bowl + steam
      rect(7, 15, 18, 3, 2);
      rect(8, 18, 16, 4, 1);
      rect(10, 22, 12, 3, 1);
      rect(12, 25, 8, 2, 2);
      rect(11, 8, 2, 5, 3);
      rect(15, 6, 2, 6, 3);
      rect(19, 9, 2, 4, 3);
      break;
    }
    case "sprout": {
      // Habit Garden sprout + grid squares
      rect(6, 24, 20, 3, 2);
      rect(15, 13, 2, 11, 2);
      rect(9, 10, 6, 4, 1);
      rect(17, 8, 6, 5, 3);
      rect(11, 11, 3, 2, 3);
      break;
    }
    case "doc": {
      // PDF Summary Generator sheet + highlight lines
      rect(7, 4, 18, 24, 3);
      rect(7, 4, 13, 24, 3);
      rect(20, 4, 5, 5, 1);
      rect(10, 10, 10, 2, 2);
      rect(10, 14, 12, 2, 1);
      rect(10, 18, 12, 2, 1);
      rect(10, 22, 8, 2, 2);
      break;
    }
  }

  return g.map(row => row.join(""));
}

export interface MotionScheduler {
  add(fn: (now: number) => void): void;
  remove(fn: (now: number) => void): void;
}

export function initProjectPixelCanvas(
  canvas: HTMLCanvasElement,
  project: ProjectItem,
  motion: MotionScheduler,
  isMotionOn: () => boolean,
  cleanupList: Array<() => void>,
  opts?: { blockSize?: number; skipAssemble?: boolean }
) {
  const o = opts || {};
  const rows = generateProjectGrid(project.motif);
  const pal = project.pal;

  let blockSize = o.blockSize || 1;
  let currentGrid = poolGrid(rows, blockSize);
  let prevGrid = currentGrid;
  let assembled = !isMotionOn() || Boolean(o.skipAssemble);
  let assembleStart = 0;
  let waveStart = 0;
  let waveDir = 0;
  let swapped = false;
  let sweepActive = false;
  let sweepStart = 0;
  let animActive = false;
  let lastSize = 0;

  const rng = makeRng(hashStr(project.id));
  const fgIndices: number[] = [];
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (currentGrid[y][x] !== "0") fgIndices.push(y * 32 + x);
    }
  }
  for (let i = fgIndices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = fgIndices[i];
    fgIndices[i] = fgIndices[j];
    fgIndices[j] = tmp;
  }
  const orderRank = new Int16Array(1024).fill(-1);
  fgIndices.forEach((pos, idx) => {
    orderRank[pos] = idx;
  });

  function poolGrid(srcRows: string[], bSize: number): string[] {
    if (bSize <= 1) return srcRows;
    const out: string[] = [];
    for (let y = 0; y < 32; y += bSize) {
      const blockRows: string[] = [];
      for (let dy = 0; dy < bSize; dy++) blockRows.push("");
      for (let x = 0; x < 32; x += bSize) {
        const counts = [0, 0, 0, 0];
        for (let dy = 0; dy < bSize; dy++) {
          const r = srcRows[y + dy];
          for (let dx = 0; dx < bSize; dx++) {
            counts[Number(r[x + dx]) || 0]++;
          }
        }
        let bestIdx = 0;
        let bestCount = -1;
        for (let c = 0; c < 4; c++) {
          if (counts[c] > bestCount) {
            bestCount = counts[c];
            bestIdx = c;
          }
        }
        const ch = String(bestIdx);
        for (let dy = 0; dy < bSize; dy++) {
          blockRows[dy] += ch.repeat(bSize);
        }
      }
      for (let dy = 0; dy < bSize; dy++) out.push(blockRows[dy]);
    }
    return out;
  }

  function sizeCanvas(): boolean {
    const rect = canvas.getBoundingClientRect();
    const cssSize = Math.round(rect.width);
    if (cssSize <= 0 || cssSize === lastSize) return cssSize > 0;
    lastSize = cssSize;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function drawFrame(now: number) {
    const ctx = canvas.getContext("2d");
    if (!ctx || lastSize <= 0) return;
    const size = lastSize;
    const cell = Math.floor(size / 32);
    const gridPx = cell * 32;
    const ox = Math.floor((size - gridPx) / 2);
    const oy = Math.floor((size - gridPx) / 2);

    ctx.fillStyle = pal[0];
    ctx.fillRect(0, 0, size, size);

    let assembleLimit = fgIndices.length;
    if (!assembled) {
      const elapsed = now - assembleStart;
      const p = Math.min(1, Math.max(0, elapsed / 640));
      assembleLimit = Math.floor(p * fgIndices.length);
      if (p >= 1) assembled = true;
    }

    let waveElapsed = -1;
    let waveDone = true;
    if (waveDir !== 0) {
      waveElapsed = now - waveStart;
      if (waveElapsed < 360) waveDone = false;
      else {
        swapped = waveDir === 1;
        waveDir = 0;
      }
    }

    let sweepElapsed = -1;
    let sweepDone = true;
    if (sweepActive) {
      sweepElapsed = now - sweepStart;
      if (sweepElapsed < 200) sweepDone = false;
      else sweepActive = false;
    }

    for (let y = 0; y < 32; y++) {
      let runStart = 0;
      let runIdx = -1;
      for (let x = 0; x <= 32; x++) {
        let idx = 0;
        if (x < 32) {
          const useOld = sweepActive && !sweepDone && ((x + y) / 62) * 200 > sweepElapsed;
          const srcGrid = useOld ? prevGrid : currentGrid;
          const raw = Number(srcGrid[y][x]) || 0;
          if (!assembled && raw !== 0) {
            const rank = orderRank[y * 32 + x];
            idx = rank < assembleLimit ? raw : 0;
          } else {
            idx = raw;
          }
          let isSwapped = swapped;
          if (waveDir !== 0) {
            const threshold = ((x + y) / 62) * 360;
            if (waveDir === 1) isSwapped = waveElapsed >= threshold;
            else isSwapped = waveElapsed < threshold;
          }
          if (isSwapped && (idx === 0 || idx === 1)) {
            idx = idx === 0 ? 1 : 0;
          }
        }
        if (x === 0) {
          runIdx = idx;
          runStart = 0;
        } else if (x === 32 || idx !== runIdx) {
          if (runIdx !== 0 || swapped || waveDir !== 0) {
            ctx.fillStyle = pal[runIdx];
            ctx.fillRect(ox + runStart * cell, oy + y * cell, (x - runStart) * cell, cell);
          }
          runStart = x;
          runIdx = idx;
        }
      }
    }

    if (assembled && waveDone && sweepDone) {
      animActive = false;
      motion.remove(drawFrame);
    }
  }

  function startAnim() {
    if (!animActive) {
      animActive = true;
      motion.add(drawFrame);
    }
  }

  function renderImmediate() {
    if (sizeCanvas()) drawFrame(performance.now());
  }

  const io = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          io.disconnect();
          sizeCanvas();
          if (!isMotionOn() || o.skipAssemble) {
            assembled = true;
            drawFrame(performance.now());
          } else {
            assembled = false;
            assembleStart = performance.now();
            startAnim();
          }
        }
      }
    },
    { threshold: 0.3 }
  );
  io.observe(canvas);

  let rTimer = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(rTimer);
    rTimer = window.setTimeout(() => {
      const prev = lastSize;
      sizeCanvas();
      if (lastSize !== prev) drawFrame(performance.now());
    }, 150);
  });
  ro.observe(canvas);

  const hoverTarget = canvas.closest("a") || canvas;
  if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    const triggerSwap = (toSwapped: boolean) => {
      if (!isMotionOn()) {
        swapped = toSwapped;
        waveDir = 0;
        drawFrame(performance.now());
        return;
      }
      waveDir = toSwapped ? 1 : -1;
      waveStart = performance.now();
      startAnim();
    };
    hoverTarget.addEventListener("mouseenter", () => triggerSwap(true));
    hoverTarget.addEventListener("mouseleave", () => triggerSwap(false));
    hoverTarget.addEventListener("focusin", () => triggerSwap(true));
    hoverTarget.addEventListener("focusout", () => triggerSwap(false));
  }

  const onMotionChange = () => {
    if (!isMotionOn()) {
      assembled = true;
      sweepActive = false;
      waveDir = 0;
      swapped = false;
      renderImmediate();
    }
  };
  window.addEventListener("raster:motionchange", onMotionChange);

  cleanupList.push(() => {
    io.disconnect();
    ro.disconnect();
    window.clearTimeout(rTimer);
    motion.remove(drawFrame);
    window.removeEventListener("raster:motionchange", onMotionChange);
  });

  window.requestAnimationFrame(renderImmediate);

  return {
    setBlockSize(newSize: number) {
      if (newSize === blockSize) return;
      prevGrid = currentGrid;
      blockSize = newSize;
      currentGrid = poolGrid(rows, blockSize);
      if (!isMotionOn()) {
        sweepActive = false;
        drawFrame(performance.now());
      } else {
        sweepActive = true;
        sweepStart = performance.now();
        startAnim();
      }
    }
  };
}

export const BADGE_PALETTE = [
  { id: "0", name: "sodium", hex: TOKENS.sodium },
  { id: "1", name: "paper", hex: TOKENS.paper },
  { id: "2", name: "ink", hex: TOKENS.ink },
  { id: "3", name: "blue", hex: TOKENS.blue },
  { id: "4", name: "pink", hex: TOKENS.pink },
  { id: "5", name: "green", hex: TOKENS.green },
  { id: "6", name: "lavender", hex: TOKENS.lavender },
  { id: "7", name: "coral", hex: TOKENS.coral },
  { id: "8", name: "mint", hex: TOKENS.mint }
];

const TECH_ICON_GRIDS: Record<string, string[]> = {
  chip: [
    ".#.#.#.",
    "#######",
    "#.##..#",
    "#.#.#.#",
    "#..##.#",
    "#######",
    ".#.#.#."
  ],
  code: [
    "..#.#..",
    ".#...#.",
    "#.....#",
    ".#...#.",
    "..#.#..",
    ".......",
    "#######"
  ],
  react: [
    "..###..",
    ".#...#.",
    "#..#..#",
    "#.#.#.#",
    "#..#..#",
    ".#...#.",
    "..###.."
  ],
  wave: [
    ".......",
    ".##....",
    "#..#..#",
    "....##.",
    ".##....",
    "#..#..#",
    "......."
  ],
  sensor: [
    "..###..",
    ".#...#.",
    "#..#..#",
    "#.#.#.#",
    "#..#..#",
    ".#...#.",
    "...#..."
  ],
  circuit: [
    "#.....#",
    "###.###",
    "..#.#..",
    "..###..",
    "..#.#..",
    "###.###",
    "#.....#"
  ],
  globe: [
    ".#####.",
    "#..#..#",
    "#######",
    "#..#..#",
    "#######",
    "#..#..#",
    ".#####."
  ],
  storage: [
    ".#####.",
    "#######",
    "#.....#",
    ".#####.",
    "#.....#",
    "#######",
    ".#####."
  ],
  web: [
    "#######",
    "#.#.#.#",
    "#######",
    "#.....#",
    "# ### #",
    "#.....#",
    "#######"
  ]
};

function getTechMeta(tag: string): { kind: keyof typeof TECH_ICON_GRIDS; accent: string } {
  const t = tag.toLowerCase();
  if (/(esp32|arduino|mcu|microcontroller|hardware|motor)/.test(t)) {
    return { kind: "chip", accent: TOKENS.blue };
  }
  if (/(c\+\+|embedded c|\bc\b|typescript|javascript|api|parser|engine)/.test(t)) {
    return { kind: "code", accent: TOKENS.lavender };
  }
  if (/(react|vite|ui|responsive|svg)/.test(t)) {
    return { kind: "react", accent: TOKENS.pink };
  }
  if (/(ad9850|dds|sonar|signal|analog|pwm|timer|pomodoro)/.test(t)) {
    return { kind: "wave", accent: TOKENS.mint };
  }
  if (/(sensor|ultrasonic|ir |navigation|proximity|rover)/.test(t)) {
    return { kind: "sensor", accent: TOKENS.coral };
  }
  if (/(lm358|op-amp|breadboard|circuit|relay|testing)/.test(t)) {
    return { kind: "circuit", accent: TOKENS.blue };
  }
  if (/(cesium|usgs|opensky|celestrak|globe|3d|map)/.test(t)) {
    return { kind: "globe", accent: TOKENS.green };
  }
  if (/(storage|firebase|cms|netlify|persistence|database|ledger|streak)/.test(t)) {
    return { kind: "storage", accent: TOKENS.mint };
  }
  return { kind: "web", accent: TOKENS.coral };
}

export function svgTechIcon(tag: string): string {
  const { kind, accent } = getTechMeta(tag);
  const grid = TECH_ICON_GRIDS[kind] || TECH_ICON_GRIDS.chip;
  let rects = "";
  for (let r = 0; r < 7; r++) {
    const row = grid[r];
    for (let c = 0; c < 7; c++) {
      if (row[c] === "#") {
        rects += `<rect x="${c}" y="${r}" width="1.05" height="1.05"/>`;
      }
    }
  }
  return `<span class="tech-badge-icon" style="--tech-accent:${accent}" aria-hidden="true"><svg viewBox="0 0 7 7" width="10" height="10" shape-rendering="crispEdges" fill="currentColor">${rects}</svg></span>`;
}

export function renderTechBadges(tags: string[], maxCount = 5): string {
  const slice = tags.slice(0, maxCount);
  return `<div class="tech-badge-list" aria-label="Technologies used">${slice
    .map(tag => `<span class="tech-badge t-micro tnum">${svgTechIcon(tag)}<span>${esc(tag)}</span></span>`)
    .join("")}</div>`;
}

