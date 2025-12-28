# Real-time Progress Tracking Example

這是一個專注於展示實時進度追蹤功能的範例。

## 功能展示

本範例重點展示：

1. **WebSocket 連接管理** - 自動連接和重連
2. **任務進度追蹤** - useTaskProgress hook
3. **工作流進度追蹤** - useWorkflowProgress hook
4. **容器進度追蹤** - useContainerProgress hook
5. **項目進度監控** - useProgress hook
6. **進度組件** - ProgressBar, CircularProgress, ProgressTracker
7. **連接狀態** - isConnected 監控
8. **事件管理** - 事件累積和清除

## 快速開始

### 安裝依賴

```bash
pnpm install
```

### 運行範例

```bash
# React 範例（推薦）
cd ../react-app
pnpm dev

# 或使用基礎範例
cd ../basic-usage
pnpm dev
```

## 關鍵概念

### 1. 進度追蹤基礎

```typescript
import { useTaskProgress } from '@aintandem/sdk-react';

function MyComponent() {
  const { events, isConnected, clearEvents } = useTaskProgress(
    projectId,
    taskId,
    {
      onEvent: (event) => console.log('Event:', event),
      onComplete: (event) => console.log('Complete:', event.output),
      onFailed: (event) => console.error('Failed:', event.error),
    }
  );

  return (
    <div>
      <p>連接狀態: {isConnected ? '已連接' : '未連接'}</p>
      <p>事件數量: {events.length}</p>
      <button onClick={clearEvents}>清除事件</button>
    </div>
  );
}
```

### 2. 進度組件使用

```typescript
import { ProgressTracker } from '@aintandem/sdk-react/components';

<ProgressTracker
  projectId={projectId}
  taskId={taskId}
  showEvents={true}
  maxEvents={50}
  loadingMessage="載入中..."
  emptyMessage="暫無事件"
/>
```

### 3. 自定義進度顯示

```typescript
import { useTaskProgress, ProgressBar } from '@aintandem/sdk-react';

function CustomProgress({ projectId, taskId }) {
  const { events, isConnected } = useTaskProgress(projectId, taskId);

  // 提取進度事件
  const progressEvents = events.filter(e => e.type === 'task_progress');
  const latestProgress = progressEvents[progressEvents.length - 1];
  const progress = latestProgress?.data.percent || 0;

  return (
    <div>
      <p>連接: {isConnected ? '✅' : '❌'}</p>
      <ProgressBar value={progress} showLabel />
      <p>{progress.toFixed(0)}%</p>
    </div>
  );
}
```

## 事件類型

### TaskEvent

```typescript
type TaskEvent =
  | TaskStartedEvent          // 任務開始
  | TaskProgressEvent         // 進度更新
  | TaskCompletedEvent        // 任務完成
  | TaskFailedEvent;          // 任務失敗

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
  };
}
```

### WorkflowEvent

```typescript
type WorkflowEvent =
  | WorkflowStartedEvent       // 工作流開始
  | PhaseStartedEvent          // 階段開始
  | PhaseCompletedEvent        // 階段完成
  | StepStartedEvent           // 步驟開始
  | StepCompletedEvent         // 步驟完成
  | WorkflowCompletedEvent     // 工作流完成
  | WorkflowFailedEvent;       // 工作流失敗
```

## 進階用法

### 1. 監控多個任務

```typescript
function MultiTaskMonitor({ projectIds, taskIds }) {
  // 為每個任務創建監控器
  return (
    <div>
      {taskIds.map(taskId => (
        <ProgressTracker
          key={taskId}
          projectId={projectIds[0]}
          taskId={taskId}
          showEvents
        />
      ))}
    </div>
  );
}
```

### 2. 聚合進度

```typescript
function AggregateProgress({ workflows }) {
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    // 計算所有工作流的總進度
    const calculateProgress = () => {
      // Your logic here
    };

    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, [workflows]);

  return (
    <CircularProgress value={totalProgress} size={200} />
  );
}
```

### 3. 事件過濾

```typescript
function FilteredEvents({ projectId, taskId }) {
  const { events } = useTaskProgress(projectId, taskId);

  // 只顯示進度事件
  const progressEvents = events.filter(e => e.type === 'task_progress');

  // 只顯示最近 10 個事件
  const recentEvents = events.slice(-10);

  return (
    <div>
      <h3>進度事件 ({progressEvents.length})</h3>
      <ul>
        {progressEvents.map((event, i) => (
          <li key={i}>
            {event.data.percent}% - {event.data.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. 連接狀態處理

```typescript
function ConnectionStatus() {
  const { isConnected } = useTaskProgress(projectId, taskId);

  return (
    <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? (
        <span>✅ 實時連接正常</span>
      ) : (
        <span>⚠️ 連接中斷，正在重新連接...</span>
      )}
    </div>
  );
}
```

## 實際應用場景

### 1. 數據處理任務

```typescript
function DataProcessingTask({ projectId }) {
  const { execute, task } = useExecuteTask(
    projectId,
    'data-processing',
    { dataset: 'sales-2024' }
  );

  return (
    <div>
      <button onClick={execute}>開始處理</button>
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

### 2. 模型訓練監控

```typescript
function ModelTrainingMonitor({ projectId, taskId }) {
  const { events } = useTaskProgress(projectId, taskId);

  const trainingEvents = events.filter(e =>
    e.type === 'task_progress' && e.data.currentStep === 'training'
  );

  const latestMetrics = trainingEvents[trainingEvents.length - 1]?.data;

  return (
    <div>
      <h3>訓練進度</h3>
      <ProgressBar value={latestMetrics?.percent || 0} />
      {latestMetrics && (
        <div>
          <p>Loss: {latestMetrics.loss}</p>
          <p>Accuracy: {latestMetrics.accuracy}</p>
          <p>Epoch: {latestMetrics.epoch}/{latestMetrics.totalEpochs}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. 批量任務監控

```typescript
function BatchTaskMonitor({ projectId, taskIds }) {
  return (
    <div>
      <h2>批量任務 ({taskIds.length})</h2>
      <div className="task-grid">
        {taskIds.map(taskId => (
          <div key={taskId} className="task-card">
            <h4>Task {taskId.slice(-6)}</h4>
            <CompactProgressTracker
              projectId={projectId}
              taskId={taskId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 性能優化

### 1. 事件數量限制

```typescript
// 只保留最近 100 個事件
const { events } = useTaskProgress(projectId, taskId);
const recentEvents = events.slice(-100);
```

### 2. 組件卸載時清理

```typescript
// Hook 會自動清理，無需手動處理
// useTaskProgress 在組件卸載時會自動取消訂閱
```

### 3. 減少重渲染

```typescript
import { useMemo } from 'react';

function OptimizedProgress({ projectId, taskId }) {
  const { events } = useTaskProgress(projectId, taskId);

  // 使用 useMemo 減少計算
  const progress = useMemo(() => {
    const progressEvents = events.filter(e => e.type === 'task_progress');
    return progressEvents[progressEvents.length - 1]?.data.percent || 0;
  }, [events]);

  return <ProgressBar value={progress} />;
}
```

## 故障排除

### 問題：無法連接 WebSocket

**原因**：
- 網絡問題
- 服務器不可用
- 防火牆阻止

**解決**：
1. 檢查網絡連接
2. 驗證 WebSocket URL
3. 查看瀏覽器控制台錯誤

### 問題：事件不更新

**原因**：
- 任務已完成/失敗
- WebSocket 斷開

**解決**：
1. 檢查任務狀態
2. 查看 isConnected 狀態
3. 刷新頁面重新連接

### 問題：記憶體洩漏

**原因**：
- 事件無限累積

**解決**：
```typescript
// 定期清除事件
useEffect(() => {
  const interval = setInterval(() => {
    clearEvents();
  }, 60000); // 每分鐘清除

  return () => clearInterval(interval);
}, []);
```

## 下一步

1. 查看 [React 應用範例](../react-app/) - 完整的應用展示
2. 查看 [基礎使用範例](../basic-usage/) - 核心 SDK 使用
3. 閱讀 [實時進度追蹤指南](../../docs/guides/real-time-progress.md)

## 授權

MIT © AInTandem
