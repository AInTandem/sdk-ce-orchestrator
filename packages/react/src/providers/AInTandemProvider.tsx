/**
 * AInTandem Provider
 *
 * React Context Provider for AInTandem SDK.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { AInTandemClient } from '@aintandem/sdk-core';
import type { AInTandemClientConfig } from '@aintandem/sdk-core';
import type { LoginRequest, LoginResponse } from '@aintandem/sdk-core';

/**
 * AInTandem context value
 */
export interface AInTandemContextValue {
  /** SDK client instance */
  client: AInTandemClient;
  /** Authentication status */
  isAuthenticated: boolean;
  /** Current user (if authenticated) */
  user: LoginResponse['user'] | null;
  /** Login function */
  login: (credentials: LoginRequest) => Promise<void>;
  /** Logout function */
  logout: () => void;
  /** Refresh token function */
  refresh: () => Promise<void>;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * AInTandem Provider props
 */
export interface AInTandemProviderProps {
  /** SDK configuration */
  config: AInTandemClientConfig;
  /** Children components */
  children: ReactNode;
  /** Auto-connect to WebSocket on mount */
  autoConnectWebSocket?: boolean;
  /** On auth success callback */
  onAuthSuccess?: (user: LoginResponse['user'] | null) => void;
  /** On auth error callback */
  onAuthError?: (error: Error) => void;
}

/**
 * AInTandem Context
 */
const AInTandemContext = createContext<AInTandemContextValue | null>(null);

/**
 * AInTandem Provider
 *
 * Provides AInTandem SDK client and auth state to all child components.
 *
 * @example
 * ```tsx
 * import { AInTandemProvider } from '@aintandem/sdk-react';
 *
 * function App() {
 *   return (
 *     <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
 *       <YourApp />
 *     </AInTandemProvider>
 *   );
 * }
 * ```
 */
export function AInTandemProvider({
  config,
  children,
  autoConnectWebSocket = false,
  onAuthSuccess,
  onAuthError,
}: AInTandemProviderProps) {
  const [client] = useState(() => new AInTandemClient(config));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (client.auth.isAuthenticated()) {
          setIsAuthenticated(true);
          // Try to verify token
          const isValid = await client.auth.verify();
          if (!isValid) {
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('[AInTandemProvider] Auth check failed:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [client]);

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest) => {
      setError(null);
      setIsLoading(true);

      try {
        const response = await client.auth.login(credentials);
        setIsAuthenticated(true);
        setUser(response.user);
        onAuthSuccess?.(response.user ?? null);
      } catch (err) {
        const error = err as Error;
        setError(error);
        onAuthError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, onAuthSuccess, onAuthError]
  );

  // Logout function
  const logout = useCallback(() => {
    client.auth.logout();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  }, [client]);

  // Refresh token function
  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await client.auth.refresh();
      // Token refreshed, still authenticated
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsAuthenticated(false);
      setUser(null);
      onAuthError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, onAuthError]);

  const contextValue: AInTandemContextValue = {
    client,
    isAuthenticated,
    user,
    login,
    logout,
    refresh,
    isLoading,
    error,
  };

  return (
    <AInTandemContext.Provider value={contextValue}>
      {children}
    </AInTandemContext.Provider>
  );
}

/**
 * Use AInTandem Context
 *
 * @returns AInTandem context value
 * @throws Error if used outside AInTandemProvider
 *
 * @example
 * ```tsx
 * import { useAInTandem } from '@aintandem/sdk-react';
 *
 * function MyComponent() {
 *   const { client, isAuthenticated, user, login, logout } = useAInTandem();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login({ username: 'user', password: 'pass' })}>Login</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.username}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAInTandem(): AInTandemContextValue {
  const context = useContext(AInTandemContext);

  if (!context) {
    throw new Error('useAInTandem must be used within AInTandemProvider');
  }

  return context;
}
