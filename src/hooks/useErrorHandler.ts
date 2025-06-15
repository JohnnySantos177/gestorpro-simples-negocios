
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToAudit?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback(async (
    error: Error | unknown,
    context: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logToAudit = true,
      fallbackMessage = 'Ocorreu um erro inesperado'
    } = options;

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`Error in ${context}:`, error);

    if (showToast) {
      toast.error(errorMessage || fallbackMessage);
    }

    if (logToAudit) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from('security_audit_logs').insert({
          user_id: user?.id || null,
          action: 'client_error',
          resource_type: context,
          success: false,
          error_message: errorMessage,
          metadata: {
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        });
      } catch (auditError) {
        console.error('Failed to log error to audit:', auditError);
      }
    }
  }, []);

  const handleAsyncError = useCallback((
    asyncFn: () => Promise<void>,
    context: string,
    options?: ErrorHandlerOptions
  ) => {
    return async () => {
      try {
        await asyncFn();
      } catch (error) {
        await handleError(error, context, options);
      }
    };
  }, [handleError]);

  return { handleError, handleAsyncError };
};
