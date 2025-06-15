
import { createServiceClient } from './auth.ts';
import { corsHeaders } from './cors.ts';

export const validateRequest = (req: Request) => {
  // Check content type for POST requests
  if (req.method === 'POST' && !req.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Invalid content type');
  }
  
  // Check authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  return authHeader;
};

export const rateLimitCheck = async (identifier: string, maxRequests = 100, windowMs = 60000) => {
  // Simple rate limiting - in production, use Redis or similar
  const key = `rate_limit_${identifier}`;
  const now = Date.now();
  
  // This is a simplified implementation
  // In production, implement proper rate limiting with persistent storage
  return true; // Allow for now, implement proper rate limiting as needed
};

export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

export const createSecureResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  });
};

export const createErrorResponse = (message: string, status = 400) => {
  // Don't expose internal error details in production
  const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
  const errorMessage = isProduction && status >= 500 ? 'Internal server error' : message;
  
  return createSecureResponse({ error: errorMessage }, status);
};

export const logSecurityEvent = async (
  userId: string | null,
  action: string,
  resourceType: string,
  success: boolean,
  metadata?: any,
  errorMessage?: string
) => {
  const supabase = createServiceClient();
  
  try {
    await supabase.from('security_audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      success,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
      error_message: errorMessage,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
