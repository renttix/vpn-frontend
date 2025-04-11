"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging service
    logger.client.error('React component error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });
    
    this.setState({
      errorInfo,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            We've encountered an error and our team has been notified.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <details className="text-xs">
                <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
                  Error details (development only)
                </summary>
                <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto text-red-800 dark:text-red-200">
                  {this.state.error?.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto text-red-800 dark:text-red-200">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
