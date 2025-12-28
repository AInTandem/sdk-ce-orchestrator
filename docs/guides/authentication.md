# 認證指南

本指南詳細說明如何使用 AInTandem SDK 處理用戶認證，包括登入、登出、Token 管理和自動刷新。

## 概述

AInTandem SDK 使用 JWT (JSON Web Token) 進行認證：

- **Access Token**: 用於 API 請求認證，有效期較短
- **Refresh Token**: 用於獲取新的 access token，有效期較長
- **自動刷新**: SDK 自動處理 token 過期和刷新

## 核心 SDK 認證

### 1. 登入

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// 基礎登入
const response = await client.auth.login({
  username: 'user@example.com',
  password: 'your-password',
});

console.log('Access Token:', response.accessToken);
console.log('Refresh Token:', response.refreshToken);
console.log('User Info:', response.user);
```

### 2. 檢查認證狀態

```typescript
// 檢查是否已認證
if (client.auth.isAuthenticated()) {
  console.log('用戶已登入');

  // 獲取當前用戶信息
  const user = client.auth.getUser();
  console.log('當前用戶:', user);
} else {
  console.log('用戶未登入');
}
```

### 3. Token 驗證

```typescript
// 驗證當前 token 是否有效
try {
  const isValid = await client.auth.verify();
  if (isValid) {
    console.log('Token 有效');
  } else {
    console.log('Token 無效或已過期');
  }
} catch (error) {
  console.error('驗證失敗:', error);
}
```

### 4. 手動刷新 Token

```typescript
// 手動刷新 access token
try {
  await client.auth.refresh();
  console.log('Token 已刷新');

  const newAccessToken = client.auth.getAccessToken();
  console.log('New Access Token:', newAccessToken);
} catch (error) {
  console.error('刷新失敗:', error);
  // 可能需要重新登入
}
```

### 5. 登出

```typescript
// 登出並清除本地存儲的 token
client.auth.logout();
console.log('已登出');

// 驗證已登出
console.log('是否已認證:', client.auth.isAuthenticated()); // false
```

### 6. 獲取 Token

```typescript
// 獲取當前 access token
const accessToken = client.auth.getAccessToken();
console.log('Access Token:', accessToken);

// 獲取當前 refresh token
const refreshToken = client.auth.getRefreshToken();
console.log('Refresh Token:', refreshToken);
```

### 7. 設置 Token（用於恢復會話）

```typescript
// 從 localStorage 恢復會話
const savedTokens = localStorage.getItem('auth_tokens');
if (savedTokens) {
  const { accessToken, refreshToken } = JSON.parse(savedTokens);

  client.auth.setTokens(accessToken, refreshToken);

  // 驗證 token 是否仍然有效
  const isValid = await client.auth.verify();
  if (isValid) {
    console.log('會話已恢復');
  } else {
    console.log('會話已過期，需要重新登入');
  }
}
```

## 自動 Token 刷新

SDK 會自動處理 token 過期情況：

```typescript
// 當 API 返回 401 (Unauthorized) 時，SDK 會自動嘗試刷新 token
try {
  // 如果 access token 過期，SDK 會自動刷新並重試請求
  const workflows = await client.workflows.listWorkflows('published');
  console.log('工作流列表:', workflows);
} catch (error) {
  // 如果刷新失敗（例如 refresh token 也過期了），才會拋出錯誤
  console.error('請求失敗:', error);
}
```

## React 認證整合

### 1. 使用 AInTandemProvider

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemProvider
      config={{ baseURL: 'https://api.aintandem.com' }}
      onAuthSuccess={(user) => {
        console.log('登入成功:', user);
        // 可以保存用戶信息到 localStorage
        localStorage.setItem('user', JSON.stringify(user));
      }}
      onAuthError={(error) => {
        console.error('認證失敗:', error);
        // 顯示錯誤訊息
      }}
    >
      <YourApp />
    </AInTandemProvider>
  );
}
```

### 2. 使用 useAuth Hook

```tsx
import { useAuth } from '@aintandem/sdk-react';

function LoginForm() {
  const { login, logout, isLoading, error, user, isAuthenticated } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await login({
        username: formData.get('username') as string,
        password: formData.get('password') as string,
      });
      // 登入成功後，isAuthenticated 會自動更新為 true
      console.log('登入成功，用戶:', user);
    } catch (err) {
      // error 會自動設置
      console.error('登入失敗:', error);
    }
  };

  const handleLogout = () => {
    logout();
    // 登出後，isAuthenticated 會自動更新為 false
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>歡迎, {user?.username}!</p>
          <button onClick={handleLogout}>登出</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input name="username" placeholder="用戶名" required />
          <input name="password" type="password" placeholder="密碼" required />
          {error && <div className="error">{error.message}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? '登入中...' : '登入'}
          </button>
        </form>
      )}
    </div>
  );
}
```

### 3. 使用 useUser Hook（快捷方式）

```tsx
import { useUser } from '@aintandem/sdk-react';

function UserProfile() {
  const user = useUser();

  if (!user) {
    return <div>未登入</div>;
  }

  return (
    <div>
      <h1>用戶資料</h1>
      <p>用戶名: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>角色: {user.role}</p>
    </div>
  );
}
```

### 4. 使用 useAInTandem Hook（完整控制）

```tsx
import { useAInTandem } from '@aintandem/sdk-react';

function AdvancedAuth() {
  const { client, isAuthenticated, user, login, logout, refresh, isLoading, error } = useAInTandem();

  const handleRefresh = async () => {
    try {
      await refresh();
      console.log('Token 已刷新');
    } catch (err) {
      console.error('刷新失敗:', err);
    }
  };

  return (
    <div>
      <p>認證狀態: {isAuthenticated ? '已登入' : '未登入'}</p>
      <p>用戶: {user?.username || 'N/A'}</p>
      <button onClick={() => login({ username: 'user', password: 'pass' })}>
        登入
      </button>
      <button onClick={logout}>登出</button>
      <button onClick={handleRefresh}>刷新 Token</button>
      {error && <div>錯誤: {error.message}</div>}
    </div>
  );
}
```

## 保存和恢復會話

### 核心 SDK

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// 登入後保存 token
const response = await client.auth.login({
  username: 'user',
  password: 'pass',
});

// 保存到 localStorage
localStorage.setItem('auth_tokens', JSON.stringify({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  user: response.user,
}));

// 應用重啟時恢復會話
const savedTokens = localStorage.getItem('auth_tokens');
if (savedTokens) {
  const { accessToken, refreshToken } = JSON.parse(savedTokens);
  client.auth.setTokens(accessToken, refreshToken);

  // 驗證 token
  const isValid = await client.auth.verify();
  if (!isValid) {
    // Token 過期，清除本地存儲
    localStorage.removeItem('auth_tokens');
    // 重新登入
  }
}
```

### React 應用

```tsx
import { useEffect } from 'react';
import { AInTandemProvider } from '@aintandem/sdk-react';
import type { AInTandemProviderProps } from '@aintandem/sdk-react';

function App() {
  const config: AInTandemProviderProps['config'] = {
    baseURL: 'https://api.aintandem.com',
  };

  const handleAuthSuccess = (user: any) => {
    // Provider 會自動保存 token 到 localStorage
    // 您可以在這裡執行額外的操作
    console.log('登入成功:', user);
  };

  return (
    <AInTandemProvider
      config={config}
      onAuthSuccess={handleAuthSuccess}
    >
      <YourApp />
    </AInTandemProvider>
  );
}

// Provider 會自動從 localStorage 恢復會話
// 無需手動處理
```

## 錯誤處理

### 處理認證錯誤

```typescript
import { AInTandemError } from '@aintandem/sdk-core';

try {
  await client.auth.login({
    username: 'user',
    password: 'wrong-password',
  });
} catch (error) {
  if (error instanceof AInTandemError) {
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        console.error('用戶名或密碼錯誤');
        break;
      case 'USER_NOT_FOUND':
        console.error('用戶不存在');
        break;
      case 'AUTHENTICATION_FAILED':
        console.error('認證失敗');
        break;
      default:
        console.error('未知錯誤:', error.message);
    }
  }
}
```

### React 錯誤處理

```tsx
import { useAuth } from '@aintandem/sdk-react';

function LoginForm() {
  const { login, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'user', password: 'pass' });
    } catch (err) {
      // error 會自動更新到 state
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {error && (
        <div className="error-message">
          {error.code === 'INVALID_CREDENTIALS' && '用戶名或密碼錯誤'}
          {error.code === 'USER_NOT_FOUND' && '用戶不存在'}
          {error.code === 'AUTHENTICATION_FAILED' && '認證失敗，請稍後再試'}
        </div>
      )}
      <button onClick={handleLogin}>登入</button>
    </div>
  );
}
```

## 安全性最佳實踐

### 1. 不要在客戶端硬編碼密碼

```typescript
// ❌ 錯誤做法
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
  password: 'hardcoded-password', // 不要這樣做
});

// ✅ 正確做法
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});
// 讓用戶通過 UI 輸入密碼
```

### 2. 使用 HTTPS

```typescript
// ✅ 生產環境必須使用 HTTPS
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com', // HTTPS
});

// ❌ 避免使用 HTTP（除錯環境除外）
const client = new AInTandemClient({
  baseURL: 'http://api.aintandem.com', // 不安全
});
```

### 3. 保護 Token

```typescript
// Token 會自動存儲在 localStorage（由 AuthManager 處理）
// 不要將 token 暴露在 URL 或日誌中

// ❌ 錯誤做法
console.log('Access Token:', client.auth.getAccessToken());
window.location.href = `https://example.com?token=${client.auth.getAccessToken()}`;

// ✅ 正確做法
// 只在必要時使用 token（SDK 會自動添加到請求頭）
```

### 4. 處理 Token 過期

```typescript
// SDK 會自動處理 token 刷新
// 但您應該監聽認證失敗的情況

const { onAuthError } = useAInTandem();

// 在 Provider 中設置
<AInTandemProvider
  config={{ baseURL: 'https://api.aintandem.com' }}
  onAuthError={(error) => {
    // 當認證失敗時（例如 refresh token 也過期）
    // 重定向到登入頁面
    window.location.href = '/login';
  }}
>
  <YourApp />
</AInTandemProvider>
```

## 完整範例

### 核心 SDK 認證流程

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

class AuthService {
  private client: AInTandemClient;

  constructor() {
    this.client = new AInTandemClient({
      baseURL: 'https://api.aintandem.com',
    });
    this.restoreSession();
  }

  // 登入
  async login(username: string, password: string) {
    const response = await this.client.auth.login({ username, password });
    this.saveSession(response);
    return response.user;
  }

  // 登出
  logout() {
    this.client.auth.logout();
    localStorage.removeItem('auth_tokens');
  }

  // 保存會話
  private saveSession(response: any) {
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    }));
  }

  // 恢復會話
  private async restoreSession() {
    const saved = localStorage.getItem('auth_tokens');
    if (saved) {
      const { accessToken, refreshToken } = JSON.parse(saved);
      this.client.auth.setTokens(accessToken, refreshToken);

      const isValid = await this.client.auth.verify();
      if (!isValid) {
        this.logout();
      }
    }
  }

  // 獲取客戶端
  getClient() {
    return this.client;
  }
}

// 使用
const authService = new AuthService();
await authService.login('user', 'pass');
const client = authService.getClient();
```

### React 認證流程

```tsx
import { AInTandemProvider, useAuth } from '@aintandem/sdk-react';
import { ErrorBoundary } from '@aintandem/sdk-react/components';

// 1. 設置 Provider
function App() {
  return (
    <ErrorBoundary>
      <AInTandemProvider
        config={{ baseURL: 'https://api.aintandem.com' }}
        onAuthSuccess={(user) => {
          console.log('登入成功:', user);
        }}
        onAuthError={(error) => {
          console.error('認證失敗:', error);
          // 可以在這裡重定向到登入頁面
        }}
      >
        <MainApp />
      </AInTandemProvider>
    </ErrorBoundary>
  );
}

// 2. 受保護的路由組件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>載入中...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

// 3. 登入頁面
function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await login({
        username: formData.get('username') as string,
        password: formData.get('password') as string,
      });
    } catch (err) {
      // Error 已經被 useAuth hook 處理
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="用戶名" required />
      <input name="password" type="password" placeholder="密碼" required />
      {error && <div className="error">{error.message}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登入中...' : '登入'}
      </button>
    </form>
  );
}

// 4. 主應用
function MainApp() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <h1>歡迎, {user?.username}!</h1>
        <button onClick={logout}>登出</button>
      </header>
      <main>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </main>
    </div>
  );
}
```

## 下一步

- [工作流管理](./workflows.md) - 了解如何管理工作流
- [任務執行](./tasks.md) - 了解如何執行任務
- [實時進度追蹤](./real-time-progress.md) - 了解如何追蹤任務進度

## 常見問題

### Q: Token 保存在哪裡？

Token 默認保存在 `localStorage` 中，由 `AuthManager` 自動管理。

### Q: 如何自定義 Token 存儲？

您可以繼承 `AuthManager` 類並覆蓋 `loadTokens` 和 `saveTokens` 方法。

### Q: Token 什麼時候會過期？

Access token 的有效期由服務器配置決定。SDK 會自動刷新過期的 token。

### Q: 如何處理並發請求時的 token 刷新？

SDK 內部使用鎖機制，確保只有一個請求會觸發 token 刷新，其他請求會等待刷新完成。

---

**祝您使用愉快！** 🔐
