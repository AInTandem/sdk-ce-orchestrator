/**
 * Error Boundary Component
 *
 * Catches React errors and displays fallback UI.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';

export interface ErrorBoundaryProps {
  /** Children components */
  children: ReactNode;
  /** Fallback UI when error occurs */
  fallback?: ReactNode;
  /** Error message component */
  fallbackRender?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom error message */
  errorMessage?: string;
  /** Show error details */
  showErrorDetails?: boolean;
  /** Custom CSS class */
  className?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * import { ErrorBoundary } from '@aintandem/sdk-react/components';
 *
 * function App() {
 *   return (
 *     <ErrorBoundary
 *       fallback={<div>Something went wrong</div>}
 *       onError={(error, errorInfo) => console.error(error, errorInfo)}
 *     >
 *       <YourApp />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback renderer
      if (this.props.fallbackRender && this.state.error) {
        return this.props.fallbackRender(this.state.error, {
          componentStack: ''
        } as ErrorInfo);
      }

      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const { errorMessage = 'Something went wrong', showErrorDetails = false, className = '' } = this.props;

      return (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.932-3.125L11.693 7H9.068c-.67 1.458-2.393 3.125-3.933 3.125H5.064c-.67 0-1.092-.567-1.092-1.25V7c0-.683.422-1.25 1.092-1.25h2.167c1.54 0 2.502-1.667 1.932-3.125L11.693 3H9.068c-.67 1.458-2.393 3.125-3.933 3.125H5.064c-.67 0-1.092-.567-1.092-1.25V3c0-.683.422-1.25 1.092-1.25h2.167z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800">{errorMessage}</h3>
              {showErrorDetails && this.state.error && (
                <div className="mt-2">
                  <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </p>
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                      Component Stack
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-40">
                      {this.state.error.stack || 'No stack trace available'}
                    </pre>
                  </details>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
