/**
 * Auth Hooks
 *
 * React hooks for authentication.
 */

import { useAInTandem } from '../providers/AInTandemProvider.js';
import type { LoginRequest } from '@aintandem/sdk-core';

/**
 * Use Auth Hook
 *
 * Provides authentication functionality.
 *
 * @example
 * ```tsx
 * import { useAuth } from '@aintandem/sdk-react';
 *
 * function LoginForm() {
 *   const { isAuthenticated, user, login, logout, isLoading, error } = useAuth();
 *
 *   const handleSubmit = async (e: FormEvent) => {
 *     e.preventDefault();
 *     const formData = new FormData(e.currentTarget);
 *     try {
 *       await login({
 *         username: formData.get('username') as string,
 *         password: formData.get('password') as string,
 *       });
 *     } catch (err) {
 *       console.error('Login failed:', err);
 *     }
 *   };
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="username" type="text" />
 *       <input name="password" type="password" />
 *       {error && <div className="error">{error.message}</div>}
 *       <button type="submit">Login</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const { isAuthenticated, user, login, logout, refresh, isLoading, error } = useAInTandem();

  return {
    /** Authentication status */
    isAuthenticated,
    /** Current user */
    user,
    /** Login function */
    login,
    /** Logout function */
    logout,
    /** Refresh token function */
    refresh,
    /** Loading state */
    isLoading,
    /** Error state */
    error,
  };
}

/**
 * Use User Hook
 *
 * Simplified hook for accessing current user.
 *
 * @example
 * ```tsx
 * import { useUser } from '@aintandem/sdk-react';
 *
 * function UserProfile() {
 *   const { user, isAuthenticated } = useUser();
 *
 *   if (!isAuthenticated) {
 *     return <div>Please login</div>;
 *   }
 *
 *   return <div>Welcome, {user?.username}!</div>;
 * }
 * ```
 */
export function useUser() {
  const { user, isAuthenticated } = useAInTandem();

  return {
    /** Current user */
    user,
    /** Authentication status */
    isAuthenticated,
  };
}

/**
 * Use Login Hook
 *
 * Hook focused on login functionality.
 *
 * @example
 * ```tsx
 * import { useLogin } from '@aintandem/sdk-react';
 *
 * function LoginForm() {
 *   const { login, isLoading, error } = useLogin();
 *
 *   const handleLogin = async () => {
 *     try {
 *       await login({ username: 'user', password: 'pass' });
 *     } catch (err) {
 *       // Error is already in the error state
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleLogin} disabled={isLoading}>
 *       {isLoading ? 'Logging in...' : 'Login'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useLogin() {
  const { login, isLoading, error } = useAInTandem();

  return {
    /** Login function */
    login,
    /** Loading state */
    isLoading,
    /** Error state */
    error,
  };
}
