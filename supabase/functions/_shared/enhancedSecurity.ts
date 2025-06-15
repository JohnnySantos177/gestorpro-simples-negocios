
import { createServiceClient } from './auth.ts';
import { corsHeaders } from './cors.ts';

interface SecurityHeaders {
  [key: string]: string;
}

export const enhancedSecurity = {
  getSecurityHeaders: (): SecurityHeaders => ({
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }),

  validateRequest: (req: Request): { valid: boolean; error?: string } => {
    try {
      // Check content type for POST requests
      if (req.method === 'POST') {
        const contentType = req.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          return { valid: false, error: 'Invalid content type' };
        }
      }
      
      // Check authorization header for authenticated endpoints
      const authHeader = req.headers.get('Authorization');
      if (req.url.includes('/protected/') && (!authHeader || !authHeader.startsWith('Bearer '))) {
        return { valid: false, error: 'Missing or invalid authorization header' };
      }
      
      // Check for suspicious user agents
      const userAgent = req.headers.get('User-Agent');
      if (!userAgent || userAgent.length > 500) {
        return { valid: false, error: 'Invalid user agent' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Request validation failed' };
    }
  },

  rateLimitCheck: async (identifier: string, maxRequests = 100, windowMs = 60000): Promise<{ allowed: boolean; remaining: number }> => {
    // Enhanced rate limiting with more sophisticated tracking
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // In a production environment, this would use Redis or similar persistent storage
    // For now, implement basic in-memory rate limiting
    const requests = globalThis.rateLimitStore || new Map();
    globalThis.rateLimitStore = requests;
    
    const userRequests = requests.get(key) || [];
    const validRequests = userRequests.filter((timestamp: number) => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    
    return { allowed: true, remaining: maxRequests - validRequests.length };
  },

  sanitizeInput: (input: any): any => {
    if (typeof input === 'string') {
      return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .slice(0, 10000); // Prevent DoS through large inputs
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (typeof key === 'string' && key.length < 100) { // Limit key length
          sanitized[key] = enhancedSecurity.sanitizeInput(value);
        }
      }
      return sanitized;
    }
    
    return input;
  },

  createSecureResponse: (data: any, status = 200): Response => {
    const headers = enhancedSecurity.getSecurityHeaders();
    
    return new Response(JSON.stringify(data), {
      status,
      headers
    });
  },

  createErrorResponse: (message: string, status = 400): Response => {
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
    const errorMessage = isProduction && status >= 500 ? 'Internal server error' : message;
    
    return enhancedSecurity.createSecureResponse({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, status);
  },

  logSecurityEvent: async (
    userId: string | null,
    action: string,
    resourceType: string,
    success: boolean,
    metadata?: any,
    errorMessage?: string,
    request?: Request
  ): Promise<void> => {
    const supabase = createServiceClient();
    
    try {
      const securityMetadata = {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: request?.headers.get('user-agent'),
        ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip'),
        method: request?.method,
        url: request?.url
      };

      await supabase.from('security_audit_logs').insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        success,
        metadata: securityMetadata,
        error_message: errorMessage,
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  },

  validateJWT: async (token: string): Promise<{ valid: boolean; userId?: string }> => {
    try {
      const supabase = createServiceClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return { valid: false };
      }
      
      return { valid: true, userId: user.id };
    } catch (error) {
      console.error('JWT validation error:', error);
      return { valid: false };
    }
  }
};
