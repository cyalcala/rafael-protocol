# DAP Platform — Master Architecture Document

**AI-Native Digital Adoption Platform**  
*Claude Agents · TypeScript · Bun · Trigger.dev · Railway · Cloudflare*

---

## Preface

This document is the single source of truth for the DAP Platform — a next-generation Digital Adoption Platform built from first principles in 2026. It captures the full conversation arc from problem identification through architecture design, competitive analysis, implementation decisions, and working code scaffolds.

The core thesis: traditional DAPs like WalkMe are pre-AI in their architecture — static, brittle, manually authored, and expensive to maintain. The DAP Platform replaces that entire model with a system that learns from usage, generates its own guides, executes tasks autonomously, and improves over time.

Two independent AI systems — Claude and Gemini — reviewed this architecture and both reached the same conclusion: this is the right stack for the right moment. Their reasoning is documented in full below.

---

## Table of Contents

1. [The Problem Space](#1-the-problem-space)
2. [Competitive Landscape](#2-competitive-landscape)
3. [Architecture Overview](#3-architecture-overview)
4. [Stack Selection Rationale](#4-stack-selection-rationale)
5. [Gemini's Analysis: Validation and Additions](#5-geminis-analysis-validation-and-additions)
6. [The Hybrid Approach: Final Architecture](#6-the-hybrid-approach-final-architecture)
7. [Component Deep Dives](#7-component-deep-dives)
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

### What WalkMe Is

WalkMe is a Digital Adoption Platform — software that sits as an overlay on top of any web app and guides users through it with tooltips, step-by-step walkthroughs, and automation. Enterprises pay $100k–$500k per year so their employees actually use the software they bought (Salesforce, Workday, SAP, etc.).

### Why WalkMe Is Broken

WalkMe's architecture is fundamentally pre-AI:

- **Static and brittle**: A single UX change breaks every walkthrough
- **Manually authored**: Teams spend weeks creating guides that go stale instantly
- **No personalization**: Every user gets the same guide regardless of role, history, or context
- **Zero intelligence**: It doesn't know why a user is stuck — only that they clicked somewhere
- **Passive**: Shows you what to do rather than doing it for you
- **Expensive to maintain**: Constant human upkeep required

SAP acquired WalkMe in 2023 for $1.5 billion. The category is validated and enormous. The product is ripe for disruption.

### The Opportunity

| Dimension | WalkMe | DAP Platform |
|---|---|---|
| Guide creation | Manual, weeks of authoring | Auto-generated from session data |
| Maintenance | Constant manual updates | Self-healing, auto-detects UI changes |
| Interaction model | Passive tooltips | Active execution — AI does it for you |
| Personalization | Role-based segments | Individual + contextual |
| Intelligence | None | Learns from every session |
| Memory | None | Per-user, per-org, per-app |
| Pricing | $100k–500k/yr | Disruptive wedge pricing |
| Moat | Enterprise contracts | Data network effects + knowledge graph |

---

## 2. Competitive Landscape

### Big Tech — Already Moving

**Anthropic (Claude)** launched Claude for Chrome — a browser-based AI agent that maintains context across browsing sessions and takes actions on the user's behalf. Also released Cowork, a desktop agent for non-technical users. This is the same architecture we are building, deployed directly by Anthropic.

**OpenAI** released Operator in early 2025 — a high-reasoning agent designed for deep browser-based automation.

**Google** deployed Gemini in Chrome and released the Gemini 2.5 Computer Use API for third-party agent builders.

**Amazon** announced Nova Act — a toolkit and model for browser-based agents focused on reliability and enterprise use cases.

**Microsoft** integrated similar agentic capabilities into Copilot.

### The Cautionary Tale: Adept AI

Adept AI raised $415 million with the vision of a "natural language interface for everything." They built their own models. In mid-2024, Amazon acqui-hired their co-founders and licensed their technology. The lesson: building your own models was the mistake. Using Claude's API via tool use is the correct approach — you skip to the product layer.

### Well-Funded Startups

- **Perplexity Comet** — full AI-native browser at $200/month. Too much friction for enterprises who won't switch browsers.
- **Strawberry Browser** — SMB-focused companion, $6M seed. No enterprise, no embeddable snippet.
- **Atlassian acquired Dia** for $610M — signals enterprise buyers exist and have budget.
- **CheatLayer (AppSumo)** — the earliest version of this idea. Generates JavaScript to automate browser tasks via natural language. Stayed at SMB/prosumer, no memory layer, no self-healing, $99 lifetime deal pricing. Proved demand, failed to go upmarket.

### The Gap Nobody Has Filled

Nobody has built the **embeddable, enterprise-grade, self-learning, Claude-powered DAP that lives inside existing apps as a JS snippet**. That is the wedge.

The market is validated. The models are mature. The timing — early 2026 — is the window before big players consolidate this space.

---

## 3. Architecture Overview

```
BROWSER (any customer app)
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  <script src="cdn.yourdap.com/dap.min.js"                       │
│          data-app-key="dap_xxx"></script>                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  SNIPPET  (Shadow DOM, fully isolated from host app)       │  │
│  │                                                            │  │
│  │  DOMDistiller    → SemanticTree (5–15kb, not raw HTML)     │  │
│  │  CopilotUI       → chat panel, tooltips, nudges            │  │
│  │  ActionExecutor  → clicks, fills, navigates in live DOM    │  │
│  │  EventTracker    → rage clicks, navigation, idle detect    │  │
│  │  RealtimeClient  → SSE subscription to Trigger.dev         │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
         │ POST /api/agent              │ GET dap.min.js
         │ POST /api/events             │
         ▼                             ▼
┌────────────────────┐      ┌──────────────────────────────────────┐
│  RAILWAY           │      │  CLOUDFLARE                          │
│  Bun + Hono        │      │                                      │
│  Always-on server  │      │  Worker → serves snippet from R2     │
│                    │      │  300+ PoPs, <50ms globally           │
│  /api/agent    ────┼──►   │  Immutable versioned URLs            │
│  /api/intent   ────┼──►   │  Durable Objects (future:            │
│  /api/events   ────┼──►   │    persistent session state)         │
│  /api/guides   ────┼──►   │                                      │
│  Supabase          │      └──────────────────────────────────────┘
└────────┬───────────┘
         │ tasks.trigger()
         │ auth.createPublicToken()
         ▼
┌──────────────────────────────────────────────────────────────────┐
│  TRIGGER.DEV CLOUD                                               │
│                                                                  │
│  agentTask          Claude tool loop, no timeout ceiling         │
│    ├── assembleContext()   user + org + app + knowledge graph    │
│    ├── runAgent()          @dap/agent, pure reasoning package    │
│    └── metadata.stream()  SSE events → snippet in real time     │
│                                                                  │
│  intentTask         Haiku classifier, <2s, triggerAndWait        │
│  guideGenTask       Session clustering + Claude guide gen        │
│  auditTask          Detects stale guides when UI changes         │
│  eventIngestTask    Persists session events to Supabase          │
│                                                                  │
│  nightlyGuideGen    cron: 0 2 * * *  (all active apps)          │
│  hourlyAudit        cron: 0 * * * *  (stale guide detection)     │
└─────────────────────────┬────────────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
     ┌──────────────┐ ┌─────────┐ ┌──────────────────────┐
     │  Supabase    │ │ Upstash │ │  pgvector            │
     │  Postgres    │ │ Redis   │ │  (knowledge graph    │
     │  users, orgs │ │ context │ │   embeddings, RAG    │
     │  sessions    │ │ cache   │ │   over org docs)     │
     │  guides      │ │         │ │                      │
     └──────────────┘ └─────────┘ └──────────────────────┘
```

---

## 4. Stack Selection Rationale

### Why Trigger.dev (Not Vercel Serverless)

The Claude agent loop can run for 30–90 seconds across 10–25 tool calls. Serverless functions time out — most platforms cap at 10–60 seconds. This is a hard architectural incompatibility.

Trigger.dev gives the platform:

- **No timeout ceiling**: Tasks can run for minutes without concern
- **Automatic retry**: If the Anthropic API fails mid-run, the task retries from where it left off
- **Full observability**: Every agent run has a full trace in the Trigger.dev dashboard — every tool call, every result, every error
- **Realtime Streams v2**: The snippet subscribes to a run by ID via SSE. If the connection drops (mobile network switch, tab backgrounded), it auto-resumes from the last received event. No data lost.
- **Scheduled jobs**: Nightly guide generation and hourly audits are native Trigger.dev cron tasks
- **Human-in-the-loop**: `ask_user` tool calls pause the task and wait for frontend response — first-class Trigger.dev pattern

### Why Railway (Not Vercel)

The API server needs to be always-on with zero cold starts. The `/api/agent` endpoint must respond in <200ms (it just fires a Trigger.dev task and returns a token). Railway runs Bun natively via Docker, stays warm permanently, and auto-deploys from GitHub via the `railway.json` config.

### Why Cloudflare R2 + Worker (Not Any Other CDN)

The browser snippet (`dap.min.js`) may be loaded millions of times per day across customer apps worldwide. Cloudflare's 300+ PoP network delivers it from the nearest edge — typically <50ms globally. R2 has zero egress fees. Cloudflare Workers handle versioning, cache control, and CORS. Durable Objects (future roadmap) will provide persistent session state as users navigate between pages.

### Why Bun (Not Node.js)

Single runtime for everything: TypeScript execution without ts-node, snippet bundling without Webpack, testing without Jest config, package management 10–25x faster than npm. The snippet builds to vanilla JS with a single `bun build` command.

### Why Claude (Not Other Models)

The core problem — reasoning about ambiguous DOM state and deciding which of 200 elements to interact with — requires genuine judgment, not pattern matching. Claude's tool-use implementation is mature, reliable, and produces the highest quality reasoning for UI navigation tasks. Claude Haiku handles fast, cheap intent classification. Claude Sonnet handles the agent loop where quality and reasoning depth matter.

---

## 5. Gemini's Analysis: Validation and Additions

Gemini reviewed this architecture independently and provided the following assessment. It is reproduced here in full because it validates the core architectural choices and adds important context around Cloudflare Durable Objects, the CSP problem, and the hybrid execution model.

---

> Building a Digital Adoption Platform (DAP) service using this stack is more than just a "great idea" — it's a highly sophisticated architectural choice that aligns perfectly with the 2026 "Agentic Web" era. By using Claude as your agentic brain and Trigger.dev as the durable spine, you're building a system that doesn't just show tooltips, but actively performs tasks for the user.

### Gemini's Component Breakdown

| Component | Role in DAP | Why It Wins |
|---|---|---|
| Claude Agent | **The Brain.** Analyzes user intent, UI state, and documentation to decide the next step. | Claude's superior reasoning and tool-use SDK make it the best for UI/DOM-heavy tasks. |
| Trigger.dev v3 | **The Nervous System.** Manages long-running workflows, retries, and Human-in-the-Loop approvals. | Essential for background tasks that shouldn't time out (e.g. "Set up my entire CRM profile"). |
| Bun + TypeScript | **The Muscle.** Executes logic with ultra-fast startup times and type safety. | Bun's native speed and fast testing keep the agent responsive. |
| Railway | **The Home Base.** Hosts persistent agent containers and backend services. | Perfect for long-lived Claude agent instances that need a file system or always-on presence. |
| Cloudflare | **The Edge.** Delivers the DAP overlay, handles WebSockets, and manages the AI Gateway. | Durable Objects provide persistent session memory as the user moves between pages. |

### Gemini on "Beyond Static Onboarding"

> Traditional DAPs like WalkMe use static "click here" guides. Your service can be Action-Oriented.
>
> User says: "I want to set up my tax settings."
>
> Claude Agent: Navigates the UI, fills the forms via a Browser Skill, and only asks the user for a signature.

This maps directly to the platform's `execute` mode — where the agent takes over and completes tasks autonomously, only surfacing for confirmation on irreversible actions.

### Gemini on Durable Execution

> If an agent is performing a 5-minute setup and the user closes the tab, Trigger.dev ensures the task continues in the background. When the user logs back in, Cloudflare's Durable Objects can "re-attach" the session and show the completed state.

This is a key product feature: **background completion with session resumption**. The task runs on Trigger.dev regardless of browser state. When the user returns, the Durable Object holds the session state and the copilot shows the completed summary.

### Gemini on Edge-Speed Intelligence

> Using Cloudflare AI Gateway, you can cache common agent responses and set rate limits, ensuring your DAP doesn't become a massive API bill overnight while maintaining sub-millisecond latency for UI triggers.

**Cloudflare AI Gateway** sits between the platform and the Anthropic API. It provides:
- Response caching for identical or semantically similar requests
- Rate limiting per org/app/user
- Cost analytics and budget caps
- Logging and observability independent of Helicone

This is a significant cost control mechanism at scale and should be wired in before enterprise launch.

### Gemini's Pitfall Warnings

**Browser Security / CSP Management**

> Running an agent inside a user's browser requires strict Content Security Policy management. You'll likely need a browser extension or a very sophisticated "Proxy-Mirror" approach to allow Claude to interact with third-party UIs.

This is real. Enterprise apps — especially Salesforce, Workday, SAP — have strict CSP headers that block injected scripts. Mitigations:

1. **CSP allowlisting**: Customers add the DAP CDN domain to their CSP `script-src`. Documented in the onboarding guide.
2. **Shadow DOM isolation**: The snippet uses `attachShadow({ mode: 'closed' })` so styles don't leak, reducing the CSP attack surface.
3. **Browser Extension tier**: For enterprise customers with locked-down CSP, offer a Chrome/Edge extension that operates outside CSP restrictions. This becomes a premium tier feature.
4. **Nonce-based CSP**: Work with customers to inject a nonce into the script tag, satisfying strict CSP policies.

**State Sync**

> Keeping the agent's "understanding" of the UI in sync across Railway (backend) and the user's browser (frontend) can be tricky. Use Trigger.dev Realtime to stream agent thoughts directly to the user's overlay.

This is exactly what the Trigger.dev Realtime Streams v2 integration solves. The agent runs on Trigger.dev infrastructure. Every reasoning step and tool call is streamed as a `StreamEvent` via SSE to the snippet. The snippet executes tool calls in the live DOM and reports results back. The DOM snapshot is re-captured and sent with each `/api/agent` request so the agent always has current page state.

---

## 6. The Hybrid Approach: Final Architecture

Gemini's key recommendation, which aligns precisely with what was designed:

> Don't run the entire agent on the edge.
>
> 1. Cloudflare Workers handle the lightweight UI overlay and session routing.
> 2. Railway hosts the "Heavy" Claude Agent using the Claude Agent SDK, which can perform complex reasoning.
> 3. Trigger.dev orchestrates the "Jobs" (e.g., "Migrate 1000 leads") that the user initiates through the DAP.

The platform already implements exactly this separation:

```
LIGHTWEIGHT (Cloudflare Edge)
├── Snippet delivery (dap.min.js from R2)
├── Session routing and CORS
├── Future: Durable Objects for session state
└── Future: AI Gateway for cost control

ALWAYS-ON HTTP (Railway)
├── Request validation + app key auth
├── Task triggering (tasks.trigger → Trigger.dev)
├── Guide serving (from Supabase cache)
└── Public token generation for SSE subscription

HEAVY COMPUTE (Trigger.dev)
├── Claude agent loop (no timeout, auto-retry)
├── Intent classification (Haiku, fast)
├── Guide generation (Sonnet + session clustering)
├── Stale guide auditing (nightly + hourly)
└── Session event processing (Supabase writes)
```

This hybrid model gives the platform the best of all three: edge speed for delivery, always-on reliability for HTTP, and unlimited compute for AI workloads.

---

## 7. Component Deep Dives

### The Browser Snippet

The snippet is a single JS file (~25–40kb gzipped) that installs into any web app via a script tag. It operates in complete isolation using Shadow DOM — its styles never conflict with the host app, and the host app's styles never break the copilot UI.

**DOMDistiller** converts the live DOM into a compact SemanticTree:

- Queries only interactive and meaningful elements — not raw HTML
- Resolves accessible labels in priority order: `aria-label` → `aria-labelledby` → `<label for="">` → `placeholder` → `textContent` → `title` → `data-testid`
- Strips PII fields (password, SSN, credit card) before the snapshot leaves the browser
- Caps at 200 elements — enough context, not enough noise
- Produces 5–15kb JSON vs 200–2000kb raw HTML

**ActionExecutor** runs Claude's tool calls in the live DOM:

- Finds elements using a 6-strategy cascade (aria-label exact → aria-label partial → text content exact → text content partial → CSS selector → data-testid)
- Dispatches synthetic events compatible with React, Vue, and Angular event listeners
- Types character-by-character with timing delays for framework compatibility
- Scrolls elements into view before interacting
- Enforces external navigation block — only relative paths allowed

**TriggerRealtimeClient** subscribes to agent runs:

- Uses Trigger.dev's SSE endpoint directly — no heavy SDK in the snippet
- Tracks stream index for Streams v2 resumption
- Auto-reconnects on connection drop, resuming from last received event
- Scoped public token (1hr TTL) prevents unauthorized access to other runs

### The Claude Agent (@dap/agent)

Pure TypeScript package. No infrastructure imports. The reasoning core that everything else calls.

**11 browser tools** Claude can call:
`read_page`, `click_element`, `fill_field`, `select_option`, `navigate`, `scroll_to`, `wait_for`, `show_tooltip`, `ask_user`, `complete`, `abort`

**System prompt construction** uses live context:
- Current page URL and title
- App knowledge graph (known paths, success rates)
- User role and onboarding stage
- Org-specific terminology
- Known friction hotspots for this user
- PII field list (excluded from agent actions)

**Confidence thresholds**: If `confidence < 0.7`, the agent calls `ask_user` instead of acting. This prevents confident mistakes on ambiguous UIs.

**Token tracking**: Every agent run tracks total tokens used, reported in the Trigger.dev run metadata. Used for per-org cost accounting.

### Trigger.dev Tasks

**`agentTask`** — The core task. Receives the goal and DOM snapshot, assembles context, opens a Realtime stream, runs the agent loop, streams events to the snippet, returns the final result. No timeout ceiling. Automatic retry on Anthropic API failures. Full trace in Trigger.dev dashboard.

**`intentTask`** — Fast Haiku classifier. Called via `triggerAndWait` from the Railway server so the response comes back inline (<2s). Detects `confused | exploring | task_driven | idle` states. Triggers copilot nudge when friction is detected.

**`guideGenTask`** — Runs nightly per app. Clusters successful session paths by fingerprint (action sequence + URL pattern). Filters clusters with fewer than 5 occurrences. For qualifying clusters, Claude Sonnet generates a titled, described, step-by-step guide. Stores as `draft` status pending admin review.

**`auditTask`** — Runs hourly. Compares guide step selectors against latest DOM snapshots. Flags guides where completion rate has dropped >20% from baseline. Triggers regeneration for stale guides.

**`eventIngestTask`** — Processes batched session events from the snippet (sent via `sendBeacon`). Persists to Supabase. Detects rage click events and triggers intent classification as a side effect.

### The Knowledge Graph

The platform's data moat. Built passively from every user session:

```
Session recorded
      ↓
Successful task paths extracted
      ↓
Paths fingerprinted (action + URL sequences)
      ↓
Cluster frequency tracked across all users
      ↓
Common paths surface as CommonPath records
      ↓
Claude generates Guide from CommonPath
      ↓
Guide validated and published
      ↓
Guide success rate tracked per user
      ↓
Stale guides detected and regenerated
```

Every customer using the same underlying app (e.g. Salesforce) contributes to a shared knowledge graph. After 1000 sessions the platform knows Salesforce better than any individual employee. This is the compounding moat.

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
[3] POST api.yourdap.com/api/agent
    Headers: X-App-Key: dap_xxx
    Body: { goal, domSnapshot, sessionId, userId, mode: "execute" }
                    ↓
[4] Railway server
    - validateAppKey() → { appId, orgId }
    - tasks.trigger("dap-agent-run", payload)
    - auth.createPublicToken({ scopes: { read: [runId] } })
    - return { runId, publicToken }   ← <200ms response
                    ↓
[5] Snippet receives { runId, publicToken }
    - TriggerRealtimeClient.subscribeToStream(runId, publicToken)
    - Connects to Trigger.dev SSE endpoint
    - Streams v2: indexed, auto-resumable
                    ↓
[6] Trigger.dev runs agentTask (parallel to step 5)
    - assembleContext(userId, orgId, appId)
      - Parallel: getUser, getOrg, getApp, getKnowledge, getSessions
      - Upstash Redis cache (5–10min TTL per entity)
    - metadata.set("status", "running_agent")
    - metadata.stream("events") opens SSE channel
                    ↓
[7] Claude Sonnet receives:
    system: [app knowledge, user context, rules, PII list]
    tools:  [11 browser tools]
    user:   "Goal: Create Q1 pipeline report\nDOM: {...}"
                    ↓
[8] Claude responds with tool_use: read_page { focus_area: "navigation" }
    → emit StreamEvent { type: "action", data: { tool: "read_page", ... } }
    → Snippet receives via SSE, calls ActionExecutor.execute()
    → Tool result returned as tool_result in next message
                    ↓
[9] Claude responds with tool_use: click_element { label: "Reports", confidence: 0.95 }
    → StreamEvent streamed
    → Snippet highlights "Reports" nav item, clicks it
    → DOM updates, next snapshot captured
                    ↓
[10] ... (repeats for each step, up to 25 tool calls) ...
                    ↓
[11] Claude calls complete { summary: "Q1 pipeline report created", steps_taken: [...] }
     → StreamEvent { type: "complete", data: { summary: "..." } }
     → Trigger.dev run status: COMPLETED
     → Snippet displays summary, re-enables input
     → TriggerRealtimeClient closes SSE connection
```

### Event Ingestion Flow

```
[Browser] EventTracker records: clicks, navigation, rage clicks, dom changes
          ↓ (every 10s or on visibilitychange/beforeunload)
[Browser] navigator.sendBeacon(POST /api/events, batch)
          ↓
[Railway] validateAppKey() → queue task (fire and forget)
          ↓
[Trigger.dev] eventIngestTask runs async
              - Persist events to Supabase
              - Detect rage clicks → trigger intentTask
              - Update session record
```

---

## 9. The Intelligence Pipeline

### How the Platform Gets Smarter Over Time

```
Week 1: Snippet installed, no knowledge
  → Agent relies entirely on DOM snapshot
  → Success rate: ~70% for common flows

Week 2-4: 100+ sessions recorded
  → First clusters emerge (5+ identical paths)
  → First guides auto-generated (draft status)
  → Admin reviews and publishes guides
  → Intent classifier starts nudging at friction points
  → Success rate: ~82%

Month 2-3: 1000+ sessions
  → Knowledge graph populated with real commonPaths
  → Agent system prompt enriched with known paths
  → Guide library covers 60-70% of common tasks
  → Friction points identified and intervention copy tuned
  → Success rate: ~90%

Month 6+: Data moat established
  → Platform knows the app better than most users
  → New users benefit from accumulated knowledge instantly
  → Stale guide detection catches UI changes within 24h
  → Success rate: ~95%
```

### The Network Effect

Multiple orgs using the same underlying app (Salesforce, HubSpot, Workday) contribute to a shared knowledge graph. An org that installs the snippet on day one of launch benefits from the knowledge accumulated by every previous org on the same app. This creates a compounding advantage over any single-tenant solution.

---

## 10. Infrastructure Blueprint

### Railway Service

```dockerfile
# Multi-stage Bun build
FROM oven/bun:1.1-alpine AS deps     # Install workspace deps
FROM oven/bun:1.1-alpine AS builder  # Build server bundle
FROM oven/bun:1.1-alpine AS runtime  # Minimal production image

# Health check at /health
# Railway injects PORT automatically
# Non-root user for security
```

Configuration via `railway.json`:
```json
{
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "apps/server/Dockerfile" },
  "deploy": {
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### Trigger.dev Deployment

```bash
# Local development
cd trigger && npx trigger.dev@latest dev

# Production deploy
cd trigger && npx trigger.dev@latest deploy --env prod

# CI/CD (GitHub Actions)
TRIGGER_ACCESS_TOKEN=tr_pat_... npx trigger.dev@latest deploy
```

Configuration via `trigger/trigger.config.ts`:
```typescript
export default defineConfig({
  project: "proj_your_ref",
  dirs: ["./tasks"],
  machine: "medium-1x",   // 2 vCPU, 4GB RAM
  maxDuration: 300,        // 5min task ceiling
})
```

### Cloudflare Deployment

```bash
# Upload snippet to R2
wrangler r2 object put dap-snippet/dap.min.js --file dist/dap.min.js

# Deploy Cloudflare Worker
wrangler deploy

# Versioned immutable release
wrangler r2 object put "dap-snippet/versions/1.2.3/dap.min.js" --file dist/dap.min.js
```

Configuration via `apps/snippet/wrangler.toml`:
```toml
name = "dap-cdn"
main = "worker.ts"
routes = [{ pattern = "cdn.yourdap.com/*", zone_name = "yourdap.com" }]

[[r2_buckets]]
binding = "DAP_BUCKET"
bucket_name = "dap-snippet"
```

### CI/CD Pipeline (GitHub Actions)

```
push to main
     ├── typecheck + test (all packages)
     │
     ├── deploy:trigger  → npx trigger.dev@latest deploy
     │     Secrets: TRIGGER_ACCESS_TOKEN, ANTHROPIC_API_KEY
     │
     ├── deploy:cdn      → bun build → wrangler r2 put → wrangler deploy → purge cache
     │     Secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, PURGE_TOKEN
     │
     └── Railway auto-deploys via Git integration
           (no explicit CI step — railway.json + Dockerfile handles it)
```

---

## 11. Code Scaffold Summary

### Monorepo Structure

```
dap-platform/
├── apps/
│   ├── server/
│   │   ├── index.ts              Railway Bun/Hono API server
│   │   ├── Dockerfile            Multi-stage Bun build
│   │   └── package.json
│   └── snippet/
│       ├── index.ts              Browser snippet entry + CopilotUI
│       ├── dom-distiller.ts      DOM → SemanticTree (privacy-first)
│       ├── action-executor.ts    Executes Claude's tool calls in browser
│       ├── worker.ts             Cloudflare Worker (CDN layer)
│       ├── wrangler.toml         Cloudflare config
│       └── package.json          Build + CDN deploy scripts
│
├── packages/
│   ├── types/
│   │   └── index.ts              @dap/types — all interfaces, one file
│   ├── agent/
│   │   └── index.ts              @dap/agent — Claude reasoning core
│   └── context/
│       └── index.ts              @dap/context — context assembly + cache
│
├── trigger/
│   ├── trigger.config.ts         Trigger.dev project config
│   ├── tasks/
│   │   └── agent.task.ts         All task definitions + cron schedules
│   └── package.json
│
├── .github/workflows/
│   └── deploy.yml                Full CI/CD pipeline
│
├── railway.json                  Railway deployment config
├── package.json                  Bun workspace root
├── tsconfig.json                 Strict TypeScript (verbatimModuleSyntax)
└── .env.example                  All required environment variables
```

### Package Dependency Graph

```
@dap/types          ← no dependencies (pure types)
     ↑
@dap/agent          ← @dap/types + @anthropic-ai/sdk
     ↑
@dap/context        ← @dap/types (DB-agnostic interface contracts)
     ↑
@dap/trigger        ← @dap/agent + @dap/context + @dap/types + @trigger.dev/sdk
@dap/server         ← @dap/types + @trigger.dev/sdk + hono
@dap/snippet        ← @dap/types (browser-only, no server imports)
```

### Key Design Decisions in Code

**Why SemanticTree not raw HTML**: Raw HTML is 200–2000kb per page. SemanticTree is 5–15kb. It's structured for reasoning — labels, roles, interactivity explicitly represented. PII stripped at source before leaving the browser.

**Why `schemaTask` with Zod**: Runtime payload validation at task boundary. Catches malformed requests before Claude sees them. Type-safe input schema shared between server (trigger call) and task (run handler).

**Why `auth.createPublicToken` with scoped read access**: The snippet never sees the Trigger.dev secret key. The public token is scoped to read exactly one run, expires in 1 hour. Even if intercepted, it can only read that run's stream.

**Why `metadata.stream()` not custom WebSocket**: Trigger.dev Streams v2 is purpose-built for exactly this pattern — streaming intermediate results from a long-running task to a frontend. Auto-indexing, auto-resumption, built into the SDK.

**Why Shadow DOM (`mode: 'closed'`)**: Complete style isolation. The copilot UI is immune to host app CSS, and host app CSS is immune to copilot styles. Works on Salesforce, Workday, and every other enterprise app regardless of their CSS specificity battles.

---

## 12. Build Sequence

A solo agentic engineer can ship a fundable demo in 12 weeks following this sequence:

**Weeks 1–2: Foundation**
- Monorepo setup (Bun workspaces, tsconfig, shared types)
- Browser snippet: DOM Distiller + Shadow DOM CopilotUI shell
- Railway server: skeleton Hono app with health check deployed

**Weeks 3–4: Agent Loop**
- `@dap/agent` package with all 11 tools defined
- `agentTask` in Trigger.dev with basic streaming
- Snippet's `TriggerRealtimeClient` subscribing to runs
- First end-to-end: user types → Claude reasons → snippet executes

**Weeks 5–6: Action Executor**
- Full `ActionExecutor` with 6-strategy element finder
- Confidence thresholds and `ask_user` pause flow
- Shadow DOM tooltip and highlight overlays
- Test against a real target app (pick Salesforce or HubSpot)

**Weeks 7–8: Intelligence Layer**
- Session event tracking and `eventIngestTask`
- `@dap/context` with real Supabase queries
- Upstash Redis caching layer
- Intent classification and rage click nudging

**Weeks 9–10: Knowledge and Guides**
- Session clustering algorithm
- `guideGenTask` with Claude guide generation
- Admin dashboard (minimal: list guides, approve/reject)
- Nightly cron operational

**Weeks 11–12: Production Ready**
- Cloudflare Worker + R2 for snippet CDN
- GitHub Actions CI/CD pipeline
- Helicone for LLM cost tracking
- Sentry for error tracking
- Audit task for stale guide detection

**The benchmark**: The browser snippet executing one real task autonomously on a real enterprise app is the fundable demo. Everything else is polish.

---

## 13. Pitfalls and Mitigations

### Browser Security (CSP)

**Problem**: Enterprise apps have strict Content Security Policy headers that block injected scripts from unauthorized domains.

**Mitigations**:
1. Customers add `cdn.yourdap.com` to their CSP `script-src` directive (documented onboarding step)
2. Shadow DOM reduces CSP attack surface (styles isolated, no global DOM manipulation)
3. Chrome/Edge extension tier for customers with locked-down CSP (premium feature)
4. Nonce-based CSP compatibility (advanced onboarding path)

### Element Finder Reliability

**Problem**: Enterprise apps (Salesforce, Workday) are built with React/Angular internals where accessible labels are inconsistent, elements are dynamically rendered, and timing matters.

**Mitigations**:
1. 6-strategy element finder cascade (see ActionExecutor)
2. Confidence threshold — agent uses `ask_user` if confidence < 0.7
3. `wait_for` tool handles dynamic content
4. Character-by-character typing for React/Vue event compatibility
5. Synthetic event dispatch (mousedown + mouseup + click) for framework compatibility

### LLM Cost at Scale

**Problem**: Claude Sonnet is not cheap. At enterprise scale with many concurrent agent runs, costs compound quickly.

**Mitigations**:
1. Haiku for intent classification (10x cheaper than Sonnet)
2. Cloudflare AI Gateway for response caching and cost analytics
3. Per-org cost caps and budget alerts via Helicone
4. Confidence thresholds reduce unnecessary tool calls
5. DOM snapshot compression (SemanticTree vs raw HTML) reduces input tokens

### State Sync on Navigation

**Problem**: As the user navigates between pages, the agent's DOM snapshot becomes stale. The agent might try to click an element that no longer exists.

**Mitigations**:
1. `wait_for` tool handles post-navigation loading
2. DOM Distiller re-captures snapshot before each significant action
3. `navigate` tool triggers snapshot refresh in the snippet
4. Agent reads current page state via `read_page` before acting when uncertain

### Guide Staleness

**Problem**: Apps ship UI updates constantly. Guides that worked last week may fail this week.

**Mitigations**:
1. Hourly audit task compares guide selectors against latest DOM snapshots
2. Guides flagged `needs_review` when success rate drops >20%
3. Auto-regeneration triggered for confirmed stale guides
4. Versioned guides — old version archived, not deleted

---

## 14. Market Position

### Go-to-Market Wedge

**Phase 1**: "AI Copilot for Salesforce"
- Free tier: 3 users, auto-generated guides, execute mode
- Single app, deep knowledge, instant value
- Zero setup: one script tag, no manual authoring

**Phase 2**: Expand to HubSpot, Workday, SAP
- Knowledge graphs transfer across orgs on same app
- Cold start problem shrinks with each new installation
- Introduce org-level customization (terminology, SOPs, RAG over docs)

**Phase 3**: "Works on any app" — the full platform
- Compete with WalkMe directly at 1/3 the price
- Enterprise contract tier with SLA, SOC2, data residency options
- Browser extension for CSP-locked environments

### Pricing Strategy

| Tier | Target | Price | Features |
|---|---|---|---|
| Starter | SMB, 1–5 apps | $299/mo | Execute + Guide modes, 3 apps, 10 users |
| Growth | Mid-market | $999/mo | All modes, unlimited apps, 100 users, analytics |
| Enterprise | Large org | $30k+/yr | SOC2, data residency, SLA, browser extension, custom models |

**Comparison**: WalkMe charges $100k–500k/yr for an inferior static product.

### The Moat

1. **Knowledge graphs**: Shared across orgs using same apps. Gets better with every install.
2. **Session data**: The more users the platform sees, the better its guides and friction detection.
3. **Enterprise relationships**: Once embedded in a company's critical apps, high switching cost.
4. **Model fine-tuning** (future): Enough correction data to fine-tune a specialized model for UI navigation.

---

## 15. Environment Variables Reference

```bash
# ── Anthropic ────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...

# ── Trigger.dev ──────────────────────────────────────────────
TRIGGER_SECRET_KEY=tr_prod_...          # Railway server: triggers tasks
TRIGGER_ACCESS_TOKEN=tr_pat_...         # CI/CD: deploy tasks
TRIGGER_PROJECT_REF=proj_...            # trigger.config.ts

# ── Railway (Bun Server) ─────────────────────────────────────
PORT=3001
NODE_ENV=production
ADMIN_SECRET=...                         # /api/admin/* routes

# ── Cloudflare ───────────────────────────────────────────────
CLOUDFLARE_API_TOKEN=...                # wrangler deploy
CLOUDFLARE_ACCOUNT_ID=...              # wrangler deploy
PURGE_TOKEN=...                         # CDN cache purge after deploy

# ── Database (Supabase) ──────────────────────────────────────
DATABASE_URL=postgresql://...
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── Cache (Upstash Redis) ────────────────────────────────────
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# ── Auth (Clerk — dashboard) ─────────────────────────────────
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# ── Observability ────────────────────────────────────────────
HELICONE_API_KEY=...                    # LLM cost + latency per org
SENTRY_DSN=https://...                  # Error tracking (all services)

# ── GitHub Secrets (CI/CD) ───────────────────────────────────
# TRIGGER_ACCESS_TOKEN
# CLOUDFLARE_API_TOKEN
# CLOUDFLARE_ACCOUNT_ID
# ANTHROPIC_API_KEY
# PURGE_TOKEN
```

---

## Closing Note

This platform sits at the intersection of four converging forces in 2026:

1. **Claude's tool-use maturity** — reliable, high-quality reasoning over UI state is now production-ready
2. **Trigger.dev's durable execution** — the infrastructure for long-running AI tasks without timeout anxiety now exists
3. **Enterprise AI readiness** — buyers have AI budgets and mandates; they need help getting employees to use their software
4. **WalkMe's architectural ceiling** — the incumbent cannot retrofit AI onto a static, manually-authored system without rebuilding from scratch

The stack is not novel for novelty's sake. Every component was chosen because it is best-in-class for exactly one job. Trigger.dev for durable compute. Railway for always-on HTTP. Cloudflare for global delivery. Bun for developer velocity. Claude for reasoning. TypeScript for correctness.

Gemini's review confirmed what the architecture already expressed: this is the right system for the right moment.

The window is open. The models are ready. The market is waiting.

---

*Document compiled: February 2026*  
*Stack: Claude Agents · TypeScript · Bun · Trigger.dev · Railway · Cloudflare*  
*Status: Foundation scaffold complete. Next: @dap/db Supabase implementation + admin dashboard.*
