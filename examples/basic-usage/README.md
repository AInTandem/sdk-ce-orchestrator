# Basic Usage Example

這是一個展示 AInTandem TypeScript SDK 基礎功能的範例專案。

## 功能展示

本範例涵蓋以下功能：

1. **用戶認證** - 登入、Token 驗證
2. **工作流管理** - 列出工作流、獲取詳情
3. **任務執行** - 異步任務提交
4. **任務查詢** - 獲取任務詳情
5. **任務歷史** - 查詢歷史記錄
6. **隊列狀態** - 查看隊列統計
7. **實時進度追蹤** - WebSocket 進度訂閱

## 安裝依賴

```bash
pnpm install
```

## 配置環境變量

創建 `.env` 文件：

```bash
# API 配置
API_BASE_URL=https://api.aintandem.com
API_USERNAME=your-username
API_PASSWORD=your-password
PROJECT_ID=your-project-id
```

或直接修改 `src/index.ts` 中的 `CONFIG` 對象。

## 運行範例

```bash
# 開發模式（熱重載）
pnpm dev

# 直接運行
pnpm start

# 類型檢查
pnpm typecheck
```

## 輸出示例

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

## 程式碼結構

```
basic-usage/
├── src/
│   └── index.ts          # 主程式，包含所有範例
├── package.json
├── tsconfig.json
└── README.md
```

## 學習重點

### 1. 客戶端初始化

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});
```

### 2. 認證

```typescript
// 登入
const response = await client.auth.login({
  username: 'user',
  password: 'pass',
});

// 檢查認證狀態
const isAuthenticated = client.auth.isAuthenticated();

// 驗證 Token
const isValid = await client.auth.verify();
```

### 3. 工作流操作

```typescript
// 列出工作流
const workflows = await client.workflows.listWorkflows('published');

// 獲取詳情
const workflow = await client.workflows.getWorkflow('workflow-id');
```

### 4. 任務執行

```typescript
// 異步任務
const task = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: { dataset: 'sales-2024' },
  async: true,
});

// 查詢任務
const details = await client.tasks.getTask('project-123', task.id);
```

### 5. 實時進度追蹤

```typescript
await client.subscribeToTask(
  'project-123',
  'task-id',
  (event) => console.log('Progress:', event),
  (event) => console.log('Completed:', event.output),
  (event) => console.error('Failed:', event.error)
);
```

## 下一步

完成本範例後，您可以：

1. 查看 [React 應用範例](../react-app/) - 了解如何在 React 中使用 SDK
2. 查看 [進度追蹤範例](../progress-tracking/) - 深入了解實時進度追蹤
3. 閱讀 [使用指南](../../docs/guides/) - 詳細的功能文檔

## 常見問題

### Q: 如何獲取 API 憑證？

請聯繫您的 AInTandem 管理員或訪問 https://aintandem.com 註冊帳號。

### Q: 範例運行失敗怎麼辦？

1. 檢查網絡連接
2. 驗證 API URL 和憑證
3. 確認專目 ID 正確
4. 查看控制台錯誤訊息

### Q: 如何修改範例代碼？

您可以自由修改 `src/index.ts` 來試試不同的功能。使用 `pnpm dev` 可以熱重載代碼。

## 授權

MIT © AInTandem
