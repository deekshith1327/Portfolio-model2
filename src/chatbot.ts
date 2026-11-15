import { PROFILE, PROJECTS, SKILLS } from "./data";
import { esc } from "./pixelArt";

interface ChatTurn {
  role: "user" | "model";
  text: string;
}

const SYSTEM_INSTRUCTION = `You are the interactive portfolio assistant for ${PROFILE.name} (${PROFILE.role} at ${PROFILE.university}, ${PROFILE.years}, based in ${PROFILE.location}).
Your role:
- Help visitors, recruiters, mentors, and fellow engineers explore Deekshith's 13 projects, 8 core skills, hardware bench, and education.
- Keep answers concise, technical, friendly, and grounded strictly in his real portfolio data.
- Philosophy: "${PROFILE.philosophy}"
- Contact: Email ${PROFILE.socials.email}, GitHub ${PROFILE.socials.github}, LinkedIn ${PROFILE.socials.linkedin}.

Projects (${PROJECTS.length} total):
${PROJECTS.map(p => `- ${p.num} ${p.title} (${p.category}, ${p.year}): ${p.summary} Stack: ${p.tags.join(", ")}.`).join("\n")}

Core Skills (${SKILLS.length} total):
${SKILLS.map(s => `- ${s.name} (${s.category}, ${s.level})`).join("\n")}`;

const STARTER_PROMPTS = [
  "What embedded & ESP32 projects has Deekshith built?",
  "Tell me about the Adaptive Underwater Sonar project",
  "What are his 8 core engineering skills?",
  "How can I contact Deekshith for internships?"
];

export function initPortfolioChatbot(): void {
  if (document.getElementById("raster-chat-widget")) return;

  const history: ChatTurn[] = [
    {
      role: "model",
      text: `Hi! I'm Deekshith's portfolio assistant. Ask me about his 13 hardware & web builds, ESP32/sonar circuits, KTU ECE coursework, or how to collaborate.`
    }
  ];
  let isOpen = false;
  let isSending = false;

  const widget = document.createElement("aside");
  widget.id = "raster-chat-widget";
  widget.className = "chat-widget";
  widget.setAttribute("aria-label", "Portfolio AI Assistant");

  widget.innerHTML = `
    <button type="button" class="chat-launcher t-micro tnum" id="chat-launcher-btn" aria-expanded="false" aria-controls="chat-panel">
      <span class="chat-launcher-dot" aria-hidden="true"></span>
      <span>(Ask AI · DP/25)</span>
    </button>
    <div class="chat-panel" id="chat-panel" role="dialog" aria-label="Chat about Deekshith P.'s portfolio" hidden>
      <div class="chat-panel-head">
        <div>
          <p class="t-small" style="font-weight:700;">DEEKSHITH P. // BENCH ASSISTANT</p>
          <p class="t-micro tnum" style="opacity:0.75;">Multi-turn portfolio guide · 13 builds indexed</p>
        </div>
        <button type="button" class="chat-close-btn t-micro tnum" id="chat-close-btn" aria-label="Close chat">(Close ×)</button>
      </div>
      <div class="chat-thread" id="chat-thread" role="log" aria-live="polite"></div>
      <div class="chat-starters" id="chat-starters">
        ${STARTER_PROMPTS.map(
          q => `<button type="button" class="chat-starter-chip t-micro" data-prompt="${esc(q)}">${esc(q)}</button>`
        ).join("")}
      </div>
      <form class="chat-form" id="chat-form">
        <input
          type="text"
          class="chat-input t-small"
          id="chat-input"
          placeholder="Ask about ESP32, Sonar, Robotics, or skills..."
          autocomplete="off"
          required
        />
        <button type="submit" class="chat-send-btn t-small" id="chat-send-btn">Send →</button>
      </form>
    </div>
  `;

  document.body.appendChild(widget);

  const launcherBtn = document.getElementById("chat-launcher-btn") as HTMLButtonElement;
  const closeBtn = document.getElementById("chat-close-btn") as HTMLButtonElement;
  const panel = document.getElementById("chat-panel") as HTMLElement;
  const thread = document.getElementById("chat-thread") as HTMLElement;
  const starters = document.getElementById("chat-starters") as HTMLElement;
  const form = document.getElementById("chat-form") as HTMLFormElement;
  const input = document.getElementById("chat-input") as HTMLInputElement;
  const sendBtn = document.getElementById("chat-send-btn") as HTMLButtonElement;

  function renderThread(thinking = false): void {
    thread.innerHTML =
      history
        .map(
          turn => `
          <div class="chat-msg chat-msg-${turn.role}">
            <span class="chat-msg-role t-micro tnum">${turn.role === "user" ? "YOU" : "DP/AI"}</span>
            <div class="chat-msg-body t-small">${esc(turn.text).replace(/\n/g, "<br>")}</div>
          </div>
        `
        )
        .join("") +
      (thinking
        ? `<div class="chat-msg chat-msg-model">
            <span class="chat-msg-role t-micro tnum">DP/AI</span>
            <div class="chat-msg-body t-small chat-thinking">Scanning schematic index...</div>
          </div>`
        : "");
    thread.scrollTop = thread.scrollHeight;
  }

  function setOpen(next: boolean): void {
    isOpen = next;
    panel.hidden = !isOpen;
    launcherBtn.setAttribute("aria-expanded", String(isOpen));
    widget.classList.toggle("is-open", isOpen);
    if (isOpen) {
      renderThread(isSending);
      window.setTimeout(() => input.focus(), 40);
    }
  }

  function generateLocalPortfolioReply(query: string): string {
    const q = query.toLowerCase();

    for (const p of PROJECTS) {
      const titleWords = p.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (
        q.includes(p.id.replace(/-/g, " ")) ||
        q.includes(p.title.toLowerCase()) ||
        (titleWords.length > 0 && titleWords.some(w => q.includes(w) && !["smart", "system", "website", "interactive"].includes(w)))
      ) {
        return `${p.title} (#${p.num} · ${p.category}, ${p.year}): ${p.summary}\n\nRole: ${p.role}\nTech Stack: ${p.tags.join(", ")}\n\n${p.caseStudy}`;
      }
    }

    if (q.includes("esp32") || q.includes("embedded") || q.includes("hardware") || q.includes("sonar") || q.includes("robot")) {
      const hw = PROJECTS.filter(p => p.track === "embedded" || p.track === "robotics");
      return `Deekshith has built ${hw.length} hardware, embedded, and robotics systems:\n` +
        hw.map(p => `• #${p.num} ${p.title} (${p.tags.slice(0, 4).join(", ")}): ${p.summary}`).join("\n");
    }

    if (q.includes("skill") || q.includes("stack") || q.includes("tech") || q.includes("language")) {
      return `Deekshith's ${SKILLS.length} core engineering skills:\n` +
        SKILLS.map(s => `• ${s.name} (${s.category} · ${s.level})`).join("\n");
    }

    if (q.includes("contact") || q.includes("email") || q.includes("hire") || q.includes("intern") || q.includes("reach") || q.includes("github") || q.includes("linkedin")) {
      return `You can reach ${PROFILE.name} directly:\n• Email: ${PROFILE.socials.email}\n• GitHub: ${PROFILE.socials.github}\n• LinkedIn: ${PROFILE.socials.linkedin}\n• Location: ${PROFILE.location} (${PROFILE.degree})`;
    }

    if (q.includes("university") || q.includes("college") || q.includes("education") || q.includes("ktu") || q.includes("about") || q.includes("who")) {
      return `${PROFILE.name} is an ${PROFILE.role} at ${PROFILE.university} (${PROFILE.years}), based in ${PROFILE.location}. Philosophy: "${PROFILE.philosophy}"`;
    }

    return `${PROFILE.name} has ${PROJECTS.length} documented builds across Embedded & Signal Processing, Robotics & Control, Circuit Design, and Interactive Web. Ask about a specific project (e.g., Adaptive Underwater Sonar, WorldView Command Center, Autonomous Obstacle Rover, Touchless Sanitizer) or his 8 core skills!`;
  }

  async function submitPrompt(rawText: string): Promise<void> {
    const text = rawText.trim();
    if (!text || isSending) return;

    const priorHistory = history.slice();
    history.push({ role: "user", text });
    input.value = "";
    isSending = true;
    sendBtn.disabled = true;
    renderThread(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: priorHistory,
          systemInstruction: SYSTEM_INSTRUCTION
        })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }
      history.push({
        role: "model",
        text: (data.reply || "").trim() || generateLocalPortfolioReply(text)
      });
    } catch {
      history.push({
        role: "model",
        text: generateLocalPortfolioReply(text)
      });
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      renderThread(false);
    }
  }

  launcherBtn.addEventListener("click", () => setOpen(!isOpen));
  closeBtn.addEventListener("click", () => setOpen(false));

  starters.addEventListener("click", e => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>(".chat-starter-chip");
    if (!chip) return;
    const prompt = chip.getAttribute("data-prompt") || "";
    if (prompt) submitPrompt(prompt);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    submitPrompt(input.value);
  });

  renderThread(false);
}
