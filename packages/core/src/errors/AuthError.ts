import { AInTandemError } from './AInTandemError.js';

/**
 * Authentication-related errors
 */
export class AuthError extends AInTandemError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, 'AUTH_ERROR', statusCode, details);
  }
}
