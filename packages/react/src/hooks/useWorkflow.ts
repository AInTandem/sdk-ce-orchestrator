/**
 * Workflow Hooks
 *
 * React hooks for workflow management.
 */

import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAInTandem } from '../providers/AInTandemProvider.js';
import type {
  Workflow,
  UpdateWorkflowRequest,
  WorkflowStatus,
  CreateWorkflowRequest,
  CloneWorkflowRequest,
} from '@aintandem/sdk-core';
import type { WorkflowExecutionResponse, CreateWorkflowExecutionRequest } from '@aintandem/sdk-core';

/**
 * Use Workflow Hook
 *
 * Fetches and manages a single workflow.
 *
 * @param id - Workflow ID
 *
 * @example
 * ```tsx
 * import { useWorkflow } from '@aintandem/sdk-react';
 *
 * function WorkflowDetail({ workflowId }) {
 *   const { workflow, loading, error, update, changeStatus } = useWorkflow(workflowId);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!workflow) return <div>Workflow not found</div>;
 *
 *   return (
 *     <div>
 *       <h1>{workflow.name}</h1>
 *       <p>Status: {workflow.status}</p>
 *       <button onClick={() => changeStatus('published')}>Publish</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWorkflow(id: string) {
  const { client } = useAInTandem();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    client.workflows
      .getWorkflow(id)
      .then((data) => {
        if (!cancelled) {
          setWorkflow(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, id]);

  const update = useCallback(
    async (request: UpdateWorkflowRequest) => {
      const updated = await client.workflows.updateWorkflow(id, request);
      setWorkflow(updated);
      return updated;
    },
    [client, id]
  );

  const changeStatus = useCallback(
    async (status: WorkflowStatus) => {
      const updated = await client.workflows.changeWorkflowStatus(id, status);
      setWorkflow(updated);
      return updated;
    },
    [client, id]
  );

  const clone = useCallback(
    async (request: CloneWorkflowRequest) => {
      return await client.workflows.cloneWorkflow(id, request);
    },
    [client, id]
  );

  return {
    workflow,
    loading,
    error,
    update,
    changeStatus,
    clone,
  };
}

/**
 * Use Workflows Hook
 *
 * Fetches and manages workflow list.
 *
 * @param status - Optional status filter
 *
 * @example
 * ```tsx
 * import { useWorkflows } from '@aintandem/sdk-react';
 *
 * function WorkflowList() {
 *   const { workflows, loading, error, refresh } = useWorkflows('published');
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {workflows.map((workflow) => (
 *         <li key={workflow.id}>{workflow.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useWorkflows(status?: WorkflowStatus) {
  const { client } = useAInTandem();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await client.workflows.listWorkflows(status);
      setWorkflows(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [client, status]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (request: CreateWorkflowRequest) => {
      const created = await client.workflows.createWorkflow(request);
      await fetch(); // Refresh list
      return created;
    },
    [client, fetch]
  );

  const remove = useCallback(
    async (id: string) => {
      await client.workflows.deleteWorkflow(id);
      await fetch(); // Refresh list
    },
    [client, fetch]
  );

  return {
    workflows,
    loading,
    error,
    refresh: fetch,
    create,
    remove,
  };
}

/**
 * Use Workflow Versions Hook
 *
 * Fetches workflow version history.
 *
 * @param workflowId - Workflow ID
 *
 * @example
 * ```tsx
 * import { useWorkflowVersions } from '@aintandem/sdk-react';
 *
 * function VersionHistory({ workflowId }) {
 *   const { versions, loading } = useWorkflowVersions(workflowId);
 *
 *   return (
 *     <ul>
 *       {versions.map((version) => (
 *         <li key={version.id}>Version {version.version}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useWorkflowVersions(workflowId: string) {
  const { client } = useAInTandem();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    client.workflows
      .listVersions(workflowId)
      .then(setVersions)
      .catch((err) => {
        setError(err as Error);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [client, workflowId]);

  return {
    versions,
    loading,
    error,
  };
}

/**
 * Use Workflow Execution Hook
 *
 * Manages a single workflow execution.
 *
 * @param executionId - Execution ID
 *
 * @example
 * ```tsx
 * import { useWorkflowExecution } from '@aintandem/sdk-react';
 *
 * function ExecutionMonitor({ executionId }) {
 *   const { execution, loading, start, pause, resume, cancel } = useWorkflowExecution(executionId);
 *
 *   return (
 *     <div>
 *       <p>Status: {execution?.status}</p>
 *       <button onClick={start}>Start</button>
 *       <button onClick={pause}>Pause</button>
 *       <button onClick={resume}>Resume</button>
 *       <button onClick={cancel}>Cancel</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWorkflowExecution(executionId: string) {
  const { client } = useAInTandem();
  const [execution, setExecution] = useState<WorkflowExecutionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    client.workflows
      .getExecution(executionId)
      .then(setExecution)
      .catch((err) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, executionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const start = useCallback(async () => {
    const updated = await client.workflows.startExecution(executionId);
    setExecution(updated);
    return updated;
  }, [client, executionId]);

  const pause = useCallback(async () => {
    const updated = await client.workflows.pauseExecution(executionId);
    setExecution(updated);
    return updated;
  }, [client, executionId]);

  const resume = useCallback(async () => {
    const updated = await client.workflows.resumeExecution(executionId);
    setExecution(updated);
    return updated;
  }, [client, executionId]);

  const cancel = useCallback(async () => {
    const updated = await client.workflows.cancelExecution(executionId);
    setExecution(updated);
    return updated;
  }, [client, executionId]);

  return {
    execution,
    loading,
    error,
    refresh,
    start,
    pause,
    resume,
    cancel,
  };
}

/**
 * Use Workflow Executions Hook
 *
 * Fetches executions for a workflow.
 *
 * @param workflowId - Workflow ID
 *
 * @example
 * ```tsx
 * import { useWorkflowExecutions } from '@aintandem/sdk-react';
 *
 * function ExecutionList({ workflowId }) {
 *   const { executions, loading, create } = useWorkflowExecutions(workflowId);
 *
 *   const handleCreate = () => {
 *     create({ input: { data: 'value' } });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreate}>Create Execution</button>
 *       {executions.map((exec) => (
 *         <div key={exec.id}>{exec.status}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWorkflowExecutions(workflowId: string) {
  const { client } = useAInTandem();
  const [executions, setExecutions] = useState<WorkflowExecutionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.workflows.listExecutions(workflowId);
      setExecutions(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [client, workflowId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (request?: CreateWorkflowExecutionRequest) => {
      const execution = await client.workflows.createExecution(workflowId, request);
      await fetch();
      return execution;
    },
    [client, workflowId, fetch]
  );

  return {
    executions,
    loading,
    error,
    refresh: fetch,
    create,
  };
}
