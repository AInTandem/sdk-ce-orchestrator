/**
 * Progress Client
 *
 * High-level API for subscribing to progress updates.
 */

import { WebSocketManager } from './WebSocketManager.js';
import type {
  ProgressEventListener,
  TaskEventListener,
  WorkflowEventListener,
  ContainerEventListener,
  TaskCompletedEvent,
  TaskFailedEvent,
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionFailedEvent,
  EventListener,
} from './events.js';
import { isTaskEvent, isWorkflowEvent, isContainerEvent } from './events.js';

export interface ProgressClientConfig {
  /** WebSocket URL */
  url: string;
  /** Authentication token */
  token?: string;
  /** Auto-connect on creation (default: false) */
  autoConnect?: boolean;
}

export interface ProgressSubscription {
  /** Unsubscribe from progress updates */
  unsubscribe: () => void;
}

export interface TaskProgressOptions {
  /** Project ID */
  projectId: string;
  /** Task ID (optional, subscribe to all tasks if not provided) */
  taskId?: string;
  /** Callback for task events */
  onEvent: TaskEventListener;
  /** Callback on completion (optional) */
  onComplete?: (event: TaskCompletedEvent) => void;
  /** Callback on failure (optional) */
  onFailed?: (event: TaskFailedEvent) => void;
}

export interface WorkflowProgressOptions {
  /** Workflow ID (optional, subscribe to all workflows if not provided) */
  workflowId?: string;
  /** Execution ID (optional, subscribe to all executions if not provided) */
  executionId?: string;
  /** Callback for workflow events */
  onEvent: WorkflowEventListener;
  /** Callback on completion (optional) */
  onComplete?: (event: WorkflowExecutionCompletedEvent) => void;
  /** Callback on failure (optional) */
  onFailed?: (event: WorkflowExecutionFailedEvent) => void;
}

export interface ContainerProgressOptions {
  /** Project ID */
  projectId: string;
  /** Container ID (optional, subscribe to all containers if not provided) */
  containerId?: string;
  /** Callback for container events */
  onEvent: ContainerEventListener;
}

/**
 * Progress Client
 *
 * High-level API for subscribing to progress updates via WebSocket.
 *
 * @example
 * ```typescript
 * const progressClient = new ProgressClient({
 *   url: 'ws://localhost:9900/ws',
 *   token: 'your-jwt-token',
 * });
 *
 * await progressClient.connect();
 *
 * // Subscribe to task progress
 * const subscription = await progressClient.subscribeToTask({
 *   projectId: 'project-123',
 *   taskId: 'task-456',
 *   onEvent: (event) => {
 *     console.log('Task event:', event);
 *   },
 *   onComplete: (event) => {
 *     console.log('Task completed:', event.output);
 *   },
 * });
 *
 * // Unsubscribe when done
 * subscription.unsubscribe();
 * ```
 */
export class ProgressClient {
  private wsManager: WebSocketManager;
  private subscriptions = new Map<string, Set<ProgressEventListener>>();

  constructor(config: ProgressClientConfig) {
    this.wsManager = new WebSocketManager({
      url: config.url,
      token: config.token,
    });

    // Auto-connect if requested
    if (config.autoConnect) {
      this.connect().catch((error) => {
        console.error('[ProgressClient] Auto-connect failed:', error);
      });
    }
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    return this.wsManager.connect();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.wsManager.disconnect();
  }

  /**
   * Check if connected
   *
   * @returns True if connected
   */
  isConnected(): boolean {
    return this.wsManager.isConnected();
  }

  /**
   * Get connection state
   *
   * @returns Current connection state
   */
  getConnectionState(): string {
    return this.wsManager.getState();
  }

  // ========================================================================
  // Progress Subscriptions
  // ========================================================================

  /**
   * Subscribe to task progress
   *
   * @param options - Task progress options
   * @returns Subscription object with unsubscribe method
   */
  async subscribeToTask(options: TaskProgressOptions): Promise<ProgressSubscription> {
    const subscriptionId = `task:${options.projectId}:${options.taskId || '*'}`;

    const listener: ProgressEventListener = (event) => {
      // Filter by project
      if (event.projectId !== options.projectId) {
        return;
      }

      // Filter by task if specified
      if (options.taskId && 'taskId' in event && event.taskId !== options.taskId) {
        return;
      }

      // Type guard for task events
      if (isTaskEvent(event)) {
        options.onEvent(event);

        // Handle completion callbacks
        if (event.type === 'task_completed' && options.onComplete) {
          options.onComplete(event);
        } else if (event.type === 'task_failed' && options.onFailed) {
          options.onFailed(event);
        }
      }
    };

    this.addEventListener(subscriptionId, listener);
    this.wsManager.on('task_queued', listener as EventListener);
    this.wsManager.on('task_started', listener as EventListener);
    this.wsManager.on('step_progress', listener as EventListener);
    this.wsManager.on('task_completed', listener as EventListener);
    this.wsManager.on('task_failed', listener as EventListener);
    this.wsManager.on('task_cancelled', listener as EventListener);

    return {
      unsubscribe: () => {
        this.removeEventListener(subscriptionId, listener);
        this.wsManager.off('task_queued', listener as EventListener);
        this.wsManager.off('task_started', listener as EventListener);
        this.wsManager.off('step_progress', listener as EventListener);
        this.wsManager.off('task_completed', listener as EventListener);
        this.wsManager.off('task_failed', listener as EventListener);
        this.wsManager.off('task_cancelled', listener as EventListener);
      },
    };
  }

  /**
   * Subscribe to workflow progress
   *
   * @param options - Workflow progress options
   * @returns Subscription object with unsubscribe method
   */
  async subscribeToWorkflow(options: WorkflowProgressOptions): Promise<ProgressSubscription> {
    const subscriptionId = `workflow:${options.workflowId || '*'}:${options.executionId || '*'}`;

    const listener: ProgressEventListener = (event) => {
      // Filter by workflow if specified
      if (options.workflowId && 'workflowId' in event && event.workflowId !== options.workflowId) {
        return;
      }

      // Filter by execution if specified
      if (options.executionId && 'executionId' in event && event.executionId !== options.executionId) {
        return;
      }

      // Type guard for workflow events
      if (isWorkflowEvent(event)) {
        options.onEvent(event);

        // Handle completion callbacks
        if (event.type === 'workflow_execution_completed' && options.onComplete) {
          options.onComplete(event);
        } else if (event.type === 'workflow_execution_failed' && options.onFailed) {
          options.onFailed(event);
        }
      }
    };

    this.addEventListener(subscriptionId, listener);
    this.wsManager.on('workflow_execution_created', listener as EventListener);
    this.wsManager.on('workflow_execution_started', listener as EventListener);
    this.wsManager.on('workflow_phase_started', listener as EventListener);
    this.wsManager.on('workflow_phase_completed', listener as EventListener);
    this.wsManager.on('workflow_execution_completed', listener as EventListener);
    this.wsManager.on('workflow_execution_failed', listener as EventListener);
    this.wsManager.on('workflow_execution_paused', listener as EventListener);
    this.wsManager.on('workflow_execution_resumed', listener as EventListener);

    return {
      unsubscribe: () => {
        this.removeEventListener(subscriptionId, listener);
        this.wsManager.off('workflow_execution_created', listener as EventListener);
        this.wsManager.off('workflow_execution_started', listener as EventListener);
        this.wsManager.off('workflow_phase_started', listener as EventListener);
        this.wsManager.off('workflow_phase_completed', listener as EventListener);
        this.wsManager.off('workflow_execution_completed', listener as EventListener);
        this.wsManager.off('workflow_execution_failed', listener as EventListener);
        this.wsManager.off('workflow_execution_paused', listener as EventListener);
        this.wsManager.off('workflow_execution_resumed', listener as EventListener);
      },
    };
  }

  /**
   * Subscribe to container events
   *
   * @param options - Container progress options
   * @returns Subscription object with unsubscribe method
   */
  async subscribeToContainer(options: ContainerProgressOptions): Promise<ProgressSubscription> {
    const subscriptionId = `container:${options.projectId}:${options.containerId || '*'}`;

    const listener: ProgressEventListener = (event) => {
      // Filter by project
      if (event.projectId !== options.projectId) {
        return;
      }

      // Filter by container if specified
      if (options.containerId && 'containerId' in event && event.containerId !== options.containerId) {
        return;
      }

      // Type guard for container events
      if (isContainerEvent(event)) {
        options.onEvent(event);
      }
    };

    this.addEventListener(subscriptionId, listener);
    this.wsManager.on('container_created', listener as EventListener);
    this.wsManager.on('container_started', listener as EventListener);
    this.wsManager.on('container_stopped', listener as EventListener);
    this.wsManager.on('container_error', listener as EventListener);

    return {
      unsubscribe: () => {
        this.removeEventListener(subscriptionId, listener);
        this.wsManager.off('container_created', listener as EventListener);
        this.wsManager.off('container_started', listener as EventListener);
        this.wsManager.off('container_stopped', listener as EventListener);
        this.wsManager.off('container_error', listener as EventListener);
      },
    };
  }

  /**
   * Subscribe to all progress events
   *
   * @param onEvent - Progress event callback
   * @returns Subscription object with unsubscribe method
   */
  async subscribeToProgress(onEvent: ProgressEventListener): Promise<ProgressSubscription> {
    const subscriptionId = `progress:all:${Date.now()}`;

    this.addEventListener(subscriptionId, onEvent);

    // Subscribe to all event types
    const eventTypes: string[] = [
      'task_queued',
      'task_started',
      'step_progress',
      'task_completed',
      'task_failed',
      'task_cancelled',
      'workflow_execution_created',
      'workflow_execution_started',
      'workflow_phase_started',
      'workflow_phase_completed',
      'workflow_execution_completed',
      'workflow_execution_failed',
      'workflow_execution_paused',
      'workflow_execution_resumed',
      'container_created',
      'container_started',
      'container_stopped',
      'container_error',
    ];

    eventTypes.forEach((eventType) => {
      this.wsManager.on(eventType, onEvent as EventListener);
    });

    return {
      unsubscribe: () => {
        this.removeEventListener(subscriptionId, onEvent);
        eventTypes.forEach((eventType) => {
          this.wsManager.off(eventType, onEvent as EventListener);
        });
      },
    };
  }

  // ========================================================================
  // Connection State Listeners
  // ========================================================================

  /**
   * Subscribe to connection state changes
   *
   * @param listener - Connection event listener
   * @returns Unsubscribe function
   */
  onConnectionState(
    listener: (event: import('./events.js').ConnectedEvent | import('./events.js').DisconnectedEvent | import('./events.js').ConnectionErrorEvent) => void
  ): () => void {
    this.wsManager.onConnectionState(listener);

    return () => {
      this.wsManager.offConnectionState(listener);
    };
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  private addEventListener(subscriptionId: string, listener: ProgressEventListener): void {
    if (!this.subscriptions.has(subscriptionId)) {
      this.subscriptions.set(subscriptionId, new Set());
    }
    this.subscriptions.get(subscriptionId)!.add(listener);
  }

  private removeEventListener(subscriptionId: string, listener: ProgressEventListener): void {
    const listeners = this.subscriptions.get(subscriptionId);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.subscriptions.delete(subscriptionId);
      }
    }
  }

  /**
   * Get active subscription count
   *
   * @returns Number of active subscriptions
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}
