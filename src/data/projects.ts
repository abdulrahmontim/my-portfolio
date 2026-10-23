export interface Project {
  title: string;
  subtitle?: string;
  description: string;
  bullets: string[];
  stack: string[];
  repoUrl: string;
}

export const projects: Project[] = [
  {
    title: "MeetMind AI Assistant",
    subtitle: "HNG Tech Internship Team Project",
    repoUrl: "https://github.com/hngprojects/meetmind-api",
    description:
      "Collaborated on a real codebase under strict deadlines to build an AI-driven interview platform.",
    bullets: [
      "Wiring up the AI service with multi-LLM fallback logic to prevent system crashes during model outages.",
      "Developing the notification system, chat query, and summary generation logic.",
      "Contributing to real-time audio/video integration (LiveKit) and GitHub OAuth flows.",
    ],
    stack: ["FastAPI", "LiveKit", "OAuth/PKCE", "LLMs"],
  },
  {
    title: "Background Job Scheduler",
    repoUrl: "https://github.com/abdulrahmontim/background_job_scheduler",
    description:
      "A custom background job scheduling system designed to offload heavy processing tasks from the main application thread.",
    bullets: [
      "Architected a robust queueing mechanism for asynchronous task execution.",
      "Implemented state management to track pending, completed, and failed jobs.",
      "Ensured non-blocking operations to maintain high API throughput.",
    ],
    stack: ["Python", "AsyncIO", "Task Queues"],
  },
  {
    title: "Profile Intelligence Platform",
    repoUrl: "https://github.com/abdulrahmontim/profile-intelligence-api",
    description:
      "A unified Django backend serving a REST API, CLI tool, and web app for structured profile data management.",
    bullets: [
      "Architected the core API layer handling data ingestion and querying.",
      "Designed relational database schemas using PostgreSQL.",
      "Secured endpoints using strict JWT authentication and role-based access control.",
    ],
    stack: ["Django", "PostgreSQL", "JWT"],
  },
  {
    title: "CHIP-8 Emulator",
    repoUrl: "https://github.com/abdulrahmontim/CHIP8-emulator",
    description:
      "A C++17 virtual machine emulator designed to execute CHIP-8 ROMs with a fetch-decode-execute CPU, SDL2 graphics and audio, and automated test coverage.",
    bullets: [
      "Implemented all 35 standard CHIP-8 opcodes with a cycle-accurate fetch-decode-execute CPU core.",
      "Engineered SDL2 window rendering at 60 FPS alongside 60Hz delay and sound timers with audio generation.",
      "Built an automated test suite verifying 85+ unit tests across opcodes, CPU reset states, and ROM parsing.",
    ],
    stack: ["C++17", "SDL2", "Emulation"],
  },
  {
    title: "Async HTTP Retry Engine",
    repoUrl: "https://github.com/abdulrahmontim/retry_engine",
    description:
      "A background worker service designed to ensure resilient network requests by handling temporary API failures gracefully.",
    bullets: [
      "Developed an exponential backoff algorithm to space out retries.",
      "Integrated randomized jitter to prevent thundering herd problems on target servers.",
      "Tracked task states persistently using SQLite for fault tolerance.",
    ],
    stack: ["FastAPI", "AsyncIO", "SQLite"],
  },
];
