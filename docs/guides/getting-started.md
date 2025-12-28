# 快速開始指南

本指南將幫助您在 5 分鐘內開始使用 AInTandem TypeScript SDK。

## 安裝

### 使用 npm

```bash
# 核心 SDK
npm install @aintandem/sdk-core

# React 整合
npm install @aintandem/sdk-react
```

### 使用 pnpm

```bash
# 核心 SDK
pnpm add @aintandem/sdk-core

# React 整合
pnpm add @aintandem/sdk-react
```

### 使用 yarn

```bash
# 核心 SDK
yarn add @aintandem/sdk-core

# React 整合
yarn add @aintandem/sdk-react
```

## 基礎配置

### 1. 初始化客戶端

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

// 創建客戶端實例
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com', // 或您的 API URL
  timeout: 30000, // 可選：請求超時時間（毫秒）
});
```

### 2. 認證

```typescript
// 登入
const response = await client.auth.login({
  username: 'your-username',
  password: 'your-password',
});

console.log('登入成功:', response.user);

// 檢查認證狀態
if (client.auth.isAuthenticated()) {
  console.log('已認證');
}

// 登出
client.auth.logout();
```

## 核心功能

### 1. 獲取工作流列表

```typescript
// 獲取所有已發布的工作流
const workflows = await client.workflows.listWorkflows('published');

console.log('工作流列表:', workflows);

// 獲取特定工作流
const workflow = await client.workflows.getWorkflow('workflow-id');
console.log('工作流詳情:', workflow);
```

### 2. 執行任務

```typescript
// 同步執行任務
const task = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: {
    dataset: 'sales-2024',
    analysisType: 'trend',
  },
  async: false, // 同步執行
});

console.log('任務結果:', task.output);

// 異步執行任務
const asyncTask = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: { dataset: 'sales-2024' },
  async: true, // 異步執行
});

console.log('任務 ID:', asyncTask.id);
```

### 3. 追蹤任務進度

```typescript
// 訂閱實時任務進度
await client.subscribeToTask(
  'project-123',
  asyncTask.id,
  // 進度事件回調
  (event) => {
    console.log('進度更新:', event);
  },
  // 完成回調
  (event) => {
    console.log('任務完成:', event.output);
  },
  // 錯誤回調
  (event) => {
    console.error('任務失敗:', event.error);
  }
);
```

### 4. 獲取任務歷史

```typescript
// 獲取項目的任務歷史
const history = await client.tasks.getTaskHistory('project-123', {
  status: 'completed',
  limit: 10,
  offset: 0,
});

console.log('任務歷史:', history);
```

## React 應用整合

### 1. 設置 Provider

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemProvider
      config={{ baseURL: 'https://api.aintandem.com' }}
      onAuthSuccess={(user) => console.log('Logged in:', user)}
      onAuthError={(error) => console.error('Auth failed:', error)}
    >
      <YourApp />
    </AInTandemProvider>
  );
}
```

### 2. 使用認證 Hook

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
      // Error already handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" />
      <input name="password" type="password" placeholder="Password" />
      {error && <div className="error">{error.message}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 3. 使用工作流 Hooks

```tsx
import { useWorkflows } from '@aintandem/sdk-react';

function WorkflowList() {
  const { workflows, loading, error } = useWorkflows('published');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {workflows.map((workflow) => (
        <li key={workflow.id}>
          <h3>{workflow.name}</h3>
          <p>{workflow.description}</p>
          <span>Status: {workflow.status}</span>
        </li>
      ))}
    </ul>
  );
}
```

### 4. 使用進度追蹤組件

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
        {loading ? 'Executing...' : task ? `Task ID: ${task.id}` : 'Execute Task'}
      </button>

      {task && <ProgressTracker projectId={projectId} taskId={task.id} showEvents />}
    </div>
  );
}
```

## 錯誤處理

### 處理 API 錯誤

```typescript
import { AInTandemError } from '@aintandem/sdk-core';

try {
  const workflow = await client.workflows.getWorkflow('invalid-id');
} catch (error) {
  if (error instanceof AInTandemError) {
    console.error('錯誤代碼:', error.code);
    console.error('錯誤訊息:', error.message);
    console.error('HTTP 狀態:', error.statusCode);

    // 處理特定錯誤
    if (error.code === 'WORKFLOW_NOT_FOUND') {
      console.log('工作流不存在');
    }
  }
}
```

### React 錯誤邊界

```tsx
import { ErrorBoundary } from '@aintandem/sdk-react/components';

function App() {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong</div>}
      onError={(error, errorInfo) => {
        console.error('Caught error:', error);
        // 發送到錯誤追蹤服務
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

## TypeScript 類型

SDK 提供完整的 TypeScript 類型支持：

```typescript
import type {
  AInTandemClientConfig,
  Workflow,
  TaskResponse,
  TaskEvent,
  LoginRequest,
  LoginResponse,
} from '@aintandem/sdk-core';

// 使用類型
const config: AInTandemClientConfig = {
  baseURL: 'https://api.aintandem.com',
};

const handleTask = (task: TaskResponse) => {
  console.log('Task status:', task.status);
  console.log('Task output:', task.output);
};
```

## 下一步

現在您已經了解基礎用法，可以深入探索：

- [認證指南](./authentication.md) - 了解完整的認證流程
- [工作流管理](./workflows.md) - 管理和執行工作流
- [任務執行](./tasks.md) - 深入了解任務執行
- [實時進度追蹤](./real-time-progress.md) - WebSocket 進度追蹤詳解

## 完整範例

查看 [範例專案](../examples/) 以獲取更多完整的使用範例：

- [基礎使用](../examples/basic-usage/) - 純 TypeScript/JavaScript 使用
- [React 應用](../examples/react-app/) - 完整的 React 應用範例
- [進度追蹤](../examples/progress-tracking/) - 進階進度追蹤功能

## 常見問題

### Q: 如何設置請求超時？

```typescript
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
  timeout: 30000, // 30 秒
});
```

### Q: 如何自動刷新 Token？

SDK 會自動處理 Token 刷新。當 API 返回 401 錯誤時，SDK 會自動嘗試使用 refresh token 獲取新的 access token。

### Q: React Hooks 會自動重新請求數據嗎？

是的，大部分 Hooks 會在組件掛載時自動獲取數據。您可以依賴返回的 `loading` 和 `error` 狀態。

### Q: 如何取消 WebSocket 訂閱？

```typescript
// 方法 1：使用返回的 unsubscribe 函數
const unsubscribe = await client.subscribeToTask(...);
// 稍後取消訂閱
unsubscribe();

// 方法 2：使用 React Hooks（自動清理）
const { events } = useTaskProgress(projectId, taskId);
// 當組件卸載時會自動取消訂閱
```

## 支援

如有任何問題，請：

1. 查看 [API 參考文檔](../api.md)
2. 查看 [使用指南](./)
3. 提交 [Issue](https://github.com/aintandem/typescript-sdk/issues)

---

**享受使用 AInTandem SDK！** 🚀
