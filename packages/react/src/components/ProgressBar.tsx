/**
 * Progress Bar Component
 *
 * Linear and circular progress bars.
 */

import { type ReactNode } from 'react';

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label */
  label?: ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Strip animation */
  striped?: boolean;
  /** Animated stripes */
  animated?: boolean;
}

/**
 * Linear Progress Bar
 *
 * @example
 * ```tsx
 * import { ProgressBar } from '@aintandem/sdk-react';
 *
 * function MyComponent() {
 *   return <ProgressBar value={75} showLabel />;
 * }
 * ```
 */
export function ProgressBar({
  value,
  size = 'medium',
  color = 'primary',
  showLabel = false,
  label,
  className = '',
  indeterminate = false,
  striped = false,
  animated = false,
}: ProgressBarProps) {
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-4',
  };

  const colorClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const width = indeterminate ? '100%' : `${Math.min(100, Math.max(0, value))}%`;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {label || `${Math.round(value)}%`}
          </span>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${
            striped ? 'bg-stripes' : ''
          } ${animated ? 'animate-pulse' : ''} transition-all duration-300 ease-out`}
          style={{
            width: indeterminate ? '100%' : width,
            animation: indeterminate ? 'progress-indeterminate 1.5s infinite' : undefined,
          }}
        />
      </div>
    </div>
  );
}

export interface CircularProgressProps {
  /** Progress value (0-100) */
  value: number;
  /** Size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Indeterminate state */
  indeterminate?: boolean;
}

/**
 * Circular Progress Bar
 *
 * @example
 * ```tsx
 * import { CircularProgress } from '@aintandem/sdk-react';
 *
 * function MyComponent() {
 *   return <CircularProgress value={75} showLabel />;
 * }
 * ```
 */
export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 4,
  color = 'primary',
  showLabel = false,
  className = '',
  indeterminate = false,
}: CircularProgressProps) {
  const colorClasses = {
    primary: 'text-blue-500',
    secondary: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = indeterminate
    ? circumference * 0.25
    : circumference - (value / 100) * circumference;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className={colorClasses[color]}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-25"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-300 ease-out ${
            indeterminate ? 'animate-spin' : ''
          }`}
          style={{
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>
      {showLabel && !indeterminate && (
        <span
          className="absolute text-xs font-medium"
          style={{ fontSize: size * 0.3 }}
        >
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
