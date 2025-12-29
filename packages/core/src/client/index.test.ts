/**
 * AInTandemClient Integration Tests
 *
 * Tests the SDK client with MSW mock server
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AInTandemClient } from './index';
import type { AInTandemClientConfig } from './index';

describe('AInTandemClient', () => {
  let client: AInTandemClient;

  beforeEach(() => {
    client = new AInTandemClient({
      baseURL: 'http://localhost:9900',
    });
  });

  afterEach(() => {
    // Cleanup client if needed
  });

  describe('Initialization', () => {
    it('should create client instance with default config', () => {
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.workflows).toBeDefined();
      expect(client.tasks).toBeDefined();
      expect(client.containers).toBeDefined();
      expect(client.settings).toBeDefined();
    });

    it('should create client instance with custom config', () => {
      const customClient = new AInTandemClient({
        baseURL: 'http://custom-api:8080',
        timeout: 10000,
      });

      expect(customClient).toBeDefined();
    });

    it('should share services across client instances by default', () => {
      const client1 = new AInTandemClient({
        baseURL: 'http://localhost:9900',
      });

      const client2 = new AInTandemClient({
        baseURL: 'http://localhost:9900',
      });

      // Services should be shared (singleton pattern)
      expect(client1.auth).toBe(client2.auth);
    });
  });

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await client.auth.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(response.success).toBe(true);
      expect(response.token).toBe('mock-jwt-token');
      expect(response.user).toBeDefined();
      expect(response.user.username).toBe('testuser');
    });

    it('should fail login with invalid credentials', async () => {
      await expect(
        client.auth.login({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow();
    });

    it('should store token after successful login', async () => {
      await client.auth.login({
        username: 'testuser',
        password: 'password123',
      });

      const token = client.auth.getToken();
      expect(token).toBe('mock-jwt-token');
    });

    it('should clear token after logout', async () => {
      await client.auth.login({
        username: 'testuser',
        password: 'password123',
      });

      await client.auth.logout();

      const token = client.auth.getToken();
      expect(token).toBeNull();
    });

    it('should refresh token successfully', async () => {
      await client.auth.login({
        username: 'testuser',
        password: 'password123',
      });

      const response = await client.auth.refreshToken();

      expect(response.success).toBe(true);
      expect(response.token).toBe('new-mock-jwt-token');
    });

    it('should verify authentication status', async () => {
      await client.auth.login({
        username: 'testuser',
        password: 'password123',
      });

      const isAuthenticated = client.auth.isAuthenticated();
      expect(isAuthenticated).toBe(true);
    });

    it('should not be authenticated before login', () => {
      const isAuthenticated = client.auth.isAuthenticated();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Settings Service', () => {
    it('should fetch settings successfully', async () => {
      const settings = await client.settings.getSettings();

      expect(settings).toBeDefined();
      expect(settings.gitDisplayName).toBe('Test User');
      expect(settings.gitEmail).toBe('test@example.com');
    });

    it('should update settings successfully', async () => {
      const newSettings = {
        gitDisplayName: 'Updated User',
        gitEmail: 'updated@example.com',
        dockerImage: 'ainkai/flexy:v2.0',
      };

      const updated = await client.settings.updateSettings(newSettings);

      expect(updated).toBeDefined();
      expect(updated.gitDisplayName).toBe('Updated User');
      expect(updated.gitEmail).toBe('updated@example.com');
    });
  });

  describe('Workflows Service', () => {
    it('should list workflows', async () => {
      const workflows = await client.workflows.listWorkflows('published');

      expect(workflows).toBeDefined();
      expect(Array.isArray(workflows)).toBe(true);
      expect(workflows.length).toBeGreaterThan(0);
      expect(workflows[0].id).toBe('wf-1');
    });

    it('should get workflow by ID', async () => {
      const workflow = await client.workflows.getWorkflow('wf-1');

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('wf-1');
      expect(workflow.name).toBe('Test Workflow 1');
    });

    it('should handle workflow not found', async () => {
      await expect(
        client.workflows.getWorkflow('non-existent')
      ).rejects.toThrow();
    });

    it('should create workflow', async () => {
      const workflow = await client.workflows.createWorkflow({
        name: 'New Workflow',
        description: 'A new test workflow',
        definition: {},
        status: 'draft',
      });

      expect(workflow).toBeDefined();
      expect(workflow.name).toBe('New Workflow');
      expect(workflow.status).toBe('draft');
    });

    it('should update workflow', async () => {
      const updated = await client.workflows.updateWorkflow('wf-1', {
        name: 'Updated Workflow',
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe('Updated Workflow');
    });

    it('should delete workflow', async () => {
      await expect(
        client.workflows.deleteWorkflow('wf-1')
      ).resolves.not.toThrow();
    });

    it('should change workflow status', async () => {
      const updated = await client.workflows.changeWorkflowStatus('wf-1', 'published');

      expect(updated).toBeDefined();
      expect(updated.status).toBe('published');
    });
  });

  describe('Tasks Service', () => {
    it('should execute task', async () => {
      const result = await client.tasks.executeTask({
        projectId: 'proj-1',
        task: 'test-task',
        input: {
          parameters: {},
        },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('task-1');
      expect(result.status).toBe('running');
    });

    it('should get task by ID', async () => {
      const task = await client.tasks.getTask('proj-1', 'task-1');

      expect(task).toBeDefined();
      expect(task.id).toBe('task-1');
      expect(task.status).toBe('completed');
    });

    it('should cancel task', async () => {
      await expect(
        client.tasks.cancelTask('proj-1', 'task-1')
      ).resolves.not.toThrow();
    });

    it('should get task history', async () => {
      const history = await client.tasks.getTaskHistory('proj-1');

      expect(history).toBeDefined();
      expect(Array.isArray(history.tasks)).toBe(true);
    });

    it('should get queue status', async () => {
      const status = await client.tasks.getQueueStatus('proj-1');

      expect(status).toBeDefined();
    });

    it('should execute adhoc task', async () => {
      const result = await client.tasks.executeAdhocTask(
        'proj-1',
        'adhoc-task',
        {}
      );

      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
    });
  });

  describe('Containers Service', () => {
    it('should list containers', async () => {
      const containers = await client.containers.listContainers('proj-1');

      expect(containers).toBeDefined();
      expect(Array.isArray(containers)).toBe(true);
      expect(containers.length).toBeGreaterThan(0);
    });

    it('should get container by ID', async () => {
      const container = await client.containers.getContainer('proj-1', 'cont-1');

      expect(container).toBeDefined();
      expect(container.id).toBe('cont-1');
    });

    it('should create container', async () => {
      const container = await client.containers.createContainer('proj-1', {
        name: 'new-container',
        image: 'ainkai/flexy:latest',
        ports: [],
      });

      expect(container).toBeDefined();
      expect(container.name).toBe('new-container');
    });

    it('should start container', async () => {
      await expect(
        client.containers.startContainer('proj-1', 'cont-1')
      ).resolves.not.toThrow();
    });

    it('should stop container', async () => {
      await expect(
        client.containers.stopContainer('proj-1', 'cont-1')
      ).resolves.not.toThrow();
    });

    it('should remove container', async () => {
      await expect(
        client.containers.removeContainer('proj-1', 'cont-1')
      ).resolves.not.toThrow();
    });

    it('should get container logs', async () => {
      const logs = await client.containers.getContainerLogs('proj-1', 'cont-1');

      expect(logs).toBeDefined();
      expect(logs.logs).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const badClient = new AInTandemClient({
        baseURL: 'http://invalid-host:9999',
        timeout: 1000,
      });

      await expect(
        badClient.settings.getSettings()
      ).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const slowClient = new AInTandemClient({
        baseURL: 'http://localhost:9900',
        timeout: 1, // 1ms timeout
      });

      // This should timeout
      await expect(
        slowClient.settings.getSettings()
      ).rejects.toThrow();
    });

    it('should provide error details', async () => {
      try {
        await client.workflows.getWorkflow('non-existent');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Service Integration', () => {
    it('should maintain authentication across services', async () => {
      // Login first
      await client.auth.login({
        username: 'testuser',
        password: 'password123',
      });

      // Authenticated requests should work
      const workflows = await client.workflows.listWorkflows();
      expect(workflows).toBeDefined();

      const settings = await client.settings.getSettings();
      expect(settings).toBeDefined();
    });

    it('should use token in requests', async () => {
      await client.auth.login({
        username: 'testuser',
        password: 'password123',
      });

      // Token should be included in subsequent requests
      const token = client.auth.getToken();
      expect(token).toBe('mock-jwt-token');
    });
  });
});
