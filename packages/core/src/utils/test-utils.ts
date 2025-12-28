/**
 * Test utilities
 */

import { vi } from 'vitest';

/**
 * In-memory token storage for testing
 */
export class InMemoryTokenStorage {
  private token: string | null = null;
  private refreshToken: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  removeToken(): void {
    this.token = null;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  clear(): void {
    this.token = null;
    this.refreshToken = null;
  }
}

/**
 * Create a mock HTTP client
 */
export function createMockHttpClient() {
  return {
    request: vi.fn(),
  };
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
