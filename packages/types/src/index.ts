// Core type definitions for Rafael Protocol

// ==================== User & Organization Types ====================

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  plan: Plan;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type Plan = 'starter' | 'growth' | 'enterprise';

export interface OrganizationSettings {
  allowedApps: string[];
  customBranding: boolean;
  ssoEnabled: boolean;
}

// ==================== Application Types ====================

export interface App {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  appKey: string;
  status: AppStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type AppStatus = 'active' | 'inactive' | 'pending';

// ==================== Session & Event Types ====================

export interface Session {
  id: string;
  userId: string;
  appId: string;
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  events: SessionEvent[];
}

export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface SessionEvent {
  id: string;
  sessionId: string;
  type: EventType;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata?: EventMetadata;
}

export type EventType = 
  | 'page_view'
  | 'click'
  | 'input'
  | 'scroll'
  | 'navigation'
  | 'rage_click'
  | 'idle'
  | 'error';

export interface EventMetadata {
  element?: string;
  url?: string;
  selector?: string;
  value?: string;
}

// ==================== Guide Types ====================

export interface Guide {
  id: string;
  appId: string;
  title: string;
  description: string;
  steps: GuideStep[];
  status: GuideStatus;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export type GuideStatus = 'draft' | 'published' | 'archived' | 'needs_review';

export interface GuideStep {
  id: string;
  order: number;
  action: ActionType;
  selector: string;
  description: string;
  expectedResult?: string;
}

export type ActionType = 
  | 'click'
  | 'fill'
  | 'select'
  | 'navigate'
  | 'scroll'
  | 'wait'
  | 'complete';

// ==================== Knowledge Graph Types ====================

export interface CommonPath {
  id: string;
  appId: string;
  fingerprint: string;
  actionSequence: string[];
  urlPattern: string;
  occurrenceCount: number;
  successRate: number;
  lastSeenAt: Date;
}

export interface KnowledgeNode {
  id: string;
  type: 'page' | 'element' | 'action' | 'flow';
  label: string;
  metadata: Record<string, unknown>;
  embeddings?: number[];
}

// ==================== Agent Types ====================

export interface AgentRequest {
  goal: string;
  domSnapshot: SemanticTree;
  sessionId: string;
  userId: string;
  mode: AgentMode;
}

export type AgentMode = 'guide' | 'execute' | 'assist';

export interface AgentResponse {
  runId: string;
  status: AgentStatus;
  summary?: string;
  steps?: ActionResult[];
}

export type AgentStatus = 'running' | 'completed' | 'failed' | 'paused';

export interface ActionResult {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
  success: boolean;
}

// ==================== Semantic Tree Types ====================

export interface SemanticTree {
  url: string;
  title: string;
  timestamp: number;
  elements: SemanticElement[];
}

export interface SemanticElement {
  id: string;
  tag: string;
  role?: string;
  label?: string;
  text?: string;
  placeholder?: string;
  value?: string;
  interactive: boolean;
  children?: string[];
  parent?: string;
}

// ==================== Intent Types ====================

export interface UserIntent {
  sessionId: string;
  state: IntentState;
  confidence: number;
  detectedAt: Date;
}

export type IntentState = 
  | 'confused'
  | 'exploring'
  | 'task_driven'
  | 'idle'
  | 'frustrated';

// ==================== Trigger Types ====================

export interface TriggerTask {
  id: string;
  type: TriggerTaskType;
  status: TriggerTaskStatus;
  payload: unknown;
  result?: unknown;
  startedAt: Date;
  completedAt?: Date;
}

export type TriggerTaskType = 
  | 'agent'
  | 'intent'
  | 'guide_gen'
  | 'audit'
  | 'event_ingest';

export type TriggerTaskStatus = 
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed';

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
