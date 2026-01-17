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
  // Use Object.defineProperty to override readonly property
  Object.defineProperty(global, 'WebSocket', {
    value: MockWebSocket,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

// Setup MSW handlers
// jsdom runs in Node, so use setupServer from msw/node
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

// Common API response handlers
// Note: MSW v2 requires full URL matching
const BASE_URL = 'http://localhost:9900';

const handlers = [
  // Health check
  http.get(`${BASE_URL}/health`, () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }),

  // Auth endpoints
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    if (body.username === 'testuser' && body.password === 'password123') {
      // Mock JWT token (header.payload.signature format)
      const mockToken = Buffer.from(
        JSON.stringify({ alg: 'HS256', typ: 'JWT' })
      ).toString('base64') +
      '.' +
      Buffer.from(
        JSON.stringify({
          sub: 'user-123',
          username: 'testuser',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        })
      ).toString('base64') +
      '.mock-signature';

      return HttpResponse.json({
        success: true,
        token: mockToken,
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

  http.post(`${BASE_URL}/auth/refresh`, () => {
    // Mock JWT token for refresh
    const mockToken = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    ).toString('base64') +
    '.' +
    Buffer.from(
      JSON.stringify({
        sub: 'user-123',
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })
    ).toString('base64') +
    '.mock-signature';

    return HttpResponse.json({
      success: true,
      token: mockToken,
      refreshToken: 'new-mock-refresh-token',
      user: {
        id: 'user-123',
        username: 'testuser',
      },
    });
  }),

  // Auth verify endpoint
  http.post(`${BASE_URL}/auth/verify`, () => {
    // Mock JWT token for verify
    const mockToken = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    ).toString('base64') +
    '.' +
    Buffer.from(
      JSON.stringify({
        sub: 'user-123',
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      })
    ).toString('base64') +
    '.mock-signature';

    return HttpResponse.json({
      success: true,
      token: mockToken,
      user: {
        id: 'user-123',
        username: 'testuser',
      },
    });
  }),

  // Settings endpoints
  http.get(`${BASE_URL}/settings`, () => {
    return HttpResponse.json({
      gitDisplayName: 'Test User',
      gitEmail: 'test@example.com',
      dockerImage: 'ainkai/flexy:latest',
    });
  }),

  http.put(`${BASE_URL}/settings`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Workflows endpoints
  http.get(`${BASE_URL}/workflows`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'published';

    return HttpResponse.json([
      {
        id: 'wf-1',
        name: 'Test Workflow 1',
        description: 'A test workflow',
        status,
        definition: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
  }),

  http.get(`${BASE_URL}/workflows/:id`, ({ params }) => {
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

  // Create workflow
  http.post(`${BASE_URL}/workflows`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'wf-new',
      ...body,
      status: 'draft',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  }),

  // Update workflow
  http.put(`${BASE_URL}/workflows/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'wf-1',
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Change workflow status
  http.patch(`${BASE_URL}/workflows/:id/status`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'wf-1',
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // Delete workflow
  http.delete(`${BASE_URL}/workflows/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Workflow deleted',
    });
  }),

  // Tasks endpoints
  http.post(`${BASE_URL}/tasks/execute`, async ({ request }) => {
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

  http.get(`${BASE_URL}/tasks/:taskId`, ({ params }) => {
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

  http.post(`${BASE_URL}/tasks/:taskId/cancel`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Task cancelled',
    });
  }),

  // Project task endpoints
  http.post(`${BASE_URL}/projects/:projectId/tasks`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'task-new',
      taskId: 'task-new',
      message: 'Task queued successfully',
      ...body,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });
  }),

  http.post(`${BASE_URL}/projects/:projectId/tasks/adhoc`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'adhoc-task-new',
      taskId: 'adhoc-task-new',
      message: 'Adhoc task created',
      ...body,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });
  }),

  http.get(`${BASE_URL}/projects/:projectId/tasks`, () => {
    return HttpResponse.json([
      {
        id: 'task-1',
        taskId: 'task-1',
        status: 'completed',
        projectId: 'proj-1',
        task: 'test-task',
        createdAt: '2024-01-01T00:00:00.000Z',
        completedAt: '2024-01-01T00:01:00.000Z',
      },
    ]);
  }),

  http.get(`${BASE_URL}/projects/:projectId/tasks/:taskId`, ({ params }) => {
    return HttpResponse.json({
      id: params.taskId,
      taskId: params.taskId,
      projectId: params.projectId,
      status: 'completed',
      message: 'Task completed',
      result: { success: true },
      createdAt: '2024-01-01T00:00:00.000Z',
      completedAt: '2024-01-01T00:01:00.000Z',
    });
  }),

  http.post(`${BASE_URL}/projects/:projectId/tasks/:taskId/cancel`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Task cancelled',
    });
  }),

  http.get(`${BASE_URL}/projects/:projectId/task-queue-status`, () => {
    return HttpResponse.json({
      queueLength: 0,
      processing: false,
    });
  }),

  // Containers endpoints
  http.get(`${BASE_URL}/containers`, () => {
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

  // Sandbox (flexy) endpoints
  http.get(`${BASE_URL}/flexy`, () => {
    return HttpResponse.json([
      {
        sandboxId: 'sandbox-1',
        name: 'test-sandbox',
        status: 'running',
        projectId: 'proj-1',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
  }),

  http.get(`${BASE_URL}/flexy/:id`, ({ params }) => {
    return HttpResponse.json({
      sandboxId: params.id,
      name: 'test-sandbox',
      status: 'running',
      projectId: 'proj-1',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  }),

  http.post(`${BASE_URL}/flexy`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'sandbox-new',
      ...body,
      status: 'created',
      createdAt: new Date().toISOString(),
    });
  }),

  http.post(`${BASE_URL}/flexy/:id/start`, () => {
    return HttpResponse.json({
      id: 'sandbox-1',
      status: 'running',
      message: 'Sandbox started',
    });
  }),

  http.post(`${BASE_URL}/flexy/:id/stop`, () => {
    return HttpResponse.json({
      id: 'sandbox-1',
      status: 'stopped',
      message: 'Sandbox stopped',
    });
  }),

  http.post(`${BASE_URL}/flexy/:id/restart`, () => {
    return HttpResponse.json({
      id: 'sandbox-1',
      status: 'running',
      message: 'Sandbox restarted',
    });
  }),

  http.delete(`${BASE_URL}/flexy/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Sandbox deleted',
    });
  }),
];

export const mockServer = setupServer(...handlers);

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
