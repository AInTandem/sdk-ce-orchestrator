/**
 * Authentication Interceptor
 *
 * Automatically adds Authorization header to requests.
 */

import type { RequestInterceptor } from '../types/manual/client.types';
import { AuthManager } from '../client/AuthManager';

/**
 * Create an authentication interceptor
 *
 * This interceptor automatically adds the Authorization header
 * with the current Bearer token to all requests.
 *
 * @param authManager - AuthManager instance
 * @returns Request interceptor function
 *
 * @example
 * ```typescript
 * const authInterceptor = createAuthInterceptor(authManager);
 *
 * const client = new HttpClient({
 *   baseURL: 'https://api.aintandem.com',
 *   interceptors: {
 *     request: [authInterceptor],
 *   },
 * });
 * ```
 */
export function createAuthInterceptor(authManager: AuthManager): RequestInterceptor {
  return async (request: Request): Promise<Request> => {
    const authHeader = authManager.getAuthHeader();

    // Only add header if user is authenticated
    if (authHeader.Authorization) {
      const headers = new Headers(request.headers);

      // Add Authorization header
      Object.entries(authHeader).forEach(([key, value]) => {
        headers.set(key, value);
      });

      // Return new request with updated headers
      return new Request(request, { headers });
    }

    return request;
  };
}
