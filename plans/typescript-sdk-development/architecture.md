# SDK 架構設計

## 專案結構

```
sdk/
├── packages/
│   ├── core/                    # 核心 API 客戶端
│   │   ├── src/
│   │   │   ├── client/          # HTTP 客戶端
│   │   │   │   ├── AInTandemClient.ts
│   │   │   │   ├── AuthManager.ts
│   │   │   │   ├── HttpClient.ts
│   │   │   │   └── interceptors/
│   │   │   │       ├── auth.interceptor.ts
│   │   │   │       ├── retry.interceptor.ts
│   │   │   │       └── logging.interceptor.ts
│   │   │   ├── services/        # API 服務模組
│   │   │   │   ├── Auth.service.ts
│   │   │   │   ├── Workflow.service.ts
│   │   │   │   ├── Task.service.ts
│   │   │   │   ├── Container.service.ts
│   │   │   │   ├── Context.service.ts
│   │   │   │   ├── Settings.service.ts
│   │   │   │   └── Workspace.service.ts
│   │   │   ├── websocket/       # WebSocket 客戶端
│   │   │   │   ├── ProgressClient.ts
│   │   │   │   ├── WebSocketManager.ts
│   │   │   │   └── events.ts
│   │   │   ├── types/           # 類型定義
│   │   │   │   ├── generated/   # 從 OpenAPI 自動生成
│   │   │   │   │   ├── api.ts
│   │   │   │   │   └── models.ts
│   │   │   │   └── manual/      # 手動定義
│   │   │   │       ├── client.types.ts
│   │   │   │       └── websocket.types.ts
│   │   │   ├── errors/          # 錯誤處理
│   │   │   │   ├── AInTandemError.ts
│   │   │   │   ├── NetworkError.ts
│   │   │   │   ├── AuthError.ts
│   │   │   │   └── ValidationError.ts
│   │   │   ├── utils/           # 工具函數
│   │   │   │   ├── fetch.ts
│   │   │   │   ├── retry.ts
│   │   │   │   └── validation.ts
│   │   │   └── index.ts         # 主導出
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   │
│   ├── react/                   # React 整合層
│   │   ├── src/
│   │   │   ├── providers/       # Context Providers
│   │   │   │   └── AInTandemProvider.tsx
│   │   │   ├── hooks/           # React Hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useWorkflow.ts
│   │   │   │   ├── useWorkflows.ts
│   │   │   │   ├── useTask.ts
│   │   │   │   ├── useTaskHistory.ts
│   │   │   │   ├── useExecuteTask.ts
│   │   │   │   ├── useProgress.ts
│   │   │   │   ├── useOrganizations.ts
│   │   │   │   ├── useWorkspaces.ts
│   │   │   │   └── useProjects.ts
│   │   │   ├── components/      # React 組件
│   │   │   │   ├── ProgressTracker.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   │
│   └── types/                   # 共享類型（可選）
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── scripts/                     # 建置和生成腳本
│   ├── generate-types.ts        # 從 OpenAPI 生成類型
│   ├── sync-types.ts            # 從 orchestrator 同步 OpenAPI
│   └── validate-api.ts          # 驗證 API 一致性
│
├── examples/                    # 使用範例
│   ├── basic-usage/
│   │   ├── index.html
│   │   ├── index.tsx
│   │   └── package.json
│   ├── react-app/
│   │   ├── src/
│   │   ├── index.html
│   │   └── package.json
│   └── vanilla-ts/
│       ├── index.html
│       └── index.ts
│
├── tests/                       # 測試文件
│   ├── unit/
│   │   ├── client/
│   │   ├── services/
│   │   └── websocket/
│   ├── integration/
│   └── e2e/
│
├── docs/                        # 文檔
│   ├── api/                     # API 參考（TypeDoc 生成）
│   ├── guides/                  # 使用指南
│   │   ├── getting-started.md
│   │   ├── authentication.md
│   │   ├── workflows.md
│   │   └── real-time-progress.md
│   └── migration/               # 遷移指南
│       └── from-console-api.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       └── sync-types.yml
│
├── package.json                 # Monorepo root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── vitest.config.ts
├── .gitignore
├── README.md
└── CHANGELOG.md
```

## 核心架構層次

### Layer 1: 基礎設施層 (Infrastructure Layer)

```
┌─────────────────────────────────────┐
│     Fetch API / WebSocket API       │  ← 原生瀏覽器 API
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│       HttpClient / WebSocketClient  │  ← 封裝的 HTTP/WS 客戶端
│  - 請求/響應攔截器                   │
│  - 重試邏輯                          │
│  - 錯誤處理                          │
└─────────────────────────────────────┘
```

### Layer 2: 客戶端層 (Client Layer)

```
┌─────────────────────────────────────┐
│        AuthManager                  │  ← Token 管理
│  - Token 存儲                        │
│  - 自動刷新                          │
│  - Token 驗證                        │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│      AInTandemClient                │  ← 主客戶端類
│  - API 配置                          │
│  - 服務註冊                          │
│  - 初始化邏輯                        │
└─────────────────────────────────────┘
```

### Layer 3: 服務層 (Service Layer)

```
┌─────────────────────────────────────┐
│         API 服務模組                 │
│  ┌──────────┬──────────┬─────────┐  │
│  │  Auth    │ Workflow │  Task   │  │
│  ├──────────┼──────────┼─────────┤  │
│  │Container │ Context  │Settings │  │
│  ├──────────┼──────────┼─────────┤  │
│  │Workspace │  Health  │  ...    │  │
│  └──────────┴──────────┴─────────┘  │
└─────────────────────────────────────┘
```

### Layer 4: React 整合層 (React Integration Layer)

```
┌─────────────────────────────────────┐
│     AInTandemProvider (Context)     │
│  - 客戶端實例                        │
│  - 認證狀態                          │
│  - 全局配置                          │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│         React Hooks                 │
│  - useAuth()                        │
│  - useWorkflow()                    │
│  - useTask()                        │
│  - useProgress()                    │
│  - ...                              │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│      React 組件                      │
│  - ProgressTracker                  │
│  - ProgressBar                      │
│  - ErrorBoundary                    │
└─────────────────────────────────────┘
```

## 類型生成流程

```
┌─────────────────────────────────────┐
│  Orchestrator (dist/swagger.json)   │  ← OpenAPI 規範
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   openapi-typescript-codegen        │  ← 自動生成工具
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   packages/core/src/types/generated/│
│   ├── api.ts                        │  ← API 端點類型
│   └── models.ts                     │  ← 數據模型類型
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   packages/core/src/types/manual/   │  ← 手動擴展類型
│   ├── client.types.ts               │
│   └── websocket.types.ts            │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   統一導出 (packages/core/src/index) │
└─────────────────────────────────────┘
```

## 數據流設計

### 認證流程

```
┌──────────┐
│ 用戶登入  │
└─────┬────┘
      ↓
┌──────────────────┐
│ AuthManager      │
│ 1. 調用 /login   │
│ 2. 存儲 token    │
│ 3. 設置定時刷新   │
└─────┬────────────┘
      ↓
┌──────────────────┐
│ HttpClient       │
│ 自動添加          │
│ Authorization    │
│ header           │
└─────┬────────────┘
      ↓
┌──────────────────┐
│ API 請求          │
│ (已認證)          │
└──────────────────┘
```

### Token 刷新流程

```
┌─────────────────────┐
│ API 請求收到 401     │
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│ AuthManager         │
│ 1. 暫停其他請求      │
│ 2. 調用 /refresh    │
│ 3. 更新 token       │
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│ 重試原始請求         │
│ (使用新 token)      │
└─────────────────────┘
```

### WebSocket 進度追蹤流程

```
┌──────────┐
│ 組件調用  │
│useProgress│
└─────┬────┘
      ↓
┌─────────────────────┐
│ ProgressClient      │
│ 1. 建立 WebSocket   │
│ 2. 訂閱進度事件     │
│ 3. 處理訊息         │
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│ 事件分發            │
│ - task_queued       │
│ - task_started      │
│ - step_progress     │
│ - task_completed    │
└──────┬──────────────┘
       ↓
┌─────────────────────┐
│ React 狀態更新       │
│ (自動重新渲染)       │
└─────────────────────┘
```

## 模組依賴關係

```
┌──────────────────────────────────────────┐
│              packages/react              │  ← React 整合
│         依賴: @aintandem/sdk-core         │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│            packages/core                 │  ← 核心 API
│       依賴: 無外部 SDK 依賴               │
└──────────────────────────────────────────┘
         ┌──────────────┬──────────────┐
         ↓              ↓              ↓
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ services│   │websocket│   │  types  │
    └─────────┘   └─────────┘   └─────────┘
```

## 設計原則

### 1. 單一職責原則 (SRP)
- 每個服務類負責一個 API 模組
- 每個類/函數只做一件事

### 2. 依賴倒置原則 (DIP)
- 依賴抽象（介面），不依賴具體實現
- 使用依賴注入

### 3. 開放封閉原則 (OCP)
- 通過攔截器擴展功能，不修改核心代碼
- 插件化設計

### 4. Tree-shaking 友善
- ES Module 輸出
- 按需導入
- 避免副作用

### 5. 類型安全
- 100% TypeScript
- 嚴格模式
- 無 `any` 類型（必要時用 `unknown`）

## 配置管理

### 客戶端配置

```typescript
interface AInTandemClientConfig {
  baseURL: string;           // API 基礎 URL
  timeout?: number;          // 請求超時（預設 30000ms）
  retryCount?: number;       // 重試次數（預設 3）
  retryDelay?: number;       // 重試延遲（預設 1000ms）
  enableLogging?: boolean;   // 啟用日誌（預設 false）
  interceptors?: {           // 攔截器
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
  };
  storage?: TokenStorage;    // Token 存儲（預設 localStorage）
  websocket?: {
    url?: string;            // WebSocket URL（預設 baseURL）
    reconnectInterval?: number; // 重連間隔（預設 5000ms）
    maxReconnectAttempts?: number; // 最大重連次數（預設 10）
  };
}
```

### 預設配置

```typescript
const defaultConfig: AInTandemClientConfig = {
  baseURL: '',
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000,
  enableLogging: false,
  storage: localStorage,
  websocket: {
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
};
```

## 錯誤處理策略

### 錯誤層次結構

```
AInTandemError (基類)
├── NetworkError (網絡錯誤)
│   ├── NetworkTimeoutError
│   ├── NetworkConnectionError
│   └── NetworkAbortError
├── AuthError (認證錯誤)
│   ├── InvalidTokenError
│   ├── TokenExpiredError
│   └── AuthenticationFailedError
├── ApiError (API 錯誤)
│   ├── BadRequestError (400)
│   ├── UnauthorizedError (401)
│   ├── ForbiddenError (403)
│   ├── NotFoundError (404)
│   ├── ConflictError (409)
│   ├── ValidationError (422)
│   └── InternalServerError (500)
├── ValidationError (驗證錯誤)
└── WebSocketError (WebSocket 錯誤)
```

### 錯誤處理流程

```
請求失敗
    ↓
HttpClient 捕獲錯誤
    ↓
分類錯誤類型
    ↓
┌─────────────┬──────────────┬─────────────┐
│ AuthError   │ NetworkError │  ApiError   │
│ (401/403)   │ (超時/連接)   │  (其他)     │
└──────┬──────┴──────┬───────┴──────┬──────┘
       │             │              │
       ↓             ↓              ↓
  刷新 token      重試請求      直接拋出
  或重定向        (指數退避)
```

## 擴展性設計

### 攔截器系統

```typescript
// 請求攔截器
type RequestInterceptor = (
  request: Request
) => Request | Promise<Request>;

// 響應攔截器
type ResponseInterceptor = (
  response: Response
) => Response | Promise<Response>;

// 錯誤攔截器
type ErrorInterceptor = (
  error: AInTandemError
) => void | Promise<void>;
```

### 自訂攔截器範例

```typescript
// 日誌攔截器
const loggingInterceptor: RequestInterceptor = (request) => {
  console.log('[Request]', request.method, request.url);
  return request;
};

// 緩存攔截器
const cacheInterceptor: ResponseInterceptor = async (response) => {
  if (response.ok) {
    const data = await response.clone().json();
    cache.set(response.url, data);
  }
  return response;
};
```

## 性能優化

### 1. Tree-shaking
- ES Module 輸出
- 副作用標記（`"sideEffects": false`）
- 按需導入設計

### 2. 代碼分割
- React hooks 懶加載
- 服務模組按需導入

### 3. 請求批處理
- 自動合併並發請求
- 緩存機制

### 4. Bundle 優化
- Minification
- Dead code elimination
- 按環境打包

## 安全性設計

### 1. Token 安全
- 存儲在 localStorage（或 sessionStorage）
- HTTPS 傳輸
- 自動過期處理

### 2. XSS 防護
- 輸入驗證
- 輸出編碼
- CSP (Content Security Policy)

### 3. CSRF 防護
- SameSite cookies
- CSRF tokens（如果使用 cookies）

### 4. 數據驗證
- 請求體驗證
- 響應體驗證
- 類型檢查
