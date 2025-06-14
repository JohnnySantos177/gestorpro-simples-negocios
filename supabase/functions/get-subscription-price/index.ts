
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client using the service role key for secure data access
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Get subscription price from settings table
    const { data: setting, error } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'subscription_price')
      .single();

    if (error) {
      console.error("Error fetching subscription price:", error);
      throw new Error("Unable to fetch subscription price");
    }

    const price = parseInt(setting.value);
    
    // Input validation
    if (isNaN(price) || price <= 0) {
      throw new Error("Invalid price configuration");
    }

    // Log successful action for security monitoring
    await supabaseClient.from('security_audit_logs').insert({
      user_id: user.id,
      action: 'get_subscription_price',
      resource_type: 'settings',
      success: true,
      metadata: { price: price },
    });

    return new Response(JSON.stringify({ 
      price: price,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in get-subscription-price:", error);
    
    // Log failed action for security monitoring
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user) {
        await supabaseClient.from('security_audit_logs').insert({
          user_id: userData.user.id,
          action: 'get_subscription_price',
          resource_type: 'settings',
          success: false,
          error_message: error.message,
        });
      }
    }
    
    // Generic error message for security
    const userMessage = error.message.includes("Authentication required") 
      ? "Authentication required" 
      : "Unable to process request";
    
    return new Response(JSON.stringify({ 
      error: userMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message.includes("Authentication") ? 401 : 500,
    });
  }
});
