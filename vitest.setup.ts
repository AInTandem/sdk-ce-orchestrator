/**
 * Vitest Setup File
 *
 * Global test configuration and utilities
 */

import { vi } from 'vitest';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Mock WebSocket for Node.js environment
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;

  private eventTarget = new EventTarget();

  constructor(url: string) {
    this.url = url;
    // Simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.({ type: 'open' });
      this.eventTarget.dispatchEvent(new Event('open'));
    }, 0);
  }

  send(data: string | ArrayBuffer) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Echo the message back for testing
    setTimeout(() => {
      this.onmessage?.({ data });
    }, 0);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ type: 'close', code: 1000 });
  }

  addEventListener(type: string, listener: any) {
    this.eventTarget.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: any) {
    this.eventTarget.removeEventListener(type, listener);
  }
}

// Only mock WebSocket if not in browser environment
if (typeof window === 'undefined') {
  (global as any).WebSocket = MockWebSocket;
}

// Setup MSW handlers
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

export const mockServer = setupServer();

// Setup request handlers before all tests
beforeAll(() => {
  mockServer.listen({
    onUnhandledRequest: 'error',
  });
});

// Reset request handlers after each test
afterEach(() => {
  mockServer.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  mockServer.close();
});

// Common API response handlers
mockServer.use(
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    if (body.username === 'testuser' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          username: 'testuser',
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: 'Invalid credentials',
      },
      { status: 401 }
    );
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
      user: {
        id: 'user-123',
        username: 'testuser',
      },
    });
  }),

  // Settings endpoints
  http.get('/api/settings', () => {
    return HttpResponse.json({
      gitDisplayName: 'Test User',
      gitEmail: 'test@example.com',
      dockerImage: 'ainkai/flexy:latest',
    });
  }),

  http.put('/api/settings', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Workflows endpoints
  http.get('/api/workflows', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'published';

    return HttpResponse.json({
      workflows: [
        {
          id: 'wf-1',
          name: 'Test Workflow 1',
          description: 'A test workflow',
          status,
          definition: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });
  }),

  http.get('/api/workflows/:id', ({ params }) => {
    if (params.id === 'wf-1') {
      return HttpResponse.json({
        id: 'wf-1',
        name: 'Test Workflow 1',
        description: 'A test workflow',
        status: 'published',
        definition: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    }

    return HttpResponse.json(
      { error: 'Workflow not found' },
      { status: 404 }
    );
  }),

  // Tasks endpoints
  http.post('/api/tasks/execute', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      id: 'task-1',
      status: 'running',
      projectId: body.projectId || 'proj-1',
      task: body.task || 'test-task',
      result: null,
      error: null,
      startedAt: new Date().toISOString(),
    });
  }),

  http.get('/api/tasks/:taskId', ({ params }) => {
    if (params.taskId === 'task-1') {
      return HttpResponse.json({
        id: 'task-1',
        status: 'completed',
        projectId: 'proj-1',
        task: 'test-task',
        result: { success: true },
        error: null,
        startedAt: '2024-01-01T00:00:00.000Z',
        completedAt: '2024-01-01T00:01:00.000Z',
      });
    }

    return HttpResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    );
  }),

  http.post('/api/tasks/:taskId/cancel', () => {
    return HttpResponse.json({
      success: true,
      message: 'Task cancelled',
    });
  }),

  // Containers endpoints
  http.get('/api/containers', () => {
    return HttpResponse.json({
      containers: [
        {
          id: 'cont-1',
          name: 'test-container',
          status: 'running',
          projectId: 'proj-1',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });
  }),
);
