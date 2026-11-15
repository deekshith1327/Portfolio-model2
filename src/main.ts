import "./raster.css";
import { initPortfolioChatbot } from "./chatbot";
import { COPY, NAV_ITEMS, PROFILE, TOKENS } from "./data";
import { syncGitHubProjects } from "./githubSync";
import { renderHome } from "./home";
import { esc, makeRng, svgBitmapText } from "./pixelArt";
import {
  renderArchive,
  renderBadge,
  renderContact,
  renderJourney,
  renderNotFound,
  renderProjectDetail,
  renderProjects,
  renderSkills
} from "./routes";
import { hideTip, initTrail, playWipe, setMotionState, state, TRACK_COLORS } from "./state";

function initChrome(): void {
  const logoLink = document.getElementById("header-logo-link")!;
  logoLink.innerHTML = svgBitmapText(PROFILE.brand, 3, "currentColor", {
    perCell: true,
    className: "logo-svg",
    ariaHidden: true,
    gapCols: 2
  });

  if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    let jitterTimer = 0;
    logoLink.addEventListener("mouseenter", () => {
      if (!state.motionOn) return;
      const rects = Array.from(logoLink.querySelectorAll("rect"));
      const dirs = [
        [5, 0],
        [-5, 0],
        [0, 4],
        [0, -4],
        [5, 4],
        [-5, -4]
      ];
      const rng = makeRng(Date.now());
      let step = 0;
      window.clearInterval(jitterTimer);
      const apply = () => {
        step++;
        if (step > 3) {
          rects.forEach(r => {
            r.setAttribute("x", String(Number(r.dataset.gx) * 5));
            r.setAttribute("y", String(Number(r.dataset.gy) * 4));
          });
          window.clearInterval(jitterTimer);
          return;
        }
        rects.forEach(r => {
          const bx = Number(r.dataset.gx) * 5;
          const by = Number(r.dataset.gy) * 4;
          if (step === 3) {
            r.setAttribute("x", String(bx));
            r.setAttribute("y", String(by));
          } else {
            const d = dirs[Math.floor(rng() * dirs.length)];
            r.setAttribute("x", String(bx + d[0]));
            r.setAttribute("y", String(by + d[1]));
          }
        });
      };
      apply();
      jitterTimer = window.setInterval(apply, 60);
    });
  }

  const headerNav = document.getElementById("header-nav")!;
  headerNav.innerHTML = NAV_ITEMS.map(
    n => `<a class="nav-link t-small u-anim" href="${esc(n.href)}">${esc(n.label)}</a>`
  ).join("");

  const menuNav = document.getElementById("menu-nav")!;
  menuNav.innerHTML = [...NAV_ITEMS, { label: "(Contact)", href: "#/contact" }]
    .map(n => `<a class="t-h2" href="${esc(n.href)}">${esc(n.label)}</a>`)
    .join("");

  const handleAboutAnchor = (e: Event) => {
    const a = (e.target as Element).closest('a[href="#/#about"]');
    if (!a) return;
    e.preventDefault();
    const aboutEl = document.getElementById("about");
    if (aboutEl) {
      aboutEl.scrollIntoView({ behavior: state.motionOn ? "smooth" : "auto" });
      return;
    }
    state.scrollAfterRoute = "about";
    window.location.hash = "#/";
  };
  document.addEventListener("click", handleAboutAnchor);

  const footer = document.getElementById("site-footer")!;
  const stairCells = 96;
  let stairRects = "";
  for (let i = 0; i < stairCells; i++) {
    const col = TRACK_COLORS[Math.floor(i / 4) % 4];
    stairRects += `<rect x="${i}" y="0" width="1" height="1" fill="${col}"/>`;
  }
  footer.innerHTML = `
    <div class="grid">
      <div class="col-full">
        ${svgBitmapText(PROFILE.brand, 1, TOKENS.sodium, { className: "footer-logo-svg", ariaHidden: true })}
      </div>
    </div>
    <div class="grid footer-cols">
      <div class="footer-block">
        <p class="t-small footer-block-head">Where &amp; study</p>
        <p class="t-small">${esc(PROFILE.name)}<br>${esc(PROFILE.university)}<br>${esc(PROFILE.location)}<br>${esc(PROFILE.years)}</p>
      </div>
      <div class="footer-block">
        <p class="t-small footer-block-head">Index</p>
        <ul class="footer-nav-list">
          <li><a class="btn-text t-small u-anim" href="#/projects">Projects (13)</a></li>
          <li><a class="btn-text t-small u-anim" href="#/archive">Archive</a></li>
          <li><a class="btn-text t-small u-anim" href="#/skills">Skills &amp; bench</a></li>
          <li><a class="btn-text t-small u-anim" href="#/journey">Journey &amp; FAQ</a></li>
          <li><a class="btn-text t-small u-anim" href="#/contact">Contact</a></li>
          <li><a class="btn-text t-small u-anim" href="#/badge">Visitor card</a></li>
        </ul>
      </div>
      <div class="footer-block">
        <p class="t-small footer-block-head">Elsewhere</p>
        <p class="t-small">
          <a class="u-anim" href="mailto:${esc(PROFILE.socials.email)}">${esc(PROFILE.socials.email)}</a><br>
          <a class="u-anim" href="${esc(PROFILE.socials.github)}" target="_blank" rel="noreferrer noopener">GitHub — deekshith1327</a><br>
          <a class="u-anim" href="${esc(PROFILE.socials.linkedin)}" target="_blank" rel="noreferrer noopener">LinkedIn — Deekshith P.</a>
        </p>
      </div>
      <div class="footer-block">
        <p class="t-small footer-block-head">Colophon</p>
        <p class="t-micro">${esc(COPY.colophon)}</p>
      </div>
    </div>
    <div class="grid footer-bottom">
      <p class="footer-honesty t-micro">${esc(COPY.honesty)}</p>
      <p class="footer-ver t-micro">${esc(COPY.version)}</p>
    </div>
    <svg class="footer-staircase" viewBox="0 0 ${stairCells} 1" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true">${stairRects}</svg>
  `;

  document.getElementById("motion-toggle-desktop")!.addEventListener("click", () => setMotionState(!state.motionOn));
  document.getElementById("motion-toggle-mobile")!.addEventListener("click", () => setMotionState(!state.motionOn));
  setMotionState(state.motionOn);

  const menuEl = document.getElementById("menu")!;
  const openBtn = document.getElementById("menu-open-btn")!;
  const closeBtn = document.getElementById("menu-close-btn")!;

  function closeMenu(returnFocus: boolean) {
    menuEl.classList.remove("is-open");
    document.documentElement.classList.remove("menu-open");
    openBtn.setAttribute("aria-expanded", "false");
    if (returnFocus) openBtn.focus();
  }

  function openMenu() {
    const reveal = () => {
      menuEl.classList.add("is-open");
      document.documentElement.classList.add("menu-open");
      openBtn.setAttribute("aria-expanded", "true");
      closeBtn.focus();
    };
    playWipe(reveal);
  }

  openBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", () => closeMenu(true));
  menuEl.addEventListener("click", e => {
    if ((e.target as Element).closest("a")) closeMenu(false);
  });
  menuEl.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu(true);
      return;
    }
    if (e.key === "Tab") {
      const focusables = Array.from(menuEl.querySelectorAll("a, button")).filter(
        el => !(el as HTMLElement).hidden
      ) as HTMLElement[];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  const topBtn = document.getElementById("top-btn")!;
  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: state.motionOn ? "smooth" : "auto" });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") hideTip();
  });
}

let surfaceHeaderIO: IntersectionObserver | null = null;
let surfaceBottomIO: IntersectionObserver | null = null;
let revealIO: IntersectionObserver | null = null;

function setupObservers(): void {
  if (surfaceHeaderIO) surfaceHeaderIO.disconnect();
  if (surfaceBottomIO) surfaceBottomIO.disconnect();
  if (revealIO) revealIO.disconnect();

  const header = document.getElementById("site-header")!;
  const topBtn = document.getElementById("top-btn")!;

  const surfaceEls = Array.from(document.querySelectorAll("[data-surface]")).filter(
    el => el.id !== "site-header" && el.id !== "menu" && el.id !== "top-btn"
  );

  const setHeaderSurface = (surf: string | null) => {
    if (surf) header.setAttribute("data-surface", surf);
  };
  const setBottomSurface = (surf: string | null) => {
    if (surf) topBtn.setAttribute("data-surface", surf);
  };

  const syncSurfacesAtScroll = () => {
    const hh = header.getBoundingClientRect().height || 64;
    const topY = hh + 4;
    const botY = window.innerHeight - 20;
    for (const el of surfaceEls) {
      const r = el.getBoundingClientRect();
      if (r.top <= topY && r.bottom >= topY) setHeaderSurface(el.getAttribute("data-surface"));
      if (r.top <= botY && r.bottom >= botY) setBottomSurface(el.getAttribute("data-surface"));
    }
    topBtn.classList.toggle("is-visible", window.scrollY >= window.innerHeight);
  };

  surfaceHeaderIO = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) setHeaderSurface(entry.target.getAttribute("data-surface"));
      }
    },
    { rootMargin: "-65px 0px -88% 0px" }
  );

  surfaceBottomIO = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) setBottomSurface(entry.target.getAttribute("data-surface"));
      }
    },
    { rootMargin: "-95% 0px -1px 0px" }
  );

  surfaceEls.forEach(el => {
    surfaceHeaderIO!.observe(el);
    surfaceBottomIO!.observe(el);
  });

  window.addEventListener("scroll", syncSurfacesAtScroll, { passive: true });
  state.routeCleanup.push(() => window.removeEventListener("scroll", syncSurfacesAtScroll));
  syncSurfacesAtScroll();

  const revealEls = Array.from(document.querySelectorAll(".reveal-text, .reveal-block"));
  if (!state.motionOn) {
    revealEls.forEach(el => {
      el.classList.remove("is-pending");
      el.classList.add("is-shown");
    });
  } else {
    revealEls.forEach(el => el.classList.add("is-pending"));
    revealIO = new IntersectionObserver(
      entries => {
        let batch = 0;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = Math.min(batch, 7) * 40;
            batch++;
            window.setTimeout(() => {
              el.classList.remove("is-pending");
              el.classList.add("is-shown");
            }, delay);
            revealIO!.unobserve(el);
          }
        }
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(el => revealIO!.observe(el));
  }
}

interface ParsedRoute {
  view: string;
  param?: string;
  key: string;
}

let currentRouteKey: string | null = null;

function parseRoute(hash: string): ParsedRoute {
  const clean = (hash || "#/").replace(/^#/, "");
  if (clean === "" || clean === "/") return { view: "home", key: "home" };
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "#about" || parts[0] === "about") {
    state.scrollAfterRoute = "about";
    return { view: "home", key: "home" };
  }
  if (parts[0] === "projects" && parts.length === 1) return { view: "projects", key: "projects" };
  if (parts[0] === "projects" && parts.length === 2)
    return { view: "project", param: parts[1], key: "project:" + parts[1] };
  if (parts[0] === "archive" && parts.length === 1) return { view: "archive", key: "archive" };
  if (parts[0] === "skills" && parts.length === 1) return { view: "skills", key: "skills" };
  if (parts[0] === "journey" && parts.length === 1) return { view: "journey", key: "journey" };
  if (parts[0] === "contact" && parts.length === 1) return { view: "contact", key: "contact" };
  if (parts[0] === "badge" && parts.length === 1) return { view: "badge", key: "badge" };
  return { view: "404", key: "404" };
}

function updateActiveNav(route: ParsedRoute): void {
  const mapHref: Record<string, string> = {
    projects: "#/projects",
    project: "#/projects",
    archive: "#/archive",
    skills: "#/skills",
    journey: "#/journey",
    contact: "#/contact"
  };
  const target = mapHref[route.view] || "";
  document.querySelectorAll("#header-nav a, #menu-nav a").forEach(a => {
    if (a.getAttribute("href") === target) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function mountRoute(route: ParsedRoute, skipWipe: boolean): void {
  const main = document.getElementById("main")!;
  const doSwap = () => {
    while (state.routeCleanup.length > 0) {
      const fn = state.routeCleanup.pop()!;
      try {
        fn();
      } catch {}
    }
    hideTip();

    if (route.view === "home") renderHome(main);
    else if (route.view === "projects") renderProjects(main);
    else if (route.view === "project" && route.param) renderProjectDetail(main, route.param);
    else if (route.view === "archive") renderArchive(main);
    else if (route.view === "skills") renderSkills(main);
    else if (route.view === "journey") renderJourney(main);
    else if (route.view === "contact") renderContact(main);
    else if (route.view === "badge") renderBadge(main);
    else renderNotFound(main);

    updateActiveNav(route);
    setupObservers();

    if (state.scrollAfterRoute) {
      const target = document.getElementById(state.scrollAfterRoute);
      state.scrollAfterRoute = null;
      if (target) target.scrollIntoView({ behavior: state.motionOn ? "smooth" : "auto" });
    } else {
      window.scrollTo(0, 0);
    }

    if (!skipWipe) {
      const h1 = main.querySelector("h1") as HTMLElement | null;
      if (h1) h1.focus({ preventScroll: true });
    }
  };

  if (skipWipe) doSwap();
  else playWipe(doSwap);
}

function init(): void {
  initChrome();
  initTrail();
  initPortfolioChatbot();
  const initial = parseRoute(window.location.hash);
  currentRouteKey = initial.key;
  mountRoute(initial, true);

  // Automatically sync public GitHub repositories for @deekshith1327
  void syncGitHubProjects();
  window.addEventListener("focus", () => {
    void syncGitHubProjects();
  });

  window.addEventListener("hashchange", () => {
    const next = parseRoute(window.location.hash);
    if (next.key === currentRouteKey) {
      if (state.scrollAfterRoute) {
        const target = document.getElementById(state.scrollAfterRoute);
        state.scrollAfterRoute = null;
        if (target) target.scrollIntoView({ behavior: state.motionOn ? "smooth" : "auto" });
      }
      return;
    }
    currentRouteKey = next.key;
    mountRoute(next, false);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
