import { AInTandemError } from './AInTandemError.js';

/**
 * Network-related errors
 */
export class NetworkError extends AInTandemError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', undefined, details);
  }
}
