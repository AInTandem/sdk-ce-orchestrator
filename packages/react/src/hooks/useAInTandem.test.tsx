/**
 * React Hooks Integration Tests
 *
 * Tests SDK React hooks with Testing Library
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AInTandemProvider, useAInTandem, useAuth, useWorkflows, useTasks, useSettings } from '../index';

describe('React Hooks', () => {
  // Wrapper component with provider
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <AInTandemProvider
        config={{
          baseURL: 'http://localhost:9900',
        }}
      >
        {children}
      </AInTandemProvider>
    );
  };

  describe('useAInTandem', () => {
    it('should provide SDK client', () => {
      const { result } = renderHook(() => useAInTandem(), { wrapper });

      expect(result.current.client).toBeDefined();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should provide login function', () => {
      const { result } = renderHook(() => useAInTandem(), { wrapper });

      expect(result.current.login).toBeDefined();
      expect(typeof result.current.login).toBe('function');
    });

    it('should provide logout function', () => {
      const { result } = renderHook(() => useAInTandem(), { wrapper });

      expect(result.current.logout).toBeDefined();
      expect(typeof result.current.logout).toBe('function');
    });

    it('should login successfully', async () => {
      const { result } = renderHook(() => useAInTandem(), { wrapper });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
      expect(result.current.user?.username).toBe('testuser');
    });

    it('should logout successfully', async () => {
      const { result } = renderHook(() => useAInTandem(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('useAuth', () => {
    it('should provide auth state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should provide login function', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.login).toBeDefined();
      expect(typeof result.current.login).toBe('function');
    });

    it('should login and update state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toBeDefined();
      });
    });
  });

  describe('useWorkflows', () => {
    it('should provide workflows data fetching functions', () => {
      const { result } = renderHook(() => useWorkflows(), { wrapper });

      expect(result.current.listWorkflows).toBeDefined();
      expect(result.current.getWorkflow).toBeDefined();
      expect(result.current.createWorkflow).toBeDefined();
      expect(result.current.updateWorkflow).toBeDefined();
      expect(result.current.deleteWorkflow).toBeDefined();
    });

    it('should fetch workflows list', async () => {
      const { result } = renderHook(() => useWorkflows(), { wrapper });

      let workflows: any;

      await act(async () => {
        workflows = await result.current.listWorkflows('published');
      });

      expect(workflows).toBeDefined();
      expect(Array.isArray(workflows)).toBe(true);
    });

    it('should get workflow by ID', async () => {
      const { result } = renderHook(() => useWorkflows(), { wrapper });

      let workflow: any;

      await act(async () => {
        workflow = await result.current.getWorkflow('wf-1');
      });

      expect(workflow).toBeDefined();
      expect(workflow.id).toBe('wf-1');
    });
  });

  describe('useTasks', () => {
    it('should provide tasks data fetching functions', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      expect(result.current.executeTask).toBeDefined();
      expect(result.current.getTask).toBeDefined();
      expect(result.current.cancelTask).toBeDefined();
      expect(result.current.getTaskHistory).toBeDefined();
    });

    it('should execute task', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      let task: any;

      await act(async () => {
        task = await result.current.executeTask({
          projectId: 'proj-1',
          task: 'test-task',
          input: {},
        });
      });

      expect(task).toBeDefined();
      expect(task.id).toBeTruthy();
    });

    it('should get task by ID', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      let task: any;

      await act(async () => {
        task = await result.current.getTask('proj-1', 'task-1');
      });

      expect(task).toBeDefined();
      expect(task.id).toBe('task-1');
    });
  });

  describe('useSettings', () => {
    it('should provide settings data fetching functions', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.getSettings).toBeDefined();
      expect(result.current.updateSettings).toBeDefined();
    });

    it('should fetch settings', async () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      let settings: any;

      await act(async () => {
        settings = await result.current.getSettings();
      });

      expect(settings).toBeDefined();
      expect(settings.gitDisplayName).toBe('Test User');
    });

    it('should update settings', async () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      let updated: any;

      await act(async () => {
        updated = await result.current.updateSettings({
          gitDisplayName: 'Updated User',
          gitEmail: 'updated@example.com',
        });
      });

      expect(updated).toBeDefined();
      expect(updated.gitDisplayName).toBe('Updated User');
    });
  });

  describe('Provider Callbacks', () => {
    it('should call onAuthSuccess callback', async () => {
      let authSuccessCalled = false;
      let authSuccessUser: any = null;

      const callbackWrapper = ({ children }: { children: React.ReactNode }) => {
        return (
          <AInTandemProvider
            config={{
              baseURL: 'http://localhost:9900',
            }}
            onAuthSuccess={(user) => {
              authSuccessCalled = true;
              authSuccessUser = user;
            }}
          >
            {children}
          </AInTandemProvider>
        );
      };

      const { result } = renderHook(() => useAInTandem(), {
        wrapper: callbackWrapper,
      });

      await act(async () => {
        await result.current.login({
          username: 'testuser',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(authSuccessCalled).toBe(true);
        expect(authSuccessUser).toBeDefined();
      });
    });

    it('should call onAuthError callback', async () => {
      let authErrorCalled = false;
      let authErrorMessage: any = null;

      const callbackWrapper = ({ children }: { children: React.ReactNode }) => {
        return (
          <AInTandemProvider
            config={{
              baseURL: 'http://localhost:9900',
            }}
            onAuthError={(error) => {
              authErrorCalled = true;
              authErrorMessage = error;
            }}
          >
            {children}
          </AInTandemProvider>
        );
      };

      const { result } = renderHook(() => useAInTandem(), {
        wrapper: callbackWrapper,
      });

      await act(async () => {
        try {
          await result.current.login({
            username: 'testuser',
            password: 'wrongpassword',
          });
        } catch (e) {
          // Expected to fail
        }
      });

      await waitFor(() => {
        expect(authErrorCalled).toBe(true);
        expect(authErrorMessage).toBeDefined();
      });
    });
  });
});
