# 實時進度追蹤指南

本指南詳細說明如何使用 AInTandem SDK 通過 WebSocket 進行實時進度追蹤，包括任務進度、工作流進度和容器進度。

## 概述

AInTandem SDK 提供了完整的 WebSocket 支持來實時追蹤：
- 單個任務的執行進度
- 工作流的執行進度
- 容器的操作進度
- 項目級別的所有進度事件

## WebSocket 連接管理

SDK 內部使用 `WebSocketManager` 和 `ProgressClient` 自動管理 WebSocket 連接：

- 自動連接和重連
- 心跳檢測
- 事件訂閱和取消訂閱
- 連接狀態監控

## 核心 SDK 使用

### 1. 追蹤單個任務進度

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// 提交異步任務
const task = await client.tasks.executeTask({
  projectId: 'project-123',
  task: 'data-analysis',
  input: { dataset: 'sales-2024' },
  async: true,
});

// 訂閱任務進度
await client.subscribeToTask(
  'project-123',
  task.id,
  // 進度事件回調
  (event) => {
    console.log('任務進度更新:', event);
    // event 類型: TaskEvent
    // - type: 'task_started', 'task_progress', 'task_completed', 'task_failed'
  },
  // 完成回調
  (event) => {
    console.log('任務完成:', event.output);
  },
  // 錯誤回調
  (event) => {
    console.error('任務失敗:', event.error);
  }
);
```

### 2. 追蹤工作流執行進度

```typescript
// 創建工作流執行
const execution = await client.workflows.createWorkflowExecution('workflow-id', {
  projectId: 'project-123',
  input: { dataset: 'sales-2024' },
});

// 訂閱工作流進度
await client.subscribeToWorkflow(
  'project-123',
  'workflow-id',
  execution.id,
  // 進度事件回調
  (event) => {
    console.log('工作流進度更新:', event);
    // event 類型: WorkflowEvent
    // - type: 'workflow_started', 'phase_started', 'phase_completed',
    //         'step_started', 'step_completed', 'workflow_completed', 'workflow_failed'
  },
  // 完成回調
  (event) => {
    console.log('工作流完成:', event.output);
  },
  // 錯誤回調
  (event) => {
    console.error('工作流失敗:', event.error);
  }
);
```

### 3. 追蹤容器操作進度

```typescript
// 訂閱容器操作進度
await client.subscribeToContainer(
  'project-123',
  'container-id',
  // 進度事件回調
  (event) => {
    console.log('容器事件:', event);
    // event 類型: ContainerEvent
    // - type: 'container_created', 'container_started', 'container_stopped',
    //         'container_removed', 'container_logs', etc.
  }
);
```

### 4. 追蹤項目所有進度

```typescript
// 訂閱項目的所有進度事件
const subscription = await client.progress.subscribeToProgress(
  'project-123',
  // 事件回調
  (event) => {
    console.log('項目進度事件:', event);
    // event 類型: ProgressEvent (TaskEvent | WorkflowEvent | ContainerEvent)
  }
);

// 取消訂閱
subscription.unsubscribe();
```

### 5. 取消訂閱

```typescript
// 方法 1：保存取消函數
const unsubscribe = await client.subscribeToTask(...);
// 稍後取消
unsubscribe();

// 方法 2：使用 ProgressSubscription
const subscription = await client.progress.subscribeToProgress(...);
// 稍後取消
subscription.unsubscribe();
```

## React Hooks 使用

### 1. 使用 useTaskProgress Hook

```tsx
import { useTaskProgress } from '@aintandem/sdk-react';

function TaskProgress({ projectId, taskId }: { projectId: string; taskId: string }) {
  const { events, isConnected, clearEvents } = useTaskProgress(
    projectId,
    taskId,
    {
      // 進度事件回調
      onEvent: (event) => {
        console.log('任務事件:', event);
      },
      // 完成回調
      onComplete: (event) => {
        console.log('任務完成:', event.output);
        alert('任務完成！');
      },
      // 錯誤回調
      onFailed: (event) => {
        console.error('任務失敗:', event.error);
        alert('任務失敗！');
      },
    }
  );

  // 計算進度
  const progressEvents = events.filter(e => e.type === 'task_progress');
  const latestProgress = progressEvents.length > 0
    ? progressEvents[progressEvents.length - 1]
    : null;

  return (
    <div>
      <div>
        <p>連接狀態: {isConnected ? '已連接' : '未連接'}</p>
        <button onClick={clearEvents}>清除事件</button>
      </div>

      {latestProgress && (
        <div>
          <h3>任務進度</h3>
          <p>完成百分比: {latestProgress.data.percent}%</p>
          <p>當前步驟: {latestProgress.data.currentStep}</p>
          <ProgressBar value={latestProgress.data.percent} />
        </div>
      )}

      <div>
        <h3>事件日誌</h3>
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              {event.type} - {new Date(event.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### 2. 使用 useWorkflowProgress Hook

```tsx
import { useWorkflowProgress } from '@aintandem/sdk-react';

function WorkflowProgress({ workflowId, executionId }: { workflowId: string; executionId: string }) {
  const projectId = 'project-123';
  const { events, isConnected, clearEvents } = useWorkflowProgress(
    workflowId,
    executionId,
    {
      onEvent: (event) => {
        console.log('工作流事件:', event);
      },
      onComplete: (event) => {
        console.log('工作流完成:', event.output);
      },
      onFailed: (event) => {
        console.error('工作流失敗:', event.error);
      },
    }
  );

  // 分析事件
  const phaseEvents = events.filter(e =>
    e.type === 'phase_started' || e.type === 'phase_completed'
  );
  const stepEvents = events.filter(e =>
    e.type === 'step_started' || e.type === 'step_completed'
  );

  return (
    <div>
      <p>連接狀態: {isConnected ? '已連接' : '未連接'}</p>

      <div>
        <h3>階段進度</h3>
        <ul>
          {phaseEvents.map((event, index) => (
            <li key={index}>
              {event.type}: {event.data.phaseName || event.data.phaseId}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>步驟進度</h3>
        <ul>
          {stepEvents.map((event, index) => (
            <li key={index}>
              {event.type}: {event.data.stepName || event.data.stepId}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### 3. 使用 useContainerProgress Hook

```tsx
import { useContainerProgress } from '@aintandem/sdk-react';

function ContainerMonitor({ projectId }: { projectId: string }) {
  const containerId = 'container-123';
  const { events, isConnected, clearEvents } = useContainerProgress(
    projectId,
    containerId,
    (event) => {
      console.log('容器事件:', event);
    }
  );

  return (
    <div>
      <p>容器 ID: {containerId}</p>
      <p>連接狀態: {isConnected ? '已連接' : '未連接'}</p>

      <div>
        <h3>容器事件</h3>
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              {event.type} - {new Date(event.timestamp).toLocaleTimeString()}
              {event.data.message && `: ${event.data.message}`}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={clearEvents}>清除事件</button>
    </div>
  );
}
```

### 4. 使用 useProgress Hook（項目級別）

```tsx
import { useProgress } from '@aintandem/sdk-react';

function ProjectMonitor({ projectId }: { projectId: string }) {
  const { events, isConnected, clearEvents } = useProgress(
    projectId,
    (event) => {
      console.log('項目事件:', event);
    }
  );

  // 事件統計
  const taskEvents = events.filter(e => e.type.startsWith('task_'));
  const workflowEvents = events.filter(e => e.type.startsWith('workflow_'));
  const containerEvents = events.filter(e => e.type.startsWith('container_'));

  return (
    <div>
      <h2>項目監控</h2>
      <p>項目 ID: {projectId}</p>
      <p>連接狀態: {isConnected ? '已連接' : '未連接'}</p>

      <div className="stats">
        <div>任務事件: {taskEvents.length}</div>
        <div>工作流事件: {workflowEvents.length}</div>
        <div>容器事件: {containerEvents.length}</div>
      </div>

      <div>
        <h3>最近事件</h3>
        <ul>
          {events.slice(-10).map((event, index) => (
            <li key={index}>
              <span>{event.type}</span>
              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              {event.data && <pre>{JSON.stringify(event.data, null, 2)}</pre>}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={clearEvents}>清除事件</button>
    </div>
  );
}
```

## 使用進度追蹤組件

SDK 提供了預構建的進度追蹤組件：

### ProgressTracker 組件

```tsx
import { ProgressTracker } from '@aintandem/sdk-react/components';

function TaskMonitor({ projectId, taskId }: { projectId: string; taskId: string }) {
  return (
    <ProgressTracker
      projectId={projectId}
      taskId={taskId}
      showEvents={true}
      maxEvents={50}
      loadingMessage="正在連接..."
      emptyMessage="暫無進度事件"
    />
  );
}
```

### CompactProgressTracker 組件

```tsx
import { CompactProgressTracker } from '@aintandem/sdk-react/components';

function TaskCard({ projectId, taskId }: { projectId: string; taskId: string }) {
  return (
    <div className="task-card">
      <h3>任務執行中</h3>
      <CompactProgressTracker
        projectId={projectId}
        taskId={taskId}
      />
    </div>
  );
}
```

### 自定義進度顯示

```tsx
import { useTaskProgress, ProgressBar, CircularProgress } from '@aintandem/sdk-react';

function CustomTaskProgress({ projectId, taskId }: { projectId: string; taskId: string }) {
  const { events, isConnected } = useTaskProgress(projectId, taskId);

  // 獲取最新進度
  const progressEvents = events.filter(e => e.type === 'task_progress');
  const latestProgress = progressEvents[progressEvents.length - 1];
  const progress = latestProgress?.data.percent || 0;

  // 獲取當前狀態
  const latestEvent = events[events.length - 1];
  const status = latestEvent?.type || 'unknown';

  return (
    <div className="custom-progress">
      <div className="header">
        <h3>任務進度</h3>
        <span className={`status ${status}`}>
          {status === 'task_completed' && '✅ 已完成'}
          {status === 'task_failed' && '❌ 失敗'}
          {status === 'task_running' && '🔄 執行中'}
          {status === 'task_pending' && '⏳ 等待中'}
        </span>
      </div>

      <div className="progress-bars">
        <div className="linear-progress">
          <ProgressBar value={progress} showLabel />
        </div>

        <div className="circular-progress">
          <CircularProgress value={progress} size={120} />
        </div>
      </div>

      {latestProgress && (
        <div className="details">
          <p>當前步驟: {latestProgress.data.currentStep}</p>
          <p>總步驟: {latestProgress.data.totalSteps}</p>
          <p>預估剩餘時間: {latestProgress.data.estimatedTimeRemaining || '計算中...'}</p>
        </div>
      )}

      {!isConnected && (
        <div className="warning">
          ⚠️ 連接中斷，正在重新連接...
        </div>
      )}
    </div>
  );
}
```

## 事件類型詳解

### TaskEvent（任務事件）

```typescript
type TaskEvent =
  | TaskStartedEvent
  | TaskProgressEvent
  | TaskCompletedEvent
  | TaskFailedEvent;

// 任務開始
interface TaskStartedEvent {
  type: 'task_started';
  timestamp: string;
  projectId: string;
  taskId: string;
  data: {
    taskName: string;
    input: any;
  };
}

// 任務進度
interface TaskProgressEvent {
  type: 'task_progress';
  timestamp: string;
  projectId: string;
  taskId: string;
  data: {
    percent: number;           // 0-100
    currentStep: string;
    totalSteps: number;
    message?: string;
    estimatedTimeRemaining?: number; // 秒
  };
}

// 任務完成
interface TaskCompletedEvent {
  type: 'task_completed';
  timestamp: string;
  projectId: string;
  taskId: string;
  data: {
    output: any;
    duration: number; // 毫秒
  };
}

// 任務失敗
interface TaskFailedEvent {
  type: 'task_failed';
  timestamp: string;
  projectId: string;
  taskId: string;
  data: {
    error: string;
    errorCode?: string;
    stackTrace?: string;
  };
}
```

### WorkflowEvent（工作流事件）

```typescript
type WorkflowEvent =
  | WorkflowStartedEvent
  | PhaseStartedEvent
  | PhaseCompletedEvent
  | StepStartedEvent
  | StepCompletedEvent
  | WorkflowCompletedEvent
  | WorkflowFailedEvent;

// 工作流開始
interface WorkflowStartedEvent {
  type: 'workflow_started';
  timestamp: string;
  projectId: string;
  workflowId: string;
  executionId: string;
  data: {
    input: any;
    totalPhases: number;
    totalSteps: number;
  };
}

// 階段開始
interface PhaseStartedEvent {
  type: 'phase_started';
  timestamp: string;
  projectId: string;
  workflowId: string;
  executionId: string;
  data: {
    phaseId: string;
    phaseName: string;
    stepCount: number;
  };
}

// 階段完成
interface PhaseCompletedEvent {
  type: 'phase_completed';
  timestamp: string;
  projectId: string;
  workflowId: string;
  executionId: string;
  data: {
    phaseId: string;
    phaseName: string;
    duration: number;
  };
}

// 步驟開始
interface StepStartedEvent {
  type: 'step_started';
  timestamp: string;
  projectId: string;
  workflowId: string;
  executionId: string;
  data: {
    stepId: string;
    stepName: string;
    taskName: string;
  };
}

// 步驟完成
interface StepCompletedEvent {
  type: 'step_completed';
  timestamp: string;
  projectId: string;
  workflowId: string;
  executionId: string;
  data: {
    stepId: string;
    stepName: string;
    duration: number;
    output?: any;
  };
}

// 工作流完成
interface WorkflowCompletedEvent {
  type: 'workflow_completed';
  timestamp: string;
  projectId: string;
  workflowId: string;
  executionId: string;
  data: {
    output: any;
    duration: number;
    completedPhases: number;
    completedSteps: number;
  };
}

// 工作流失敗
interface WorkflowFailedEvent {
  type: 'workflow_failed';
  timestamp: string;
  projectId: string;
  workflowId: string;
  executionId: string;
  data: {
    error: string;
    failedPhase?: string;
    failedStep?: string;
  };
}
```

## 完整範例

### 核心 SDK 進度追蹤

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

class ProgressTracker {
  private client: AInTandemClient;

  constructor() {
    this.client = new AInTandemClient({
      baseURL: 'https://api.aintandem.com',
    });
  }

  // 追蹤任務並等待完成
  async trackTask(projectId: string, taskId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let completed = false;

      this.client.subscribeToTask(
        projectId,
        taskId,
        (event) => {
          if (!completed) {
            console.log(`[${event.type}]`, event.data);
          }
        },
        (event) => {
          completed = true;
          console.log('任務完成:', event.output);
          resolve(event.output);
        },
        (event) => {
          completed = true;
          console.error('任務失敗:', event.error);
          reject(new Error(event.error));
        }
      );
    });
  }

  // 追蹤工作流並等待完成
  async trackWorkflow(
    projectId: string,
    workflowId: string,
    executionId: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let completed = false;

      this.client.subscribeToWorkflow(
        projectId,
        workflowId,
        executionId,
        (event) => {
          if (!completed) {
            console.log(`[${event.type}]`, event.data);
          }
        },
        (event) => {
          completed = true;
          console.log('工作流完成:', event.output);
          resolve(event.output);
        },
        (event) => {
          completed = true;
          console.error('工作流失敗:', event.error);
          reject(new Error(event.error));
        }
      );
    });
  }
}

// 使用
const tracker = new ProgressTracker();

const result = await tracker.trackTask('project-123', 'task-id');
console.log('最終結果:', result);
```

### React 進度追蹤介面

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';
import { useTaskProgress, useExecuteTask } from '@aintandem/sdk-react';
import { ProgressTracker } from '@aintandem/sdk-react/components';

function App() {
  return (
    <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
      <TaskMonitor />
    </AInTandemProvider>
  );
}

function TaskMonitor() {
  const projectId = 'project-123';
  const { execute, task } = useExecuteTask(
    projectId,
    'data-analysis',
    { dataset: 'sales-2024' }
  );

  return (
    <div>
      <button onClick={execute} disabled={!!task}>
        {task ? '任務執行中' : '執行任務'}
      </button>

      {task && (
        <ProgressTracker
          projectId={projectId}
          taskId={task.id}
          showEvents
        />
      )}
    </div>
  );
}
```

## 連接狀態管理

### 處理連接中斷

```typescript
import { useTaskProgress } from '@aintandem/sdk-react';

function RobustTaskProgress({ projectId, taskId }: { projectId: string; taskId: string }) {
  const { events, isConnected, clearEvents } = useTaskProgress(projectId, taskId);

  return (
    <div>
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="dot" />
        <span>{isConnected ? '已連接' : '連接中斷 - 正在重新連接...'}</span>
      </div>

      {!isConnected && (
        <div className="warning">
          ⚠️ 實時更新暫時不可用，請稍候或刷新頁面
        </div>
      )}

      {/* 事件列表 */}
      <ul>
        {events.map((event, index) => (
          <li key={index}>{event.type}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 下一步

- [任務執行](./tasks.md) - 了解如何執行任務
- [工作流管理](./workflows.md) - 了解如何管理工作流

## 常見問題

### Q: WebSocket 連接會自動重連嗎？

是的，SDK 會自動嘗試重新連接。

### Q: 如何知道進度訂閱已失敗？

使用 `isConnected` 狀態或監聽錯誤回調。

### Q: 可以同時訂閱多個任務嗎？

可以。每個訂閱都是獨立的。

### Q: 事件歷史會保存多久？

事件存儲在內存中，組件卸載時會清除。可以手動調用 `clearEvents()` 清除。

---

**祝您使用愉快！** 📡
