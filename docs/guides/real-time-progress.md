# Real-time Progress Tracking Guide

This guide explains how to use the AInTandem SDK for real-time progress tracking via WebSocket, including task progress, workflow progress, and sandbox progress.

## Overview

The AInTandem SDK provides complete WebSocket support for real-time tracking of:
- Single task execution progress
- Workflow execution progress
- Sandbox operation progress
- All progress events at project level

## WebSocket Connection Management

The SDK internally uses `WebSocketManager` and `ProgressClient` to automatically manage WebSocket connections:

- Automatic connection and reconnection
- Heartbeat detection
- Event subscription and unsubscription
- Connection state monitoring
- **Connection management by project ID**: Each project has an independent WebSocket connection

### WebSocket URL Format

The Orchestrator API WebSocket endpoint format is:
```
ws://localhost:9900/api/progress/subscribe/{projectId}?token={jwt}
```

The SDK automatically handles URL construction and token attachment. Developers only need to provide the `projectId`.

## Core SDK Usage

### 1. Track Single Task Progress

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// Login
await client.auth.login({ username: 'user', password: 'pass' });

// Submit async task
const task = await client.tasks.executeTask(
  'project-123',
  {
    task: 'data-analysis',
    input: { dataset: 'sales-2024' },
  }
);

// Subscribe to task progress
await client.subscribeToTask(
  'project-123',
  task.taskId,
  // Progress event callback
  (event) => {
    console.log('Task progress update:', event);
    // Event type: TaskEvent
    // - type: 'task_queued', 'task_started', 'step_progress', 'output',
    //         'artifact', 'task_completed', 'task_failed', 'task_cancelled'
  },
  // Completion callback
  (event) => {
    console.log('Task completed:', event.output);
  },
  // Error callback
  (event) => {
    console.error('Task failed:', event.error);
  }
);
```

### 2. Track Workflow Execution Progress

```typescript
// Subscribe to workflow progress
await client.subscribeToWorkflow(
  'project-123',
  // Progress event callback
  (event) => {
    console.log('Workflow progress update:', event);
    // Event type: WorkflowEvent
    // - type: 'workflow_execution_created', 'workflow_execution_started',
    //         'workflow_phase_started', 'workflow_phase_completed',
    //         'workflow_execution_completed', 'workflow_execution_failed',
    //         'workflow_execution_paused', 'workflow_execution_resumed'
  },
  // Workflow ID (optional)
  'workflow-id',
  // Execution ID (optional)
  'execution-id',
  // Completion callback
  (event) => {
    console.log('Workflow completed:', event.output);
  },
  // Error callback
  (event) => {
    console.error('Workflow failed:', event.error);
  }
);
```

### 3. Track Sandbox Operation Progress

```typescript
// Subscribe to sandbox operation progress
await client.subscribeToSandbox(
  'project-123',
  // Progress event callback
  (event) => {
    console.log('Sandbox event:', event);
    // Event type: SandboxEvent
    // - type: 'sandbox_created', 'sandbox_started', 'sandbox_stopped', 'sandbox_error'
  },
  // Sandbox ID (optional)
  'sandbox-id'
);
```

### 4. Track All Project Progress

```typescript
// Get Progress Client
const progress = client.getProgress();

// Subscribe to all progress events for the project
const subscription = await progress.subscribeToProgress(
  'project-123',
  // Event callback
  (event) => {
    console.log('Project progress event:', event);
    // Event type: ProgressEvent (TaskEvent | WorkflowEvent | SandboxEvent)
  }
);

// Unsubscribe
subscription.unsubscribe();
```

### 5. Direct Connection with ProgressClient

```typescript
// Get Progress Client
const progress = client.getProgress();

// Connect to specific project (automatically establishes WebSocket connection)
await progress.connect('project-123');

// Check connection status
const isConnected = progress.isConnected('project-123');
console.log('Connection status:', isConnected);

// Get connection state
const state = progress.getConnectionState('project-123');
console.log('Connection state:', state);
// Possible values: 'disconnected', 'connecting', 'connected', 'reconnecting', 'disconnecting'

// Disconnect
progress.disconnect('project-123');

// Disconnect all
progress.disconnectAll();
```

### 6. Unsubscribe

```typescript
// Method 1: Save unsubscribe function
const unsubscribe = await client.subscribeToTask(...);
// Unsubscribe later
unsubscribe();

// Method 2: Use ProgressSubscription
const subscription = await client.progress.subscribeToProgress(...);
// Unsubscribe later
subscription.unsubscribe();
```

## Event Type Details

### TaskEvent (Task Events)

```typescript
type TaskEvent =
  | TaskQueuedEvent        // Task added to queue
  | TaskStartedEvent       // Task started execution
  | TaskStepProgressEvent  // Step progress update
  | TaskOutputEvent        // Terminal output fragment
  | TaskArtifactEvent      // Artifact file detected
  | TaskCompletedEvent     // Task completed
  | TaskFailedEvent        // Task failed
  | TaskCancelledEvent;    // Task cancelled

// Task added to queue
interface TaskQueuedEvent {
  type: 'task_queued';
  timestamp: string;
  projectId: string;
  taskId: string;
  task?: string;
  input?: Record<string, unknown>;
}

// Task started
interface TaskStartedEvent {
  type: 'task_started';
  timestamp: string;
  projectId: string;
  taskId: string;
  task?: string;
}

// Step progress update
interface TaskStepProgressEvent {
  type: 'step_progress';
  timestamp: string;
  projectId: string;
  taskId: string;
  stepId?: string;
  step?: string;
  status: StepExecutionStatus;
  message?: string;
  progress?: number;
  output?: unknown;
}

// Terminal output fragment
interface TaskOutputEvent {
  type: 'output';
  timestamp: string;
  projectId: string;
  taskId: string;
  stepId?: string;
  output: string;
}

// Artifact file detected
interface TaskArtifactEvent {
  type: 'artifact';
  timestamp: string;
  projectId: string;
  taskId: string;
  artifact: {
    path: string;
    type: string;
    size?: number;
  };
}

// Task completed
interface TaskCompletedEvent {
  type: 'task_completed';
  timestamp: string;
  projectId: string;
  taskId: string;
  task?: string;
  output?: unknown;
  duration?: number;
}

// Task failed
interface TaskFailedEvent {
  type: 'task_failed';
  timestamp: string;
  projectId: string;
  taskId: string;
  task?: string;
  error?: string;
  output?: unknown;
}

// Task cancelled
interface TaskCancelledEvent {
  type: 'task_cancelled';
  timestamp: string;
  projectId: string;
  taskId: string;
  task?: string;
}
```

### WorkflowEvent (Workflow Events)

```typescript
type WorkflowEvent =
  | WorkflowExecutionCreatedEvent
  | WorkflowExecutionStartedEvent
  | WorkflowPhaseStartedEvent
  | WorkflowPhaseCompletedEvent
  | WorkflowExecutionCompletedEvent
  | WorkflowExecutionFailedEvent
  | WorkflowExecutionPausedEvent
  | WorkflowExecutionResumedEvent;

// Workflow execution created
interface WorkflowExecutionCreatedEvent {
  type: 'workflow_execution_created';
  timestamp: string;
  projectId: string;
  executionId: string;
  workflowId: string;
  input?: Record<string, unknown>;
}

// Workflow execution started
interface WorkflowExecutionStartedEvent {
  type: 'workflow_execution_started';
  timestamp: string;
  projectId: string;
  executionId: string;
  workflowId: string;
}

// Phase started
interface WorkflowPhaseStartedEvent {
  type: 'workflow_phase_started';
  timestamp: string;
  projectId: string;
  executionId: string;
  workflowId: string;
  phaseId: string;
  phase?: string;
}

// Phase completed
interface WorkflowPhaseCompletedEvent {
  type: 'workflow_phase_completed';
  timestamp: string;
  projectId: string;
  executionId: string;
  workflowId: string;
  phaseId: string;
  phase?: string;
  output?: unknown;
}

// Workflow execution completed
interface WorkflowExecutionCompletedEvent {
  type: 'workflow_execution_completed';
  timestamp: string;
  projectId: string;
  executionId: string;
  workflowId: string;
  output?: unknown;
  duration?: number;
}

// Workflow execution failed
interface WorkflowExecutionFailedEvent {
  type: 'workflow_execution_failed';
  timestamp: string;
  projectId: string;
  executionId: string;
  workflowId: string;
  error?: string;
}

// Workflow execution paused
interface WorkflowExecutionPausedEvent {
  type: 'workflow_execution_paused';
  timestamp: string;
  projectId: string;
  executionId: string;
  workflowId: string;
}

// Workflow execution resumed
interface WorkflowExecutionResumedEvent {
  type: 'workflow_execution_resumed';
  timestamp: string;
  projectId: string;
  executionId: string;
  workflowId: string;
}
```

### SandboxEvent (Sandbox Events)

```typescript
type SandboxEvent =
  | SandboxCreatedEvent
  | SandboxStartedEvent
  | SandboxStoppedEvent
  | SandboxErrorEvent;

// Sandbox created
interface SandboxCreatedEvent {
  type: 'sandbox_created';
  timestamp: string;
  projectId: string;
  sandboxId: string;
  image?: string;
}

// Sandbox started
interface SandboxStartedEvent {
  type: 'sandbox_started';
  timestamp: string;
  projectId: string;
  sandboxId: string;
}

// Sandbox stopped
interface SandboxStoppedEvent {
  type: 'sandbox_stopped';
  timestamp: string;
  projectId: string;
  sandboxId: string;
  exitCode?: number;
}

// Sandbox operation error
interface SandboxErrorEvent {
  type: 'sandbox_error';
  timestamp: string;
  projectId: string;
  sandboxId: string;
  error?: string;
}
```

## Complete Examples

### Core SDK Progress Tracking

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

class ProgressTracker {
  private client: AInTandemClient;

  constructor() {
    this.client = new AInTandemClient({
      baseURL: 'https://api.aintandem.com',
    });
  }

  async login(username: string, password: string) {
    await this.client.auth.login({ username, password });
  }

  // Track task and wait for completion
  async trackTask(projectId: string, taskId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let completed = false;

      this.client.subscribeToTask(
        projectId,
        taskId,
        (event) => {
          if (!completed) {
            console.log(`[${event.type}]`, event);
          }
        },
        (event) => {
          completed = true;
          console.log('Task completed:', event.output);
          resolve(event.output);
        },
        (event) => {
          completed = true;
          console.error('Task failed:', event.error);
          reject(new Error(event.error));
        }
      );
    });
  }

  // Track sandbox operation
  async trackSandboxOperation(projectId: string, sandboxId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let completed = false;

      this.client.subscribeToSandbox(
        projectId,
        (event) => {
          if (!completed) {
            console.log(`[${event.type}]`, event);
          }

          // When sandbox started
          if (event.type === 'sandbox_started') {
            completed = true;
            resolve();
          }

          // When error occurs
          if (event.type === 'sandbox_error') {
            completed = true;
            reject(new Error(event.error));
          }
        },
        sandboxId
      );
    });
  }
}

// Usage
const tracker = new ProgressTracker();
await tracker.login('user', 'pass');

// Track task
const result = await tracker.trackTask('project-123', 'task-id');
console.log('Final result:', result);

// Track sandbox operation
await tracker.trackSandboxOperation('project-123', 'sandbox-id');
```

### Real-time Terminal Output Display

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// Subscribe to task and receive real-time output
await client.subscribeToTask(
  'project-123',
  'task-id',
  (event) => {
    // Handle output event
    if (event.type === 'output') {
      // Append output to terminal
      console.log(event.output);
      // Or update UI display
      updateTerminalDisplay(event.output);
    }

    // Handle artifact file
    if (event.type === 'artifact') {
      console.log('Artifact file detected:', event.artifact);
      updateArtifactsList(event.artifact);
    }
  }
);
```

## Connection State Management

### Monitor Connection State Changes

```typescript
// Get Progress Client
const progress = client.getProgress();

// Subscribe to connection state changes
const unsubscribe = progress.onConnectionState(
  'project-123',
  (event) => {
    if (event.type === 'connected') {
      console.log('WebSocket connected');
    } else if (event.type === 'disconnected') {
      console.log('WebSocket disconnected:', event.reason);
      console.log('Will reconnect:', event.willReconnect);
    } else if (event.type === 'error') {
      console.error('WebSocket error:', event.error);
    }
  }
);

// Unsubscribe later
unsubscribe();
```

## Next Steps

- [Task Execution](./tasks.md) - Learn how to execute tasks
- [Workflow Management](./workflows.md) - Learn how to manage workflows
- [Sandbox Operations](./sandbox.md) - Learn how to manage sandboxes (if exists)

## FAQ

### Q: Do WebSocket connections automatically reconnect?

Yes, the SDK automatically attempts to reconnect, up to 10 retries, using exponential backoff strategy.

### Q: How to know if progress subscription failed?

Use `onConnectionState` to monitor connection state, or check `isConnected(projectId)`.

### Q: Can I subscribe to multiple tasks simultaneously?

Yes. Each subscription is independent. The SDK establishes one WebSocket connection per project.

### Q: How long is event history saved?

Events are stored in memory and deleted when connection is disconnected or manually cleared.

### Q: Is projectId required?

Yes. The Orchestrator API's WebSocket endpoint requires projectId as a path parameter.

### Q: Can I listen to events across projects?

Yes. Create independent subscriptions for each project. The SDK manages multiple WebSocket connections.

---

**Happy coding!** 📡
