# Authentication Guide

This guide explains how to handle user authentication with the AInTandem SDK, including login, logout, token management, and automatic refresh.

## Overview

The AInTandem SDK uses JWT (JSON Web Token) for authentication:

- **Access Token**: Used for API request authentication, with a shorter validity period
- **Refresh Token**: Used to obtain new access tokens, with a longer validity period
- **Automatic Refresh**: The SDK automatically handles token expiration and refresh

## Core SDK Authentication

### 1. Login

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// Basic login
const response = await client.auth.login({
  username: 'user@example.com',
  password: 'your-password',
});

console.log('Access Token:', response.accessToken);
console.log('Refresh Token:', response.refreshToken);
console.log('User Info:', response.user);
```

### 2. Check Authentication Status

```typescript
// Check if authenticated
if (client.auth.isAuthenticated()) {
  console.log('User is logged in');
} else {
  console.log('User is not logged in');
}
```

### 3. Token Verification

```typescript
// Verify if current token is valid
try {
  const isValid = await client.auth.verify();
  if (isValid) {
    console.log('Token is valid');
  } else {
    console.log('Token is invalid or expired');
  }
} catch (error) {
  console.error('Verification failed:', error);
}
```

### 4. Manual Token Refresh

```typescript
// Manually refresh access token
try {
  await client.auth.refresh();
  console.log('Token refreshed');

  const newToken = client.auth.getToken();
  console.log('New Token:', newToken);
} catch (error) {
  console.error('Refresh failed:', error);
  // May need to re-login
}
```

### 5. Logout

```typescript
// Logout and clear locally stored tokens
client.auth.logout();
console.log('Logged out');

// Verify logged out
console.log('Is authenticated:', client.auth.isAuthenticated()); // false
```

### 6. Get Tokens

```typescript
// Get current access token
const token = client.auth.getToken();
console.log('Token:', token);
```

### 7. Token Persistence

Tokens are automatically persisted to localStorage by the SDK. On app restart, the SDK will automatically restore the session from localStorage.

```typescript
// The SDK automatically loads tokens from localStorage on initialization
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// Check if session was restored
if (client.auth.isAuthenticated()) {
  console.log('Session restored from localStorage');

  // Verify token is still valid
  const isValid = await client.auth.verify();
  if (isValid) {
    console.log('Session is valid');
  } else {
    console.log('Session expired, please login again');
    client.auth.logout();
  }
}
```

## Automatic Token Refresh

The SDK automatically handles token expiration:

```typescript
// When API returns 401 (Unauthorized), SDK automatically tries to refresh token
try {
  // If access token expires, SDK will automatically refresh and retry request
  const workflows = await client.workflows.listWorkflows('published');
  console.log('Workflow list:', workflows);
} catch (error) {
  // Only throws error if refresh fails (e.g., refresh token also expired)
  console.error('Request failed:', error);
}
```

## React Authentication Integration

### 1. Using AInTandemProvider

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemProvider
      config={{ baseURL: 'https://api.aintandem.com' }}
      onAuthSuccess={(user) => {
        console.log('Login successful:', user);
        // Can save user info to localStorage
        localStorage.setItem('user', JSON.stringify(user));
      }}
      onAuthError={(error) => {
        console.error('Authentication failed:', error);
        // Display error message
      }}
    >
      <YourApp />
    </AInTandemProvider>
  );
}
```

### 2. Using useAuth Hook

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
      // After successful login, isAuthenticated will automatically update to true
      console.log('Login successful, user:', user);
    } catch (err) {
      // error will be automatically set
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    // After logout, isAuthenticated will automatically update to false
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.username}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          {error && <div className="error">{error.message}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
    </div>
  );
}
```

### 3. Using useUser Hook (Shortcut)

```tsx
import { useUser } from '@aintandem/sdk-react';

function UserProfile() {
  const user = useUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### 4. Using useAInTandem Hook (Full Control)

```tsx
import { useAInTandem } from '@aintandem/sdk-react';

function AdvancedAuth() {
  const { client, isAuthenticated, user, login, logout, refresh, isLoading, error } = useAInTandem();

  const handleRefresh = async () => {
    try {
      await refresh();
      console.log('Token refreshed');
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  return (
    <div>
      <p>Authentication status: {isAuthenticated ? 'Logged in' : 'Not logged in'}</p>
      <p>User: {user?.username || 'N/A'}</p>
      <button onClick={() => login({ username: 'user', password: 'pass' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={handleRefresh}>Refresh Token</button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## Saving and Restoring Sessions

### Core SDK

The SDK automatically handles token persistence using localStorage. Tokens are saved after login and automatically restored on client initialization.

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// Login - tokens are automatically saved to localStorage
const response = await client.auth.login({
  username: 'user',
  password: 'pass',
});

console.log('Login successful:', response.user);
console.log('Token:', response.token);

// On app restart, the SDK automatically restores the session
// Check if session is valid
if (client.auth.isAuthenticated()) {
  const isValid = await client.auth.verify();
  if (isValid) {
    console.log('Session restored and valid');
  } else {
    console.log('Session expired, please login again');
  }
}
```

### React Application

```tsx
import { useEffect } from 'react';
import { AInTandemProvider } from '@aintandem/sdk-react';
import type { AInTandemProviderProps } from '@aintandem/sdk-react';

function App() {
  const config: AInTandemProviderProps['config'] = {
    baseURL: 'https://api.aintandem.com',
  };

  const handleAuthSuccess = (user: any) => {
    // Provider automatically saves token to localStorage
    // You can perform additional operations here
    console.log('Login successful:', user);
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

// Provider automatically restores session from localStorage
// No manual handling needed
```

## Error Handling

### Handling Authentication Errors

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
        console.error('Invalid username or password');
        break;
      case 'USER_NOT_FOUND':
        console.error('User does not exist');
        break;
      case 'AUTHENTICATION_FAILED':
        console.error('Authentication failed');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

### React Error Handling

```tsx
import { useAuth } from '@aintandem/sdk-react';

function LoginForm() {
  const { login, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'user', password: 'pass' });
    } catch (err) {
      // error will be automatically updated to state
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {error && (
        <div className="error-message">
          {error.code === 'INVALID_CREDENTIALS' && 'Invalid username or password'}
          {error.code === 'USER_NOT_FOUND' && 'User does not exist'}
          {error.code === 'AUTHENTICATION_FAILED' && 'Authentication failed, please try again later'}
        </div>
      )}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

## Security Best Practices

### 1. Don't Hardcode Passwords in Client

```typescript
// ❌ Wrong approach
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
  password: 'hardcoded-password', // Don't do this
});

// ✅ Correct approach
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});
// Let users enter password through UI
```

### 2. Use HTTPS

```typescript
// ✅ Production must use HTTPS
const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com', // HTTPS
});

// ❌ Avoid using HTTP (except for debugging)
const client = new AInTandemClient({
  baseURL: 'http://api.aintandem.com', // Not secure
});
```

### 3. Protect Tokens

```typescript
// Tokens are automatically stored in localStorage (handled by AuthManager)
// Don't expose tokens in URLs or logs

// ❌ Wrong approach
console.log('Access Token:', client.auth.getAccessToken());
window.location.href = `https://example.com?token=${client.auth.getAccessToken()}`;

// ✅ Correct approach
// Only use tokens when necessary (SDK will automatically add to request headers)
```

### 4. Handle Token Expiration

```typescript
// SDK automatically handles token refresh
// But you should listen for authentication failures

const { onAuthError } = useAInTandem();

// Set in Provider
<AInTandemProvider
  config={{ baseURL: 'https://api.aintandem.com' }}
  onAuthError={(error) => {
    // When authentication fails (e.g., refresh token also expired)
    // Redirect to login page
    window.location.href = '/login';
  }}
>
  <YourApp />
</AInTandemProvider>
```

## Complete Examples

### Core SDK Authentication Flow

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

  // Login
  async login(username: string, password: string) {
    const response = await this.client.auth.login({ username, password });
    this.saveSession(response);
    return response.user;
  }

  // Logout
  logout() {
    this.client.auth.logout();
    localStorage.removeItem('auth_tokens');
  }

  // Save session
  private saveSession(response: any) {
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    }));
  }

  // Restore session
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

  // Get client
  getClient() {
    return this.client;
  }
}

// Usage
const authService = new AuthService();
await authService.login('user', 'pass');
const client = authService.getClient();
```

### React Authentication Flow

```tsx
import { AInTandemProvider, useAuth } from '@aintandem/sdk-react';
import { ErrorBoundary } from '@aintandem/sdk-react/components';

// 1. Set up Provider
function App() {
  return (
    <ErrorBoundary>
      <AInTandemProvider
        config={{ baseURL: 'https://api.aintandem.com' }}
        onAuthSuccess={(user) => {
          console.log('Login successful:', user);
        }}
        onAuthError={(error) => {
          console.error('Authentication failed:', error);
          // Can redirect to login page here
        }}
      >
        <MainApp />
      </AInTandemProvider>
    </ErrorBoundary>
  );
}

// 2. Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

// 3. Login page
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
      // Error already handled by useAuth hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      {error && <div className="error">{error.message}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// 4. Main app
function MainApp() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <h1>Welcome, {user?.username}!</h1>
        <button onClick={logout}>Logout</button>
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

## Next Steps

- [Workflow Management](./workflows.md) - Learn how to manage workflows
- [Task Execution](./tasks.md) - Learn how to execute tasks
- [Real-time Progress Tracking](./real-time-progress.md) - Learn how to track task progress

## FAQ

### Q: Where are tokens saved?

Tokens are saved in `localStorage` by default, automatically managed by `AuthManager`.

### Q: How to customize token storage?

You can extend the `AuthManager` class and override the `loadTokens` and `saveTokens` methods.

### Q: When do tokens expire?

Access token validity is determined by server configuration. The SDK will automatically refresh expired tokens.

### Q: How to handle token refresh during concurrent requests?

The SDK uses a locking mechanism internally to ensure only one request triggers token refresh, while other requests wait for refresh to complete.

---

**Happy coding!** 🔐
