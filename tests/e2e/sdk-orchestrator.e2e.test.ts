/**
 * End-to-End Integration Tests
 *
 * Tests SDK against real Orchestrator API server
 * These tests require the Orchestrator server to be running
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AInTandemClient } from '@aintandem/sdk-core';

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:9900';
const TEST_USER = {
  username: process.env.TEST_USER || 'admin',
  password: process.env.TEST_PASSWORD || 'admin123',
};

describe('SDK + Orchestrator E2E Tests', () => {
  let client: AInTandemClient;
  let authToken: string;

  beforeAll(async () => {
    client = new AInTandemClient({
      baseURL: ORCHESTRATOR_URL,
      timeout: 30000,
    });

    // Login before running tests
    try {
      const response = await client.auth.login({
        username: TEST_USER.username,
        password: TEST_USER.password,
      });

      if (response.success) {
        authToken = response.token;
        console.log('[E2E] Authentication successful');
      }
    } catch (error) {
      console.error('[E2E] Authentication failed:', error);
      throw new Error('Cannot run E2E tests without authentication');
    }
  });

  afterAll(async () => {
    // Cleanup
    await client.auth.logout();
  });

  describe('Authentication Flow', () => {
    it('should authenticate with real API', async () => {
      const testClient = new AInTandemClient({
        baseURL: ORCHESTRATOR_URL,
      });

      const response = await testClient.auth.login({
        username: TEST_USER.username,
        password: TEST_USER.password,
      });

      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
    });

    it('should verify token validity', async () => {
      const isValid = client.auth.isAuthenticated();
      expect(isValid).toBe(true);
    });

    it('should refresh token', async () => {
      const response = await client.auth.refreshToken();

      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
    });

    it('should logout successfully', async () => {
      const testClient = new AInTandemClient({
        baseURL: ORCHESTRATOR_URL,
      });

      await testClient.auth.login({
        username: TEST_USER.username,
        password: TEST_USER.password,
      });

      await testClient.auth.logout();

      const isAuthenticated = testClient.auth.isAuthenticated();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Settings API', () => {
    it('should fetch user settings', async () => {
      const settings = await client.settings.getSettings();

      expect(settings).toBeDefined();
      expect(typeof settings.gitDisplayName).toBe('string' || 'undefined');
      expect(typeof settings.gitEmail).toBe('string' || 'undefined');
    });

    it('should update user settings', async () => {
      const newSettings = {
        gitDisplayName: 'E2E Test User',
        gitEmail: 'e2e@example.com',
        dockerImage: 'ainkai/flexy:latest',
      };

      const updated = await client.settings.updateSettings(newSettings);

      expect(updated).toBeDefined();
      expect(updated.gitDisplayName).toBe('E2E Test User');
      expect(updated.gitEmail).toBe('e2e@example.com');
    });
  });

  describe('Workflows API', () => {
    let testWorkflowId: string;

    it('should list workflows', async () => {
      const workflows = await client.workflows.listWorkflows('published');

      expect(Array.isArray(workflows)).toBe(true);
    });

    it('should create workflow', async () => {
      const workflow = await client.workflows.createWorkflow({
        name: 'E2E Test Workflow',
        description: 'Created by E2E tests',
        definition: {
          phases: [],
        },
        status: 'draft',
      });

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      testWorkflowId = workflow.id;
    });

    it('should get workflow by ID', async () => {
      if (!testWorkflowId) {
        console.warn('[E2E] Skipping test: no test workflow created');
        return;
      }

      const workflow = await client.workflows.getWorkflow(testWorkflowId);

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe(testWorkflowId);
      expect(workflow.name).toBe('E2E Test Workflow');
    });

    it('should update workflow', async () => {
      if (!testWorkflowId) {
        console.warn('[E2E] Skipping test: no test workflow created');
        return;
      }

      const updated = await client.workflows.updateWorkflow(testWorkflowId, {
        name: 'Updated E2E Workflow',
        description: 'Updated by E2E tests',
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe('Updated E2E Workflow');
    });

    it('should change workflow status', async () => {
      if (!testWorkflowId) {
        console.warn('[E2E] Skipping test: no test workflow created');
        return;
      }

      const updated = await client.workflows.changeWorkflowStatus(
        testWorkflowId,
        'published'
      );

      expect(updated).toBeDefined();
      expect(updated.status).toBe('published');
    });

    it('should delete workflow', async () => {
      if (!testWorkflowId) {
        console.warn('[E2E] Skipping test: no test workflow created');
        return;
      }

      await client.workflows.deleteWorkflow(testWorkflowId);

      // Verify it's deleted
      await expect(
        client.workflows.getWorkflow(testWorkflowId)
      ).rejects.toThrow();
    });
  });

  describe('Tasks API', () => {
    let testTaskId: string;

    it('should execute adhoc task', async () => {
      const result = await client.tasks.executeAdhocTask(
        'default',
        'echo',
        { message: 'Hello E2E' }
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      testTaskId = result.id;
    });

    it('should get task by ID', async () => {
      if (!testTaskId) {
        console.warn('[E2E] Skipping test: no test task created');
        return;
      }

      const task = await client.tasks.getTask('default', testTaskId);

      expect(task).toBeDefined();
      expect(task.id).toBe(testTaskId);
    });

    it('should get task history', async () => {
      const history = await client.tasks.getTaskHistory('default');

      expect(history).toBeDefined();
      expect(Array.isArray(history.tasks)).toBe(true);
    });

    it('should get queue status', async () => {
      const status = await client.tasks.getQueueStatus('default');

      expect(status).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      await expect(
        client.workflows.getWorkflow('non-existent-id')
      ).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      await expect(
        client.workflows.createWorkflow({
          name: '', // Invalid: empty name
          description: 'Test',
          definition: {},
          status: 'draft',
        })
      ).rejects.toThrow();
    });

    it('should handle authentication errors', async () => {
      const unauthorizedClient = new AInTandemClient({
        baseURL: ORCHESTRATOR_URL,
      });

      // Don't login, try to access protected endpoint
      await expect(
        unauthorizedClient.settings.getSettings()
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should complete requests within reasonable time', async () => {
      const start = Date.now();

      await client.settings.getSettings();

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle multiple concurrent requests', async () => {
      const start = Date.now();

      const promises = [
        client.settings.getSettings(),
        client.workflows.listWorkflows(),
        client.tasks.getTaskHistory('default'),
      ];

      await Promise.all(promises);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10000); // 10 seconds max for all
    });
  });

  describe('Data Integrity', () => {
    it('should preserve data types across API calls', async () => {
      const workflow = await client.workflows.createWorkflow({
        name: 'Type Test Workflow',
        description: 'Testing data types',
        definition: {
          phases: [
            {
              id: 'phase-1',
              name: 'Phase 1',
              steps: [],
            },
          ],
        },
        status: 'draft',
      });

      expect(typeof workflow.id).toBe('string');
      expect(typeof workflow.name).toBe('string');
      expect(typeof workflow.createdAt).toBe('string');
      expect(Array.isArray(workflow.definition.phases)).toBe(true);
    });

    it('should handle special characters in strings', async () => {
      const specialName = 'Test <>&"\' Workflow';
      const specialDesc = 'Description with émojis 🎉 and spëcial çharacters';

      const workflow = await client.workflows.createWorkflow({
        name: specialName,
        description: specialDesc,
        definition: {},
        status: 'draft',
      });

      expect(workflow.name).toBe(specialName);
      expect(workflow.description).toBe(specialDesc);
    });
  });
});
