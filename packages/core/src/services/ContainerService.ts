/**
 * Container Service
 *
 * Manages Docker container operations.
 */

import type {
  CreateContainerRequest,
  ContainerResponse,
  ContainerCreationResponse,
} from '../types/generated/index.js';
import { ContainerOperationType } from '../types/generated/index.js';
import { HttpClient } from '../client/HttpClient.js';

/**
 * Container Service
 *
 * Provides methods for managing Docker containers.
 *
 * @example
 * ```typescript
 * const containerService = new ContainerService(httpClient);
 *
 * // Create a container
 * const container = await containerService.createContainer({
 *   projectId: 'project-123',
 *   image: 'ubuntu:latest',
 *   command: ['/bin/bash'],
 * });
 *
 * // Start a container
 * await containerService.startContainer('container-456');
 *
 * // Stop a container
 * await containerService.stopContainer('container-456');
 *
 * // Get container status
 * const status = await containerService.getContainer('container-456');
 * ```
 */
export class ContainerService {
  constructor(private readonly httpClient: HttpClient) {}

  // ========================================================================
  // Container CRUD
  // ========================================================================

  /**
   * List all containers for a project
   *
   * @param projectId - Project ID
   * @returns Array of containers
   */
  async listContainers(projectId: string): Promise<ContainerResponse[]> {
    return this.httpClient.get<ContainerResponse[]>(
      `/api/projects/${projectId}/containers`
    );
  }

  /**
   * Get a specific container
   *
   * @param containerId - Container ID
   * @returns Container details
   */
  async getContainer(containerId: string): Promise<ContainerResponse> {
    return this.httpClient.get<ContainerResponse>(`/api/containers/${containerId}`);
  }

  /**
   * Create a new container
   *
   * @param request - Container creation request
   * @returns Created container details
   */
  async createContainer(
    request: CreateContainerRequest
  ): Promise<ContainerCreationResponse> {
    return this.httpClient.post<ContainerCreationResponse>(
      '/api/containers',
      request
    );
  }

  /**
   * Delete a container
   *
   * @param containerId - Container ID
   */
  async deleteContainer(containerId: string): Promise<void> {
    return this.httpClient.delete<void>(`/api/containers/${containerId}`);
  }

  // ========================================================================
  // Container Operations
  // ========================================================================

  /**
   * Start a container
   *
   * @param containerId - Container ID
   * @returns Operation result
   */
  async startContainer(containerId: string): Promise<ContainerOperationResponse> {
    return this.executeOperation(containerId, ContainerOperationType.START);
  }

  /**
   * Stop a container
   *
   * @param containerId - Container ID
   * @returns Operation result
   */
  async stopContainer(containerId: string): Promise<ContainerOperationResponse> {
    return this.executeOperation(containerId, ContainerOperationType.STOP);
  }

  /**
   * Restart a container
   *
   * @param containerId - Container ID
   * @returns Operation result
   */
  async restartContainer(containerId: string): Promise<ContainerOperationResponse> {
    return this.executeOperation(containerId, ContainerOperationType.RESTART);
  }

  /**
   * Remove a container
   *
   * @param containerId - Container ID
   * @returns Operation result
   */
  async removeContainer(containerId: string): Promise<ContainerOperationResponse> {
    return this.executeOperation(containerId, ContainerOperationType.REMOVE);
  }

  /**
   * Execute a container operation
   *
   * @param containerId - Container ID
   * @param operation - Operation type (start, stop, restart, remove)
   * @returns Operation result
   */
  async executeOperation(
    containerId: string,
    operation: ContainerOperationType
  ): Promise<ContainerOperationResponse> {
    return this.httpClient.post<ContainerOperationResponse>(
      `/api/containers/${containerId}/operations`,
      { operation }
    );
  }

  // ========================================================================
  // Container Logs
  // ========================================================================

  /**
   * Get container logs
   *
   * @param containerId - Container ID
   * @param options - Log options
   * @returns Container logs
   */
  async getLogs(
    containerId: string,
    options?: ContainerLogOptions
  ): Promise<ContainerLogs> {
    const params = new URLSearchParams();
    if (options?.tail) params.append('tail', options.tail.toString());
    if (options?.since) params.append('since', options.since);
    if (options?.timestamps) params.append('timestamps', 'true');

    const queryString = params.toString();
    return this.httpClient.get<ContainerLogs>(
      `/api/containers/${containerId}/logs${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Stream container logs
   *
   * @param _containerId - Container ID
   * @param _onLog - Callback for log lines
   * @param _options - Log options
   * @returns WebSocket close function
   */
  streamLogs(
    _containerId: string,
    _onLog: (log: string) => void,
    _options?: ContainerLogOptions
  ): () => void {
    // TODO: Implement WebSocket log streaming in Phase 5
    console.warn('Log streaming not yet implemented');
    return () => {};
  }

  // ========================================================================
  // Container Status
  // ========================================================================

  /**
   * Get container status
   *
   * @param containerId - Container ID
   * @returns Container status
   */
  async getStatus(containerId: string): Promise<ContainerStatus> {
    return this.httpClient.get<ContainerStatus>(
      `/api/containers/${containerId}/status`
    );
  }

  /**
   * Wait for container to reach a certain state
   *
   * @param containerId - Container ID
   * @param state - Desired state (running, exited, removed)
   * @param timeout - Timeout in milliseconds (default: 30000)
   * @returns Container status
   */
  async waitForState(
    containerId: string,
    state: 'running' | 'exited' | 'removed',
    timeout = 30000
  ): Promise<ContainerStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getStatus(containerId);
      if (status.state === state) {
        return status;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(`Timeout waiting for container ${containerId} to reach state ${state}`);
  }

  // ========================================================================
  // Container Stats
  // ========================================================================

  /**
   * Get container statistics
   *
   * @param containerId - Container ID
   * @returns Container statistics
   */
  async getStats(containerId: string): Promise<ContainerStats> {
    return this.httpClient.get<ContainerStats>(
      `/api/containers/${containerId}/stats`
    );
  }
}

// ============================================================================
// Additional Types
// ============================================================================

export interface ContainerOperationResponse {
  containerId: string;
  operation: ContainerOperationType;
  status: string;
  message?: string;
}

export interface ContainerLogOptions {
  tail?: number;
  since?: string;
  timestamps?: boolean;
}

export interface ContainerLogs {
  logs: string[];
  containerId: string;
}

export interface ContainerStatus {
  containerId: string;
  state: 'created' | 'running' | 'paused' | 'restarting' | 'exited' | 'removing' | 'dead';
  status: string;
  startedAt?: string;
  finishedAt?: string;
  exitCode?: number;
  ipAddress?: string;
  ports?: Record<string, string>;
}

export interface ContainerStats {
  containerId: string;
  cpuPercent: number;
  memoryUsage: number;
  memoryLimit: number;
  memoryPercent: number;
  networkRx: number;
  networkTx: number;
  blockRead: number;
  blockWrite: number;
}
