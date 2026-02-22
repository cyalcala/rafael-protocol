/**
 * Rafael Protocol - Browser Snippet
 * Main entry point
 */

import { DOMDistiller } from './dom-distiller';
import { ActionExecutor } from './action-executor';
import { RealtimeClient } from './realtime-client';
import type { SemanticTree, AgentRequest, StreamEvent } from '@rafael/types';

export class RafaelSnippet {
  private appKey: string;
  private sessionId: string;
  private userId: string;
  private domDistiller: DOMDistiller;
  private actionExecutor: ActionExecutor;
  private realtimeClient: RealtimeClient | null = null;
  private shadowRoot: ShadowRoot;

  constructor(config: { appKey: string; userId: string }) {
    this.appKey = config.appKey;
    this.sessionId = this.generateSessionId();
    this.userId = config.userId;
    this.domDistiller = new DOMDistiller();
    this.actionExecutor = new ActionExecutor();
    
    // Create Shadow DOM for isolation
    this.shadowRoot = this.createShadowHost();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createShadowHost(): ShadowRoot {
    const host = document.createElement('div');
    host.id = 'rafael-snippet-host';
    host.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 999999;';
    document.body.appendChild(host);
    return host.attachShadow({ mode: 'closed' });
  }

  /**
   * Capture the current DOM state
   */
  captureDOM(): SemanticTree {
    return this.domDistiller.capture();
  }

  /**
   * Send a goal to the Rafael agent
   */
  async execute(goal: string, mode: 'execute' | 'guide' = 'execute'): Promise<void> {
    const domSnapshot = this.captureDOM();
    
    const request: AgentRequest = {
      goal,
      domSnapshot,
      sessionId: this.sessionId,
      userId: this.userId,
      mode
    };

    // Call the API
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': this.appKey
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Agent request failed: ${response.statusText}`);
    }

    const { runId, publicToken } = await response.json();

    // Connect to realtime stream
    this.realtimeClient = new RealtimeClient(runId, publicToken);
    this.realtimeClient.on('event', (event: StreamEvent) => {
      this.handleStreamEvent(event);
    });
    this.realtimeClient.connect();
  }

  /**
   * Handle events from the agent stream
   */
  private handleStreamEvent(event: StreamEvent): void {
    switch (event.type) {
      case 'action':
        // Execute the tool call in the DOM
        this.actionExecutor.execute(event.data.tool, event.data.params);
        break;
        
      case 'complete':
        this.showCompletion(event.data.summary);
        break;
        
      case 'error':
        this.showError(event.data.message);
        break;
    }
  }

  /**
   * Show completion message
   */
  private showCompletion(summary: string): void {
    this.realtimeClient?.disconnect();
    console.log('[Rafael] Task completed:', summary);
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    console.error('[Rafael] Error:', message);
  }

  /**
   * Track events (clicks, navigation, etc.)
   */
  trackEvent(eventType: string, data: Record<string, unknown>): void {
    // Send events to the server
    navigator.sendBeacon('/api/events', JSON.stringify({
      sessionId: this.sessionId,
      userId: this.userId,
      eventType,
      data,
      timestamp: Date.now()
    }));
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.realtimeClient?.disconnect();
    const host = document.getElementById('rafael-snippet-host');
    host?.remove();
  }
}

// Auto-initialize if data attributes are present
if (typeof window !== 'undefined') {
  (window as any).RafaelSnippet = RafaelSnippet;
}

export { DOMDistiller } from './dom-distiller';
export { ActionExecutor } from './action-executor';
export { RealtimeClient } from './realtime-client';
