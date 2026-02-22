import { Hono } from 'hono';

const app = new Hono();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Agent API endpoint
app.post('/api/agent', async (c) => {
  const body = await c.req.json();
  
  // TODO: Implement agent logic with Trigger.dev
  return c.json({
    success: true,
    data: {
      runId: crypto.randomUUID(),
      status: 'running',
    },
  });
});

// Events API endpoint
app.post('/api/events', async (c) => {
  const body = await c.req.json();
  
  // TODO: Implement event ingestion
  return c.json({ success: true });
});

// Guides API endpoint
app.get('/api/guides', async (c) => {
  // TODO: Return guides from database
  return c.json({
    success: true,
    data: [],
  });
});

export default app;
