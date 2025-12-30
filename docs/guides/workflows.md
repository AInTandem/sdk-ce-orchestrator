# Workflow Management Guide

This guide explains how to use the AInTandem SDK to manage workflows (Workflows), including creating, querying, updating, deleting, and executing workflows.

## Overview

Workflows are the core functionality of AInTandem, used to define and execute complex automated task sequences. Each workflow contains multiple phases (Phases), and each phase contains multiple steps (Steps).

## Core SDK Usage

### 1. Get Workflow List

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// Get all published workflows
const publishedWorkflows = await client.workflows.listWorkflows('published');
console.log('Published workflows:', publishedWorkflows);

// Get all draft workflows
const draftWorkflows = await client.workflows.listWorkflows('draft');
console.log('Draft workflows:', draftWorkflows);

// Get all workflows
const allWorkflows = await client.workflows.listWorkflows();
console.log('All workflows:', allWorkflows);
```

### 2. Get Single Workflow

```typescript
// Get workflow details by ID
const workflow = await client.workflows.getWorkflow('workflow-id');

console.log('Workflow ID:', workflow.id);
console.log('Workflow name:', workflow.name);
console.log('Workflow description:', workflow.description);
console.log('Workflow status:', workflow.status);
console.log('Workflow definition:', workflow.definition);
```

### 3. Create Workflow

```typescript
// Create new workflow
const newWorkflow = await client.workflows.createWorkflow({
  name: 'Data Processing Pipeline',
  description: 'Process sales data and generate reports',
  status: 'draft', // 'draft' or 'published'
  definition: {
    phases: [
      {
        id: 'data-extraction',
        name: 'Data Extraction',
        steps: [
          {
            id: 'extract-sales',
            name: 'Extract Sales Data',
            task: 'data-extract',
            input: {
              source: 'database',
              table: 'sales',
            },
          },
        ],
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis',
        steps: [
          {
            id: 'analyze-trends',
            name: 'Analyze Trends',
            task: 'data-analysis',
            input: {
              type: 'trend',
            },
          },
        ],
      },
    ],
  },
});

console.log('Workflow created:', newWorkflow.id);
```

### 4. Update Workflow

```typescript
// Update workflow basic information
const updated = await client.workflows.updateWorkflow('workflow-id', {
  name: 'Updated Workflow Name',
  description: 'Updated description',
});

console.log('Updated:', updated.id);
```

### 5. Change Workflow Status

```typescript
// Publish workflow
const published = await client.workflows.changeWorkflowStatus('workflow-id', 'published');
console.log('Workflow published:', published.status);

// Unpublish (change to draft)
const draft = await client.workflows.changeWorkflowStatus('workflow-id', 'draft');
console.log('Workflow changed to draft:', draft.status);
```

### 6. Clone Workflow

```typescript
// Clone existing workflow
const cloned = await client.workflows.cloneWorkflow('workflow-id', {
  name: 'Copy of Data Processing Pipeline',
  description: 'Cloned workflow',
});

console.log('Workflow cloned:', cloned.id);
console.log('New workflow name:', cloned.name);
```

### 7. Delete Workflow

```typescript
// Delete workflow
await client.workflows.deleteWorkflow('workflow-id');
console.log('Workflow deleted');
```

## Workflow Execution

### 1. Create Workflow Execution

```typescript
// Create workflow execution instance
const execution = await client.workflows.createWorkflowExecution('workflow-id', {
  projectId: 'project-123',
  input: {
    dataset: 'sales-2024',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
});

console.log('Execution ID:', execution.id);
console.log('Execution status:', execution.status);
```

### 2. Get Workflow Execution Details

```typescript
// Get execution details
const execution = await client.workflows.getWorkflowExecution('execution-id');

console.log('Execution status:', execution.status);
console.log('Current phase:', execution.currentPhase);
console.log('Completed steps:', execution.completedSteps);
console.log('Total steps:', execution.totalSteps);
```

### 3. Get Workflow's Execution List

```typescript
// Get all execution records for specific workflow
const executions = await client.workflows.listWorkflowExecutions('workflow-id');

console.log('Execution history:', executions);

// Execution statistics
const stats = {
  total: executions.length,
  running: executions.filter(e => e.status === 'running').length,
  completed: executions.filter(e => e.status === 'completed').length,
  failed: executions.filter(e => e.status === 'failed').length,
};

console.log('Execution statistics:', stats);
```

### 4. Control Workflow Execution

```typescript
const executionId = 'execution-id';

// Start execution
const started = await client.workflows.startWorkflowExecution(executionId);
console.log('Started:', started.status);

// Pause execution
const paused = await client.workflows.pauseWorkflowExecution(executionId);
console.log('Paused:', paused.status);

// Resume execution
const resumed = await client.workflows.resumeWorkflowExecution(executionId);
console.log('Resumed:', resumed.status);

// Cancel execution
const cancelled = await client.workflows.cancelWorkflowExecution(executionId);
console.log('Cancelled:', cancelled.status);
```

## Workflow Version Management

### 1. Get Workflow Version List

```typescript
// Get all versions of workflow
const versions = await client.workflows.listWorkflowVersions('workflow-id');

console.log('Version list:', versions);

// Display version information
versions.forEach(version => {
  console.log(`Version ${version.version}: ${version.comment}`);
  console.log(`  Created at: ${version.createdAt}`);
  console.log(`  Created by: ${version.createdBy}`);
});
```

### 2. Get Specific Version Details

```typescript
// Get specific version details
const version = await client.workflows.getWorkflowVersion('workflow-id', 2);

console.log('Version 2 definition:', version.definition);
```

## React Hooks Usage

### 1. Using useWorkflow Hook (Single Workflow)

```tsx
import { useWorkflow } from '@aintandem/sdk-react';

function WorkflowDetail({ workflowId }: { workflowId: string }) {
  const { workflow, loading, error, update, changeStatus, clone } = useWorkflow(workflowId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!workflow) return <div>Workflow not found</div>;

  const handlePublish = async () => {
    try {
      await changeStatus('published');
      alert('Workflow published');
    } catch (err) {
      alert('Publish failed');
    }
  };

  const handleClone = async () => {
    try {
      const cloned = await clone({
        name: `${workflow.name} (Copy)`,
      });
      alert(`Cloned: ${cloned.id}`);
    } catch (err) {
      alert('Clone failed');
    }
  };

  return (
    <div>
      <h1>{workflow.name}</h1>
      <p>{workflow.description}</p>
      <p>Status: {workflow.status}</p>

      <button onClick={handlePublish}>Publish</button>
      <button onClick={handleClone}>Clone</button>

      <div>
        <h2>Phases</h2>
        {workflow.definition.phases.map(phase => (
          <div key={phase.id}>
            <h3>{phase.name}</h3>
            <ul>
              {phase.steps.map(step => (
                <li key={step.id}>{step.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Using useWorkflows Hook (Workflow List)

```tsx
import { useWorkflows } from '@aintandem/sdk-react';

function WorkflowList() {
  const { workflows, loading, error, refresh, create, remove } = useWorkflows('published');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreate = async () => {
    try {
      await create({
        name: 'New Workflow',
        description: 'Description',
        status: 'draft',
        definition: { phases: [] },
      });
      refresh(); // Refresh list
    } catch (err) {
      alert('Create failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await remove(id);
        refresh(); // Refresh list
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Published Workflows</h1>
        <button onClick={handleCreate}>Create Workflow</button>
      </div>

      <ul>
        {workflows.map(workflow => (
          <li key={workflow.id}>
            <h3>{workflow.name}</h3>
            <p>{workflow.description}</p>
            <p>Status: {workflow.status}</p>
            <button onClick={() => handleDelete(workflow.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. Using useWorkflowVersions Hook

```tsx
import { useWorkflowVersions } from '@aintandem/sdk-react';

function WorkflowVersionHistory({ workflowId }: { workflowId: string }) {
  const { versions, loading, error } = useWorkflowVersions(workflowId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Version History</h2>
      <table>
        <thead>
          <tr>
            <th>Version</th>
            <th>Comment</th>
            <th>Created By</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {versions.map(version => (
            <tr key={version.version}>
              <td>{version.version}</td>
              <td>{version.comment}</td>
              <td>{version.createdBy}</td>
              <td>{new Date(version.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 4. Using useWorkflowExecution Hook (Single Execution)

```tsx
import { useWorkflowExecution } from '@aintandem/sdk-react';

function WorkflowExecutionMonitor({ executionId }: { executionId: string }) {
  const { execution, loading, error, refresh, start, pause, resume, cancel } = useWorkflowExecution(executionId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!execution) return <div>Execution not found</div>;

  const handleStart = async () => {
    try {
      await start();
      refresh();
    } catch (err) {
      alert('Start failed');
    }
  };

  const handlePause = async () => {
    try {
      await pause();
      refresh();
    } catch (err) {
      alert('Pause failed');
    }
  };

  const handleResume = async () => {
    try {
      await resume();
      refresh();
    } catch (err) {
      alert('Resume failed');
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this execution?')) {
      try {
        await cancel();
        refresh();
      } catch (err) {
        alert('Cancel failed');
      }
    }
  };

  const progress = execution.totalSteps > 0
    ? (execution.completedSteps / execution.totalSteps) * 100
    : 0;

  return (
    <div>
      <h2>Execution Details</h2>
      <p>Status: {execution.status}</p>
      <p>Current phase: {execution.currentPhase || 'N/A'}</p>
      <p>Progress: {execution.completedSteps} / {execution.totalSteps} ({progress.toFixed(1)}%)</p>

      <div>
        {execution.status === 'pending' && <button onClick={handleStart}>Start</button>}
        {execution.status === 'running' && <button onClick={handlePause}>Pause</button>}
        {execution.status === 'paused' && <button onClick={handleResume}>Resume</button>}
        {(execution.status === 'running' || execution.status === 'paused') && (
          <button onClick={handleCancel}>Cancel</button>
        )}
      </div>

      <ProgressBar value={progress} />
    </div>
  );
}
```

### 5. Using useWorkflowExecutions Hook (Execution List)

```tsx
import { useWorkflowExecutions } from '@aintandem/sdk-react';

function WorkflowExecutionList({ workflowId }: { workflowId: string }) {
  const { executions, loading, error, refresh, create } = useWorkflowExecutions(workflowId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreateExecution = async () => {
    try {
      await create({
        projectId: 'project-123',
        input: { dataset: 'sales-2024' },
      });
      refresh();
    } catch (err) {
      alert('Create execution failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Execution History</h2>
        <button onClick={handleCreateExecution}>Create Execution</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Current Phase</th>
            <th>Progress</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {executions.map(execution => (
            <tr key={execution.id}>
              <td>{execution.id}</td>
              <td>{execution.status}</td>
              <td>{execution.currentPhase || 'N/A'}</td>
              <td>
                {execution.completedSteps} / {execution.totalSteps}
              </td>
              <td>{new Date(execution.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Complete Examples

### Core SDK Workflow Management

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

class WorkflowManager {
  private client: AInTandemClient;

  constructor() {
    this.client = new AInTandemClient({
      baseURL: 'https://api.aintandem.com',
    });
  }

  // Create and publish workflow
  async createAndPublishWorkflow(definition: any) {
    // 1. Create draft
    const workflow = await this.client.workflows.createWorkflow({
      ...definition,
      status: 'draft',
    });

    console.log('Draft created:', workflow.id);

    // 2. Publish workflow
    const published = await this.client.workflows.changeWorkflowStatus(
      workflow.id,
      'published'
    );

    console.log('Published:', published.id);
    return published;
  }

  // Execute workflow and monitor
  async executeWorkflow(workflowId: string, projectId: string, input: any) {
    // 1. Create execution
    const execution = await this.client.workflows.createWorkflowExecution(workflowId, {
      projectId,
      input,
    });

    console.log('Execution ID:', execution.id);

    // 2. Start execution
    await this.client.workflows.startWorkflowExecution(execution.id);

    // 3. Subscribe to progress
    await this.client.subscribeToWorkflow(
      projectId,
      workflowId,
      execution.id,
      (event) => {
        console.log('Workflow event:', event);
      },
      (event) => {
        console.log('Workflow completed:', event);
      },
      (event) => {
        console.error('Workflow failed:', event);
      }
    );

    return execution;
  }

  // Get workflow statistics
  async getWorkflowStats(workflowId: string) {
    const executions = await this.client.workflows.listWorkflowExecutions(workflowId);

    return {
      total: executions.length,
      pending: executions.filter(e => e.status === 'pending').length,
      running: executions.filter(e => e.status === 'running').length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      cancelled: executions.filter(e => e.status === 'cancelled').length,
    };
  }
}

// Usage
const manager = new WorkflowManager();

// Create workflow
const workflow = await manager.createAndPublishWorkflow({
  name: 'Sales Report',
  definition: { phases: [] },
});

// Execute workflow
const execution = await manager.executeWorkflow(
  workflow.id,
  'project-123',
  { dataset: 'sales-2024' }
);

// Get statistics
const stats = await manager.getWorkflowStats(workflow.id);
console.log('Statistics:', stats);
```

### React Workflow Management Interface

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';
import { useWorkflows, useWorkflowExecutions } from '@aintandem/sdk-react';
import { ProgressBar } from '@aintandem/sdk-react/components';

function App() {
  return (
    <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
      <WorkflowDashboard />
    </AInTandemProvider>
  );
}

function WorkflowDashboard() {
  const { workflows, loading: workflowsLoading } = useWorkflows('published');

  if (workflowsLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Workflow Dashboard</h1>
      {workflows.map(workflow => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: any }) {
  const { executions, loading: executionsLoading } = useWorkflowExecutions(workflow.id);

  if (executionsLoading) return <div>Loading executions...</div>;

  const recentExecutions = executions.slice(0, 5);
  const successRate = executions.length > 0
    ? (executions.filter(e => e.status === 'completed').length / executions.length) * 100
    : 0;

  return (
    <div className="workflow-card">
      <h2>{workflow.name}</h2>
      <p>{workflow.description}</p>

      <div className="stats">
        <p>Total executions: {executions.length}</p>
        <p>Success rate: {successRate.toFixed(1)}%</p>
      </div>

      <h3>Recent Executions</h3>
      <ul>
        {recentExecutions.map(execution => (
          <li key={execution.id}>
            <ExecutionItem execution={execution} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExecutionItem({ execution }: { execution: any }) {
  const progress = execution.totalSteps > 0
    ? (execution.completedSteps / execution.totalSteps) * 100
    : 0;

  return (
    <div>
      <span>Status: {execution.status}</span>
      <ProgressBar value={progress} size="small" />
      <span>{progress.toFixed(0)}%</span>
    </div>
  );
}
```

## Next Steps

- [Task Execution](./tasks.md) - Learn how to execute single tasks
- [Real-time Progress Tracking](./real-time-progress.md) - Learn how to track workflow execution progress

## FAQ

### Q: What's the difference between workflows and tasks?

Workflows are complex multi-step processes containing multiple phases and steps. Tasks are single operation units. Each step in a workflow corresponds to a task.

### Q: How to pass parameters when executing workflow?

Use the `input` parameter when creating workflow execution. These parameters will be passed to each step in the workflow.

### Q: How to retry failed workflow execution?

You can create a new execution instance to retry failed workflows.

---

**Happy coding!** ⚙️
