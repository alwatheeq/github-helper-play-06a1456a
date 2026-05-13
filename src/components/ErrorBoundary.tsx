import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ErrorLogger } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to ErrorLogger with context
    ErrorLogger.error(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorName: error.name,
        errorMessage: error.message,
      },
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
          <div className="bg-card-light dark:bg-card-dark rounded-[12px] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border border-divider dark:border-divider-on-dark dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark: p-8 max-w-2xl w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-orange-100 p-3 rounded-full dark:bg-orange-900/30">
                <AlertTriangle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
            </div>

            <h1 className="font-display text-[24px] font-bold text-ink dark:text-ink-on-dark text-center mb-4">
              {this.props.fallbackMessage || 'Something went wrong'}
            </h1>

            <p className="text-secondary-ink dark:text-muted-ink-on-dark text-center mb-6">
              The application encountered an unexpected error. This has been logged for review.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-subtle dark:bg-card-dark rounded-[12px] p-4 mb-6 max-h-64 overflow-auto">
                <h2 className="font-semibold text-ink dark:text-ink-on-dark mb-2">Error Details:</h2>
                <pre className="text-xs text-red-600 whitespace-pre-wrap dark:text-red-400">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-secondary-ink dark:text-muted-ink-on-dark mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={this.handleReset}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-[12px] hover:bg-blue-700 transition duration-150"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center space-x-2 px-6 py-3 bg-subtle dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark rounded-[12px] hover:bg-subtle transition duration-150"
              >
                <Home className="h-5 w-5" />
                <span>Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
