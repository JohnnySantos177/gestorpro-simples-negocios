
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

  // Use the service role key to perform writes in Supabase
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
    
    if (!user?.id || !user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    console.log("Checking subscription for user:", user.email);

    // Get Mercado Pago access token from environment variables
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!mercadoPagoToken) {
      console.error("Mercado Pago access token not configured");
      
      // Log failed action for security monitoring
      await supabaseClient.from('security_audit_logs').insert({
        user_id: user.id,
        action: 'check_subscription',
        resource_type: 'subscription',
        success: false,
        error_message: 'Mercado Pago access token not configured',
      });

      // Return false subscription status instead of error when key is missing
      return new Response(JSON.stringify({
        subscribed: false,
        subscription_id: null,
        subscription_end: null,
        error: "Subscription service temporarily unavailable"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for active subscriptions by email instead of customer ID
    let hasActiveSub = false;
    let subscriptionEnd = null;
    let subscriptionId = null;

    console.log("Checking subscriptions for email:", user.email);
    
    // Search for subscriptions by payer email
    const subscriptionsResponse = await fetch(`https://api.mercadopago.com/preapproval/search?payer_email=${encodeURIComponent(user.email)}&status=authorized`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (subscriptionsResponse.ok) {
      const subscriptionsData = await subscriptionsResponse.json();
      hasActiveSub = subscriptionsData.results && subscriptionsData.results.length > 0;

      console.log("Found subscriptions:", subscriptionsData.results?.length || 0);

      if (hasActiveSub) {
        const subscription = subscriptionsData.results[0];
        subscriptionId = subscription.id;
        subscriptionEnd = subscription.next_payment_date;

        console.log("Active subscription found:", subscriptionId);

        // Update subscription status in the database
        await supabaseClient.from('subscriptions').upsert({
          user_id: user.id,
          mercado_pago_subscription_id: subscriptionId,
          status: 'active',
          start_date: subscription.date_created,
          end_date: subscriptionEnd,
          payment_provider: 'mercado_pago',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
      }
    } else {
      const errorText = await subscriptionsResponse.text();
      console.error("Error checking subscriptions:", errorText);
    }

    // Log successful action for security monitoring
    await supabaseClient.from('security_audit_logs').insert({
      user_id: user.id,
      action: 'check_subscription',
      resource_type: 'subscription',
      success: true,
      metadata: { has_active_subscription: hasActiveSub },
    });

    console.log("Subscription check completed:", { subscribed: hasActiveSub, subscription_id: subscriptionId });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_id: subscriptionId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    
    // Log failed action for security monitoring
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user) {
        await supabaseClient.from('security_audit_logs').insert({
          user_id: userData.user.id,
          action: 'check_subscription',
          resource_type: 'subscription',
          success: false,
          error_message: error.message,
        });
      }
    }
    
    // Return appropriate error based on the error type
    if (error.message.includes("Authentication")) {
      return new Response(JSON.stringify({ 
        error: "Authentication required",
        subscribed: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    // For other errors, return a generic message but still allow the app to function
    return new Response(JSON.stringify({ 
      error: "Unable to verify subscription status",
      subscribed: false,
      subscription_id: null,
      subscription_end: null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Changed to 200 to prevent blocking the UI
    });
  }
});
