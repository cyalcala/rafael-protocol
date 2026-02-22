Author: Cyrus Alcala

Date: February 22, 2026

Subject: Digital Adoption, Autonomous Labor, and the Triad Intelligence Architecture

Status: Architectural Proposal & Concept Paper

Stack: Claude · Gemini · OpenAI · Kimi · Trigger.dev · Cloudflare · Bun · TypeScript

NOTE - I am planning to add a video ingestion module as well so that the AI can also learn from the videos and do the task for you.

1. Abstract
As software complexity scales, the gap between human intent and interface execution—Interface Friction—has reached a breaking point. Legacy Digital Adoption Platforms (DAPs) rely on static, "brittle" selectors that break during UI updates.

This paper outlines Rafael, a conceptual open-source protocol shifting from passive tooltips to supported execution. By combining a specialized intelligence layer with a durable execution backend, Rafael aims to complete tasks rather than just explaining them.

2. The Observations: The Brittle Selector Problem
In my career as a technical writer, I’ve seen how quickly "how-to" guides become obsolete. Current DAPs fail because they rely on hard-coded CSS paths; when an app like Salesforce or Workday updates its UI, those paths snap.

Furthermore, most DAPs are passive, requiring the user to do the work while reading a prompt. Rafael explores using AI to reason through a SemanticTree—a compact representation of the UI that strips PII and focuses on interactive elements—to act on the user's behalf.

3. The Proposed Logic: Heterogeneous Model Routing
To ensure stability, I propose an architecture that leverages different specialists for specific technical needs:

Logic Reasoning (Claude): Used for high-stakes DOM reasoning and deciding which of many elements to interact with.
Visual Triage (Gemini): Used for sub-second UI perception and visual snapshots to ensure the agent is on the right page.
Code Synthesis (OpenAI): Specifically utilized for generating complex JavaScript "injections" or interpreting legacy code blocks within the app to ensure framework compatibility (React, Vue, etc.).
Knowledge Ingestion (Kimi): Used for processing massive amounts of enterprise documentation to understand business-specific rules.

4. Proposed Infrastructure: The Durable Spine
A major challenge for browser agents is losing progress when a tab is closed. My blueprint uses Durable Execution via Trigger.dev v3 to solve this:

Invincible Tasks: Tasks are fired on a Bun server (Railway), ensuring they run even if the user disconnects.
State Persistence: The task stays "alive" in the cloud, allowing for real-time re-attachment when the user returns.
Edge Delivery: Cloudflare Workers deliver the DAP snippet with sub-50ms global latency, managing session routing at the edge.

5. Economic Impact: Labor-as-a-Service
The shift from legacy DAPs to Rafael is a shift in economics. Instead of paying to learn software (training cost), organizations pay for the completion of tasks (operational saving). By automating the "boring" work of enterprise navigation, Rafael aims to turn the DAP into a labor profit center.

6. Conclusion & Open Invitation
I am a technical writer, not a traditional software engineer. I am approaching this as an architect of information, using my background to define the logic while using AI tools to bridge the coding gap.

I’m sharing the Rafael Protocol as an open-source blueprint because the "Healing Layer" of the web should be transparent. I invite engineers and writers who see the logic in this blueprint to help me turn this "Action Base" into a reality.
