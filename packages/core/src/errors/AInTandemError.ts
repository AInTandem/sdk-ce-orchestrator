/**
 * Base error class for all SDK errors
 */
export class AInTandemError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
