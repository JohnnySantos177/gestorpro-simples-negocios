
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { enhancedSecurityService } from '@/services/enhancedSecurityService';
import { toast } from 'sonner';

interface SecurityContextType {
  csrfToken: string;
  sessionValid: boolean;
  validateInput: (data: Record<string, any>) => { isValid: boolean; errors: string[]; sanitizedData?: any };
  logSecurityEvent: (event: any) => Promise<void>;
  checkAdminAccess: (userId: string) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const {
    csrfToken,
    sessionValid,
    validateAndSanitize,
    logSecurityEvent,
    verifyAdminAccess
  } = useEnhancedSecurity();

  const [securityInitialized, setSecurityInitialized] = useState(false);

  useEffect(() => {
    // Initialize security monitoring
    const initSecurity = async () => {
      try {
        // Log application start
        await logSecurityEvent({
          action: 'app_security_initialized',
          resourceType: 'application',
          success: true,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

        setSecurityInitialized(true);
      } catch (error) {
        console.error('Security initialization failed:', error);
        toast.error('Falha na inicialização de segurança');
      }
    };

    initSecurity();
  }, [logSecurityEvent]);

  // Monitor for security events
  useEffect(() => {
    if (!securityInitialized) return;

    // Monitor for potentially malicious activities
    const handleSecurityEvent = (event: Event) => {
      if (event.type === 'error') {
        logSecurityEvent({
          action: 'client_error',
          resourceType: 'application',
          success: false,
          errorMessage: 'Client-side error detected',
          metadata: { eventType: event.type }
        });
      }
    };

    // Monitor for potential XSS attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-allowed')) {
              console.warn('Potential XSS attempt detected');
              logSecurityEvent({
                action: 'potential_xss',
                resourceType: 'dom',
                success: false,
                metadata: { 
                  tagName: element.tagName,
                  innerHTML: element.innerHTML.substring(0, 100)
                }
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('error', handleSecurityEvent);

    return () => {
      observer.disconnect();
      window.removeEventListener('error', handleSecurityEvent);
    };
  }, [securityInitialized, logSecurityEvent]);

  const contextValue: SecurityContextType = {
    csrfToken,
    sessionValid,
    validateInput: validateAndSanitize,
    logSecurityEvent,
    checkAdminAccess: verifyAdminAccess
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};
