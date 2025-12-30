# Task Execution Guide

This guide explains how to use the AInTandem SDK to execute and manage tasks (Tasks), including synchronous/asynchronous execution, task history queries, and queue status monitoring.

## Overview

Tasks are the basic execution unit of AInTandem. Each task represents a specific operation, such as data extraction, analysis, model training, etc. Tasks can be executed synchronously or asynchronously, and support real-time progress tracking.

## Core SDK Usage

### 1. Initialize Client

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// Login
await client.auth.login({ username: 'user', password: 'pass' });
```

### 2. Execute Predefined Task

```typescript
// Execute predefined task
const response = await client.tasks.executeTask(
  'project-123',  // projectId (required)
  {
    task: 'data-analysis',
    input: {
      dataset: 'sales-2024',
      analysisType: 'trend',
    },
  }
);

console.log('Task ID:', response.taskId);
console.log('Message:', response.message);
```

### 3. Execute Ad-hoc Task

```typescript
// Execute one-time, undefined task
const response = await client.tasks.executeAdhocTask(
  'project-123',  // projectId (required)
  {
    prompt: 'Analyze this CSV data and generate report',
    input: {
      file: 'data/sales-2024.csv',
    },
  }
);

console.log('Ad-hoc task created:', response.taskId);
```

### 4. Get Task Status

```typescript
// Get specific task details
const task = await client.tasks.getTaskStatus('project-123', 'task-id');

console.log('Task ID:', task.id);
console.log('Task status:', task.status);
console.log('Created at:', task.createdAt);
console.log('Completed at:', task.completedAt);
console.log('Output:', task.output);
console.log('Error:', task.error);
```

### 5. Cancel Task

```typescript
// Cancel running task
await client.tasks.cancelTask('project-123', 'task-id');
console.log('Task cancelled');
```

### 6. Get Task History

```typescript
// Get task history for project
const history = await client.tasks.listTaskHistory('project-123', {
  status: 'completed', // Optional: filter by status
  limit: 10,           // Optional: limit return count
  offset: 0,           // Optional: offset
});

console.log('Task history:', history);

// Count task statuses
const stats = {
  total: history.length,
  completed: history.filter(t => t.status === 'completed').length,
  failed: history.filter(t => t.status === 'failed').length,
  running: history.filter(t => t.status === 'running').length,
};

console.log('Task statistics:', stats);
```

### 7. Get Queue Status

```typescript
// Get task queue status for project
const queueStatus = await client.tasks.getQueueStatus('project-123');

console.log('Queue status:', queueStatus);
console.log('Pending tasks:', queueStatus.pending);
console.log('Running tasks:', queueStatus.running);
console.log('Completed tasks:', queueStatus.completed);
console.log('Failed tasks:', queueStatus.failed);
```

### 8. Set Concurrent Task Limit

```typescript
// Set maximum concurrent tasks for project
const response = await client.tasks.setTaskLimit('project-123', {
  maxConcurrent: 5,
});

console.log('New limit:', response.maxConcurrent);
```

### 9. Execute Workflow Step

```typescript
// Directly execute specific step in workflow
const response = await client.tasks.executeWorkflowStep(
  'project-123',
  'step-id',
  {
    additionalInput: 'Additional input',
    parameters: { param1: 'value1' },
  }
);

console.log('Task ID:', response.taskId);
```

### 10. Get Relevant Context

```typescript
// Get context memories related to task prompt
const context = await client.tasks.getRelevantContext('project-123', {
  prompt: 'Analyze sales data',
  maxMemories: 10,
  types: ['dataset', 'analysis'],
  includeWorkspace: true,
  includeOrg: false,
});

console.log('Relevant context:', context.memories);
```

### 11. Save Task Output as Context

```typescript
// Save task output as context memory
const response = await client.tasks.saveTaskOutput('project-123', 'task-id', {
  memoryType: 'analysis_result',
  tags: ['sales', 'trend-analysis'],
});

console.log('Output saved:', response.memoryId);
```

## Task States

Tasks have the following states:

- `pending`: Waiting to execute
- `queued`: Added to queue
- `running`: Executing
- `completed`: Execution completed
- `failed`: Execution failed
- `cancelled`: Cancelled

```typescript
// Check task status
const task = await client.tasks.getTaskStatus('project-123', 'task-id');

switch (task.status) {
  case 'pending':
    console.log('Task pending');
    break;
  case 'queued':
    console.log('Task in queue');
    break;
  case 'running':
    console.log('Task running');
    break;
  case 'completed':
    console.log('Task completed:', task.output);
    break;
  case 'failed':
    console.error('Task failed:', task.error);
    break;
  case 'cancelled':
    console.log('Task cancelled');
    break;
}
```

## Task Progress Tracking

Subscribe to tasks to receive real-time progress updates:

```typescript
// Subscribe to task progress
await client.subscribeToTask(
  'project-123',
  'task-id',
  // Progress event callback
  (event) => {
    console.log('Task progress update:', event);
    // Event types include:
    // - 'task_queued': Task added to queue
    // - 'task_started': Task started execution
    // - 'step_progress': Step progress update
    // - 'output': Terminal output fragment
    // - 'artifact': Artifact file detected
    // - 'task_completed': Task completed
    // - 'task_failed': Task failed
    // - 'task_cancelled': Task cancelled
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

For detailed progress tracking guide, see: [Real-time Progress Tracking](./real-time-progress.md)

## Complete Examples

### Execute and Track Task

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

class TaskManager {
  private client: AInTandemClient;

  constructor() {
    this.client = new AInTandemClient({
      baseURL: 'https://api.aintandem.com',
    });
  }

  async login(username: string, password: string) {
    await this.client.auth.login({ username, password });
  }

  // Execute task and wait for completion
  async executeAndWait(
    projectId: string,
    taskName: string,
    input: Record<string, unknown>
  ): Promise<unknown> {
    // 1. Execute task
    const response = await this.client.tasks.executeTask(projectId, {
      task: taskName,
      input,
    });

    const taskId = response.taskId;
    console.log('Task submitted:', taskId);

    // 2. Wait for completion
    return new Promise((resolve, reject) => {
      this.client.subscribeToTask(
        projectId,
        taskId,
        (event) => {
          console.log(`[${event.type}]`, event);
        },
        (event) => {
          console.log('Task completed:', event.output);
          resolve(event.output);
        },
        (event) => {
          console.error('Task failed:', event.error);
          reject(new Error(event.error));
        }
      );
    });
  }

  // Batch execute multiple tasks
  async executeBatch(
    projectId: string,
    tasks: Array<{ task: string; input: Record<string, unknown> }>
  ): Promise<unknown[]> {
    const results: unknown[] = [];

    for (const taskSpec of tasks) {
      const result = await this.executeAndWait(
        projectId,
        taskSpec.task,
        taskSpec.input
      );
      results.push(result);
    }

    return results;
  }
}

// Usage
const manager = new TaskManager();
await manager.login('user', 'pass');

// Execute single task
const result = await manager.executeAndWait(
  'project-123',
  'data-analysis',
  { dataset: 'sales-2024' }
);
console.log('Final result:', result);

// Batch execute
const batchResults = await manager.executeBatch('project-123', [
  { task: 'data-extraction', input: { source: 'database' } },
  { task: 'data-cleaning', input: { dataset: 'raw' } },
  { task: 'data-analysis', input: { dataset: 'cleaned' } },
]);
```

### Real-time Terminal Output Display

```typescript
class TerminalDisplay {
  private client: AInTandemClient;

  constructor(client: AInTandemClient) {
    this.client = client;
  }

  // Execute task and display real-time output
  async executeWithTerminal(
    projectId: string,
    taskName: string,
    input: Record<string, unknown>
  ): Promise<void> {
    // 1. Execute task
    const response = await this.client.tasks.executeTask(projectId, {
      task: taskName,
      input,
    });

    // 2. Subscribe to progress
    await this.client.subscribeToTask(
      projectId,
      response.taskId,
      (event) => {
        if (event.type === 'output') {
          // Display terminal output
          this.printToTerminal(event.output);
        } else if (event.type === 'artifact') {
          // Display artifact file
          console.log('📁 Artifact file:', event.artifact.path);
        } else if (event.type === 'step_progress') {
          // Display progress
          const percent = event.progress || 0;
          console.log(`📊 Progress: ${percent}% - ${event.message}`);
        }
      }
    );
  }

  private printToTerminal(output: string): void {
    // Append output to terminal
    process.stdout.write(output);
  }
}
```

## Managing Async Operations

### Get Operation Status

Sandbox-related async operations return `operationId`, which can be used to query operation progress:

```typescript
// Start sandbox (async)
const response = await client.sandboxes.startSandboxAsync('sandbox-id');
console.log('Operation ID:', response.operationId);

// Query operation status
const status = await client.sandboxes.getOperationStatus(response.operationId);

console.log('Operation status:', status.status);
console.log('Progress:', status.progress);
console.log('Steps:', status.steps);

// Query all operations for project
const operations = await client.sandboxes.getProjectOperations('project-123');
console.log('Project operations:', operations.operations);
```

## Next Steps

- [Real-time Progress Tracking](./real-time-progress.md) - Learn how to monitor task progress
- [Workflow Management](./workflows.md) - Learn how to manage workflows
- [Sandbox Operations](./sandbox.md) - Learn how to manage sandboxes (if exists)

## FAQ

### Q: What's the difference between sync and async execution?

Sync execution waits for task completion and returns result, suitable for short tasks. Async execution returns task ID immediately, task runs in background, suitable for long tasks.

### Q: How to know if task is completed?

Use `getTaskStatus()` to query status, or use `subscribeToTask()` to subscribe to real-time progress.

### Q: Can I cancel running tasks?

Yes, use `cancelTask()` method.

### Q: How long is task output saved?

Task output is saved on server and can be retrieved via `getTaskOutput()`. Use `saveTaskOutput()` to save output as context memory.

### Q: Are tasks in queue executed in order?

Tasks are executed on FIFO (First In, First Out) principle, but you can set concurrency count via `setTaskLimit()`.

### Q: Is projectId required?

Yes. All task operations require specifying project ID.

---

**Happy coding!** ⚡
