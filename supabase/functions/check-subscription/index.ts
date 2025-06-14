
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

    // Use TEST token in development/testing, PROD token in production
    // For now, we'll use TEST token to allow safe testing
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_TEST_ACCESS_TOKEN") || Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    
    if (!mercadoPagoToken) {
      console.error("No Mercado Pago access token configured (neither TEST nor PROD)");
      
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

    console.log("Using token type:", mercadoPagoToken.startsWith("TEST-") ? "TEST" : "PRODUCTION");

    // Check for active subscription in our database first
    const { data: subscriptionData } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .single();

    if (subscriptionData) {
      console.log("Found active subscription in database:", subscriptionData.mercado_pago_subscription_id);
      
      // Log successful action for security monitoring
      await supabaseClient.from('security_audit_logs').insert({
        user_id: user.id,
        action: 'check_subscription',
        resource_type: 'subscription',
        success: true,
        metadata: { has_active_subscription: true, source: 'database' },
      });

      return new Response(JSON.stringify({
        subscribed: true,
        subscription_id: subscriptionData.mercado_pago_subscription_id,
        subscription_end: subscriptionData.end_date
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If not found in database, check with Mercado Pago
    console.log("Checking with Mercado Pago for user email:", user.email);
    
    // Search for approved payments by external reference pattern
    const paymentsResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=payment_${user.id}_*&status=approved`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
      },
    });

    let hasActiveSub = false;
    let subscriptionEnd = null;
    let subscriptionId = null;

    if (paymentsResponse.ok) {
      const paymentsData = await paymentsResponse.json();
      const approvedPayments = paymentsData.results || [];
      
      console.log("Found approved payments:", approvedPayments.length);

      if (approvedPayments.length > 0) {
        // Find the most recent payment
        const latestPayment = approvedPayments.sort((a, b) => 
          new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        )[0];

        subscriptionId = latestPayment.id;
        
        // Calculate subscription end based on payment date and plan type
        const paymentDate = new Date(latestPayment.date_created);
        const externalRef = latestPayment.external_reference || '';
        
        if (externalRef.includes('_quarterly_')) {
          subscriptionEnd = new Date(paymentDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
        } else if (externalRef.includes('_semiannual_')) {
          subscriptionEnd = new Date(paymentDate.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months
        } else {
          subscriptionEnd = new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
        }

        // Check if subscription is still valid
        hasActiveSub = new Date() < subscriptionEnd;

        if (hasActiveSub) {
          console.log("Active subscription found via payment:", subscriptionId);

          // Update subscription status in the database
          await supabaseClient.from('subscriptions').upsert({
            user_id: user.id,
            mercado_pago_subscription_id: subscriptionId,
            status: 'active',
            start_date: latestPayment.date_created,
            end_date: subscriptionEnd.toISOString(),
            payment_provider: 'mercado_pago',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });
        }
      }
    } else {
      const errorText = await paymentsResponse.text();
      console.error("Error checking payments:", errorText);
    }

    // Log successful action for security monitoring
    await supabaseClient.from('security_audit_logs').insert({
      user_id: user.id,
      action: 'check_subscription',
      resource_type: 'subscription',
      success: true,
      metadata: { has_active_subscription: hasActiveSub, source: 'mercado_pago' },
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
