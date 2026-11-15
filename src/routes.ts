import {
  COPY,
  FAQ_ITEMS,
  JOURNEY_PHASES,
  LAB_BLOCKS,
  PROFILE,
  PROJECTS,
  SKILLS,
  TOKENS,
  TRACKS,
  TrackId
} from "./data";
import {
  BADGE_PALETTE,
  esc,
  initProjectPixelCanvas,
  layoutGlyphLines,
  makeRng,
  normText,
  renderTechBadges,
  svgBitmapText,
  svgPixelIcon
} from "./pixelArt";
import {
  buildReadinessGrid,
  labBlockById,
  motion,
  projectById,
  state,
  storageSet,
  toggleShortlist,
  trackById
} from "./state";

export function renderProjects(main: HTMLElement): void {
  document.title = "Projects" + COPY.siteTitleSuffix;
  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="Projects">
      <div class="grid">
        <div class="col-full">
          <h1 class="t-h1" tabindex="-1">${esc(COPY.projectsTitle)}</h1>
          <p class="t-body" style="margin-top:16px;">${esc(COPY.projectsLead)}</p>
          <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
            <div class="track-toggles-wrap" id="proj-track-toggles">
              ${TRACKS.map(t => {
                const pressed = state.projectsFilter.tracks.includes(t.id);
                return `<button type="button" class="chip-toggle t-small" data-track="${esc(t.id)}" aria-pressed="${pressed ? "true" : "false"}">
                  <span class="swatch-dot" style="background:${t.bg};"></span>
                  ${esc(t.label)}
                </button>`;
              }).join("")}
            </div>
            <div class="seg-group" role="group" aria-label="Sort projects">
              <button type="button" class="chip-toggle t-small" id="proj-sort-feat" aria-pressed="${state.projectsFilter.sort === "featured" ? "true" : "false"}">Featured</button>
              <button type="button" class="chip-toggle t-small" id="proj-sort-az" aria-pressed="${state.projectsFilter.sort === "az" ? "true" : "false"}">A–Z</button>
            </div>
          </div>
        </div>
        <div class="col-full" id="proj-grid-wrap"></div>
      </div>
    </section>
  `;

  const gridWrap = document.getElementById("proj-grid-wrap")!;
  const trackBtns = Array.from(document.querySelectorAll("#proj-track-toggles .chip-toggle")) as HTMLButtonElement[];
  const featBtn = document.getElementById("proj-sort-feat")!;
  const azBtn = document.getElementById("proj-sort-az")!;

  function drawList(skipFade: boolean) {
    let list = PROJECTS.filter(
      p => state.projectsFilter.tracks.length === 0 || state.projectsFilter.tracks.includes(p.track)
    );
    if (state.projectsFilter.sort === "az") {
      list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = list.slice().sort((a, b) => Number(b.featured) - Number(a.featured) || a.num.localeCompare(b.num));
    }

    if (list.length === 0) {
      gridWrap.innerHTML = `<p class="t-lead" style="margin-top:48px;">No projects in this filter.</p>`;
      return;
    }

    const doRender = () => {
      gridWrap.innerHTML = `<div class="speakers-index-grid">
        ${list
          .map(p => {
            const tr = trackById(p.track);
            return `<figure class="speaker-card" data-pcard="${esc(p.id)}">
              <a class="speaker-card-link" href="#/projects/${esc(p.id)}">
                <canvas class="portrait-canvas" data-pid="${esc(p.id)}" role="img" aria-label="Pixel schematic for ${esc(p.title)}"></canvas>
              </a>
              <figcaption>
                <p class="t-lead speaker-card-name"><a class="u-anim" href="#/projects/${esc(p.id)}">${esc(p.title)}</a></p>
                <p class="t-micro speaker-card-role">${esc(tr.label)} · ${esc(p.category)} · ${esc(p.year)}</p>
                ${renderTechBadges(p.tags, 5)}
              </figcaption>
            </figure>`;
          })
          .join("")}
      </div>`;

      list.forEach(p => {
        const canvas = gridWrap.querySelector(`canvas[data-pid="${p.id}"]`) as HTMLCanvasElement | null;
        if (canvas) {
          initProjectPixelCanvas(canvas, p, motion, () => state.motionOn, state.routeCleanup, {
            skipAssemble: !skipFade
          });
        }
      });
    };

    const existing = Array.from(gridWrap.querySelectorAll(".speaker-card")) as HTMLElement[];
    if (!skipFade && state.motionOn && existing.length > 0) {
      const keepIds = new Set(list.map(p => p.id));
      const leaving = existing.filter(el => !keepIds.has(el.dataset.pcard || ""));
      if (leaving.length > 0) {
        leaving.forEach(el => el.classList.add("is-leaving"));
        window.setTimeout(doRender, 160);
        return;
      }
    }
    doRender();
  }

  trackBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tid = btn.dataset.track as TrackId;
      const i = state.projectsFilter.tracks.indexOf(tid);
      if (i === -1) state.projectsFilter.tracks.push(tid);
      else state.projectsFilter.tracks.splice(i, 1);
      btn.setAttribute("aria-pressed", i === -1 ? "true" : "false");
      drawList(false);
    });
  });

  featBtn.addEventListener("click", () => {
    state.projectsFilter.sort = "featured";
    featBtn.setAttribute("aria-pressed", "true");
    azBtn.setAttribute("aria-pressed", "false");
    drawList(false);
  });
  azBtn.addEventListener("click", () => {
    state.projectsFilter.sort = "az";
    featBtn.setAttribute("aria-pressed", "false");
    azBtn.setAttribute("aria-pressed", "true");
    drawList(false);
  });

  drawList(true);
}

export function renderProjectDetail(main: HTMLElement, id: string): void {
  const idx = PROJECTS.findIndex(p => p.id === id);
  if (idx === -1) {
    renderNotFound(main);
    return;
  }
  const proj = PROJECTS[idx];
  const prevProj = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const nextProj = PROJECTS[(idx + 1) % PROJECTS.length];
  const tr = trackById(proj.track);
  const relatedSkills = SKILLS.filter(s => s.relatedProjects.includes(proj.id));
  const shortlisted = state.shortlist.includes(proj.id);
  const resLabels = ["4 × 4", "8 × 8", "16 × 16", "32 × 32"];
  const resSizes = [8, 4, 2, 1];

  document.title = proj.title + COPY.siteTitleSuffix;
  main.innerHTML = `
    <section class="sub-sec" data-surface="paper" data-pager="${esc(proj.title)}">
      <div class="grid">
        <div class="col-1-5">
          <figure>
            <canvas class="portrait-canvas" id="detail-portrait" role="img" aria-label="Pixel schematic for ${esc(proj.title)}"></canvas>
            <div class="scrubber-wrap">
              <div class="scrubber-head">
                <label class="t-micro" for="res-scrubber">(Resolution)</label>
                <output class="t-micro tnum" id="res-output" for="res-scrubber">32 × 32</output>
              </div>
              <input class="scrubber-input" type="range" id="res-scrubber" min="0" max="3" step="1" value="3" aria-valuetext="32 × 32">
            </div>
            <figcaption class="t-micro" style="margin-top:8px;">Project schematic: 32 × 32 grid. Slide to downsample resolution.</figcaption>
          </figure>
        </div>
        <div class="col-7-12">
          <p class="t-micro tnum">(Project ${String(idx + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")})</p>
          <h1 class="t-h1" tabindex="-1" style="margin-top:8px;">${esc(proj.title)}</h1>
          <p class="t-lead" style="margin-top:16px;">${esc(proj.summary)}</p>

          <dl class="project-meta-dl t-small">
            <div class="project-meta-row">
              <dt>Discipline</dt>
              <dd><span class="track-pill" style="background:${tr.bg};color:${tr.fg};">${esc(tr.label)}</span> · ${esc(proj.category)}</dd>
            </div>
            <div class="project-meta-row">
              <dt>Role</dt>
              <dd>${esc(proj.role)}</dd>
            </div>
            <div class="project-meta-row">
              <dt>Timeline</dt>
              <dd class="tnum">${esc(proj.year)}</dd>
            </div>
            <div class="project-meta-row">
              <dt>Stack</dt>
              <dd>${renderTechBadges(proj.tags, 8)}</dd>
            </div>
          </dl>

          <h2 class="t-small fw-600" style="margin-top:32px;">Case Study</h2>
          <p class="t-body" style="margin-top:8px;">${esc(proj.caseStudy)}</p>

          <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;">
            <button type="button" class="chip-toggle t-small" id="detail-shortlist-btn" aria-pressed="${shortlisted ? "true" : "false"}">
              ${shortlisted ? "Shortlisted for inquiry ✓" : "Add to inquiry shortlist"}
            </button>
            ${
              proj.repoUrl
                ? `<a class="btn-primary btn-sm t-small" href="${esc(proj.repoUrl)}" target="_blank" rel="noreferrer noopener"><span>View on GitHub ↗</span></a>`
                : ""
            }
            ${
              proj.homepageUrl
                ? `<a class="btn-ghost btn-sm t-small" href="${esc(proj.homepageUrl)}" target="_blank" rel="noreferrer noopener"><span>Live Demo ↗</span></a>`
                : ""
            }
            <a class="btn-text t-small u-anim" href="#/contact">Discuss this build →</a>
          </div>

          ${
            relatedSkills.length > 0
              ? `<h2 class="t-small fw-600" style="margin-top:40px;">Core Skills Applied</h2>
                 <p class="t-small" style="margin-top:8px;">
                   ${relatedSkills
                     .map(s => `<a class="u-anim" href="#/skills">${esc(s.icon)} ${esc(s.name)} (${esc(s.level)})</a>`)
                     .join(" · ")}
                 </p>`
              : ""
          }

          <div class="speaker-prev-next">
            <a class="btn-text t-small u-anim" href="#/projects/${esc(prevProj.id)}">← Previous: ${esc(prevProj.title)}</a>
            <a class="btn-text t-small u-anim" href="#/projects/${esc(nextProj.id)}">Next: ${esc(nextProj.title)} →</a>
          </div>
        </div>
      </div>
    </section>
  `;

  const ctrl = initProjectPixelCanvas(
    document.getElementById("detail-portrait") as HTMLCanvasElement,
    proj,
    motion,
    () => state.motionOn,
    state.routeCleanup,
    {}
  );
  const scrubber = document.getElementById("res-scrubber") as HTMLInputElement;
  const out = document.getElementById("res-output")!;
  scrubber.addEventListener("input", () => {
    const v = Number(scrubber.value);
    const label = resLabels[v] || "32 × 32";
    out.textContent = label;
    scrubber.setAttribute("aria-valuetext", label);
    ctrl.setBlockSize(resSizes[v] || 1);
  });

  const slBtn = document.getElementById("detail-shortlist-btn")!;
  slBtn.addEventListener("click", () => {
    toggleShortlist(proj.id);
    const active = state.shortlist.includes(proj.id);
    slBtn.setAttribute("aria-pressed", active ? "true" : "false");
    slBtn.textContent = active ? "Shortlisted for inquiry ✓" : "Add to inquiry shortlist";
  });
}

export function renderArchive(main: HTMLElement): void {
  document.title = "Archive" + COPY.siteTitleSuffix;
  const categories = Array.from(new Set(PROJECTS.map(p => p.category)));

  main.innerHTML = `
    <section class="sub-sec" data-surface="paper" data-pager="Archive">
      <div class="grid">
        <div class="col-full">
          <h1 class="t-h1" tabindex="-1">${esc(COPY.archiveTitle)}</h1>
          <p class="t-body" style="margin-top:16px;">${esc(COPY.archiveLead)}</p>
        </div>
        <div class="col-full talks-controls">
          <div class="talks-search-row">
            <div class="field-group">
              <label class="t-micro" for="archive-search">Search projects</label>
              <input class="text-input" type="search" id="archive-search" placeholder="ESP32, CesiumJS, LM358" value="${esc(state.archiveFilter.query)}">
            </div>
            <div class="track-toggles-wrap" id="archive-cat-toggles">
              ${categories
                .map(cat => {
                  const pressed = state.archiveFilter.categories.includes(cat);
                  return `<button type="button" class="chip-toggle t-small" data-cat="${esc(cat)}" aria-pressed="${pressed ? "true" : "false"}">${esc(cat)}</button>`;
                })
                .join("")}
            </div>
            <div class="track-toggles-wrap" id="archive-track-toggles">
              ${TRACKS.map(t => {
                const pressed = state.archiveFilter.tracks.includes(t.id);
                return `<button type="button" class="chip-toggle t-small" data-track="${esc(t.id)}" aria-pressed="${pressed ? "true" : "false"}">
                  <span class="swatch-dot" style="background:${t.bg};"></span>
                  ${esc(t.label)}
                </button>`;
              }).join("")}
            </div>
          </div>
          <p class="t-micro" id="archive-count" aria-live="polite"></p>
        </div>
        <div class="col-full" id="archive-table-wrap"></div>
      </div>
    </section>
  `;

  const searchInput = document.getElementById("archive-search") as HTMLInputElement;
  const catBtns = Array.from(document.querySelectorAll("#archive-cat-toggles .chip-toggle")) as HTMLButtonElement[];
  const trackBtns = Array.from(document.querySelectorAll("#archive-track-toggles .chip-toggle")) as HTMLButtonElement[];
  const countEl = document.getElementById("archive-count")!;
  const wrapEl = document.getElementById("archive-table-wrap")!;

  function highlightText(text: string, query: string): string {
    if (!query) return esc(text);
    const normQ = normText(query.trim());
    if (!normQ) return esc(text);
    const rawChars = Array.from(text);
    const normChars = rawChars.map(c => normText(c));
    const flatNorm = normChars.join("");
    let idx = flatNorm.indexOf(normQ);
    if (idx === -1) return esc(text);
    const mapStart: number[] = [];
    for (let i = 0; i < rawChars.length; i++) {
      for (let k = 0; k < normChars[i].length; k++) mapStart.push(i);
    }
    mapStart.push(rawChars.length);
    let out = "";
    let pos = 0;
    while (idx !== -1) {
      const rawS = mapStart[idx];
      const rawE = mapStart[idx + normQ.length];
      out += esc(rawChars.slice(pos, rawS).join(""));
      out += `<mark>${esc(rawChars.slice(rawS, rawE).join(""))}</mark>`;
      pos = rawE;
      idx = flatNorm.indexOf(normQ, idx + normQ.length);
    }
    out += esc(rawChars.slice(pos).join(""));
    return out;
  }

  function renderTable() {
    const q = normText(state.archiveFilter.query.trim());
    const list = PROJECTS.filter(p => {
      if (state.archiveFilter.categories.length > 0 && !state.archiveFilter.categories.includes(p.category)) return false;
      if (state.archiveFilter.tracks.length > 0 && !state.archiveFilter.tracks.includes(p.track)) return false;
      if (q) {
        const hay = normText(`${p.title} ${p.summary} ${p.caseStudy} ${p.tags.join(" ")} ${p.category}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const dir = state.archiveFilter.sortDir === "asc" ? 1 : -1;
    const col = state.archiveFilter.sortCol;
    list.sort((a, b) => {
      if (col === "num") return a.num.localeCompare(b.num) * dir;
      if (col === "title") return a.title.localeCompare(b.title) * dir;
      return a.year.localeCompare(b.year) * dir;
    });

    countEl.textContent = `${list.length} of ${PROJECTS.length} builds`;

    if (list.length === 0) {
      wrapEl.innerHTML = `
        <div class="schedule-empty">
          <p class="t-lead">No project matches “${esc(state.archiveFilter.query)}”.</p>
          <button type="button" class="btn-text t-small u-anim" id="archive-clear-btn">Clear filters</button>
        </div>
      `;
      document.getElementById("archive-clear-btn")!.addEventListener("click", () => {
        state.archiveFilter.query = "";
        state.archiveFilter.categories = [];
        state.archiveFilter.tracks = [];
        searchInput.value = "";
        catBtns.forEach(b => b.setAttribute("aria-pressed", "false"));
        trackBtns.forEach(b => b.setAttribute("aria-pressed", "false"));
        renderTable();
      });
      return;
    }

    const triSvg = (activeCol: string) => {
      if (state.archiveFilter.sortCol !== activeCol) return "";
      const up = state.archiveFilter.sortDir === "asc";
      return `<svg width="10" height="6" viewBox="0 0 5 3" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">${
        up
          ? `<rect x="2" y="0" width="1" height="1"/><rect x="1" y="1" width="3" height="1"/><rect x="0" y="2" width="5" height="1"/>`
          : `<rect x="0" y="0" width="5" height="1"/><rect x="1" y="1" width="3" height="1"/><rect x="2" y="2" width="1" height="1"/>`
      }</svg>`;
    };
    const ariaSort = (activeCol: string) =>
      state.archiveFilter.sortCol !== activeCol
        ? "none"
        : state.archiveFilter.sortDir === "asc"
          ? "ascending"
          : "descending";

    wrapEl.innerHTML = `
      <table class="data-table responsive-table talks-table">
        <caption class="t-micro">Projects index, ${list.length} rows</caption>
        <thead>
          <tr>
            <th class="t-micro" aria-sort="${ariaSort("num")}"><button type="button" class="sort-btn t-micro" data-sort="num">№ ${triSvg("num")}</button></th>
            <th class="t-micro" aria-sort="${ariaSort("title")}"><button type="button" class="sort-btn t-micro" data-sort="title">Title ${triSvg("title")}</button></th>
            <th class="t-micro col-speakers">Stack</th>
            <th class="t-micro">Discipline</th>
            <th class="t-micro">Category</th>
            <th class="t-micro" aria-sort="${ariaSort("year")}"><button type="button" class="sort-btn t-micro" data-sort="year">Timeline ${triSvg("year")}</button></th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map(p => {
              const tr = trackById(p.track);
              const isOpen = state.archiveFilter.openId === p.id;
              const added = state.shortlist.includes(p.id);
              return `
                <tr class="talk-row" id="arch-row-${esc(p.id)}" data-track="${esc(p.track)}">
                  <td data-label="№" class="t-small tnum">${esc(p.num)}</td>
                  <td data-label="Title" class="t-small fw-600">
                    <button type="button" class="btn-text t-small fw-600 u-anim" data-disc="${esc(p.id)}" aria-expanded="${isOpen ? "true" : "false"}" aria-controls="expand-${esc(p.id)}">${highlightText(p.title, state.archiveFilter.query)}</button>
                  </td>
                  <td data-label="Stack" class="t-small col-speakers">${highlightText(p.tags.slice(0, 4).join(" · "), state.archiveFilter.query)}</td>
                  <td data-label="Discipline" class="t-small"><span class="track-pill" style="background:${tr.bg};color:${tr.fg};">${esc(tr.label)}</span></td>
                  <td data-label="Category" class="t-small">${esc(p.category)}</td>
                  <td data-label="Timeline" class="t-small tnum">${esc(p.year)}</td>
                </tr>
                ${
                  isOpen
                    ? `<tr class="talk-expand-row" id="expand-${esc(p.id)}">
                        <td colspan="6">
                          <p class="t-body">${highlightText(p.caseStudy, state.archiveFilter.query)}</p>
                          <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;">
                            <a class="btn-text t-micro u-anim" href="#/projects/${esc(p.id)}">Open full schematic &amp; case study →</a>
                            <button type="button" class="chip-toggle t-micro" data-sl="${esc(p.id)}" aria-pressed="${added ? "true" : "false"}">${added ? "Shortlisted ✓" : "Add to inquiry shortlist"}</button>
                          </div>
                        </td>
                      </tr>`
                    : ""
                }
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    wrapEl.querySelectorAll("[data-sort]").forEach(btn => {
      btn.addEventListener("click", () => {
        const c = (btn as HTMLElement).dataset.sort as "num" | "title" | "year";
        if (state.archiveFilter.sortCol === c) {
          state.archiveFilter.sortDir = state.archiveFilter.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.archiveFilter.sortCol = c;
          state.archiveFilter.sortDir = "asc";
        }
        renderTable();
      });
    });

    wrapEl.querySelectorAll("[data-disc]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.disc!;
        state.archiveFilter.openId = state.archiveFilter.openId === id ? null : id;
        renderTable();
        const newBtn = wrapEl.querySelector(`[data-disc="${id}"]`) as HTMLElement | null;
        if (newBtn) newBtn.focus();
      });
    });

    wrapEl.querySelectorAll("[data-sl]").forEach(btn => {
      btn.addEventListener("click", () => {
        toggleShortlist((btn as HTMLElement).dataset.sl!);
        renderTable();
      });
    });
  }

  searchInput.addEventListener("input", () => {
    state.archiveFilter.query = searchInput.value;
    renderTable();
  });

  catBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat!;
      const i = state.archiveFilter.categories.indexOf(cat);
      if (i === -1) state.archiveFilter.categories.push(cat);
      else state.archiveFilter.categories.splice(i, 1);
      btn.setAttribute("aria-pressed", i === -1 ? "true" : "false");
      renderTable();
    });
  });

  trackBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tid = btn.dataset.track as TrackId;
      const i = state.archiveFilter.tracks.indexOf(tid);
      if (i === -1) state.archiveFilter.tracks.push(tid);
      else state.archiveFilter.tracks.splice(i, 1);
      btn.setAttribute("aria-pressed", i === -1 ? "true" : "false");
      renderTable();
    });
  });

  renderTable();
}

export function renderSkills(main: HTMLElement): void {
  document.title = "Skills & Bench" + COPY.siteTitleSuffix;
  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="Skills &amp; Bench">
      <div class="grid">
        <div class="col-full">
          <h1 class="t-h1" tabindex="-1">${esc(COPY.skillsTitle)}</h1>
          <p class="t-lead" style="margin-top:16px;">${esc(COPY.skillsLead)}</p>
        </div>
      </div>

      <div class="grid venue-grid">
        <figure class="col-1-8">
          <svg class="venue-svg" id="lab-plan-svg" viewBox="0 0 40 24" shape-rendering="crispEdges" role="img" aria-label="Engineering stack diagram" aria-describedby="lab-plan-alt"></svg>
          <figcaption class="t-micro" style="margin-top:8px;">Engineering stack diagram — hover or select any block to inspect bench capabilities and tools.</figcaption>
          <ul class="visually-hidden" id="lab-plan-alt">
            ${LAB_BLOCKS.map(b => `<li>${esc(b.name)}: ${esc(b.tools)}. ${esc(b.features.join(", "))}.</li>`).join("")}
          </ul>
        </figure>
        <div class="col-9-12">
          <div class="venue-room-list" id="lab-block-list">
            ${LAB_BLOCKS.map(
              b => `<button type="button" class="venue-room-btn t-small" data-block="${esc(b.id)}" aria-pressed="${state.selectedLabBlock === b.id ? "true" : "false"}">
                <span>${esc(b.name)} — ${esc(b.nickname)}</span>
                <span class="t-micro tnum">${esc(b.level)}</span>
              </button>`
            ).join("")}
          </div>
          <div class="venue-details" id="lab-details" aria-live="polite"></div>
        </div>
      </div>

      <div class="grid" style="margin-top:64px;">
        <h2 class="col-full t-h2">Tools I work with to turn ideas into working builds.</h2>
        <div class="col-full skills-matrix-grid">
          ${SKILLS.map(sk => {
            const linked = sk.relatedProjects
              .map(pid => projectById(pid))
              .filter(Boolean)
              .map(p => `<a class="u-anim t-micro" href="#/projects/${esc(p!.id)}">${esc(p!.title)}</a>`)
              .join(" · ");
            return `
              <div class="skill-cell">
                <div class="skill-cell-head">
                  <span class="skill-glyph" aria-hidden="true">${esc(sk.icon)}</span>
                  <span class="t-micro">${esc(sk.category)} · ${esc(sk.level)}</span>
                </div>
                <p class="t-lead" style="margin-top:8px;">${esc(sk.name)}</p>
                <p class="t-micro" style="margin-top:8px;opacity:0.85;">${linked || "Core engineering foundation"}</p>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </section>
  `;

  const svgEl = document.getElementById("lab-plan-svg")!;
  const listBtns = Array.from(document.querySelectorAll("#lab-block-list .venue-room-btn")) as HTMLButtonElement[];
  const detailsEl = document.getElementById("lab-details")!;

  function updatePlan(activeId: string) {
    state.selectedLabBlock = activeId;
    const shapes = LAB_BLOCKS.map(rp => {
      const isSel = rp.id === activeId;
      const fill = isSel ? rp.fill : TOKENS.paper;
      const textCol = isSel ? rp.text : TOKENS.ink;
      const chipMarkup = rp.chip
        ? `<rect x="${rp.x + rp.w - 3.6}" y="${rp.y + 0.5}" width="3.1" height="1.6" fill="${TOKENS.paper}" stroke="${TOKENS.ink}" stroke-width="0.2"/><text x="${rp.x + rp.w - 2.05}" y="${rp.y + 1.6}" text-anchor="middle" font-size="0.85" font-weight="600" fill="${TOKENS.ink}">${rp.chip}</text>`
        : "";
      return `<g class="venue-room-shape" data-block="${esc(rp.id)}" tabindex="0" role="button" aria-label="${esc(rp.name)}, ${esc(rp.tools)}">
        <rect x="${rp.x}" y="${rp.y}" width="${rp.w}" height="${rp.h}" fill="${fill}" stroke="${TOKENS.ink}" stroke-width="0.3"/>
        <text x="${rp.x + 1}" y="${rp.y + 1.9}" font-size="0.9" font-weight="600" fill="${textCol}">${esc(rp.name)}</text>
        ${chipMarkup}
      </g>`;
    }).join("");

    svgEl.innerHTML = `
      <rect x="0" y="0" width="40" height="24" fill="${TOKENS.paper}"/>
      ${shapes}
      <rect x="0.25" y="0.25" width="39.5" height="23.5" fill="none" stroke="${TOKENS.ink}" stroke-width="0.5"/>
    `;

    svgEl.querySelectorAll(".venue-room-shape").forEach(g => {
      const bid = (g as HTMLElement).dataset.block!;
      g.addEventListener("mouseenter", () => updatePlan(bid));
      g.addEventListener("focus", () => updatePlan(bid));
      g.addEventListener("click", () => updatePlan(bid));
      g.addEventListener("keydown", e => {
        const ke = e as KeyboardEvent;
        if (ke.key === "Enter" || ke.key === " ") {
          ke.preventDefault();
          updatePlan(bid);
        }
      });
    });

    listBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.block === activeId ? "true" : "false"));

    const blk = labBlockById(activeId);
    detailsEl.innerHTML = `
      <h2 class="t-lead">${esc(blk.name)} — ${esc(blk.nickname)}</h2>
      <p class="t-micro tnum" style="margin-top:6px;">${esc(blk.tools)}</p>
      <ul class="access-list t-small" style="margin-top:12px;">
        ${blk.features.map(f => `<li>${esc(f)}</li>`).join("")}
      </ul>
    `;
  }

  listBtns.forEach(btn => {
    const bid = btn.dataset.block!;
    btn.addEventListener("mouseenter", () => updatePlan(bid));
    btn.addEventListener("focus", () => updatePlan(bid));
    btn.addEventListener("click", () => updatePlan(bid));
  });

  updatePlan(state.selectedLabBlock || "mcu-core");
}

export function renderJourney(main: HTMLElement): void {
  document.title = "Journey & Education" + COPY.siteTitleSuffix;
  main.innerHTML = `
    <section class="sub-sec" data-surface="paper" data-pager="Journey">
      <div class="grid">
        <div class="col-full">
          <h1 class="t-h1" tabindex="-1">${esc(COPY.journeyTitle)}</h1>
          <p class="t-lead" style="margin-top:16px;">${esc(COPY.journeyLead)}</p>
        </div>
      </div>

      <div class="grid" style="margin-top:48px;">
        <div class="col-full degree-panel">
          <p class="t-micro tnum">University Degree · ${esc(PROFILE.years)}</p>
          <h2 class="t-h2" style="margin-top:8px;">${esc(PROFILE.degree)}</h2>
          <p class="t-lead" style="margin-top:10px;">${esc(PROFILE.university)}</p>
          <p class="t-body" style="margin-top:10px;">${esc(PROFILE.philosophy)}</p>
        </div>
      </div>

      <div class="grid" style="margin-top:48px;">
        <div class="col-full tier-list">
          ${JOURNEY_PHASES.map(
            ph => `<div class="grid tier-row" style="padding-inline:0;">
              <div class="tier-name-col">
                <p class="t-micro tnum">${esc(ph.num)} · ${esc(ph.year)}</p>
                <p class="t-lead" style="margin-top:4px;">${esc(ph.title)}</p>
              </div>
              <div class="tier-inc-col t-body">${esc(ph.description)}</div>
              <div class="tier-price-col t-small">${esc(ph.subtitle)}</div>
              <div class="tier-step-col">
                <a class="btn-text t-micro u-anim" href="#/projects">See builds →</a>
              </div>
            </div>`
          ).join("")}
        </div>
      </div>

      <div class="grid" style="margin-top:48px;">
        <div class="col-full" id="journey-matrix-wrap"></div>
      </div>

      <div class="grid faq-sec" id="faq">
        <div class="col-full">
          <h2 class="t-h2">About &amp; collaboration</h2>
          <div class="faq-list">
            ${FAQ_ITEMS.map(
              item => `<details class="faq-item">
                <summary class="faq-summary t-lead">
                  <span>${esc(item.q)}</span>
                  <span class="faq-icon-plus">${svgPixelIcon("plus", 16)}</span>
                  <span class="faq-icon-minus">${svgPixelIcon("minus", 16)}</span>
                </summary>
                <p class="faq-answer t-body">${esc(item.a)}</p>
              </details>`
            ).join("")}
          </div>
        </div>
      </div>
    </section>
  `;

  buildReadinessGrid(document.getElementById("journey-matrix-wrap")!, { instant: true });
}

export function renderContact(main: HTMLElement): void {
  document.title = "Contact" + COPY.siteTitleSuffix;
  const shortlistedProjects = state.shortlist
    .map(id => projectById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="Contact">
      <div class="grid">
        <div class="col-full">
          <h1 class="t-h1" tabindex="-1">${esc(COPY.contactTitle)}</h1>
          <p class="t-lead" style="margin-top:16px;">${esc(COPY.contactLead)}</p>
        </div>
      </div>

      <div class="grid contact-grid">
        <div class="col-1-5">
          <h2 class="t-small fw-600">Direct channels</h2>
          <div class="contact-links-list">
            <div class="contact-link-row">
              <div>
                <p class="t-micro">Email</p>
                <p class="t-small fw-600">${esc(PROFILE.socials.email)}</p>
              </div>
              <div style="display:flex;gap:12px;align-items:center;">
                <button type="button" class="chip-toggle t-micro" id="copy-email-btn">Copy</button>
                <a class="btn-text t-micro u-anim" href="mailto:${esc(PROFILE.socials.email)}">Open mail →</a>
              </div>
            </div>
            <div class="contact-link-row">
              <div>
                <p class="t-micro">GitHub</p>
                <p class="t-small fw-600">github.com/deekshith1327</p>
              </div>
              <a class="btn-text t-micro u-anim" href="${esc(PROFILE.socials.github)}" target="_blank" rel="noreferrer noopener">Visit profile →</a>
            </div>
            <div class="contact-link-row">
              <div>
                <p class="t-micro">LinkedIn</p>
                <p class="t-small fw-600">Deekshith P.</p>
              </div>
              <a class="btn-text t-micro u-anim" href="${esc(PROFILE.socials.linkedin)}" target="_blank" rel="noreferrer noopener">Connect →</a>
            </div>
            <div class="contact-link-row">
              <div>
                <p class="t-micro">Location</p>
                <p class="t-small fw-600">${esc(PROFILE.location)}</p>
              </div>
              <span class="t-micro">${esc(PROFILE.years)}</span>
            </div>
          </div>
        </div>

        <div class="col-7-12 contact-card">
          <p class="t-micro">(Compose a note)</p>
          <h2 class="t-lead" style="margin-top:8px;">Send an inquiry via email</h2>
          <div class="field-group" style="margin-top:16px;">
            <label class="t-micro" for="inq-subject">(Subject)</label>
            <input class="text-input" type="text" id="inq-subject" value="Portfolio inquiry — Collaboration / Project">
          </div>
          <div class="field-group" style="margin-top:16px;">
            <label class="t-micro" for="inq-body">(Message)</label>
            <textarea class="textarea-input" id="inq-body" placeholder="Tell me what you're building or would like to collaborate on...">${
              shortlistedProjects.length > 0
                ? `Hi Deekshith,\n\nI was looking at your portfolio—especially:\n${shortlistedProjects.map(p => `- ${p.title}`).join("\n")}\n\nLet's connect!`
                : ""
            }</textarea>
          </div>
          ${
            shortlistedProjects.length > 0
              ? `<div style="margin-top:12px;">
                  <p class="t-micro">Shortlisted builds (${shortlistedProjects.length}):</p>
                  <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;">
                    ${shortlistedProjects
                      .map(p => `<button type="button" class="btn-text t-micro u-anim" data-unshort="${esc(p.id)}">${esc(p.title)} ×</button>`)
                      .join("")}
                  </div>
                </div>`
              : `<p class="t-micro" style="margin-top:12px;">Tip: You can shortlist any project from <a class="u-anim" href="#/archive">Archive</a> or its case study to include it here.</p>`
          }
          <div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;">
            <a class="btn-primary t-small" id="inq-send-link" href="mailto:${esc(PROFILE.socials.email)}"><span>Open in Email Client</span></a>
            <span class="t-micro" id="copy-status" aria-live="polite"></span>
          </div>
        </div>
      </div>
    </section>
  `;

  const copyBtn = document.getElementById("copy-email-btn")!;
  const copyStatus = document.getElementById("copy-status")!;
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.socials.email);
      copyBtn.textContent = "Copied";
      copyStatus.textContent = "Email copied to clipboard.";
    } catch {
      copyStatus.textContent = PROFILE.socials.email;
    }
  });

  const subjEl = document.getElementById("inq-subject") as HTMLInputElement;
  const bodyEl = document.getElementById("inq-body") as HTMLTextAreaElement;
  const sendLink = document.getElementById("inq-send-link") as HTMLAnchorElement;
  const syncMailto = () => {
    const s = encodeURIComponent(subjEl.value.trim());
    const b = encodeURIComponent(bodyEl.value.trim());
    sendLink.href = `mailto:${PROFILE.socials.email}?subject=${s}&body=${b}`;
  };
  subjEl.addEventListener("input", syncMailto);
  bodyEl.addEventListener("input", syncMailto);
  syncMailto();

  main.querySelectorAll("[data-unshort]").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleShortlist((btn as HTMLElement).dataset.unshort!);
      renderContact(main);
    });
  });
}

export function renderBadge(main: HTMLElement): void {
  document.title = "Visitor Card" + COPY.siteTitleSuffix;
  main.innerHTML = `
    <section class="sub-sec" data-surface="paper" data-pager="Visitor Card">
      <div class="grid">
        <div class="col-full">
          <h1 class="t-h1" tabindex="-1">${esc(COPY.badgeTitle)}</h1>
          <p class="t-body" style="margin-top:16px;">${esc(COPY.badgeLead)}</p>
        </div>
      </div>
      <div class="grid badge-layout">
        <div class="col-1-6">
          <canvas class="badge-editor-canvas" id="badge-canvas" tabindex="0" role="img" aria-label="Badge drawing grid, 16 by 16. Use arrow keys to move, Space to paint."></canvas>
          <p class="t-micro badge-status" id="badge-status" aria-live="polite">Row 1, column 1, paper.</p>
          <div class="palette-group" role="radiogroup" aria-label="Badge colour palette" id="badge-palette">
            ${BADGE_PALETTE.map(
              (c, idx) => `<button type="button" class="palette-swatch" role="radio" aria-checked="${idx === 3 ? "true" : "false"}" aria-label="${idx + 1}: ${esc(c.name)}" data-col="${esc(c.id)}" style="background-color:${c.hex};"></button>`
            ).join("")}
          </div>
          <div class="badge-tools" id="badge-tools">
            <button type="button" class="chip-toggle t-small" data-tool="pen" aria-pressed="true">Pen</button>
            <button type="button" class="chip-toggle t-small" data-tool="erase" aria-pressed="false">Erase</button>
            <button type="button" class="chip-toggle t-small" data-tool="fill" aria-pressed="false">Fill</button>
            <button type="button" class="chip-toggle t-small" data-tool="mirror" aria-pressed="false">Mirror</button>
            <button type="button" class="chip-toggle t-small" id="badge-random">Random</button>
            <button type="button" class="chip-toggle t-small" id="badge-clear">Clear</button>
            <button type="button" class="chip-toggle t-small" id="badge-undo">Undo</button>
          </div>
        </div>
        <div class="col-8-12">
          <figure>
            <svg class="badge-preview-svg" id="badge-preview" viewBox="0 0 320 480" shape-rendering="crispEdges" role="img" aria-label="Visitor card for ${esc(state.badge.name)}"></svg>
            <figcaption class="t-micro" style="margin-top:8px;">Preview: 320 × 480 printable SVG visitor card.</figcaption>
          </figure>
          <div class="field-group badge-name-field">
            <label class="t-micro" for="badge-name-input">(Name on card)</label>
            <input class="text-input" type="text" id="badge-name-input" maxlength="18" value="${esc(state.badge.name)}">
          </div>
          <div class="badge-dl-wrap">
            <button type="button" class="btn-primary t-small" id="badge-dl-btn"><span>Download SVG</span></button>
          </div>
        </div>
      </div>
    </section>
  `;

  const canvas = document.getElementById("badge-canvas") as HTMLCanvasElement;
  const statusEl = document.getElementById("badge-status")!;
  const previewSvg = document.getElementById("badge-preview")!;
  const nameInput = document.getElementById("badge-name-input") as HTMLInputElement;
  const paletteBtns = Array.from(document.querySelectorAll("#badge-palette .palette-swatch")) as HTMLButtonElement[];
  const toolBtns = Array.from(document.querySelectorAll("#badge-tools [data-tool]")) as HTMLButtonElement[];

  let grid = state.badge.grid.split("");
  const history: string[] = [];
  let currentColor = "3";
  let mode: "pen" | "erase" | "fill" = "pen";
  let mirror = false;
  let keyR = 0;
  let keyC = 0;
  let canvasFocused = false;
  let painting = false;
  let paintModeOverride: string | null = null;

  function pushHistory() {
    history.push(grid.join(""));
    if (history.length > 20) history.shift();
  }

  function saveGrid() {
    state.badge.grid = grid.join("");
    storageSet("dp25.badge", state.badge);
  }

  function drawEditor() {
    const rect = canvas.getBoundingClientRect();
    const maxPx = Math.min(rect.width || 320, 640);
    const cell = Math.max(12, Math.floor(maxPx / 16));
    const size = cell * 16;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(size * dpr)) {
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = TOKENS.ink;
    ctx.fillRect(0, 0, size, size);

    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const palId = grid[r * 16 + c];
        const palObj = BADGE_PALETTE[Number(palId)] || BADGE_PALETTE[1];
        ctx.fillStyle = palObj.hex;
        ctx.fillRect(c * cell + 1, r * cell + 1, cell - 1, cell - 1);
      }
    }

    if (canvasFocused) {
      ctx.strokeStyle = TOKENS.blue;
      ctx.lineWidth = 2;
      ctx.strokeRect(keyC * cell + 2, keyR * cell + 2, cell - 4, cell - 4);
    }
  }

  function updateStatus() {
    const palId = grid[keyR * 16 + keyC];
    const palObj = BADGE_PALETTE[Number(palId)] || BADGE_PALETTE[1];
    statusEl.textContent = `Row ${keyR + 1}, column ${keyC + 1}, ${palObj.name}.`;
  }

  function drawPreview() {
    const logoLayout = layoutGlyphLines([PROFILE.brand], 2);
    let logoRects = "";
    const lCellH = 2.4;
    const lCellW = lCellH * 1.25;
    const lx0 = 16;
    const ly0 = Math.round((48 - 9 * lCellH) / 2);
    for (let i = 0; i < logoLayout.cells.length; i++) {
      const cell = logoLayout.cells[i];
      logoRects += `<rect x="${(lx0 + cell.x * lCellW).toFixed(2)}" y="${(ly0 + cell.y * lCellH).toFixed(2)}" width="${lCellW}" height="${lCellH}" fill="${TOKENS.sodium}"/>`;
    }

    const spriteSize = 16 * 15;
    const sx0 = (320 - spriteSize) / 2;
    const sy0 = 68;
    let spriteRects = "";
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const palId = grid[r * 16 + c];
        const palObj = BADGE_PALETTE[Number(palId)] || BADGE_PALETTE[1];
        spriteRects += `<rect x="${sx0 + c * 15}" y="${sy0 + r * 15}" width="15" height="15" fill="${palObj.hex}"/>`;
      }
    }

    const badgeColors = [TOKENS.blue, TOKENS.pink, TOKENS.green, TOKENS.lavender];
    let stripRects = "";
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 16; i++) {
        stripRects += `<rect x="${i * 20}" y="${432 + row * 24}" width="20" height="24" fill="${badgeColors[(i + row) % badgeColors.length]}"/>`;
      }
    }

    const badgeName = state.badge.name || "Your name";
    previewSvg.setAttribute("aria-label", `Visitor card for ${badgeName}`);
    previewSvg.innerHTML = `
      <rect x="0" y="0" width="320" height="480" fill="${TOKENS.sodium}"/>
      <rect x="0" y="0" width="320" height="48" fill="${TOKENS.ink}"/>
      ${logoRects}
      ${spriteRects}
      <text x="16" y="356" font-family="Inter Tight, Helvetica Neue, sans-serif" font-size="28" font-weight="600" fill="${TOKENS.ink}">${esc(badgeName)}</text>
      <text x="16" y="388" font-family="Inter Tight, Helvetica Neue, sans-serif" font-size="14" font-weight="500" fill="${TOKENS.ink}">ECE · Kasaragod · 2025–2029</text>
      ${stripRects}
    `;
  }

  function paintAt(r: number, c: number, colorId: string) {
    if (r < 0 || r >= 16 || c < 0 || c >= 16) return;
    grid[r * 16 + c] = colorId;
    if (mirror) grid[r * 16 + (15 - c)] = colorId;
  }

  function floodFill(r: number, c: number, newCol: string) {
    const target = grid[r * 16 + c];
    if (target === newCol) return;
    const queue: Array<[number, number]> = [[r, c]];
    const seen = new Set<number>();
    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      const k = cr * 16 + cc;
      if (cr < 0 || cr >= 16 || cc < 0 || cc >= 16 || seen.has(k) || grid[k] !== target) continue;
      seen.add(k);
      grid[k] = newCol;
      queue.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
    }
  }

  function coordsFromEvent(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    const c = Math.min(15, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * 16)));
    const r = Math.min(15, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * 16)));
    return { r, c };
  }

  canvas.addEventListener("contextmenu", e => e.preventDefault());
  canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    canvas.focus();
    const { r, c } = coordsFromEvent(e);
    keyR = r;
    keyC = c;
    pushHistory();
    if (e.button === 2) {
      painting = true;
      paintModeOverride = "1";
      paintAt(r, c, "1");
    } else if (mode === "fill") {
      floodFill(r, c, currentColor);
    } else {
      painting = true;
      paintModeOverride = mode === "erase" ? "1" : currentColor;
      paintAt(r, c, paintModeOverride);
    }
    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    }
    saveGrid();
    drawEditor();
    drawPreview();
    updateStatus();
  });

  canvas.addEventListener("pointermove", e => {
    if (!painting || !paintModeOverride) return;
    const { r, c } = coordsFromEvent(e);
    keyR = r;
    keyC = c;
    paintAt(r, c, paintModeOverride);
    saveGrid();
    drawEditor();
    drawPreview();
    updateStatus();
  });

  const stopPaint = () => {
    painting = false;
    paintModeOverride = null;
  };
  canvas.addEventListener("pointerup", stopPaint);
  canvas.addEventListener("pointercancel", stopPaint);
  canvas.addEventListener("focus", () => {
    canvasFocused = true;
    drawEditor();
    updateStatus();
  });
  canvas.addEventListener("blur", () => {
    canvasFocused = false;
    drawEditor();
  });

  function selectColor(colId: string) {
    currentColor = colId;
    paletteBtns.forEach(b => b.setAttribute("aria-checked", b.dataset.col === colId ? "true" : "false"));
  }

  canvas.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") keyC = Math.min(15, keyC + 1);
    else if (e.key === "ArrowLeft") keyC = Math.max(0, keyC - 1);
    else if (e.key === "ArrowDown") keyR = Math.min(15, keyR + 1);
    else if (e.key === "ArrowUp") keyR = Math.max(0, keyR - 1);
    else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      pushHistory();
      if (mode === "fill") floodFill(keyR, keyC, currentColor);
      else paintAt(keyR, keyC, mode === "erase" ? "1" : currentColor);
      saveGrid();
      drawPreview();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      pushHistory();
      paintAt(keyR, keyC, "1");
      saveGrid();
      drawPreview();
    } else if (e.key >= "1" && e.key <= "9") {
      selectColor(String(Number(e.key) - 1));
    } else {
      return;
    }
    e.preventDefault();
    drawEditor();
    updateStatus();
  });

  paletteBtns.forEach((btn, idx) => {
    btn.addEventListener("click", () => selectColor(btn.dataset.col!));
    btn.addEventListener("keydown", e => {
      let next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % paletteBtns.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        next = (idx - 1 + paletteBtns.length) % paletteBtns.length;
      if (next >= 0) {
        e.preventDefault();
        selectColor(paletteBtns[next].dataset.col!);
        paletteBtns[next].focus();
      }
    });
  });

  toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.tool!;
      if (t === "mirror") {
        mirror = !mirror;
        btn.setAttribute("aria-pressed", mirror ? "true" : "false");
        return;
      }
      mode = t as "pen" | "erase" | "fill";
      toolBtns.forEach(b => {
        if (b.dataset.tool !== "mirror") {
          b.setAttribute("aria-pressed", b.dataset.tool === mode ? "true" : "false");
        }
      });
    });
  });

  document.getElementById("badge-random")!.addEventListener("click", () => {
    pushHistory();
    const rng = makeRng(Date.now());
    const accent = String(3 + Math.floor(rng() * 6));
    const g = new Array(256).fill("1");
    for (let r = 2; r <= 13; r++) {
      for (let c = 0; c < 8; c++) {
        if (rng() < 0.42) {
          g[r * 16 + c] = accent;
          g[r * 16 + (15 - c)] = accent;
        }
      }
    }
    const eyeC = 3 + Math.floor(rng() * 4);
    g[6 * 16 + eyeC] = "2";
    g[6 * 16 + (15 - eyeC)] = "2";
    grid = g;
    saveGrid();
    drawEditor();
    drawPreview();
    updateStatus();
  });

  document.getElementById("badge-clear")!.addEventListener("click", () => {
    pushHistory();
    grid = new Array(256).fill("1");
    saveGrid();
    drawEditor();
    drawPreview();
    updateStatus();
  });

  const doUndo = () => {
    if (history.length === 0) return;
    grid = history.pop()!.split("");
    saveGrid();
    drawEditor();
    drawPreview();
    updateStatus();
  };
  document.getElementById("badge-undo")!.addEventListener("click", doUndo);

  const onKeyUndo = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      doUndo();
    }
  };
  document.addEventListener("keydown", onKeyUndo);

  nameInput.addEventListener("input", () => {
    state.badge.name = nameInput.value.slice(0, 18);
    storageSet("dp25.badge", state.badge);
    drawPreview();
  });

  document.getElementById("badge-dl-btn")!.addEventListener("click", () => {
    const ser = new XMLSerializer();
    const clone = previewSvg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "320");
    clone.setAttribute("height", "480");
    const svgText = `<?xml version="1.0" encoding="UTF-8"?>\n` + ser.serializeToString(clone);
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "deekshith-visitor-card.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  });

  const ro = new ResizeObserver(drawEditor);
  ro.observe(canvas);
  state.routeCleanup.push(() => {
    ro.disconnect();
    document.removeEventListener("keydown", onKeyUndo);
  });

  drawEditor();
  drawPreview();
  updateStatus();
}

export function renderNotFound(main: HTMLElement): void {
  document.title = "Not found" + COPY.siteTitleSuffix;
  const ch = window.innerWidth >= 768 ? 14 : 8;
  main.innerHTML = `
    <section class="sub-sec" data-surface="sodium" data-pager="Not found">
      <div class="grid">
        <div class="col-full">
          ${svgBitmapText("404", ch, TOKENS.ink, { className: "notfound-bitmap", ariaHidden: true, bold: true })}
          <h1 class="t-h1" tabindex="-1">Nothing at this address.</h1>
          <div style="margin-top:32px;">
            <a class="btn-text t-lead u-anim" href="#/">Back to the portfolio →</a>
          </div>
        </div>
      </div>
    </section>
  `;
}
