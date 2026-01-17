/**
 * Tasks Hook
 *
 * React hook for task management with simplified API.
 */

import { useCallback } from 'react';
import { useAInTandem } from '../providers/AInTandemProvider';
import type {
  TaskResponse,
  ExecuteTaskRequest,
  TaskHistoryFilters,
} from '@aintandem/sdk-core';

/**
 * Use Tasks Hook
 *
 * Provides task management functions without state management.
 * This is a simplified API for direct task operations.
 *
 * @example
 * ```tsx
 * import { useTasks } from '@aintandem/sdk-react';
 *
 * function TaskManager() {
 *   const { executeTask, getTask, cancelTask, getTaskHistory } = useTasks();
 *
 *   const handleExecute = async () => {
 *     const task = await executeTask({
 *       projectId: 'proj-1',
 *       task: 'test-task',
 *       input: { data: 'value' },
 *     });
 *   };
 *
 *   return <button onClick={handleExecute}>Execute Task</button>;
 * }
 * ```
 */
export function useTasks() {
  const { client } = useAInTandem();

  const executeTask = useCallback(
    async (request: {
      projectId: string;
      task?: string;
      stepId?: string;
      prompt?: string;
      input?: Record<string, unknown>;
      parameters?: Record<string, unknown>;
    }): Promise<TaskResponse> => {
      const { projectId, task, stepId, prompt, input, parameters } = request;

      // Build the ExecuteTaskRequest based on available parameters
      const taskRequest: ExecuteTaskRequest = {
        stepId: stepId || task || 'default',
        prompt: prompt || JSON.stringify(input || {}),
        parameters: parameters || input,
      };

      return client.tasks.executeTask(projectId, taskRequest);
    },
    [client]
  );

  const getTask = useCallback(
    async (projectId: string, taskId: string): Promise<TaskResponse> => {
      return client.tasks.getTask(projectId, taskId);
    },
    [client]
  );

  const cancelTask = useCallback(
    async (projectId: string, taskId: string): Promise<{ success: boolean; message: string }> => {
      const result = await client.tasks.cancelTask(projectId, taskId);
      return {
        success: true,
        message: result.message || 'Task cancelled',
      };
    },
    [client]
  );

  const getTaskHistory = useCallback(
    async (
      projectId: string,
      filters?: TaskHistoryFilters
    ): Promise<TaskResponse[]> => {
      return client.tasks.listTaskHistory(projectId, filters);
    },
    [client]
  );

  return {
    executeTask,
    getTask,
    cancelTask,
    getTaskHistory,
  };
}
