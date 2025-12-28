# 任務執行指南

本指南詳細說明如何使用 AInTandem SDK 執行和管理任務（Tasks），包括同步/異步執行、任務歷史查詢和隊列狀態監控。

## 概述

任務是 AInTandem 的基本執行單元。每個任務代表一個具體的操作，例如數據提取、分析、模型訓練等。任務可以同步或異步執行，並支持實時進度追蹤。

## 核心 SDK 使用

### 1. 執行同步任務

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// 同步執行：等待任務完成並返回結果
const task = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: {
    dataset: 'sales-2024',
    analysisType: 'trend',
  },
  async: false, // 同步執行
});

console.log('任務 ID:', task.id);
console.log('任務狀態:', task.status);
console.log('任務結果:', task.output);
```

### 2. 執行異步任務

```typescript
// 異步執行：立即返回任務 ID，任務在後台執行
const task = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: {
    dataset: 'sales-2024',
  },
  async: true, // 異步執行
});

console.log('異步任務已提交:', task.id);
console.log('任務狀態:', task.status); // 'pending' 或 'running'

// 稍後查詢任務狀態
const updatedTask = await client.tasks.getTask('project-123', task.id);
console.log('更新狀態:', updatedTask.status);
```

### 3. 獲取任務詳情

```typescript
// 獲取特定任務的詳情
const task = await client.tasks.getTask('project-123', 'task-id');

console.log('任務 ID:', task.id);
console.log('任務名稱:', task.taskName);
console.log('任務狀態:', task.status);
console.log('創建時間:', task.createdAt);
console.log('完成時間:', task.completedAt);
console.log('輸入:', task.input);
console.log('輸出:', task.output);
console.log('錯誤:', task.error);
```

### 4. 取消任務

```typescript
// 取消正在運行的任務
await client.tasks.cancelTask('project-123', 'task-id');
console.log('任務已取消');
```

### 5. 獲取任務歷史

```typescript
// 獲取項目的任務歷史
const history = await client.tasks.getTaskHistory('project-123', {
  status: 'completed', // 可選：過濾狀態
  limit: 10, // 可選：限制返回數量
  offset: 0, // 可選：偏移量
});

console.log('任務歷史:', history);

// 統計任務狀態
const stats = {
  total: history.length,
  completed: history.filter(t => t.status === 'completed').length,
  failed: history.filter(t => t.status === 'failed').length,
  running: history.filter(t => t.status === 'running').length,
};

console.log('任務統計:', stats);
```

### 6. 獲取隊列狀態

```typescript
// 獲取項目的任務隊列狀態
const queueStatus = await client.tasks.getQueueStatus('project-123');

console.log('隊列狀態:', queueStatus);
console.log('等待中任務數:', queueStatus.pending);
console.log('運行中任務數:', queueStatus.running);
console.log('已完成任務數:', queueStatus.completed);
console.log('失敗任務數:', queueStatus.failed);
```

### 7. 執行 Ad-hoc 任務

```typescript
// 執行一次性、未預定義的任務
const task = await client.tasks.executeAdhocTask({
  projectId: 'project-123',
  task: 'custom-script',
  input: {
    script: 'python analyze.py',
    args: ['--input', 'data.csv'],
  },
  async: true,
});

console.log('Ad-hoc 任務已創建:', task.id);
```

## 任務狀態

任務有以下幾種狀態：

- `pending`: 等待執行
- `running`: 正在執行
- `completed`: 執行完成
- `failed`: 執行失敗
- `cancelled`: 已取消

```typescript
// 檢查任務狀態
const task = await client.tasks.getTask('project-123', 'task-id');

switch (task.status) {
  case 'pending':
    console.log('任務等待中');
    break;
  case 'running':
    console.log('任務正在執行');
    break;
  case 'completed':
    console.log('任務完成:', task.output);
    break;
  case 'failed':
    console.error('任務失敗:', task.error);
    break;
  case 'cancelled':
    console.log('任務已取消');
    break;
}
```

## React Hooks 使用

### 1. 使用 useTask Hook

```tsx
import { useTask } from '@aintandem/sdk-react';

function TaskDetail({ projectId, taskId }: { projectId: string; taskId: string }) {
  const { task, loading, error, refresh, cancel } = useTask(projectId, taskId);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;
  if (!task) return <div>任務不存在</div>;

  const handleCancel = async () => {
    if (confirm('確定要取消此任務嗎？')) {
      try {
        await cancel();
        refresh();
      } catch (err) {
        alert('取消失敗');
      }
    }
  };

  return (
    <div>
      <h2>任務詳情</h2>
      <p>任務 ID: {task.id}</p>
      <p>任務名稱: {task.taskName}</p>
      <p>狀態: {task.status}</p>
      <p>創建時間: {new Date(task.createdAt).toLocaleString()}</p>

      {task.completedAt && (
        <p>完成時間: {new Date(task.completedAt).toLocaleString()}</p>
      )}

      {task.status === 'running' && (
        <button onClick={handleCancel}>取消任務</button>
      )}

      {task.output && (
        <div>
          <h3>輸出</h3>
          <pre>{JSON.stringify(task.output, null, 2)}</pre>
        </div>
      )}

      {task.error && (
        <div>
          <h3>錯誤</h3>
          <p>{task.error}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. 使用 useExecuteTask Hook

```tsx
import { useExecuteTask } from '@aintandem/sdk-react';

function TaskExecutor({ projectId }: { projectId: string }) {
  const { execute, task, loading, error } = useExecuteTask(
    projectId,
    'data-analysis',
    { dataset: 'sales-2024' }
  );

  const handleExecute = async () => {
    try {
      const result = await execute();
      console.log('任務已提交:', result.id);
    } catch (err) {
      console.error('執行失敗:', err);
    }
  };

  return (
    <div>
      <button onClick={handleExecute} disabled={loading || !!task}>
        {loading ? '執行中...' : task ? `任務 ID: ${task.id}` : '執行任務'}
      </button>

      {error && <div className="error">{error.message}</div>}

      {task && (
        <div>
          <p>任務狀態: {task.status}</p>
          {task.output && (
            <pre>{JSON.stringify(task.output, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3. 使用 useExecuteAdhocTask Hook

```tsx
import { useExecuteAdhocTask } from '@aintandem/sdk-react';

function AdhocTaskExecutor({ projectId }: { projectId: string }) {
  const { execute, task, loading, error } = useExecuteAdhocTask(projectId);

  const handleExecute = async () => {
    try {
      const result = await execute({
        task: 'custom-script',
        input: {
          script: 'python process.py',
          args: ['--input', 'data.csv'],
        },
        async: true,
      });
      console.log('Ad-hoc 任務已創建:', result.id);
    } catch (err) {
      console.error('執行失敗:', err);
    }
  };

  return (
    <div>
      <h3>執行自定義任務</h3>
      <button onClick={handleExecute} disabled={loading}>
        {loading ? '執行中...' : '執行自定義任務'}
      </button>

      {error && <div className="error">{error.message}</div>}

      {task && (
        <div>
          <p>任務 ID: {task.id}</p>
          <p>狀態: {task.status}</p>
        </div>
      )}
    </div>
  );
}
```

### 4. 使用 useTaskHistory Hook

```tsx
import { useTaskHistory } from '@aintandem/sdk-react';

function TaskHistory({ projectId }: { projectId: string }) {
  const { history, loading, error, refresh } = useTaskHistory(projectId, {
    status: 'completed', // 可選：過濾狀態
    limit: 20,
  });

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;

  // 統計
  const stats = {
    total: history.length,
    completed: history.filter(t => t.status === 'completed').length,
    failed: history.filter(t => t.status === 'failed').length,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>任務歷史</h2>
        <button onClick={refresh}>刷新</button>
      </div>

      <div className="stats">
        <p>總計: {stats.total}</p>
        <p>完成: {stats.completed}</p>
        <p>失敗: {stats.failed}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>任務名稱</th>
            <th>狀態</th>
            <th>創建時間</th>
            <th>完成時間</th>
          </tr>
        </thead>
        <tbody>
          {history.map(task => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.taskName}</td>
              <td>{task.status}</td>
              <td>{new Date(task.createdAt).toLocaleString()}</td>
              <td>
                {task.completedAt
                  ? new Date(task.completedAt).toLocaleString()
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 5. 使用 useQueueStatus Hook

```tsx
import { useQueueStatus } from '@aintandem/sdk-react';
import { CircularProgress } from '@aintandem/sdk-react/components';

function QueueMonitor({ projectId }: { projectId: string }) {
  const { status, loading, error, refresh } = useQueueStatus(projectId);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;
  if (!status) return <div>無隊列狀態</div>;

  const total = status.pending + status.running + status.completed + status.failed;
  const completed = status.completed + status.failed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>任務隊列</h2>
        <button onClick={refresh}>刷新</button>
      </div>

      <div className="queue-stats">
        <div className="stat-item">
          <h3>等待中</h3>
          <CircularProgress value={(status.pending / total) * 100} />
          <p>{status.pending}</p>
        </div>

        <div className="stat-item">
          <h3>運行中</h3>
          <CircularProgress value={(status.running / total) * 100} />
          <p>{status.running}</p>
        </div>

        <div className="stat-item">
          <h3>已完成</h3>
          <CircularProgress value={(status.completed / total) * 100} />
          <p>{status.completed}</p>
        </div>

        <div className="stat-item">
          <h3>失敗</h3>
          <CircularProgress value={(status.failed / total) * 100} />
          <p>{status.failed}</p>
        </div>
      </div>

      <div className="overall-progress">
        <h3>總體進度</h3>
        <ProgressBar value={progress} showLabel />
      </div>
    </div>
  );
}
```

## 完整範例

### 核心 SDK 任務管理

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

class TaskManager {
  private client: AInTandemClient;

  constructor() {
    this.client = new AInTandemClient({
      baseURL: 'https://api.aintandem.com',
    });
  }

  // 執行任務並等待完成
  async executeAndWait(
    projectId: string,
    taskName: string,
    input: any,
    timeout: number = 300000 // 5 分鐘超時
  ) {
    const startTime = Date.now();

    // 1. 提交異步任務
    const task = await this.client.tasks.executeTask({
      projectId,
      task: taskName,
      input,
      async: true,
    });

    console.log(`任務 ${task.id} 已提交`);

    // 2. 輪詢任務狀態
    while (Date.now() - startTime < timeout) {
      const updated = await this.client.tasks.getTask(projectId, task.id);

      if (updated.status === 'completed') {
        console.log('任務完成:', updated.output);
        return updated;
      }

      if (updated.status === 'failed') {
        throw new Error(`任務失敗: ${updated.error}`);
      }

      // 等待 2 秒後再查詢
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('任務超時');
  }

  // 批量執行任務
  async executeBatch(
    projectId: string,
    taskName: string,
    inputs: any[]
  ) {
    const tasks = [];

    // 並行提交所有任務
    for (const input of inputs) {
      const task = await this.client.tasks.executeTask({
        projectId,
        task: taskName,
        input,
        async: true,
      });
      tasks.push(task);
      console.log(`已提交任務 ${task.id}`);
    }

    // 等待所有任務完成
    const results = await Promise.all(
      tasks.map(t => this.executeAndWait(projectId, taskName, t.input))
    );

    return results;
  }

  // 獲取項目任務統計
  async getProjectStats(projectId: string) {
    const history = await this.client.tasks.getTaskHistory(projectId);
    const queue = await this.client.tasks.getQueueStatus(projectId);

    return {
      history: {
        total: history.length,
        completed: history.filter(t => t.status === 'completed').length,
        failed: history.filter(t => t.status === 'failed').length,
      },
      queue: {
        pending: queue.pending,
        running: queue.running,
      },
    };
  }
}

// 使用
const manager = new TaskManager();

// 單個任務
const result = await manager.executeAndWait(
  'project-123',
  'data-analysis',
  { dataset: 'sales-2024' }
);

// 批量任務
const results = await manager.executeBatch(
  'project-123',
  'data-analysis',
  [
    { dataset: 'sales-2024-q1' },
    { dataset: 'sales-2024-q2' },
    { dataset: 'sales-2024-q3' },
    { dataset: 'sales-2024-q4' },
  ]
);

// 統計
const stats = await manager.getProjectStats('project-123');
console.log('項目統計:', stats);
```

### React 任務管理介面

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';
import { useTask, useTaskHistory, useExecuteTask } from '@aintandem/sdk-react';
import { ProgressTracker, ProgressBar } from '@aintandem/sdk-react/components';

function App() {
  return (
    <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
      <TaskDashboard projectId="project-123" />
    </AInTandemProvider>
  );
}

function TaskDashboard({ projectId }: { projectId: string }) {
  return (
    <div>
      <h1>任務管理</h1>

      <section>
        <h2>執行新任務</h2>
        <TaskExecutor projectId={projectId} />
      </section>

      <section>
        <h2>任務歷史</h2>
        <TaskHistory projectId={projectId} />
      </section>

      <section>
        <h2>隊列狀態</h2>
        <QueueMonitor projectId={projectId} />
      </section>
    </div>
  );
}

function TaskExecutor({ projectId }: { projectId: string }) {
  const { execute, task, loading } = useExecuteTask(
    projectId,
    'data-analysis',
    { dataset: 'sales-2024' }
  );

  return (
    <div>
      <button onClick={execute} disabled={loading || !!task}>
        {loading ? '執行中...' : '執行數據分析任務'}
      </button>

      {task && (
        <>
          <p>任務 ID: {task.id}</p>
          <ProgressTracker projectId={projectId} taskId={task.id} showEvents />
        </>
      )}
    </div>
  );
}
```

## 任務輸入和輸出

### 輸入格式

任務輸入可以是任何 JSON 可序列化的數據：

```typescript
// 簡單輸入
await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: {
    dataset: 'sales-2024',
  },
  async: true,
});

// 複雜輸入
await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'model-training',
  input: {
    algorithm: 'neural-network',
    hyperparameters: {
      layers: [128, 64, 32],
      activation: 'relu',
      optimizer: 'adam',
      learningRate: 0.001,
      epochs: 100,
    },
    trainingData: {
      source: 'database',
      table: 'training_data',
      splitRatio: 0.8,
    },
    validation: {
      enabled: true,
      kFold: 5,
    },
  },
  async: true,
});
```

### 輸出格式

任務輸出也依賴於具體的任務類型：

```typescript
const task = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: { dataset: 'sales-2024' },
  async: false,
});

// 輸出可能是：
// 1. 簡單值
console.log(task.output); // "Analysis completed"

// 2. 對象
console.log(task.output); // { summary: "...", details: [...] }

// 3. 數組
console.log(task.output); // [{ id: 1, value: 100 }, ...]

// 4. 嵌套結構
console.log(task.output); // {
                          //   results: {...},
                          //   metrics: {...},
                          //   artifacts: [...]
                          // }
```

## 錯誤處理

### 處理任務失敗

```typescript
try {
  const task = await client.tasks.executeTask({
    projectId: 'project-123',
    task: 'data-analysis',
    input: { dataset: 'invalid-dataset' },
    async: false,
  });
} catch (error) {
  if (error instanceof AInTandemError) {
    console.error('任務執行失敗');
    console.error('錯誤代碼:', error.code);
    console.error('錯誤訊息:', error.message);

    // 處理特定錯誤
    if (error.code === 'TASK_FAILED') {
      console.error('任務執行期間出錯');
    } else if (error.code === 'DATASET_NOT_FOUND') {
      console.error('數據集不存在');
    }
  }
}

// 異步任務的錯誤處理
const task = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: { dataset: 'sales-2024' },
  async: true,
});

// 稍後檢查任務狀態
const updated = await client.tasks.getTask('project-123', task.id);
if (updated.status === 'failed') {
  console.error('任務失敗:', updated.error);
}
```

## 下一步

- [實時進度追蹤](./real-time-progress.md) - 了解如何實時追蹤任務進度
- [工作流管理](./workflows.md) - 了解如何管理工作流

## 常見問題

### Q: 同步和異步執行的區別？

同步執行會阻塞直到任務完成並返回結果。異步執行立即返回任務 ID，任務在後台執行，需要稍後查詢結果。

### Q: 如何選擇同步或異步執行？

- 短時間任務（< 30 秒）：使用同步執行
- 長時間任務（> 30 秒）：使用異步執行
- 需要立即結果：使用同步執行
- 後台處理：使用異步執行

### Q: 任務超時時間是多少？

默認超時時間由服務器配置決定，通常為 30 分鐘。可以在客戶端配置中設置 `timeout` 選項。

### Q: 如何重新執行失敗的任務？

使用相同的輸入參數重新提交任務即可。

---

**祝您使用愉快！** ⚡
