# SDK Testing Quick Start Guide

## 🚀 5 Minutes Quick Start

### 1. Run SDK Tests

```bash
# In SDK directory
cd /base-root/aintandem/default/sdk

# Run all tests
pnpm test

# Run tests with coverage report
pnpm test:coverage

# Watch mode (for development)
pnpm test:watch
```

### 2. Run E2E Tests (requires Orchestrator running)

```bash
# Ensure Orchestrator is running on http://localhost:9900
cd /base-root/aintandem/default/orchestrator
pnpm dev

# Run E2E tests in another terminal
cd /base-root/aintandem/default/sdk
ORCHESTRATOR_URL=http://localhost:9900 \
TEST_USER=admin \
TEST_PASSWORD=admin123 \
pnpm test:e2e
```

## 📁 Test File Locations

```
sdk/
├── vitest.config.ts              # Unit test configuration
├── vitest.e2e.config.ts          # E2E test configuration
├── vitest.setup.ts               # MSW Mock setup
│
├── packages/core/src/client/
│   └── index.test.ts             # SDK Core tests ✅
│
├── packages/react/src/hooks/
│   ├── useAInTandem.test.tsx     # React Hooks tests ✅
│   └── useTaskProgress.test.tsx  # Progress tracking tests ✅
│
└── tests/e2e/
    └── sdk-orchestrator.e2e.test.ts  # E2E tests ✅
```

## 🎯 Test Coverage

### ✅ SDK Core Tests (550+ lines, 80+ test cases)
- Client initialization
- Authentication flow
- Settings service
- Workflows service
- Tasks service
- Containers service
- Error handling
- Service integration

### ✅ React Hooks Tests (300+ lines, 30+ test cases)
- useAInTandem
- useAuth
- useWorkflows
- useTasks
- useSettings
- Provider callbacks

### ✅ Real-time Progress Tracking Tests (350+ lines, 20+ test cases)
- useTaskProgress
- useWorkflowProgress
- useContainerProgress
- WebSocket connection management

### ✅ E2E Tests (450+ lines, 20+ test cases)
- Real API validation
- All service end-to-end flows
- Error handling
- Performance testing

## 🛠️ Common Commands

```bash
# SDK tests
pnpm test                    # Run unit tests
pnpm test:watch              # Watch mode
pnpm test:coverage           # Coverage report
pnpm test:e2e                # E2E tests
pnpm test:all                # All tests

# Orchestrator tests
pnpm test:unit               # Unit tests
pnpm test:e2e                # E2E tests
pnpm test:cov                # Coverage
```

## 📊 View Coverage Report

```bash
pnpm test:coverage

# Open HTML report
open coverage/index.html     # macOS
xdg-open coverage/index.html # Linux
start coverage/index.html    # Windows
```

## 🔍 Run Specific Tests

```bash
# Run specific file
pnpm test packages/core/src/client/index.test.ts

# Run matching tests
pnpm test -t "should login"

# Run specific test suite
pnpm test --testNamePattern="AuthService"
```

## 💡 Writing New Tests

### Basic Template

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

### React Hook Test Template

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

## 📖 More Resources

- [Complete Testing Guide](./docs/TESTING.md)
- [Phase 10 Work Report](../orchestrator/worklogs/typescript-sdk-development/phase-10-integration-testing.md)
- [Testing Summary](./TESTING_SUMMARY.md)

## ❓ Having Problems?

### Tests failing?
1. Check if Orchestrator is running (for E2E tests)
2. Clear cache: `rm -rf node_modules/.vitest`
3. Reinstall dependencies: `pnpm install`

### Mock not working?
1. Check MSW handlers in `vitest.setup.ts`
2. Confirm URL matching
3. Check test logs

### Low coverage?
1. Run `pnpm test:coverage`
2. Open `coverage/index.html`
3. Find uncovered code and add tests

---

**Start testing!** 🚀
