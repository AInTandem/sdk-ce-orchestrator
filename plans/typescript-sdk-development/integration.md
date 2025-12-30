# 與現有專案的整合策略

## 概述

本文檔描述如何將 TypeScript SDK 與現有的 Orchestrator 和 Console 專案整合。

## 1. 與 Orchestrator 的整合

### 1.1 OpenAPI 規範同步

**目標**: 自動從 Orchestrator 的 OpenAPI 規範生成 SDK 類型。

#### 流程

```
Orchestrator (dist/swagger.json)
    ↓
CI/CD Workflow (sync-types.yml)
    ↓
SDK (scripts/sync-types.ts)
    ↓
自動生成類型 (packages/core/src/types/generated/)
    ↓
創建 Pull Request
```

#### 實施步驟

**步驟 1: 配置 GitHub Actions**

```yaml
# .github/workflows/sync-types.yml
name: Sync OpenAPI Types

on:
  schedule:
    - cron: '0 0 * * *'  # 每日午夜
  workflow_dispatch:      # 手動觸發

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout orchestrator
        uses: actions/checkout@v4
        with:
          path: orchestrator

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build orchestrator
        working-directory: ./orchestrator
        run: |
          pnpm install
          pnpm build:api

      - name: Checkout SDK
        uses: actions/checkout@v4
        with:
          path: sdk
          ref: main

      - name: Generate types
        working-directory: ./sdk
        run: |
          pnpm install
          pnpm generate-types

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          path: sdk
          token: ${{ secrets.GITHUB_TOKEN }}
          branch: chore/sync-types
          title: 'chore: sync OpenAPI types'
          body: 'Auto-generated from orchestrator OpenAPI spec'
          commit-message: 'chore: sync types from OpenAPI'
          add-paths: |
            packages/core/src/types/generated/**
```

**步驟 2: 本地開發腳本**

```typescript
// scripts/sync-types.ts
import { execSync } from 'child_process';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

async function syncTypes() {
  console.log('🔄 Syncing types from Orchestrator...');

  const orchestratorPath = join(__dirname, '../orchestrator');
  const openApiPath = join(orchestratorPath, 'dist/swagger.json');

  // 檢查 OpenAPI 規範是否存在
  if (!existsSync(openApiPath)) {
    console.log('⚠️  OpenAPI spec not found, building orchestrator...');
    execSync('pnpm build:api', { cwd: orchestratorPath, stdio: 'inherit' });
  }

  // 生成類型
  console.log('🔧 Generating types...');
  execSync('tsx scripts/generate-types.ts', { stdio: 'inherit' });

  console.log('✅ Types synced successfully!');
}

syncTypes().catch(console.error);
```

**步驟 3: package.json 腳本**

```json
{
  "scripts": {
    "sync-types": "tsx scripts/sync-types.ts",
    "generate-types": "tsx scripts/generate-types.ts"
  }
}
```

### 1.2 版本同步策略

**策略**: SDK 版本追蹤 Orchestrator API 版本。

```json
{
  "name": "@aintandem/sdk-core",
  "version": "0.5.1-alpha.1",
  "peerDependencies": {
    "@aintandem/api-types": "0.5.1-alpha.1"
  }
}
```

### 1.3 共享類型定義

**選項 1: 共享包 (推薦)**

創建 `@aintandem/api-types` 包：

```
sdk/packages/types/
├── src/
│   ├── generated/    # 從 OpenAPI 生成
│   └── manual/       # 手動定義
└── package.json
```

**選項 2: 直接複製**

SDK 內部生成類型，不共享。

**選項 3: Runtime 導入**

從 orchestrator runtime 導入（不推薦）。

## 2. 與 Console 的整合

### 2.1 安裝 SDK

**步驟 1: 安裝依賴**

```bash
# 在 console 目錄
cd /base-root/aintandem/default/console
pnpm add @aintandem/sdk @aintandem/sdk-react
```

**步驟 2: 配置 Provider**

```typescript
// src/main.tsx
import { AInTandemProvider } from '@aintandem/sdk-react';
import App from './App';

const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AInTandemProvider config={config}>
      <App />
    </AInTandemProvider>
  </React.StrictMode>
);
```

### 2.2 漸進式遷移策略

**原則**: 不破壞現有功能，逐步替換。

#### 階段 1: 認證模組 (Week 1)

```typescript
// 舊代碼
import { login, logout } from '@/lib/api/auth';

// 新代碼
import { useAuth } from '@aintandem/sdk-react';

function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = async (credentials) => {
    await login(credentials);
  };
}
```

**遷移步驟**:
1. 安裝 SDK
2. 配置 AInTandemProvider
3. 替換 `src/contexts/AuthContext.tsx`
4. 測試登入/登出流程
5. 移除 `src/lib/api/auth.ts`

#### 階段 2: Workflow API (Week 2)

```typescript
// 舊代碼
import { listWorkflows, getWorkflow } from '@/lib/api/workflows';

// 新代碼
import { useWorkflows, useWorkflow } from '@aintandem/sdk-react';

function WorkflowList() {
  const { workflows, loading, error } = useWorkflows();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {workflows.map(w => <li key={w.id}>{w.name}</li>)}
    </ul>
  );
}
```

**遷移步驟**:
1. 替換 workflow 列表頁面
2. 替換 workflow 詳情頁面
3. 替換 workflow 編輯頁面
4. 測試所有 workflow 功能
5. 移除 `src/lib/api/workflows.ts`

#### 階段 3: Task API (Week 3)

```typescript
// 舊代碼
import { executeTask, getProjectTasks } from '@/lib/api/tasks';

// 新代碼
import { useTaskHistory, useExecuteTask } from '@aintandem/sdk-react';

function TaskList({ projectId }) {
  const { tasks, loading, execute } = useTaskHistory(projectId);

  const handleExecute = async () => {
    await execute({ prompt: 'Do something' });
  };

  return (
    <div>
      <button onClick={handleExecute}>Execute Task</button>
      <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  );
}
```

#### 階段 4: 其他 API (Week 4)

- Container API
- Context API
- Settings API
- Workspace API

#### 階段 5: 進度追蹤 (Week 5)

```typescript
// 舊代碼（如果有的話）
// 自定義 WebSocket 實現

// 新代碼
import { useProgress } from '@aintandem/sdk-react';

function TaskProgress({ projectId }) {
  const { events, isConnected } = useProgress(projectId);

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <ul>
        {events.map((e, i) => (
          <li key={i}>{e.type}: {JSON.stringify(e.data)}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2.3 處理 API 差異

**問題**: 前端類型定義可能與最新 OpenAPI 規範不一致。

**解決方案**:

#### 選項 1: 更新前端代碼

```typescript
// 舊代碼
interface TaskExecution {
  stepId: string;
  status: string;
}

// 新代碼（匹配 OpenAPI）
import type { TaskExecution } from '@aintandem/sdk';
```

#### 選項 2: 適配器模式（暫時方案）

```typescript
// src/lib/adapters/task-adapter.ts
import type { TaskExecution as SdkTaskExecution } from '@aintandem/sdk';
import type { TaskExecution as LegacyTaskExecution } from '@/lib/types';

export function adaptTaskExecution(
  sdkTask: SdkTaskExecution
): LegacyTaskExecution {
  return {
    ...sdkTask,
    // 轉換欄位名稱
    stepId: sdkTask.stepId,
    // ... 其他映射
  };
}
```

#### 選項 3: 直接替換（推薦）

一次性更新所有類型，使用 SDK 導出的類型。

### 2.4 配置相容性

**Console 配置**:

```typescript
// src/lib/config.ts (舊)
export function buildApiUrl(path: string): string {
  const apiBase = getApiBaseUrl();
  return apiBase ? `${apiBase}${path}` : path;
}
```

**SDK 配置**:

```typescript
// SDK 支援相同的配置
const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  // SDK 會處理相對路徑
};

<AInTandemProvider config={config}>
  <App />
</AInTandemProvider>
```

### 2.5 環境變數相容性

**Console `.env`**:

```env
VITE_API_BASE_URL=
VITE_WS_BASE_URL=
```

**SDK 使用相同的環境變數**:

```typescript
const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  websocket: {
    url: import.meta.env.VITE_WS_BASE_URL || '',
  },
};
```

### 2.6 移除舊代碼檢查清單

遷移完成後，移除以下檔案：

- [ ] `src/lib/api/index.ts`
- [ ] `src/lib/api/auth.ts`
- [ ] `src/lib/api/workflows.ts`
- [ ] `src/lib/api/tasks.ts`
- [ ] `src/lib/api/containers.ts`
- [ ] `src/lib/api/context.ts`（如果存在）
- [ ] `src/lib/api/settings.ts`
- [ ] `src/lib/utils/authenticated-fetch.ts`（被 SDK 內部實現取代）
- [ ] `src/contexts/AuthContext.tsx`（被 SDK Provider 取代）

**保留**:

- ✅ `src/lib/config.ts`（可能用於其他配置）
- ✅ `src/lib/types.ts`（應用程式特定類型）
- ✅ 其他業務邏輯工具函數

## 3. 開發工作流程

### 3.1 本地開發

**同時開發 Orchestrator 和 SDK**:

```bash
# Terminal 1: Orchestrator
cd orchestrator
pnpm dev

# Terminal 2: SDK
cd sdk
pnpm dev
pnpm sync-types  # 當 API 變更時

# Terminal 3: Console
cd console
pnpm dev
```

### 3.2 API 變更流程

1. **修改 Orchestrator API**
   ```bash
   cd orchestrator
   # 修改控制器
   pnpm build:api  # 生成新的 OpenAPI 規範
   ```

2. **同步到 SDK**
   ```bash
   cd sdk
   pnpm sync-types
   # 檢查生成的類型
   git add .
   git commit -m "chore: sync types from API changes"
   ```

3. **更新 Console**
   ```bash
   cd console
   pnpm build  # TypeScript 會檢查類型錯誤
   # 修復任何不匹配
   ```

### 3.3 測試策略

**單元測試**:
- SDK: 使用 MSW mock API
- Console: 使用 SDK 的 mock 模式

**整合測試**:
- 測試真實的 API 交互
- 使用測試環境

## 4. 發布和版本管理

### 4.1 版本號對應

```
Orchestrator v1.0.0 → SDK v1.0.0
Orchestrator v1.1.0 → SDK v1.1.0
Orchestrator v2.0.0 → SDK v2.0.0 (breaking changes)
```

### 4.2 發布流程

1. **Orchestrator 發布**
   ```bash
   cd orchestrator
   # 發布新版本
   git tag v1.0.0
   git push --tags
   ```

2. **SDK 發布**
   ```bash
   cd sdk
   pnpm sync-types
   # 測試和驗證
   pnpm changeset
   pnpm release
   ```

3. **Console 更新**
   ```bash
   cd console
   pnpm update @aintandem/sdk@latest
   ```

## 5. 回滾計劃

如果遷移出現問題：

1. **保留分支**: 在遷移前創建 `pre-sdk-migration` 分支
2. **功能標誌**: 使用環境變數控制新舊實現
3. **快速切換**: 保留舊代碼直到完全驗證

```typescript
// 使用功能標誌
const USE_SDK = import.meta.env.VITE_USE_SDK === 'true';

export function listWorkflows() {
  if (USE_SDK) {
    // 使用 SDK
  } else {
    // 使用舊代碼
  }
}
```

## 6. 監控和日誌

### 6.1 錯誤追蹤

SDK 提供統一的錯誤格式：

```typescript
try {
  await client.workflows.createWorkflow(data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error({
      code: error.code,
      status: error.statusCode,
      endpoint: error.endpoint,
      message: error.message,
    });
  }
}
```

### 6.2 性能監控

SDK 內建日誌（可選）：

```typescript
const config = {
  enableLogging: true,
  interceptors: {
    request: [
      (request) => {
        console.time(`[API] ${request.url}`);
        return request;
      },
    ],
    response: [
      (response) => {
        console.timeEnd(`[API] ${response.url}`);
        return response;
      },
    ],
  },
};
```
