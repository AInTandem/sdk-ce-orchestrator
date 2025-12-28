/**
 * Client configuration types
 */

/**
 * Main client configuration
 */
export interface AInTandemClientConfig {
  /**
   * API base URL (e.g., https://api.aintandem.com)
   */
  baseURL: string;

  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;

  /**
   * Number of retry attempts (default: 3)
   */
  retryCount?: number;

  /**
   * Initial retry delay in milliseconds (default: 1000)
   */
  retryDelay?: number;

  /**
   * Enable request/response logging (default: false)
   */
  enableLogging?: boolean;

  /**
   * Request and response interceptors
   */
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
  };

  /**
   * Token storage implementation (default: localStorage)
   */
  storage?: TokenStorage;

  /**
   * WebSocket configuration
   */
  websocket?: WebSocketConfig;
}

/**
 * Request interceptor function
 */
export type RequestInterceptor = (
  request: Request
) => Request | Promise<Request>;

/**
 * Response interceptor function
 */
export type ResponseInterceptor = (
  response: Response
) => Response | Promise<Response>;

/**
 * Token storage interface
 */
export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  /**
   * WebSocket URL (default: derived from baseURL)
   */
  url?: string;

  /**
   * Reconnect interval in milliseconds (default: 5000)
   */
  reconnectInterval?: number;

  /**
   * Maximum reconnect attempts (default: 10)
   */
  maxReconnectAttempts?: number;
}

/**
 * Default token storage using localStorage
 */
export class LocalStorageTokenStorage implements TokenStorage {
  private readonly key = 'aintandem_token';

  getToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(this.key);
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.key, token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.key);
    }
  }
}
