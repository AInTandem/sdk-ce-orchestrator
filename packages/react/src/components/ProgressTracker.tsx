/**
 * Progress Tracker Component
 *
 * Displays real-time task/workflow progress with event list.
 */

import { useTaskProgress } from '../hooks/useProgress';
import type { TaskEvent } from '@aintandem/sdk-core';
import { ProgressBar } from './ProgressBar';

export interface ProgressTrackerProps {
  /** Project ID */
  projectId: string;
  /** Task ID */
  taskId: string;
  /** Show detailed event list */
  showEvents?: boolean;
  /** Maximum number of events to display */
  maxEvents?: number;
  /** Custom CSS class */
  className?: string;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom empty message */
  emptyMessage?: string;
}

/**
 * Progress Tracker
 *
 * Displays real-time task progress with events.
 *
 * @example
 * ```tsx
 * import { ProgressTracker } from '@aintandem/sdk-react';
 *
 * function TaskMonitor({ projectId, taskId }) {
 *   return (
 *     <ProgressTracker
 *       projectId={projectId}
 *       taskId={taskId}
 *       showEvents
 *       maxEvents={10}
 *     />
 *   );
 * }
 * ```
 */
export function ProgressTracker({
  projectId,
  taskId,
  showEvents = true,
  maxEvents = 50,
  className = '',
  loadingMessage = 'Connecting to progress stream...',
  emptyMessage = 'Waiting for progress updates...',
}: ProgressTrackerProps) {
  const { events, isConnected } = useTaskProgress(projectId, taskId);

  // Get latest progress value
  const latestProgress = events
    .filter((e): e is TaskEvent & { progress: number } => e.type === 'step_progress' && e.progress !== undefined)
    .slice(-1)[0]?.progress || 0;

  // Get latest status
  const latestStatus = events.slice(-1)[0]?.type;

  const displayEvents = events.slice(-maxEvents).reverse();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'task_completed':
        return 'text-green-600 bg-green-50';
      case 'task_failed':
        return 'text-red-600 bg-red-50';
      case 'task_started':
      case 'step_progress':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'task_completed':
        return '✓';
      case 'task_failed':
        return '✗';
      case 'task_started':
        return '▶';
      case 'step_progress':
        return '⋯';
      case 'task_queued':
        return '⋯';
      default:
        return '•';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Task Progress</h3>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {latestStatus !== 'task_completed' && latestStatus !== 'task_failed' && (
        <div className="mb-4">
          <ProgressBar value={latestProgress} showLabel />
        </div>
      )}

      {/* Status Badge */}
      {latestStatus && (
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(latestStatus)}`}
          >
            <span className="mr-1">{getStatusIcon(latestStatus)}</span>
            {latestStatus.replace('task_', '').replace('_', ' ').toUpperCase()}
          </span>
        </div>
      )}

      {/* Events List */}
      {showEvents && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Log</h4>

          {!isConnected && events.length === 0 ? (
            <div className="text-sm text-gray-500 italic">{loadingMessage}</div>
          ) : displayEvents.length === 0 ? (
            <div className="text-sm text-gray-500 italic">{emptyMessage}</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {displayEvents.map((event, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 p-2 rounded ${getStatusColor(event.type)}`}
                >
                  <span className="flex-shrink-0">{getStatusIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {event.type.replace('task_', '').replace('_', ' ').toUpperCase()}
                    </p>
                    {event.type === 'step_progress' && (
                      <>
                        {event.step && (
                          <p className="text-xs text-gray-600">Step: {event.step}</p>
                        )}
                        {event.message && (
                          <p className="text-xs text-gray-600">{event.message}</p>
                        )}
                        {event.progress !== undefined && (
                          <p className="text-xs text-gray-600">Progress: {event.progress}%</p>
                        )}
                      </>
                    )}
                    {event.type === 'task_completed' && event.output != null && (
                      <p className="text-xs text-gray-600 truncate">
                        Output: {typeof event.output === 'string' ? event.output : JSON.stringify(event.output)}
                      </p>
                    )}
                    {event.type === 'task_failed' && event.error && (
                      <p className="text-xs text-red-700">Error: {event.error}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact Progress Tracker
 *
 * Smaller version for tight spaces.
 *
 * @example
 * ```tsx
 * import { CompactProgressTracker } from '@aintandem/sdk-react';
 *
 * function TaskCard({ projectId, taskId }) {
 *   return <CompactProgressTracker projectId={projectId} taskId={taskId} />;
 * }
 * ```
 */
export function CompactProgressTracker(props: Omit<ProgressTrackerProps, 'showEvents'>) {
  return (
    <ProgressTracker
      {...props}
      showEvents={false}
      className={`p-2 ${props.className || ''}`}
    />
  );
}
