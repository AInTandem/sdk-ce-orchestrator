/**
 * Workflows Direct Hook
 *
 * React hook for workflow management with direct client API (no state management).
 * This provides a simpler API for direct operations.
 */

import { useCallback } from 'react';
import { useAInTandem } from '../providers/AInTandemProvider';
import type {
  Workflow,
  UpdateWorkflowRequest,
  CreateWorkflowRequest,
} from '@aintandem/sdk-core';

/**
 * Use Workflows Direct Hook
 *
 * Provides workflow management functions without state management.
 *
 * @example
 * ```tsx
 * import { useWorkflows } from '@aintandem/sdk-react';
 *
 * function WorkflowManager() {
 *   const { listWorkflows, getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow } = useWorkflows();
 *
 *   const handleFetch = async () => {
 *     const workflows = await listWorkflows('published');
 *   };
 *
 *   return <button onClick={handleFetch}>Fetch Workflows</button>;
 * }
 * ```
 */
export function useWorkflowsDirect() {
  const { client } = useAInTandem();

  const listWorkflows = useCallback(
    async (status?: string): Promise<Workflow[]> => {
      return client.workflows.listWorkflows(status as any);
    },
    [client]
  );

  const getWorkflow = useCallback(
    async (id: string): Promise<Workflow> => {
      return client.workflows.getWorkflow(id);
    },
    [client]
  );

  const createWorkflow = useCallback(
    async (request: CreateWorkflowRequest): Promise<Workflow> => {
      return client.workflows.createWorkflow(request);
    },
    [client]
  );

  const updateWorkflow = useCallback(
    async (id: string, request: UpdateWorkflowRequest): Promise<Workflow> => {
      return client.workflows.updateWorkflow(id, request);
    },
    [client]
  );

  const deleteWorkflow = useCallback(
    async (id: string): Promise<{ success: boolean; message: string }> => {
      await client.workflows.deleteWorkflow(id);
      return {
        success: true,
        message: 'Workflow deleted',
      };
    },
    [client]
  );

  return {
    listWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  };
}
