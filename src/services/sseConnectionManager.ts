/**
 * Manages SSE connections for image generation tasks.
 * Provides proper cleanup and reconnection handling.
 */

interface SSEConnectionCallbacks {
  onMessage: (event: WebhookEvent) => void;
  onError: (error: Event) => void;
}

export interface WebhookEvent {
  internalTaskId: string;
  taskId: string;
  state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
  resultJson?: string;
}

class SSEConnectionManager {
  private connections = new Map<string, EventSource>();
  private reconnectAttempts = new Map<string, number>();
  private maxReconnectAttempts = 3;

  /**
   * Create a new SSE connection for a task.
   */
  connect(
    imageId: string,
    sseUrl: string,
    callbacks: SSEConnectionCallbacks
  ): () => void {
    const fullUrl = `${import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000'}${sseUrl}`;
    console.log('[SSE] Connecting to:', fullUrl, 'for imageId:', imageId);
    const eventSource = new EventSource(fullUrl);

    this.connections.set(imageId, eventSource);

    eventSource.onmessage = (e) => {
      console.log('[SSE] Raw message received:', e.data);
      try {
        const parsed = JSON.parse(e.data);

        // FastAPI wraps responses in a data property, extract it
        const event = (parsed.data ?? parsed) as WebhookEvent;
        console.log('[SSE] Parsed event:', event);
        callbacks.onMessage(event);
      } catch (error) {
        console.error('[SSE] Failed to parse message:', error, 'Raw data:', e.data);
      }
    };

    eventSource.onerror = (error) => {
      const attempts = this.reconnectAttempts.get(imageId) || 0;
      console.error('[SSE] Connection error for imageId:', imageId, 'Attempt:', attempts + 1, '/', this.maxReconnectAttempts, error);

      if (attempts < this.maxReconnectAttempts) {
        this.reconnectAttempts.set(imageId, attempts + 1);
        // Browser will auto-reconnect for transient errors
      } else {
        // Max retries reached, notify and cleanup
        console.error('[SSE] Max retries reached for imageId:', imageId);
        callbacks.onError(error);
        this.disconnect(imageId);
      }
    };

    // Return cleanup function
    return () => this.disconnect(imageId);
  }

  /**
   * Disconnect and cleanup an SSE connection.
   */
  disconnect(imageId: string): void {
    const eventSource = this.connections.get(imageId);
    if (eventSource) {
      eventSource.close();
      this.connections.delete(imageId);
      this.reconnectAttempts.delete(imageId);
    }
  }

  /**
   * Disconnect all active connections.
   */
  disconnectAll(): void {
    this.connections.forEach((_, imageId) => this.disconnect(imageId));
  }

  /**
   * Get count of active connections.
   */
  getActiveCount(): number {
    return this.connections.size;
  }
}

// Singleton instance
export const sseManager = new SSEConnectionManager();
