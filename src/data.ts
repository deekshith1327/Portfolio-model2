export interface GlyphMap {
  [ch: string]: string[];
}

export type TrackId = "embedded" | "robotics" | "dataviz" | "webapps";

export interface Track {
  id: TrackId;
  label: string;
  bg: string;
  fg: string;
  chipBg: string;
  chipFg: string;
  motif: string;
  desc: string;
}

export interface ProjectItem {
  id: string;
  num: string;
  title: string;
  summary: string;
  role: string;
  year: string;
  category: string;
  track: TrackId;
  phase: "p1" | "p2" | "p3";
  tags: string[];
  caseStudy: string;
  featured: boolean;
  motif:
    | "sonar"
    | "globe"
    | "rover"
    | "linebot"
    | "breadboard"
    | "tap"
    | "sun"
    | "timer"
    | "bowl"
    | "sprout"
    | "doc"
    | "window"
    | "ledger";
  pal: [string, string, string, string];
  repoUrl?: string;
  homepageUrl?: string;
  isGithubSynced?: boolean;
}

export interface SkillItem {
  name: string;
  category: string;
  level: string;
  icon: string;
  relatedProjects: string[];
}

export interface JourneyPhase {
  id: "p1" | "p2" | "p3";
  num: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface LabBlock {
  id: string;
  name: string;
  nickname: string;
  level: string;
  tools: string;
  features: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  text: string;
  chip?: string;
}

export const TOKENS = {
  sodium: "#FFB87A",
  ink: "#0A0A0A",
  paper: "#FFFFFF",
  blue: "#2370E8",
  pink: "#D873B3",
  green: "#2BA676",
  lavender: "#A98BF7",
  coral: "#FF5A5A",
  mint: "#22C98A"
} as const;

export const PROFILE = {
  brand: "DEEKSHITH",
  name: "Deekshith P.",
  initials: "DP",
  role: "Electronics & Communication Engineering Student",
  location: "Kasaragod, Kerala, India",
  university: "APJ Abdul Kalam Technological University, Kerala",
  degree: "Bachelor of Technology — Electronics & Communication Engineering",
  years: "2025–2029",
  gradTargetUTC: "2029-05-31T00:00:00Z",
  intro: "Building practical solutions through electronics, programming, and innovation.",
  bio: "I am an Electronics and Communication Engineering student at APJ Abdul Kalam Technological University, Kerala. I enjoy turning theoretical concepts into practical applications—experimenting with sensors, breadboards, microcontrollers, and ideas that solve real-world problems.",
  philosophy: "Learn the fundamentals. Build with purpose. Improve through every failure.",
  socials: {
    email: "puthucherydeekshith@gmail.com",
    github: "https://github.com/deekshith1327",
    linkedin: "https://www.linkedin.com/in/deekshith-p-b079a8383"
  }
};

export const NAV_ITEMS = [
  { label: "(Projects)", href: "#/projects" },
  { label: "(Archive)", href: "#/archive" },
  { label: "(Skills)", href: "#/skills" },
  { label: "(Journey)", href: "#/journey" },
  { label: "(About)", href: "#/#about" }
];

export const GLYPHS: GlyphMap = {
  "0": [".#####.", "#.....#", "#....##", "#...#.#", "#..#..#", "#.#...#", "##....#", "#.....#", ".#####."],
  "1": ["...#...", "..##...", ".#.#...", "...#...", "...#...", "...#...", "...#...", "...#...", ".#####."],
  "2": [".#####.", "#.....#", "......#", ".....#.", "...##..", "..#....", ".#.....", "#......", "#######"],
  "3": [".#####.", "#.....#", "......#", "......#", "..####.", "......#", "......#", "#.....#", ".#####."],
  "4": ["....##.", "...#.#.", "..#..#.", ".#...#.", "#....#.", "#######", ".....#.", ".....#.", ".....#."],
  "5": ["#######", "#......", "#......", "######.", "......#", "......#", "......#", "#.....#", ".#####."],
  "6": ["..####.", ".#.....", "#......", "#......", "######.", "#.....#", "#.....#", "#.....#", ".#####."],
  "7": ["#######", "......#", ".....#.", "....#..", "...#...", "...#...", "..#....", "..#....", "..#...."],
  "8": [".#####.", "#.....#", "#.....#", "#.....#", ".#####.", "#.....#", "#.....#", "#.....#", ".#####."],
  "9": [".#####.", "#.....#", "#.....#", "#.....#", ".######", "......#", "......#", ".....#.", ".####.."],
  "/": ["....##", "....#.", "....#.", "...#..", "...#..", "..#...", "..#...", ".#....", "##...."],
  "-": [".....", ".....", ".....", ".....", "#####", ".....", ".....", ".....", "....."],
  ":": [".", ".", "#", ".", ".", ".", "#", ".", "."],
  ".": [".", ".", ".", ".", ".", ".", ".", ".", "#"],
  " ": ["...", "...", "...", "...", "...", "...", "...", "...", "..."],
  "A": ["..###..", ".#...#.", "#.....#", "#.....#", "#.....#", "#######", "#.....#", "#.....#", "#.....#"],
  "B": ["######.", "#.....#", "#.....#", "#.....#", "######.", "#.....#", "#.....#", "#.....#", "######."],
  "C": [".#####.", "#.....#", "#......", "#......", "#......", "#......", "#......", "#.....#", ".#####."],
  "D": ["#####..", "#....#.", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#", "#....#.", "#####.."],
  "E": ["#######", "#......", "#......", "#......", "######.", "#......", "#......", "#......", "#######"],
  "F": ["#######", "#......", "#......", "#......", "######.", "#......", "#......", "#......", "#......"],
  "G": [".#####.", "#.....#", "#......", "#......", "#..####", "#.....#", "#.....#", "#.....#", ".#####."],
  "H": ["#.....#", "#.....#", "#.....#", "#.....#", "#######", "#.....#", "#.....#", "#.....#", "#.....#"],
  "I": [".#####.", "...#...", "...#...", "...#...", "...#...", "...#...", "...#...", "...#...", ".#####."],
  "J": ["..#####", "....#..", "....#..", "....#..", "....#..", "#...#..", "#...#..", "#...#..", ".###..."],
  "K": ["#....#.", "#...#..", "#..#...", "#.#....", "##.....", "#.#....", "#..#...", "#...#..", "#....#."],
  "L": ["#......", "#......", "#......", "#......", "#......", "#......", "#......", "#......", "#######"],
  "M": ["#.....#", "##...##", "#.#.#.#", "#..#..#", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#"],
  "N": ["#.....#", "##....#", "#.#...#", "#..#..#", "#...#.#", "#....##", "#.....#", "#.....#", "#.....#"],
  "O": [".#####.", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#", ".#####."],
  "P": ["######.", "#.....#", "#.....#", "#.....#", "######.", "#......", "#......", "#......", "#......"],
  "Q": [".#####.", "#.....#", "#.....#", "#.....#", "#.....#", "#..#..#", "#...#.#", "#....#.", ".####.#"],
  "R": ["######.", "#.....#", "#.....#", "#.....#", "######.", "#...#..", "#....#.", "#.....#", "#.....#"],
  "S": [".#####.", "#.....#", "#......", "#......", ".#####.", "......#", "......#", "#.....#", ".#####."],
  "T": ["#######", "...#...", "...#...", "...#...", "...#...", "...#...", "...#...", "...#...", "...#..."],
  "U": ["#.....#", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#", "#.....#", ".#####."],
  "V": ["#.....#", "#.....#", "#.....#", "#.....#", "#.....#", ".#...#.", ".#...#.", "..#.#..", "...#..."],
  "W": ["#.....#", "#.....#", "#.....#", "#.....#", "#..#..#", "#..#..#", "#.#.#.#", "##...##", "#.....#"],
  "X": ["#.....#", ".#...#.", "..#.#..", "...#...", "...#...", "...#...", "..#.#..", ".#...#.", "#.....#"],
  "Y": ["#.....#", "#.....#", ".#...#.", "..#.#..", "...#...", "...#...", "...#...", "...#...", "...#..."],
  "Z": ["#######", "......#", ".....#.", "....#..", "...#...", "..#....", ".#.....", "#......", "#######"]
};

export const GLYPHS_BOLD: GlyphMap = {
  "0": [".#####.", "#######", "##...##", "##..###", "##.#.##", "###..##", "##...##", "#######", ".#####."],
  "1": ["...##..", "..###..", ".####..", "...##..", "...##..", "...##..", "...##..", "#######", "#######"],
  "2": [".#####.", "#######", "##...##", "....###", "..####.", ".###...", "##.....", "#######", "#######"],
  "3": [".#####.", "#######", ".....##", "..####.", "..####.", ".....##", "##...##", "#######", ".#####."],
  "4": ["....##.", "...###.", "..####.", ".##.##.", "##..##.", "#######", "#######", "....##.", "....##."],
  "5": ["#######", "#######", "##.....", "######.", "#######", ".....##", "##...##", "#######", ".#####."],
  "6": ["..####.", ".######", "##.....", "######.", "#######", "##...##", "##...##", "#######", ".#####."],
  "7": ["#######", "#######", ".....##", "....##.", "...##..", "..##...", "..##...", "..##...", "..##..."],
  "8": [".#####.", "#######", "##...##", ".#####.", ".#####.", "##...##", "##...##", "#######", ".#####."],
  "9": [".#####.", "#######", "##...##", "##...##", "#######", ".######", ".....##", "######.", ".#####."],
  "/": ["....##", "....##", "...##.", "...##.", "..##..", "..##..", ".##...", "##....", "##...."],
  "-": [".....", ".....", ".....", "#####", "#####", ".....", ".....", ".....", "....."],
  ":": [".", ".", "#", "#", ".", ".", "#", "#", "."],
  ".": [".", ".", ".", ".", ".", ".", ".", "#", "#"],
  " ": ["...", "...", "...", "...", "...", "...", "...", "...", "..."],
  "A": ["..###..", ".#####.", "##...##", "##...##", "#######", "#######", "##...##", "##...##", "##...##"],
  "B": ["######.", "#######", "##...##", "######.", "######.", "##...##", "##...##", "#######", "######."],
  "C": [".#####.", "#######", "##.....", "##.....", "##.....", "##.....", "##.....", "#######", ".#####."],
  "D": ["#####..", "######.", "##...##", "##...##", "##...##", "##...##", "##...##", "######.", "#####.."],
  "E": ["#######", "#######", "##.....", "######.", "######.", "##.....", "##.....", "#######", "#######"],
  "F": ["#######", "#######", "##.....", "######.", "######.", "##.....", "##.....", "##.....", "##....."],
  "G": [".#####.", "#######", "##.....", "##.....", "##.####", "##...##", "##...##", "#######", ".#####."],
  "H": ["##...##", "##...##", "##...##", "#######", "#######", "##...##", "##...##", "##...##", "##...##"],
  "I": ["#######", "#######", "..###..", "..###..", "..###..", "..###..", "..###..", "#######", "#######"],
  "J": ["..#####", "..#####", "....##.", "....##.", "....##.", "##..##.", "##..##.", "######.", ".####.."],
  "K": ["##...##", "##..##.", "##.##..", "####...", "###....", "####...", "##.##..", "##..##.", "##...##"],
  "L": ["##.....", "##.....", "##.....", "##.....", "##.....", "##.....", "##.....", "#######", "#######"],
  "M": ["##...##", "###.###", "#######", "##.#.##", "##...##", "##...##", "##...##", "##...##", "##...##"],
  "N": ["##...##", "###..##", "####.##", "##.####", "##..###", "##...##", "##...##", "##...##", "##...##"],
  "O": [".#####.", "#######", "##...##", "##...##", "##...##", "##...##", "##...##", "#######", ".#####."],
  "P": ["######.", "#######", "##...##", "##...##", "#######", "######.", "##.....", "##.....", "##....."],
  "Q": [".#####.", "#######", "##...##", "##...##", "##...##", "##.#.##", "##..###", "#######", ".#####."],
  "R": ["######.", "#######", "##...##", "##...##", "#######", "##.##..", "##..##.", "##...##", "##...##"],
  "S": [".#####.", "#######", "##.....", ".#####.", "..#####", ".....##", "##...##", "#######", ".#####."],
  "T": ["#######", "#######", "..###..", "..###..", "..###..", "..###..", "..###..", "..###..", "..###.."],
  "U": ["##...##", "##...##", "##...##", "##...##", "##...##", "##...##", "##...##", "#######", ".#####."],
  "V": ["##...##", "##...##", "##...##", "##...##", "##...##", ".##.##.", ".##.##.", "..###..", "...#..."],
  "W": ["##...##", "##...##", "##...##", "##.#.##", "##.#.##", "#######", "#######", "###.###", "##...##"],
  "X": ["##...##", ".##.##.", "..###..", "...#...", "..###..", ".##.##.", "##...##", "##...##", "##...##"],
  "Y": ["##...##", "##...##", ".##.##.", "..###..", "..###..", "..###..", "..###..", "..###..", "..###.."],
  "Z": ["#######", "#######", "....##.", "...##..", "..##...", ".##....", "##.....", "#######", "#######"]
};

export const TRACKS: Track[] = [
  {
    id: "embedded",
    label: "Embedded",
    bg: "#FFB87A",
    fg: "#0A0A0A",
    chipBg: "#2370E8",
    chipFg: "#FFFFFF",
    motif: "open ring",
    desc: "ESP32 firmware, AD9850 DDS waveform synthesis, sensor inputs and real-time control."
  },
  {
    id: "robotics",
    label: "Robotics & HW",
    bg: "#2370E8",
    fg: "#FFFFFF",
    chipBg: "#2BA676",
    chipFg: "#0A0A0A",
    motif: "smiley",
    desc: "Autonomous navigation bots, breadboard prototyping, LM358 op-amps and motor switching."
  },
  {
    id: "dataviz",
    label: "Data & 3D",
    bg: "#2BA676",
    fg: "#0A0A0A",
    chipBg: "#D873B3",
    chipFg: "#0A0A0A",
    motif: "heart",
    desc: "TypeScript and CesiumJS telemetry dashboards visualizing live USGS, OpenSky and CelesTrak feeds."
  },
  {
    id: "webapps",
    label: "Web Apps",
    bg: "#A98BF7",
    fg: "#0A0A0A",
    chipBg: "#2370E8",
    chipFg: "#FFFFFF",
    motif: "hourglass",
    desc: "Local-first planners, Pomodoro sprint timers, recipe guides, finance ledgers and React tools."
  }
];

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: "p1",
    num: "01",
    year: "2025",
    title: "Foundation — KTU ECE",
    subtitle: "APJ Abdul Kalam Technological University",
    description: "Started Bachelor of Technology in Electronics & Communication Engineering (2025–2029), turning circuit theory into hands-on hardware."
  },
  {
    id: "p2",
    num: "02",
    year: "Now",
    title: "Experimentation — Hardware & Data",
    subtitle: "Sensors, ESP32 & Telemetry",
    description: "Developing practical knowledge with electronics experiments, robotics, adaptive sonar firmware, and real-time visualization dashboards."
  },
  {
    id: "p3",
    num: "03",
    year: "Next",
    title: "Purpose — Full-Stack Engineering",
    subtitle: "Competitions, Systems & Utilities",
    description: "Strengthening programming, hardware prototyping, and shipped software utilities toward advanced engineering work."
  }
];

export const SKILLS: SkillItem[] = [
  {
    name: "Circuit fundamentals",
    category: "Electronics",
    level: "Foundation",
    icon: "◈",
    relatedProjects: ["line-follower", "touchless-tap"]
  },
  {
    name: "Breadboard prototyping",
    category: "Electronics",
    level: "Foundation",
    icon: "⌘",
    relatedProjects: ["sensor-prototypes", "touchless-tap"]
  },
  {
    name: "Sensor interfacing",
    category: "Electronics",
    level: "Growing",
    icon: "◌",
    relatedProjects: ["line-follower", "esp32-car", "sensor-prototypes", "adaptive-sonar-transmitter"]
  },
  {
    name: "ESP32 development",
    category: "Embedded",
    level: "Growing",
    icon: "◉",
    relatedProjects: ["esp32-car", "adaptive-sonar-transmitter"]
  },
  {
    name: "Arduino IDE",
    category: "Embedded",
    level: "Foundation",
    icon: "△",
    relatedProjects: ["line-follower", "sensor-prototypes"]
  },
  {
    name: "Microcontroller programming",
    category: "Embedded",
    level: "Learning",
    icon: "↗",
    relatedProjects: ["esp32-car", "line-follower", "adaptive-sonar-transmitter"]
  },
  {
    name: "C fundamentals",
    category: "Programming",
    level: "Foundation",
    icon: "{ }",
    relatedProjects: ["adaptive-sonar-transmitter", "esp32-car"]
  },
  {
    name: "Problem-solving",
    category: "Professional",
    level: "Growing",
    icon: "✦",
    relatedProjects: ["line-follower", "esp32-car", "sensor-prototypes", "touchless-tap"]
  }
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "adaptive-sonar-transmitter",
    num: "01",
    title: "Adaptive Sonar Transmitter",
    summary: "ESP32 firmware for an adaptive underwater sonar transmitter, using turbidity, depth, and salinity inputs to adjust signal parameters and transmission mode in real time.",
    role: "Embedded firmware development",
    year: "2025",
    category: "Embedded Systems",
    track: "embedded",
    phase: "p2",
    tags: ["C++", "ESP32", "AD9850 DDS", "Sensors", "Sonar"],
    caseStudy: "Built ESP32 firmware for an adaptive underwater sonar transmitter. Used turbidity, depth, and salinity inputs to dynamically adjust frequency sweeps, pulse duration, amplitude, and transmission mode in real time.",
    featured: true,
    motif: "sonar",
    pal: ["#2370E8", "#FFB87A", "#0A0A0A", "#FFFFFF"]
  },
  {
    id: "earthscope",
    num: "02",
    title: "Earthscope — Planetary Monitoring Dashboard",
    summary: "An interactive Earth-monitoring dashboard visualizing live earthquake, aircraft, and satellite data, with fallback handling for unavailable public data services.",
    role: "Dashboard development",
    year: "2025",
    category: "Data Visualization",
    track: "dataviz",
    phase: "p2",
    tags: ["TypeScript", "CesiumJS", "Vite", "USGS API", "OpenSky", "CelesTrak"],
    caseStudy: "Developed an interactive Earth-monitoring dashboard that visualizes live earthquake, aircraft, and satellite data. Integrated public data sources including USGS, OpenSky, and CelesTrak, with fallback handling for unavailable services.",
    featured: true,
    motif: "globe",
    pal: ["#2BA676", "#0A0A0A", "#A98BF7", "#FFFFFF"]
  },
  {
    id: "esp32-car",
    num: "03",
    title: "ESP32 Obstacle-Avoiding Car",
    summary: "A mobile robotic system that detects obstacles and responds to its surroundings with ESP32-based control.",
    role: "ESP32 · sensor interfacing · embedded programming",
    year: "2025",
    category: "Embedded",
    track: "embedded",
    phase: "p1",
    tags: ["C++", "ESP32", "Ultrasonic", "Motor Driver", "Navigation"],
    caseStudy: "A hands-on exploration of autonomous navigation and intelligent hardware behaviour.",
    featured: true,
    motif: "rover",
    pal: ["#0A0A0A", "#2370E8", "#FFB87A", "#FFFFFF"]
  },
  {
    id: "line-follower",
    num: "04",
    title: "Line Follower Robot",
    summary: "A robotics project designed to follow a predefined path using sensors and electronic control.",
    role: "Sensor integration · motor control · circuit prototyping",
    year: "2025",
    category: "Robotics",
    track: "robotics",
    phase: "p1",
    tags: ["Embedded C", "IR Sensors", "Motor Control", "Hardware"],
    caseStudy: "Built to understand how sensors and control logic work together in an autonomous robotic system.",
    featured: true,
    motif: "linebot",
    pal: ["#D873B3", "#0A0A0A", "#22C98A", "#FFFFFF"]
  },
  {
    id: "sensor-prototypes",
    num: "05",
    title: "Sensor-Based Electronics Prototypes",
    summary: "A collection of practical experiments with sensors, breadboards, and basic electronic circuits.",
    role: "Sensors · circuit construction · troubleshooting",
    year: "Ongoing",
    category: "Hardware",
    track: "robotics",
    phase: "p2",
    tags: ["Breadboards", "Analog Signals", "Sensors", "Circuit Testing"],
    caseStudy: "Experiments focused on connecting components, observing signals, and building practical circuit intuition.",
    featured: true,
    motif: "breadboard",
    pal: ["#22C98A", "#2370E8", "#0A0A0A", "#FFFFFF"]
  },
  {
    id: "touchless-tap",
    num: "06",
    title: "Touchless Water Tap",
    summary: "Touch-free water dispensing using sensor-based control and an LM358 operational amplifier.",
    role: "Sensors · operational amplifiers · electronic switching",
    year: "2025",
    category: "Automation",
    track: "robotics",
    phase: "p1",
    tags: ["LM358 Op-Amp", "IR Sensor", "Relay Switch", "Circuit Design"],
    caseStudy: "A simple automation concept exploring hygiene, convenience, and efficient water usage.",
    featured: true,
    motif: "tap",
    pal: ["#2370E8", "#2BA676", "#0A0A0A", "#FFFFFF"]
  },
  {
    id: "personal-engineering-portfolio",
    num: "07",
    title: "Personal Engineering Portfolio",
    summary: "An editable engineering portfolio website with project filtering, case-study views, configurable skills, responsive layouts, and Netlify/Decap CMS content management support.",
    role: "Portfolio development",
    year: "2025",
    category: "Web Apps",
    track: "webapps",
    phase: "p2",
    tags: ["React", "TypeScript", "Vite", "Netlify CMS", "Responsive UI"],
    caseStudy: "Built an editable engineering portfolio website with project filtering, case-study views, configurable skills, responsive layouts, and content management support through Netlify/Decap CMS.",
    featured: true,
    motif: "window",
    pal: ["#A98BF7", "#0A0A0A", "#2370E8", "#FFFFFF"]
  },
  {
    id: "daylight-daily-planner",
    num: "08",
    title: "Daylight — Daily Planner",
    summary: "A daily planning workspace for managing priorities, marking tasks complete, and visualizing progress with a live completion count and progress ring.",
    role: "Web development",
    year: "Ongoing",
    category: "Web Apps",
    track: "webapps",
    phase: "p3",
    tags: ["JavaScript", "HTML5", "CSS3", "SVG Ring", "Local Storage"],
    caseStudy: "Built a daily planning workspace for managing priorities, marking tasks complete, and visualizing progress with a live completion count and progress ring.",
    featured: true,
    motif: "sun",
    pal: ["#FF5A5A", "#FFFFFF", "#0A0A0A", "#FFB87A"]
  },
  {
    id: "focus-atlas-study-sprint",
    num: "09",
    title: "Focus Atlas — Study Sprint",
    summary: "A responsive study productivity app with configurable Pomodoro timers, pause and reset controls, and goal tracking. Study goals persist in browser storage across sessions.",
    role: "Web development",
    year: "Ongoing",
    category: "Web Apps",
    track: "webapps",
    phase: "p3",
    tags: ["JavaScript", "HTML5", "CSS3", "Pomodoro Timer", "Local Storage"],
    caseStudy: "Built a responsive study productivity app with configurable Pomodoro timers, pause/reset controls, and goal tracking. Persisted study goals in browser storage for a seamless experience across sessions.",
    featured: true,
    motif: "timer",
    pal: ["#A98BF7", "#D873B3", "#0A0A0A", "#FFFFFF"]
  },
  {
    id: "pocket-ledger",
    num: "10",
    title: "Pocket Ledger",
    summary: "A personal finance tracker for recording income and expenses, viewing transaction history and totals, and filtering by transaction type, with browser-based data persistence.",
    role: "Web development",
    year: "Ongoing",
    category: "Web Apps",
    track: "webapps",
    phase: "p3",
    tags: ["JavaScript", "HTML5", "CSS3", "State Persistence", "Local Storage"],
    caseStudy: "Developed a personal finance tracker that records income and expenses, displays transaction history and totals, and supports filtering by transaction type. Designed a responsive interface with browser-based data persistence.",
    featured: true,
    motif: "ledger",
    pal: ["#2BA676", "#FFB87A", "#0A0A0A", "#FFFFFF"]
  },
  {
    id: "gather-meal-map",
    num: "11",
    title: "Gather — Meal Map",
    summary: "A meal discovery and cooking companion with dietary and cuisine filters, pantry suggestions, recipe saving, shopping lists, ingredient scaling, timers, and step-by-step guidance.",
    role: "Web development",
    year: "Ongoing",
    category: "Web Apps",
    track: "webapps",
    phase: "p3",
    tags: ["JavaScript", "HTML5", "CSS3", "Recipe Engine", "Local Storage"],
    caseStudy: "Created a meal-discovery and cooking companion with dietary and cuisine filters, pantry-based suggestions, recipe saving, shopping lists, ingredient scaling, timers, and step-by-step cooking guidance.",
    featured: false,
    motif: "bowl",
    pal: ["#FF5A5A", "#22C98A", "#0A0A0A", "#FFFFFF"]
  },
  {
    id: "habit-garden",
    num: "12",
    title: "Habit Garden",
    summary: "A calm, responsive habit tracker for building routines, completing daily habits, monitoring progress, and retaining data locally across desktop and mobile.",
    role: "Web development",
    year: "Ongoing",
    category: "Web Apps",
    track: "webapps",
    phase: "p3",
    tags: ["JavaScript", "HTML5", "CSS3", "Streak Analytics", "Local Storage"],
    caseStudy: "Developed a habit-tracking application that helps users build routines, complete daily habits, monitor progress, and retain data locally. Designed a calm, responsive experience for desktop and mobile.",
    featured: false,
    motif: "sprout",
    pal: ["#22C98A", "#0A0A0A", "#FFB87A", "#FFFFFF"]
  },
  {
    id: "pdf-summary-generator",
    num: "13",
    title: "PDF Summary Generator",
    summary: "A web application that generates PDF summaries from text, documents, and URLs.",
    role: "Web development",
    year: "Ongoing",
    category: "Web Apps",
    track: "webapps",
    phase: "p2",
    tags: ["JavaScript", "Document Parser", "PDF Engine", "Web API"],
    caseStudy: "Created a web application that generates PDF summaries from text, documents, and URLs.",
    featured: false,
    motif: "doc",
    pal: ["#2370E8", "#FFFFFF", "#0A0A0A", "#D873B3"]
  }
];

export const LAB_BLOCKS: LabBlock[] = [
  {
    id: "mcu-core",
    name: "Microcontrollers",
    nickname: "ESP32 & Arduino",
    level: "Embedded",
    tools: "ESP32 · Arduino IDE · C/C++",
    features: [
      "Adaptive underwater sonar firmware with AD9850 DDS",
      "Autonomous obstacle-avoiding rover control",
      "Real-time sensor polling and actuator switching"
    ],
    x: 1, y: 1, w: 22, h: 14, fill: "#2370E8", text: "#FFFFFF"
  },
  {
    id: "analog-bench",
    name: "Analog & Sensors",
    nickname: "Breadboard Bench",
    level: "Hardware",
    tools: "LM358 Op-Amp · IR & Ultrasonic",
    features: [
      "Circuit fundamentals and signal troubleshooting",
      "Touchless tap switching with LM358 operational amplifiers",
      "Line-following IR array calibration and motor drivers"
    ],
    x: 24, y: 1, w: 15, h: 9, fill: "#2BA676", text: "#0A0A0A"
  },
  {
    id: "c-logic",
    name: "C & Logic",
    nickname: "Systems Core",
    level: "Programming",
    tools: "C · TypeScript · State Machines",
    features: [
      "Deterministic control loops and hardware interfacing",
      "Structured problem-solving across hardware and code"
    ],
    chip: "C",
    x: 24, y: 11, w: 7, h: 4, fill: "#A98BF7", text: "#0A0A0A"
  },
  {
    id: "telemetry-3d",
    name: "3D & Feeds",
    nickname: "Earthscope",
    level: "Visualization",
    tools: "CesiumJS · USGS · OpenSky",
    features: [
      "Live earthquake, aircraft and satellite rendering",
      "Graceful fallback when public APIs go offline"
    ],
    x: 32, y: 11, w: 7, h: 4, fill: "#D873B3", text: "#0A0A0A"
  },
  {
    id: "web-studio",
    name: "Web Utilities",
    nickname: "Browser & Local-First",
    level: "Software",
    tools: "React · Vite · HTML/CSS/JS · LocalStorage",
    features: [
      "7+ focused web tools: Daylight, Focus Atlas, Pocket Ledger, Gather, Habit Garden",
      "PDF Summary Generator & Netlify/Decap CMS portfolio architecture",
      "Responsive layouts built for desktop and mobile"
    ],
    x: 1, y: 16, w: 38, h: 7, fill: "#FF5A5A", text: "#0A0A0A"
  },
  {
    id: "ktu-base",
    name: "KTU ECE",
    nickname: "2025–2029",
    level: "Degree",
    tools: "Kasaragod, Kerala",
    features: [
      "B.Tech Electronics & Communication Engineering",
      "APJ Abdul Kalam Technological University, Kerala"
    ],
    chip: "ECE",
    x: 30, y: 17, w: 8, h: 5, fill: "#22C98A", text: "#0A0A0A"
  }
];

export const FAQ_ITEMS = [
  {
    q: "What are you currently studying?",
    a: "I am pursuing a Bachelor of Technology in Electronics & Communication Engineering (2025–2029) at APJ Abdul Kalam Technological University, Kerala."
  },
  {
    q: "What kinds of projects do you build?",
    a: "I build across both hardware and software—from ESP32 firmware, adaptive sonar transmitters, line-following and obstacle-avoiding robots, and LM358 sensor circuits to CesiumJS planetary monitoring dashboards and local-first web apps."
  },
  {
    q: "What is your engineering philosophy?",
    a: "Learn the fundamentals. Build with purpose. Improve through every failure."
  },
  {
    q: "Are you open to collaborations or internships?",
    a: "Yes. I am open to connecting with students, mentors, engineering teams, and anyone interested in embedded systems, IoT, robotics, or web software."
  },
  {
    q: "Where can I inspect your code or reach out?",
    a: "You can check my repositories on GitHub (github.com/deekshith1327), connect on LinkedIn, or email me directly at puthucherydeekshith@gmail.com."
  }
];

export const COPY = {
  siteTitleSuffix: " — Deekshith P.",
  homeTitle: "Deekshith P. — ECE · Embedded Systems · IoT & Web Portfolio",
  heroH1: "Deekshith P., Electronics and Communication Engineering student at APJ Abdul Kalam Technological University, Kerala, building embedded systems, IoT, robotics, and web applications.",
  heroAddress: ["Kasaragod, Kerala, India", "B.Tech ECE · KTU (2025–2029)"],
  heroDate: "13 Builds · 8 Core Skills",
  heroCycle: [
    { desktop: "DP/25", mobile: ["DP/", "25"], caption: "01 / 07 — Deekshith P. · B.Tech ECE (2025–2029) · Click to cycle components" },
    { desktop: "ESP32", mobile: ["ESP", "32"], caption: "02 / 07 — ESP32 Microcontroller · Dual-Core Wi-Fi / BLE · C++ Firmware" },
    { desktop: "LM358", mobile: ["LM", "358"], caption: "03 / 07 — LM358 Dual Op-Amp IC · Analog Signal Conditioning & Sensor Switching" },
    { desktop: "AD9850", mobile: ["AD9", "850"], caption: "04 / 07 — AD9850 DDS Synthesizer · Real-Time Adaptive Underwater Sonar Sweeps" },
    { desktop: "SONAR", mobile: ["SO", "NAR"], caption: "05 / 07 — Ultrasonic & Acoustic Transducers · Depth, Turbidity & Obstacle Ranging" },
    { desktop: "ROVER", mobile: ["RO", "VER"], caption: "06 / 07 — Autonomous Robotics · Line-Follower Array & Motor Driver Control" },
    { desktop: "CESIUM", mobile: ["CES", "IUM"], caption: "07 / 07 — CesiumJS 3D Telemetry · Live USGS, OpenSky & CelesTrak Feeds" }
  ],
  heroSplit: [
    { left: "Deekshith P.", right: "" },
    { left: "Electronics and Communication Engineering Student", right: "" },
    { left: "APJ Abdul Kalam Technological University, Kerala (2025–2029)", right: "" }
  ],
  heroBio: "Building practical solutions through electronics, programming, and innovation — turning theoretical concepts into real-world applications with sensors, microcontrollers, and software.",
  heroFinal: "Learn the fundamentals. Build with purpose.",
  aboutLead: PROFILE.bio,
  aboutP1: "Every prototype starts on a breadboard or a blank editor—observing real signals, writing deterministic C/C++ or TypeScript, and debugging until the system holds up outside the lab.",
  aboutP2: `${PROFILE.philosophy} Based in ${PROFILE.location}, studying at ${PROFILE.university} (${PROFILE.years}).`,
  tracksLead: "Four tracks. Hardware at the edge, software in the browser.",
  daysLead: "Foundation in 2025, experimentation now, engineering with purpose next.",
  speakersLead: "All 13 engineering & software builds. Hover any thumbnail to invert its schematic, or open its full case study.",
  posterLeftHead: ["2025–29", "DEEKSHITH", "Electronics &", "Communication", "«Learn by building»"],
  posterRightHead: [
    "APJ Abdul Kalam Technological University",
    "Kasaragod, Kerala, India",
    "Embedded, Robotics, Data & Web",
    "13 Projects · 8 Core Skills",
    "puthucherydeekshith@gmail.com"
  ],
  projectsTitle: "13 projects, built to learn.",
  projectsLead: "Filter by discipline or sort by featured and title. Open any build for its full case study and interactive resolution scrubber.",
  archiveTitle: "13 builds, in the index.",
  archiveLead: "Search by title, stack, or keyword. Expand any row to inspect the case study or shortlist builds for an inquiry.",
  skillsTitle: "Skills & bench",
  skillsLead: "Eight core capabilities across electronics, microcontrollers, programming, and problem-solving—mapped against the lab stack.",
  journeyTitle: "Education & growth",
  journeyLead: "A foundation in progress, built deliberately through experimentation.",
  contactTitle: "Let's build something meaningful.",
  contactLead: "Open to connecting with students, mentors, engineering teams, and people who share an interest in technology and innovation.",
  badgeTitle: "Make a visitor card",
  badgeLead: "Draw a 16 × 16 pixel sprite, add your name, and export a printable SVG visitor card.",
  colophon: "Set in Inter Tight and the 7×9 pixel grid. Portfolio for Deekshith P. (ECE · Embedded Systems · IoT · Web Apps), Kasaragod, Kerala.",
  honesty: "All 13 projects, skills, education milestones, and contact links on this site belong to Deekshith P. (APJ Abdul Kalam Technological University, 2025–2029).",
  version: "© 2026 Deekshith P.",
  countdownOver: "Class of 2029 — ready for what comes next."
};
