import { describe, it, expect } from 'vitest';
import { AInTandemError } from '../AInTandemError.js';
import { NetworkError } from '../NetworkError.js';
import { AuthError } from '../AuthError.js';
import { ApiError } from '../ApiError.js';
import { ValidationError } from '../ValidationError.js';

describe('Errors', () => {
  describe('AInTandemError', () => {
    it('should create base error', () => {
      const error = new AInTandemError('Test error', 'TEST_CODE', 500, { details: 'test' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ details: 'test' });
      expect(error.name).toBe('AInTandemError');
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Network failed');

      expect(error.message).toBe('Network failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('AuthError', () => {
    it('should create auth error', () => {
      const error = new AuthError('Unauthorized', 401);

      expect(error.message).toBe('Unauthorized');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ApiError', () => {
    it('should create API error', () => {
      const error = new ApiError('Not found', 404, '/api/test');

      expect(error.message).toBe('Not found');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(404);
      expect(error.endpoint).toBe('/api/test');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(422);
    });
  });
});
