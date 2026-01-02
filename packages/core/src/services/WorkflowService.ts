/**
 * Workflow Service
 *
 * Manages workflow CRUD operations and executions.
 */

import type {
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  CloneWorkflowRequest,
  CreateWorkflowExecutionRequest,
  WorkflowExecutionResponse,
  WorkflowStepExecutionResponse,
  WorkflowStatus,
  WorkflowDefinition,
} from '../types/index';
import { HttpClient } from '../client/HttpClient';

/**
 * Workflow Service
 *
 * Provides methods for managing workflows and their executions.
 *
 * @example
 * ```typescript
 * const workflowService = new WorkflowService(httpClient);
 *
 * // List all workflows
 * const workflows = await workflowService.listWorkflows('published');
 *
 * // Create a workflow
 * const workflow = await workflowService.createWorkflow({
 *   name: 'My Workflow',
 *   definition: { phases: [], transitions: [] },
 * });
 *
 * // Execute a workflow
 * const execution = await workflowService.createExecution('workflow-id', {
 *   input: { data: 'value' },
 * });
 * ```
 */
export class WorkflowService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * List all workflows
   *
   * @param status - Optional status filter (draft, published, archived)
   * @returns Array of workflows
   */
  async listWorkflows(status?: WorkflowStatus): Promise<Workflow[]> {
    const params = status ? `?status=${status}` : '';
    return this.httpClient.get<Workflow[]>(`/workflows${params}`);
  }

  /**
   * Get a specific workflow by ID
   *
   * @param id - Workflow ID
   * @returns Workflow details
   */
  async getWorkflow(id: string): Promise<Workflow> {
    return this.httpClient.get<Workflow>(`/workflows/${id}`);
  }

  /**
   * Create a new workflow
   *
   * @param request - Workflow creation request
   * @returns Created workflow
   */
  async createWorkflow(request: CreateWorkflowRequest): Promise<Workflow> {
    return this.httpClient.post<Workflow>('/workflows', request);
  }

  /**
   * Update an existing workflow
   *
   * @param id - Workflow ID
   * @param request - Update request
   * @returns Updated workflow
   */
  async updateWorkflow(id: string, request: UpdateWorkflowRequest): Promise<Workflow> {
    return this.httpClient.put<Workflow>(`/workflows/${id}`, request);
  }

  /**
   * Delete a workflow
   *
   * @param id - Workflow ID
   */
  async deleteWorkflow(id: string): Promise<void> {
    return this.httpClient.delete<void>(`/workflows/${id}`);
  }

  /**
   * Change workflow status
   *
   * @param id - Workflow ID
   * @param status - New status (draft, published, archived)
   * @returns Updated workflow
   */
  async changeWorkflowStatus(
    id: string,
    status: WorkflowStatus
  ): Promise<Workflow> {
    return this.httpClient.patch<Workflow>(`/workflows/${id}/status`, {
      status,
    });
  }

  /**
   * Clone an existing workflow
   *
   * @param id - Workflow ID to clone
   * @param request - Clone request
   * @returns Cloned workflow
   */
  async cloneWorkflow(id: string, request: CloneWorkflowRequest): Promise<Workflow> {
    return this.httpClient.post<Workflow>(`/workflows/${id}/clone`, request);
  }

  /**
   * List workflow versions
   *
   * @param id - Workflow ID
   * @returns Array of workflow versions
   */
  async listVersions(id: string): Promise<WorkflowVersion[]> {
    return this.httpClient.get<WorkflowVersion[]>(`/workflows/${id}/versions`);
  }

  /**
   * Get a specific workflow version
   *
   * @param versionId - Version ID
   * @returns Workflow version details
   */
  async getVersion(versionId: string): Promise<WorkflowVersion> {
    return this.httpClient.get<WorkflowVersion>(
      `/workflows/versions/${versionId}`
    );
  }

  // ========================================================================
  // Execution Methods
  // ========================================================================

  /**
   * Create a new workflow execution
   *
   * @param workflowId - Workflow ID
   * @param request - Execution creation request
   * @returns Created execution
   */
  async createExecution(
    workflowId: string,
    request?: CreateWorkflowExecutionRequest
  ): Promise<WorkflowExecutionResponse> {
    return this.httpClient.post<WorkflowExecutionResponse>(
      `/workflows/${workflowId}/executions`,
      request || {}
    );
  }

  /**
   * Start a workflow execution
   *
   * @param executionId - Execution ID
   * @returns Updated execution
   */
  async startExecution(executionId: string): Promise<WorkflowExecutionResponse> {
    return this.httpClient.post<WorkflowExecutionResponse>(
      `/workflows/executions/${executionId}/start`,
      {}
    );
  }

  /**
   * Pause a running workflow execution
   *
   * @param executionId - Execution ID
   * @returns Updated execution
   */
  async pauseExecution(executionId: string): Promise<WorkflowExecutionResponse> {
    return this.httpClient.post<WorkflowExecutionResponse>(
      `/workflows/executions/${executionId}/pause`,
      {}
    );
  }

  /**
   * Resume a paused workflow execution
   *
   * @param executionId - Execution ID
   * @returns Updated execution
   */
  async resumeExecution(executionId: string): Promise<WorkflowExecutionResponse> {
    return this.httpClient.post<WorkflowExecutionResponse>(
      `/workflows/executions/${executionId}/resume`,
      {}
    );
  }

  /**
   * Cancel a workflow execution
   *
   * @param executionId - Execution ID
   * @returns Updated execution
   */
  async cancelExecution(executionId: string): Promise<WorkflowExecutionResponse> {
    return this.httpClient.post<WorkflowExecutionResponse>(
      `/workflows/executions/${executionId}/cancel`,
      {}
    );
  }

  /**
   * Get execution details
   *
   * @param executionId - Execution ID
   * @returns Execution details
   */
  async getExecution(executionId: string): Promise<WorkflowExecutionResponse> {
    return this.httpClient.get<WorkflowExecutionResponse>(
      `/workflows/executions/${executionId}`
    );
  }

  /**
   * List executions for a workflow
   *
   * @param workflowId - Workflow ID
   * @returns Array of executions
   */
  async listExecutions(workflowId: string): Promise<WorkflowExecutionResponse[]> {
    return this.httpClient.get<WorkflowExecutionResponse[]>(
      `/workflows/${workflowId}/executions`
    );
  }

  /**
   * Get step execution details
   *
   * @param executionId - Execution ID
   * @param stepId - Step ID
   * @returns Step execution details
   */
  async getStepExecution(
    executionId: string,
    stepId: string
  ): Promise<WorkflowStepExecutionResponse> {
    return this.httpClient.get<WorkflowStepExecutionResponse>(
      `/workflows/executions/${executionId}/steps/${stepId}`
    );
  }
}

// ============================================================================
// Re-export workflow types from generated schema
// ============================================================================

// Export them here for convenience
export type { WorkflowDefinition, WorkflowPhase, WorkflowStep, WorkflowTransition } from '../types/index';

// Custom Workflow type that extends the generated types with additional fields
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  definition: WorkflowDefinition;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  definition: WorkflowDefinition;
  createdAt: string;
  createdById?: string;
}
