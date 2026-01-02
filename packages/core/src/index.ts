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
export { AInTandemClient, AuthService } from './client/AInTandemClient';

// Services
export { WorkflowService } from './services/WorkflowService';
export { TaskService } from './services/TaskService';
export { SandboxService } from './services/SandboxService';
export { ContextService } from './services/ContextService';
export { SettingsService } from './services/SettingsService';
export { WorkspaceService } from './services/WorkspaceService';

// Service types
export type {
  Workflow,
  WorkflowPhase,
  WorkflowStep,
  WorkflowTransition,
  WorkflowVersion,
} from './services/WorkflowService';

// Core HTTP client and auth manager (for advanced usage)
export { HttpClient } from './client/HttpClient';
export { AuthManager } from './client/AuthManager';

// Interceptors
export { createAuthInterceptor } from './interceptors/auth.interceptor';
export {
  createLoggingInterceptor,
  createResponseLoggingInterceptor,
} from './interceptors/logging.interceptor';

// Error classes
export { AInTandemError } from './errors/AInTandemError';
export { NetworkError } from './errors/NetworkError';
export { AuthError } from './errors/AuthError';
export { ApiError } from './errors/ApiError';
export { ValidationError } from './errors/ValidationError';

// Types
export type {
  AInTandemClientConfig,
  RequestInterceptor,
  ResponseInterceptor,
  TokenStorage,
  WebSocketConfig,
} from './types/manual/client.types';

export { LocalStorageTokenStorage } from './types/manual/client.types';

// Generated types from OpenAPI
export * from './types/index';

// WebSocket functionality
export * from './websocket/index';
