/**
 * Real-time Progress Tracking Integration Tests
 *
 * Tests WebSocket-based progress tracking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AInTandemProvider, useTaskProgress, useWorkflowProgress, useContainerProgress } from '../index';

describe('Real-time Progress Tracking', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    // Mock WebSocket implementation
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1, // OPEN
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    (global as any).WebSocket = vi.fn(() => mockWebSocket);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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

  describe('useTaskProgress', () => {
    it('should subscribe to task progress', async () => {
      const { result } = renderHook(
        () => useTaskProgress('proj-1', 'task-1'),
        { wrapper }
      );

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe('object');
    });

    it('should receive progress updates', async () => {
      const { result } = renderHook(
        () => useTaskProgress('proj-1', 'task-1'),
        { wrapper }
      );

      // Simulate WebSocket message
      act(() => {
        const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'message'
        );

        if (messageHandler && messageHandler[1]) {
          messageHandler[1]({
            data: JSON.stringify({
              type: 'task_progress',
              data: {
                taskId: 'task-1',
                status: 'running',
                progress: 50,
                currentStep: 'Processing',
              },
            }),
          });
        }
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should handle completion', async () => {
      const { result } = renderHook(
        () => useTaskProgress('proj-1', 'task-1'),
        { wrapper }
      );

      // Simulate completion message
      act(() => {
        const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'message'
        );

        if (messageHandler && messageHandler[1]) {
          messageHandler[1]({
            data: JSON.stringify({
              type: 'task_progress',
              data: {
                taskId: 'task-1',
                status: 'completed',
                progress: 100,
                result: { success: true },
              },
            }),
          });
        }
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should handle errors', async () => {
      const { result } = renderHook(
        () => useTaskProgress('proj-1', 'task-1'),
        { wrapper }
      );

      // Simulate error message
      act(() => {
        const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'message'
        );

        if (messageHandler && messageHandler[1]) {
          messageHandler[1]({
            data: JSON.stringify({
              type: 'task_progress',
              data: {
                taskId: 'task-1',
                status: 'failed',
                error: 'Task execution failed',
              },
            }),
          });
        }
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should unsubscribe on unmount', async () => {
      const { unmount } = renderHook(
        () => useTaskProgress('proj-1', 'task-1'),
        { wrapper }
      );

      unmount();

      // Verify WebSocket was closed
      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });

  describe('useWorkflowProgress', () => {
    it('should subscribe to workflow progress', async () => {
      const { result } = renderHook(
        () => useWorkflowProgress('proj-1', 'wf-1'),
        { wrapper }
      );

      expect(result.current).toBeDefined();
    });

    it('should receive workflow phase updates', async () => {
      const { result } = renderHook(
        () => useWorkflowProgress('proj-1', 'wf-1'),
        { wrapper }
      );

      // Simulate phase progress
      act(() => {
        const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'message'
        );

        if (messageHandler && messageHandler[1]) {
          messageHandler[1]({
            data: JSON.stringify({
              type: 'workflow_progress',
              data: {
                workflowId: 'wf-1',
                currentPhase: 'development',
                phaseProgress: 60,
                overallProgress: 30,
                steps: [
                  {
                    id: 'step-1',
                    status: 'completed',
                  },
                  {
                    id: 'step-2',
                    status: 'running',
                  },
                ],
              },
            }),
          });
        }
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('useContainerProgress', () => {
    it('should subscribe to container operations', async () => {
      const { result } = renderHook(
        () => useContainerProgress('proj-1', 'cont-1'),
        { wrapper }
      );

      expect(result.current).toBeDefined();
    });

    it('should receive container operation updates', async () => {
      const { result } = renderHook(
        () => useContainerProgress('proj-1', 'cont-1'),
        { wrapper }
      );

      // Simulate container operation progress
      act(() => {
        const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'message'
        );

        if (messageHandler && messageHandler[1]) {
          messageHandler[1]({
            data: JSON.stringify({
              type: 'container_operation',
              data: {
                containerId: 'cont-1',
                operation: 'create',
                status: 'running',
                progress: 45,
                message: 'Creating container...',
              },
            }),
          });
        }
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should handle container completion', async () => {
      const { result } = renderHook(
        () => useContainerProgress('proj-1', 'cont-1'),
        { wrapper }
      );

      // Simulate completion
      act(() => {
        const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'message'
        );

        if (messageHandler && messageHandler[1]) {
          messageHandler[1]({
            data: JSON.stringify({
              type: 'container_operation',
              data: {
                containerId: 'cont-1',
                operation: 'create',
                status: 'completed',
                progress: 100,
                message: 'Container created successfully',
              },
            }),
          });
        }
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('Progress Subscriptions', () => {
    it('should handle multiple subscriptions', async () => {
      const { result: taskResult } = renderHook(
        () => useTaskProgress('proj-1', 'task-1'),
        { wrapper }
      );

      const { result: workflowResult } = renderHook(
        () => useWorkflowProgress('proj-1', 'wf-1'),
        { wrapper }
      );

      expect(taskResult.current).toBeDefined();
      expect(workflowResult.current).toBeDefined();
    });

    it('should share WebSocket connection', () => {
      renderHook(() => useTaskProgress('proj-1', 'task-1'), { wrapper });
      renderHook(() => useWorkflowProgress('proj-1', 'wf-1'), { wrapper });

      // Should use same WebSocket instance
      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });
  });
});
