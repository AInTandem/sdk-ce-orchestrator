# Real-time Progress Tracking Example

This is an example focused on demonstrating real-time progress tracking functionality.

## Features Demonstrated

This example focuses on:

1. **WebSocket Connection Management** - Automatic connection and reconnection
2. **Task Progress Tracking** - useTaskProgress hook
3. **Workflow Progress Tracking** - useWorkflowProgress hook
4. **Container Progress Tracking** - useContainerProgress hook
5. **Project Progress Monitoring** - useProgress hook
6. **Progress Components** - ProgressBar, CircularProgress, ProgressTracker
7. **Connection Status** - isConnected monitoring
8. **Event Management** - Event accumulation and clearing

## Quick Start

### Install Dependencies

```bash
pnpm install
```

### Run Example

```bash
# React example (recommended)
cd ../react-app
pnpm dev

# Or use basic example
cd ../basic-usage
pnpm dev
```

## Key Concepts

### 1. Progress Tracking Basics

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
      <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Event Count: {events.length}</p>
      <button onClick={clearEvents}>Clear Events</button>
    </div>
  );
}
```

### 2. Progress Component Usage

```typescript
import { ProgressTracker } from '@aintandem/sdk-react/components';

<ProgressTracker
  projectId={projectId}
  taskId={taskId}
  showEvents={true}
  maxEvents={50}
  loadingMessage="Loading..."
  emptyMessage="No events"
/>
```

### 3. Custom Progress Display

```typescript
import { useTaskProgress, ProgressBar } from '@aintandem/sdk-react';

function CustomProgress({ projectId, taskId }) {
  const { events, isConnected } = useTaskProgress(projectId, taskId);

  // Extract progress events
  const progressEvents = events.filter(e => e.type === 'task_progress');
  const latestProgress = progressEvents[progressEvents.length - 1];
  const progress = latestProgress?.data.percent || 0;

  return (
    <div>
      <p>Connection: {isConnected ? '✅' : '❌'}</p>
      <ProgressBar value={progress} showLabel />
      <p>{progress.toFixed(0)}%</p>
    </div>
  );
}
```

## Event Types

### TaskEvent

```typescript
type TaskEvent =
  | TaskStartedEvent          // Task started
  | TaskProgressEvent         // Progress update
  | TaskCompletedEvent        // Task completed
  | TaskFailedEvent;          // Task failed

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
  | WorkflowStartedEvent       // Workflow started
  | PhaseStartedEvent          // Phase started
  | PhaseCompletedEvent        // Phase completed
  | StepStartedEvent           // Step started
  | StepCompletedEvent         // Step completed
  | WorkflowCompletedEvent     // Workflow completed
  | WorkflowFailedEvent;       // Workflow failed
```

## Advanced Usage

### 1. Monitor Multiple Tasks

```typescript
function MultiTaskMonitor({ projectIds, taskIds }) {
  // Create monitor for each task
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

### 2. Aggregate Progress

```typescript
function AggregateProgress({ workflows }) {
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    // Calculate total progress for all workflows
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

### 3. Event Filtering

```typescript
function FilteredEvents({ projectId, taskId }) {
  const { events } = useTaskProgress(projectId, taskId);

  // Show only progress events
  const progressEvents = events.filter(e => e.type === 'task_progress');

  // Show only last 10 events
  const recentEvents = events.slice(-10);

  return (
    <div>
      <h3>Progress Events ({progressEvents.length})</h3>
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

### 4. Connection Status Handling

```typescript
function ConnectionStatus() {
  const { isConnected } = useTaskProgress(projectId, taskId);

  return (
    <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? (
        <span>✅ Real-time connection active</span>
      ) : (
        <span>⚠️ Connection lost, reconnecting...</span>
      )}
    </div>
  );
}
```

## Real-world Use Cases

### 1. Data Processing Task

```typescript
function DataProcessingTask({ projectId }) {
  const { execute, task } = useExecuteTask(
    projectId,
    'data-processing',
    { dataset: 'sales-2024' }
  );

  return (
    <div>
      <button onClick={execute}>Start Processing</button>
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

### 2. Model Training Monitoring

```typescript
function ModelTrainingMonitor({ projectId, taskId }) {
  const { events } = useTaskProgress(projectId, taskId);

  const trainingEvents = events.filter(e =>
    e.type === 'task_progress' && e.data.currentStep === 'training'
  );

  const latestMetrics = trainingEvents[trainingEvents.length - 1]?.data;

  return (
    <div>
      <h3>Training Progress</h3>
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

### 3. Batch Task Monitoring

```typescript
function BatchTaskMonitor({ projectId, taskIds }) {
  return (
    <div>
      <h2>Batch Tasks ({taskIds.length})</h2>
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

## Performance Optimization

### 1. Event Count Limitation

```typescript
// Keep only last 100 events
const { events } = useTaskProgress(projectId, taskId);
const recentEvents = events.slice(-100);
```

### 2. Cleanup on Component Unmount

```typescript
// Hook automatically handles cleanup, no manual handling needed
// useTaskProgress automatically unsubscribes on component unmount
```

### 3. Reduce Re-renders

```typescript
import { useMemo } from 'react';

function OptimizedProgress({ projectId, taskId }) {
  const { events } = useTaskProgress(projectId, taskId);

  // Use useMemo to reduce calculations
  const progress = useMemo(() => {
    const progressEvents = events.filter(e => e.type === 'task_progress');
    return progressEvents[progressEvents.length - 1]?.data.percent || 0;
  }, [events]);

  return <ProgressBar value={progress} />;
}
```

## Troubleshooting

### Problem: Cannot connect to WebSocket

**Causes**:
- Network issues
- Server unavailable
- Firewall blocking

**Solutions**:
1. Check network connection
2. Verify WebSocket URL
3. Check browser console errors

### Problem: Events not updating

**Causes**:
- Task completed/failed
- WebSocket disconnected

**Solutions**:
1. Check task status
2. Check isConnected status
3. Refresh page to reconnect

### Problem: Memory leak

**Causes**:
- Events accumulating infinitely

**Solutions**:
```typescript
// Clear events periodically
useEffect(() => {
  const interval = setInterval(() => {
    clearEvents();
  }, 60000); // Clear every minute

  return () => clearInterval(interval);
}, []);
```

## Next Steps

1. Check the [React Application Example](../react-app/) - Complete application showcase
2. Check the [Basic Usage Example](../basic-usage/) - Core SDK usage
3. Read the [Real-time Progress Tracking Guide](../../docs/guides/real-time-progress.md)

## License

MIT © AInTandem
