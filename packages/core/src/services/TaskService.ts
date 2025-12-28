/**
 * Task Service
 *
 * Manages task execution and task history.
 */

import type {
  ExecuteTaskRequest,
  ExecuteAdhocTaskRequest,
  TaskResponse,
  TaskCancellationResponse,
  TaskContextResponse,
  TaskLimitResponse,
  SetTaskLimitRequest,
  SaveTaskOutputRequest,
  SaveTaskOutputResponse,
  CaptureTaskDialogRequest,
  UpdateStepStatusRequest,
  AsyncOperationResponse,
  OperationStatus,
} from '../types/generated/index.js';
import { HttpClient } from '../client/HttpClient.js';

/**
 * Task Service
 *
 * Provides methods for executing tasks and managing task history.
 *
 * @example
 * ```typescript
 * const taskService = new TaskService(httpClient);
 *
 * // Execute a task
 * const task = await taskService.executeTask({
 *   projectId: 'project-123',
 *   task: 'my-task',
 *   input: { data: 'value' },
 *   async: true,
 * });
 *
 * // Get task status
 * const status = await taskService.getTaskStatus('project-123', 'task-456');
 *
 * // Cancel a task
 * await taskService.cancelTask('project-123', 'task-456');
 * ```
 */
export class TaskService {
  constructor(private readonly httpClient: HttpClient) {}

  // ========================================================================
  // Task Execution
  // ========================================================================

  /**
   * Execute a predefined task
   *
   * @param request - Task execution request
   * @returns Task response with ID and status
   */
  async executeTask(request: ExecuteTaskRequest): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/api/tasks/execute', request);
  }

  /**
   * Execute an ad-hoc task with a prompt
   *
   * @param request - Ad-hoc task request
   * @returns Task response
   */
  async executeAdhocTask(request: ExecuteAdhocTaskRequest): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/api/tasks/adhoc', request);
  }

  /**
   * Get task status and details
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @returns Task details
   */
  async getTaskStatus(projectId: string, taskId: string): Promise<TaskResponse> {
    return this.httpClient.get<TaskResponse>(`/api/tasks/${projectId}/${taskId}`);
  }

  /**
   * Cancel a running task
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @returns Cancellation response
   */
  async cancelTask(
    projectId: string,
    taskId: string
  ): Promise<TaskCancellationResponse> {
    return this.httpClient.post<TaskCancellationResponse>(
      `/api/tasks/${projectId}/${taskId}/cancel`,
      {}
    );
  }

  /**
   * Get task context
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @returns Task context
   */
  async getTaskContext(
    projectId: string,
    taskId: string
  ): Promise<TaskContextResponse> {
    return this.httpClient.get<TaskContextResponse>(
      `/api/tasks/${projectId}/${taskId}/context`
    );
  }

  // ========================================================================
  // Task History
  // ========================================================================

  /**
   * List task history for a project
   *
   * @param projectId - Project ID
   * @param filters - Optional filters
   * @returns Array of task responses
   */
  async listTaskHistory(
    projectId: string,
    filters?: TaskHistoryFilters
  ): Promise<TaskResponse[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    return this.httpClient.get<TaskResponse[]>(
      `/api/tasks/${projectId}/history${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get task by ID
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @returns Task details
   */
  async getTask(projectId: string, taskId: string): Promise<TaskResponse> {
    return this.httpClient.get<TaskResponse>(`/api/tasks/${projectId}/${taskId}`);
  }

  // ========================================================================
  // Task Queue Management
  // ========================================================================

  /**
   * Get queue status for a project
   *
   * @param projectId - Project ID
   * @returns Queue status
   */
  async getQueueStatus(projectId: string): Promise<TaskLimitResponse> {
    return this.httpClient.get<TaskLimitResponse>(
      `/api/tasks/${projectId}/queue/status`
    );
  }

  /**
   * Set task limit for a project
   *
   * @param projectId - Project ID
   * @param request - Limit request
   * @returns Updated limit
   */
  async setTaskLimit(
    projectId: string,
    request: SetTaskLimitRequest
  ): Promise<TaskLimitResponse> {
    return this.httpClient.put<TaskLimitResponse>(
      `/api/tasks/${projectId}/queue/limit`,
      request
    );
  }

  // ========================================================================
  // Task Output
  // ========================================================================

  /**
   * Save task output
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @param request - Output to save
   * @returns Save response
   */
  async saveTaskOutput(
    projectId: string,
    taskId: string,
    request: SaveTaskOutputRequest
  ): Promise<SaveTaskOutputResponse> {
    return this.httpClient.post<SaveTaskOutputResponse>(
      `/api/tasks/${projectId}/${taskId}/output`,
      request
    );
  }

  /**
   * Get task output
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @returns Task output
   */
  async getTaskOutput(projectId: string, taskId: string): Promise<unknown> {
    return this.httpClient.get<unknown>(`/api/tasks/${projectId}/${taskId}/output`);
  }

  // ========================================================================
  // Task Dialog Management
  // ========================================================================

  /**
   * Capture task dialog for multi-step interactions
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @param request - Dialog capture request
   * @returns Async operation response
   */
  async captureTaskDialog(
    projectId: string,
    taskId: string,
    request: CaptureTaskDialogRequest
  ): Promise<AsyncOperationResponse> {
    return this.httpClient.post<AsyncOperationResponse>(
      `/api/tasks/${projectId}/${taskId}/dialog`,
      request
    );
  }

  // ========================================================================
  // Step Management
  // ========================================================================

  /**
   * Update step status
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @param request - Step status update
   * @returns Updated task
   */
  async updateStepStatus(
    projectId: string,
    taskId: string,
    request: UpdateStepStatusRequest
  ): Promise<TaskResponse> {
    return this.httpClient.patch<TaskResponse>(
      `/api/tasks/${projectId}/${taskId}/step`,
      request
    );
  }

  /**
   * Get step status
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @param stepId - Step ID
   * @returns Step details
   */
  async getStepStatus(
    projectId: string,
    taskId: string,
    stepId: string
  ): Promise<TaskStep> {
    return this.httpClient.get<TaskStep>(
      `/api/tasks/${projectId}/${taskId}/steps/${stepId}`
    );
  }

  // ========================================================================
  // Async Operations
  // ========================================================================

  /**
   * Get async operation status
   *
   * @param operationId - Operation ID
   * @returns Operation status
   */
  async getAsyncOperation(operationId: string): Promise<AsyncOperationResponse> {
    return this.httpClient.get<AsyncOperationResponse>(
      `/api/operations/${operationId}`
    );
  }

  /**
   * Cancel async operation
   *
   * @param operationId - Operation ID
   * @returns Cancellation response
   */
  async cancelAsyncOperation(operationId: string): Promise<AsyncOperationResponse> {
    return this.httpClient.post<AsyncOperationResponse>(
      `/api/operations/${operationId}/cancel`,
      {}
    );
  }
}

// ============================================================================
// Additional Types
// ============================================================================

export interface TaskHistoryFilters {
  status?: OperationStatus;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export interface TaskStep {
  step?: string;
  status?: string;
  message?: string;
  timestamp?: string;
  progress?: number;
}
