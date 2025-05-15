
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin email constant
const ADMIN_EMAIL = "johnnysantos_177@msn.com";

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
    // Verify admin authentication
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user?.email) throw new Error("User not authenticated or email not available");
    if (user.email !== ADMIN_EMAIL) throw new Error("Unauthorized: Admin access required");

    // Parse request body to get new price
    const requestData = await req.json();
    const { price } = requestData;
    
    if (!price || isNaN(price) || price < 0) {
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
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message.includes("Unauthorized") ? 403 : 500,
    });
  }
});
