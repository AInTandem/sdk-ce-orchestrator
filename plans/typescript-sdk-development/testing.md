# 測試策略

## 測試金字塔

```
           E2E
          (少量)
         /      \
      Integration
       (中等)
     /            \
  Unit Tests
   (大量)
```

## 1. 單元測試 (Unit Tests)

### 目標
測試獨立的函數和類，不依賴外部系統。

### 工具
- **Vitest**: 測試框架
- **MSW**: Mock Service Worker（mock fetch）
- **@testing-library/react-hooks**: React hooks 測試

### 覆蓋率要求
- **Lines**: ≥80%
- **Functions**: ≥80%
- **Branches**: ≥80%
- **Statements**: ≥80%

### 1.1 HTTP 客戶端測試

**目標**: 測試 HttpClient 的核心功能。

```typescript
// packages/core/src/client/__tests__/HttpClient.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../HttpClient';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    client = new HttpClient({
      baseURL: 'https://api.test.com',
      timeout: 5000,
      retryCount: 3,
      retryDelay: 100,
    });
  });

  describe('request', () => {
    it('should make successful GET request', async () => {
      server.use(
        http.get('https://api.test.com/test', () => {
          return HttpResponse.json({ message: 'success' });
        })
      );

      const result = await client.request<{ message: string }>('/test');
      expect(result).toEqual({ message: 'success' });
    });

    it('should add Authorization header when token provided', async () => {
      const authInterceptor = vi.fn((request) => {
        const headers = new Headers(request.headers);
        headers.set('Authorization', 'Bearer test-token');
        return new Request(request, { headers });
      });

      server.use(
        http.get('https://api.test.com/test', ({ request }) => {
          expect(request.headers.get('Authorization')).toBe('Bearer test-token');
          return HttpResponse.json({});
        })
      );

      const clientWithAuth = new HttpClient({
        baseURL: 'https://api.test.com',
        interceptors: {
          request: [authInterceptor],
        },
      });

      await clientWithAuth.request('/test');
      expect(authInterceptor).toHaveBeenCalledOnce();
    });

    it('should retry failed requests', async () => {
      let attempts = 0;
      server.use(
        http.get('https://api.test.com/test', () => {
          attempts++;
          if (attempts < 3) {
            return HttpResponse.error();
          }
          return HttpResponse.json({ success: true });
        })
      );

      const result = await client.request('/test');
      expect(result).toEqual({ success: true });
      expect(attempts).toBe(3);
    });

    it('should timeout after specified duration', async () => {
      server.use(
        http.get('https://api.test.com/test', async () => {
          await new Promise(resolve => setTimeout(resolve, 10000));
          return HttpResponse.json({});
        })
      );

      await expect(client.request('/test')).rejects.toThrow('timeout');
    });

    it('should throw ApiError on 4xx/5xx responses', async () => {
      server.use(
        http.get('https://api.test.com/test', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      await expect(client.request('/test')).rejects.toThrow('ApiError');
    });
  });

  describe('interceptors', () => {
    it('should apply request interceptors in order', async () => {
      const interceptor1 = vi.fn((req) => req);
      const interceptor2 = vi.fn((req) => req);

      server.use(
        http.get('https://api.test.com/test', () => HttpResponse.json({}))
      );

      const client = new HttpClient({
        baseURL: 'https://api.test.com',
        interceptors: {
          request: [interceptor1, interceptor2],
        },
      });

      await client.request('/test');

      expect(interceptor1).toHaveBeenCalledBefore(interceptor2);
    });

    it('should apply response interceptors', async () => {
      const responseInterceptor = vi.fn((res) => res);

      server.use(
        http.get('https://api.test.com/test', () => HttpResponse.json({}))
      );

      const client = new HttpClient({
        baseURL: 'https://api.test.com',
        interceptors: {
          response: [responseInterceptor],
        },
      });

      await client.request('/test');
      expect(responseInterceptor).toHaveBeenCalledOnce();
    });
  });
});
```

### 1.2 AuthManager 測試

```typescript
// packages/core/src/client/__tests__/AuthManager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthManager } from '../AuthManager';
import { InMemoryTokenStorage } from '../../utils/test-utils';

describe('AuthManager', () => {
  let authManager: AuthManager;
  let storage: InMemoryTokenStorage;
  let mockHttpClient: any;

  beforeEach(() => {
    storage = new InMemoryTokenStorage();
    mockHttpClient = {
      request: vi.fn(),
    };
    authManager = new AuthManager(storage, mockHttpClient);
  });

  describe('login', () => {
    it('should store token after successful login', async () => {
      const mockResponse = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: { id: '1', username: 'test' },
      };

      mockHttpClient.request.mockResolvedValue(mockResponse);

      const result = await authManager.login({
        username: 'test',
        password: 'password',
      });

      expect(result).toEqual(mockResponse);
      expect(storage.getToken()).toBe('test-token');
    });

    it('should throw AuthError on failed login', async () => {
      mockHttpClient.request.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authManager.login({ username: 'test', password: 'wrong' })
      ).rejects.toThrow();
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      storage.setToken('old-token');
      storage.setRefreshToken('refresh-token');

      mockHttpClient.request.mockResolvedValue({
        token: 'new-token',
        refreshToken: 'new-refresh-token',
      });

      await authManager.refresh();

      expect(storage.getToken()).toBe('new-token');
    });
  });

  describe('getAuthHeader', () => {
    it('should return Authorization header when authenticated', () => {
      storage.setToken('test-token');
      expect(authManager.getAuthHeader()).toEqual({
        Authorization: 'Bearer test-token',
      });
    });

    it('should return empty object when not authenticated', () => {
      expect(authManager.getAuthHeader()).toEqual({});
    });
  });

  describe('logout', () => {
    it('should clear tokens', () => {
      storage.setToken('test-token');
      authManager.logout();

      expect(storage.getToken()).toBeNull();
    });
  });
});
```

### 1.3 服務測試

```typescript
// packages/core/src/services/__tests__/WorkflowService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowService } from '../WorkflowService';
import { HttpClient } from '../../client/HttpClient';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('WorkflowService', () => {
  let service: WorkflowService;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = {
      request: vi.fn(),
    } as any;
    service = new WorkflowService(mockHttpClient);
  });

  describe('listWorkflows', () => {
    it('should return list of workflows', async () => {
      const mockWorkflows = [
        { id: '1', name: 'Workflow 1' },
        { id: '2', name: 'Workflow 2' },
      ];

      mockHttpClient.request.mockResolvedValue(mockWorkflows);

      const result = await service.listWorkflows();

      expect(result).toEqual(mockWorkflows);
      expect(mockHttpClient.request).toHaveBeenCalledWith('/api/workflows');
    });

    it('should filter by status', async () => {
      mockHttpClient.request.mockResolvedValue([]);

      await service.listWorkflows('published');

      expect(mockHttpClient.request).toHaveBeenCalledWith('/api/workflows?status=published');
    });
  });

  describe('createWorkflow', () => {
    it('should create workflow', async () => {
      const newWorkflow = { id: '1', name: 'New Workflow' };
      mockHttpClient.request.mockResolvedValue(newWorkflow);

      const result = await service.createWorkflow({
        name: 'New Workflow',
        description: 'Description',
        definition: { phases: [], transitions: [] },
      });

      expect(result).toEqual(newWorkflow);
      expect(mockHttpClient.request).toHaveBeenCalledWith('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('New Workflow'),
      });
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete workflow', async () => {
      mockHttpClient.request.mockResolvedValue(undefined);

      await service.deleteWorkflow('1');

      expect(mockHttpClient.request).toHaveBeenCalledWith('/api/workflows/1', {
        method: 'DELETE',
      });
    });
  });
});
```

### 1.4 React Hooks 測試

```typescript
// packages/react/src/hooks/__tests__/useWorkflow.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWorkflow } from '../useWorkflow';
import { AInTandemProvider } from '../../providers/AInTandemProvider';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('useWorkflow', () => {
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('when workflow exists', () => {
    it('should return workflow data', async () => {
      const mockWorkflow = {
        id: '1',
        name: 'Test Workflow',
        status: 'published' as const,
      };

      server.use(
        http.get('https://api.test.com/api/workflows/1', () => {
          return HttpResponse.json(mockWorkflow);
        })
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AInTandemProvider config={{ baseURL: 'https://api.test.com' }}>
          {children}
        </AInTandemProvider>
      );

      const { result } = renderHook(() => useWorkflow('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.workflow).toEqual(mockWorkflow);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('when workflow does not exist', () => {
    it('should return error', async () => {
      server.use(
        http.get('https://api.test.com/api/workflows/1', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AInTandemProvider config={{ baseURL: 'https://api.test.com' }}>
          {children}
        </AInTandemProvider>
      );

      const { result } = renderHook(() => useWorkflow('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
```

## 2. 整合測試 (Integration Tests)

### 目標
測試多個模組之間的交互。

### 2.1 客戶端整合測試

```typescript
// tests/integration/client.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AInTandemClient } from '@aintandem/sdk-core';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('AInTandemClient Integration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should authenticate and make authenticated request', async () => {
    server.use(
      http.post('https://api.test.com/api/auth/login', () => {
        return HttpResponse.json({
          token: 'test-token',
          user: { id: '1', username: 'test' },
        });
      }),
      http.get('https://api.test.com/api/workflows', () => {
        return HttpResponse.json([
          { id: '1', name: 'Workflow 1' },
        ]);
      })
    );

    const client = new AInTandemClient({
      baseURL: 'https://api.test.com',
    });

    // Login
    await client.auth.login({ username: 'test', password: 'password' });

    // Make authenticated request
    const workflows = await client.workflows.listWorkflows();

    expect(workflows).toHaveLength(1);
    expect(workflows[0].name).toBe('Workflow 1');
  });
});
```

## 3. E2E 測試 (End-to-End Tests)

### 目標
測試完整的用戶流程。

### 3.1 React 應用 E2E

```typescript
// tests/e2e/workflow-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Workflow Management Flow', () => {
  test('should create and manage workflow', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Login
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Navigate to workflows
    await page.click('a[href="/workflows"]');

    // Create workflow
    await page.click('button:has-text("New Workflow")');
    await page.fill('input[name="name"]', 'Test Workflow');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.click('button:has-text("Create")');

    // Verify workflow created
    await expect(page.locator('text=Test Workflow')).toBeVisible();

    // Edit workflow
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="name"]', 'Updated Workflow');
    await page.click('button:has-text("Save")');

    // Verify workflow updated
    await expect(page.locator('text=Updated Workflow')).toBeVisible();

    // Delete workflow
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');

    // Verify workflow deleted
    await expect(page.locator('text=Updated Workflow')).not.toBeVisible();
  });
});
```

## 4. Mock 策略

### 4.1 MSW Handlers

```typescript
// packages/core/src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.username === 'test' && body.password === 'password') {
      return HttpResponse.json({
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: { id: '1', username: 'test' },
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // Workflows
  http.get('/api/workflows', () => {
    return HttpResponse.json([
      { id: '1', name: 'Workflow 1', status: 'published' },
      { id: '2', name: 'Workflow 2', status: 'draft' },
    ]);
  }),

  http.get('/api/workflows/:id', ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json({
        id: '1',
        name: 'Workflow 1',
        status: 'published',
        definition: { phases: [], transitions: [] },
      });
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
];
```

### 4.2 測試工具函數

```typescript
// packages/core/src/utils/test-utils.ts
export class InMemoryTokenStorage {
  private token: string | null = null;
  private refreshToken: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  removeToken(): void {
    this.token = null;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }
}

export function createMockClient() {
  return {
    request: vi.fn(),
  };
}
```

## 5. 測試配置

### 5.1 Vitest 配置

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
      reporter: ['text', 'html', 'lcov', 'json'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'packages/core/src/types/generated/',
      ],
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

### 5.2 測試設置

```typescript
// tests/setup.ts
import { vi } from 'vitest';
import { server } from './mocks/server';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

## 6. 持續整合 (CI)

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Run tests
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 7. 測試最佳實踐

### 7.1 命名慣例

- 測試檔案: `*.test.ts` 或 `*.test.tsx`
- 測試描述: 使用 `should...` 格式
- 變量命名: 清楚表達意圖

```typescript
// ❌ 不好的命名
it('test1', () => {});

// ✅ 好的命名
it('should return error when workflow not found', () => {});
```

### 7.2 AAA 模式

```typescript
it('should create workflow', async () => {
  // Arrange (準備)
  const service = new WorkflowService(mockClient);
  const data = { name: 'Test', description: 'Test' };

  // Act (執行)
  const result = await service.createWorkflow(data);

  // Assert (斷言)
  expect(result.name).toBe('Test');
});
```

### 7.3 測試隔離

- 每個測試應該獨立運行
- 使用 `beforeEach` 清理狀態
- 避免測試之間的依賴

```typescript
beforeEach(() => {
  // 重置 mock
  vi.clearAllMocks();

  // 重置存儲
  localStorage.clear();
});
```

### 7.4 避免實現細節

```typescript
// ❌ 測試實現細節
it('should call httpClient.request with specific parameters', () => {
  expect(mockClient.request).toHaveBeenCalledWith('/api/workflows/1', {
    method: 'GET',
  });
});

// ✅ 測試行為
it('should return workflow data', async () => {
  const workflow = await service.getWorkflow('1');
  expect(workflow.id).toBe('1');
});
```

## 8. 性能測試

### 8.1 Bundle 大小測試

```bash
# 測試 bundle 大小
pnpm build
ls -lh dist/
```

### 8.2 響應時間測試

```typescript
it('should complete request within timeout', async () => {
  const start = Date.now();

  await service.listWorkflows();

  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000); // < 1s
});
```
