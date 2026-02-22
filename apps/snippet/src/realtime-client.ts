/**
 * Realtime Client
 * Subscribes to Trigger.dev runs via SSE
 */

import type { StreamEvent } from '@rafael/types';

type EventCallback = (event: StreamEvent) => void;

export class RealtimeClient {
  private runId: string;
  private publicToken: string;
  private eventSource: EventSource | null = null;
  private eventHandlers: Map<string, EventCallback[]> = new Map();
  private lastEventIndex = 0;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(runId: string, publicToken: string) {
    this.runId = runId;
    this.publicToken = publicToken;
  }

  /**
   * Connect to the realtime stream
   */
  connect(): void {
    const url = this.getStreamUrl();
    
    this.eventSource = new EventSource(url);
    
    this.eventSource.onopen = () => {
      console.log('[RealtimeClient] Connected to stream');
      this.reconnectAttempts = 0;
    };
    
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        this.handleEvent(data);
      } catch (e) {
        console.error('[RealtimeClient] Failed to parse event:', e);
      }
    };
    
    this.eventSource.onerror = (error) => {
      console.error('[RealtimeClient] Stream error:', error);
      this.handleDisconnect();
    };
  }

  /**
   * Disconnect from the stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Register an event handler
   */
  on(eventType: string, callback: EventCallback): void {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(callback);
    this.eventHandlers.set(eventType, handlers);
  }

  /**
   * Remove an event handler
   */
  off(eventType: string, callback: EventCallback): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get the SSE stream URL
   */
  private getStreamUrl(): string {
    const baseUrl = 'https://cloud.trigger.dev';
    return `${baseUrl}/api/v1/runs/${this.runId}/stream?token=${this.publicToken}`;
  }

  /**
   * Handle incoming events
   */
  private handleEvent(event: StreamEvent): void {
    // Update last event index
    if (event.index !== undefined) {
      this.lastEventIndex = event.index;
    }
    
    // Emit to handlers
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
    
    // Also emit to 'event' catch-all
    const allHandlers = this.eventHandlers.get('event') || [];
    allHandlers.forEach(handler => handler(event));
  }

  /**
   * Handle disconnection and reconnect
   */
  private handleDisconnect(): void {
    this.disconnect();
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`[RealtimeClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('[RealtimeClient] Max reconnection attempts reached');
    }
  }
}
