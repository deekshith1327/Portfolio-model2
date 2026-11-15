import {
  COPY,
  JOURNEY_PHASES,
  PROFILE,
  PROJECTS,
  SKILLS,
  TOKENS,
  TRACKS,
  TrackId
} from "./data";
import { syncGitHubProjects } from "./githubSync";
import {
  easeAssemble,
  easeMorph,
  esc,
  hashStr,
  initProjectPixelCanvas,
  layoutGlyphLines,
  makeRng,
  renderTechBadges,
  svgBitmapText
} from "./pixelArt";
import {
  buildReadinessGrid,
  motion,
  projectById,
  projectsByPhase,
  projectsByTrack,
  state,
  trackById
} from "./state";

export function renderHome(main: HTMLElement): void {
  document.title = COPY.homeTitle;
  const c = COPY;

  main.innerHTML = `
    <section class="hero-sec" id="hero" data-surface="sodium" data-pager="Hero">
      <div class="grid">
        <div class="hero-top-address t-small">
          ${c.heroAddress.map((line, i) => `<p class="hero-float-item" style="--float-i:${i}">${esc(line)}</p>`).join("")}
        </div>
        <p class="hero-top-date t-small tnum hero-float-item" id="hero-top-date" style="--float-i:1">${esc(c.heroDate)}</p>
      </div>

      <figure class="hero-display-wrap">
        <h1 class="visually-hidden">${esc(c.heroH1)}</h1>
        <canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas>
        <figcaption class="hero-caption-bar grid">
          <span class="hero-cycle-caption t-micro tnum" id="hero-cycle-caption">${esc(c.heroCycle[0].caption)}</span>
          <div class="hero-comp-bar" id="hero-comp-bar" role="group" aria-label="Select engineering component to display">
            ${c.heroCycle
              .map(
                (item, idx) =>
                  `<button type="button" class="hero-comp-btn t-micro tnum" data-comp-idx="${idx}" aria-pressed="${idx === 0 ? "true" : "false"}">${esc(item.desktop)}</button>`
              )
              .join("")}
          </div>
        </figcaption>
      </figure>

      <div class="hero-bottom-row grid">
        <div class="hero-split-wrap">
          <p class="hero-info-name t-h3 hero-float-item" style="--float-i:0" aria-label="${esc(PROFILE.name)}">${Array.from(
            PROFILE.name
          )
            .map((ch, idx) =>
              ch === " "
                ? `<span class="hero-name-space" aria-hidden="true">&nbsp;</span>`
                : `<span class="hero-name-char" style="--char-i:${idx}" aria-hidden="true">${esc(ch)}</span>`
            )
            .join("")}</p>
          <p class="hero-info-line t-lead hero-float-item" style="--float-i:1">${esc(PROFILE.role)}</p>
          <p class="hero-info-line t-lead hero-float-item" style="--float-i:2">${esc(PROFILE.university)} (${esc(PROFILE.years)})</p>
          <p class="hero-info-bio t-body hero-float-item" style="--float-i:3">${esc(c.heroBio)}</p>
        </div>
        <div class="hero-final-wrap">
          <p class="hero-final t-lead hero-float-item" style="--float-i:4">
            <span class="hero-final-line">Learn the fundamentals.</span>
            <span class="hero-final-line">Build with purpose.</span>
          </p>
        </div>
      </div>
    </section>

    <section class="sec" id="about" data-surface="sodium" data-pager="About">
      <div class="grid">
        <div class="col-full">
          <h2 class="t-h2 reveal-text">${esc(c.aboutLead)}</h2>
        </div>
      </div>
      <div class="grid about-paras">
        <div class="about-para-1 reveal-text">
          <p class="t-body">${esc(c.aboutP1)}</p>
        </div>
        <div class="about-para-2 reveal-text">
          <p class="t-body">${esc(c.aboutP2)}</p>
        </div>
      </div>
    </section>

    <section class="sec" id="numbers" data-surface="ink" data-pager="In numbers">
      <div class="grid">
        <div class="col-full">
          <div class="stats-items" id="stats-grid"></div>
          <div class="countdown-block" id="countdown-block"></div>
        </div>
      </div>
    </section>

    <section class="sec" id="tracks" data-surface="ink" data-pager="Tracks">
      <div class="grid">
        <div class="col-full">
          <h2 class="t-h2 reveal-text">${esc(c.tracksLead)}</h2>
        </div>
      </div>
      <div class="grid tracks-grid" id="tracks-grid"></div>
    </section>

    <section class="sec" id="days" data-surface="paper" data-pager="Journey">
      <div class="grid">
        <div class="col-full">
          <h2 class="t-h2 reveal-text">${esc(c.daysLead)}</h2>
        </div>
      </div>
      <div class="grid days-cols" id="days-cols"></div>
    </section>

    <section class="sec" id="speakers-preview" data-surface="sodium" data-pager="Projects">
      <div class="grid">
        <div class="col-full">
          <h2 class="t-h2 reveal-text" id="home-gallery-lead">${esc(c.speakersLead)}</h2>
          <div class="home-gallery-filters" id="home-gallery-filters" role="group" aria-label="Filter projects by discipline">
            <button type="button" class="chip-toggle t-micro tnum" data-track-filter="all" aria-pressed="true">All (${PROJECTS.length})</button>
            ${TRACKS.map(
              tr =>
                `<button type="button" class="chip-toggle t-micro" data-track-filter="${esc(tr.id)}" aria-pressed="false"><span class="chip-sq" style="background:${tr.bg}"></span><span>${esc(tr.label)} (${projectsByTrack(tr.id).length})</span></button>`
            ).join("")}
            <button type="button" class="chip-toggle t-micro tnum" id="gh-sync-btn" title="Fetch latest public repositories from github.com/deekshith1327">↻ Sync GitHub (@deekshith1327)</button>
          </div>
        </div>
        <div class="col-full home-projects-gallery" id="speakers-preview-grid"></div>
        <div class="col-full speakers-footer-link">
          <a class="btn-text t-lead u-anim" href="#/projects">Open full projects index &amp; case studies →</a>
        </div>
      </div>
    </section>

    <section class="sec" id="passes" data-surface="sodium" data-pager="Skills &amp; Connect">
      <div class="grid">
        <div class="col-full">
          <h2 class="t-h2 reveal-text">${SKILLS.length} core skills. Open to collaborations, internships &amp; ideas.</h2>
        </div>

        <div class="col-full skills-matrix-grid" id="home-skills-grid"></div>

        <div class="col-full" id="home-capacity-wrap"></div>

        <div class="col-full passes-cta-row">
          <a class="btn-primary t-small" href="#/contact"><span>Let's connect</span></a>
          <a class="btn-text t-small u-anim" href="#/skills">Skills &amp; bench schematic →</a>
          <a class="btn-text t-small u-anim" href="${esc(PROFILE.socials.github)}" target="_blank" rel="noreferrer noopener">GitHub →</a>
          <a class="btn-text t-small u-anim" href="${esc(PROFILE.socials.linkedin)}" target="_blank" rel="noreferrer noopener">LinkedIn →</a>
        </div>
      </div>
    </section>
  `;

  initHeroCanvas();
  initNumbers();
  initTrackPanels();
  initJourneyColumns();
  initFeaturedProjectsPreview();
  initHomeSkillsGrid();
  buildReadinessGrid(document.getElementById("home-capacity-wrap")!, {});
}

function initHeroCanvas(): void {
  const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
  const captionEl = document.getElementById("hero-cycle-caption");
  const compBar = document.getElementById("hero-comp-bar");
  if (!canvas || !captionEl) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let cssW = 0;
  let cssH = 0;
  let dpr = 1;
  let isMobile = window.innerWidth < 768;
  let cycleIdx = 0;
  interface Particle {
    sx: number;
    sy: number;
    tx: number;
    ty: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    delay: number;
    color: string;
    sparkle: boolean;
  }
  let particles: Particle[] = [];
  let morphStart = 0;
  let morphDuration = 1100;
  let isAssembling = true;
  let holdTimer = 0;
  let inView = true;
  let running = false;
  let pointerX = -9999;
  let pointerY = -9999;

  function syncCompButtons(activeIdx: number) {
    if (!compBar) return;
    const btns = compBar.querySelectorAll<HTMLButtonElement>(".hero-comp-btn");
    btns.forEach((btn, idx) => {
      btn.setAttribute("aria-pressed", idx === activeIdx ? "true" : "false");
    });
  }

  function getTargetLayout(idx: number) {
    const item = COPY.heroCycle[idx];
    const lines = isMobile ? item.mobile : [item.desktop];
    const layout = layoutGlyphLines(lines, 2, true);
    const totalCols = isMobile ? 27 : 47;
    const totalRows = isMobile ? 20 : 9;
    const offsetX = Math.max(0, Math.floor((totalCols - layout.cols) / 2));
    const centeredCells = layout.cells.map(c => ({ x: c.x + offsetX, y: c.y }));
    return {
      totalCols,
      totalRows,
      cells: centeredCells
    };
  }

  function sizeCanvas() {
    const rect = canvas!.getBoundingClientRect();
    isMobile = window.innerWidth < 768;
    cssW = rect.width;
    cssH = rect.height;
    if (cssW <= 0 || cssH <= 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(cssW * dpr);
    canvas!.height = Math.round(cssH * dpr);
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.imageSmoothingEnabled = false;
  }

  function buildParticlesForTarget(idx: number, assembleFromRandom: boolean) {
    const t = getTargetLayout(idx);
    const rng = makeRng(hashStr("hero-" + idx + "-" + Date.now()));
    const newParticles: Particle[] = [];
    const targetCells = t.cells;
    const oldParticles = particles;
    const SPARK_COLORS = [TOKENS.blue, TOKENS.pink, TOKENS.green, TOKENS.lavender];

    if (assembleFromRandom || oldParticles.length === 0) {
      for (let i = 0; i < targetCells.length; i++) {
        const tc = targetCells[i];
        newParticles.push({
          sx: assembleFromRandom ? rng() * t.totalCols : tc.x,
          sy: assembleFromRandom ? rng() * t.totalRows : tc.y,
          tx: tc.x,
          ty: tc.y,
          x: tc.x,
          y: tc.y,
          vx: 0,
          vy: 0,
          delay: assembleFromRandom ? rng() * 350 : 0,
          color: TOKENS.ink,
          sparkle: false
        });
      }
      isAssembling = assembleFromRandom;
      morphDuration = 1100;
    } else {
      const count = Math.max(oldParticles.length, targetCells.length);
      for (let i = 0; i < count; i++) {
        const src = oldParticles[i % oldParticles.length];
        const dst = targetCells[i % targetCells.length];
        const isSparkle = rng() < 0.16;
        newParticles.push({
          sx: src.x,
          sy: src.y,
          tx: dst.x,
          ty: dst.y,
          x: src.x,
          y: src.y,
          vx: 0,
          vy: 0,
          delay: (dst.x / t.totalCols) * 280,
          color: isSparkle ? SPARK_COLORS[Math.floor(rng() * 4)] : TOKENS.ink,
          sparkle: isSparkle
        });
      }
      isAssembling = false;
      morphDuration = 850;
    }
    particles = newParticles;
    morphStart = performance.now();
    captionEl!.textContent = COPY.heroCycle[idx].caption;
    syncCompButtons(idx);
  }

  function getGridMetrics(totalCols: number, totalRows: number) {
    const devW = canvas!.width;
    const devH = canvas!.height;
    const minPadX = isMobile ? 0 : Math.round(devW * 0.035);
    const cellW = Math.max(1, Math.floor((devW - minPadX * 2) / totalCols));
    const cellH = Math.max(1, Math.round(cellW * 0.8));
    const gridW = cellW * totalCols;
    const gridH = cellH * totalRows;
    const padX = Math.max(0, Math.floor((devW - gridW) / 2));
    const padY = Math.max(0, Math.floor((devH - gridH) / 2));
    return { devW, devH, cellW, cellH, padX, padY };
  }

  function drawStatic() {
    sizeCanvas();
    if (cssW <= 0) return;
    const t = getTargetLayout(cycleIdx);
    const { devW, devH, cellW, cellH, padX, padY } = getGridMetrics(t.totalCols, t.totalRows);

    ctx!.fillStyle = TOKENS.sodium;
    ctx!.fillRect(0, 0, devW, devH);
    ctx!.fillStyle = TOKENS.ink;

    const blockW = cellW + 1;
    const blockH = cellH + 1;
    for (let i = 0; i < t.cells.length; i++) {
      const c = t.cells[i];
      const x0 = Math.round(padX + c.x * cellW);
      const y0 = Math.round(padY + c.y * cellH);
      ctx!.fillRect(x0, y0, blockW, blockH);
    }
    captionEl!.textContent = COPY.heroCycle[cycleIdx].caption;
    syncCompButtons(cycleIdx);
  }

  function step(now: number) {
    if (!state.motionOn) {
      running = false;
      motion.remove(step);
      drawStatic();
      return;
    }
    if (cssW <= 0) sizeCanvas();
    if (cssW <= 0) return;

    const t = getTargetLayout(cycleIdx);
    const { devW, devH, cellW, cellH, padX, padY } = getGridMetrics(t.totalCols, t.totalRows);

    const elapsed = now - morphStart;
    const easeFn = isAssembling ? easeAssemble : easeMorph;
    const repelRadius = cellW * 3.5;
    const maxDisp = 1.4;
    const ptrDevX = pointerX * dpr;
    const ptrDevY = pointerY * dpr;

    ctx!.fillStyle = TOKENS.sodium;
    ctx!.fillRect(0, 0, devW, devH);

    const blockW = cellW + 1;
    const blockH = cellH + 1;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localT = Math.min(1, Math.max(0, (elapsed - p.delay) / morphDuration));
      const e = easeFn(localT);
      const baseX = p.sx + (p.tx - p.sx) * e;
      const baseY = p.sy + (p.ty - p.sy) * e;

      let targetDx = 0;
      let targetDy = 0;
      if (pointerX > -5000) {
        const px = padX + (baseX + 0.5) * cellW;
        const py = padY + (baseY + 0.5) * cellH;
        const dx = px - ptrDevX;
        const dy = py - ptrDevY;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.001 && dist < repelRadius) {
          const push = (1 - dist / repelRadius) * maxDisp;
          targetDx = (dx / dist) * push;
          targetDy = (dy / dist) * push;
        }
      }
      if (localT >= 1 && pointerX < -5000) {
        p.vx = 0;
        p.vy = 0;
        p.x = p.tx;
        p.y = p.ty;
      } else {
        p.vx = (p.vx + (targetDx - (p.x - baseX)) * 0.12) * 0.8;
        p.vy = (p.vy + (targetDy - (p.y - baseY)) * 0.12) * 0.8;
        p.x = baseX + (p.x - baseX) + p.vx;
        p.y = baseY + (p.y - baseY) + p.vy;
      }

      ctx!.fillStyle = p.sparkle && elapsed < 450 ? p.color : TOKENS.ink;
      const x0 = Math.round(padX + p.x * cellW);
      const y0 = Math.round(padY + p.y * cellH);
      ctx!.fillRect(x0, y0, blockW, blockH);
    }
  }

  function scheduleNext() {
    window.clearTimeout(holdTimer);
    if (!state.motionOn || !inView) return;
    holdTimer = window.setTimeout(() => {
      if (!state.motionOn || !inView || document.hidden) return;
      cycleIdx = (cycleIdx + 1) % COPY.heroCycle.length;
      buildParticlesForTarget(cycleIdx, false);
      scheduleNext();
    }, 3400 + morphDuration);
  }

  function startLoop() {
    if (!state.motionOn) {
      drawStatic();
      return;
    }
    if (!running) {
      running = true;
      motion.add(step);
    }
    scheduleNext();
  }

  function stopLoop() {
    window.clearTimeout(holdTimer);
    if (running) {
      running = false;
      motion.remove(step);
    }
  }

  sizeCanvas();
  if (state.motionOn) {
    buildParticlesForTarget(0, true);
    startLoop();
  } else {
    drawStatic();
  }

  canvas.addEventListener("click", () => {
    cycleIdx = (cycleIdx + 1) % COPY.heroCycle.length;
    if (!state.motionOn) {
      drawStatic();
      return;
    }
    buildParticlesForTarget(cycleIdx, false);
    scheduleNext();
  });

  if (compBar) {
    compBar.addEventListener("click", e => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".hero-comp-btn");
      if (!btn) return;
      const nextIdx = Number(btn.getAttribute("data-comp-idx") || "0");
      if (Number.isNaN(nextIdx) || nextIdx === cycleIdx) return;
      cycleIdx = nextIdx;
      if (!state.motionOn) {
        drawStatic();
        return;
      }
      buildParticlesForTarget(cycleIdx, false);
      scheduleNext();
    });
  }

  if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    canvas.addEventListener(
      "pointermove",
      e => {
        const r = canvas.getBoundingClientRect();
        pointerX = e.clientX - r.left;
        pointerY = e.clientY - r.top;
      },
      { passive: true }
    );
    canvas.addEventListener("pointerleave", () => {
      pointerX = -9999;
      pointerY = -9999;
    });
  }

  const io = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        inView = entry.intersectionRatio >= 0.1;
        if (inView && state.motionOn) startLoop();
        else stopLoop();
      }
    },
    { threshold: [0, 0.1] }
  );
  io.observe(canvas);

  let rTimer = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(rTimer);
    rTimer = window.setTimeout(() => {
      const wasMob = isMobile;
      sizeCanvas();
      if (!state.motionOn) drawStatic();
      else if (wasMob !== isMobile) buildParticlesForTarget(cycleIdx, false);
    }, 150);
  });
  ro.observe(canvas);

  const onMotionChange = () => {
    if (state.motionOn) {
      cycleIdx = 0;
      buildParticlesForTarget(0, true);
      startLoop();
    } else {
      stopLoop();
      drawStatic();
    }
  };
  window.addEventListener("raster:motionchange", onMotionChange);

  state.routeCleanup.push(() => {
    stopLoop();
    io.disconnect();
    ro.disconnect();
    window.clearTimeout(rTimer);
    window.removeEventListener("raster:motionchange", onMotionChange);
  });
}

function initNumbers(): void {
  const statsEl = document.getElementById("stats-grid");
  const cdBlock = document.getElementById("countdown-block");
  if (!statsEl || !cdBlock) return;

  const STATS = [
    { val: PROJECTS.length, pad: 2, label: "projects" },
    { val: TRACKS.length, pad: 2, label: "disciplines" },
    { val: SKILLS.length, pad: 2, label: "core skills" },
    { val: PROJECTS.filter(p => p.featured).length, pad: 2, label: "featured" },
    { val: 29, pad: 2, label: "grad year" }
  ];

  statsEl.innerHTML = STATS.map(
    (s, i) => `
      <div class="stat-item">
        <div class="stat-num-slot" data-stat-idx="${i}">
          ${svgBitmapText(String(s.val).padStart(s.pad, "0"), 6, TOKENS.sodium, { ariaHidden: true, bold: true })}
        </div>
        <span class="t-lead">${esc(s.label)}</span>
      </div>
    `
  ).join("");

  const renderStatSlots = (nums: number[]) => {
    nums.forEach((n, idx) => {
      const slot = statsEl.querySelector(`.stat-num-slot[data-stat-idx="${idx}"]`);
      if (slot) {
        const str = String(n).padStart(STATS[idx].pad, "0");
        slot.innerHTML = svgBitmapText(str, 6, TOKENS.sodium, { ariaHidden: true, bold: true });
      }
    });
  };

  if (state.motionOn) {
    renderStatSlots(STATS.map(() => 0));
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            io.disconnect();
            const start = performance.now();
            const dur = 600;
            const stepCount = (now: number) => {
              const t = Math.min(1, (now - start) / dur);
              renderStatSlots(STATS.map(s => Math.round(s.val * t)));
              if (t >= 1) motion.remove(stepCount);
            };
            motion.add(stepCount);
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(statsEl);
    state.routeCleanup.push(() => io.disconnect());
  }

  const targetMs = Date.parse(PROFILE.gradTargetUTC);
  function renderCountdown() {
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      cdBlock!.innerHTML = `<p class="t-lead">${esc(COPY.countdownOver)}</p>`;
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const cellPx = window.innerWidth >= 768 ? 5 : 4;
    const units = [
      { v: String(days), u: "days" },
      { v: String(hrs).padStart(2, "0"), u: "hours" },
      { v: String(mins).padStart(2, "0"), u: "min" },
      { v: String(secs).padStart(2, "0"), u: "sec" }
    ];
    cdBlock!.innerHTML = `
      <div class="countdown-row">
        ${units
          .map(
            item => `<div class="countdown-unit">
              ${svgBitmapText(item.v, cellPx, TOKENS.sodium, { ariaHidden: true, bold: true })}
              <span class="t-micro">${item.u}</span>
            </div>`
          )
          .join("")}
      </div>
      <p class="t-micro" style="margin-top:8px;">B.Tech ECE graduation countdown — 2029, KTU Kerala.</p>
    `;
  }
  renderCountdown();
  const cdTimer = window.setInterval(renderCountdown, 1000);
  state.routeCleanup.push(() => window.clearInterval(cdTimer));
}

function initTrackPanels(): void {
  const grid = document.getElementById("tracks-grid");
  if (!grid) return;

  const weavePlus = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 6;
    const py = (y + phase) % 6;
    const inA = (px === 1 && py <= 2) || (py === 1 && px <= 2);
    const inB = (px === 4 && py >= 3) || (py === 4 && px >= 3);
    return inA || inB ? 1 : 0;
  };
  const weaveCross = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 4;
    const py = (y + phase) % 4;
    return px === 1 || py === 1 ? 1 : 0;
  };
  const weaveTartan = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 4;
    const py = (y + phase) % 4;
    return (px < 2) !== (py < 2) || (px === 1 && py === 1) ? 1 : 0;
  };
  const weaveBasket = (x: number, y: number, phase: number) => {
    const px = (x + phase) % 4;
    const py = (y + phase) % 4;
    const block = (Math.floor((x + phase) / 4) + Math.floor((y + phase) / 4)) % 2 === 0;
    return block ? (py % 2 === 0 ? 1 : 0) : px % 2 === 0 ? 1 : 0;
  };

  const PANEL_STYLES: Record<
    TrackId,
    { colA: string; colB: string; weave: (x: number, y: number, p: number) => number }
  > = {
    embedded: { colA: "#2370E8", colB: "#0A0A0A", weave: weavePlus },
    robotics: { colA: "#FF5A36", colB: "#F5B700", weave: weaveCross },
    dataviz: { colA: "#2BA676", colB: "#D873B3", weave: weaveTartan },
    webapps: { colA: "#A98BF7", colB: "#2370E8", weave: weaveBasket }
  };

  grid.innerHTML = TRACKS.map(t => {
    const count = projectsByTrack(t.id).length;
    const aria = `${t.label} discipline: ${count} builds. Open projects filtered by ${t.label}.`;
    return `
      <figure class="track-fig">
        <button type="button" class="track-panel-btn" data-track="${esc(t.id)}" aria-label="${esc(aria)}">
          <svg class="track-panel-svg" viewBox="0 0 80 80" shape-rendering="crispEdges" aria-hidden="true"></svg>
          <span class="track-panel-overlay" style="background:${t.bg};color:${t.fg};">
            <span class="track-panel-name">${esc(t.label)}</span>
            <span class="t-small track-panel-desc">${esc(t.desc)}</span>
            <span class="t-micro tnum" style="margin-top:4px;">${count} ${count === 1 ? "project" : "projects"} →</span>
          </span>
        </button>
      </figure>
    `;
  }).join("");

  TRACKS.forEach(t => {
    const btn = grid.querySelector(`.track-panel-btn[data-track="${t.id}"]`) as HTMLButtonElement;
    const svg = btn.querySelector(".track-panel-svg") as SVGSVGElement;
    const panel = PANEL_STYLES[t.id];
    const cell = 4;
    const n = 20;
    let busy = false;
    let animTimer = 0;

    function drawGrid(phase: number) {
      let out = `<rect x="0" y="0" width="80" height="80" fill="${panel.colA}"/>`;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          if (panel.weave(x, y, phase) === 1) {
            out += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${panel.colB}"/>`;
          }
        }
      }
      svg.innerHTML = out;
    }

    drawGrid(0);

    function play() {
      if (!state.motionOn || busy) return;
      busy = true;
      let step = 0;
      animTimer = window.setInterval(() => {
        step++;
        drawGrid(step % 6);
        if (step >= 6) {
          window.clearInterval(animTimer);
          drawGrid(0);
          busy = false;
        }
      }, 90);
    }

    btn.addEventListener("mouseenter", play);
    btn.addEventListener("focus", play);
    btn.addEventListener("click", () => {
      state.projectsFilter.tracks = [t.id];
      window.location.hash = "#/projects";
    });

    state.routeCleanup.push(() => {
      window.clearInterval(animTimer);
    });
  });
}

function initJourneyColumns(): void {
  const wrap = document.getElementById("days-cols");
  if (!wrap) return;
  wrap.innerHTML = JOURNEY_PHASES.map(phase => {
    const phaseProjects = projectsByPhase(phase.id);
    return `
      <div class="day-col">
        ${svgBitmapText(phase.num, 7, TOKENS.ink, { className: "day-num-svg", ariaHidden: true, bold: true })}
        <h3 class="t-lead">${esc(phase.year)} — ${esc(phase.title.split(" — ")[0])}</h3>
        <p class="t-micro day-doors">${esc(phase.subtitle)}</p>
        <p class="t-small" style="margin-bottom:14px;">${esc(phase.description)}</p>
        <div class="day-session-list">
          ${phaseProjects
            .map(p => {
              const tr = trackById(p.track);
              return `
                <a class="day-session-row" href="#/projects/${esc(p.id)}" data-track="${esc(p.track)}">
                  <div class="t-micro tnum">${esc(p.num)} · ${esc(p.year)}</div>
                  <div class="t-small day-session-title">${esc(p.title)}</div>
                  <div class="t-micro day-session-meta">
                    <span class="track-pill" style="background:${tr.bg};color:${tr.fg};">${esc(tr.label)}</span>
                    <span>${esc(p.tags.slice(0, 3).join(" · "))}</span>
                  </div>
                </a>
              `;
            })
            .join("")}
        </div>
        <div class="day-col-footer">
          <a class="btn-text t-micro u-anim" href="#/journey">Education &amp; FAQ →</a>
        </div>
      </div>
    `;
  }).join("");
}

function initFeaturedProjectsPreview(): void {
  const wrap = document.getElementById("speakers-preview-grid");
  const filterWrap = document.getElementById("home-gallery-filters");
  if (!wrap) return;

  let activeTrackFilter = "all";

  function updateFilterCounts() {
    if (!filterWrap) return;
    const allBtn = filterWrap.querySelector<HTMLButtonElement>('[data-track-filter="all"]');
    if (allBtn) allBtn.textContent = `All (${PROJECTS.length})`;
    TRACKS.forEach(tr => {
      const btn = filterWrap.querySelector<HTMLButtonElement>(`[data-track-filter="${tr.id}"]`);
      if (btn) {
        btn.innerHTML = `<span class="chip-sq" style="background:${tr.bg}"></span><span>${esc(tr.label)} (${projectsByTrack(tr.id).length})</span>`;
      }
    });
    const topDate = document.getElementById("hero-top-date");
    if (topDate) topDate.textContent = COPY.heroDate;
    const leadEl = document.getElementById("home-gallery-lead");
    if (leadEl) leadEl.textContent = COPY.speakersLead;
  }

  function renderGallery(trackFilter: string) {
    activeTrackFilter = trackFilter;
    const items = trackFilter === "all" ? PROJECTS : PROJECTS.filter(p => p.track === trackFilter);
    wrap!.innerHTML = items
      .map(p => {
        const tr = trackById(p.track);
        const ghLink = p.repoUrl
          ? `<a class="u-anim gallery-card-cta tnum" href="${esc(p.repoUrl)}" target="_blank" rel="noreferrer noopener">GitHub ↗</a>`
          : "";
        return `
          <article class="speaker-card gallery-project-card">
            <a class="speaker-card-link gallery-thumb-wrap" href="#/projects/${esc(p.id)}">
              <div class="gallery-thumb-meta t-micro tnum">
                <span>#${esc(p.num)}${p.isGithubSynced ? " · GH" : ""}</span>
                <span>${esc(tr.label)}</span>
              </div>
              <canvas class="portrait-canvas" data-pid="${esc(p.id)}" role="img" aria-label="Pixel schematic for ${esc(p.title)}"></canvas>
            </a>
            <div class="gallery-card-body">
              <div class="gallery-card-head">
                <p class="t-lead speaker-card-name"><a class="u-anim" href="#/projects/${esc(p.id)}">${esc(p.title)}</a></p>
                <p class="t-micro speaker-card-role tnum">${esc(p.category)} · ${esc(p.year)}</p>
              </div>
              <p class="t-small gallery-card-desc">${esc(p.summary)}</p>
              ${renderTechBadges(p.tags, 5)}
              <div class="gallery-card-foot t-micro">
                <span class="gallery-card-tags">${esc(p.role)}</span>
                <span style="display:inline-flex;gap:10px;align-items:center;">
                  ${ghLink}
                  <a class="u-anim gallery-card-cta tnum" href="#/projects/${esc(p.id)}">Case study →</a>
                </span>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    items.forEach(p => {
      const canvas = wrap!.querySelector(`canvas[data-pid="${p.id}"]`) as HTMLCanvasElement | null;
      if (canvas) {
        initProjectPixelCanvas(canvas, p, motion, () => state.motionOn, state.routeCleanup, {});
      }
    });
  }

  renderGallery("all");

  const onProjectsUpdated = () => {
    updateFilterCounts();
    renderGallery(activeTrackFilter);
  };
  window.addEventListener("raster:projects-updated", onProjectsUpdated);
  state.routeCleanup.push(() => window.removeEventListener("raster:projects-updated", onProjectsUpdated));

  if (filterWrap) {
    filterWrap.addEventListener("click", async e => {
      const syncBtn = (e.target as HTMLElement).closest<HTMLButtonElement>("#gh-sync-btn");
      if (syncBtn) {
        syncBtn.textContent = "↻ Syncing GitHub...";
        const res = await syncGitHubProjects();
        syncBtn.textContent = `✓ GitHub Synced (${res.total} builds)`;
        return;
      }
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-track-filter]");
      if (!btn) return;
      const trackFilter = btn.getAttribute("data-track-filter") || "all";
      filterWrap.querySelectorAll<HTMLButtonElement>("[data-track-filter]").forEach(b => {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      renderGallery(trackFilter);
    });
  }
}

function initHomeSkillsGrid(): void {
  const wrap = document.getElementById("home-skills-grid");
  if (!wrap) return;

  wrap.innerHTML = SKILLS.map(sk => {
    const linked = sk.relatedProjects
      .map(pid => projectById(pid))
      .filter(Boolean)
      .slice(0, 2)
      .map(p => `<a class="u-anim t-micro" href="#/projects/${esc(p!.id)}">${esc(p!.title)}</a>`)
      .join(" · ");

    return `
      <div class="skill-cell">
        <div class="skill-cell-head">
          <span class="skill-glyph" aria-hidden="true">${esc(sk.icon)}</span>
          <span class="t-micro">${esc(sk.category)} · ${esc(sk.level)}</span>
        </div>
        <p class="t-lead" style="margin-top:8px;">${esc(sk.name)}</p>
        <p class="t-micro" style="margin-top:6px;">${linked || "Core engineering foundation"}</p>
      </div>
    `;
  }).join("");
}
