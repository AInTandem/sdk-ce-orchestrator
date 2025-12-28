import { AInTandemError } from './AInTandemError.js';

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
    super(message, 'API_ERROR', statusCode, details);
  }
}
