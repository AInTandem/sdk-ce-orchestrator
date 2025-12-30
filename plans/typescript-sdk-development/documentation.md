# 文檔策略

## 文檔目標

提供完整、易懂、及時更新的文檔，讓開發者能夠快速上手並有效使用 SDK。

## 文檔結構

```
docs/
├── README.md                    # 專案首頁
├── getting-started/
│   ├── installation.md          # 安裝指南
│   ├── quick-start.md           # 快速開始
│   └── configuration.md         # 配置說明
├── guides/
│   ├── authentication.md        # 認證指南
│   ├── workflows.md             # 工作流使用
│   ├── tasks.md                 # 任務執行
│   ├── progress-tracking.md     # 進度追蹤
│   └── error-handling.md        # 錯誤處理
├── api/                          # API 參考（TypeDoc 生成）
│   ├── core/
│   │   ├── classes/
│   │   ├── interfaces/
│   │   └── modules/
│   └── react/
│       ├── functions/
│       └── components/
├── examples/                     # 程式碼範例
│   ├── basic-usage/
│   ├── react-app/
│   └── advanced/
└── migration/
    └── from-console-api.md      # 遷移指南
```

## 1. README.md

### 目標
提供專案概覽和快速開始。

### 內容結構

```markdown
# @aintandem/sdk

[![npm version](https://badge.fury.io/js/@aintandem/sdk.svg)](https://www.npmjs.com/package/@aintandem/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for AInTandem CE Orchestrator API.

## 特性

- 🚀 **Type-safe**: 完整的 TypeScript 類型支持
- ⚡ **輕量級**: 使用原生 Fetch API，無額外依賴
- 🔄 **Real-time**: WebSocket 進度追蹤
- 🎣 **React Hooks**: 預構建的 React 整合
- 📦 **Tree-shaking**: 按需導入，最小化 bundle

## 快速開始

### 安裝

\`\`\`bash
pnpm add @aintandem/sdk
\`\`\`

### 基礎使用

\`\`\`\`typescript
import { AInTandemClient } from '@aintandem/sdk';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// 登入
await client.auth.login({ username: 'user', password: 'pass' });

// 獲取工作流
const workflows = await client.workflows.listWorkflows();
\`\`\`\`

### React 整合

\`\`\`\`tsx
import { AInTandemProvider, useWorkflows } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
      <WorkflowList />
    </AInTandemProvider>
  );
}

function WorkflowList() {
  const { workflows, loading } = useWorkflows();

  if (loading) return <div>Loading...</div>;
  return <ul>{workflows.map(w => <li key={w.id}>{w.name}</li>)}</ul>;
}
\`\`\`\`

## 文檔

- [快速開始](./getting-started/quick-start.md)
- [API 參考](./api/)
- [使用指南](./guides/)
- [範例](./examples/)

## 授權

MIT
```

## 2. 快速開始指南

### 2.1 安裝指南 (`getting-started/installation.md`)

```markdown
# 安裝

## npm

\`\`\`bash
npm install @aintandem/sdk
\`\`\`

## pnpm

\`\`\`bash
pnpm add @aintandem/sdk
\`\`\`

## Yarn

\`\`\`bash
yarn add @aintandem/sdk
\`\`\`

## React 專案

\`\`\`bash
pnpm add @aintandem/sdk @aintandem/sdk-react
\`\`\`

## 瀏覽器支援

- Chrome ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- Edge ≥ 90

## TypeScript

SDK 使用 TypeScript 5.5+ 編寫，提供完整的類型定義。
```

### 2.2 快速開始 (`getting-started/quick-start.md`)

```markdown
# 快速開始

## 5 分鐘入門

### 1. 初始化客戶端

\`\`\`\`typescript
import { AInTandemClient } from '@aintandem/sdk';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});
\`\`\`\`

### 2. 認證

\`\`\`\`typescript
await client.auth.login({
  username: 'your-username',
  password: 'your-password',
});

// 檢查認證狀態
if (client.auth.isAuthenticated()) {
  console.log('Logged in!');
}
\`\`\`\`

### 3. 使用 API

\`\`\`\`typescript
// 列出所有工作流
const workflows = await client.workflows.listWorkflows();

// 獲取特定工作流
const workflow = await client.workflows.getWorkflow('workflow-id');

// 創建新工作流
const newWorkflow = await client.workflows.createWorkflow({
  name: 'My Workflow',
  description: 'Description',
  definition: {
    phases: [],
    transitions: [],
  },
});
\`\`\`\`

### 4. 執行任務

\`\`\`\`typescript
// 執行臨時任務
const result = await client.tasks.executeAdhoc('project-id', {
  title: 'Test Task',
  prompt: 'Write a test',
});
\`\`\`\`

### 5. 追蹤進度

\`\`\`\`typescript
import { ProgressClient } from '@aintandem/sdk';

const progress = new ProgressClient('project-id', {
  websocketUrl: 'wss://api.aintandem.com',
});

progress.onTaskProgress((event) => {
  console.log('Progress:', event.data);
});

progress.onTaskCompleted((event) => {
  console.log('Task completed!');
});
\`\`\`\`

## React 整合

詳見 [React 整合指南](../guides/react-integration.md)
```

## 3. 使用指南

### 3.1 認證指南 (`guides/authentication.md`)

```markdown
# 認證

## 登入

\`\`\`\`typescript
await client.auth.login({
  username: 'user',
  password: 'pass',
});
\`\`\`\`

## Token 管理

SDK 自動管理 token 存儲和刷新。

### 自動刷新

當 token 即將過期時，SDK 會自動刷新：

\`\`\`\`typescript
// SDK 會自動在過期前 5 分鐘刷新
// 無需手動處理
\`\`\`\`

### 手動刷新

\`\`\`\`typescript
await client.auth.refresh();
\`\`\`\`

## 登出

\`\`\`\`typescript
client.auth.logout();
\`\`\`\`

## 自訂 Token 存儲

\`\`\`\`typescript
class CustomTokenStorage {
  getToken() { /* ... */ }
  setToken(token) { /* ... */ }
  removeToken() { /* ... */ }
}

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
  storage: new CustomTokenStorage(),
});
\`\`\`\`

## React 認證

\`\`\`\`tsx
import { useAuth } from '@aintandem/sdk-react';

function LoginForm() {
  const { login, logout, isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.username}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="password" type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
\`\`\`\`
```

### 3.2 工作流指南 (`guides/workflows.md`)

```markdown
# 工作流

## 列出工作流

\`\`\`\`typescript
// 所有工作流
const workflows = await client.workflows.listWorkflows();

// 過濾狀態
const published = await client.workflows.listWorkflows('published');
\`\`\`\`

## 獲取工作流

\`\`\`\`typescript
const workflow = await client.workflows.getWorkflow('id');
\`\`\`\`

## 創建工作流

\`\`\`\`typescript
const workflow = await client.workflows.createWorkflow({
  name: 'My Workflow',
  description: 'Description',
  definition: {
    phases: [
      {
        id: 'phase1',
        title: 'Phase 1',
        titleEn: 'Phase 1',
        description: 'Description',
        color: '#00ff00',
        steps: [],
      },
    ],
    transitions: [],
  },
});
\`\`\`\`

## 更新工作流

\`\`\`\`typescript
const updated = await client.workflows.updateWorkflow('id', {
  name: 'Updated Name',
  description: 'New Description',
});
\`\`\`\`

## 變更狀態

\`\`\`\`typescript
// 發布
await client.workflows.changeWorkflowStatus('id', 'published');

// 歸檔
await client.workflows.changeWorkflowStatus('id', 'archived');

// 回到草稿
await client.workflows.changeWorkflowStatus('id', 'draft');
\`\`\`\`

## 版本管理

\`\`\`\`typescript
// 列出版本
const versions = await client.workflows.listVersions('id');

// 獲取特定版本
const version = await client.workflows.getVersion('version-id');
\`\`\`\`

## 克隆工作流

\`\`\`\`typescript
const cloned = await client.workflows.cloneWorkflow('id', {
  name: 'Cloned Workflow',
  description: 'A copy',
});
\`\`\`\`

## 刪除工作流

\`\`\`\`typescript
await client.workflows.deleteWorkflow('id');
\`\`\`\`

## React Hooks

\`\`\`\`tsx
import { useWorkflows, useWorkflow } from '@aintandem/sdk-react';

function WorkflowList() {
  const { workflows, loading, error } = useWorkflows('published');

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {workflows.map(w => (
        <li key={w.id}>{w.name}</li>
      ))}
    </ul>
  );
}

function WorkflowDetail({ id }) {
  const { workflow, update, changeStatus } = useWorkflow(id);

  const handlePublish = async () => {
    await changeStatus('published');
  };

  return (
    <div>
      <h1>{workflow?.name}</h1>
      <button onClick={handlePublish}>Publish</button>
    </div>
  );
}
\`\`\`\`
```

### 3.3 進度追蹤指南 (`guides/progress-tracking.md`)

```markdown
# 實時進度追蹤

## ProgressClient

\`\`\`\`typescript
import { ProgressClient } from '@aintandem/sdk';

const progress = new ProgressClient('project-id', {
  websocketUrl: 'wss://api.aintandem.com',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
});
\`\`\`\`

## 事件監聽

### 任務進度

\`\`\`\`typescript
progress.onTaskProgress((event) => {
  console.log('Task:', event.taskId);
  console.log('Progress:', event.data.progress);
  console.log('Message:', event.data.message);
});
\`\`\`\`

### 任務完成

\`\`\`\`typescript
progress.onTaskCompleted((event) => {
  console.log('Task completed:', event.taskId);
  console.log('Result:', event.data.result);
});
\`\`\`\`

### 任務失敗

\`\`\`\`typescript
progress.onTaskFailed((event) => {
  console.error('Task failed:', event.taskId);
  console.error('Error:', event.data.error);
});
\`\`\`\`

## React Hook

\`\`\`\`tsx
import { useProgress } from '@aintandem/sdk-react';

function TaskProgress({ projectId }) {
  const { events, isConnected, error } = useProgress(projectId);

  return (
    <div>
      <div>Connection: {isConnected ? '✅' : '❌'}</div>
      <ul>
        {events.map((event, i) => (
          <li key={i}>
            {event.type}: {JSON.stringify(event.data)}
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`\`

## 進度條組件

\`\`\`\`tsx
import { ProgressBar } from '@aintandem/sdk-react';

function TaskCard({ task }) {
  return (
    <div>
      <h3>{task.title}</h3>
      <ProgressBar taskId={task.id} projectId={task.projectId} />
    </div>
  );
}
\`\`\`\`

## 清理

\`\`\`\`typescript
// 組件卸載時自動清理
useEffect(() => {
  const client = new ProgressClient(projectId, config);

  return () => {
    client.close();
  };
}, [projectId]);
\`\`\`\`

## 事件類型

### task_queued
任務已加入隊列

### task_started
任務開始執行

### step_progress
步驟進度更新

### output
輸出內容

### artifact
新產物文件

### task_completed
任務完成

### task_failed
任務失敗

### task_cancelled
任務取消
```

### 3.4 錯誤處理指南 (`guides/error-handling.md`)

```markdown
# 錯誤處理

## 錯誤類型

### AInTandemError

所有錯誤的基類。

\`\`\`\`typescript
try {
  await client.workflows.getWorkflow('invalid-id');
} catch (error) {
  if (error instanceof AInTandemError) {
    console.error(error.code);      // 錯誤代碼
    console.error(error.message);   // 錯誤訊息
    console.error(error.statusCode);// HTTP 狀態碼
  }
}
\`\`\`\`

### NetworkError

網絡相關錯誤。

\`\`\`\`typescript
try {
  await client.workflows.listWorkflows();
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network issue:', error.message);
  }
}
\`\`\`\`

### AuthError

認證錯誤（401, 403）。

\`\`\`\`typescript
try {
  await client.auth.login({ username: 'x', password: 'y' });
} catch (error) {
  if (error instanceof AuthError) {
    if (error.statusCode === 401) {
      console.error('Invalid credentials');
    }
  }
}
\`\`\`\`

### ApiError

API 錯誤（4xx, 5xx）。

\`\`\`\`typescript
try {
  await client.workflows.deleteWorkflow('id');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Endpoint:', error.endpoint);
    console.error('Status:', error.statusCode);
  }
}
\`\`\`\`

## 全局錯誤處理

\`\`\`\`typescript
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
  interceptors: {
    response: [
      (response) => {
        if (!response.ok) {
          throw ApiError.fromResponse(response);
        }
        return response;
      },
    ],
  },
});
\`\`\`\`

## React 錯誤邊界

\`\`\`\`tsx
import { AInTandemErrorBoundary } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => console.error('SDK Error:', error)}
    >
      <MyComponent />
    </AInTandemErrorBoundary>
  );
}

function ErrorFallback() {
  return (
    <div>
      <h1>Something went wrong</h1>
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}
\`\`\`\`

## 用戶友善的錯誤訊息

\`\`\`\`typescript
function getErrorMessage(error: AInTandemError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return '網絡連接失敗，請檢查您的網絡設置';
    case 'AUTH_ERROR':
      return '登入已過期，請重新登入';
    case 'NOT_FOUND':
      return '找不到請求的資源';
    default:
      return error.message;
  }
}
\`\`\`\`
```

## 4. API 參考文檔

### 4.1 TypeDoc 配置

```json
// typedoc.json
{
  "entryPoints": [
    "packages/core/src/index.ts",
    "packages/react/src/index.ts"
  ],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "none",
  "excludePrivate": true,
  "excludeProtected": false,
  "categorizeByGroup": true,
  "categoryOrder": [
    "Client",
    "Services",
    "WebSocket",
    "Types",
    "React",
    "*"
  ],
  "kindSortOrder": [
    "Reference",
    "Class",
    "Interface",
    "TypeAlias",
    "*"
  ]
}
```

### 4.2 JSDoc 註釋標準

```typescript
/**
 * AInTandem API Client
 *
 * @example
 * ```typescript
 * const client = new AInTandemClient({
 *   baseURL: 'https://api.aintandem.com',
 * });
 * ```
 */
export class AInTandemClient {
  /**
   * Create a new client instance
   *
   * @param config - Client configuration
   * @param config.baseURL - API base URL
   * @param config.timeout - Request timeout in milliseconds (default: 30000)
   * @param config.retryCount - Number of retry attempts (default: 3)
   *
   * @throws {TypeError} When config is invalid
   *
   * @example
   * ```typescript
   * const client = new AInTandemClient({
   *   baseURL: 'https://api.aintandem.com',
   *   timeout: 60000,
   * });
   * ```
   */
  constructor(config: AInTandemClientConfig) {}

  /**
   * Authentication service
   *
   * @remarks
   * Provides methods for user authentication and token management.
   *
   * @example
   * ```typescript
   * await client.auth.login({ username: 'user', password: 'pass' });
   * ```
   */
  readonly auth: AuthService;

  /**
   * Workflow service
   *
   * @remarks
   * Manages workflow CRUD operations, versions, and executions.
   */
  readonly workflows: WorkflowService;
}
```

## 5. 程式碼範例

### 5.1 基礎使用 (`examples/basic-usage/`)

```typescript
// examples/basic-usage/index.ts
import { AInTandemClient } from '@aintandem/sdk';

async function main() {
  const client = new AInTandemClient({
    baseURL: process.env.API_BASE_URL!,
  });

  // Login
  await client.auth.login({
    username: process.env.API_USERNAME!,
    password: process.env.API_PASSWORD!,
  });

  console.log('✅ Logged in');

  // List workflows
  const workflows = await client.workflows.listWorkflows();
  console.log(`📋 Found ${workflows.length} workflows`);

  // Create workflow
  const workflow = await client.workflows.createWorkflow({
    name: 'Example Workflow',
    description: 'Created by SDK',
    definition: {
      phases: [],
      transitions: [],
    },
  });

  console.log(`✨ Created workflow: ${workflow.id}`);

  // Cleanup
  await client.workflows.deleteWorkflow(workflow.id);
  console.log('🗑️  Deleted workflow');
}

main().catch(console.error);
```

### 5.2 React 應用 (`examples/react-app/`)

```tsx
// examples/react-app/src/App.tsx
import { AInTandemProvider, useWorkflows } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
      <WorkflowDashboard />
    </AInTandemProvider>
  );
}

function WorkflowDashboard() {
  const { workflows, loading, error } = useWorkflows();

  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="dashboard">
      <h1>Workflows</h1>
      <ul>
        {workflows.map((w) => (
          <li key={w.id}>
            <h2>{w.name}</h2>
            <p>{w.description}</p>
            <span className={`status status-${w.status}`}>
              {w.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.3 進階範例 (`examples/advanced/`)

- 自訂攔截器
- 錯誤重試策略
- 進度追蹤實現
- 多項目管理

## 6. 遷移指南

### 6.1 從 Console API 遷移 (`migration/from-console-api.md`)

```markdown
# 從 Console API 遷移

## 概述

將現有的 Console 前端代碼遷移到新的 SDK。

## 步驟 1: 安裝 SDK

\`\`\`bash
pnpm add @aintandem/sdk @aintandem/sdk-react
\`\`\`

## 步驟 2: 配置 Provider

\`\`\`\`tsx
// src/main.tsx
import { AInTandemProvider } from '@aintandem/sdk-react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AInTandemProvider config={{ baseURL: import.meta.env.VITE_API_BASE_URL }}>
    <App />
  </AInTandemProvider>
);
\`\`\`\`

## 步驟 3: 替換 API 調用

### 舊代碼

\`\`\`\`typescript
import { listWorkflows } from '@/lib/api/workflows';

const workflows = await listWorkflows();
\`\`\`\`

### 新代碼

\`\`\`\`tsx
import { useWorkflows } from '@aintandem/sdk-react';

function Component() {
  const { workflows } = useWorkflows();
  return <div>{/* ... */}</div>;
}
\`\`\`\`

## API 對照表

| 舊 API | 新 SDK |
|--------|--------|
| \`login(credentials)\` | \`client.auth.login(credentials)\` |
| \`listWorkflows()\` | \`client.workflows.listWorkflows()\` |
| \`getWorkflow(id)\` | \`client.workflows.getWorkflow(id)\` |
| \`createWorkflow(...)\` | \`client.workflows.createWorkflow(...)\` |
| \`executeTask(...)\` | \`client.tasks.executeAdhoc(...)\` |

## 完整對照表

詳見完整的 [API 對照表](./api-mapping.md)
```

## 7. 文檔生成流程

### 7.1 本地預覽

```bash
# 生成 API 文檔
pnpm docs:generate

# 啟動本地伺服器
pnpm docs:dev
```

### 7.2 自動發布

```yaml
# .github/workflows/docs.yml
name: Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate docs
        run: |
          pnpm install
          pnpm docs:generate

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## 8. 文檔維護

### 8.1 文檔更新檢查清單

- [ ] README.md 版本號更新
- [ ] API 參考重新生成
- [ ] 使用指南更新
- [ ] 範例程式碼測試
- [ ] 截圖更新（如需要）
- [ ] 變更日誌更新

### 8.2 文檔審查流程

1. **Draft**: 在 PR 中新增或修改文檔
2. **Review**: 團隊成員審查
3. **Test**: 測試範例程式碼
4. **Merge**: 合併到 main
5. **Deploy**: 自動部署到文檔網站

## 9. 社群貢獻

### 9.1 貢獻指南

歡迎社群貢獻文檔改進！

### 9.2 文檔模板

```markdown
# 標題

簡短描述。

## 前提條件

- 前提 1
- 前提 2

## 步驟

1. 步驟 1
2. 步驟 2

## 程式碼範例

\`\`\`typescript
// 程式碼
\`\`\`

## 注意事項

- 注意 1
- 注意 2

## 相關文檔

- [相關文檔 1](./link1.md)
- [相關文檔 2](./link2.md)
```
