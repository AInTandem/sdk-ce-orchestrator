# Basic Usage Example

This is an example project demonstrating the basic features of the AInTandem TypeScript SDK.

## Features Demonstrated

This example covers the following features:

1. **User Authentication** - Login, Token verification
2. **Workflow Management** - List workflows, get details
3. **Task Execution** - Async task submission
4. **Task Query** - Get task details
5. **Task History** - Query historical records
6. **Queue Status** - View queue statistics
7. **Real-time Progress Tracking** - WebSocket progress subscription

## Install Dependencies

```bash
pnpm install
```

## Configure Environment Variables

Create a `.env` file:

```bash
# API configuration
API_BASE_URL=https://api.aintandem.com
API_USERNAME=your-username
API_PASSWORD=your-password
PROJECT_ID=your-project-id
```

Or directly modify the `CONFIG` object in `src/index.ts`.

## Run Example

```bash
# Development mode (hot reload)
pnpm dev

# Direct run
pnpm start

# Type check
pnpm typecheck
```

## Output Example

```
╔══════════════════════════════════════════════════════╗
║   AInTandem SDK - Basic Usage Example              ║
╚══════════════════════════════════════════════════════╝

=== Example 1: Authentication ===

✅ Login successful!
User: { username: 'demo-user', email: 'user@example.com' }
Access Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Is Authenticated: true
Token Valid: true

=== Example 2: List Workflows ===

✅ Found 3 published workflows:

1. Data Processing Pipeline
   ID: wf-123
   Description: Process sales data and generate reports
   Status: published

2. Model Training Workflow
   ID: wf-456
   Description: Train ML models on dataset
   Status: published
...
```

## Code Structure

```
basic-usage/
├── src/
│   └── index.ts          # Main program containing all examples
├── package.json
├── tsconfig.json
└── README.md
```

## Key Learning Points

### 1. Client Initialization

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});
```

### 2. Authentication

```typescript
// Login
const response = await client.auth.login({
  username: 'user',
  password: 'pass',
});

// Check authentication status
const isAuthenticated = client.auth.isAuthenticated();

// Verify Token
const isValid = await client.auth.verify();
```

### 3. Workflow Operations

```typescript
// List workflows
const workflows = await client.workflows.listWorkflows('published');

// Get details
const workflow = await client.workflows.getWorkflow('workflow-id');
```

### 4. Task Execution

```typescript
// Async task
const task = await client.tasks.executeTask(
  'project-123',
  {
    task: 'data-analysis',
    input: { dataset: 'sales-2024' },
  }
);

// Query task status
const details = await client.tasks.getTaskStatus('project-123', task.id);
```

### 5. Real-time Progress Tracking

```typescript
await client.subscribeToTask(
  'project-123',
  'task-id',
  (event) => console.log('Progress:', event),
  (event) => console.log('Completed:', event.output),
  (event) => console.error('Failed:', event.error)
);
```

## Next Steps

After completing this example, you can:

1. Check the [React Application Example](../react-app/) - Learn how to use SDK in React
2. Check the [Progress Tracking Example](../progress-tracking/) - Deep dive into real-time progress tracking
3. Read the [Usage Guides](../../docs/guides/) - Detailed feature documentation

## FAQ

### Q: How to get API credentials?

Please contact your AInTandem administrator or visit https://aintandem.com to register an account.

### Q: What if the example fails to run?

1. Check network connection
2. Verify API URL and credentials
3. Confirm project ID is correct
4. Check console error messages

### Q: How to modify the example code?

You can freely modify `src/index.ts` to try different features. Use `pnpm dev` for hot reloading code.

## License

MIT © AInTandem
