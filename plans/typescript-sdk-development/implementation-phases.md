# 實施階段

## Phase 1: 基礎設施設置 (Week 1)

### 目標
建立 SDK 專案結構、建置配置和開發環境。

### 任務清單

#### 1.1 初始化 Monorepo
- [ ] 創建 `sdk/` 目錄結構
- [ ] 初始化 `package.json`
- [ ] 配置 `pnpm-workspace.yaml`
- [ ] 設置 `.gitignore`

**關鍵檔案**:
- `/base-root/aintandem/default/sdk/package.json`
- `/base-root/aintandem/default/sdk/pnpm-workspace.yaml`
- `/base-root/aintandem/default/sdk/.gitignore`

**範例配置**:
```json
{
  "name": "@aintandem/sdk-monorepo",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "dev": "pnpm --filter @aintandem/sdk-core dev",
    "generate-types": "tsx scripts/generate-types.ts"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.5.0"
  }
}
```

#### 1.2 創建 packages/core 結構
- [ ] 初始化 `packages/core/package.json`
- [ ] 配置 `tsconfig.json`
- [ ] 配置 `tsup.config.ts`
- [ ] 創建目錄結構
- [ ] 設置 ESLint 和 Prettier

**目錄結構**:
```
packages/core/
├── src/
│   ├── client/
│   ├── services/
│   ├── websocket/
│   ├── types/
│   ├── errors/
│   ├── utils/
│   └── index.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

#### 1.3 配置 TypeScript
- [ ] 創建 `tsconfig.base.json` (共享配置)
- [ ] 配置 `packages/core/tsconfig.json`
- [ ] 設置嚴格模式和編譯選項

**配置範例**:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### 1.4 配置建置工具
- [ ] 安裝並配置 `tsup`
- [ ] 設置 entry points
- [ ] 配置 ESM 和 CJS 輸出
- [ ] 配置 DTS 生成

**tsup.config.ts**:
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2020',
});
```

#### 1.5 配置測試環境
- [ ] 安裝並配置 Vitest
- [ ] 配置 `vitest.config.ts`
- [ ] 設置測試覆盖率閾值 (80%)
- [ ] 創建測試目錄結構

#### 1.6 配置 CI/CD
- [ ] 創建 `.github/workflows/ci.yml`
- [ ] 設置 lint、typecheck、test 步驟
- [ ] 配置 Node.js 版本矩陣

**交付物**:
- ✅ 完整的 monorepo 結構
- ✅ 可建置的 TypeScript 專案
- ✅ 測試環境就緒
- ✅ CI/CD pipeline 運行中

---

## Phase 2: 類型生成系統 (Week 1-2)

### 目標
建立從 OpenAPI 規範自動生成 TypeScript 類型的系統。

### 任務清單

#### 2.1 安裝類型生成工具
- [ ] 安裝 `openapi-typescript-codegen`
- [ ] 安裝依賴工具 (`tsx`, `chalk`)

#### 2.2 創建類型生成腳本
- [ ] 編寫 `scripts/generate-types.ts`
- [ ] 實現從 orchestrator 讀取 OpenAPI 規範
- [ ] 配置生成選項
- [ ] 處理類型映射和自定義

**腳本範例**:
```typescript
// scripts/generate-types.ts
import { generate } from 'openapi-typescript-codegen';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🔧 Generating types from OpenAPI spec...');

  const openApiPath = join(__dirname, '../orchestrator/dist/swagger.json');
  const outputPath = join(__dirname, '../sdk/packages/core/src/types/generated');

  if (!existsSync(openApiPath)) {
    throw new Error(`OpenAPI spec not found at ${openApiPath}`);
  }

  await generate({
    input: openApiPath,
    output: outputPath,
    httpClient: 'fetch',
    useOptions: true,
    exportServices: false, // 我們將手動實現服務
    exportSchemas: true,
  });

  console.log('✅ Types generated successfully!');
}

main().catch(console.error);
```

#### 2.3 創建類型同步腳本
- [ ] 編寫 `scripts/sync-types.ts`
- [ ] 實現自動提交類型更新
- [ ] 添加版本對比驗證

#### 2.4 創建手動類型定義
- [ ] 編寫 `packages/core/src/types/manual/client.types.ts`
- [ ] 定義客戶端配置類型
- [ ] 定義錯誤類型
- [ ] 定義攔截器類型

**client.types.ts**:
```typescript
export interface AInTandemClientConfig {
  baseURL: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  enableLogging?: boolean;
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
  };
  storage?: TokenStorage;
  websocket?: WebSocketConfig;
}

export type RequestInterceptor = (
  request: Request
) => Request | Promise<Request>;

export type ResponseInterceptor = (
  response: Response
) => Response | Promise<Response>;

export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

export interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}
```

#### 2.5 配置 CI 自動同步
- [ ] 創建 `.github/workflows/sync-types.yml`
- [ ] 設置定時任務（每日或 orchestrator 更新時）
- [ ] 自動創建 PR

**交付物**:
- ✅ 自動類型生成系統
- ✅ 同步腳本
- ✅ CI/CD 自動化
- ✅ 類型定義文檔

---

## Phase 3: 核心客戶端實現 (Week 2)

### 目標
實現 HTTP 客戶端、認證管理器和錯誤處理系統。

### 任務清單

#### 3.1 實現錯誤類別
- [ ] 創建 `errors/AInTandemError.ts` (基類)
- [ ] 實現 `errors/NetworkError.ts`
- [ ] 實現 `errors/AuthError.ts`
- [ ] 實現 `errors/ApiError.ts`
- [ ] 實現 `errors/ValidationError.ts`
- [ ] 創建錯誤工廠函數

**AInTandemError.ts**:
```typescript
export class AInTandemError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NetworkError extends AInTandemError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', undefined, details);
  }
}

export class AuthError extends AInTandemError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, 'AUTH_ERROR', statusCode, details);
  }
}

export class ApiError extends AInTandemError {
  constructor(
    message: string,
    statusCode: number,
    public endpoint: string,
    details?: unknown
  ) {
    super(message, 'API_ERROR', statusCode, details);
  }
}
```

#### 3.2 實現 HTTP 客戶端
- [ ] 創建 `client/HttpClient.ts`
- [ ] 實現 fetch 包裝器
- [ ] 實現請求/響應攔截器鏈
- [ ] 實現重試邏輯（指數退避）
- [ ] 實現超時處理

**HttpClient.ts**:
```typescript
export class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      let request = new Request(url, {
        ...options,
        signal: controller.signal,
      });

      // 應用請求攔截器
      request = await this.applyRequestInterceptors(request);

      // 執行請求（含重試）
      const response = await this.fetchWithRetry(request);

      // 應用響應攔截器
      const processedResponse = await this.applyResponseInterceptors(response);

      // 檢查錯誤
      if (!processedResponse.ok) {
        throw this.createError(processedResponse);
      }

      clearTimeout(timeoutId);
      return processedResponse.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  private async fetchWithRetry(request: Request): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retryCount; attempt++) {
      try {
        const response = await fetch(request);
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retryCount) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async applyRequestInterceptors(request: Request): Promise<Request> {
    let processed = request;
    for (const interceptor of this.config.interceptors?.request || []) {
      processed = await interceptor(processed);
    }
    return processed;
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let processed = response;
    for (const interceptor of this.config.interceptors?.response || []) {
      processed = await interceptor(processed);
    }
    return processed;
  }

  private createError(response: Response): AInTandemError {
    if (response.status === 401 || response.status === 403) {
      return new AuthError(
        'Authentication failed',
        response.status,
        { url: response.url }
      );
    }
    return new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      response.url
    );
  }

  private handleError(error: unknown): AInTandemError {
    if (error instanceof AInTandemError) {
      return error;
    }
    if (error instanceof TypeError) {
      return new NetworkError(error.message, error);
    }
    return new AInTandemError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }
}
```

#### 3.3 實現認證管理器
- [ ] 創建 `client/AuthManager.ts`
- [ ] 實現 Token 存儲（localStorage）
- [ ] 實現自動 Token 刷新
- [ ] 實現認證狀態管理
- [ ] 創建認證攔截器

**AuthManager.ts**:
```typescript
export class AuthManager {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(
    private storage: TokenStorage,
    private httpClient: HttpClient
  ) {
    this.loadTokens();
    this.setupAutoRefresh();
  }

  private loadTokens(): void {
    this.token = this.storage.getToken();
  }

  private setupAutoRefresh(): void {
    if (this.token) {
      const payload = this.parseToken(this.token);
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      const refreshTime = expiresAt - now - 5 * 60 * 1000; // 5 minutes before expiry

      if (refreshTime > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refresh();
        }, refreshTime);
      }
    }
  }

  private parseToken(token: string): { exp: number } {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.httpClient.request<LoginResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }
    );

    this.token = response.token;
    this.refreshToken = response.refreshToken;
    this.storage.setToken(this.token);
    this.setupAutoRefresh();

    return response;
  }

  async refresh(): Promise<void> {
    if (!this.refreshToken) {
      throw new AuthError('No refresh token available', 401);
    }

    const response = await this.httpClient.request<RefreshResponse>(
      '/api/auth/refresh',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      }
    );

    this.token = response.token;
    this.storage.setToken(this.token);
    this.setupAutoRefresh();
  }

  logout(): void {
    this.token = null;
    this.refreshToken = null;
    this.storage.removeToken();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  getAuthHeader(): Record<string, string> | {} {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}
```

#### 3.4 實現攔截器
- [ ] 創建 `interceptors/auth.interceptor.ts`
- [ ] 創建 `interceptors/retry.interceptor.ts`
- [ ] 創建 `interceptors/logging.interceptor.ts`

**auth.interceptor.ts**:
```typescript
export function createAuthInterceptor(authManager: AuthManager): RequestInterceptor {
  return async (request: Request) => {
    const authHeader = authManager.getAuthHeader();
    const headers = new Headers(request.headers);

    Object.entries(authHeader).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Request(request, { headers });
  };
}
```

#### 3.5 單元測試
- [ ] 測試 HttpClient
- [ ] 測試 AuthManager
- [ ] 測試錯誤處理
- [ ] 測試攔截器
- [ ] 使用 MSW mock API

**交付物**:
- ✅ 完整的 HTTP 客戶端
- ✅ 認證管理系統
- ✅ 錯誤處理機制
- ✅ 80%+ 測試覆盖率

---

## Phase 4: API 服務實現 (Week 3-4)

### 目標
實現所有 API 端點的服務類。

### 任務清單

#### 4.1 Auth Service
- [ ] 實現 `services/Auth.service.ts`
- [ ] 方法: `login()`, `logout()`, `refresh()`, `verify()`
- [ ] 與 AuthManager 整合

#### 4.2 Workflow Service
- [ ] 實現 `services/Workflow.service.ts`
- [ ] CRUD 操作
- [ ] 版本管理
- [ ] 執行控制（pause, resume, cancel）
- [ ] 狀態管理

**Workflow.service.ts**:
```typescript
export class WorkflowService {
  constructor(private httpClient: HttpClient) {}

  async listWorkflows(status?: WorkflowStatus): Promise<Workflow[]> {
    const params = status ? `?status=${status}` : '';
    return this.httpClient.request<Workflow[]>(
      `/api/workflows${params}`
    );
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this.httpClient.request<Workflow>(`/api/workflows/${id}`);
  }

  async createWorkflow(request: CreateWorkflowRequest): Promise<Workflow> {
    return this.httpClient.request<Workflow>('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async updateWorkflow(
    id: string,
    request: UpdateWorkflowRequest
  ): Promise<Workflow> {
    return this.httpClient.request<Workflow>(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    return this.httpClient.request<void>(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async changeWorkflowStatus(
    id: string,
    status: WorkflowStatus
  ): Promise<Workflow> {
    return this.httpClient.request<Workflow>(`/api/workflows/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }

  async cloneWorkflow(
    id: string,
    request: CloneWorkflowRequest
  ): Promise<Workflow> {
    return this.httpClient.request<Workflow>(`/api/workflows/${id}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async listVersions(id: string): Promise<WorkflowVersion[]> {
    return this.httpClient.request<WorkflowVersion[]>(
      `/api/workflows/${id}/versions`
    );
  }

  async getVersion(versionId: string): Promise<WorkflowVersion> {
    return this.httpClient.request<WorkflowVersion>(
      `/api/workflows/versions/${versionId}`
    );
  }

  async createExecution(
    workflowId: string,
    request: CreateExecutionRequest
  ): Promise<WorkflowExecution> {
    return this.httpClient.request<WorkflowExecution>(
      `/api/workflows/${workflowId}/executions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
  }

  async startExecution(executionId: string): Promise<WorkflowExecution> {
    return this.httpClient.request<WorkflowExecution>(
      `/api/workflows/executions/${executionId}/start`,
      { method: 'POST' }
    );
  }

  async pauseExecution(executionId: string): Promise<WorkflowExecution> {
    return this.httpClient.request<WorkflowExecution>(
      `/api/workflows/executions/${executionId}/pause`,
      { method: 'POST' }
    );
  }

  async resumeExecution(executionId: string): Promise<WorkflowExecution> {
    return this.httpClient.request<WorkflowExecution>(
      `/api/workflows/executions/${executionId}/resume`,
      { method: 'POST' }
    );
  }

  async cancelExecution(executionId: string): Promise<WorkflowExecution> {
    return this.httpClient.request<WorkflowExecution>(
      `/api/workflows/executions/${executionId}/cancel`,
      { method: 'POST' }
    );
  }
}
```

#### 4.3 Task Service
- [ ] 實現 `services/Task.service.ts`
- [ ] 執行任務
- [ ] 臨時任務
- [ ] 任務歷史
- [ ] 任務取消

#### 4.4 Container Service
- [ ] 實現 `services/Container.service.ts`
- [ ] 列出容器
- [ ] 創建容器
- [ ] 啟動/停止容器
- [ ] 刪除容器

#### 4.5 Context Service
- [ ] 實現 `services/Context.service.ts`
- [ ] 創建記憶
- [ ] 更新記憶
- [ ] 查詢記憶

#### 4.6 Settings Service
- [ ] 實現 `services/Settings.service.ts`
- [ ] 獲取設置
- [ ] 更新設置

#### 4.7 Workspace Service
- [ ] 實現 `services/Workspace.service.ts`
- [ ] Organization CRUD
- [ ] Workspace CRUD
- [ ] Project CRUD

#### 4.8 單元測試
- [ ] 測試所有服務
- [ ] Mock API 響應
- [ ] 驗證請求格式
- [ ] 驗證錯誤處理

**交付物**:
- ✅ 完整的 API 服務層
- ✅ 所有端點覆蓋
- ✅ 完整測試

---

## Phase 5: WebSocket 進度追蹤 (Week 4)

### 目標
實現實時任務進度追蹤的 WebSocket 客戶端。

### 任務清單

#### 5.1 實現 WebSocketManager
- [ ] 創建 `websocket/WebSocketManager.ts`
- [ ] 連接管理
- [ ] 自動重連（指數退避）
- [ ] 心跳檢測
- [ ] 事件訂閱系統

**WebSocketManager.ts**:
```typescript
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private eventListeners = new Map<string, Set<EventListener>>();

  constructor(private config: WebSocketConfig) {}

  connect(): void {
    const url = this.config.url || this.getDefaultUrl();
    this.ws = new WebSocket(url);

    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onerror = this.handleError;
    this.ws.onclose = this.handleClose;
  }

  private handleOpen = () => {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.startHeartbeat();
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      this.emit(data.type, data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  private handleError = (error: Event) => {
    console.error('WebSocket error:', error);
  };

  private handleClose = () => {
    console.log('WebSocket closed');
    this.stopHeartbeat();
    this.scheduleReconnect();
  };

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  on(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: EventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: string, data: unknown): void {
    this.eventListeners.get(event)?.forEach(listener => listener(data));
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }
}
```

#### 5.2 實現 ProgressClient
- [ ] 創建 `websocket/ProgressClient.ts`
- [ ] 訂閱項目進度
- [ ] 過濾任務 ID
- [ ] 類型安全的事件

**ProgressClient.ts**:
```typescript
export class ProgressClient {
  private manager: WebSocketManager;

  constructor(projectId: string, config: ProgressClientConfig) {
    const wsUrl = `${config.websocketUrl}/api/progress/subscribe/${projectId}`;
    this.manager = new WebSocketManager({ url: wsUrl, ...config });

    this.manager.connect();
  }

  onTaskProgress(callback: (event: TaskProgressEvent) => void): void {
    this.manager.on('task_progress', callback);
  }

  onTaskCompleted(callback: (event: TaskCompletedEvent) => void): void {
    this.manager.on('task_completed', callback);
  }

  onTaskFailed(callback: (event: TaskFailedEvent) => void): void {
    this.manager.on('task_failed', callback);
  }

  close(): void {
    this.manager.disconnect();
  }
}
```

#### 5.3 定義事件類型
- [ ] 創建 `websocket/events.ts`
- [ ] 定義所有進度事件類型
- [ ] 類型守衛

#### 5.4 測試
- [ ] Mock WebSocket
- [ ] 測試連接和重連
- [ ] 測試事件發送/接收
- [ ] 測試心跳機制

**交付物**:
- ✅ WebSocket 客戶端
- ✅ 進度追蹤客戶端
- ✅ 自動重連機制
- ✅ 完整測試

---

## Phase 6: React 整合 - Hooks (Week 5)

### 目標
實現 React Hooks 和 Context Provider。

### 任務清單

#### 6.1 創建 packages/react
- [ ] 初始化 package.json
- [ ] 配置 TypeScript
- [ ] 配置 tsup
- [ ] 安裝 React 依賴

#### 6.2 實現 AInTandemProvider
- [ ] 創建 `providers/AInTandemProvider.tsx`
- [ ] 管理 AInTandemClient 實例
- [ ] 管理認證狀態
- [ ] 提供全局配置

**AInTandemProvider.tsx**:
```typescript
interface AInTandemContextValue {
  client: AInTandemClient;
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AInTandemContext = createContext<AInTandemContextValue | null>(null);

export function AInTandemProvider({
  config,
  children,
}: AInTandemProviderProps) {
  const [client] = useState(() => new AInTandemClient(config));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await client.auth.login(credentials);
    setIsAuthenticated(true);
    setUser(response.user);
  }, [client]);

  const logout = useCallback(() => {
    client.auth.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, [client]);

  useEffect(() => {
    // 檢查現有認證狀態
    if (client.auth.isAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, [client]);

  return (
    <AInTandemContext.Provider value={{ client, isAuthenticated, user, login, logout }}>
      {children}
    </AInTandemContext.Provider>
  );
}
```

#### 6.3 實現認證 Hooks
- [ ] `hooks/useAuth.ts`
- [ ] `hooks/useUser.ts`

**useAuth.ts**:
```typescript
export function useAuth() {
  const context = useContext(AInTandemContext);
  if (!context) {
    throw new Error('useAuth must be used within AInTandemProvider');
  }

  return {
    isAuthenticated: context.isAuthenticated,
    user: context.user,
    login: context.login,
    logout: context.logout,
  };
}
```

#### 6.4 實現 Workflow Hooks
- [ ] `hooks/useWorkflow.ts` - 單個工作流
- [ ] `hooks/useWorkflows.ts` - 工作流列表
- [ ] `hooks/useWorkflowVersions.ts` - 版本列表

**useWorkflow.ts**:
```typescript
export function useWorkflow(id: string) {
  const { client } = useAInTandem();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    client.workflows.getWorkflow(id)
      .then(setWorkflow)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [client, id]);

  const update = useCallback(async (request: UpdateWorkflowRequest) => {
    const updated = await client.workflows.updateWorkflow(id, request);
    setWorkflow(updated);
    return updated;
  }, [client, id]);

  const changeStatus = useCallback(async (status: WorkflowStatus) => {
    const updated = await client.workflows.changeWorkflowStatus(id, status);
    setWorkflow(updated);
    return updated;
  }, [client, id]);

  return { workflow, loading, error, update, changeStatus };
}
```

#### 6.5 實現 Task Hooks
- [ ] `hooks/useTask.ts` - 任務詳情
- [ ] `hooks/useTaskHistory.ts` - 任務歷史
- [ ] `hooks/useExecuteTask.ts` - 執行任務

#### 6.6 實現 Workspace Hooks
- [ ] `hooks/useOrganizations.ts`
- [ ] `hooks/useWorkspaces.ts`
- [ ] `hooks/useProjects.ts`

#### 6.7 實現進度追蹤 Hook
- [ ] `hooks/useProgress.ts`
- [ ] 自動訂閱/取消訂閱
- [ ] 類型安全的事件處理

**useProgress.ts**:
```typescript
export function useProgress(projectId: string) {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<ProgressClient | null>(null);

  useEffect(() => {
    const client = new ProgressClient(projectId, {
      websocketUrl: config.websocketUrl,
    });

    client.onAny((event) => {
      setEvents(prev => [...prev, event]);
    });

    client.onConnected(() => setIsConnected(true));
    client.onDisconnected(() => setIsConnected(false));

    clientRef.current = client;

    return () => {
      client.close();
    };
  }, [projectId]);

  return { events, isConnected };
}
```

#### 6.8 測試
- [ ] 測試 Provider
- [ ] 測試所有 Hooks
- [ ] 使用 @testing-library/react-hooks

**交付物**:
- ✅ React Context Provider
- ✅ 完整的 Hooks
- ✅ 測試覆蓋

---

## Phase 7: React 組件 (Week 5)

### 目標
實現預構建的 React 組件。

### 任務清單

#### 7.1 ProgressTracker 組件
- [ ] 顯示任務進度
- [ ] 顯示步驟詳情
- [ ] 自動更新

#### 7.2 ProgressBar 組件
- [ ] 線性進度條
- [ ] 圓形進度條
- [ ] 可自訂樣式

#### 7.3 ErrorBoundary 組件
- [ ] 捕獲錯誤
- [ ] 顯示錯誤訊息
- [ ] 重試機制

#### 7.4 Storybook 整合 (可選)
- [ ] 配置 Storybook
- [ ] 創建組件故事
- [ ] 文檔組件 API

**交付物**:
- ✅ 進度追蹤組件
- ✅ 錯誤邊界
- ✅ Storybook (可選)

---

## Phase 8: 文檔和範例 (Week 6)

### 目標
創建完整的文檔和使用範例。

### 任務清單

#### 8.1 API 參考文檔
- [ ] 配置 TypeDoc
- [ ] 添加 JSDoc 註釋
- [ ] 生成 HTML 文檔

#### 8.2 使用指南
- [ ] `docs/guides/getting-started.md`
- [ ] `docs/guides/authentication.md`
- [ ] `docs/guides/workflows.md`
- [ ] `docs/guides/real-time-progress.md`

#### 8.3 範例專案
- [ ] `examples/basic-usage/` - 基礎使用
- [ ] `examples/react-app/` - React 整合
- [ ] `examples/vanilla-ts/` - 純 TypeScript

#### 8.4 README.md
- [ ] 專案介紹
- [ ] 快速開始
- [ ] API 文檔連結
- [ ] 貢獻指南

**交付物**:
- ✅ 完整文檔
- ✅ 使用範例
- ✅ README

---

## Phase 9: Console 遷移 (Week 7)

### 目標
將 Console 前端遷移到新的 SDK。

### 任務清單

#### 9.1 安裝和配置
- [ ] 在 console 安裝 SDK
- [ ] 配置 AInTandemProvider
- [ ] 替換認證邏輯

#### 9.2 漸進式替換
- [ ] 替換 Auth API
- [ ] 替換 Workflow API
- [ ] 替換 Task API
- [ ] 替換 Container API
- [ ] 替換其他服務

#### 9.3 測試和驗證
- [ ] 執行所有測試
- [ ] 手動測試關鍵流程
- [ ] 性能測試

#### 9.4 清理舊代碼
- [ ] 移除 `src/lib/api/`
- [ ] 更新 import 語句
- [ ] 更新文檔

**交付物**:
- ✅ Console 使用新 SDK
- ✅ 舊代碼移除
- ✅ 測試通過

---

## Phase 10: CI/CD 和發布 (Week 8)

### 目標
設置 CI/CD 並發布 SDK。

### 任務清單

#### 10.1 配置 Changesets
- [ ] 安裝 Changesets
- [ ] 配置 `changeset.config.json`
- [ ] 創建初始 changeset

#### 10.2 配置 GitHub Actions
- [ ] `.github/workflows/ci.yml`
- [ ] `.github/workflows/release.yml`
- [ ] `.github/workflows/sync-types.yml`

#### 10.3 配置 npm
- [ ] 創建 npm 帳號
- [ ] 設置 `npmrc`
- [ ] 配置自動發布

#### 10.4 發布第一個版本
- [ ] 創建 v0.1.0 changeset
- [ ] 執行 release workflow
- [ ] 驗證 npm 套件
- [ ] 創建 GitHub Release

#### 10.5 設置文檔網站
- [ ] 部署 TypeDoc 到 GitHub Pages
- [ ] 設置自動更新

**交付物**:
- ✅ npm 套件發布
- ✅ CI/CD 運行
- ✅ 文檔網站

---

## 時間總結

| Phase | 時間 | 主要交付物 |
|-------|------|----------|
| 1 | Week 1 | 基礎設施 |
| 2 | Week 1-2 | 類型生成 |
| 3 | Week 2 | 核心客戶端 |
| 4 | Week 3-4 | API 服務 |
| 5 | Week 4 | WebSocket |
| 6 | Week 5 | React Hooks |
| 7 | Week 5 | React 組件 |
| 8 | Week 6 | 文檔範例 |
| 9 | Week 7 | Console 遷移 |
| 10 | Week 8 | CI/CD 發布 |

**總時間**: 8 週
