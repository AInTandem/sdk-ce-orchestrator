# AInTandem SDK 測試指南

本指南提供完整的 SDK 測試說明，包括如何運行測試、編寫測試和維護測試覆蓋率。

## 目錄

- [快速開始](#快速開始)
- [測試類型](#測試類型)
- [運行測試](#運行測試)
- [編寫測試](#編寫測試)
- [測試覆蓋率](#測試覆蓋率)
- [CI/CD](#cicd)
- [常見問題](#常見問題)

## 快速開始

### 安裝依賴

```bash
pnpm install
```

### 運行所有測試

```bash
# SDK 測試（在 SDK 目錄）
cd /base-root/aintandem/default/sdk
pnpm test

# Orchestrator 測試（在 Orchestrator 目錄）
cd /base-root/aintandem/default/orchestrator
pnpm test:unit
```

## 測試類型

### 1. 單元測試 (Unit Tests)

測試獨立的函數和類，不依賴外部服務。

**位置**: `packages/*/src/**/*.test.ts`

**範例**:
```typescript
import { describe, it, expect } from 'vitest';

describe('AuthService', () => {
  it('should validate credentials', () => {
    const isValid = AuthService.validateCredentials('user', 'pass');
    expect(isValid).toBe(true);
  });
});
```

### 2. 整合測試 (Integration Tests)

測試多個模組如何協作，使用 MSW Mock API。

**位置**: `packages/core/src/client/index.test.ts`

**範例**:
```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

describe('AInTandemClient Integration', () => {
  it('should login successfully', async () => {
    const client = new AInTandemClient({
      baseURL: 'http://localhost:9900',
    });

    const response = await client.auth.login({
      username: 'testuser',
      password: 'password123',
    });

    expect(response.success).toBe(true);
  });
});
```

### 3. React Hooks 測試

測試 React 自定義 Hooks。

**位置**: `packages/react/src/hooks/**/*.test.tsx`

**範例**:
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@aintandem/sdk-react';

describe('useAuth', () => {
  it('should login and update state', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AInTandemProvider,
    });

    await act(async () => {
      await result.current.login({ username: 'test', password: 'pass' });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

### 4. 端對端測試 (E2E Tests)

測試真實的 Orchestrator API。

**位置**: `tests/e2e/**/*.test.ts`

**前置條件**:
- Orchestrator 伺服器運行中
- 環境變數設置

**範例**:
```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

describe('E2E: Settings API', () => {
  it('should fetch real settings', async () => {
    const client = new AInTandemClient({
      baseURL: process.env.ORCHESTRATOR_URL,
    });

    await client.auth.login({
      username: process.env.TEST_USER,
      password: process.env.TEST_PASSWORD,
    });

    const settings = await client.settings.getSettings();
    expect(settings).toBeDefined();
  });
});
```

## 運行測試

### SDK 測試命令

```bash
# 運行所有單元測試
pnpm test

# 監聽模式（自動重新運行）
pnpm test:watch

# 生成覆蓋率報告
pnpm test:coverage

# 運行 E2E 測試（需要 Orchestrator 運行中）
ORCHESTRATOR_URL=http://localhost:9900 \
TEST_USER=admin \
TEST_PASSWORD=admin123 \
pnpm test:e2e

# 運行所有測試（單元 + E2E）
pnpm test:all
```

### Orchestrator 測試命令

```bash
# 單元測試
pnpm test:unit

# 單元測試（監聽模式）
pnpm test:unit:watch

# 測試覆蓋率
pnpm test:cov

# E2E 測試
pnpm test:e2e
```

## 編寫測試

### 測試文件結構

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  // Setup
  beforeEach(() => {
    // 準備測試環境
  });

  // Cleanup
  afterEach(() => {
    // 清理測試環境
  });

  // Test cases
  it('should do something when condition', () => {
    // Arrange - 準備
    const input = 'test';

    // Act - 執行
    const result = functionUnderTest(input);

    // Assert - 驗證
    expect(result).toBe('expected');
  });
});
```

### 測試最佳實踐

#### 1. 清晰的測試命名

```typescript
// ✅ 好的命名
it('should return user data when authenticated', () => {});

// ❌ 不好的命名
it('test1', () => {});
```

#### 2. AAA 模式 (Arrange-Act-Assert)

```typescript
it('should update workflow', async () => {
  // Arrange - 準備測試數據
  const workflowId = 'wf-123';
  const updates = { name: 'Updated Workflow' };

  // Act - 執行測試動作
  const result = await client.workflows.updateWorkflow(workflowId, updates);

  // Assert - 驗證結果
  expect(result.name).toBe('Updated Workflow');
  expect(result.id).toBe(workflowId);
});
```

#### 3. 異步測試

```typescript
it('should handle async operations', async () => {
  // 使用 async/await
  const result = await asyncFunction();

  // 或使用 Promise
  await expect(promiseFunction()).resolves.toBe('value');

  // 或等待條件
  await waitFor(() => {
    expect(condition).toBe(true);
  });
});
```

#### 4. Mock 和 Spy

```typescript
import { vi } from 'vitest';

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async-value');

// Spy on function
const spy = vi.spyOn(client.auth, 'login');
expect(spy).toHaveBeenCalledWith('username', 'password');

// Reset mocks
afterEach(() => {
  vi.clearAllMocks();
});
```

#### 5. 錯誤測試

```typescript
it('should throw error on invalid input', () => {
  expect(() => {
    functionUnderTest(invalidInput);
  }).toThrow('Invalid input');
});

it('should reject promise on error', async () => {
  await expect(asyncFunction()).rejects.toThrow();
});
```

### React Hooks 測試

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

it('should update state on login', async () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: TestProvider,
  });

  // 使用 act 包裝狀態更新
  await act(async () => {
    await result.current.login({ username, password });
  });

  // 使用 waitFor 等待異步更新
  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

###  Mock API 端點

在 `vitest.setup.ts` 中添加新的 mock handlers：

```typescript
import { http, HttpResponse } from 'msw';

mockServer.use(
  http.get('/endpoint', ({ request }) => {
    // 處理請求
    return HttpResponse.json({
      data: 'mocked response',
    });
  }),

  http.post('/endpoint', async ({ request }) => {
    const body = await request.json();

    if (body.valid) {
      return HttpResponse.json({ success: true });
    }

    return HttpResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  })
);
```

## 測試覆蓋率

### 查看覆蓋率報告

```bash
pnpm test:coverage
```

### 覆蓋率門檻

當前設置的門檻：

| 指標 | 門檻 |
|------|------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

### 覆蓋率報告位置

- **Terminal**: 即時顯示摘要
- **HTML**: `coverage/index.html`
- **LCOV**: `coverage/lcov.info`
- **JSON**: `coverage/coverage-final.json`

### 提高覆蓋率

1. **識別未覆蓋代碼**
   ```bash
   pnpm test:coverage
   # 打開 coverage/index.html
   ```

2. **添加測試用例**
   - 測試邊界情況
   - 測試錯誤路徑
   - 測試不同分支

3. **驗證改進**
   ```bash
   pnpm test:coverage
   # 檢查覆蓋率是否提升
   ```

## CI/CD

### GitHub Actions 範例

```yaml
name: SDK Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: sdk
          name: codecov-${{ matrix.node-version }}

  e2e:
    runs-on: ubuntu-latest
    needs: test

    services:
      orchestrator:
        image: aintandem/orchestrator:latest
        ports:
          - 9900:9900
        env:
          NODE_ENV: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20.x

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Run E2E tests
        env:
          ORCHESTRATOR_URL: http://localhost:9900
          TEST_USER: admin
          TEST_PASSWORD: admin123
        run: pnpm test:e2e
```

### 本地 Pre-commit Hook

使用 Husky 設置：

```bash
# 安裝 Husky
pnpm add -D husky lint-staged

# 設置 hook
npx husky install .husky/pre-commit "pnpm test"
```

## 常見問題

### Q: 測試失敗，如何調試？

A: 使用 `console.log` 或 Vitest 的 UI 模式：

```bash
pnpm test --ui
```

### Q: Mock 不工作？

A: 確保：
1. MSW server 正確設置
2. 請求 URL 匹配
3. 在正確的生命週期設置 mock

```typescript
// vitest.setup.ts
beforeAll(() => {
  mockServer.listen();
});

afterEach(() => {
  mockServer.resetHandlers(); // 重置 handlers
});

afterAll(() => {
  mockServer.close();
});
```

### Q: WebSocket 測試失敗？

A: 確保使用 MockWebSocket：

```typescript
// vitest.setup.ts
class MockWebSocket {
  // Mock implementation
}

global.WebSocket = MockWebSocket;
```

### Q: 測試很慢？

A: 優化建議：
1. 使用 parallel 運行（Vitest 預設）
2. 減少不必要的 `waitFor`
3. 使用 mock 而非真實 API
4. 運行特定測試文件

```bash
# 運行特定文件
pnpm test packages/core/src/client/index.test.ts

# 運行匹配模式的測試
pnpm test --testNamePattern="should login"
```

### Q: 如何測試錯誤處理？

A: 使用多種方式：

```typescript
// 1. Throw error
it('should throw on error', () => {
  expect(() => fn()).toThrow();
});

// 2. Reject promise
it('should reject on error', async () => {
  await expect(asyncFn()).rejects.toThrow();
});

// 3. Return error object
it('should return error object', async () => {
  const result = await asyncFn();
  expect(result.error).toBeDefined();
});
```

## 資源

- [Vitest 文檔](https://vitest.dev/)
- [Testing Library 文檔](https://testing-library.com/)
- [MSW 文檔](https://mswjs.io/)
- [React Testing Library](https://testing-library.com/react)

## 貢獻

在提交 PR 前，請確保：

1. ✅ 所有測試通過：`pnpm test`
2. ✅ 覆蓋率不低於門檻：`pnpm test:coverage`
3. ✅ 添加新功能的測試
4. ✅ 遵循測試最佳實踐
