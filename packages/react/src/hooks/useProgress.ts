/**
 * Progress Hooks
 *
 * React hooks for real-time progress tracking.
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAInTandem } from '../providers/AInTandemProvider';
import type {
  TaskEvent,
  WorkflowEvent,
  SandboxEvent,
  ProgressEvent,
  TaskCompletedEvent,
  TaskFailedEvent,
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionFailedEvent,
} from '@aintandem/sdk-core';

/**
 * Use Task Progress Hook
 *
 * Subscribes to task progress updates.
 *
 * @param projectId - Project ID
 * @param taskId - Task ID
 *
 * @example
 * ```tsx
 * import { useTaskProgress } from '@aintandem/sdk-react';
 *
 * function TaskMonitor({ projectId, taskId }) {
 *   const { events, isConnected, error } = useTaskProgress(projectId, taskId);
 *
 *   return (
 *     <div>
 *       <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
 *       {events.map((event, i) => (
 *         <div key={i}>{event.type}: {event.message}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTaskProgress(
  projectId: string,
  taskId: string,
  callbacks?: {
    onEvent?: (event: TaskEvent) => void;
    onComplete?: (event: TaskCompletedEvent) => void;
    onFailed?: (event: TaskFailedEvent) => void;
  }
) {
  const { client } = useAInTandem();
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    const subscribe = async () => {
      try {
        const unsubscribe = await client.subscribeToTask(
          projectId,
          taskId,
          (event) => {
            if (!mounted) return;

            setEvents((prev) => [...prev, event]);
            callbacks?.onEvent?.(event);

            if (event.type === 'task_completed') {
              callbacks?.onComplete?.(event);
            } else if (event.type === 'task_failed') {
              callbacks?.onFailed?.(event);
            }
          }
        );

        if (mounted) {
          unsubscribeRef.current = unsubscribe;
          setIsConnected(true);
        }
      } catch (err) {
        console.error('[useTaskProgress] Subscription failed:', err);
      }
    };

    subscribe();

    return () => {
      mounted = false;
      unsubscribeRef.current?.();
    };
  }, [client, projectId, taskId]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    clearEvents,
  };
}

/**
 * Use Workflow Progress Hook
 *
 * Subscribes to workflow execution progress.
 *
 * @param workflowId - Workflow ID
 * @param executionId - Execution ID (optional)
 *
 * @example
 * ```tsx
 * import { useWorkflowProgress } from '@aintandem/sdk-react';
 *
 * function WorkflowMonitor({ workflowId, executionId }) {
 *   const { events, isConnected } = useWorkflowProgress(workflowId, executionId);
 *
 *   return (
 *     <div>
 *       {events.map((event, i) => (
 *         <div key={i}>{event.type}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWorkflowProgress(
  workflowId: string,
  executionId?: string,
  callbacks?: {
    onEvent?: (event: WorkflowEvent) => void;
    onComplete?: (event: WorkflowExecutionCompletedEvent) => void;
    onFailed?: (event: WorkflowExecutionFailedEvent) => void;
  }
) {
  const { client } = useAInTandem();
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    const subscribe = async () => {
      try {
        const unsubscribe = await client.subscribeToWorkflow(
          workflowId,
          (event) => {
            if (!mounted) return;

            setEvents((prev) => [...prev, event]);
            callbacks?.onEvent?.(event);

            if (event.type === 'workflow_execution_completed') {
              callbacks?.onComplete?.(event);
            } else if (event.type === 'workflow_execution_failed') {
              callbacks?.onFailed?.(event);
            }
          },
          executionId
        );

        if (mounted) {
          unsubscribeRef.current = unsubscribe;
          setIsConnected(true);
        }
      } catch (err) {
        console.error('[useWorkflowProgress] Subscription failed:', err);
      }
    };

    subscribe();

    return () => {
      mounted = false;
      unsubscribeRef.current?.();
    };
  }, [client, workflowId, executionId]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    clearEvents,
  };
}

/**
 * Use Container Progress Hook
 *
 * Subscribes to sandbox (container) events.
 *
 * @param projectId - Project ID
 * @param sandboxId - Sandbox ID (optional)
 *
 * @example
 * ```tsx
 * import { useContainerProgress } from '@aintandem/sdk-react';
 *
 * function ContainerMonitor({ projectId, sandboxId }) {
 *   const { events, isConnected } = useContainerProgress(projectId, sandboxId);
 *
 *   return (
 *     <div>
 *       {events.map((event, i) => (
 *         <div key={i}>{event.type}: {event.sandboxId}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useContainerProgress(
  projectId: string,
  sandboxId?: string,
  callback?: (event: SandboxEvent) => void
) {
  const { client } = useAInTandem();
  const [events, setEvents] = useState<SandboxEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    const subscribe = async () => {
      try {
        const unsubscribe = await client.subscribeToSandbox(
          projectId,
          (event) => {
            if (!mounted) return;

            setEvents((prev) => [...prev, event]);
            callback?.(event);
          },
          sandboxId
        );

        if (mounted) {
          unsubscribeRef.current = unsubscribe;
          setIsConnected(true);
        }
      } catch (err) {
        console.error('[useContainerProgress] Subscription failed:', err);
      }
    };

    subscribe();

    return () => {
      mounted = false;
      unsubscribeRef.current?.();
    };
  }, [client, projectId, sandboxId, callback]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    clearEvents,
  };
}

/**
 * Use Progress Hook
 *
 * Subscribes to all progress events for a project.
 *
 * @param projectId - Project ID
 *
 * @example
 * ```tsx
 * import { useProgress } from '@aintandem/sdk-react';
 *
 * function ProjectMonitor({ projectId }) {
 *   const { events, isConnected } = useProgress(projectId);
 *
 *   return (
 *     <div>
 *       <h2>Project Activity</h2>
 *       {events.map((event, i) => (
 *         <div key={i}>{event.type}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProgress(
  projectId: string,
  callback?: (event: ProgressEvent) => void
) {
  const { client } = useAInTandem();
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    const subscribe = async () => {
      try {
        const progress = client.getProgress();

        if (!progress.isConnected(projectId)) {
          await progress.connect(projectId);
        }

        const subscription = await progress.subscribeToProgress(projectId, (event: any) => {
          if (!mounted) return;

          // Filter by project
          if (event.projectId === projectId) {
            setEvents((prev) => [...prev, event]);
            callback?.(event);
          }
        });

        if (mounted) {
          unsubscribeRef.current = subscription.unsubscribe;
          setIsConnected(true);
        }
      } catch (err) {
        console.error('[useProgress] Subscription failed:', err);
      }
    };

    subscribe();

    return () => {
      mounted = false;
      unsubscribeRef.current?.();
    };
  }, [client, projectId, callback]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    clearEvents,
  };
}
