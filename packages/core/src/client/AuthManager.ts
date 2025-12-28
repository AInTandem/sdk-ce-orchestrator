/**
 * Authentication Manager
 *
 * Handles token storage, authentication state, and automatic token refresh.
 */

import type { TokenStorage } from '../types/manual/client.types.js';
import type { LoginRequest, LoginResponse, RefreshResponse } from '../types/generated/index.js';
import { HttpClient } from './HttpClient.js';
import { AuthError } from '../errors/AuthError.js';

/**
 * Auth Manager Configuration
 */
interface AuthManagerConfig {
  storage: TokenStorage;
  httpClient: HttpClient;
  autoRefresh?: boolean;
  refreshThreshold?: number; // Refresh token X milliseconds before expiry (default: 5 minutes)
}

/**
 * JWT token payload
 */
interface JWTPokenPayload {
  exp: number; // Expiration time in seconds since epoch
  iat?: number; // Issued at time
  sub?: string; // Subject (user ID)
}

/**
 * Authentication Manager
 *
 * Manages user authentication state, token storage, and automatic token refresh.
 *
 * @example
 * ```typescript
 * const authManager = new AuthManager({
 *   storage: new LocalStorageTokenStorage(),
 *   httpClient: new HttpClient({ baseURL: 'https://api.aintandem.com' }),
 * });
 *
 * // Login
 * const response = await authManager.login({ username: 'user', password: 'pass' });
 * console.log('Logged in as:', response.user);
 *
 * // Check authentication status
 * if (authManager.isAuthenticated()) {
 *   console.log('User is authenticated');
 * }
 *
 * // Logout
 * authManager.logout();
 * ```
 */
export class AuthManager {
  private readonly storage: TokenStorage;
  private readonly httpClient: HttpClient;
  private readonly autoRefresh: boolean;
  private readonly refreshThreshold: number;

  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: AuthManagerConfig) {
    this.storage = config.storage;
    this.httpClient = config.httpClient;
    this.autoRefresh = config.autoRefresh ?? true;
    this.refreshThreshold = config.refreshThreshold ?? 5 * 60 * 1000; // 5 minutes

    // Load existing tokens from storage
    this.loadTokens();

    // Setup auto-refresh if token exists
    if (this.token && this.autoRefresh) {
      this.setupAutoRefresh();
    }
  }

  /**
   * Login with credentials
   *
   * @param credentials - Login credentials
   * @returns Login response with user info
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.httpClient.post<LoginResponse>(
        '/api/auth/login',
        credentials
      );

      this.token = response.token;
      this.refreshToken = response.refreshToken || null;

      // Store tokens
      if (this.token) {
        this.storage.setToken(this.token);
      }

      // Setup auto-refresh
      if (this.autoRefresh) {
        this.setupAutoRefresh();
      }

      return response;
    } catch (error) {
      throw new AuthError(
        `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        401,
        { originalError: error }
      );
    }
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.token = null;
    this.refreshToken = null;

    // Clear storage
    this.storage.removeToken();

    // Clear auto-refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refresh access token
   *
   * @returns Refresh response with new token
   * @throws AuthError if no refresh token is available
   */
  async refresh(): Promise<RefreshResponse> {
    if (!this.refreshToken) {
      throw new AuthError('No refresh token available', 401);
    }

    try {
      const response = await this.httpClient.post<RefreshResponse>(
        '/api/auth/refresh',
        { refreshToken: this.refreshToken }
      );

      this.token = response.token;
      this.refreshToken = response.refreshToken || this.refreshToken;

      // Store new token
      if (this.token) {
        this.storage.setToken(this.token);
      }

      // Setup auto-refresh again
      if (this.autoRefresh) {
        this.setupAutoRefresh();
      }

      return response;
    } catch (error) {
      // If refresh fails, clear tokens and force re-login
      this.logout();
      throw new AuthError(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        401,
        { originalError: error }
      );
    }
  }

  /**
   * Verify current token
   *
   * @returns Verification response
   */
  async verify(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await this.httpClient.post<{ valid: boolean }>('/api/auth/verify', {
        token: this.token,
      });
      return response.valid;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token && !this.isTokenExpired(this.token);
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    if (this.token && this.isTokenExpired(this.token)) {
      this.token = null;
      return null;
    }
    return this.token;
  }

  /**
   * Get authorization header for requests
   *
   * @returns Headers object with Authorization header
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Load tokens from storage
   */
  private loadTokens(): void {
    this.token = this.storage.getToken();
    // Note: refresh token is typically stored separately or in a more secure way
    // For now, we'll assume it's managed by the login/refresh flow
  }

  /**
   * Setup automatic token refresh
   */
  private setupAutoRefresh(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.token) {
      return;
    }

    try {
      const payload = this.parseToken(this.token);
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // If token is already expired, don't setup refresh
      if (timeUntilExpiry <= 0) {
        return;
      }

      // Schedule refresh before token expires
      const refreshTime = Math.max(timeUntilExpiry - this.refreshThreshold, 0);

      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refresh();
        } catch (error) {
          console.error('[AuthManager] Auto-refresh failed:', error);
        }
      }, refreshTime);
    } catch (error) {
      console.error('[AuthManager] Failed to setup auto-refresh:', error);
    }
  }

  /**
   * Parse JWT token
   *
   * @param token - JWT token
   * @returns Parsed token payload
   */
  private parseToken(token: string): JWTPokenPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as JWTPokenPayload;
    } catch (error) {
      throw new AuthError('Failed to parse token', 401, { originalError: error });
    }
  }

  /**
   * Check if token is expired
   *
   * @param token - JWT token
   * @returns True if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseToken(token);
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiresAt;
    } catch {
      return true; // If we can't parse the token, consider it expired
    }
  }
}
