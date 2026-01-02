import { AInTandemError } from './AInTandemError';

/**
 * Validation errors
 */
export class ValidationError extends AInTandemError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 422, details);
  }
}
