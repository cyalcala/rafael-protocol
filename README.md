# 🚀 Rafael Protocol

<p align="center">
  <img src="https://img.shields.io/badge/AI-Native-DAP-6H4FD3?style=for-the-badge" alt="AI-Native DAP">
  <img src="https://img.shields.io/badge/Stack-TypeScript_Bun_Trigger.dev-FF6B6B?style=for-the-badge" alt="Tech Stack">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <strong>AI-Native Digital Adoption Platform</strong> — Built with Claude Agents · TypeScript · Bun · Trigger.dev · Railway · Cloudflare
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [System Flow](#system-flow)
- [Data Pipeline](#data-pipeline)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Rafael Protocol is a **next-generation Digital Adoption Platform (DAP)** built from first principles in 2026. It disrupts traditional solutions like WalkMe by leveraging AI to deliver:

| Traditional DAP            | Rafael Protocol                           |
| -------------------------- | ----------------------------------------- |
| Manual, weeks of authoring | Auto-generated from session data          |
| Constant manual updates    | Self-healing, auto-detects UI changes     |
| Passive tooltips           | **Active execution** — AI does it for you |
| Role-based segments        | Individual + contextual personalization   |
| No intelligence            | Learns from every session                 |
| $100k–$500k/yr             | Disruptive wedge pricing                  |

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Browser["BROWSER (Customer App)"]
        direction TB
        Script["<script src='cdn.rafael.io/dap.min.js' data-app-key='rafael_xxx'></script>"]

        subgraph Snippet["SNIPPET (Shadow DOM)"]
            DOMDistiller["DOMDistiller"]
            CopilotUI["CopilotUI"]
            ActionExecutor["ActionExecutor"]
            EventTracker["EventTracker"]
            RealtimeClient["RealtimeClient"]
        end

        DOMDistiller -->|SemanticTree| CopilotUI
        ActionExecutor -->|executes| DOMDistiller
        EventTracker -->|sends events| RealtimeClient
    end

    subgraph Cloud["CLOUDFLARE"]
        Worker["Worker → serves snippet from R2"]
        R2["R2 Bucket (dap-snippet)"]
    end

    subgraph Railway["RAILWAY"]
        API["Bun + Hono API Server"]
        AgentEndpoint["/api/agent"]
        EventsEndpoint["/api/events"]
        GuidesEndpoint["/api/guides"]
    end

    subgraph Trigger["TRIGGER.DEV CLOUD"]
        AgentTask["agentTask"]
        IntentTask["intentTask"]
        GuideGenTask["guideGenTask"]
        AuditTask["auditTask"]
        EventIngestTask["eventIngestTask"]
    end

    subgraph Data["DATA LAYER"]
        Supabase["Supabase (Postgres)"]
        Redis["Upstash Redis"]
        pgvector["pgvector (Embeddings)"]
    end

    Script -->|GET dap.min.js| Cloud
    Cloud --> R2

    Snippet -->|POST /api/agent| Railway
    Snippet -->|POST /api/events| Railway
    Snippet -->|SSE subscribe| Trigger

    Railway --> AgentEndpoint
    Railway --> EventsEndpoint
    Railway --> GuidesEndpoint

    Railway -->|tasks.trigger| Trigger
    Trigger --> AgentTask
    Trigger --> IntentTask
    Trigger --> GuideGenTask
    Trigger --> AuditTask
    Trigger --> EventIngestTask

    Trigger --> Supabase
    Trigger --> Redis
    Trigger --> pgvector
```

### Hybrid Architecture Model

```mermaid
flowchart LR
    subgraph Lightweight["LIGHTWEIGHT (Cloudflare Edge)"]
        SnippetDel["Snippet delivery (R2)"]
        SessionRout["Session routing & CORS"]
        DurableObj["Durable Objects (future)"]
        AIGateway["AI Gateway (future)"]
    end

    subgraph AlwaysOn["ALWAYS-ON HTTP (Railway)"]
        Validation["Request validation"]
        TaskTrigger["Task triggering"]
        GuideServe["Guide serving"]
        TokenGen["Public token generation"]
    end

    subgraph Heavy["HEAVY COMPUTE (Trigger.dev)"]
        AgentLoop["Claude agent loop"]
        IntentClass["Intent classification"]
        GuideGen["Guide generation"]
        StaleDetect["Stale guide audit"]
        EventProcess["Session event processing"]
    end

    Lightweight --> AlwaysOn --> Heavy
```

---

## 🛠️ Tech Stack

```mermaid
mindmap
  root((Rafael
  Protocol))
    AI Agent
      Claude Sonnet
      Claude Haiku
      Tool-use SDK
    Runtime
      Bun
      TypeScript
    Backend
      Hono
      Railway
    Tasks
      Trigger.dev
      Realtime Streams v2
    CDN
      Cloudflare R2
      Cloudflare Workers
    Database
      Supabase
      PostgreSQL
      pgvector
    Cache
      Upstash Redis
    Observability
      Helicone
      Sentry
```

| Component        | Technology              | Purpose                       |
| ---------------- | ----------------------- | ----------------------------- |
| 🤖 **AI Agent**  | Claude (Anthropic)      | Reasoning & tool execution    |
| ⚡ **Runtime**   | Bun                     | Fast JavaScript runtime       |
| 🖥️ **Backend**   | Hono + Railway          | Always-on API server          |
| ⏱️ **Tasks**     | Trigger.dev             | Durable task execution        |
| 🌐 **CDN**       | Cloudflare R2 + Workers | Global snippet delivery       |
| 💾 **Database**  | Supabase                | Users, orgs, sessions, guides |
| 🧠 **Vector DB** | pgvector                | Knowledge graph embeddings    |
| ⚡ **Cache**     | Upstash Redis           | Context caching               |

---

## ✨ Key Features

### Core Capabilities

```mermaid
flowchart TB
    subgraph Features["Key Features"]
        AutoGen["Auto-Generated Guides"]
        SelfHeal["Self-Healing"]
        ActiveExec["Active Execution"]
        Personalize["Personalization"]
        Knowledge["Knowledge Graph"]
        Realtime["Real-time Streaming"]
    end

    AutoGen -->|Session data| Knowledge
    SelfHeal -->|UI change detection| Knowledge
    ActiveExec -->|Claude tools| Personalize
    Knowledge -->|Path clustering| AutoGen
    Realtime -->|SSE| ActiveExec
```

1. **🤖 Auto-Generated Guides** — No manual authoring needed. AI generates guides from session clusters
2. **🔧 Self-Healing** — Automatically detects UI changes and updates guides
3. **⚡ Active Execution** — AI performs tasks for users, not just shows tooltips
4. **👤 Personalization** — Individual + contextual learning for each user
5. **🧠 Knowledge Graph** — Builds understanding from every session
6. **📡 Real-time Streaming** — Live agent thought process via SSE

### The Intelligence Pipeline

```mermaid
flowchart LR
    A1[Week 1<br/>No knowledge] --> A2[Week 2-4<br/>100+ sessions]
    A2 --> A3[Month 2-3<br/>1000+ sessions]
    A3 --> A4[Month 6+<br/>Data moat]

    A1 -->|70% success| B1[Agent relies on DOM]
    A2 -->|82% success| B2[First guides auto-generated]
    A3 -->|90% success| B3[Knowledge graph populated]
    A4 -->|95% success| B4[Platform knows app better]
```

---

## 🔄 System Flow

### Full Agent Invocation Flow

```mermaid
sequenceDiagram
    participant User
    participant Snippet
    participant Railway
    participant Trigger
    participant Claude

    User->>Snippet: "Create Q1 report"
    Snippet->>Snippet: DOMDistiller.capture()
    Snippet->>Railway: POST /api/agent
    Railway->>Railway: validateAppKey()
    Railway->>Trigger: tasks.trigger("dap-agent-run")
    Trigger->>Claude: Run agent loop
    Claude->>Trigger: Tool calls (stream)
    Trigger->>Snippet: SSE stream events
    Snippet->>Snippet: ActionExecutor.execute()
    Snippet->>User: Display results
```

### Event Ingestion Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Snippet
    participant Railway
    participant Trigger
    participant Supabase

    Browser->>Snippet: User interactions
    Snippet->>Snippet: EventTracker records
    Snippet->>Railway: sendBeacon(/api/events)
    Railway->>Trigger: Queue eventIngestTask
    Trigger->>Supabase: Persist events
    Trigger->>Trigger: Detect rage clicks
    Trigger->>Trigger: Trigger intent classification
```

---

## 📊 Data Pipeline

### Knowledge Graph Formation

```mermaid
flowchart TB
    Session["Session recorded"] --> Extract["Extract successful paths"]
    Extract --> Fingerprint["Path fingerprinting"]
    Fingerprint --> Cluster["Cluster frequency"]
    Cluster --> CommonPath["CommonPath records"]
    CommonPath --> GuideGen["Claude generates Guide"]
    GuideGen --> Validate["Validate & publish"]
    Validate --> Track["Track guide success"]
    Track --> Detect["Detect stale guides"]
    Detect -->| regeneration| GuideGen
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- GitHub account

### Quick Start

```bash
# Clone the repository
git clone https://github.com/cyalcala/rafael-protocol.git

# Navigate to project
cd rafael-protocol

# View the architecture document
cat dap-agent.md

# Check out the initial commit
cat INITIAL.md
```

### Environment Variables

See `dap-agent.md` section 15 for the complete environment variables reference.

```bash
# Required environment variables
ANTHROPIC_API_KEY=sk-ant-...
TRIGGER_SECRET_KEY=tr_prod_...
DATABASE_URL=postgresql://...
```

---

## 📚 Documentation

| File                              | Description                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| 📄 [dap-agent.md](./dap-agent.md) | Master Architecture Document - Complete technical specification |
| 📄 [INITIAL.md](./INITIAL.md)     | Initial commit documentation                                    |
| 📄 [README.md](./README.md)       | This file - Project overview with diagrams                      |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with 🤖 by Claude
- Inspired by [WalkMe](https://www.walkme.com/) - the category leader we're disrupting
- Architecture validated by both Claude and Gemini AI systems

---

<p align="center">
  <strong>The window is open. The models are ready. The market is waiting.</strong>
</p>

---

<p align="center">
  <em>Document compiled: February 2026</em>
</p>
