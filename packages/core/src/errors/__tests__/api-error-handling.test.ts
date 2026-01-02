/**
 * SDK API Error Handling Tests
 *
 * These tests verify that the SDK correctly handles and parses
 * standardized API error responses.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HttpClient } from '../../client/HttpClient';
import { ApiError, NetworkError } from '../../client/HttpError';
import { ErrorCode } from '../../client/types';

describe('SDK API Error Handling', () => {
  let httpClient: HttpClient;
  const mockBaseUrl = 'http://localhost:9900/api';

  beforeEach(() => {
    httpClient = new HttpClient({
      baseUrl: mockBaseUrl,
      timeout: 5000,
    });
  });

  describe('Error Response Parsing', () => {
    it('should parse standardized error response correctly', async () => {
      const mockErrorResponse = {
        error: 'Resource not found',
        code: ErrorCode.NOT_FOUND,
        statusCode: 404,
        timestamp: '2025-12-29T00:00:00.000Z',
        path: '/workflows/non-existent',
      };

      // Mock fetch to return error response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.get('/workflows/non-existent');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Resource not found');
        expect((error as ApiError).code).toBe(ErrorCode.NOT_FOUND);
        expect((error as ApiError).statusCode).toBe(404);
      }
    });

    it('should handle validation errors (400)', async () => {
      const mockErrorResponse = {
        error: 'Missing required field: name',
        code: ErrorCode.VALIDATION_ERROR,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/workflows',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.post('/workflows', { description: 'test' });
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(400);
        expect((error as ApiError).code).toBe(ErrorCode.VALIDATION_ERROR);
      }
    });

    it('should handle unauthorized errors (401)', async () => {
      const mockErrorResponse = {
        error: 'Unauthorized',
        code: ErrorCode.UNAUTHORIZED,
        statusCode: 401,
        timestamp: new Date().toISOString(),
        path: '/settings',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.get('/settings');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(401);
        expect((error as ApiError).code).toBe(ErrorCode.UNAUTHORIZED);
      }
    });

    it('should handle forbidden errors (403)', async () => {
      const mockErrorResponse = {
        error: 'Access forbidden',
        code: ErrorCode.FORBIDDEN,
        statusCode: 403,
        timestamp: new Date().toISOString(),
        path: '/admin',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.get('/admin');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(403);
        expect((error as ApiError).code).toBe(ErrorCode.FORBIDDEN);
      }
    });

    it('should handle not found errors (404)', async () => {
      const mockErrorResponse = {
        error: 'Workflow not found',
        code: ErrorCode.WORKFLOW_NOT_FOUND,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: '/workflows/xyz',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.get('/workflows/xyz');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(404);
        expect((error as ApiError).code).toBe(ErrorCode.WORKFLOW_NOT_FOUND);
      }
    });

    it('should handle conflict errors (409)', async () => {
      const mockErrorResponse = {
        error: 'Workflow with this name already exists',
        code: ErrorCode.CONFLICT,
        statusCode: 409,
        timestamp: new Date().toISOString(),
        path: '/workflows',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.post('/workflows', {
          name: 'Existing Workflow',
          description: 'Test',
          definition: { phases: [] },
        });
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(409);
        expect((error as ApiError).code).toBe(ErrorCode.CONFLICT);
      }
    });

    it('should handle internal server errors (500)', async () => {
      const mockErrorResponse = {
        error: 'Internal server error',
        code: ErrorCode.INTERNAL_ERROR,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: '/workflows',
        details: { originalError: 'Database connection failed' },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.get('/workflows');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(500);
        expect((error as ApiError).code).toBe(ErrorCode.INTERNAL_ERROR);
        expect((error as ApiError).details).toBeDefined();
      }
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network failures', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        await httpClient.get('/workflows');
        expect.fail('Should have thrown NetworkError');
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkError);
        expect((error as NetworkError).message).toContain('Network error');
      }
    });

    it('should handle timeout errors', async () => {
      const timeoutClient = new HttpClient({
        baseUrl: mockBaseUrl,
        timeout: 1, // 1ms timeout
      });

      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ ok: true, json: async () => ({}) } as Response);
            }, 100);
          })
      );

      try {
        await timeoutClient.get('/workflows');
        expect.fail('Should have thrown NetworkError');
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkError);
      }
    });
  });

  describe('Legacy Error Response Compatibility', () => {
    it('should handle old-style error responses', async () => {
      // Old format without 'code' field
      const mockErrorResponse = {
        error: 'Some error occurred',
        statusCode: 500,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.get('/workflows');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        // Should use default error code
        expect((error as ApiError).statusCode).toBe(500);
      }
    });

    it('should handle error responses with only message field', async () => {
      // Very old format with only 'message' field
      const mockErrorResponse = {
        message: 'An error occurred',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.get('/workflows');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('An error occurred');
      }
    });
  });

  describe('Error Details Extraction', () => {
    it('should extract details from error response when available', async () => {
      const mockErrorResponse = {
        error: 'Validation failed',
        code: ErrorCode.VALIDATION_ERROR,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/workflows',
        details: {
          fields: ['name', 'description'],
          reasons: ['Field is required', 'Field is too short'],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      } as Response);

      try {
        await httpClient.post('/workflows', {});
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.details).toBeDefined();
        expect(apiError.details).toHaveProperty('fields');
        expect(apiError.details).toHaveProperty('reasons');
      }
    });
  });

  describe('Error Code Constants', () => {
    it('should have all error codes defined', () => {
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.CONFLICT).toBe('CONFLICT');
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCode.WORKFLOW_NOT_FOUND).toBe('WORKFLOW_NOT_FOUND');
      expect(ErrorCode.PROJECT_NOT_FOUND).toBe('PROJECT_NOT_FOUND');
      expect(ErrorCode.ORGANIZATION_NOT_FOUND).toBe('ORGANIZATION_NOT_FOUND');
      expect(ErrorCode.WORKSPACE_NOT_FOUND).toBe('WORKSPACE_NOT_FOUND');
      expect(ErrorCode.TASK_NOT_FOUND).toBe('TASK_NOT_FOUND');
    });
  });
});
