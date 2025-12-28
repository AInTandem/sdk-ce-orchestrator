/**
 * MSW (Mock Service Worker) API handlers
 */

import { http, HttpResponse } from 'msw';

export const handlers = [
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      uptime: 123.45,
    });
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.username === 'test' && body.password === 'password') {
      return HttpResponse.json({
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '1',
          username: 'test',
        },
      });
    }
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      token: 'new-mock-token',
      refreshToken: 'new-mock-refresh-token',
    });
  }),

  // Workflow endpoints
  http.get('/api/workflows', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Workflow 1',
        description: 'Test workflow 1',
        status: 'published',
        currentVersion: 1,
        definition: {
          phases: [],
          transitions: [],
        },
        isTemplate: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        name: 'Workflow 2',
        description: 'Test workflow 2',
        status: 'draft',
        currentVersion: 1,
        definition: {
          phases: [],
          transitions: [],
        },
        isTemplate: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
  }),

  http.get('/api/workflows/:id', ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json({
        id: '1',
        name: 'Workflow 1',
        description: 'Test workflow 1',
        status: 'published',
        currentVersion: 1,
        definition: {
          phases: [],
          transitions: [],
        },
        isTemplate: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    }
    return HttpResponse.json({ message: 'Workflow not found' }, { status: 404 });
  }),

  http.post('/api/workflows', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '3',
      ...body,
      status: 'draft',
      currentVersion: 1,
      isTemplate: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  }),

  // Task endpoints
  http.post('/api/projects/:projectId/tasks', () => {
    return HttpResponse.json({
      taskId: 'task-1',
      message: 'Task queued successfully',
    });
  }),

  http.post('/api/projects/:projectId/tasks/adhoc', () => {
    return HttpResponse.json({
      taskId: 'task-adhoc-1',
      message: 'Ad-hoc task queued successfully',
    });
  }),

  // Container endpoints
  http.get('/api/flexy', () => {
    return HttpResponse.json([
      {
        id: 'container-1',
        name: 'test-container',
        status: 'running',
        folderMapping: '/host/path:/container/path',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ]);
  }),
];
