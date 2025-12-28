# AInTandem TypeScript SDK

[![npm version](https://badge.fury.io/js/%40aintandem%2Fsdk-core.svg)](https://www.npmjs.com/package/@aintandem/sdk-core)
[![npm version](https://badge.fury.io/js/%40aintandem%2Fsdk-react.svg)](https://www.npmjs.com/package/@aintandem/sdk-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for AInTandem CE Orchestrator API.

## 特性

- 🚀 **Type-safe**: 完整的 TypeScript 類型支持
- ⚡ **輕量級**: 使用原生 Fetch API，無額外依賴
- 🔄 **Real-time**: WebSocket 進度追蹤
- 🎣 **React Hooks**: 預構建的 React 整合（18+ Hooks）
- 📦 **Tree-shaking**: 按需導入，最小化 bundle
- 🎨 **UI Components**: 預構建的 React 組件

## 套件

此 monorepo 包含以下套件：

- `@aintandem/sdk-core` - 核心 SDK (~69 KB minified)
- `@aintandem/sdk-react` - React 整合 (~54 KB minified)

## 快速開始

### 安裝

```bash
# Core SDK
pnpm add @aintandem/sdk-core

# React 整合
pnpm add @aintandem/sdk-react
```

### 基礎使用

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// 登入
await client.auth.login({ username: 'user', password: 'pass' });

// 獲取工作流
const workflows = await client.workflows.listWorkflows();

// 執行任務
const task = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: { dataset: 'sales-2024' },
  async: true,
});

// 訂閱實時進度
await client.subscribeToTask(
  'project-123',
  task.id,
  (event) => console.log('Progress:', event),
  (event) => console.log('Completed:', event.output),
  (event) => console.error('Failed:', event.error)
);
```

### React 整合

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';
import { useWorkflows, useTaskProgress, ProgressTracker } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
      <Dashboard />
    </AInTandemProvider>
  );
}

function Dashboard() {
  const { workflows, loading, create } = useWorkflows('published');

  return (
    <div>
      {workflows.map(wf => (
        <WorkflowCard key={wf.id} workflow={wf} />
      ))}
      <button onClick={() => create({ name: 'New Workflow' })}>
        Create Workflow
      </button>
    </div>
  );
}

function TaskMonitor({ projectId, taskId }) {
  return (
    <ProgressTracker projectId={projectId} taskId={taskId} showEvents />
  );
}
```

## 文檔

### API 參考

- [Core SDK API](./packages/core/docs/api.md)
- [React Hooks API](./packages/react/docs/api.md)

### 使用指南

- [快速開始](./docs/guides/getting-started.md)
- [認證指南](./docs/guides/authentication.md)
- [Workflow 管理](./docs/guides/workflows.md)
- [任務執行](./docs/guides/tasks.md)
- [實時進度追蹤](./docs/guides/real-time-progress.md)

### 範例

- [基礎使用](./examples/basic-usage/)
- [React 應用](./examples/react-app/)
- [進度追蹤](./examples/progress-tracking/)

## 開發

```bash
# 安裝依賴
pnpm install

# 建置所有套件
pnpm build

# 測試
pnpm test

# 生成類型
pnpm generate-types

# 本地開發
pnpm dev
```

## 貢獻指南

請參考 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 授權

MIT © 2024 AInTandem
