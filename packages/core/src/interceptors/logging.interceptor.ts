/**
 * Logging Interceptor
 *
 * Logs HTTP requests and responses for debugging.
 */

import type { RequestInterceptor, ResponseInterceptor } from '../types/manual/client.types';

/**
 * Create a logging interceptor for requests
 *
 * @param prefix - Log prefix (default: '[HTTP]')
 * @returns Request interceptor function
 *
 * @example
 * ```typescript
 * const loggingInterceptor = createLoggingInterceptor('[HTTP]');
 *
 * const client = new HttpClient({
 *   baseURL: 'https://api.aintandem.com',
 *   interceptors: {
 *     request: [loggingInterceptor],
 *   },
 * });
 * ```
 */
export function createLoggingInterceptor(prefix = '[HTTP]'): RequestInterceptor {
  return async (request: Request): Promise<Request> => {
    console.log(`${prefix} Request:`, {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    });

    return request;
  };
}

/**
 * Create a logging interceptor for responses
 *
 * @param prefix - Log prefix (default: '[HTTP]')
 * @returns Response interceptor function
 */
export function createResponseLoggingInterceptor(prefix = '[HTTP]'): ResponseInterceptor {
  return async (response: Response): Promise<Response> => {
    console.log(`${prefix} Response:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
    });

    return response;
  };
}
