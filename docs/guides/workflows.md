# 工作流管理指南

本指南詳細說明如何使用 AInTandem SDK 管理工作流（Workflows），包括創建、查詢、更新、刪除和執行工作流。

## 概述

工作流是 AInTandem 的核心功能，用於定義和執行複雜的自動化任務序列。每個工作流包含多個階段（Phases），每個階段包含多個步驟（Steps）。

## 核心 SDK 使用

### 1. 獲取工作流列表

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// 獲取所有已發布的工作流
const publishedWorkflows = await client.workflows.listWorkflows('published');
console.log('已發布的工作流:', publishedWorkflows);

// 獲取所有草稿工作流
const draftWorkflows = await client.workflows.listWorkflows('draft');
console.log('草稿工作流:', draftWorkflows);

// 獲取所有工作流
const allWorkflows = await client.workflows.listWorkflows();
console.log('所有工作流:', allWorkflows);
```

### 2. 獲取單個工作流

```typescript
// 根據 ID 獲取工作流詳情
const workflow = await client.workflows.getWorkflow('workflow-id');

console.log('工作流 ID:', workflow.id);
console.log('工作流名稱:', workflow.name);
console.log('工作流描述:', workflow.description);
console.log('工作流狀態:', workflow.status);
console.log('工作流定義:', workflow.definition);
```

### 3. 創建工作流

```typescript
// 創建新工作流
const newWorkflow = await client.workflows.createWorkflow({
  name: 'Data Processing Pipeline',
  description: 'Process sales data and generate reports',
  status: 'draft', // 'draft' 或 'published'
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

console.log('已創建工作流:', newWorkflow.id);
```

### 4. 更新工作流

```typescript
// 更新工作流基本信息
const updated = await client.workflows.updateWorkflow('workflow-id', {
  name: 'Updated Workflow Name',
  description: 'Updated description',
});

console.log('已更新:', updated.id);
```

### 5. 更改工作流狀態

```typescript
// 發布工作流
const published = await client.workflows.changeWorkflowStatus('workflow-id', 'published');
console.log('工作流已發布:', published.status);

// 取消發布（改為草稿）
const draft = await client.workflows.changeWorkflowStatus('workflow-id', 'draft');
console.log('工作流改為草稿:', draft.status);
```

### 6. 複製工作流

```typescript
// 複製現有工作流
const cloned = await client.workflows.cloneWorkflow('workflow-id', {
  name: 'Copy of Data Processing Pipeline',
  description: 'Cloned workflow',
});

console.log('已複製工作流:', cloned.id);
console.log('新工作流名稱:', cloned.name);
```

### 7. 刪除工作流

```typescript
// 刪除工作流
await client.workflows.deleteWorkflow('workflow-id');
console.log('工作流已刪除');
```

## 工作流執行

### 1. 創建工作流執行

```typescript
// 創建工作流執行實例
const execution = await client.workflows.createWorkflowExecution('workflow-id', {
  projectId: 'project-123',
  input: {
    dataset: 'sales-2024',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
});

console.log('執行 ID:', execution.id);
console.log('執行狀態:', execution.status);
```

### 2. 獲取工作流執行詳情

```typescript
// 獲取執行詳情
const execution = await client.workflows.getWorkflowExecution('execution-id');

console.log('執行狀態:', execution.status);
console.log('當前階段:', execution.currentPhase);
console.log('已完成步驟:', execution.completedSteps);
console.log('總步驟數:', execution.totalSteps);
```

### 3. 獲取工作流的執行列表

```typescript
// 獲取特定工作流的所有執行記錄
const executions = await client.workflows.listWorkflowExecutions('workflow-id');

console.log('執行歷史:', executions);

// 執行統計
const stats = {
  total: executions.length,
  running: executions.filter(e => e.status === 'running').length,
  completed: executions.filter(e => e.status === 'completed').length,
  failed: executions.filter(e => e.status === 'failed').length,
};

console.log('執行統計:', stats);
```

### 4. 控制工作流執行

```typescript
const executionId = 'execution-id';

// 開始執行
const started = await client.workflows.startWorkflowExecution(executionId);
console.log('已開始:', started.status);

// 暫停執行
const paused = await client.workflows.pauseWorkflowExecution(executionId);
console.log('已暫停:', paused.status);

// 恢復執行
const resumed = await client.workflows.resumeWorkflowExecution(executionId);
console.log('已恢復:', resumed.status);

// 取消執行
const cancelled = await client.workflows.cancelWorkflowExecution(executionId);
console.log('已取消:', cancelled.status);
```

## 工作流版本管理

### 1. 獲取工作流版本列表

```typescript
// 獲取工作流的所有版本
const versions = await client.workflows.listWorkflowVersions('workflow-id');

console.log('版本列表:', versions);

// 顯示版本信息
versions.forEach(version => {
  console.log(`版本 ${version.version}: ${version.comment}`);
  console.log(`  創建時間: ${version.createdAt}`);
  console.log(`  創建者: ${version.createdBy}`);
});
```

### 2. 獲取特定版本詳情

```typescript
// 獲取特定版本的詳情
const version = await client.workflows.getWorkflowVersion('workflow-id', 2);

console.log('版本 2 的定義:', version.definition);
```

## React Hooks 使用

### 1. 使用 useWorkflow Hook（單個工作流）

```tsx
import { useWorkflow } from '@aintandem/sdk-react';

function WorkflowDetail({ workflowId }: { workflowId: string }) {
  const { workflow, loading, error, update, changeStatus, clone } = useWorkflow(workflowId);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;
  if (!workflow) return <div>工作流不存在</div>;

  const handlePublish = async () => {
    try {
      await changeStatus('published');
      alert('工作流已發布');
    } catch (err) {
      alert('發布失敗');
    }
  };

  const handleClone = async () => {
    try {
      const cloned = await clone({
        name: `${workflow.name} (Copy)`,
      });
      alert(`已複製: ${cloned.id}`);
    } catch (err) {
      alert('複製失敗');
    }
  };

  return (
    <div>
      <h1>{workflow.name}</h1>
      <p>{workflow.description}</p>
      <p>狀態: {workflow.status}</p>

      <button onClick={handlePublish}>發布</button>
      <button onClick={handleClone}>複製</button>

      <div>
        <h2>階段</h2>
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

### 2. 使用 useWorkflows Hook（工作流列表）

```tsx
import { useWorkflows } from '@aintandem/sdk-react';

function WorkflowList() {
  const { workflows, loading, error, refresh, create, remove } = useWorkflows('published');

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;

  const handleCreate = async () => {
    try {
      await create({
        name: 'New Workflow',
        description: 'Description',
        status: 'draft',
        definition: { phases: [] },
      });
      refresh(); // 刷新列表
    } catch (err) {
      alert('創建失敗');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除這個工作流嗎？')) {
      try {
        await remove(id);
        refresh(); // 刷新列表
      } catch (err) {
        alert('刪除失敗');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>已發布的工作流</h1>
        <button onClick={handleCreate}>創建工作流</button>
      </div>

      <ul>
        {workflows.map(workflow => (
          <li key={workflow.id}>
            <h3>{workflow.name}</h3>
            <p>{workflow.description}</p>
            <p>狀態: {workflow.status}</p>
            <button onClick={() => handleDelete(workflow.id)}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. 使用 useWorkflowVersions Hook

```tsx
import { useWorkflowVersions } from '@aintandem/sdk-react';

function WorkflowVersionHistory({ workflowId }: { workflowId: string }) {
  const { versions, loading, error } = useWorkflowVersions(workflowId);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;

  return (
    <div>
      <h2>版本歷史</h2>
      <table>
        <thead>
          <tr>
            <th>版本</th>
            <th>評論</th>
            <th>創建者</th>
            <th>創建時間</th>
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

### 4. 使用 useWorkflowExecution Hook（單個執行）

```tsx
import { useWorkflowExecution } from '@aintandem/sdk-react';

function WorkflowExecutionMonitor({ executionId }: { executionId: string }) {
  const { execution, loading, error, refresh, start, pause, resume, cancel } = useWorkflowExecution(executionId);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;
  if (!execution) return <div>執行不存在</div>;

  const handleStart = async () => {
    try {
      await start();
      refresh();
    } catch (err) {
      alert('啟動失敗');
    }
  };

  const handlePause = async () => {
    try {
      await pause();
      refresh();
    } catch (err) {
      alert('暫停失敗');
    }
  };

  const handleResume = async () => {
    try {
      await resume();
      refresh();
    } catch (err) {
      alert('恢復失敗');
    }
  };

  const handleCancel = async () => {
    if (confirm('確定要取消此執行嗎？')) {
      try {
        await cancel();
        refresh();
      } catch (err) {
        alert('取消失敗');
      }
    }
  };

  const progress = execution.totalSteps > 0
    ? (execution.completedSteps / execution.totalSteps) * 100
    : 0;

  return (
    <div>
      <h2>執行詳情</h2>
      <p>狀態: {execution.status}</p>
      <p>當前階段: {execution.currentPhase || 'N/A'}</p>
      <p>進度: {execution.completedSteps} / {execution.totalSteps} ({progress.toFixed(1)}%)</p>

      <div>
        {execution.status === 'pending' && <button onClick={handleStart}>開始</button>}
        {execution.status === 'running' && <button onClick={handlePause}>暫停</button>}
        {execution.status === 'paused' && <button onClick={handleResume}>恢復</button>}
        {(execution.status === 'running' || execution.status === 'paused') && (
          <button onClick={handleCancel}>取消</button>
        )}
      </div>

      <ProgressBar value={progress} />
    </div>
  );
}
```

### 5. 使用 useWorkflowExecutions Hook（執行列表）

```tsx
import { useWorkflowExecutions } from '@aintandem/sdk-react';

function WorkflowExecutionList({ workflowId }: { workflowId: string }) {
  const { executions, loading, error, refresh, create } = useWorkflowExecutions(workflowId);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;

  const handleCreateExecution = async () => {
    try {
      await create({
        projectId: 'project-123',
        input: { dataset: 'sales-2024' },
      });
      refresh();
    } catch (err) {
      alert('創建執行失敗');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>執行歷史</h2>
        <button onClick={handleCreateExecution}>創建執行</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>狀態</th>
            <th>當前階段</th>
            <th>進度</th>
            <th>創建時間</th>
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

## 完整範例

### 核心 SDK 工作流管理

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

class WorkflowManager {
  private client: AInTandemClient;

  constructor() {
    this.client = new AInTandemClient({
      baseURL: 'https://api.aintandem.com',
    });
  }

  // 創建並發布工作流
  async createAndPublishWorkflow(definition: any) {
    // 1. 創建草稿
    const workflow = await this.client.workflows.createWorkflow({
      ...definition,
      status: 'draft',
    });

    console.log('已創建草稿:', workflow.id);

    // 2. 發布工作流
    const published = await this.client.workflows.changeWorkflowStatus(
      workflow.id,
      'published'
    );

    console.log('已發布:', published.id);
    return published;
  }

  // 執行工作流並監控
  async executeWorkflow(workflowId: string, projectId: string, input: any) {
    // 1. 創建執行
    const execution = await this.client.workflows.createWorkflowExecution(workflowId, {
      projectId,
      input,
    });

    console.log('執行 ID:', execution.id);

    // 2. 開始執行
    await this.client.workflows.startWorkflowExecution(execution.id);

    // 3. 訂閱進度
    await this.client.subscribeToWorkflow(
      projectId,
      workflowId,
      execution.id,
      (event) => {
        console.log('工作流事件:', event);
      },
      (event) => {
        console.log('工作流完成:', event);
      },
      (event) => {
        console.error('工作流失敗:', event);
      }
    );

    return execution;
  }

  // 獲取工作流統計
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

// 使用
const manager = new WorkflowManager();

// 創建工作流
const workflow = await manager.createAndPublishWorkflow({
  name: 'Sales Report',
  definition: { phases: [] },
});

// 執行工作流
const execution = await manager.executeWorkflow(
  workflow.id,
  'project-123',
  { dataset: 'sales-2024' }
);

// 獲取統計
const stats = await manager.getWorkflowStats(workflow.id);
console.log('統計:', stats);
```

### React 工作流管理介面

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

  if (workflowsLoading) return <div>載入中...</div>;

  return (
    <div>
      <h1>工作流儀表板</h1>
      {workflows.map(workflow => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: any }) {
  const { executions, loading: executionsLoading } = useWorkflowExecutions(workflow.id);

  if (executionsLoading) return <div>載入執行中...</div>;

  const recentExecutions = executions.slice(0, 5);
  const successRate = executions.length > 0
    ? (executions.filter(e => e.status === 'completed').length / executions.length) * 100
    : 0;

  return (
    <div className="workflow-card">
      <h2>{workflow.name}</h2>
      <p>{workflow.description}</p>

      <div className="stats">
        <p>總執行次數: {executions.length}</p>
        <p>成功率: {successRate.toFixed(1)}%</p>
      </div>

      <h3>最近執行</h3>
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
      <span>狀態: {execution.status}</span>
      <ProgressBar value={progress} size="small" />
      <span>{progress.toFixed(0)}%</span>
    </div>
  );
}
```

## 下一步

- [任務執行](./tasks.md) - 了解如何執行單個任務
- [實時進度追蹤](./real-time-progress.md) - 了解如何追蹤工作流執行進度

## 常見問題

### Q: 工作流和任務的區別是什麼？

工作流是複雜的多步驟流程，包含多個階段和步驟。任務是單個操作單元。工作流的每個步驟都對應一個任務。

### Q: 如何在執行工作流時傳遞參數？

在創建工作流執行時使用 `input` 參數傳遞。這些參數會被傳遞給工作流中的每個步驟。

### Q: 工作流執行失敗後如何重試？

您可以創建新的執行實例來重試失敗的工作流。

---

**祝您使用愉快！** ⚙️
