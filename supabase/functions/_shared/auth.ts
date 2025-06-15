
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const createServiceClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
};

export const createAnonClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
};

export const verifyUser = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error("Authorization header is required");
  }
  
  const token = authHeader.replace("Bearer ", "");
  const client = createAnonClient();
  const { data } = await client.auth.getUser(token);
  const user = data.user;
  
  if (!user?.email) {
    throw new Error("User not authenticated or email not available");
  }
  
  return user;
};

export const logSecurityEvent = async (
  supabaseClient: any,
  userId: string,
  action: string,
  resourceType: string,
  success: boolean,
  metadata?: any,
  errorMessage?: string
) => {
  try {
    await supabaseClient.from('security_audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      success,
      metadata,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
};
