# React Application Example

這是一個展示如何在 React 應用中使用 AInTandem TypeScript SDK 的完整範例。

## 功能展示

本範例展示以下功能：

1. **Provider 配置** - AInTandemProvider 設置
2. **認證整合** - 使用 useAuth hook
3. **錯誤邊界** - ErrorBoundary 組件
4. **工作流管理** - 使用 useWorkflows 和 useWorkflow hooks
5. **任務執行** - 使用 useExecuteTask hook
6. **實時進度追蹤** - 使用 useTaskProgress 和 ProgressTracker 組件
7. **UI 組件** - ProgressBar, CircularProgress 等預構建組件

## 安裝依賴

```bash
pnpm install
```

## 配置環境變量

創建 `.env` 文件：

```bash
VITE_API_BASE_URL=https://api.aintandem.com
VITE_PROJECT_ID=demo-project
```

## 運行範例

```bash
# 開發模式
pnpm dev

# 建置生產版本
pnpm build

# 預覽生產版本
pnpm preview

# 類型檢查
pnpm typecheck
```

訪問 http://localhost:5173

## 程式碼結構

```
react-app/
├── src/
│   ├── main.tsx           # 應用入口
│   ├── App.tsx            # 主應用組件
│   ├── components/
│   │   ├── Dashboard.tsx      # 儀表板組件
│   │   ├── LoginForm.tsx      # 登入表單
│   │   ├── WorkflowList.tsx   # 工作流列表
│   │   ├── WorkflowCard.tsx   # 工作流卡片
│   │   ├── TaskList.tsx       # 任務列表
│   │   ├── TaskExecutor.tsx   # 任務執行器
│   │   └── LogoutButton.tsx   # 登出按鈕
│   └── types/
│       └── index.tsx          # 類型定義
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 關鍵組件說明

### 1. App.tsx - 主應用

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

### 2. LoginForm.tsx - 登入表單

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

### 3. WorkflowList.tsx - 工作流列表

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

### 4. TaskExecutor.tsx - 任務執行器

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

## 使用的 Hooks

### useAuth
認證管理，提供 login/logout 功能

### useWorkflows
工作流列表管理

### useWorkflow
單個工作流詳情和操作

### useExecuteTask
任務執行

### useTaskProgress
實時任務進度追蹤

### useTaskHistory
任務歷史查詢

### useQueueStatus
隊列狀態監控

## 使用的組件

### ErrorBoundary
錯誤邊界組件

### ProgressBar
線性進度條

### CircularProgress
圓形進度條

### ProgressTracker
完整進度追蹤組件

### CompactProgressTracker
緊湊進度追蹤組件

## 樣式

本範例使用基本 CSS，您可以自由替換成：
- Tailwind CSS
- CSS Modules
- Styled Components
- emotion

只需更新 vite.config.ts 中的 CSS 配置即可。

## 下一步

完成本範例後，您可以：

1. 查看 [基礎使用範例](../basic-usage/) - 了解核心 SDK 功能
2. 查看 [進度追蹤範例](../progress-tracking/) - 深入了解進度追蹤
3. 閱讀 [使用指南](../../docs/guides/) - 詳細的功能文檔

## 常見問題

### Q: 如何自定義樣式？

您可以修改 CSS 文件或替換成您喜歡的 CSS-in-JS 方案。

### Q: 如何添加路由？

安裝 react-router-dom 並在 App.tsx 中配置路由。

### Q: 如何處理全局錯誤？

ErrorBoundary 已配置，您可以在 onError 回調中添加錯誤上報邏輯。

## 授權

MIT © AInTandem
