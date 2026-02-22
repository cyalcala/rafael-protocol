/**
 * Rafael Protocol - Type Definitions
 * All interfaces for the Rafael Agentic OS
 */

// ============================================
// Browser Types
// ============================================

/**
 * Semantic representation of a DOM element
 */
export interface SemanticElement {
  tag: string;
  id?: string;
  classes?: string;
  label?: string;
  placeholder?: string;
  text?: string;
  type?: string;
  name?: string;
  value?: string;
  href?: string;
  role?: string;
  testId?: string;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Semantic tree of the viewport
 */
export interface SemanticTree {
  url: string;
  title: string;
  elements: SemanticElement[];
  timestamp: number;
}

// ============================================
// Agent Types
// ============================================

/**
 * Agent execution mode
 */
export type AgentMode = 'execute' | 'guide';

/**
 * Agent request from browser snippet
 */
export interface AgentRequest {
  goal: string;
  domSnapshot: SemanticTree;
  sessionId: string;
  userId: string;
  mode: AgentMode;
}

/**
 * Browser tool definitions
 */
export type BrowserTool = 
  | 'read_page'
  | 'click_element'
  | 'fill_field'
  | 'select_option'
  | 'navigate'
  | 'scroll_to'
  | 'wait_for'
  | 'show_tooltip'
  | 'ask_user'
  | 'complete'
  | 'abort';

/**
 * Tool parameters
 */
export interface ToolParams {
  // Common
  label?: string;
  confidence?: number;
  
  // fill_field
  value?: string;
  
  // select_option
  option?: string;
  
  // navigate
  path?: string;
  
  // scroll_to
  position?: 'top' | 'center' | 'bottom';
  
  // wait_for
  timeout?: number;
  
  // show_tooltip
  message?: string;
  
  // ask_user
  question?: string;
  options?: string[];
  
  // complete
  summary?: string;
  
  // abort
  reason?: string;
}

// ============================================
// Stream Types
// ============================================

/**
 * Stream event types
 */
export type StreamEventType = 
  | 'action'
  | 'complete'
  | 'error'
  | 'ask_user'
  | 'message';

/**
 * Stream event from Trigger.dev
 */
export interface StreamEvent {
  type: StreamEventType;
  index?: number;
  data: Record<string, unknown>;
}

// ============================================
// Intent Classification
// ============================================

/**
 * User intent types
 */
export type UserIntent = 'confused' | 'exploring' | 'task_driven' | 'idle';

/**
 * Intent classification result
 */
export interface IntentClassification {
  intent: UserIntent;
  confidence: number;
  triggers?: string[];
}

// ============================================
// Session & Event Types
// ============================================

/**
 * Session event
 */
export interface SessionEvent {
  sessionId: string;
  userId: string;
  eventType: string;
  data: Record<string, unknown>;
  timestamp: number;
}

/**
 * Session status
 */
export interface Session {
  id: string;
  userId: string;
  appId: string;
  startTime: number;
  endTime?: number;
  events: SessionEvent[];
  status: 'active' | 'completed' | 'abandoned';
}

// ============================================
// Guide Types
// ============================================

/**
 * Auto-generated guide
 */
export interface Guide {
  id: string;
  appId: string;
  title: string;
  description: string;
  steps: GuideStep[];
  status: 'draft' | 'published' | 'stale';
  createdAt: number;
  updatedAt: number;
  successRate?: number;
}

/**
 * Guide step
 */
export interface GuideStep {
  order: number;
  action: BrowserTool;
  params: ToolParams;
  description: string;
  selector?: string;
}

// ============================================
// Knowledge Graph Types
// ============================================

/**
 * Common path in the knowledge graph
 */
export interface CommonPath {
  id: string;
  appId: string;
  actionSequence: string[];
  urlPattern: string;
  frequency: number;
  successRate: number;
}

/**
 * Knowledge graph node
 */
export interface KnowledgeNode {
  id: string;
  type: 'page' | 'element' | 'action';
  data: Record<string, unknown>;
  edges: string[];
}

// ============================================
// App & Org Types
// ============================================

/**
 * Application configuration
 */
export interface App {
  id: string;
  orgId: string;
  name: string;
  url: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

/**
 * Organization
 */
export interface Organization {
  id: string;
  name: string;
  plan: 'starter' | 'growth' | 'enterprise';
  createdAt: number;
}

/**
 * User
 */
export interface User {
  id: string;
  orgId: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: number;
}

// ============================================
// Model Routing Types
// ============================================

/**
 * AI model types for Triad Intelligence
 */
export type AIModel = 'claude-sonnet' | 'claude-haiku' | 'gemini' | 'kimi';

/**
 * Model routing decision
 */
export interface ModelRoute {
  model: AIModel;
  reason: string;
  estimatedLatency: number;
  estimatedCost: number;
}

// ============================================
// Trigger.dev Task Types
// ============================================

/**
 * Agent task payload
 */
export interface AgentTaskPayload {
  runId: string;
  goal: string;
  domSnapshot: SemanticTree;
  sessionId: string;
  userId: string;
  appId: string;
  orgId: string;
  mode: AgentMode;
}

/**
 * Intent classification task payload
 */
export interface IntentTaskPayload {
  sessionId: string;
  events: SessionEvent[];
  appId: string;
}

/**
 * Guide generation task payload
 */
export interface GuideGenTaskPayload {
  appId: string;
  sessionClusterId: string;
}

/**
 * Audit task payload
 */
export interface AuditTaskPayload {
  guideId: string;
  appId: string;
}

/**
 * Event ingest task payload
 */
export interface EventIngestTaskPayload {
  events: SessionEvent[];
  appId: string;
}
