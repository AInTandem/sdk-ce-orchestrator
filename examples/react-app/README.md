# React Application Example

This is a complete example demonstrating how to use the AInTandem TypeScript SDK in a React application.

## Features Demonstrated

This example showcases the following features:

1. **Provider Configuration** - AInTandemProvider setup
2. **Authentication Integration** - Using useAuth hook
3. **Error Boundary** - ErrorBoundary component
4. **Workflow Management** - Using useWorkflows and useWorkflow hooks
5. **Task Execution** - Using useExecuteTask hook
6. **Real-time Progress Tracking** - Using useTaskProgress and ProgressTracker components
7. **UI Components** - Pre-built components like ProgressBar, CircularProgress

## Install Dependencies

```bash
pnpm install
```

## Configure Environment Variables

Create a `.env` file:

```bash
VITE_API_BASE_URL=https://api.aintandem.com
VITE_PROJECT_ID=demo-project
```

## Run Example

```bash
# Development mode
pnpm dev

# Build production version
pnpm build

# Preview production version
pnpm preview

# Type check
pnpm typecheck
```

Visit http://localhost:5173

## Code Structure

```
react-app/
├── src/
│   ├── main.tsx           # App entry point
│   ├── App.tsx            # Main app component
│   ├── components/
│   │   ├── Dashboard.tsx      # Dashboard component
│   │   ├── LoginForm.tsx      # Login form
│   │   ├── WorkflowList.tsx   # Workflow list
│   │   ├── WorkflowCard.tsx   # Workflow card
│   │   ├── TaskList.tsx       # Task list
│   │   ├── TaskExecutor.tsx   # Task executor
│   │   └── LogoutButton.tsx   # Logout button
│   └── types/
│       └── index.tsx          # Type definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Key Component Descriptions

### 1. App.tsx - Main Application

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';
import { ErrorBoundary } from '@aintandem/sdk-react/components';

function App() {
  return (
    <ErrorBoundary>
      <AInTandemProvider
        config={{ baseURL: 'https://api.aintandem.com' }}
        onAuthSuccess={(user) => console.log('Logged in:', user)}
        onAuthError={(error) => console.error('Auth error:', error)}
      >
        <MainApp />
      </AInTandemProvider>
    </ErrorBoundary>
  );
}
```

### 2. LoginForm.tsx - Login Form

```tsx
import { useAuth } from '@aintandem/sdk-react';

function LoginForm() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await login({
        username: formData.get('username') as string,
        password: formData.get('password') as string,
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 3. WorkflowList.tsx - Workflow List

```tsx
import { useWorkflows } from '@aintandem/sdk-react';

function WorkflowList() {
  const { workflows, loading, error, create } = useWorkflows('published');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {workflows.map(workflow => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  );
}
```

### 4. TaskExecutor.tsx - Task Executor

```tsx
import { useExecuteTask } from '@aintandem/sdk-react';
import { ProgressTracker } from '@aintandem/sdk-react/components';

function TaskExecutor({ projectId }: { projectId: string }) {
  const { execute, task, loading } = useExecuteTask(
    projectId,
    'data-analysis',
    { dataset: 'sales-2024' }
  );

  return (
    <div>
      <button onClick={execute} disabled={loading || !!task}>
        {loading ? 'Executing...' : 'Execute Task'}
      </button>

      {task && (
        <ProgressTracker
          projectId={projectId}
          taskId={task.id}
          showEvents
        />
      )}
    </div>
  );
}
```

## Hooks Used

### useAuth
Authentication management, provides login/logout functionality

### useWorkflows
Workflow list management

### useWorkflow
Single workflow details and operations

### useExecuteTask
Task execution

### useTaskProgress
Real-time task progress tracking

### useTaskHistory
Task history querying

### useQueueStatus
Queue status monitoring

## Components Used

### ErrorBoundary
Error boundary component

### ProgressBar
Linear progress bar

### CircularProgress
Circular progress bar

### ProgressTracker
Complete progress tracking component

### CompactProgressTracker
Compact progress tracking component

## Styling

This example uses basic CSS. You can freely replace it with:
- Tailwind CSS
- CSS Modules
- Styled Components
- emotion

Just update the CSS configuration in vite.config.ts.

## Next Steps

After completing this example, you can:

1. Check the [Basic Usage Example](../basic-usage/) - Learn about core SDK features
2. Check the [Progress Tracking Example](../progress-tracking/) - Deep dive into progress tracking
3. Read the [Usage Guides](../../docs/guides/) - Detailed feature documentation

## FAQ

### Q: How to customize styles?

You can modify CSS files or replace with your preferred CSS-in-JS solution.

### Q: How to add routing?

Install react-router-dom and configure routes in App.tsx.

### Q: How to handle global errors?

ErrorBoundary is configured, you can add error reporting logic in the onError callback.

## License

MIT © AInTandem
