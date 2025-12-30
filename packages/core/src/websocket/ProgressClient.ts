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
  SandboxEventListener,
  TaskCompletedEvent,
  TaskFailedEvent,
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionFailedEvent,
  EventListener,
} from './events.js';
import { isTaskEvent, isWorkflowEvent, isSandboxEvent } from './events.js';

export interface ProgressClientConfig {
  /** WebSocket base URL (e.g., 'ws://localhost:9900/api/progress/subscribe') */
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
  /** Project ID */
  projectId: string;
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

export interface SandboxProgressOptions {
  /** Project ID */
  projectId: string;
  /** Sandbox ID (optional, subscribe to all sandboxes if not provided) */
  sandboxId?: string;
  /** Callback for sandbox events */
  onEvent: SandboxEventListener;
}

/**
 * Progress Client
 *
 * High-level API for subscribing to progress updates via WebSocket.
 *
 * The Orchestrator API requires a WebSocket URL format of:
 * `/api/progress/subscribe/{projectId}?token={jwt}`
 *
 * @example
 * ```typescript
 * const progressClient = new ProgressClient({
 *   url: 'ws://localhost:9900/api/progress/subscribe',
 *   token: 'your-jwt-token',
 * });
 *
 * // Subscribe to task progress (auto-connects with projectId)
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
  // Map of projectId to WebSocketManager instances
  private wsManagers = new Map<string, WebSocketManager>();
  private subscriptions = new Map<string, Set<ProgressEventListener>>();
  private config: ProgressClientConfig;

  constructor(config: ProgressClientConfig) {
    this.config = config;
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  /**
   * Connect to WebSocket server for a specific project
   *
   * @param projectId - Project ID to connect for
   */
  async connect(projectId: string): Promise<void> {
    let manager = this.wsManagers.get(projectId);

    if (!manager) {
      // Build WebSocket URL with projectId
      const url = `${this.config.url}/${projectId}`;

      manager = new WebSocketManager({
        url,
        token: this.config.token,
      });

      this.wsManagers.set(projectId, manager);
    }

    // Only connect if not already connected
    if (!manager.isConnected()) {
      await manager.connect();
    }
  }

  /**
   * Disconnect from WebSocket server for a specific project
   *
   * @param projectId - Project ID to disconnect from
   */
  disconnect(projectId: string): void {
    const manager = this.wsManagers.get(projectId);
    if (manager) {
      manager.disconnect();
      this.wsManagers.delete(projectId);
    }
  }

  /**
   * Disconnect all WebSocket connections
   */
  disconnectAll(): void {
    for (const [projectId] of this.wsManagers.entries()) {
      this.disconnect(projectId);
    }
  }

  /**
   * Check if connected to a specific project
   *
   * @param projectId - Project ID
   * @returns True if connected
   */
  isConnected(projectId: string): boolean {
    const manager = this.wsManagers.get(projectId);
    return manager ? manager.isConnected() : false;
  }

  /**
   * Get connection state for a specific project
   *
   * @param projectId - Project ID
   * @returns Current connection state
   */
  getConnectionState(projectId: string): string {
    const manager = this.wsManagers.get(projectId);
    return manager ? manager.getState() : 'disconnected';
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
    // Ensure connection exists for this project
    await this.connect(options.projectId);

    const manager = this.wsManagers.get(options.projectId)!;
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
    manager.on('task_queued', listener as EventListener);
    manager.on('task_started', listener as EventListener);
    manager.on('step_progress', listener as EventListener);
    manager.on('output', listener as EventListener);
    manager.on('artifact', listener as EventListener);
    manager.on('task_completed', listener as EventListener);
    manager.on('task_failed', listener as EventListener);
    manager.on('task_cancelled', listener as EventListener);

    return {
      unsubscribe: () => {
        this.removeEventListener(subscriptionId, listener);
        manager.off('task_queued', listener as EventListener);
        manager.off('task_started', listener as EventListener);
        manager.off('step_progress', listener as EventListener);
        manager.off('output', listener as EventListener);
        manager.off('artifact', listener as EventListener);
        manager.off('task_completed', listener as EventListener);
        manager.off('task_failed', listener as EventListener);
        manager.off('task_cancelled', listener as EventListener);
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
    // Ensure connection exists for this project
    await this.connect(options.projectId);

    const manager = this.wsManagers.get(options.projectId)!;
    const subscriptionId = `workflow:${options.projectId}:${options.workflowId || '*'}:${options.executionId || '*'}`;

    const listener: ProgressEventListener = (event) => {
      // Filter by project
      if (event.projectId !== options.projectId) {
        return;
      }

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
    manager.on('workflow_execution_created', listener as EventListener);
    manager.on('workflow_execution_started', listener as EventListener);
    manager.on('workflow_phase_started', listener as EventListener);
    manager.on('workflow_phase_completed', listener as EventListener);
    manager.on('workflow_execution_completed', listener as EventListener);
    manager.on('workflow_execution_failed', listener as EventListener);
    manager.on('workflow_execution_paused', listener as EventListener);
    manager.on('workflow_execution_resumed', listener as EventListener);

    return {
      unsubscribe: () => {
        this.removeEventListener(subscriptionId, listener);
        manager.off('workflow_execution_created', listener as EventListener);
        manager.off('workflow_execution_started', listener as EventListener);
        manager.off('workflow_phase_started', listener as EventListener);
        manager.off('workflow_phase_completed', listener as EventListener);
        manager.off('workflow_execution_completed', listener as EventListener);
        manager.off('workflow_execution_failed', listener as EventListener);
        manager.off('workflow_execution_paused', listener as EventListener);
        manager.off('workflow_execution_resumed', listener as EventListener);
      },
    };
  }

  /**
   * Subscribe to sandbox events
   *
   * @param options - Sandbox progress options
   * @returns Subscription object with unsubscribe method
   */
  async subscribeToSandbox(options: SandboxProgressOptions): Promise<ProgressSubscription> {
    // Ensure connection exists for this project
    await this.connect(options.projectId);

    const manager = this.wsManagers.get(options.projectId)!;
    const subscriptionId = `sandbox:${options.projectId}:${options.sandboxId || '*'}`;

    const listener: ProgressEventListener = (event) => {
      // Filter by project
      if (event.projectId !== options.projectId) {
        return;
      }

      // Filter by sandbox if specified
      // Note: Server may send events with containerId field, handle both for compatibility
      const eventId = (event as any).sandboxId || (event as any).containerId;
      if (options.sandboxId && eventId && eventId !== options.sandboxId) {
        return;
      }

      // Type guard for sandbox events
      if (isSandboxEvent(event)) {
        options.onEvent(event);
      }
    };

    this.addEventListener(subscriptionId, listener);
    // Subscribe to sandbox events from WebSocket
    manager.on('sandbox_created', listener as EventListener);
    manager.on('sandbox_started', listener as EventListener);
    manager.on('sandbox_stopped', listener as EventListener);
    manager.on('sandbox_error', listener as EventListener);

    return {
      unsubscribe: () => {
        this.removeEventListener(subscriptionId, listener);
        manager.off('sandbox_created', listener as EventListener);
        manager.off('sandbox_started', listener as EventListener);
        manager.off('sandbox_stopped', listener as EventListener);
        manager.off('sandbox_error', listener as EventListener);
      },
    };
  }

  /**
   * Subscribe to all progress events for a project
   *
   * @param projectId - Project ID
   * @param onEvent - Progress event callback
   * @returns Subscription object with unsubscribe method
   */
  async subscribeToProgress(
    projectId: string,
    onEvent: ProgressEventListener
  ): Promise<ProgressSubscription> {
    // Ensure connection exists for this project
    await this.connect(projectId);

    const manager = this.wsManagers.get(projectId)!;
    const subscriptionId = `progress:all:${projectId}:${Date.now()}`;

    this.addEventListener(subscriptionId, onEvent);

    // Subscribe to all event types
    const eventTypes: string[] = [
      'task_queued',
      'task_started',
      'step_progress',
      'output',
      'artifact',
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
      'sandbox_created',
      'sandbox_started',
      'sandbox_stopped',
      'sandbox_error',
    ];

    eventTypes.forEach((eventType) => {
      manager.on(eventType, onEvent as EventListener);
    });

    return {
      unsubscribe: () => {
        this.removeEventListener(subscriptionId, onEvent);
        eventTypes.forEach((eventType) => {
          manager.off(eventType, onEvent as EventListener);
        });
      },
    };
  }

  // ========================================================================
  // Connection State Listeners
  // ========================================================================

  /**
   * Subscribe to connection state changes for a project
   *
   * @param projectId - Project ID
   * @param listener - Connection event listener
   * @returns Unsubscribe function
   */
  onConnectionState(
    projectId: string,
    listener: (event: import('./events.js').ConnectedEvent | import('./events.js').DisconnectedEvent | import('./events.js').ConnectionErrorEvent) => void
  ): () => void {
    const manager = this.wsManagers.get(projectId);

    if (manager) {
      manager.onConnectionState(listener);
      return () => {
        manager.offConnectionState(listener);
      };
    }

    // Return no-op if manager doesn't exist yet
    return () => {};
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
