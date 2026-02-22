/**
 * Agent Task
 * Core task for running the Rafael agent
 */

import { task } from "@trigger.dev/sdk";
import type { AgentTaskPayload } from "@rafael/types";

/**
 * The main agent task - runs the Rafael agent loop
 */
export const agentTask = task({
  id: "rafael-agent-run",
  run: async (payload: AgentTaskPayload, { ctx }) => {
    const { runId, goal, domSnapshot, sessionId, userId, appId, orgId, mode } = payload;
    
    console.log(`[AgentTask] Starting agent run ${runId}`);
    console.log(`[AgentTask] Goal: ${goal}`);
    console.log(`[AgentTask] Mode: ${mode}`);
    
    // Set initial status
    await ctx.metadata.set("status", "running_agent");
    
    // Stream events to the frontend
    await ctx.metadata.stream("events", {
      type: "message",
      data: { message: "Starting agent..." }
    });
    
    try {
      // TODO: Import and use RafaelAgent
      // const agent = createAgent();
      // const result = await agent.execute(payload);
      
      // Simulate agent execution
      await ctx.metadata.stream("events", {
        type: "action",
        data: { tool: "read_page", params: { focus_area: "main" } }
      });
      
      await ctx.metadata.stream("events", {
        type: "complete",
        data: { summary: "Task completed successfully" }
      });
      
      return {
        success: true,
        summary: "Task completed"
      };
    } catch (error) {
      await ctx.metadata.stream("events", {
        type: "error",
        data: { message: error instanceof Error ? error.message : "Unknown error" }
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});

/**
 * Intent classification task
 * Fast classification using Claude Haiku
 */
export const intentTask = task({
  id: "rafael-intent-classify",
  run: async (payload: { sessionId: string; events: unknown[]; appId: string }, { ctx }) => {
    console.log(`[IntentTask] Classifying intent for session ${payload.sessionId}`);
    
    // TODO: Implement intent classification using Claude Haiku
    // Detects: confused | exploring | task_driven | idle
    
    return {
      intent: "task_driven",
      confidence: 0.85
    };
  }
});

/**
 * Guide generation task
 * Auto-generates guides from session clusters
 */
export const guideGenTask = task({
  id: "rafael-guide-gen",
  run: async (payload: { appId: string; sessionClusterId: string }, { ctx }) => {
    console.log(`[GuideGenTask] Generating guide for app ${payload.appId}`);
    
    // TODO: Implement guide generation
    // 1. Cluster successful session paths
    // 2. Filter clusters with < 5 occurrences
    // 3. Use Claude to generate guide
    
    return {
      guideId: `guide_${Date.now()}`,
      status: "draft"
    };
  }
});

/**
 * Audit task
 * Detects stale guides when UI changes
 */
export const auditTask = task({
  id: "rafael-guide-audit",
  run: async (payload: { guideId: string; appId: string }, { ctx }) => {
    console.log(`[AuditTask] Auditing guide ${payload.guideId}`);
    
    // TODO: Compare guide selectors against current DOM
    // Flag if success rate dropped > 20%
    
    return {
      guideId: payload.guideId,
      status: "healthy",
      successRate: 0.85
    };
  }
});

/**
 * Event ingest task
 * Processes batched session events
 */
export const eventIngestTask = task({
  id: "rafael-event-ingest",
  run: async (payload: { events: unknown[]; appId: string }, { ctx }) => {
    console.log(`[EventIngestTask] Processing ${payload.events.length} events`);
    
    // TODO: 
    // 1. Persist events to Supabase
    // 2. Detect rage clicks
    // 3. Trigger intent classification
    
    return {
      processed: payload.events.length
    };
  }
});
