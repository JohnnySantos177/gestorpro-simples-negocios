
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to security audit in production
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      import('@/integrations/supabase/client').then(({ supabase }) => {
        supabase.from('security_audit_logs').insert({
          user_id: null,
          action: 'client_error',
          resource_type: 'application',
          success: false,
          error_message: error.message,
          metadata: {
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href
          }
        });
      });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado. Nossa equipe foi notificada.
            </p>
            <div className="space-y-2">
              <Button onClick={this.handleReset} className="w-full">
                Tentar Novamente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Recarregar Página
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left text-sm">
                <summary className="cursor-pointer text-red-600">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
