/**
 * SDK Error Types and Constants
 *
 * Defines error codes and types that match the API's error response format.
 */

/**
 * Error codes that match the API's ErrorCode enum
 */
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_VALUE = 'INVALID_VALUE',
  INVALID_STATUS = 'INVALID_STATUS',

  // Authentication/Authorization errors (401, 403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',

  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  WORKFLOW_NOT_FOUND = 'WORKFLOW_NOT_FOUND',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  CONTAINER_NOT_FOUND = 'CONTAINER_NOT_FOUND',
  OPERATION_NOT_FOUND = 'OPERATION_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  WORKFLOW_IN_USE = 'WORKFLOW_IN_USE',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  code: ErrorCode;
  statusCode: number;
  details?: unknown;
  timestamp?: string;
  path?: string;
}

/**
 * HTTP methods enum
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * HTTP request configuration
 */
export interface HttpRequestConfig {
  method: HttpMethod;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}
