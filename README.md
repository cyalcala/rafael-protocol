# rafael-protocol
THE RAFAEL PROTOCOL: Healing Software Friction via Multi-Model Agentic Orchestration

Author: Cyrus Alcala

Date: February 22 2026

Subject: Digital Adoption, Autonomous Labor, and the Triad Intelligence Architecture

1. Abstract
The gap between human intent and software execution—defined here as Interface Friction—has reached a breaking point. Legacy Digital Adoption Platforms (DAPs) rely on static, "brittle" selectors that break during UI updates and offer only passive guidance.

This document proposes Rafael: an open-source Agentic OS concept designed to replace passive tooltips with Autonomous Labor. The blueprint outlines a system leveraging a Triad Intelligence (Claude, Gemini, and Kimi) and a Durable Execution spine (Trigger.dev) to create a self-healing layer that performs the work for the user. This is the architectural roadmap for building that system from scratch.


2. The Problem: The Brittle Selector Crisis
The DAP industry is currently built on a fragile foundation. Traditional platforms use static CSS selectors and hard-coded paths to anchor their guides. When an enterprise app (like Salesforce or Workday) updates its UI, these anchors snap, rendering the onboarding library useless and requiring manual rewrites.

Furthermore, traditional DAPs are passive. They require a human to read a tooltip and then perform the action. In an era where AI models can reason through a Document Object Model (DOM), this "middleman" human effort is redundant. We need software that doesn't just point to the button, but clicks it.


3. The Proposed Architecture: Triad Intelligence
To solve this, Rafael is designed around a multi-model architecture. Relying on a single AI provider introduces unacceptable risks regarding latency, cost, and regional outages. The planned system utilizes Heterogeneous Model Routing:

Claude (The Lead Engineer): Targeted for high-stakes DOM reasoning and complex multi-step tool use.

Gemini (The Vision Specialist): Targeted for sub-second UI perception and visual triage.

Kimi (The Context Specialist): Targeted for processing massive enterprise documentation to understand the app's rules.

By routing these models via a gateway (like Cloudflare AI Gateway), the system aims to optimize for the lowest possible latency and highest reasoning uptime.


4. The Execution Spine: Durable Tasks
The greatest challenge for browser-based agents is state synchronization. If a user closes a tab mid-task, a standard agent process dies.

Rafael’s architecture plans to solve this through Durable Execution using Trigger.dev v3:

Server-Side Tasks: When a user requests a complex task, the job is handed off to a backend runtime (Bun hosted on Railway).

Persistent Memory: If the user navigates away or loses connection, the task remains "alive" in the background.

Real-time Re-attachment: When the user returns, the agent re-attaches to the live DOM state.


5. Target Browser Skillset
To interact with the web, the Rafael Agent will require a standardized set of tools to perceive and manipulate the DOM securely. The development roadmap includes building:

Perception: Tools like read_page to capture a semantic tree of the viewport, explicitly stripping Personally Identifiable Information (PII) before data processing.

Interaction: Robust click_element and fill_field tools that use fallback strategies (ARIA labels, text content, test IDs) to survive UI changes.

Orchestration: An ask_user tool acting as a "Human-in-the-Loop" safety valve. If the agent's confidence drops, it must pause and ask the user for clarification.


6. Call to Action: Building in Public
I am a technical writer, not a traditional software engineer. I am writing this protocol because the logic of how we onboard users to software is fundamentally broken, and the tools to fix it—Gemini, Kimi, Claude, Cloudflare Workers, Trigger.dev, and Bun JS—finally exist.

I haven't written a line of production code yet. This document is Day Zero.

I am building Rafael in public because the "Healing Layer" of the web should not be a closed-source black box. If you are an engineer, a designer, or an enterprise architect who sees the logic in this blueprint, I invite you to join me.

Let's build an internet that works for us.
