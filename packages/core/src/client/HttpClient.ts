/**
 * HTTP Client
 *
 * Wrapper around Fetch API with retry logic, interceptors, and error handling.
 */

import type { RequestInterceptor, ResponseInterceptor } from '../types/manual/client.types.js';
import { AInTandemError } from '../errors/AInTandemError.js';
import { NetworkError } from '../errors/NetworkError.js';
import { AuthError } from '../errors/AuthError.js';
import { ApiError } from '../errors/ApiError.js';
import { ErrorCode, type ApiErrorResponse } from './types.js';

/**
 * HTTP Client configuration
 */
interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  enableLogging?: boolean;
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
  };
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000,
  enableLogging: false,
};

/**
 * HTTP Client
 *
 * Handles all HTTP requests with automatic retry, timeout, and interceptor support.
 *
 * @example
 * ```typescript
 * const client = new HttpClient({
 *   baseURL: 'https://api.aintandem.com',
 *   timeout: 5000,
 *   retryCount: 3,
 * });
 *
 * const data = await client.request('/api/workflows');
 * ```
 */
export class HttpClient {
  private readonly config: Required<HttpClientConfig>;

  constructor(config: HttpClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
      retryCount: config.retryCount ?? DEFAULT_CONFIG.retryCount,
      retryDelay: config.retryDelay ?? DEFAULT_CONFIG.retryDelay,
      enableLogging: config.enableLogging ?? DEFAULT_CONFIG.enableLogging,
      interceptors: {
        request: config.interceptors?.request ?? [],
        response: config.interceptors?.response ?? [],
      },
    };
  }

  /**
   * Make an HTTP request
   *
   * @param url - Request path (will be appended to baseURL)
   * @param options - Fetch API options
   * @returns Parsed JSON response
   */
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = this.getFullUrl(url);

    if (this.config.enableLogging) {
      console.log(`[HttpClient] ${options.method || 'GET'} ${fullUrl}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      let request = new Request(fullUrl, {
        ...options,
        signal: controller.signal,
      });

      // Apply request interceptors
      request = await this.applyRequestInterceptors(request);

      // Execute request with retry
      const response = await this.fetchWithRetry(request);

      // Apply response interceptors
      const processedResponse = await this.applyResponseInterceptors(response);

      // Check for errors
      if (!processedResponse.ok) {
        throw await this.createError(processedResponse);
      }

      clearTimeout(timeoutId);

      // Parse JSON response
      const text = await processedResponse.text();
      return text ? JSON.parse(text) : (undefined as T);
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error, fullUrl);
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Get full URL by combining baseURL and path
   */
  private getFullUrl(path: string): string {
    // If path is already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Remove leading slash from baseURL and trailing slash from path if present
    const base = this.config.baseURL.replace(/\/$/, '');
    const p = path.replace(/^\//, '');

    return `${base}/${p}`;
  }

  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithRetry(request: Request): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retryCount; attempt++) {
      try {
        const response = await fetch(request);

        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        // Don't retry on successful response
        if (response.ok) {
          return response;
        }

        // For 5xx errors, retry
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error as Error;

        // Don't retry if this is the last attempt
        if (attempt >= this.config.retryCount) {
          break;
        }

        // Don't retry on abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          break;
        }

        // Exponential backoff delay
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        if (this.config.enableLogging) {
          console.log(`[HttpClient] Retry ${attempt + 1}/${this.config.retryCount} after ${delay}ms`);
        }
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(request: Request): Promise<Request> {
    let processed = request;
    const interceptors = this.config.interceptors.request || [];
    for (const interceptor of interceptors) {
      processed = await interceptor(processed);
    }
    return processed;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let processed = response;
    const interceptors = this.config.interceptors.response || [];
    for (const interceptor of interceptors) {
      processed = await interceptor(processed);
    }
    return processed;
  }

  /**
   * Create appropriate error from HTTP response
   * Parses standardized API error responses
   */
  private async createError(response: Response): Promise<AInTandemError> {
    const url = response.url;
    const status = response.status;

    try {
      // Try to parse standardized error response
      const errorBody = await response.json() as ApiErrorResponse;

      // Check if it's a standardized error response
      if (errorBody.error && errorBody.code && errorBody.statusCode) {
        const { error: message, code, details, timestamp, path } = errorBody;

        // Authentication errors
        if (status === 401 || code === ErrorCode.UNAUTHORIZED || code === ErrorCode.AUTHENTICATION_FAILED) {
          return new AuthError(message, status, { url, code, details, timestamp, path });
        }

        // Forbidden errors
        if (status === 403 || code === ErrorCode.FORBIDDEN) {
          return new AuthError(message, status, { url, code, details, timestamp, path });
        }

        // Other API errors with standardized format
        return new ApiError(message, status, url, {
          code,
          details,
          timestamp,
          path,
        });
      }
    } catch (parseError) {
      // Failed to parse JSON or not a standard error response
      // Fall back to basic error
      if (this.config.enableLogging) {
        console.warn('[HttpClient] Failed to parse error response:', parseError);
      }
    }

    // Fallback: Authentication errors
    if (status === 401) {
      return new AuthError('Authentication failed: Invalid or expired token', status, { url });
    }

    if (status === 403) {
      return new AuthError('Forbidden: Insufficient permissions', status, { url });
    }

    // Fallback: Other API errors
    return new ApiError(
      `API request failed: ${response.statusText}`,
      status,
      url,
      { status }
    );
  }

  /**
   * Handle and classify errors
   */
  private handleError(error: unknown, url: string): AInTandemError {
    // Already an AInTandemError
    if (error instanceof AInTandemError) {
      return error;
    }

    // Timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return new NetworkError(
        `Request timeout after ${this.config.timeout}ms`,
        { url, timeout: this.config.timeout }
      );
    }

    // TypeError (network errors, CORS, etc.)
    if (error instanceof TypeError) {
      return new NetworkError(error.message, { url, originalError: error });
    }

    // Unknown error
    return new NetworkError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      { url, originalError: error }
    );
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
