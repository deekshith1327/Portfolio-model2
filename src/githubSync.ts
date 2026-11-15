import { COPY, PROFILE, ProjectItem, PROJECTS, TOKENS, TrackId } from "./data";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count?: number;
}

const GITHUB_USERNAME = "deekshith1327";
const CACHE_KEY = "dp25.github.repos.v1";

function slugTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 1 && w !== "the" && w !== "and" && w !== "for" && w !== "with");
}

function humanizeRepoName(name: string): string {
  const acronyms = new Set(["esp32", "iot", "ai", "pdf", "ui", "api", "pcb", "led", "ir", "rc", "3d", "dds", "pwm", "adc", "ece", "ktu"]);
  return name
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase();
      if (acronyms.has(lower)) return lower.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function isPortfolioSelfRepo(repoName: string): boolean {
  const n = repoName.toLowerCase();
  return (
    n === GITHUB_USERNAME.toLowerCase() ||
    n.includes("portfolio") ||
    n.includes("deekshith-portfolio") ||
    n === "personal-site"
  );
}

function findMatchingExistingProject(repo: GitHubRepo): ProjectItem | undefined {
  const repoNorm = repo.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const repoWords = slugTokens(repo.name + " " + (repo.description || ""));

  for (const p of PROJECTS) {
    const idNorm = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const titleNorm = p.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (repoNorm === idNorm || repoNorm === titleNorm || titleNorm.includes(repoNorm) || repoNorm.includes(idNorm)) {
      return p;
    }
    const pWords = slugTokens(p.title);
    const overlap = pWords.filter(w => repoWords.includes(w));
    if (pWords.length >= 2 && overlap.length >= Math.min(2, pWords.length)) {
      return p;
    }
  }
  return undefined;
}

function classifyRepo(repo: GitHubRepo): {
  track: TrackId;
  category: string;
  motif: ProjectItem["motif"];
  pal: [string, string, string, string];
  tags: string[];
} {
  const text = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")} ${repo.language || ""}`.toLowerCase();

  const tags: string[] = [];
  if (repo.language) tags.push(repo.language);
  if (Array.isArray(repo.topics)) {
    for (const t of repo.topics) {
      if (tags.length < 4 && !tags.some(existing => existing.toLowerCase() === t.toLowerCase())) {
        tags.push(t);
      }
    }
  }

  if (/(robot|rover|motor|servo|line-follow|obstacle|autonomous)/.test(text)) {
    if (tags.length === 0) tags.push("Robotics", "Embedded C", "Sensors");
    return {
      track: "robotics",
      category: "Robotics & Automation",
      motif: "rover",
      pal: [TOKENS.ink, TOKENS.blue, TOKENS.sodium, TOKENS.paper],
      tags: tags.slice(0, 4)
    };
  }

  if (/(esp32|arduino|sonar|sensor|lm358|ad9850|firmware|embedded|circuit|hardware|iot|microcontroller|c\+\+|\bc\b)/.test(text)) {
    if (tags.length === 0) tags.push("Embedded Systems", "C / C++", "Hardware");
    return {
      track: "embedded",
      category: "Embedded & Hardware",
      motif: "breadboard",
      pal: [TOKENS.blue, TOKENS.sodium, TOKENS.ink, TOKENS.paper],
      tags: tags.slice(0, 4)
    };
  }

  if (/(cesium|3d|globe|telemetry|satellite|map|radar|visualization|analytics|chart)/.test(text)) {
    if (tags.length === 0) tags.push("Data Visualization", "Telemetry", "Web");
    return {
      track: "dataviz",
      category: "Data & Visualization",
      motif: "globe",
      pal: [TOKENS.green, TOKENS.ink, TOKENS.mint, TOKENS.paper],
      tags: tags.slice(0, 4)
    };
  }

  if (tags.length === 0) tags.push("Web App", "JavaScript", "GitHub");
  return {
    track: "webapps",
    category: "Web Application",
    motif: "window",
    pal: [TOKENS.lavender, TOKENS.ink, TOKENS.sodium, TOKENS.paper],
    tags: tags.slice(0, 4)
  };
}

function mergeReposIntoProjects(repos: GitHubRepo[]): number {
  let addedCount = 0;

  // Sort oldest-to-newest among new repos so numbering stays deterministic, or newest at the end
  const validRepos = repos.filter(r => !r.fork && !isPortfolioSelfRepo(r.name));

  for (const repo of validRepos) {
    const existing = findMatchingExistingProject(repo);
    if (existing) {
      if (!existing.repoUrl) existing.repoUrl = repo.html_url;
      if (!existing.homepageUrl && repo.homepage) existing.homepageUrl = repo.homepage;
      continue;
    }

    const cleanId = "gh-" + repo.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    if (PROJECTS.some(p => p.id === cleanId)) continue;

    const meta = classifyRepo(repo);
    const createdYear = repo.created_at ? new Date(repo.created_at).getFullYear().toString() : "2026";
    const numStr = String(PROJECTS.length + 1).padStart(2, "0");
    const desc =
      repo.description && repo.description.trim().length > 0
        ? repo.description.trim()
        : `Open-source ${meta.category.toLowerCase()} build by ${PROFILE.name}, synced live from GitHub (${repo.name}).`;

    const newProject: ProjectItem = {
      id: cleanId,
      num: numStr,
      title: humanizeRepoName(repo.name),
      summary: desc,
      role: "Creator & Developer",
      year: createdYear,
      category: meta.category,
      track: meta.track,
      phase: "p3",
      tags: meta.tags,
      caseStudy: `${desc} Built and maintained on GitHub (${repo.full_name}). Inspect the source repository for code, schematics, and commit history.`,
      featured: true,
      motif: meta.motif,
      pal: meta.pal,
      repoUrl: repo.html_url,
      homepageUrl: repo.homepage || undefined,
      isGithubSynced: true
    };

    PROJECTS.push(newProject);
    addedCount++;
  }

  // Keep dynamic copy strings in sync with total PROJECTS.length
  COPY.heroDate = `${PROJECTS.length} Builds · 8 Core Skills`;
  COPY.speakersLead = `All ${PROJECTS.length} engineering & software builds. Automatically synced with GitHub (@${GITHUB_USERNAME}).`;
  COPY.projectsTitle = `${PROJECTS.length} projects, built to learn.`;
  COPY.archiveTitle = `${PROJECTS.length} builds, in the index.`;

  return addedCount;
}

export async function syncGitHubProjects(): Promise<{ total: number; added: number; syncedAt: string }> {
  // 1. Apply cached repos immediately if available so UI is instant
  try {
    const cachedRaw = window.localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as GitHubRepo[];
      if (Array.isArray(cached)) {
        mergeReposIntoProjects(cached);
      }
    }
  } catch {}

  // 2. Fetch live public repositories from GitHub API
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=created&direction=desc&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json"
        }
      }
    );
    if (res.ok) {
      const repos = (await res.json()) as GitHubRepo[];
      if (Array.isArray(repos)) {
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(repos));
        } catch {}
        const added = mergeReposIntoProjects(repos);
        const detail = {
          total: PROJECTS.length,
          added,
          syncedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        window.dispatchEvent(new CustomEvent("raster:projects-updated", { detail }));
        return detail;
      }
    }
  } catch {}

  return {
    total: PROJECTS.length,
    added: 0,
    syncedAt: "cached"
  };
}
