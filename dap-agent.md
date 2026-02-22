# Rafael Protocol — Agentic OS Architecture

**THE RAFAEL PROTOCOL: Healing Software Friction via Multi-Model Agentic Orchestration**

_AI-Native Digital Adoption Platform — Triad Intelligence Architecture_  
_Claude · Gemini · Kimi · Trigger.dev · Bun · Cloudflare_

---

## Preface

This document is the single source of truth for the Rafael Protocol — a next-generation Agentic OS designed to replace passive tooltips with Autonomous Labor. Built from first principles in 2026, it captures the full architectural roadmap for creating a self-healing layer that performs work for users rather than just pointing to buttons.

The core thesis: traditional Digital Adoption Platforms (DAPs) like WalkMe are pre-AI in their architecture — static, brittle, manually authored, and expensive to maintain. Rafael replaces that entire model with a system that learns from usage, generates its own guides, executes tasks autonomously, and improves over time.

The key differentiator: **Triad Intelligence** — a multi-model architecture leveraging Claude, Gemini, and Kimi for heterogeneous model routing that optimizes for latency, cost, and reasoning uptime.

---

## Table of Contents

1. [The Problem Space](#1-the-problem-space)
2. [Rafael Protocol Vision](#2-rafael-protocol-vision)
3. [Triad Intelligence Architecture](#3-triad-intelligence-architecture)
4. [Durable Execution Spine](#4-durable-execution-spine)
5. [Stack Selection Rationale](#5-stack-selection-rationale)
6. [Component Deep Dives](#6-component-deep-dives)
7. [Browser Skillset](#7-browser-skillset)
8. [Data Flow: Request-to-Action](#8-data-flow-request-to-action)
9. [The Intelligence Pipeline](#9-the-intelligence-pipeline)
10. [Infrastructure Blueprint](#10-infrastructure-blueprint)
11. [Code Scaffold Summary](#11-code-scaffold-summary)
12. [Build Sequence](#12-build-sequence)
13. [Pitfalls and Mitigations](#13-pitfalls-and-mitigations)
14. [Market Position](#14-market-position)
15. [Environment Variables Reference](#15-environment-variables-reference)

---

## 1. The Problem Space

### What Traditional DAPs Are

Digital Adoption Platforms like WalkMe sit as an overlay on top of any web app and guide users through it with tooltips, step-by-step walkthroughs, and automation. Enterprises pay $100k–$500k per year so their employees actually use the software they bought (Salesforce, Workday, SAP, etc.).

### The Brittle Selector Crisis

WalkMe's architecture is fundamentally pre-AI:

- **Static and brittle**: A single UX change breaks every walkthrough
- **Manually authored**: Teams spend weeks creating guides that go stale instantly
- **No personalization**: Every user gets the same guide regardless of role, history, or context
- **Zero intelligence**: It doesn't know why a user is stuck — only that they clicked somewhere
- **Passive**: Shows you what to do rather than doing it for you
- **Expensive to maintain**: Constant human upkeep required

SAP acquired WalkMe in 2023 for $1.5 billion. The category is validated and enormous. The product is ripe for disruption.

### The Opportunity

| Dimension         | WalkMe                     | Rafael Protocol                             |
| ----------------- | -------------------------- | ------------------------------------------- |
| Guide creation    | Manual, weeks of authoring | Auto-generated from session data            |
| Maintenance       | Constant manual updates    | Self-healing, auto-detects UI changes       |
| Interaction model | Passive tooltips           | Active execution — AI does it for you       |
| Personalization   | Role-based segments        | Individual + contextual                     |
| Intelligence      | None                       | Learns from every session                   |
| Memory            | None                       | Per-user, per-org, per-app                  |
| AI Architecture   | N/A                        | Triad Intelligence (Claude + Gemini + Kimi) |
| Pricing           | $100k–500k/yr              | Disruptive wedge pricing                    |
| Moat              | Enterprise contracts       | Data network effects + knowledge graph      |

---

## 2. Rafael Protocol Vision

### The Core Innovation: Autonomous Labor

Rafael is designed to replace the "middleman" human effort. In an era where AI models can reason through a Document Object Model (DOM), asking users to read a tooltip and then perform the action is redundant. We need software that doesn't just point to the button — it clicks it.

### Heterogeneous Model Routing

Relying on a single AI provider introduces unacceptable risks regarding latency, cost, and regional outages. Rafael utilizes **Heterogeneous Model Routing**:

- **Claude (The Lead Engineer)**: High-stakes DOM reasoning and complex multi-step tool use
- **Gemini (The Vision Specialist)**: Sub-second UI perception and visual triage
- **Kimi (The Context Specialist)**: Processing massive enterprise documentation to understand the app's rules

By routing these models via a gateway (like Cloudflare AI Gateway), the system optimizes for the lowest possible latency and highest reasoning uptime.

### Durable Execution

The greatest challenge for browser-based agents is state synchronization. If a user closes a tab mid-task, a standard agent process dies. Rafael solves this through **Durable Execution** using Trigger.dev v3:

- **Server-Side Tasks**: When a user requests a complex task, the job is handed off to a backend runtime (Bun hosted on Railway)
- **Persistent Memory**: If the user navigates away or loses connection, the task remains "alive" in the background
- **Real-time Re-attachment**: When the user returns, the agent re-attaches to the live DOM state

---

## 3. Triad Intelligence Architecture

### Why Multi-Model?

The Rafael Protocol rejects single-model dependency. Each AI provider has distinct strengths:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDGATE AI GATEWAY                         │
│         (Rate limiting, caching, cost control)                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │ CLAUDE  │      │ GEMINI  │      │  KIMI  │
   │   ○     │      │   ○     │      │   ○     │
   └────┬────┘      └────┬────┘      └────┬────┘
        │                │                │
        │ Lead Engineer │ Vision Specialist│ Context Specialist
        │ DOM reasoning │ UI perception   │ Doc processing
        │ Multi-step    │ Visual triage   │ Enterprise rules
        │ tool use      │ Sub-second     │ Massive context
        └────────────────┴────────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │   AGENT ORCHESTRATOR   │
              │   (Trigger.dev)        │
              └─────────────────────────┘
```

### Model Selection Criteria

| Task Type                    | Primary Model | Rationale                                |
| ---------------------------- | ------------- | ---------------------------------------- |
| Complex DOM reasoning        | Claude Sonnet | Superior judgment for ambiguous UI state |
| Fast intent classification   | Claude Haiku  | 10x cheaper, sub-second classification   |
| Visual UI analysis           | Gemini        | Sub-second visual triage                 |
| Enterprise doc understanding | Kimi          | Massive context window for docs          |
| High-stakes actions          | Claude        | Confidence threshold enforcement         |

---

## 4. Durable Execution Spine

### Why Trigger.dev (Not Vercel Serverless)

The AI agent loop can run for 30–90 seconds across 10–25 tool calls. Serverless functions time out — most platforms cap at 10–60 seconds. This is a hard architectural incompatibility.

Trigger.dev gives Rafael:

- **No timeout ceiling**: Tasks can run for minutes without concern
- **Automatic retry**: If any AI API fails mid-run, the task retries from where it left off
- **Full observability**: Every agent run has a full trace — every model call, every tool result, every error
- **Realtime Streams**: The browser snippet subscribes to a run via SSE. If the connection drops, it auto-resumes from the last received event
- **Scheduled jobs**: Nightly guide generation and hourly stale guide detection are native cron tasks
- **Human-in-the-loop**: `ask_user` tool calls pause the task and wait for frontend response

### State Persistence

```
User initiates task
       │
       ▼
Task handed to Trigger.dev (runs independently of browser)
       │
       ├── If user closes tab → task continues in background
       │
       ├── If network drops → task continues in background
       │
       └── User returns → agent re-attaches to live DOM state
```

---

## 5. Stack Selection Rationale

### Why Trigger.dev

The Claude/Gemini/Kimi agent loops require unlimited runtime. Serverless functions cannot handle this. Trigger.dev provides:

- No timeout ceiling
- Automatic retry on API failures
- Full observability
- Realtime streaming to frontend
- Scheduled cron jobs
- Human-in-the-loop patterns

### Why Railway

The API server needs to be always-on with zero cold starts. The `/api/agent` endpoint must respond in <200ms (it just fires a Trigger.dev task and returns a token). Railway runs Bun natively, stays warm permanently, and auto-deploys from GitHub.

### Why Cloudflare R2 + Worker

The browser snippet may be loaded millions of times per day. Cloudflare's 300+ PoP network delivers it from the nearest edge — typically <50ms globally. R2 has zero egress fees. Workers handle versioning, cache control, and CORS.

### Why Bun

Single runtime for everything: TypeScript execution without ts-node, snippet bundling without Webpack, testing without Jest config, package management 10–25x faster than npm.

### Why Triad Intelligence (Claude + Gemini + Kimi)

The core problem — reasoning about ambiguous DOM state and deciding which elements to interact with — requires genuine judgment. Claude provides superior reasoning. Gemini provides sub-second visual perception. Kimi provides massive context for enterprise documentation. Together, they provide redundancy and optimization.

---

## 6. Component Deep Dives

### The Browser Snippet

The snippet is a single JS file that installs into any web app via a script tag. It operates in complete isolation using Shadow DOM — its styles never conflict with the host app.

**DOMDistiller** converts the live DOM into a compact SemanticTree:

- Queries only interactive and meaningful elements
- Resolves accessible labels in priority order: `aria-label` → `aria-labelledby` → `<label for="">` → `placeholder` → `textContent` → `title` → `data-testid`
- Strips PII fields before the snapshot leaves the browser
- Caps at 200 elements — enough context, not enough noise
- Produces 5–15kb JSON vs 200–2000kb raw HTML

**ActionExecutor** runs AI tool calls in the live DOM:

- Finds elements using a 6-strategy cascade
- Dispatches synthetic events compatible with React, Vue, and Angular
- Types character-by-character with timing delays
- Scrolls elements into view before interacting

**TriggerRealtimeClient** subscribes to agent runs:

- Uses Trigger.dev's SSE endpoint directly
- Tracks stream index for resumption
- Auto-reconnects on connection drop

### The Rafael Agent

Pure TypeScript package. The reasoning core that calls the Triad Intelligence.

**11 browser tools** the AI can call:
`read_page`, `click_element`, `fill_field`, `select_option`, `navigate`, `scroll_to`, `wait_for`, `show_tooltip`, `ask_user`, `complete`, `abort`

**System prompt construction** uses live context:

- Current page URL and title
- App knowledge graph
- User role and onboarding stage
- Org-specific terminology
- Known friction hotspots
- PII field list

**Confidence thresholds**: If `confidence < 0.7`, the agent calls `ask_user` instead of acting.

---

## 7. Browser Skillset

To interact with the web, the Rafael Agent requires a standardized set of tools:

### Perception

- **`read_page`**: Captures a semantic tree of the viewport, explicitly stripping PII before data processing

### Interaction

- **`click_element`**: Uses fallback strategies (ARIA labels, text content, test IDs) to survive UI changes
- **`fill_field`**: Character-by-character typing with timing delays for framework compatibility
- **`select_option`**: Handles dropdowns and dynamic option lists
- **`navigate`**: Relative path navigation with DOM refresh
- **`scroll_to`**: Ensures elements are in view before interaction

### Orchestration

- **`wait_for`**: Handles dynamic content and post-navigation loading
- **`show_tooltip`**: Displays guidance overlays
- **`ask_user`**: Human-in-the-loop safety valve — pauses and asks for clarification when confidence is low
- **`complete`**: Signals task completion with summary
- **`abort`**: Safely terminates a task

---

## 8. Data Flow: Request-to-Action

### Full Agent Invocation Flow

```
[1] User types: "Create a Q1 pipeline report"
                    ↓
[2] DOMDistiller.capture() → SemanticTree
    - 200 elements max
    - PII fields stripped
    - 5–15kb JSON
                    ↓
[3] POST api.rafael.dev/api/agent
    Headers: X-App-Key: rafael_xxx
    Body: { goal, domSnapshot, sessionId, userId, mode: "execute" }
                    ↓
[4] Railway server
    - validateAppKey() → { appId, orgId }
    - Determine best model (Triad Intelligence routing)
    - tasks.trigger("rafael-agent-run", payload)
    - return { runId, publicToken }   ← <200ms response
                    ↓
[5] Snippet receives { runId, publicToken }
    - TriggerRealtimeClient.subscribeToStream(runId, publicToken)
    - Connects to Trigger.dev SSE endpoint
                    ↓
[6] Trigger.dev runs agentTask
    - Route to appropriate model (Claude/Gemini/Kimi)
    - Assemble context from knowledge graph
    - Stream events to snippet
                    ↓
[7] AI model receives:
    system: [app knowledge, user context, rules, PII list]
    tools: [11 browser tools]
    user: "Goal: Create Q1 pipeline report\nDOM: {...}"
                    ↓
[8-10] AI responds with tool_use → StreamEvent → Snippet executes → Result returned
                    ↓
[11] AI calls complete { summary: "Q1 pipeline report created" }
     → StreamEvent { type: "complete" }
     → Snippet displays summary
```

---

## 9. The Intelligence Pipeline

### How Rafael Gets Smarter

```
Week 1: Snippet installed, no knowledge
  → Agent relies entirely on DOM snapshot
  → Success rate: ~70% for common flows

Week 2-4: 100+ sessions recorded
  → First clusters emerge
  → First guides auto-generated
  → Success rate: ~82%

Month 2-3: 1000+ sessions
  → Knowledge graph populated
  → Agent system prompt enriched
  → Success rate: ~90%

Month 6+: Data moat established
  → Platform knows the app better than most users
  → Success rate: ~95%
```

### Network Effect

Multiple orgs using the same underlying app (Salesforce, HubSpot, Workday) contribute to a shared knowledge graph. This creates a compounding advantage over any single-tenant solution.

---

## 10. Infrastructure Blueprint

### Railway Service

```dockerfile
# Multi-stage Bun build
FROM oven/bun:1.1-alpine AS runtime
# Health check at /health
# Non-root user for security
```

### Trigger.dev Deployment

```bash
cd trigger && npx trigger.dev@latest deploy --env prod
```

### Cloudflare Deployment

```bash
wrangler r2 object put dap-snippet/rafael.min.js --file dist/rafael.min.js
wrangler deploy
```

---

## 11. Code Scaffold Summary

### Monorepo Structure

```
rafael-protocol/
├── apps/
│   ├── server/           # Railway Bun/Hono API
│   └── snippet/          # Browser snippet
├── packages/
│   ├── types/            # @rafael/types
│   ├── agent/            # @rafael/agent — Triad Intelligence core
│   └── context/          # @rafael/context
├── trigger/
│   └── tasks/           # Trigger.dev tasks
├── .github/workflows/
└── package.json          # Bun workspace root
```

---

## 12. Build Sequence

**Weeks 1–2**: Foundation — Monorepo, snippet shell, Railway deployment

**Weeks 3–4**: Agent Loop — Triad Intelligence routing, Trigger.dev integration

**Weeks 5–6**: Action Executor — Element finder, confidence thresholds

**Weeks 7–8**: Intelligence Layer — Session tracking, intent classification

**Weeks 9–10**: Knowledge and Guides — Auto-generation, admin dashboard

**Weeks 11–12**: Production Ready — CDN, CI/CD, observability

---

## 13. Pitfalls and Mitigations

### Browser Security (CSP)

- CSP allowlisting documentation
- Shadow DOM isolation
- Chrome extension tier for locked-down CSP

### Element Finder Reliability

- 6-strategy cascade
- Confidence thresholds
- `wait_for` for dynamic content

### Multi-Model Cost at Scale

- Route cheap tasks to Haiku
- Cloudflare AI Gateway for caching
- Per-org cost caps

### State Sync on Navigation

- DOM re-capture before actions
- `wait_for` post-navigation

---

## 14. Market Position

### Go-to-Market

**Phase 1**: "AI Copilot for Salesforce" — Free tier, single app, zero setup

**Phase 2**: Expand to HubSpot, Workday, SAP

**Phase 3**: "Works on any app" — Full platform, compete with WalkMe

### Pricing

| Tier       | Target     | Price    |
| ---------- | ---------- | -------- |
| Starter    | SMB        | $299/mo  |
| Growth     | Mid-market | $999/mo  |
| Enterprise | Large org  | $30k+/yr |

---

## 15. Environment Variables Reference

```bash
# ── Anthropic ────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ── Google ───────────────────────────────────────────────────
GEMINI_API_KEY=...

# ── Moonshot (Kimi) ─────────────────────────────────────────
KIMI_API_KEY=...

# ── Trigger.dev ──────────────────────────────────────────────
TRIGGER_SECRET_KEY=tr_prod_...
TRIGGER_ACCESS_TOKEN=tr_pat_...
TRIGGER_PROJECT_REF=proj_...

# ── Railway ─────────────────────────────────────────────────
PORT=3001
NODE_ENV=production

# ── Cloudflare ───────────────────────────────────────────────
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...

# ── Database (Supabase) ──────────────────────────────────────
DATABASE_URL=postgresql://...

# ── Cache (Upstash) ─────────────────────────────────────────
UPSTASH_REDIS_URL=https://...

# ── Observability ───────────────────────────────────────────
HELICONE_API_KEY=...
SENTRY_DSN=https://...
```

---

## Closing Note

Rafael Protocol sits at the intersection of four converging forces in 2026:

1. **Multi-model AI maturity** — Claude, Gemini, and Kimi provide diverse, redundant intelligence
2. **Durable execution infrastructure** — Trigger.dev enables long-running AI tasks without timeout anxiety
3. **Enterprise AI readiness** — Buyers have AI budgets and mandates
4. **Legacy DAP architectural ceiling** — The incumbent cannot retrofit AI onto a static system

The window is open. The models are ready. The market is waiting.

**Let's build an internet that works for us.**

---

_Document: Rafael Protocol — Agentic OS Architecture_  
_Author: Cyrus Alcala_  
_Date: February 22 2026_  
_Stack: Claude · Gemini · Kimi · Trigger.dev · Bun · Cloudflare_  
_Status: Day Zero — Building in Public_
