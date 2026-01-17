/**
 * Task Hooks
 *
 * React hooks for task management and execution.
 */

import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAInTandem } from '../providers/AInTandemProvider';
import type {
  TaskResponse,
  ExecuteTaskRequest,
  ExecuteAdhocTaskRequest,
  OperationStatus,
} from '@aintandem/sdk-core';

/**
 * Use Task Hook
 *
 * Fetches and manages a single task.
 *
 * @param projectId - Project ID
 * @param taskId - Task ID
 *
 * @example
 * ```tsx
 * import { useTask } from '@aintandem/sdk-react';
 *
 * function TaskDetail({ projectId, taskId }) {
 *   const { task, loading, error, refresh } = useTask(projectId, taskId);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>Task: {task.task}</h1>
 *       <p>Status: {task.status}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTask(projectId: string, taskId: string) {
  const { client } = useAInTandem();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    client.tasks
      .getTaskStatus(projectId, taskId)
      .then(setTask)
      .catch((err: unknown) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, projectId, taskId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cancel = useCallback(async () => {
    await client.tasks.cancelTask(projectId, taskId);
    await refresh();
  }, [client, projectId, taskId, refresh]);

  return {
    task,
    loading,
    error,
    refresh,
    cancel,
  };
}

/**
 * Use Execute Task Hook
 *
 * Executes a task and tracks its progress.
 *
 * @param projectId - Project ID
 * @param taskName - Task name
 * @param request - Task execution request
 * @param options - Execution options
 *
 * @example
 * ```tsx
 * import { useExecuteTask } from '@aintandem/sdk-react';
 *
 * function TaskExecutor({ projectId }) {
 *   const { execute, task, loading, error } = useExecuteTask(
 *     projectId,
 *     'data-analysis',
 *     { dataset: 'sales-2024' },
 *     { async: true }
 *   );
 *
 *   return (
 *     <div>
 *       <button onClick={execute} disabled={loading}>
 *         {loading ? 'Executing...' : 'Execute Task'}
 *       </button>
 *       {error && <div>Error: {error.message}</div>}
 *       {task && <div>Task ID: {task.id}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useExecuteTask(
  projectId: string,
  stepId: string,
  prompt: string,
  parameters?: Record<string, unknown>
) {
  const { client } = useAInTandem();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.tasks.executeTask(projectId, {
        stepId,
        prompt,
        parameters,
      });
      setTask(result);
      return result;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, projectId, stepId, prompt, parameters]);

  return {
    execute,
    task,
    loading,
    error,
  };
}

/**
 * Use Execute Adhoc Task Hook
 *
 * Executes an adhoc task with a prompt.
 *
 * @param projectId - Project ID
 *
 * @example
 * ```tsx
 * import { useExecuteAdhocTask } from '@aintandem/sdk-react';
 *
 * function AdhocTaskExecutor({ projectId }) {
 *   const [prompt, setPrompt] = useState('');
 *   const { execute, task, loading } = useExecuteAdhocTask(projectId);
 *
 *   const handleSubmit = () => {
 *     execute({ prompt, context: [] });
 *   };
 *
 *   return (
 *     <div>
 *       <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
 *       <button onClick={handleSubmit} disabled={loading}>
 *         Execute
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useExecuteAdhocTask(projectId: string) {
  const { client } = useAInTandem();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (request: ExecuteAdhocTaskRequest) => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.tasks.executeAdhocTask(projectId, request);
        setTask(result);
        return result;
      } catch (err: unknown) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, projectId]
  );

  return {
    execute,
    task,
    loading,
    error,
  };
}

/**
 * Use Task History Hook
 *
 * Fetches task execution history.
 *
 * @param projectId - Project ID
 * @param filters - Optional filters
 *
 * @example
 * ```tsx
 * import { useTaskHistory } from '@aintandem/sdk-react';
 *
 * function TaskHistoryList({ projectId }) {
 *   const { history, loading, refresh } = useTaskHistory(projectId, {
 *     status: 'completed',
 *     limit: 10,
 *   });
 *
 *   return (
 *     <ul>
 *       {history.map((task) => (
 *         <li key={task.id}>{task.task} - {task.status}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useTaskHistory(
  projectId: string,
  filters?: {
    status?: OperationStatus;
    limit?: number;
    offset?: number;
  }
) {
  const { client } = useAInTandem();
  const [history, setHistory] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.tasks.listTaskHistory(projectId, filters);
      setHistory(data);
    } catch (err: unknown) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [client, projectId, filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    history,
    loading,
    error,
    refresh: fetch,
  };
}

/**
 * Use Queue Status Hook
 *
 * Fetches task queue status.
 *
 * @param projectId - Project ID
 *
 * @example
 * ```tsx
 * import { useQueueStatus } from '@aintandem/sdk-react';
 *
 * function QueueMonitor({ projectId }) {
 *   const { status, loading } = useQueueStatus(projectId);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <p>Queued: {status?.queued}</p>
 *       <p>Running: {status?.running}</p>
 *       <p>Completed: {status?.completed}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useQueueStatus(projectId: string) {
  const { client } = useAInTandem();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    client.tasks
      .getQueueStatus(projectId)
      .then(setStatus)
      .catch((err: unknown) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, projectId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    status,
    loading,
    error,
    refresh: fetch,
  };
}
