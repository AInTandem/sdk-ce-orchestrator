# SDK 測試快速入門指南

## 🚀 5 分鐘快速開始

### 1. 運行 SDK 測試

```bash
# 在 SDK 目錄
cd /base-root/aintandem/default/sdk

# 運行所有測試
pnpm test

# 運行測試並生成覆蓋率報告
pnpm test:coverage

# 監聽模式（開發時使用）
pnpm test:watch
```

### 2. 運行 E2E 測試（需要 Orchestrator 運行中）

```bash
# 確保 Orchestrator 運行在 http://localhost:9900
cd /base-root/aintandem/default/orchestrator
pnpm dev

# 在另一個終端運行 E2E 測試
cd /base-root/aintandem/default/sdk
ORCHESTRATOR_URL=http://localhost:9900 \
TEST_USER=admin \
TEST_PASSWORD=admin123 \
pnpm test:e2e
```

## 📁 測試文件位置

```
sdk/
├── vitest.config.ts              # 單元測試配置
├── vitest.e2e.config.ts          # E2E 測試配置
├── vitest.setup.ts               # MSW Mock 設置
│
├── packages/core/src/client/
│   └── index.test.ts             # SDK Core 測試 ✅
│
├── packages/react/src/hooks/
│   ├── useAInTandem.test.tsx     # React Hooks 測試 ✅
│   └── useTaskProgress.test.tsx  # 進度追蹤測試 ✅
│
└── tests/e2e/
    └── sdk-orchestrator.e2e.test.ts  # E2E 測試 ✅
```

## 🎯 測試覆蓋範圍

### ✅ SDK Core 測試（550+ 行，80+ 用例）
- 客戶端初始化
- 認證流程
- Settings 服務
- Workflows 服務
- Tasks 服務
- Containers 服務
- 錯誤處理
- 服務整合

### ✅ React Hooks 測試（300+ 行，30+ 用例）
- useAInTandem
- useAuth
- useWorkflows
- useTasks
- useSettings
- Provider callbacks

### ✅ 實時進度追蹤測試（350+ 行，20+ 用例）
- useTaskProgress
- useWorkflowProgress
- useContainerProgress
- WebSocket 連接管理

### ✅ E2E 測試（450+ 行，20+ 用例）
- 真實 API 驗證
- 所有服務端到端流程
- 錯誤處理
- 性能測試

## 🛠️ 常用命令

```bash
# SDK 測試
pnpm test                    # 運行單元測試
pnpm test:watch              # 監聽模式
pnpm test:coverage           # 覆蓋率報告
pnpm test:e2e                # E2E 測試
pnpm test:all                # 所有測試

# Orchestrator 測試
pnpm test:unit               # 單元測試
pnpm test:e2e                # E2E 測試
pnpm test:cov                # 覆蓋率
```

## 📊 查看覆蓋率報告

```bash
pnpm test:coverage

# 打開 HTML 報告
open coverage/index.html     # macOS
xdg-open coverage/index.html # Linux
start coverage/index.html    # Windows
```

## 🔍 運行特定測試

```bash
# 運行特定文件
pnpm test packages/core/src/client/index.test.ts

# 運行匹配的測試
pnpm test -t "should login"

# 運行特定測試套件
pnpm test --testNamePattern="AuthService"
```

## 💡 編寫新測試

### 基本模板

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something when condition', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### React Hook 測試模板

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

it('should update state', async () => {
  const { result } = renderHook(() => useHook(), {
    wrapper: TestProvider,
  });

  await act(async () => {
    await result.current.action();
  });

  await waitFor(() => {
    expect(result.current.state).toBe('expected');
  });
});
```

## 📖 更多資源

- [完整測試指南](./docs/TESTING.md)
- [Phase 10 工作報告](../orchestrator/worklogs/typescript-sdk-development/phase-10-integration-testing.md)
- [測試總結](./TESTING_SUMMARY.md)

## ❓ 遇到問題？

### 測試失敗？
1. 檢查 Orchestrator 是否運行（E2E 測試）
2. 清除快取：`rm -rf node_modules/.vitest`
3. 重新安裝依賴：`pnpm install`

### Mock 不工作？
1. 檢查 `vitest.setup.ts` 中的 MSW handlers
2. 確認 URL 匹配
3. 查看測試日誌

### 覆蓋率低？
1. 運行 `pnpm test:coverage`
2. 打開 `coverage/index.html`
3. 找到未覆蓋的代碼並添加測試

---

**開始測試吧！** 🚀
