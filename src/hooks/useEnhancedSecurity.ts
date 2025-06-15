
import { useCallback, useEffect, useState } from 'react';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';
import { toast } from 'sonner';

export const useEnhancedSecurity = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [sessionValid, setSessionValid] = useState<boolean>(true);

  // Generate CSRF token on mount
  useEffect(() => {
    const token = enhancedSecurityService.generateCSRFToken();
    setCsrfToken(token);
    sessionStorage.setItem('csrf_token', token);
  }, []);

  // Validate session periodically
  useEffect(() => {
    const validateSession = async () => {
      const { valid } = await enhancedSecurityService.validateSession();
      setSessionValid(valid);
      
      if (!valid) {
        toast.error('Sessão expirada. Faça login novamente.');
      }
    };

    // Validate immediately and then every 5 minutes
    validateSession();
    const interval = setInterval(validateSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const validateAndSanitize = useCallback((data: Record<string, any>) => {
    return enhancedSecurityService.validateAndSanitizeInput(data);
  }, []);

  const logSecurityEvent = useCallback(async (event: {
    action: string;
    resourceType: string;
    resourceId?: string;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }) => {
    await enhancedSecurityService.logSecurityEvent(event);
  }, []);

  const validateCSRF = useCallback((token: string): boolean => {
    const expectedToken = sessionStorage.getItem('csrf_token') || '';
    return enhancedSecurityService.validateCSRFToken(token, expectedToken);
  }, []);

  const verifyAdminAccess = useCallback(async (userId: string): Promise<boolean> => {
    return await enhancedSecurityService.verifyAdminAccess(userId);
  }, []);

  return {
    csrfToken,
    sessionValid,
    validateAndSanitize,
    logSecurityEvent,
    validateCSRF,
    verifyAdminAccess
  };
};
