/**
 * Hooks Module
 *
 * Exports all React hooks.
 */

export {
  useAuth,
  useUser,
  useLogin,
} from './useAuth';

export {
  useWorkflow,
  useWorkflowVersions,
  useWorkflowExecution,
  useWorkflowExecutions,
} from './useWorkflow';

// Stateful hook for workflow list - use when you need reactive state
export { useWorkflows as useWorkflowList } from './useWorkflow';

// Direct API hook - use when you want manual control
export { useWorkflowsDirect as useWorkflows } from './useWorkflowsDirect';

export {
  useTask,
  useExecuteTask,
  useExecuteAdhocTask,
  useTaskHistory,
  useQueueStatus,
} from './useTask';

export { useTasks } from './useTasks';

export {
  useTaskProgress,
  useWorkflowProgress,
  useContainerProgress,
  useProgress,
} from './useProgress';

export { useSettings } from './useSettings';
