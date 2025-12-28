/**
 * WebSocket Event Types
 *
 * Type definitions for WebSocket progress events.
 */

import type { OperationStepStatus } from '../types/generated/index.js';

// ============================================================================
// Base Event Types
// ============================================================================

/**
 * Base WebSocket event
 */
export interface WebSocketEvent {
  type: string;
  timestamp: string;
  projectId: string;
}

// ============================================================================
// Task Events
// ============================================================================

/**
 * Task queued event
 */
export interface TaskQueuedEvent extends WebSocketEvent {
  type: 'task_queued';
  taskId: string;
  task?: string;
  input?: Record<string, unknown>;
}

/**
 * Task started event
 */
export interface TaskStartedEvent extends WebSocketEvent {
  type: 'task_started';
  taskId: string;
  task?: string;
}

/**
 * Step progress event
 */
export interface TaskStepProgressEvent extends WebSocketEvent {
  type: 'step_progress';
  taskId: string;
  stepId?: string;
  step?: string;
  status: OperationStepStatus;
  message?: string;
  progress?: number;
  output?: unknown;
}

/**
 * Task completed event
 */
export interface TaskCompletedEvent extends WebSocketEvent {
  type: 'task_completed';
  taskId: string;
  task?: string;
  output?: unknown;
  duration?: number;
}

/**
 * Task failed event
 */
export interface TaskFailedEvent extends WebSocketEvent {
  type: 'task_failed';
  taskId: string;
  task?: string;
  error?: string;
  output?: unknown;
}

/**
 * Task cancelled event
 */
export interface TaskCancelledEvent extends WebSocketEvent {
  type: 'task_cancelled';
  taskId: string;
  task?: string;
}

// ============================================================================
// Workflow Events
// ============================================================================

/**
 * Workflow execution created event
 */
export interface WorkflowExecutionCreatedEvent extends WebSocketEvent {
  type: 'workflow_execution_created';
  executionId: string;
  workflowId: string;
  input?: Record<string, unknown>;
}

/**
 * Workflow execution started event
 */
export interface WorkflowExecutionStartedEvent extends WebSocketEvent {
  type: 'workflow_execution_started';
  executionId: string;
  workflowId: string;
}

/**
 * Workflow phase started event
 */
export interface WorkflowPhaseStartedEvent extends WebSocketEvent {
  type: 'workflow_phase_started';
  executionId: string;
  workflowId: string;
  phaseId: string;
  phase?: string;
}

/**
 * Workflow phase completed event
 */
export interface WorkflowPhaseCompletedEvent extends WebSocketEvent {
  type: 'workflow_phase_completed';
  executionId: string;
  workflowId: string;
  phaseId: string;
  phase?: string;
  output?: unknown;
}

/**
 * Workflow execution completed event
 */
export interface WorkflowExecutionCompletedEvent extends WebSocketEvent {
  type: 'workflow_execution_completed';
  executionId: string;
  workflowId: string;
  output?: unknown;
  duration?: number;
}

/**
 * Workflow execution failed event
 */
export interface WorkflowExecutionFailedEvent extends WebSocketEvent {
  type: 'workflow_execution_failed';
  executionId: string;
  workflowId: string;
  error?: string;
}

/**
 * Workflow execution paused event
 */
export interface WorkflowExecutionPausedEvent extends WebSocketEvent {
  type: 'workflow_execution_paused';
  executionId: string;
  workflowId: string;
}

/**
 * Workflow execution resumed event
 */
export interface WorkflowExecutionResumedEvent extends WebSocketEvent {
  type: 'workflow_execution_resumed';
  executionId: string;
  workflowId: string;
}

// ============================================================================
// Container Events
// ============================================================================

/**
 * Container created event
 */
export interface ContainerCreatedEvent extends WebSocketEvent {
  type: 'container_created';
  containerId: string;
  projectId: string;
  image?: string;
}

/**
 * Container started event
 */
export interface ContainerStartedEvent extends WebSocketEvent {
  type: 'container_started';
  containerId: string;
  projectId: string;
}

/**
 * Container stopped event
 */
export interface ContainerStoppedEvent extends WebSocketEvent {
  type: 'container_stopped';
  containerId: string;
  projectId: string;
  exitCode?: number;
}

/**
 * Container error event
 */
export interface ContainerErrorEvent extends WebSocketEvent {
  type: 'container_error';
  containerId: string;
  projectId: string;
  error?: string;
}

// ============================================================================
// Connection Events
// ============================================================================

/**
 * Connection established event
 */
export interface ConnectedEvent {
  type: 'connected';
  timestamp: string;
}

/**
 * Connection closed event
 */
export interface DisconnectedEvent {
  type: 'disconnected';
  timestamp: string;
  code?: number;
  reason?: string;
  willReconnect?: boolean;
}

/**
 * Connection error event
 */
export interface ConnectionErrorEvent {
  type: 'error';
  timestamp: string;
  error: Error | string;
  willReconnect?: boolean;
}

/**
 * Heartbeat event
 */
export interface HeartbeatEvent {
  type: 'ping' | 'pong';
  timestamp: string;
}

// ============================================================================
// Union Types
// ============================================================================

/**
 * All task-related events
 */
export type TaskEvent =
  | TaskQueuedEvent
  | TaskStartedEvent
  | TaskStepProgressEvent
  | TaskCompletedEvent
  | TaskFailedEvent
  | TaskCancelledEvent;

/**
 * All workflow-related events
 */
export type WorkflowEvent =
  | WorkflowExecutionCreatedEvent
  | WorkflowExecutionStartedEvent
  | WorkflowPhaseStartedEvent
  | WorkflowPhaseCompletedEvent
  | WorkflowExecutionCompletedEvent
  | WorkflowExecutionFailedEvent
  | WorkflowExecutionPausedEvent
  | WorkflowExecutionResumedEvent;

/**
 * All container-related events
 */
export type ContainerEvent =
  | ContainerCreatedEvent
  | ContainerStartedEvent
  | ContainerStoppedEvent
  | ContainerErrorEvent;

/**
 * All progress events
 */
export type ProgressEvent = TaskEvent | WorkflowEvent | ContainerEvent;

/**
 * All WebSocket events (including connection events)
 */
export type WSMessage =
  | ProgressEvent
  | ConnectedEvent
  | DisconnectedEvent
  | ConnectionErrorEvent
  | HeartbeatEvent;

// ============================================================================
// Event Guards
// ============================================================================

/**
 * Type guard for task events
 */
export function isTaskEvent(event: WSMessage): event is TaskEvent {
  return event.type.startsWith('task_');
}

/**
 * Type guard for workflow events
 */
export function isWorkflowEvent(event: WSMessage): event is WorkflowEvent {
  return event.type.startsWith('workflow_');
}

/**
 * Type guard for container events
 */
export function isContainerEvent(event: WSMessage): event is ContainerEvent {
  return event.type.startsWith('container_');
}

/**
 * Type guard for progress events
 */
export function isProgressEvent(event: WSMessage): event is ProgressEvent {
  return (
    isTaskEvent(event) ||
    isWorkflowEvent(event) ||
    isContainerEvent(event)
  );
}

// ============================================================================
// Event Listeners
// ============================================================================

/**
 * Task event listener
 */
export type TaskEventListener = (event: TaskEvent) => void;

/**
 * Workflow event listener
 */
export type WorkflowEventListener = (event: WorkflowEvent) => void;

/**
 * Container event listener
 */
export type ContainerEventListener = (event: ContainerEvent) => void;

/**
 * Progress event listener
 */
export type ProgressEventListener = (event: ProgressEvent) => void;

/**
 * Generic event listener
 */
export type EventListener<T extends WSMessage = WSMessage> = (
  event: T
) => void;

/**
 * Connection event listener
 */
export type ConnectionEventListener = (
  event: ConnectedEvent | DisconnectedEvent | ConnectionErrorEvent
) => void;

/**
 * All possible event listeners
 */
export type WebSocketEventListener =
  | TaskEventListener
  | WorkflowEventListener
  | ContainerEventListener
  | ProgressEventListener
  | ConnectionEventListener;
