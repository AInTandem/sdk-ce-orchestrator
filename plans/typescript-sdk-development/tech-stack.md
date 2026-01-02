# 技術選擇

## 核心技術棧

### 1. 建置工具

**選擇: tsup**

**理由**:
- ✅ 基於 esbuild，極快的建置速度
- ✅ 零配置即可使用
- ✅ 原生支援 TypeScript
- ✅ 自動生成類型聲明文件（.d.ts）
- ✅ 支援多 entry points
- ✅ Tree-shaking 友善
- ✅ 與 pnpm workspace 整合良好

**替代方案**:
- ❌ Rollup: 配置複雜，建置速度較慢
- ❌ unbuild: 不夠成熟，生態系統較小
- ❌ Vite (Plugin Mode): 過度設計，不需要 dev server

**配置範例**:
```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  external: ['react', 'react-dom'],
});
```

### 2. 類型生成工具

**選擇: openapi-typescript-codegen**

**理由**:
- ✅ 從 OpenAPI 3.0 規範生成 TypeScript 類型
- ✅ 同時生成 API 客戶端函數（可選）
- ✅ 支援自定義模板
- ✅ 良好的 TypeScript 類型推斷
- ✅ 支援 JSDoc 註釋
- ✅ 可集成到 CI/CD

**替代方案**:
- ❌ openapi-typescript: 只生成類型，不生成客戶端
- ❌ swagger-typescript-api: 維護不活躍
- ❌ orval: 過於複雜，學習曲線陡峭

**使用方式**:
```bash
# 生成類型
npx openapi-typescript-codegen \
  --input ../orchestrator/dist/swagger.json \
  --output ./packages/core/src/types/generated \
  --client axios \
  --useOptions
```

**自定義腳本** (`scripts/generate-types.ts`):
```typescript
import { generate } from 'openapi-typescript-codegen';

async function generateTypes() {
  await generate({
    input: '../orchestrator/dist/swagger.json',
    output: './packages/core/src/types/generated',
    httpClient: 'fetch',
    useOptions: true,
    exportServices: true,
  });
}

generateTypes();
```

### 3. HTTP 客戶端

**選擇: 原生 Fetch API**

**理由**:
- ✅ 瀏覽器原生支持，無需額外依賴
- ✅ 輕量級，減小 bundle 大小
- ✅ Promise-based，API 友善
- ✅ 支援 Streaming
- ✅ 可被 polyfill（支援舊瀏覽器）
- ✅ 與 Service Worker 整合良好

**替代方案**:
- ❌ Axios: 增加約 15KB bundle，對於簡單 CRUD 過度設計
- ❌ Ky: 雖然輕量，但仍是額外依賴

**實現設計**:
```typescript
// 核心包裝器
class HttpClient {
  async fetch(url: string, options: RequestInit): Promise<Response> {
    // 攔截器鏈
    // 重試邏輯
    // 錯誤處理
    return fetch(url, options);
  }
}
```

### 4. WebSocket 實現

**選擇: 原生 WebSocket API**

**理由**:
- ✅ 瀏覽器原生支持
- ✅ 無需額外依賴
- ✅ 簡單易懂
- ✅ 與 Fetch API 一致的設計理念

**替代方案**:
- ❌ socket.io-client: 過度設計，需要後端支援
- ❌ ws: 僅限 Node.js，瀏覽器不支援
- ❌ SockJS: 降級策略不必要（目標瀏覽器都支援 WebSocket）

**實現設計**:
```typescript
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;

  connect(url: string): void {
    this.ws = new WebSocket(url);
    this.ws.addEventListener('message', this.handleMessage);
    this.ws.addEventListener('close', this.handleReconnect);
  }
}
```

### 5. 測試框架

**選擇: Vitest**

**理由**:
- ✅ 與 orchestrator 和 console 保持一致
- ✅ 比 Jest 快 10-100 倍（使用 esbuild）
- ✅ 原生支援 ESM
- ✅ TypeScript 零配置
- ✅ 與 Vite 生態系統兼容

**配置範例**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### 6. Mock 工具

**選擇: MSW (Mock Service Worker)**

**理由**:
- ✅ 攔截網絡請求（fetch 和 WebSocket）
- ✅ 真實的 API 行為模擬
- ✅ 同一套 mock 用於開發和測試
- ✅ TypeScript 支援良好
- ✅ 與 React 測試兼容

**替代方案**:
- ❌ vi.fn(): 需要大量手動 mock
- ❌ nock: 僅支援 Node.js，不支援瀏覽器環境

**使用範例**:
```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/auth/login', async ({ request }) => {
    return HttpResponse.json({
      token: 'mock-token',
      user: { id: '1', username: 'test' },
    });
  }),
];

// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 7. 文檔工具

**選擇: TypeDoc + Markdown**

**理由**:
- ✅ 從 JSDoc/TypeScript 註釋自動生成 API 文檔
- ✅ 支援 TypeScript 類型
- ✅ 可生成靜態網站
- ✅ 與 GitHub Pages 整合
- ✅ Markdown 適合編寫教程和指南

**替代方案**:
- ❌ Storybook: 過度設計，適合組件庫，不適合 SDK
- ❌ Docusaurus: 適合大型文檔網站，但配置複雜

**TypeScript 配置**:
```json
// typedoc.json
{
  "entryPoints": ["packages/core/src/index.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "none",
  "excludePrivate": true,
  "excludeProtected": false
}
```

### 8. 版本管理工具

**選擇: Changesets**

**理由**:
- ✅ 語義化版本控制（Semantic Versioning）
- ✅ 自動生成變更日誌
- ✅ 支援 monorepo
- ✅ 與 GitHub Actions 整合
- ✅ 團隊協作友善

**替代方案**:
- ❌ semantic-release: 過於自動化，難以控制
- ❌ standard-version: 不支援 monorepo

**配置範例**:
```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@2.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@aintandem/sdk-types"]
}
```

## 開發工具

### 1. Package Manager

**選擇: pnpm**

**理由**:
- ✅ 與 orchestrator 和 console 一致
- ✅ 節省磁碟空間（硬鏈接）
- ✅ 嚴格的依賴管理（避免 phantom dependencies）
- ✅ 原生 workspace 支援

### 2. Monorepo 工具

**選擇: pnpm workspace**

**理由**:
- ✅ 內建於 pnpm，無需額外配置
- ✅ 簡單易用
- ✅ 與 tsup 整合良好

**配置**:
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'examples/*'
  - 'tests'
```

### 3. TypeScript 配置

**選擇: 嚴格模式 + Project References**

**理由**:
- ✅ 類型安全最大化
- ✅ 編譯時錯誤檢查
- ✅ 改善 IDE 體驗

**配置**:
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

### 4. Linting

**選擇: ESLint + TypeScript ESLint**

**理由**:
- ✅ 確保程式碼一致性
- ✅ TypeScript 支援
- ✅ 可自動修復問題

**配置**:
```javascript
// eslint.config.js
import tseslint from 'typescript-eslint';

export default [
  ...typescripteslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
];
```

### 5. Formatting

**選擇: Prettier**

**理由**:
- ✅ 統一的程式碼風格
- ✅ 與 ESLint 整合
- ✅ 支援多種檔案類型

**配置**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## CI/CD 工具

### 1. GitHub Actions

**工作流**:
1. **CI Workflow** (`ci.yml`)
   - Lint 檢查
   - 類型檢查
   - 單元測試
   - 建置驗證

2. **Release Workflow** (`release.yml`)
   - 執行 changesets
   - 更新版本號
   - 發布到 npm
   - 創建 GitHub Release

3. **Sync Types Workflow** (`sync-types.yml`)
   - 從 orchestrator 拉取最新 OpenAPI 規範
   - 自動生成類型
   - 提交 PR

### 2. npm Registry

**選擇: npmjs.com (公開)**

**理由**:
- ✅ 全球 CDN
- ✅ 最大用戶群
- ✅ 與 GitHub Actions 整合良好

**套件命名**:
- `@aintandem/sdk` - 核心 SDK
- `@aintandem/sdk-react` - React 整合

## 依賴管理

### 生產依賴 (dependencies)

#### @aintandem/sdk-core
```json
{
  "dependencies": {
    // 無運行時依賴！
  }
}
```

**為什麼無依賴？**
- ✅ 最小化 bundle 大小
- ✅ 避免版本衝突
- ✅ 使用瀏覽器原生 API

#### @aintandem/sdk-react
```json
{
  "dependencies": {
    "@aintandem/sdk-core": "workspace:*",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 開發依賴 (devDependencies)

```json
{
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "eslint": "^8.0.0",
    "msw": "^2.0.0",
    "openapi-typescript-codegen": "^0.25.0",
    "prettier": "^3.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^1.0.0"
  }
}
```

## 技術決策總結

| 類別 | 選擇 | 理由 |
|-----|------|------|
| 建置工具 | tsup | 快速、簡單、零配置 |
| 類型生成 | openapi-typescript-codegen | 完整功能、良好支援 |
| HTTP 客戶端 | Fetch API | 原生、輕量 |
| WebSocket | 原生 WebSocket API | 原生、簡單 |
| 測試框架 | Vitest | 一致性、快速 |
| Mock 工具 | MSW | 真實行為、易用 |
| 文檔工具 | TypeDoc + Markdown | 自動生成、靈活 |
| 版本管理 | Changesets | 語義化、monorepo |
| Package Manager | pnpm | 一致性、效率 |

## 未來擴展性

### 可選整合（未來）

1. **Vue 整合** (`@aintandem/sdk-vue`)
   - Composition API
   - Vue 3 支援

2. **Angular 整合** (`@aintandem/sdk-angular`)
   - Services
   - HttpClient 整合

3. **Node.js SDK** (`@aintandem/sdk-node`)
   - node-fetch 支援
   - CLI 工具

4. **管理後台**
   - Dashboard
   - API 監控
   - 錯誤追蹤
