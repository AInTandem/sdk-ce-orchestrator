/**
 * WebSocket Module
 *
 * Exports all WebSocket-related functionality.
 */

// Event types
export * from './events.js';

// WebSocket manager
export { WebSocketManager } from './WebSocketManager.js';
export type { WebSocketManagerConfig, ConnectionState } from './WebSocketManager.js';

// Progress client
export { ProgressClient } from './ProgressClient.js';
export type {
  ProgressClientConfig,
  ProgressSubscription,
  TaskProgressOptions,
  WorkflowProgressOptions,
  ContainerProgressOptions,
} from './ProgressClient.js';
