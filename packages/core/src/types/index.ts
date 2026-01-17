/**
 * OpenAPI Schema Types
 *
 * This file exports types generated from the Orchestrator's OpenAPI specification.
 * The types are auto-generated and should not be manually edited.
 *
 * To regenerate types, run: pnpm generate-types
 *
 * To fetch types from a remote API:
 * OPENAPI_SPEC_URL=https://aintandem.github.io/orchestrator-api/openapi.json pnpm generate-types
 */

// Export the complete schema
export * from './generated/schema';

// Re-export commonly used component schemas for easier access
import type { components } from './generated/schema';

// Extract schema types for convenience
export type Schemas = components['schemas'];

// Extract inline type definitions from schemas
export type LoginRequest = Schemas['LoginRequest'];
export type LoginResponse = Schemas['LoginResponse'];
export type RefreshResponse = Schemas['RefreshResponse'];
export type LogoutResponse = Schemas['LogoutResponse'];
export type VerifyResponse = Schemas['VerifyResponse'];

export type CreateWorkflowRequest = Schemas['CreateWorkflowRequest'];
export type UpdateWorkflowRequest = Schemas['UpdateWorkflowRequest'];
export type ChangeWorkflowStatusRequest = Schemas['ChangeWorkflowStatusRequest'];
export type CloneWorkflowRequest = Schemas['CloneWorkflowRequest'];
export type CreateWorkflowExecutionRequest = Schemas['CreateWorkflowExecutionRequest'];
export type WorkflowExecutionResponse = Schemas['WorkflowExecutionResponse'];
export type WorkflowExecutionStatus = Schemas['WorkflowExecutionStatus'];
export type WorkflowStepExecutionResponse = Schemas['WorkflowStepExecutionResponse'];
export type PhaseExecution = Schemas['PhaseExecution'];
export type StepExecution = Schemas['StepExecution'];
export type PhaseStatus = Schemas['PhaseStatus'];

// Workflow definition types
export type WorkflowDefinition = Schemas['WorkflowDefinition'];
export type WorkflowPhase = Schemas['WorkflowPhase'];
export type WorkflowStep = Schemas['WorkflowStep'];
export type WorkflowTransition = Schemas['WorkflowTransition'];

// Helper type for workflow status from ChangeWorkflowStatusRequest
export type WorkflowStatus = ChangeWorkflowStatusRequest['status'];

export type ExecuteTaskRequest = Schemas['ExecuteTaskRequest'];
export type ExecuteAdhocTaskRequest = Schemas['ExecuteAdhocTaskRequest'];
export type TaskResponse = Schemas['TaskResponse'];
export type TaskCancellationResponse = Schemas['TaskCancellationResponse'];
export type TaskContextResponse = Schemas['TaskContextResponse'];
export type TaskLimitResponse = Schemas['TaskLimitResponse'];
export type SetTaskLimitRequest = Schemas['SetTaskLimitRequest'];
export type SaveTaskOutputRequest = Schemas['SaveTaskOutputRequest'];
export type SaveTaskOutputResponse = Schemas['SaveTaskOutputResponse'];
export type UpdateStepStatusRequest = Schemas['UpdateStepStatusRequest'];

// Re-export operation status types as string unions for convenience
export type OperationStatus = Schemas['OperationStatus'];
export type StepExecutionStatus = Schemas['StepExecution']['status'];

// Sandbox types (new naming)
export type CreateSandboxRequest = Schemas['CreateSandboxRequest'];
export type SandboxInfoResponse = Schemas['SandboxInfoResponse'];
export type SandboxCreationResponse = Schemas['SandboxCreationResponse'];
export type OperationStep = Schemas['OperationStep'];
export type AsyncOperationResponse = Schemas['AsyncOperationResponse'];
export type CancelOperationResponse = Schemas['CancelOperationResponse'];

// Backward compatibility aliases for Container types
export type CreateContainerRequest = CreateSandboxRequest;
export type ContainerResponse = SandboxInfoResponse;
export type ContainerCreationResponse = SandboxCreationResponse;

export type CreateMemoryRequest = Schemas['CreateMemoryRequest'];
export type UpdateMemoryRequest = Schemas['UpdateMemoryRequest'];
export type UpsertMemoryRequest = Schemas['UpsertMemoryRequest'];
export type SearchMemoriesRequest = Schemas['SearchMemoriesRequest'];
export type GetRelevantContextRequest = Schemas['GetRelevantContextRequest'];
export type GetRelevantContextResponse = Schemas['GetRelevantContextResponse'];
export type ImportDocumentRequest = Schemas['ImportDocumentRequest'];
export type ImportDocumentContentRequest = Schemas['ImportDocumentContentRequest'];
export type ImportFolderRequest = Schemas['ImportFolderRequest'];
export type CaptureTaskDialogRequest = Schemas['CaptureTaskDialogRequest'];

export type CreateOrganizationRequest = Schemas['CreateOrganizationRequest'];
export type UpdateOrganizationRequest = Schemas['UpdateOrganizationRequest'];
export type CreateWorkspaceRequest = Schemas['CreateWorkspaceRequest'];
export type UpdateWorkspaceRequest = Schemas['UpdateWorkspaceRequest'];
export type CreateProjectRequest = Schemas['CreateProjectRequest'];
export type UpdateProjectRequest = Schemas['UpdateProjectRequest'];
export type MoveProjectRequest = Schemas['MoveProjectRequest'];

export type UpdateSettingsRequest = Schemas['UpdateSettingsRequest'];
export type HealthResponse = Schemas['HealthResponse'];

export type SyncFileRequest = Schemas['SyncFileRequest'];
export type SyncFolderRequest = Schemas['SyncFolderRequest'];
export type BrowseDirectoriesRequest = Schemas['BrowseDirectoriesRequest'];
export type BrowseDirectoriesResponse = Schemas['BrowseDirectoriesResponse'];
export type ListFoldersResponse = Schemas['ListFoldersResponse'];

// Workflow Execution types (complete)
export type WorkflowExecution = Schemas['WorkflowExecution'];
export type QueueStatusResponse = Schemas['QueueStatusResponse'];

// Settings types
export type SettingsResponse = Schemas['SettingsResponse'];
export type Settings = SettingsResponse; // Alias for convenience
export type UserPreferences = Schemas['UserPreferences'];

// Sandbox operation types (complete) - imported from schemas
// Note: SandboxOperationType and OperationStatus are string literal unions from the schema
export type SandboxOperation = Schemas['SandboxOperation'];
