/**
 * Rafael Protocol - Server
 * Railway Bun/Hono API Server
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', async (c, next) => {
  // Add security headers
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  await next();
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Agent endpoint - receives goals and triggers Trigger.dev task
app.post('/api/agent', async (c) => {
  const appKey = c.req.header('X-App-Key');
  
  if (!appKey) {
    return c.json({ error: 'Missing X-App-Key header' }, 401);
  }

  const body = await c.req.json();
  const { goal, domSnapshot, sessionId, userId, mode } = body;

  if (!goal || !domSnapshot || !sessionId || !userId) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Validate app key (would check against database in production)
  const appId = appKey.replace('rafael_', '');
  
  // TODO: Integrate with Trigger.dev to trigger agent task
  // const run = await tasks.trigger('rafael-agent-run', { ... });

  return c.json({
    runId: `run_${Date.now()}`,
    message: 'Agent task queued'
  });
});

// Intent classification endpoint
app.post('/api/intent', async (c) => {
  const body = await c.req.json();
  const { sessionId, events } = body;

  // TODO: Implement intent classification using Claude Haiku
  // This detects: confused | exploring | task_driven | idle

  return c.json({
    intent: 'task_driven',
    confidence: 0.85
  });
});

// Event ingestion endpoint
app.post('/api/events', async (c) => {
  const appKey = c.req.header('X-App-Key');
  
  if (!appKey) {
    return c.json({ error: 'Missing X-App-Key header' }, 401);
  }

  const body = await c.req.json();
  
  // TODO: Queue event processing via Trigger.dev
  // eventsIngestTask.trigger({ events: body.events, appKey });

  return c.json({ received: true });
});

// Guide serving endpoint
app.get('/api/guides/:appId', async (c) => {
  const appId = c.req.param('appId');
  
  // TODO: Fetch guides from Supabase
  return c.json({ guides: [] });
});

const port = process.env.PORT || 3001;

console.log(`🚀 Rafael Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch
};
