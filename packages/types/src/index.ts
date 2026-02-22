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
 * AI model types for Quad Intelligence
 */
export type AIModel = 'claude-sonnet' | 'claude-haiku' | 'gemini' | 'kimi' | 'codex';

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

// ============================================
// Video Ingestion Types
// ============================================

/**
 * Video source types
 */
export type VideoSource = 'screen' | 'webcam' | 'file';

/**
 * Video job status
 */
export type VideoJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Video job
 */
export interface VideoJob {
  id: string;
  sessionId: string;
  source: VideoSource;
  fps: number;
  status: VideoJobStatus;
  startedAt: number;
  completedAt?: number;
  frames: number[];
}

/**
 * Video frame
 */
export interface VideoFrame {
  sessionId: string;
  data: string; // Base64 encoded frame
  timestamp: number;
  width?: number;
  height?: number;
}

/**
 * User behavior analysis
 */
export interface UserBehavior {
  mouseMovements: number;
  keyboardActivity: number;
  idleTime: number;
  engagementScore: number;
}

/**
 * Confusion signals
 */
export interface ConfusionSignals {
  repeatedActions: number;
  longPauses: number;
  returningToPrevious: boolean;
  confusionScore: number;
}

/**
 * Video analysis result
 */
export interface VideoAnalysis {
  jobId: string;
  totalFrames: number;
  duration: number;
  behavior: UserBehavior;
  confusionSignals: ConfusionSignals;
  insights: string[];
  completedAt: number;
}

// ============================================
// Human in the Loop Types
// ============================================

/**
 * Human in the Loop mode
 */
export type HoLMode = 'manual' | 'auto' | 'hybrid';

/**
 * Intervention type
 */
export type InterventionType = 
  | 'confirmation'
  | 'permission'
  | 'clarification'
  | 'error_recovery'
  | 'general'
  | 'auto_approved';

/**
 * Intervention status
 */
export type InterventionStatus = 'pending' | 'approved' | 'rejected' | 'timeout';

/**
 * Human intervention
 */
export interface HumanIntervention {
  id: string;
  sessionId: string;
  type: InterventionType;
  reason: string;
  context: Record<string, unknown>;
  options?: string[];
  status: InterventionStatus;
  createdAt: number;
  resolvedAt?: number;
  response?: string;
  timeout?: number;
}

/**
 * Human in the Loop session
 */
export interface HumanInTheLoopSession {
  id: string;
  sessionId: string;
  mode: HoLMode;
  triggerCondition: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  endedAt?: number;
  interventions: HumanIntervention[];
  autoApprove: boolean;
}
