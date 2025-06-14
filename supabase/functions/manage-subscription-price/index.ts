
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

  // Create a Supabase client using the service role key
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify admin authentication using database function (security fix)
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user?.id) throw new Error("User not authenticated");
    
    // Use database function to check admin status instead of hardcoded email
    const { data: isAdminResult, error: adminError } = await supabaseClient
      .rpc('is_admin', { user_id: user.id });
    
    if (adminError) throw new Error("Failed to verify admin status");
    if (!isAdminResult) throw new Error("Unauthorized: Admin access required");

    // Parse request body to get new price
    const requestData = await req.json();
    const { price } = requestData;
    
    // Input validation (security improvement)
    if (!price || isNaN(price) || price < 0 || price > 1000000) {
      throw new Error("Invalid price value");
    }

    // Save the new price to the settings table
    const { data, error } = await supabaseClient
      .from('settings')
      .upsert(
        { key: 'subscription_price', value: price.toString() },
        { onConflict: 'key' }
      );

    if (error) throw error;
    
    // Log admin action for security monitoring
    await supabaseClient.from('admin_logs').insert({
      admin_id: user.id,
      action: 'update_subscription_price',
      details: { old_price: null, new_price: price },
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Subscription price updated successfully",
      price: price
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error updating subscription price:", error);
    
    // Generic error messages for security (don't expose internal details)
    let userMessage = "Unable to process request";
    let statusCode = 500;
    
    if (error.message.includes("Unauthorized")) {
      userMessage = "Access denied";
      statusCode = 403;
    } else if (error.message.includes("Invalid price")) {
      userMessage = "Invalid input provided";
      statusCode = 400;
    }
    
    return new Response(JSON.stringify({ 
      error: userMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
