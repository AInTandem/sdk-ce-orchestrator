/**
 * AInTandem TypeScript SDK - Core Package
 *
 * @example
 * ```typescript
 * import { AInTandemClient } from '@aintandem/sdk';
 *
 * const client = new AInTandemClient({
 *   baseURL: 'https://api.aintandem.com',
 * });
 *
 * // Login
 * await client.auth.login({ username: 'user', password: 'pass' });
 *
 * // Use API
 * const workflows = await client.workflows.listWorkflows();
 * ```
 */

// Main client
export { AInTandemClient, AuthService } from './client/AInTandemClient.js';

// Services
export { WorkflowService } from './services/WorkflowService.js';
export { TaskService } from './services/TaskService.js';
export { ContainerService } from './services/ContainerService.js';
export { ContextService } from './services/ContextService.js';
export { SettingsService } from './services/SettingsService.js';
export { WorkspaceService } from './services/WorkspaceService.js';

// Service types
export type {
  Workflow,
  WorkflowPhase,
  WorkflowStep,
  WorkflowTransition,
  WorkflowVersion,
} from './services/WorkflowService.js';

// Core HTTP client and auth manager (for advanced usage)
export { HttpClient } from './client/HttpClient.js';
export { AuthManager } from './client/AuthManager.js';

// Interceptors
export { createAuthInterceptor } from './interceptors/auth.interceptor.js';
export {
  createLoggingInterceptor,
  createResponseLoggingInterceptor,
} from './interceptors/logging.interceptor.js';

// Error classes
export { AInTandemError } from './errors/AInTandemError.js';
export { NetworkError } from './errors/NetworkError.js';
export { AuthError } from './errors/AuthError.js';
export { ApiError } from './errors/ApiError.js';
export { ValidationError } from './errors/ValidationError.js';

// Types
export type {
  AInTandemClientConfig,
  RequestInterceptor,
  ResponseInterceptor,
  TokenStorage,
  WebSocketConfig,
} from './types/manual/client.types.js';

export { LocalStorageTokenStorage } from './types/manual/client.types.js';

// Generated types from OpenAPI
export * from './types/generated/index.js';

// WebSocket functionality
export * from './websocket/index.js';
