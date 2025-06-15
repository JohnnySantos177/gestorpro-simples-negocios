
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
}

export const useSecurityAudit = () => {
  const logSecurityEvent = useCallback(async (entry: AuditLogEntry) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('security_audit_logs').insert({
        user_id: user?.id || null,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        success: entry.success,
        error_message: entry.error_message,
        metadata: {
          ...entry.metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          ip_address: await getClientIP(),
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  const logAuthAttempt = useCallback(async (action: string, success: boolean, error?: string) => {
    await logSecurityEvent({
      action: `auth_${action}`,
      resource_type: 'authentication',
      success,
      error_message: error,
    });
  }, [logSecurityEvent]);

  const logDataAccess = useCallback(async (resource: string, action: string, resourceId?: string) => {
    await logSecurityEvent({
      action: `data_${action}`,
      resource_type: resource,
      resource_id: resourceId,
      success: true,
    });
  }, [logSecurityEvent]);

  return { logSecurityEvent, logAuthAttempt, logDataAccess };
};

// Helper function to get client IP (best effort)
const getClientIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
};
