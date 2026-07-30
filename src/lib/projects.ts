export type ProjectStatus =
  | "deploy-ready"
  | "full-ready"
  | "half-ready"
  | "in-dev"
  | "prototype"
  | "leftover"
  | "hackathon";

export interface Project {
  name: string;
  fullName: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  statusNote: string;
  leftoverItems?: string[];
  tags: string[];
}

export const statusConfig: Record<
  ProjectStatus,
  { label: string; color: string; dotColor: string; bgColor: string; borderColor: string }
> = {
  "deploy-ready": {
    label: "Deploy Ready",
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
  },
  "full-ready": {
    label: "Full Ready",
    color: "text-green-400",
    dotColor: "bg-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
  },
  "half-ready": {
    label: "Half Ready",
    color: "text-yellow-400",
    dotColor: "bg-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
  },
  "in-dev": {
    label: "In Dev",
    color: "text-blue-400",
    dotColor: "bg-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
  },
  prototype: {
    label: "Prototype",
    color: "text-purple-400",
    dotColor: "bg-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
  },
  leftover: {
    label: "Leftover",
    color: "text-zinc-400",
    dotColor: "bg-zinc-400",
    bgColor: "bg-zinc-400/10",
    borderColor: "border-zinc-400/30",
  },
  hackathon: {
    label: "Hackathon",
    color: "text-orange-400",
    dotColor: "bg-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
  },
};

export const languageColors: Record<string, string> = {
  TypeScript: "text-blue-300",
  JavaScript: "text-yellow-300",
  Python: "text-green-300",
  Dart: "text-cyan-300",
  CSS: "text-pink-300",
  HTML: "text-orange-300",
};

export const projects: Project[] = [
  {
    name: "eco-bloom",
    fullName: "ace4o4/eco-bloom",
    description:
      "Circular economy platform for material reuse & recycling. AI-powered material detection (YOLOv5), location-based matching, full Supabase backend.",
    url: "https://github.com/ace4o4/eco-bloom",
    language: "TypeScript",
    stars: 2,
    openIssues: 0,
    createdAt: "2026-01-05",
    updatedAt: "2026-03-22",
    status: "deploy-ready",
    statusNote:
      "v1.0 shipped. Full-stack (React + FastAPI + Supabase), Vercel & Render hosting configured, documented DEPLOYMENT.md.",
    tags: ["React", "FastAPI", "Supabase", "YOLOv5", "Geo"],
  },
  {
    name: "GCBEsports",
    fullName: "ace4o4/GCBEsports",
    description:
      "Official website for GCB Esports Organization. Tournament listings, team roster, and event announcements.",
    url: "https://github.com/ace4o4/GCBEsports",
    language: "CSS",
    stars: 2,
    openIssues: 0,
    createdAt: "2025-03-19",
    updatedAt: "2026-02-19",
    status: "full-ready",
    statusNote: "Org site fully functional and live. No open issues; CSS/HTML only.",
    tags: ["HTML", "CSS", "Esports", "Static Site"],
  },
  {
    name: "split-zenith",
    fullName: "ace4o4/split-zenith",
    description:
      "Expense-splitting app with smart balance calculations and group management.",
    url: "https://github.com/ace4o4/split-zenith",
    language: "TypeScript",
    stars: 2,
    openIssues: 0,
    createdAt: "2025-09-24",
    updatedAt: "2026-03-10",
    status: "half-ready",
    statusNote:
      "Core split logic and UI done. Missing: payment integrations, backend persistence, notifications.",
    leftoverItems: [
      "Payment gateway integration",
      "Backend persistence layer",
      "Push notifications",
      "Export / settlement history",
    ],
    tags: ["React", "TypeScript", "Vite", "Finance"],
  },
  {
    name: "hiremind",
    fullName: "ace4o4/hiremind",
    description:
      "AI-powered hiring assistant. Resume parsing, candidate screening, and interview scheduling.",
    url: "https://github.com/ace4o4/hiremind",
    language: "TypeScript",
    stars: 1,
    openIssues: 1,
    createdAt: "2026-02-24",
    updatedAt: "2026-03-18",
    status: "half-ready",
    statusNote:
      "Frontend + Supabase schema done. Server directory scaffolded; AI screening logic and calendar integration in progress.",
    leftoverItems: [
      "AI resume scoring endpoint",
      "Calendar / scheduling flow",
      "Email notification system",
      "Candidate dashboard polish",
    ],
    tags: ["React", "TypeScript", "Supabase", "AI", "HR"],
  },
  {
    name: "uniearth",
    fullName: "ace4o4/uniearth",
    description:
      "Multi-satellite data fusion dashboard (Sat-Fusion-AI). Fuses Sentinel-2, Landsat & ISRO data with cloud-gap filling and pan-sharpening.",
    url: "https://github.com/ace4o4/uniearth",
    language: "TypeScript",
    stars: 2,
    openIssues: 1,
    createdAt: "2026-01-16",
    updatedAt: "2026-03-25",
    status: "in-dev",
    statusNote:
      "Prototype stage. Core fusion engine and map live; agent reasoning loop active. Needs auth polish, export features.",
    leftoverItems: [
      "User auth & saved sessions",
      "Scene export (GeoTIFF / PNG)",
      "Batch fusion job queue",
      "Mobile responsive layout",
    ],
    tags: ["React", "FastAPI", "MapLibre", "Satellite", "AI"],
  },
  {
    name: "orbital-sentinel",
    fullName: "ace4o4/orbital-sentinel",
    description:
      "Real-time orbital debris tracking and conjunction analysis platform.",
    url: "https://github.com/ace4o4/orbital-sentinel",
    language: "TypeScript",
    stars: 2,
    openIssues: 0,
    createdAt: "2026-01-10",
    updatedAt: "2026-03-25",
    status: "in-dev",
    statusNote:
      "Actively being developed. Orbital mechanics visualization and TLE parsing functional; conjunction alerts WIP.",
    leftoverItems: [
      "Conjunction probability engine",
      "Alert subscription system",
      "Live TLE feed integration",
    ],
    tags: ["React", "TypeScript", "Space", "Orbital"],
  },
  {
    name: "hyper-arena",
    fullName: "ace4o4/hyper-arena",
    description:
      "Multiplayer competitive gaming arena platform with match-making, leaderboards, and live scoring.",
    url: "https://github.com/ace4o4/hyper-arena",
    language: "TypeScript",
    stars: 3,
    openIssues: 0,
    createdAt: "2025-12-03",
    updatedAt: "2026-02-13",
    status: "in-dev",
    statusNote:
      "Match-making flow and leaderboard UI scaffolded. Real-time WebSocket layer and deployment not yet wired up.",
    leftoverItems: [
      "WebSocket real-time match events",
      "Auth & player profiles",
      "Backend game logic",
      "Deployment pipeline",
    ],
    tags: ["React", "TypeScript", "Gaming", "WebSocket"],
  },
  {
    name: "aethos",
    fullName: "ace4o4/aethos",
    description:
      "Ethical AI governance dashboard — tracks model behaviour, bias metrics, and compliance flags.",
    url: "https://github.com/ace4o4/aethos",
    language: "TypeScript",
    stars: 1,
    openIssues: 0,
    createdAt: "2026-03-20",
    updatedAt: "2026-03-25",
    status: "in-dev",
    statusNote: "Brand-new repo, just started. UI shell and routing scaffolded. Core features not yet implemented.",
    leftoverItems: [
      "Bias metric computation",
      "Model integration connectors",
      "Compliance report generator",
      "Alert & notification system",
    ],
    tags: ["React", "TypeScript", "AI", "Ethics"],
  },
  {
    name: "earth-lens",
    fullName: "ace4o4/earth-lens",
    description:
      "Remote sensing lens tool for spectral analysis and land-cover classification from satellite imagery.",
    url: "https://github.com/ace4o4/earth-lens",
    language: "TypeScript",
    stars: 1,
    openIssues: 0,
    createdAt: "2026-01-15",
    updatedAt: "2026-02-22",
    status: "in-dev",
    statusNote:
      "Spectral band visualization works. Land-cover ML classifier and batch analysis pending.",
    leftoverItems: [
      "ML land-cover classifier",
      "Batch scene analysis",
      "Export pipeline",
    ],
    tags: ["React", "TypeScript", "Satellite", "Remote Sensing"],
  },
  {
    name: "hackx",
    fullName: "ace4o4/hackx",
    description:
      "Hackathon platform — team formation, project submission, and judging portal.",
    url: "https://github.com/ace4o4/hackx",
    language: "TypeScript",
    stars: 0,
    openIssues: 0,
    createdAt: "2026-03-24",
    updatedAt: "2026-03-24",
    status: "hackathon",
    statusNote:
      "Built during a hackathon sprint. Submission portal UI done; judging backend and scoring not complete.",
    leftoverItems: [
      "Judging & scoring backend",
      "Team chat / collab features",
      "Leaderboard",
    ],
    tags: ["React", "TypeScript", "Hackathon"],
  },
  {
    name: "WasteNet",
    fullName: "ace4o4/WasteNet",
    description:
      "AI + camera system for automatic waste sorting (plastic, cardboard) from a live feed. Smart recycling truck dispatch.",
    url: "https://github.com/ace4o4/WasteNet",
    language: "HTML",
    stars: 1,
    openIssues: 0,
    createdAt: "2025-10-02",
    updatedAt: "2026-02-13",
    status: "prototype",
    statusNote:
      "Proof-of-concept demo with static HTML UI and mock AI output. Not integrated with real camera / truck dispatch.",
    tags: ["HTML", "Python", "AI", "Computer Vision", "IoT"],
  },
  {
    name: "WasteNet_updated",
    fullName: "ace4o4/WasteNet_updated",
    description:
      "WasteNet v2.0 — focus on front-end and back-end integration, improved UI.",
    url: "https://github.com/ace4o4/WasteNet_updated",
    language: null,
    stars: 1,
    openIssues: 0,
    createdAt: "2025-10-05",
    updatedAt: "2026-02-13",
    status: "prototype",
    statusNote:
      "Incremental iteration over WasteNet v1. UI improved but back-end integration still experimental.",
    tags: ["Python", "AI", "Computer Vision"],
  },
  {
    name: "flow",
    fullName: "ace4o4/flow",
    description:
      "Cross-platform Flutter app for workflow and task management with a clean, minimal UI.",
    url: "https://github.com/ace4o4/flow",
    language: "Dart",
    stars: 1,
    openIssues: 0,
    createdAt: "2026-02-19",
    updatedAt: "2026-02-19",
    status: "prototype",
    statusNote:
      "Flutter skeleton and basic task CRUD done. No backend; local state only. Very early prototype.",
    leftoverItems: [
      "Cloud sync / backend",
      "Notifications & reminders",
      "Collaboration features",
    ],
    tags: ["Flutter", "Dart", "Mobile", "Productivity"],
  },
  {
    name: "deepak",
    fullName: "ace4o4/deepak",
    description: "Flutter app — early prototype, purpose under development.",
    url: "https://github.com/ace4o4/deepak",
    language: "Dart",
    stars: 0,
    openIssues: 0,
    createdAt: "2026-02-26",
    updatedAt: "2026-02-26",
    status: "prototype",
    statusNote: "Scaffold only — created and not yet iterated on.",
    tags: ["Flutter", "Dart", "Mobile"],
  },
  {
    name: "Chat-App",
    fullName: "ace4o4/Chat-App",
    description:
      "Real-time chat application with rooms, direct messaging, and presence indicators.",
    url: "https://github.com/ace4o4/Chat-App",
    language: "HTML",
    stars: 0,
    openIssues: 0,
    createdAt: "2026-03-25",
    updatedAt: "2026-03-25",
    status: "prototype",
    statusNote: "Created today — only initial HTML skeleton committed.",
    leftoverItems: [
      "WebSocket server",
      "Room & DM logic",
      "User authentication",
      "Message persistence",
    ],
    tags: ["HTML", "JavaScript", "Chat", "Real-time"],
  },
  {
    name: "BirthdayHer",
    fullName: "ace4o4/BirthdayHer",
    description:
      "A personal birthday surprise mini-app — animated greeting page with a custom message.",
    url: "https://github.com/ace4o4/BirthdayHer",
    language: "JavaScript",
    stars: 1,
    openIssues: 1,
    createdAt: "2025-08-20",
    updatedAt: "2026-03-13",
    status: "leftover",
    statusNote:
      "One-off personal project. Functional as a static page. Not actively maintained; 1 open issue.",
    tags: ["JavaScript", "Personal", "Static"],
  },
];

export const statusOrder: ProjectStatus[] = [
  "deploy-ready",
  "full-ready",
  "half-ready",
  "in-dev",
  "hackathon",
  "prototype",
  "leftover",
];
