/**
 * WebSocket Module
 *
 * Exports all WebSocket-related functionality.
 */

// Event types
export * from './events';

// WebSocket manager
export { WebSocketManager } from './WebSocketManager';
export type { WebSocketManagerConfig, ConnectionState } from './WebSocketManager';

// Progress client
export { ProgressClient } from './ProgressClient';
export type {
  ProgressClientConfig,
  ProgressSubscription,
  TaskProgressOptions,
  WorkflowProgressOptions,
  SandboxProgressOptions,
} from './ProgressClient';
