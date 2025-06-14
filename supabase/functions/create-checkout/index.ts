
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

  // Create a Supabase client using the anon key for auth
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Parse request body if it exists
    let price = 8990; // Default price in cents (R$89.90)
    let planType = 'monthly';
    if (req.body) {
      const requestData = await req.json();
      if (requestData.price && !isNaN(requestData.price)) {
        price = parseInt(requestData.price);
      }
      if (requestData.planType) {
        planType = requestData.planType;
      }
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Get Mercado Pago access token from environment variables
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!mercadoPagoToken) {
      console.error("Mercado Pago access token not configured");
      throw new Error("Payment service not configured");
    }

    console.log("Creating checkout for user:", user.email);
    console.log("Plan type:", planType, "Price:", price);

    // Create subscription preference directly without customer creation
    // This avoids the "can't pay yourself" error
    const subscriptionData = {
      reason: 'Assinatura TotalGestor Pro',
      auto_recurring: {
        frequency: 1,
        frequency_type: planType === 'monthly' ? 'months' : 'months',
        transaction_amount: price / 100, // Convert from cents to reais
        currency_id: 'BRL',
      },
      payer_email: user.email,
      back_url: `${req.headers.get("origin")}/confirmation-success`,
      status: 'pending',
      external_reference: `subscription_${user.id}_${Date.now()}`,
    };

    // Adjust frequency based on plan type
    if (planType === 'quarterly') {
      subscriptionData.auto_recurring.frequency = 3;
    } else if (planType === 'semiannual') {
      subscriptionData.auto_recurring.frequency = 6;
    }

    console.log("Creating subscription with data:", JSON.stringify(subscriptionData));

    const subscriptionResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${user.id}-${Date.now()}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    console.log("Subscription response status:", subscriptionResponse.status);

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error("Error creating subscription:", {
        status: subscriptionResponse.status,
        response: errorText,
        headers: Object.fromEntries(subscriptionResponse.headers.entries())
      });
      
      throw new Error(`Failed to create subscription: ${errorText}`);
    }

    const subscription = await subscriptionResponse.json();
    console.log("Subscription created successfully:", subscription.id);

    if (!subscription.init_point) {
      throw new Error('Failed to create subscription - no payment URL returned');
    }

    // Use the service role key to perform writes in Supabase
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Track the checkout session in your database
    await serviceClient.from('checkout_sessions').insert({
      user_id: user.id,
      session_id: subscription.id,
      amount: price,
      status: 'pending'
    });

    // Save customer info for future reference (without creating in MP)
    await serviceClient.from('subscribers').upsert({
      user_id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
    });

    console.log("Checkout session created successfully, redirecting to:", subscription.init_point);

    return new Response(JSON.stringify({ url: subscription.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Unable to process request"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
