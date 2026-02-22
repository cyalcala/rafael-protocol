/**
 * Rafael Agent
 * Triad Intelligence Core - Claude, Gemini, Kimi orchestration
 */

import type {
  SemanticTree,
  BrowserTool,
  ToolParams,
  StreamEvent,
  AIModel,
  ModelRoute,
  AgentTaskPayload
} from '@rafael/types';

/**
 * Agent configuration
 */
export interface AgentConfig {
  model: AIModel;
  maxTokens: number;
  temperature: number;
  maxSteps: number;
  confidenceThreshold: number;
}

/**
 * Agent step result
 */
export interface AgentStep {
  step: number;
  tool: BrowserTool;
  params: ToolParams;
  result: unknown;
  reasoning: string;
}

/**
 * Agent result
 */
export interface AgentResult {
  success: boolean;
  summary: string;
  steps: AgentStep[];
  totalTokens: number;
}

/**
 * Default agent configuration
 */
const DEFAULT_CONFIG: AgentConfig = {
  model: 'claude-sonnet',
  maxTokens: 4096,
  temperature: 0.7,
  maxSteps: 25,
  confidenceThreshold: 0.7
};

/**
 * Model routing logic
 */
export class ModelRouter {
  /**
   * Route to the best model based on task type
   */
  static route(taskType: string, context: Record<string, unknown> = {}): ModelRoute {
    switch (taskType) {
      case 'complex_reasoning':
      case 'dom_analysis':
        return {
          model: 'claude-sonnet',
          reason: 'Superior judgment for ambiguous UI state',
          estimatedLatency: 2000,
          estimatedCost: 0.015
        };
        
      case 'intent_classification':
      case 'fast_lookup':
        return {
          model: 'claude-haiku',
          reason: '10x cheaper, sub-second classification',
          estimatedLatency: 500,
          estimatedCost: 0.001
        };
        
      case 'visual_analysis':
      case 'screenshot_analysis':
        return {
          model: 'gemini',
          reason: 'Sub-second visual triage',
          estimatedLatency: 1500,
          estimatedCost: 0.010
        };
        
      case 'doc_processing':
      case 'context_loading':
        return {
          model: 'kimi',
          reason: 'Massive context window for docs',
          estimatedLatency: 3000,
          estimatedCost: 0.020
        };
        
      default:
        return {
          model: 'claude-sonnet',
          reason: 'Default to most capable model',
          estimatedLatency: 2000,
          estimatedCost: 0.015
        };
    }
  }
}

/**
 * The main Rafael Agent class
 */
export class RafaelAgent {
  private config: AgentConfig;
  private tools: Map<BrowserTool, (params: ToolParams) => Promise<unknown>>;
  
  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.tools = new Map();
  }
  
  /**
   * Register a tool handler
   */
  registerTool(tool: BrowserTool, handler: (params: ToolParams) => Promise<unknown>): void {
    this.tools.set(tool, handler);
  }
  
  /**
   * Execute an agent task
   */
  async execute(payload: AgentTaskPayload): Promise<AgentResult> {
    const { goal, domSnapshot, maxSteps = this.config.maxSteps } = payload;
    
    const steps: AgentStep[] = [];
    let currentStep = 0;
    let totalTokens = 0;
    
    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(domSnapshot, payload);
    
    // Main agent loop
    while (currentStep < maxSteps) {
      currentStep++;
      
      // Decide which model to use
      const route = ModelRouter.route(
        currentStep === 1 ? 'dom_analysis' : 'complex_reasoning'
      );
      
      // Build the user message with current DOM state
      const userMessage = this.buildUserMessage(goal, domSnapshot, steps);
      
      // Call the AI model (simulated - would integrate with actual APIs)
      const response = await this.callModel(
        route.model,
        systemPrompt,
        userMessage
      );
      
      totalTokens += response.tokens;
      
      // Parse the response for tool calls
      const toolCall = this.parseToolCall(response.content);
      
      if (!toolCall) {
        // No more tools, we're done
        break;
      }
      
      // Execute the tool
      const toolHandler = this.tools.get(toolCall.tool);
      let result: unknown;
      
      if (toolHandler) {
        result = await toolHandler(toolCall.params);
      } else {
        result = { error: `Tool ${toolCall.tool} not registered` };
      }
      
      steps.push({
        step: currentStep,
        tool: toolCall.tool,
        params: toolCall.params,
        result,
        reasoning: response.reasoning
      });
      
      // Check for completion
      if (toolCall.tool === 'complete') {
        return {
          success: true,
          summary: (toolCall.params.summary as string) || 'Task completed',
          steps,
          totalTokens
        };
      }
      
      // Check for abort
      if (toolCall.tool === 'abort') {
        return {
          success: false,
          summary: (toolCall.params.reason as string) || 'Task aborted',
          steps,
          totalTokens
        };
      }
      
      // Check confidence threshold
      const confidence = toolCall.params.confidence || 1;
      if (confidence < this.config.confidenceThreshold) {
        // Need to ask user for clarification
        return {
          success: false,
          summary: 'Confidence too low, human input required',
          steps,
          totalTokens
        };
      }
    }
    
    return {
      success: false,
      summary: 'Max steps reached',
      steps,
      totalTokens
    };
  }
  
  /**
   * Build the system prompt
   */
  private buildSystemPrompt(domSnapshot: SemanticTree, payload: AgentTaskPayload): string {
    return `
You are Rafael, an autonomous agent that helps users accomplish tasks in web applications.

## Your Capabilities
You can perceive and interact with web pages using tools. You don't just point to buttons - you click them. You don't just show users what to do - you do it for them.

## Available Tools
${this.getToolDescriptions()}

## Current Context
- User ID: ${payload.userId}
- Session ID: ${payload.sessionId}
- App ID: ${payload.appId}
- Mode: ${payload.mode}
- Current URL: ${domSnapshot.url}
- Page Title: ${domSnapshot.title}

## Rules
1. Always prioritize user safety - don't perform destructive actions without confirmation
2. If confidence is below ${this.config.confidenceThreshold}, use ask_user tool
3. PII fields (passwords, credit cards, SSN) must never be accessed
4. Work within the current page first before navigating

## Goal
${payload.goal}
`;
  }
  
  /**
   * Get tool descriptions for the prompt
   */
  private getToolDescriptions(): string {
    return `
- read_page: Read the current page content. Use when you need to understand what's on the page.
- click_element: Click an element by label. Requires confidence score.
- fill_field: Fill a form field with text.
- select_option: Select an option from a dropdown.
- navigate: Navigate to a relative path.
- scroll_to: Scroll to an element.
- wait_for: Wait for an element to appear.
- show_tooltip: Show a tooltip to guide the user.
- ask_user: Ask the user a question when you need clarification.
- complete: Signal task completion with a summary.
- abort: Abort the task with a reason.
`;
  }
  
  /**
   * Build the user message
   */
  private buildUserMessage(
    goal: string,
    domSnapshot: SemanticTree,
    previousSteps: AgentStep[]
  ): string {
    const elementList = domSnapshot.elements
      .slice(0, 50)
      .map((el, i) => {
        const label = el.label || el.text || el.placeholder || el.testId || `${el.tag}#${i}`;
        return `${i}. [${el.tag}] "${label}"${el.visible ? '' : ' (hidden)'}`;
      })
      .join('\n');
    
    const history = previousSteps
      .map(s => `- Step ${s.step}: ${s.tool}(${JSON.stringify(s.params)}) → ${JSON.stringify(s.result)}`)
      .join('\n');
    
    return `
## Goal
${goal}

## Current Page Elements
${elementList}

## Previous Steps
${history || 'No steps taken yet'}

## Your Action
Analyze the current state and decide what to do next. Use one of the available tools.
`;
  }
  
  /**
   * Call the AI model (simulated)
   */
  private async callModel(
    model: AIModel,
    systemPrompt: string,
    userMessage: string
  ): Promise<{ content: string; reasoning: string; tokens: number }> {
    // This would integrate with actual AI APIs
    // For now, return a placeholder
    console.log(`[RafaelAgent] Calling model: ${model}`);
    
    return {
      content: JSON.stringify({ tool: 'complete', params: { summary: 'Task completed via agent' } }),
      reasoning: 'Task completed',
      tokens: 500
    };
  }
  
  /**
   * Parse tool call from model response
   */
  private parseToolCall(content: string): { tool: BrowserTool; params: ToolParams } | null {
    try {
      const parsed = JSON.parse(content);
      if (parsed.tool && parsed.params) {
        return {
          tool: parsed.tool as BrowserTool,
          params: parsed.params as ToolParams
        };
      }
    } catch {
      // Not JSON, might be natural language
    }
    return null;
  }
}

/**
 * Create a new agent instance
 */
export function createAgent(config?: Partial<AgentConfig>): RafaelAgent {
  return new RafaelAgent(config);
}

export { ModelRouter };
export type { AgentConfig, AgentStep, AgentResult };
