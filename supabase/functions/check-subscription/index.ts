
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@12.5.0";

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

    // Get Stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("Stripe secret key not configured");
      
      // Log failed action for security monitoring
      await supabaseClient.from('security_audit_logs').insert({
        user_id: user.id,
        action: 'check_subscription',
        resource_type: 'subscription',
        success: false,
        error_message: 'Stripe secret key not configured',
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

    // Initialize Stripe with secret key from environment
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if user already has a Stripe customer ID
    const { data: subscribers, error: fetchError } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = subscribers?.stripe_customer_id;

    if (!customerId) {
      // Look for existing customer in Stripe or create a new one
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer in Stripe
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = newCustomer.id;
      }

      // Save the customer ID in Supabase
      await supabaseClient.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        created_at: new Date().toISOString(),
      });
    }

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let subscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

      // Update subscription status in the database
      await supabaseClient.from('subscriptions').upsert({
        user_id: user.id,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        end_date: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
    }

    // Log successful action for security monitoring
    await supabaseClient.from('security_audit_logs').insert({
      user_id: user.id,
      action: 'check_subscription',
      resource_type: 'subscription',
      success: true,
      metadata: { has_active_subscription: hasActiveSub },
    });

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
