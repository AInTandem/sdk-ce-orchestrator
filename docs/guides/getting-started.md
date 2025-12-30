# Getting Started Guide

This guide will help you get started with the AInTandem TypeScript SDK in 5 minutes.

## Installation

### Using npm

```bash
# Core SDK
npm install @aintandem/sdk-core

# React integration
npm install @aintandem/sdk-react
```

### Using pnpm

```bash
# Core SDK
pnpm add @aintandem/sdk-core

# React integration
pnpm add @aintandem/sdk-react
```

### Using yarn

```bash
# Core SDK
yarn add @aintandem/sdk-core

# React integration
yarn add @aintandem/sdk-react
```

## Basic Configuration

### 1. Initialize Client

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

// Create client instance
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com', // Or your API URL
  timeout: 30000, // Optional: Request timeout (milliseconds)
  retryCount: 3,  // Optional: Number of retries on failure
  retryDelay: 1000, // Optional: Retry delay (milliseconds)
});
```

### 2. Authentication

```typescript
// Login
const response = await client.auth.login({
  username: 'your-username',
  password: 'your-password',
});

console.log('Login successful:', response.user);
console.log('Token:', response.token);

// Check authentication status
if (client.auth.isAuthenticated()) {
  console.log('Authenticated');
}

// Get current token
const token = client.auth.getToken();
console.log('Token:', token);

// Logout
client.auth.logout();
```

## Core Features

### 1. Get Workflow List

```typescript
// Get all published workflows
const workflows = await client.workflows.listWorkflows();

console.log('Workflow list:', workflows);

// Get specific workflow
const workflow = await client.workflows.getWorkflow('workflow-id');
console.log('Workflow details:', workflow);
```

### 2. Execute Task

```typescript
// Execute task
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

// Get task status
const task = await client.tasks.getTaskStatus('project-123', response.taskId);
console.log('Task status:', task.status);
```

### 3. Track Task Progress

```typescript
// Subscribe to real-time task progress
await client.subscribeToTask(
  'project-123',
  'task-id',
  // Progress event callback
  (event) => {
    console.log('Progress update:', event.type);
    // Event types include:
    // - 'task_queued': Task added to queue
    // - 'task_started': Task started execution
    // - 'step_progress': Step progress update
    // - 'output': Terminal output fragment
    // - 'artifact': Artifact file detected
    // - 'task_completed': Task completed
    // - 'task_failed': Task failed
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

### 4. Get Task History

```typescript
// Get task history for project
const history = await client.tasks.listTaskHistory('project-123', {
  status: 'completed',
  limit: 10,
  offset: 0,
});

console.log('Task history:', history);
```

### 5. Manage Sandboxes

```typescript
// List all sandboxes
const sandboxes = await client.sandboxes.listSandboxes();
console.log('Sandbox list:', sandboxes);

// Create sandbox
const sandbox = await client.sandboxes.createSandbox({
  projectId: 'project-123',
  name: 'my-sandbox',
  image: 'python:3.11',
});
console.log('Sandbox ID:', sandbox.id);

// Start sandbox asynchronously (recommended for long operations)
const operation = await client.sandboxes.startSandboxAsync(sandbox.id);
console.log('Operation ID:', operation.operationId);

// Query operation status
const status = await client.sandboxes.getOperationStatus(operation.operationId);
console.log('Operation status:', status.status);
console.log('Progress:', status.progress.percentage + '%');
```

## WebSocket Progress Tracking

The SDK provides full WebSocket support for tracking task and sandbox operation progress.

### WebSocket Connection Format

The Orchestrator API WebSocket endpoint format is:
```
ws://localhost:9900/api/progress/subscribe/{projectId}?token={jwt}
```

The SDK automatically handles URL construction and token attachment.

### Using ProgressClient

```typescript
// Get Progress Client
const progress = client.getProgress();

// Connect to specific project
await progress.connect('project-123');

// Subscribe to all progress events for the project
const subscription = await progress.subscribeToProgress(
  'project-123',
  (event) => {
    console.log('Progress event:', event.type);
  }
);

// Unsubscribe
subscription.unsubscribe();

// Disconnect
progress.disconnect('project-123');
```

## Complete Examples

### Basic Task Execution and Tracking

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

async function main() {
  // 1. Initialize client
  const client = new AInTandemClient({
    baseURL: 'https://api.aintandem.com',
  });

  // 2. Login
  await client.auth.login({ username: 'user', password: 'pass' });

  // 3. Execute task
  const response = await client.tasks.executeTask(
    'project-123',
    {
      task: 'data-analysis',
      input: { dataset: 'sales-2024' },
    }
  );

  console.log('Task submitted:', response.taskId);

  // 4. Track progress and wait for completion
  await client.subscribeToTask(
    'project-123',
    response.taskId,
    (event) => {
      if (event.type === 'output') {
        console.log('Output:', event.output);
      } else if (event.type === 'step_progress') {
        console.log(`Progress: ${event.progress}% - ${event.message}`);
      }
    },
    (event) => {
      console.log('Task completed:', event.output);
    },
    (event) => {
      console.error('Task failed:', event.error);
    }
  );
}

main().catch(console.error);
```

### Sandbox Operation Tracking

```typescript
async function manageSandbox() {
  const client = new AInTandemClient({
    baseURL: 'https://api.aintandem.com',
  });

  await client.auth.login({ username: 'user', password: 'pass' });

  // Create and start sandbox
  const sandbox = await client.sandboxes.createSandbox({
    projectId: 'project-123',
    name: 'analysis-sandbox',
    image: 'python:3.11',
  });

  // Start asynchronously
  const operation = await client.sandboxes.startSandboxAsync(sandbox.id);

  // Track startup progress
  await client.subscribeToSandbox(
    'project-123',
    (event) => {
      console.log('Sandbox event:', event.type);
      if (event.type === 'sandbox_started') {
        console.log('Sandbox started');
      }
    },
    sandbox.id
  );
}

manageSandbox().catch(console.error);
```

## React Application Integration

### 1. Set Up Provider

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
      <YourApp />
    </AInTandemProvider>
  );
}
```

### 2. Using Hooks

```tsx
import { useTaskProgress } from '@aintandem/sdk-react';

function TaskMonitor({ taskId }: { taskId: string }) {
  const { events, isConnected } = useTaskProgress('project-123', taskId);

  return (
    <div>
      <p>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <ul>
        {events.map((event, index) => (
          <li key={index}>{event.type}: {JSON.stringify(event)}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Error Handling

The SDK provides comprehensive error handling:

```typescript
import {
  AInTandemError,
  NetworkError,
  AuthError,
  ApiError,
  ValidationError,
} from '@aintandem/sdk-core';

try {
  await client.tasks.executeTask('project-123', { task: 'test' });
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof AuthError) {
    console.error('Authentication error:', error.message);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.message, error.statusCode);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message, error.errors);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Next Steps

- [Authentication Guide](./authentication.md) - Learn about authentication mechanisms
- [Task Execution](./tasks.md) - Deep dive into task management
- [Real-time Progress Tracking](./real-time-progress.md) - Learn about progress tracking features
- [Workflow Management](./workflows.md) - Learn about workflow operations

## FAQ

### Q: How to set request timeout?

Set the `timeout` parameter when initializing the client (in milliseconds).

### Q: Will token refresh automatically when expired?

Yes, the SDK automatically detects 401 errors and attempts to refresh the token.

### Q: Will WebSocket connections automatically reconnect?

Yes, the SDK automatically reconnects, up to 10 retries.

### Q: Is projectId required?

Yes. All task, sandbox, and progress tracking operations require a project ID.

### Q: How to monitor progress for multiple projects?

Create independent subscriptions for each project. The SDK manages multiple WebSocket connections.

---

**Happy coding!** 🚀
