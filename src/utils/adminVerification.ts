
import { supabase } from "@/integrations/supabase/client";

export const verifyAdminSecure = async (userId: string): Promise<boolean> => {
  try {
    // Use database function for secure admin verification
    const { data: isAdminResult, error } = await supabase
      .rpc('is_admin_secure', { user_id: userId });
    
    if (error) {
      console.error("Admin verification error:", error);
      return false;
    }
    
    return Boolean(isAdminResult);
  } catch (error) {
    console.error("Admin verification failed:", error);
    return false;
  }
};

export const requireAdmin = async (userId: string): Promise<void> => {
  const isAdmin = await verifyAdminSecure(userId);
  if (!isAdmin) {
    throw new Error("Acesso negado: privilégios de administrador necessários");
  }
};

// Enhanced admin check with audit logging
export const verifyAdminWithAudit = async (userId: string, action: string): Promise<boolean> => {
  const isAdmin = await verifyAdminSecure(userId);
  
  // Log admin verification attempt
  await supabase.from('security_audit_logs').insert({
    user_id: userId,
    action: 'admin_verification',
    resource_type: 'authorization',
    success: isAdmin,
    metadata: { 
      requested_action: action,
      verification_result: isAdmin 
    }
  });
  
  return isAdmin;
};
