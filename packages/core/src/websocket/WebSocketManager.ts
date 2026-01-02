/**
 * WebSocket Manager
 *
 * Manages WebSocket connection with auto-reconnect and heartbeat.
 */

import type {
  WSMessage,
  EventListener,
  ConnectionEventListener,
} from './events';
import { ConnectedEvent, DisconnectedEvent, ConnectionErrorEvent } from './events';

export interface WebSocketManagerConfig {
  /** WebSocket URL */
  url: string;
  /** Reconnection enabled (default: true) */
  reconnect?: boolean;
  /** Maximum reconnection attempts (default: 10) */
  maxReconnectAttempts?: number;
  /** Initial reconnection delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Maximum reconnection delay in ms (default: 30000) */
  maxReconnectDelay?: number;
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number;
  /** Connection timeout in ms (default: 10000) */
  connectionTimeout?: number;
  /** Authentication token */
  token?: string;
}

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnecting';

/**
 * WebSocket Manager
 *
 * Manages WebSocket connection with automatic reconnection and heartbeat.
 *
 * @example
 * ```typescript
 * const manager = new WebSocketManager({
 *   url: 'ws://localhost:9900/ws',
 *   token: 'your-jwt-token',
 * });
 *
 * manager.on('connected', (event) => {
 *   console.log('Connected:', event);
 * });
 *
 * manager.on('task_progress', (event) => {
 *   console.log('Task progress:', event);
 * });
 *
 * await manager.connect();
 * ```
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private eventListeners = new Map<string, Set<EventListener>>();
  private connectionStateListeners = new Set<ConnectionEventListener>();
  private manualClose = false;
  private config: Omit<Required<WebSocketManagerConfig>, 'token'> & { token: string | undefined };

  constructor(config: WebSocketManagerConfig) {
    this.config = {
      url: config.url,
      token: config.token ?? undefined,
      reconnect: config.reconnect ?? true,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      reconnectDelay: config.reconnectDelay ?? 1000,
      maxReconnectDelay: config.maxReconnectDelay ?? 30000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      connectionTimeout: config.connectionTimeout ?? 10000,
    };
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  /**
   * Connect to WebSocket server
   *
   * @throws {Error} If connection fails or times out
   */
  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.manualClose = false;
    this.state = 'connecting';
    this.reconnectAttempts = 0;

    return new Promise((resolve, reject) => {
      try {
        // Build URL with auth token if provided
        const url = this.buildWebSocketUrl();
        this.ws = new WebSocket(url);
        this.setupWebSocketHandlers();

        // Set connection timeout
        this.connectionTimeoutTimer = setTimeout(() => {
          if (this.state === 'connecting') {
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, this.config.connectionTimeout);

        // Resolve on first connected event
        const onConnected = () => {
          this.off('connected', onConnected as EventListener);
          resolve();
        };
        this.on('connected', onConnected as EventListener);

        // Reject on error
        const onError = (event: ConnectionErrorEvent) => {
          this.off('error', onError as EventListener);
          reject(new Error(`WebSocket connection failed: ${event.error}`));
        };
        this.on('error', onError as EventListener);
      } catch (error) {
        this.state = 'disconnected';
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.manualClose = true;
    this.state = 'disconnecting';

    // Clear timers
    this.clearTimers();

    // Close WebSocket
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.state = 'disconnected';
    this.emitConnectionEvent({
      type: 'disconnected',
      timestamp: new Date().toISOString(),
      code: 1000,
      reason: 'Client disconnect',
      willReconnect: false,
    });
  }

  /**
   * Reconnect to WebSocket server
   */
  async reconnect(): Promise<void> {
    this.disconnect();
    await this.connect();
  }

  // ========================================================================
  // Event Handling
  // ========================================================================

  /**
   * Subscribe to events
   *
   * @param event - Event type or 'connected'/'disconnected'/'error'
   * @param listener - Event listener callback
   */
  on(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);

    // Special handling for connection state events
    if (event === 'connected' || event === 'disconnected' || event === 'error') {
      this.connectionStateListeners.add(listener as ConnectionEventListener);
    }
  }

  /**
   * Unsubscribe from events
   *
   * @param event - Event type
   * @param listener - Event listener callback
   */
  off(event: string, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }

    // Special handling for connection state events
    if (event === 'connected' || event === 'disconnected' || event === 'error') {
      this.connectionStateListeners.delete(listener as ConnectionEventListener);
    }
  }

  /**
   * Subscribe to connection state events
   *
   * @param listener - Connection event listener callback
   */
  onConnectionState(listener: ConnectionEventListener): void {
    this.connectionStateListeners.add(listener);
  }

  /**
   * Unsubscribe from connection state events
   *
   * @param listener - Connection event listener callback
   */
  offConnectionState(listener: ConnectionEventListener): void {
    this.connectionStateListeners.delete(listener);
  }

  // ========================================================================
  // State Management
  // ========================================================================

  /**
   * Get current connection state
   *
   * @returns Current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   *
   * @returns True if connected
   */
  isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  private buildWebSocketUrl(): string {
    const url = new URL(this.config.url);

    // Add auth token as query parameter if provided
    if (this.config.token) {
      url.searchParams.set('token', this.config.token);
    }

    return url.toString();
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.handleOpen();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    this.ws.onerror = (error: Event) => {
      this.handleError(error);
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.handleClose(event);
    };
  }

  private handleOpen(): void {
    // Clear connection timeout
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }

    this.state = 'connected';
    this.reconnectAttempts = 0;

    // Start heartbeat
    this.startHeartbeat();

    // Emit connected event
    this.emitConnectionEvent({
      type: 'connected',
      timestamp: new Date().toISOString(),
    });

    // Emit to general listeners
    this.emit('connected', {
      type: 'connected',
      timestamp: new Date().toISOString(),
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WSMessage;

      // Handle heartbeat
      if (message.type === 'ping') {
        this.sendPong();
        return;
      }

      if (message.type === 'pong') {
        // Pong received, connection is alive
        return;
      }

      // Emit to listeners
      this.emit(message.type, message);
    } catch (error) {
      console.error('[WebSocketManager] Failed to parse message:', error);
    }
  }

  private handleError(error: Event): void {
    console.error('[WebSocketManager] WebSocket error:', error);

    this.emitConnectionEvent({
      type: 'error',
      timestamp: new Date().toISOString(),
      error: 'WebSocket error',
      willReconnect: this.shouldReconnect(),
    });

    this.emit('error', {
      type: 'error',
      timestamp: new Date().toISOString(),
      error: 'WebSocket error',
      willReconnect: this.shouldReconnect(),
    });
  }

  private handleClose(event: CloseEvent): void {
    this.state = 'disconnected';

    // Clear timers
    this.clearTimers();

    // Emit disconnected event
    this.emitConnectionEvent({
      type: 'disconnected',
      timestamp: new Date().toISOString(),
      code: event.code,
      reason: event.reason,
      willReconnect: this.shouldReconnect(),
    });

    this.emit('disconnected', {
      type: 'disconnected',
      timestamp: new Date().toISOString(),
      code: event.code,
      reason: event.reason,
      willReconnect: this.shouldReconnect(),
    });

    // Attempt reconnection if needed
    if (this.shouldReconnect()) {
      this.scheduleReconnect();
    }
  }

  private shouldReconnect(): boolean {
    return !this.manualClose && this.config.reconnect;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error(
        '[WebSocketManager] Max reconnection attempts reached:',
        this.config.maxReconnectAttempts
      );
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.config.maxReconnectDelay
    );

    console.log(
      `[WebSocketManager] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.config.maxReconnectAttempts})`
    );

    this.state = 'reconnecting';
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocketManager] Reconnection failed:', error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendPing();
      }
    }, this.config.heartbeatInterval);
  }

  private sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
    }
  }

  private sendPong(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
    }
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data as WSMessage);
        } catch (error) {
          console.error(`[WebSocketManager] Error in ${event} listener:`, error);
        }
      });
    }
  }

  private emitConnectionEvent(event: ConnectedEvent | DisconnectedEvent | ConnectionErrorEvent): void {
    this.connectionStateListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[WebSocketManager] Error in connection state listener:', error);
      }
    });
  }
}
