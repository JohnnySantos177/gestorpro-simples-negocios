
import { supabase } from "@/integrations/supabase/client";
import { validateEmail, validatePassword, sanitizeInput, validateUUID } from "@/utils/inputValidation";

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export const enhancedSecurityService = {
  // Enhanced input validation with comprehensive sanitization
  validateAndSanitizeInput: (data: Record<string, any>): SecurityValidationResult => {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        const sanitized = sanitizeInput(value);
        
        // Check for potential XSS patterns
        if (sanitized !== value) {
          console.warn(`Potential XSS attempt detected in field: ${key}`);
        }
        
        sanitizedData[key] = sanitized;
        
        // Validate specific field types
        if (key.includes('email') && !validateEmail(sanitized)) {
          errors.push(`Invalid email format for ${key}`);
        }
        
        if (key.includes('password') && !validatePassword(sanitized).valid) {
          errors.push(`Invalid password format for ${key}`);
        }
        
        if (key.includes('id') && sanitized && !validateUUID(sanitized)) {
          errors.push(`Invalid UUID format for ${key}`);
        }
      } else {
        sanitizedData[key] = value;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    };
  },

  // Enhanced session validation
  validateSession: async (): Promise<{ valid: boolean; user: any | null }> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return { valid: false, user: null };
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        await supabase.auth.signOut();
        return { valid: false, user: null };
      }

      // Validate user exists in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.status !== 'active') {
        await supabase.auth.signOut();
        return { valid: false, user: null };
      }

      return { valid: true, user: session.user };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, user: null };
    }
  },

  // Enhanced admin verification
  verifyAdminAccess: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('is_admin_secure', { user_id: userId });

      if (error) {
        console.error('Admin verification error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  },

  // Security audit logging
  logSecurityEvent: async (event: {
    action: string;
    resourceType: string;
    resourceId?: string;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('security_audit_logs').insert({
        user_id: user?.id || null,
        action: event.action,
        resource_type: event.resourceType,
        resource_id: event.resourceId,
        success: event.success,
        error_message: event.errorMessage,
        metadata: {
          ...event.metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  },

  // CSRF token generation and validation
  generateCSRFToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  validateCSRFToken: (token: string, expectedToken: string): boolean => {
    if (!token || !expectedToken || token.length !== expectedToken.length) {
      return false;
    }
    
    // Timing-safe comparison
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
    }
    
    return result === 0;
  }
};
