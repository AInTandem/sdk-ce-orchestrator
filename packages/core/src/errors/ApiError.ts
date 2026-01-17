import { AInTandemError } from './AInTandemError';

/**
 * API request errors (4xx, 5xx)
 */
export class ApiError extends AInTandemError {
  constructor(
    message: string,
    statusCode: number,
    public readonly endpoint: string,
    details?: unknown
  ) {
    // Extract error code from details if available, otherwise use default
    const errorCode =
      (details as { code?: string })?.code || 'API_ERROR';

    super(message, errorCode, statusCode, details);
  }
}
