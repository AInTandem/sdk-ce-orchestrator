/**
 * Sandbox Service
 *
 * Manages Docker sandbox operations.
 */

import type {
  CreateSandboxRequest,
  SandboxInfoResponse,
  SandboxCreationResponse,
  AsyncOperationResponse,
  CancelOperationResponse,
  SandboxOperationType,
  OperationStatus,
} from '../types/index';
import { HttpClient } from '../client/HttpClient';

/**
 * Sandbox Service
 *
 * Provides methods for managing Docker sandboxes.
 *
 * @example
 * ```typescript
 * const sandboxService = new SandboxService(httpClient);
 *
 * // List all sandboxes
 * const sandboxes = await sandboxService.listSandboxes();
 *
 * // Create a sandbox
 * const sandbox = await sandboxService.createSandbox({
 *   projectId: 'project-123',
 * });
 *
 * // Start a sandbox
 * await sandboxService.startSandbox('sandbox-456');
 *
 * // Stop a sandbox
 * await sandboxService.stopSandbox('sandbox-456');
 * ```
 */
export class SandboxService {
  constructor(private readonly httpClient: HttpClient) {}

  // ========================================================================
  // Sandbox CRUD
  // ========================================================================

  /**
   * List all sandboxes
   *
   * @returns Array of sandboxes
   */
  async listSandboxes(): Promise<SandboxInfoResponse[]> {
    return this.httpClient.get<SandboxInfoResponse[]>('/flexy');
  }

  /**
   * Get a specific sandbox
   *
   * @param sandboxId - Sandbox ID
   * @returns Sandbox details
   */
  async getSandbox(sandboxId: string): Promise<SandboxInfoResponse> {
    return this.httpClient.get<SandboxInfoResponse>(`/flexy/${sandboxId}`);
  }

  /**
   * Create a new sandbox
   *
   * @param request - Sandbox creation request
   * @returns Created sandbox details
   */
  async createSandbox(
    request: CreateSandboxRequest
  ): Promise<SandboxCreationResponse> {
    return this.httpClient.post<SandboxCreationResponse>(
      '/flexy',
      request
    );
  }

  /**
   * Delete a sandbox
   *
   * @param sandboxId - Sandbox ID
   */
  async deleteSandbox(sandboxId: string): Promise<void> {
    return this.httpClient.delete<void>(`/flexy/${sandboxId}`);
  }

  // ========================================================================
  // Sandbox Operations (Synchronous)
  // ========================================================================

  /**
   * Start a sandbox synchronously
   *
   * @param sandboxId - Sandbox ID
   */
  async startSandbox(sandboxId: string): Promise<void> {
    return this.httpClient.post<void>(`/flexy/${sandboxId}/start`, {});
  }

  /**
   * Stop a sandbox synchronously
   *
   * @param sandboxId - Sandbox ID
   */
  async stopSandbox(sandboxId: string): Promise<void> {
    return this.httpClient.post<void>(`/flexy/${sandboxId}/stop`, {});
  }

  /**
   * Restart a sandbox synchronously
   *
   * @param sandboxId - Sandbox ID
   */
  async restartSandbox(sandboxId: string): Promise<void> {
    return this.httpClient.post<void>(`/flexy/${sandboxId}/restart`, {});
  }

  // ========================================================================
  // Sandbox Operations (Asynchronous with progress tracking)
  // ========================================================================

  /**
   * Start a sandbox asynchronously with progress tracking
   *
   * @param sandboxId - Sandbox ID
   * @returns Async operation response
   */
  async startSandboxAsync(sandboxId: string): Promise<AsyncOperationResponse> {
    return this.httpClient.post<AsyncOperationResponse>(
      `/flexy/${sandboxId}/start-async`,
      {}
    );
  }

  /**
   * Stop a sandbox asynchronously with progress tracking
   *
   * @param sandboxId - Sandbox ID
   * @returns Async operation response
   */
  async stopSandboxAsync(sandboxId: string): Promise<AsyncOperationResponse> {
    return this.httpClient.post<AsyncOperationResponse>(
      `/flexy/${sandboxId}/stop-async`,
      {}
    );
  }

  /**
   * Restart a sandbox asynchronously with progress tracking
   *
   * @param sandboxId - Sandbox ID
   * @returns Async operation response
   */
  async restartSandboxAsync(sandboxId: string): Promise<AsyncOperationResponse> {
    return this.httpClient.post<AsyncOperationResponse>(
      `/flexy/${sandboxId}/restart-async`,
      {}
    );
  }

  /**
   * Delete a sandbox asynchronously with progress tracking
   *
   * @param sandboxId - Sandbox ID
   * @returns Async operation response
   */
  async deleteSandboxAsync(sandboxId: string): Promise<AsyncOperationResponse> {
    return this.httpClient.delete<AsyncOperationResponse>(
      `/flexy/${sandboxId}/async`
    );
  }

  // ========================================================================
  // Operation Management
  // ========================================================================

  /**
   * Get operation status
   *
   * @param operationId - Operation ID
   * @returns Operation details
   */
  async getOperationStatus(operationId: string): Promise<{
    id: string;
    type: SandboxOperationType;
    status: OperationStatus;
    sandboxId?: string;
    sandboxName?: string;
    projectId?: string;
    userId?: string;
    progress: {
      current: number;
      total: number;
      percentage: number;
      message: string;
    };
    error?: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    steps: Array<{
      id: string;
      name: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      startTime?: string;
      endTime?: string;
      duration?: number;
      message?: string;
      error?: string;
    }>;
    metadata?: Record<string, unknown>;
  }> {
    return this.httpClient.get(`/flexy/operations/${operationId}`);
  }

  /**
   * Cancel an operation
   *
   * @param operationId - Operation ID
   * @returns Cancellation response
   */
  async cancelOperation(operationId: string): Promise<CancelOperationResponse> {
    return this.httpClient.post<CancelOperationResponse>(
      `/flexy/operations/${operationId}/cancel`,
      {}
    );
  }

  /**
   * Get operations for a project
   *
   * @param projectId - Project ID
   * @param status - Optional status filter
   * @returns Array of operations
   */
  async getProjectOperations(
    projectId: string,
    status?: OperationStatus[]
  ): Promise<{
    operations: Array<{
      id: string;
      type: SandboxOperationType;
      status: OperationStatus;
      sandboxId?: string;
      sandboxName?: string;
      projectId?: string;
      userId?: string;
      progress: {
        current: number;
        total: number;
        percentage: number;
        message: string;
      };
      error?: string;
      startTime: string;
      endTime?: string;
      duration?: number;
      steps: Array<{
        id: string;
        name: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        startTime?: string;
        endTime?: string;
        duration?: number;
        message?: string;
        error?: string;
      }>;
      metadata?: Record<string, unknown>;
    }>;
  }> {
    const url = status
      ? `/flexy/projects/${projectId}/operations?status=${status.join('&status=')}`
      : `/flexy/projects/${projectId}/operations`;
    return this.httpClient.get(url);
  }

  // ========================================================================
  // Convenience Methods
  // ========================================================================

  /**
   * Wait for a sandbox to reach a specific state
   *
   * @param sandboxId - Sandbox ID
   * @param desiredState - Desired state ('running' or 'exited')
   * @param timeout - Timeout in milliseconds (default: 60000)
   * @returns Final sandbox state
   */
  async waitForState(
    sandboxId: string,
    desiredState: 'running' | 'exited',
    timeout = 60000
  ): Promise<SandboxInfoResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const sandbox = await this.getSandbox(sandboxId);
      if (sandbox.status === desiredState) {
        return sandbox;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(`Timeout waiting for sandbox ${sandboxId} to reach state ${desiredState}`);
  }

  /**
   * Check if a sandbox is running
   *
   * @param sandboxId - Sandbox ID
   * @returns True if running, false otherwise
   */
  async isRunning(sandboxId: string): Promise<boolean> {
    const sandbox = await this.getSandbox(sandboxId);
    return sandbox.status === 'running';
  }
}
