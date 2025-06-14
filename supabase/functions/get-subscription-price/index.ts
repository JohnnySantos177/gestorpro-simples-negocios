
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
    // Verify user authentication (optional for getting price)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      user = userData.user;
    }

    // Get subscription price from settings table
    const { data: setting, error } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'subscription_price')
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription price:", error);
      // Return default price if setting not found
      const defaultPrice = 8990; // R$ 89.90 in cents
      
      return new Response(JSON.stringify({ 
        price: defaultPrice,
        success: true,
        source: 'default'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const price = setting ? parseInt(setting.value) : 8990; // Default if no setting found
    
    // Input validation
    if (isNaN(price) || price <= 0) {
      console.warn("Invalid price configuration, using default");
      const defaultPrice = 8990; // R$ 89.90 in cents
      
      return new Response(JSON.stringify({ 
        price: defaultPrice,
        success: true,
        source: 'default'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Log successful action for security monitoring (only if user is authenticated)
    if (user) {
      await supabaseClient.from('security_audit_logs').insert({
        user_id: user.id,
        action: 'get_subscription_price',
        resource_type: 'settings',
        success: true,
        metadata: { price: price },
      });
    }

    return new Response(JSON.stringify({ 
      price: price,
      success: true,
      source: 'settings'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in get-subscription-price:", error);
    
    // Log failed action for security monitoring (only if user is authenticated)
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
    
    // Return default price even on error to prevent UI breaking
    const defaultPrice = 8990; // R$ 89.90 in cents
    
    return new Response(JSON.stringify({ 
      price: defaultPrice,
      success: true,
      source: 'fallback',
      note: 'Using fallback price due to error'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
