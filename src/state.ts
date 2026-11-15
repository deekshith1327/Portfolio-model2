import { LAB_BLOCKS, PROJECTS, SKILLS, TOKENS, TRACKS, TrackId } from "./data";
import { hashStr, makeRng, MotionScheduler } from "./pixelArt";

export const TRACK_COLORS = [TOKENS.blue, TOKENS.pink, TOKENS.green, TOKENS.lavender];
export const TRAIL_COLORS = [TOKENS.blue, TOKENS.pink, TOKENS.green, TOKENS.lavender];

export const trackById = (id: TrackId) => TRACKS.find(t => t.id === id)!;
export const projectById = (id: string) => PROJECTS.find(p => p.id === id);
export const projectsByTrack = (id: TrackId) => PROJECTS.filter(p => p.track === id);
export const projectsByPhase = (phaseId: "p1" | "p2" | "p3") =>
  PROJECTS.filter(p => p.phase === phaseId);
export const labBlockById = (id: string) => LAB_BLOCKS.find(b => b.id === id)!;

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet(key: string, val: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage errors
  }
}

function defaultBadgeGrid(): string {
  const g = new Array(256).fill("1");
  // Crisp 9x9 microcontroller / IC chip motif in blue '3' and coral '7'
  for (let r = 4; r <= 11; r++) {
    for (let c = 4; c <= 11; c++) {
      g[r * 16 + c] = r >= 6 && r <= 9 && c >= 6 && c <= 9 ? "7" : "3";
    }
  }
  for (let p = 5; p <= 10; p += 2) {
    g[3 * 16 + p] = "2";
    g[12 * 16 + p] = "2";
    g[p * 16 + 3] = "2";
    g[p * 16 + 12] = "2";
  }
  return g.join("");
}

const prefersReduce =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const savedMotion = storageGet<boolean | null>("dp25.motion", null);
const initialMotion = savedMotion === null ? !prefersReduce : Boolean(savedMotion);

export interface AppState {
  motionOn: boolean;
  shortlist: string[];
  projectsFilter: { tracks: TrackId[]; sort: "featured" | "az" };
  archiveFilter: {
    query: string;
    categories: string[];
    tracks: TrackId[];
    sortCol: "num" | "title" | "year";
    sortDir: "asc" | "desc";
    openId: string | null;
  };
  selectedLabBlock: string;
  badge: { grid: string; name: string };
  routeCleanup: Array<() => void>;
  scrollAfterRoute: string | null;
}

const savedBadge = storageGet<{ grid?: string; name?: string }>("dp25.badge", {});
const savedShortlist = storageGet<string[]>("dp25.shortlist", []);

export const state: AppState = {
  motionOn: initialMotion,
  shortlist: Array.isArray(savedShortlist) ? savedShortlist : [],
  projectsFilter: { tracks: [], sort: "featured" },
  archiveFilter: {
    query: "",
    categories: [],
    tracks: [],
    sortCol: "num",
    sortDir: "asc",
    openId: null
  },
  selectedLabBlock: "mcu-core",
  badge: {
    grid:
      typeof savedBadge.grid === "string" && savedBadge.grid.length === 256
        ? savedBadge.grid
        : defaultBadgeGrid(),
    name: typeof savedBadge.name === "string" ? savedBadge.name : "Deekshith P."
  },
  routeCleanup: [],
  scrollAfterRoute: null
};

export function toggleShortlist(projectId: string): void {
  const idx = state.shortlist.indexOf(projectId);
  if (idx === -1) state.shortlist.push(projectId);
  else state.shortlist.splice(idx, 1);
  storageSet("dp25.shortlist", state.shortlist);
}

export const motion: MotionScheduler = (() => {
  const subs = new Set<(now: number) => void>();
  let rafId = 0;

  function tick(now: number) {
    rafId = 0;
    if (document.visibilityState === "hidden" || subs.size === 0) return;
    for (const fn of Array.from(subs)) {
      try {
        fn(now);
      } catch {
        subs.delete(fn);
      }
    }
    if (subs.size > 0) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  function ensure() {
    if (!rafId && subs.size > 0 && document.visibilityState !== "hidden") {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    } else {
      ensure();
    }
  });

  return {
    add(fn: (now: number) => void) {
      subs.add(fn);
      ensure();
    },
    remove(fn: (now: number) => void) {
      subs.delete(fn);
      if (subs.size === 0 && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }
  };
})();

export function setMotionState(on: boolean): void {
  state.motionOn = Boolean(on);
  storageSet("dp25.motion", state.motionOn);
  document.documentElement.classList.toggle("motion-on", state.motionOn);
  const label = state.motionOn ? "(Motion: on)" : "(Motion: off)";
  const dBtn = document.getElementById("motion-toggle-desktop");
  const mBtn = document.getElementById("motion-toggle-mobile");
  [dBtn, mBtn].forEach(btn => {
    if (btn) {
      btn.textContent = label;
      btn.setAttribute("aria-pressed", state.motionOn ? "true" : "false");
    }
  });
  window.dispatchEvent(new CustomEvent("raster:motionchange", { detail: { on: state.motionOn } }));
}

let tipTimer = 0;
function getTipEl() {
  return document.getElementById("tip") as HTMLElement | null;
}

function positionTip(rect: DOMRect) {
  const tipEl = getTipEl();
  if (!tipEl) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  tipEl.classList.add("is-visible");
  const tw = tipEl.offsetWidth;
  const th = tipEl.offsetHeight;
  let left = rect.right + 8;
  let top = rect.top - th - 8;
  if (left + tw > vw - 8) left = Math.max(8, rect.left - tw - 8);
  if (top < 8) top = Math.min(vh - th - 8, rect.bottom + 8);
  tipEl.style.left = `${Math.round(left)}px`;
  tipEl.style.top = `${Math.round(top)}px`;
}

export function showTip(rect: DOMRect, text: string, immediate: boolean): void {
  const tipEl = getTipEl();
  if (!tipEl || !text) return;
  window.clearTimeout(tipTimer);
  const run = () => {
    tipEl.textContent = text;
    positionTip(rect);
  };
  if (immediate) run();
  else tipTimer = window.setTimeout(run, 120);
}

export function hideTip(): void {
  const tipEl = getTipEl();
  window.clearTimeout(tipTimer);
  if (tipEl) tipEl.classList.remove("is-visible");
}

let wipeActive = false;
export function playWipe(onFull?: () => void): void {
  const wipeCanvas = document.getElementById("wipe-canvas") as HTMLCanvasElement | null;
  if (!wipeCanvas || !state.motionOn || wipeActive) {
    if (onFull) onFull();
    return;
  }
  const ctx = wipeCanvas.getContext("2d");
  if (!ctx) {
    if (onFull) onFull();
    return;
  }
  wipeActive = true;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  wipeCanvas.width = Math.round(w * dpr);
  wipeCanvas.height = Math.round(h * dpr);
  wipeCanvas.classList.add("is-active");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cell = w >= 768 ? 48 : 32;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const maxDiag = cols + rows - 2 || 1;
  const start = performance.now();
  let swapped = false;

  function step(now: number) {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, w, h);
    if (elapsed < 220) {
      const prog = elapsed / 220;
      const limit = prog * (maxDiag + 1);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c + r <= limit) {
            ctx!.fillStyle = (c + r) % 2 === 0 ? TOKENS.ink : TOKENS.blue;
            ctx!.fillRect(c * cell, r * cell, cell, cell);
          }
        }
      }
    } else {
      if (!swapped) {
        swapped = true;
        if (onFull) onFull();
      }
      const prog = Math.min(1, (elapsed - 220) / 220);
      const limit = prog * (maxDiag + 1);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c + r > limit) {
            ctx!.fillStyle = (c + r) % 2 === 0 ? TOKENS.ink : TOKENS.blue;
            ctx!.fillRect(c * cell, r * cell, cell, cell);
          }
        }
      }
      if (prog >= 1) {
        wipeCanvas!.classList.remove("is-active");
        wipeActive = false;
        motion.remove(step);
      }
    }
  }
  motion.add(step);
}

export function initTrail(): void {
  const trailCanvas = document.getElementById("trail-canvas") as HTMLCanvasElement | null;
  if (!trailCanvas || !window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
  let trailCells: Array<{ gx: number; gy: number; born: number; color: string }> = [];
  let trailRunning = false;
  let trailColorIdx = 0;
  let lastTrailCellKey = "";

  function sizeTrailCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    trailCanvas!.width = Math.round(w * dpr);
    trailCanvas!.height = Math.round(h * dpr);
    const ctx = trailCanvas!.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function tickTrail(now: number) {
    const ctx = trailCanvas!.getContext("2d");
    if (!ctx) {
      trailRunning = false;
      motion.remove(tickTrail);
      return;
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    if (!state.motionOn) {
      trailCells = [];
      trailRunning = false;
      motion.remove(tickTrail);
      return;
    }
    const alive: typeof trailCells = [];
    for (let i = 0; i < trailCells.length; i++) {
      const c = trailCells[i];
      const age = now - c.born;
      if (age >= 420) continue;
      alive.push(c);
      ctx.fillStyle = c.color;
      if (age < 140) {
        ctx.fillRect(c.gx * 16, c.gy * 16, 16, 16);
      } else if (age < 280) {
        ctx.fillRect(c.gx * 16 + 4, c.gy * 16 + 4, 8, 8);
      } else {
        ctx.fillRect(c.gx * 16 + 6, c.gy * 16 + 6, 4, 4);
      }
    }
    trailCells = alive;
    if (trailCells.length === 0) {
      trailRunning = false;
      motion.remove(tickTrail);
    }
  }

  sizeTrailCanvas();
  window.addEventListener("resize", sizeTrailCanvas, { passive: true });
  window.addEventListener(
    "pointermove",
    e => {
      if (!state.motionOn || document.documentElement.classList.contains("menu-open")) return;
      const gx = Math.floor(e.clientX / 16);
      const gy = Math.floor(e.clientY / 16);
      const key = `${gx},${gy}`;
      if (key === lastTrailCellKey) return;
      lastTrailCellKey = key;
      const color = TRAIL_COLORS[trailColorIdx % TRAIL_COLORS.length];
      trailColorIdx++;
      trailCells.push({ gx, gy, born: performance.now(), color });
      if (trailCells.length > 14) trailCells.shift();
      if (!trailRunning) {
        trailRunning = true;
        motion.add(tickTrail);
      }
    },
    { passive: true }
  );
}

// Interactive Pixel Matrix showing Skills & Builds across 160 cells (hover + keyboard navigable)
export function buildReadinessGrid(
  container: HTMLElement,
  opts?: { instant?: boolean; onPaper?: boolean }
): void {
  const o = opts || {};
  const embCount = projectsByTrack("embedded").length;
  const robCount = projectsByTrack("robotics").length;
  const dataCount = projectsByTrack("dataviz").length;
  const webCount = projectsByTrack("webapps").length;

  const cellsPerBuild = 8;
  const total = 160;
  const bands = [
    { name: "Embedded & ESP32", count: embCount * cellsPerBuild, color: TOKENS.blue, items: projectsByTrack("embedded").map(p => p.title) },
    { name: "Robotics & Analog HW", count: robCount * cellsPerBuild, color: TOKENS.pink, items: projectsByTrack("robotics").map(p => p.title) },
    { name: "3D & Planetary Data", count: dataCount * cellsPerBuild, color: TOKENS.green, items: projectsByTrack("dataviz").map(p => p.title) },
    { name: "Web Apps & Tools", count: webCount * cellsPerBuild, color: TOKENS.lavender, items: projectsByTrack("webapps").map(p => p.title) }
  ];
  const filledTotal = bands.reduce((acc, b) => acc + b.count, 0);
  const openTotal = total - filledTotal;

  const isMobile = window.innerWidth < 768;
  const cols = isMobile ? 16 : 40;
  const rows = Math.ceil(total / cols);
  const gap = window.innerWidth >= 1024 ? 2 : 1;
  const cell = 10;
  const step = cell + gap;
  const vbW = cols * step - gap;
  const vbH = rows * step - gap;

  const emptyFill = o.onPaper ? TOKENS.paper : TOKENS.paper;
  const emptyStroke = o.onPaper ? TOKENS.sodium : TOKENS.ink;
  const focusStroke = o.onPaper ? TOKENS.sodium : TOKENS.ink;

  const cellsMeta: Array<{ idx: number; filled: boolean; color: string; label: string }> = [];
  let cursor = 0;
  for (const band of bands) {
    for (let k = 0; k < band.count; k++) {
      const projIdx = Math.floor(k / cellsPerBuild);
      const projTitle = band.items[projIdx] || band.name;
      cellsMeta.push({
        idx: cursor,
        filled: true,
        color: band.color,
        label: `Cell ${cursor + 1} of ${total} — ${band.name}: ${projTitle}`
      });
      cursor++;
    }
  }
  while (cursor < total) {
    const skill = SKILLS[cursor % SKILLS.length];
    cellsMeta.push({
      idx: cursor,
      filled: false,
      color: emptyFill,
      label: `Cell ${cursor + 1} of ${total} — B.Tech runway (2025–2029): ${skill.name}`
    });
    cursor++;
  }

  let rects = "";
  for (let i = 0; i < total; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = c * step;
    const y = r * step;
    rects += `<rect data-ci="${i}" x="${x + 0.5}" y="${y + 0.5}" width="${cell - 1}" height="${cell - 1}" fill="${emptyFill}" stroke="${emptyStroke}" stroke-width="1"/>`;
  }

  container.innerHTML = `
    <figure class="capacity-fig">
      <div class="capacity-svg-wrap" tabindex="0" role="img" aria-label="Build and skill matrix: ${filledTotal} shipped build units across ${PROJECTS.length} projects, ${openTotal} runway units for 2025–2029. Use arrow keys to inspect cells.">
        <svg class="capacity-svg" viewBox="0 0 ${vbW} ${vbH}" shape-rendering="crispEdges" aria-hidden="true">${rects}<rect id="cap-focus-ring" x="0" y="0" width="${cell}" height="${cell}" fill="none" stroke="${focusStroke}" stroke-width="2" visibility="hidden"/></svg>
      </div>
      <figcaption class="t-micro" style="margin-top:8px;">Build &amp; capability matrix, ${total} cells across ${PROJECTS.length} shipped projects + ${SKILLS.length} core skills. Hover or focus with arrow keys to inspect.</figcaption>
      <ul class="capacity-legend t-micro">
        <li class="legend-item"><span class="legend-swatch" style="background:${TOKENS.blue}"></span>Embedded (${embCount})</li>
        <li class="legend-item"><span class="legend-swatch" style="background:${TOKENS.pink}"></span>Robotics &amp; HW (${robCount})</li>
        <li class="legend-item"><span class="legend-swatch" style="background:${TOKENS.green}"></span>Data &amp; 3D (${dataCount})</li>
        <li class="legend-item"><span class="legend-swatch" style="background:${TOKENS.lavender}"></span>Web Apps (${webCount})</li>
        <li class="legend-item"><span class="legend-swatch" style="background:${emptyFill}"></span>2025–2029 Runway (${openTotal})</li>
      </ul>
    </figure>
  `;

  const svg = container.querySelector(".capacity-svg") as SVGSVGElement;
  const wrap = container.querySelector(".capacity-svg-wrap") as HTMLElement;
  const focusRing = svg.querySelector("#cap-focus-ring") as SVGRectElement;
  const rectEls = Array.from(svg.querySelectorAll("rect[data-ci]"));
  let paintedCount = 0;

  function paintCell(i: number) {
    const m = cellsMeta[i];
    const el = rectEls[i];
    if (!el) return;
    if (!m.filled || i >= paintedCount) {
      el.setAttribute("fill", emptyFill);
      el.setAttribute("stroke", emptyStroke);
      el.setAttribute("stroke-width", "1");
    } else {
      el.setAttribute("fill", m.color);
      el.removeAttribute("stroke");
    }
  }

  function fillImmediate() {
    paintedCount = filledTotal;
    for (let i = 0; i < filledTotal; i++) paintCell(i);
  }

  let fillAnimRunning = false;
  function tickFill() {
    const nextEnd = Math.min(filledTotal, paintedCount + 4);
    for (let i = paintedCount; i < nextEnd; i++) {
      paintedCount = i + 1;
      paintCell(i);
    }
    if (paintedCount >= filledTotal) {
      fillAnimRunning = false;
      motion.remove(tickFill);
    }
  }

  if (!state.motionOn || o.instant) {
    fillImmediate();
  } else {
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            io.disconnect();
            if (!state.motionOn) fillImmediate();
            else if (!fillAnimRunning) {
              fillAnimRunning = true;
              motion.add(tickFill);
            }
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(svg);
    state.routeCleanup.push(() => {
      io.disconnect();
      motion.remove(tickFill);
    });
  }

  svg.addEventListener("pointermove", e => {
    const target = (e.target as Element).closest("rect[data-ci]") as HTMLElement | null;
    if (!target) {
      hideTip();
      return;
    }
    const idx = Number(target.dataset.ci);
    showTip(target.getBoundingClientRect(), cellsMeta[idx].label, false);
  });
  svg.addEventListener("pointerleave", hideTip);

  let keyIdx = 0;
  const showKeyCell = () => {
    const c = keyIdx % cols;
    const r = Math.floor(keyIdx / cols);
    focusRing.setAttribute("x", String(c * step - 1));
    focusRing.setAttribute("y", String(r * step - 1));
    focusRing.setAttribute("width", String(cell + 2));
    focusRing.setAttribute("height", String(cell + 2));
    focusRing.setAttribute("visibility", "visible");
    showTip(rectEls[keyIdx].getBoundingClientRect(), cellsMeta[keyIdx].label, true);
  };

  wrap.addEventListener("focus", showKeyCell);
  wrap.addEventListener("blur", () => {
    focusRing.setAttribute("visibility", "hidden");
    hideTip();
  });
  wrap.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") keyIdx = Math.min(total - 1, keyIdx + 1);
    else if (e.key === "ArrowLeft") keyIdx = Math.max(0, keyIdx - 1);
    else if (e.key === "ArrowDown") keyIdx = Math.min(total - 1, keyIdx + cols);
    else if (e.key === "ArrowUp") keyIdx = Math.max(0, keyIdx - cols);
    else return;
    e.preventDefault();
    showKeyCell();
  });

  void makeRng(hashStr("matrix"));
}
