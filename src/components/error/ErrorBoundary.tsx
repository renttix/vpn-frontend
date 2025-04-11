"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { event } from "@/lib/analytics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Track error in GA4
    event({
      action: "javascript_error",
      category: "error",
      label: `${this.props.componentName || "unknown"}: ${error.message}`,
    });
    
    // In production, you could also log to your server
    if (process.env.NODE_ENV === "production") {
      // Simple fetch to log error (implement API route later)
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: error.toString(), 
          componentName: this.props.componentName,
          stack: error.stack,
          url: window.location.href 
        }),
      }).catch(console.error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="text-red-600">We're sorry, but there was an error loading this content.</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
