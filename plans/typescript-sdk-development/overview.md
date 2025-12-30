# AInTandem TypeScript SDK 開發計劃 - 總覽

## 專案目標

開發一個完整的 TypeScript SDK，讓前端開發者能夠輕鬆與 AInTandem CE Orchestrator API 互動。

### 核心目標

1. **獨立 npm 套件**：作為 `@aintandem/sdk` 發布，未來可分離至獨立 Git repo
2. **完整的 API 覆蓋**：支援所有 Orchestrator API 端點
3. **自動類型生成**：從 OpenAPI 規範自動生成 TypeScript 類型
4. **React 整合**：提供預構建的 React Hooks 和組件
5. **WebSocket 進度追蹤**：實時任務進度更新
6. **開發者友善**：完整文檔、範例、TypeScript 類型提示

### 目標使用者

- **內部團隊**：Console 前端開發者
- **外部開發者**：需要整合 AInTandem 的第三方開發者

## 當前狀態分析

### ✅ 已完成

1. **Orchestrator API** (TSOA 架構)
   - 控制器完整實現（Auth, Workflow, Task, Container, Context, Workspace, Settings）
   - OpenAPI 規範生成 (`dist/swagger.json`)
   - JWT Bearer Token 認證

2. **Console 前端** (參考實現)
   - 模組化 API 客戶端 (`src/lib/api/`)
   - 認證處理 (`authenticatedFetch`)
   - 配置管理 (支援代理/直接模式)
   - 類型定義 (`src/lib/types.ts`)

3. **目錄結構**
   - Orchestrator: `/base-root/aintandem/default/orchestrator`
   - Console: `/base-root/aintandem/default/console`
   - SDK: `/base-root/aintandem/default/sdk` (待建立)

### ⚠️ 需要注意

1. **API 類型差異**：Console 的 `types.ts` 可能與最新 OpenAPI 規範不一致
2. **重構影響**：API 兩天前有重構，需要驗證前端欄位匹配
3. **SDK 為空**：目前 SDK 目錄是空的，需要從零開始

## SDK 範圍

### 包含功能

#### 1. 核心 API 客戶端
- HTTP 客戶端（基於 Fetch API）
- 自動認證處理
- Token 刷新機制
- 錯誤處理和重試
- 攔截器系統

#### 2. API 服務模組
- **Auth API**: 登入、登出、token 刷新、驗證
- **Workflow API**: CRUD、版本管理、執行控制
- **Task API**: 任務執行、臨時任務、任務歷史
- **Container API**: 容器管理、啟動/停止
- **Context API**: 記憶管理
- **Settings API**: 用戶設置
- **Workspace API**: Organization/Workspace/Project 層次結構

#### 3. WebSocket 進度追蹤
- 實時任務進度更新
- 自動重連機制
- 心跳檢測
- 事件訂閱系統

#### 4. React 整合
- **Context Provider**: `AInTandemProvider`
- **Hooks**:
  - `useAuth()` - 認證狀態管理
  - `useWorkflow(id)` - 工作流數據
  - `useWorkflows(filters)` - 工作流列表
  - `useTask(projectId, taskId)` - 任務詳情
  - `useTaskHistory(projectId, filters)` - 任務歷史
  - `useExecuteTask()` - 任務執行
  - `useProgress(projectId)` - 實時進度
  - `useOrganizations()` - 組織列表
  - `useWorkspaces(organizationId)` - 工作空間列表
  - `useProjects(workspaceId)` - 項目列表
- **組件**:
  - `ProgressTracker` - 進度追蹤器
  - `ProgressBar` - 進度條
  - `AInTandemErrorBoundary` - 錯誤邊界

#### 5. 開發者工具
- TypeScript 類型定義
- JSDoc 註釋
- 使用範例
- API 參考文檔

## 不包含功能

- ❌ Node.js SDK（僅瀏覽器/React）
- ❌ Vue/Angular 整合（僅 React）
- ❌ CLI 工具
- ❌ Mock 數據生成器（由測試工具處理）

## 技術約束

1. **HTTP 客戶端**: Fetch API（原生、輕量級）
2. **TypeScript**: 5.5+（與 orchestrator 一致）
3. **React**: 版本待確認（需要檢查 console 的 package.json）
4. **建置工具**: tsup（快速、簡單）
5. **測試框架**: Vitest（與 orchestrator 一致）
6. **類型生成**: openapi-typescript-codegen
7. **WebSocket**: 原生 WebSocket API

## 成功指標

1. **類型安全**: 100% TypeScript 覆蓋，無 any 類型
2. **測試覆蓋率**: ≥80% code coverage
3. **文檔完整性**: 所有公開 API 有 JSDoc
4. **Bundle 大小**: 核心套件 <100KB gzipped
5. **向後兼容**: 遵循語義化版本控制
6. **Console 遷移**: 成功替換 `src/lib/api/` 實現

## 交付物

### Phase 1: 基礎設施 (Week 1)
- [ ] SDK 專案結構
- [ ] 建置配置 (tsup, TypeScript)
- [ ] package.json 配置
- [ ] OpenAPI 類型生成腳本

### Phase 2: 核心客戶端 (Week 2)
- [ ] HTTP 客戶端類
- [ ] 認證管理器
- [ ] 錯誤處理系統
- [ ] 單元測試

### Phase 3: API 服務 (Week 3-4)
- [ ] Auth API
- [ ] Workflow API
- [ ] Task API
- [ ] Container API
- [ ] Context API
- [ ] Settings API
- [ ] Workspace API

### Phase 4: WebSocket 客戶端 (Week 4)
- [ ] ProgressClient 類
- [ ] 自動重連機制
- [ ] 事件系統
- [ ] 測試

### Phase 5: React Hooks (Week 5)
- [ ] AInTandemProvider
- [ ] 認證相關 hooks
- [ ] Workflow hooks
- [ ] Task hooks
- [ ] Workspace hooks

### Phase 6: React 組件 (Week 5)
- [ ] ProgressTracker
- [ ] ProgressBar
- [ ] ErrorBoundary

### Phase 7: 文檔和範例 (Week 6)
- [ ] README.md
- [ ] API 參考 (TypeDoc)
- [ ] 使用範例
- [ ] 快速開始指南

### Phase 8: Console 遷移 (Week 7)
- [ ] 安裝 SDK
- [ ] 逐步替換 API 調用
- [ ] 測試和驗證
- [ ] 移除舊代碼

### Phase 9: CI/CD (Week 7)
- [ ] GitHub Actions 工作流
- [ ] 自動化測試
- [ ] 自動發布
- [ ] 變更日誌生成

### Phase 10: 發布和維護 (Week 8)
- [ ] npm 發布
- [ ] 版本標籤
- [ ] 文檔網站
- [ ] 反饋收集

## 風險和緩解策略

| 風險 | 影響 | 緩解策略 |
|-----|------|---------|
| API 類型不匹配 | 高 | 從 OpenAPI 自動生成類型，定期同步 |
| Token 過期處理 | 中 | 實施自動刷新和重試機制 |
| WebSocket 連接不穩定 | 中 | 指數退避重連，心跳檢測 |
| Bundle 大小過大 | 中 | Tree-shaking，按需加載 |
| 向後兼容性破壞 | 高 | 語義化版本控制，變更日誌 |
| Console 遷移複雜度 | 中 | 漸進式替換，保持 API 相容 |

## 相關文件

- [架構設計](./architecture.md)
- [技術選擇](./tech-stack.md)
- [實施階段](./implementation-phases.md)
- [整合策略](./integration.md)
- [測試策略](./testing.md)
- [文檔策略](./documentation.md)
