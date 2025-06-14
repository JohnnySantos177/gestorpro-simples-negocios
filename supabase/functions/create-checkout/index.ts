
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

    // Calculate period description based on plan type
    let periodDescription = "Assinatura Mensal";
    if (planType === 'quarterly') {
      periodDescription = "Assinatura Trimestral (3 meses)";
    } else if (planType === 'semiannual') {
      periodDescription = "Assinatura Semestral (6 meses)";
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://preview--gestorpro-simples-negocios.lovable.app";

    // Create payment preference - simplified version
    const preferenceData = {
      items: [
        {
          title: `TotalGestor Pro - ${periodDescription}`,
          description: `Acesso premium ao TotalGestor por ${planType === 'monthly' ? '1 mês' : planType === 'quarterly' ? '3 meses' : '6 meses'}`,
          quantity: 1,
          unit_price: price / 100, // Convert from cents to reais
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: `${origin}/confirmation-success`,
        failure: `${origin}/assinatura`,
        pending: `${origin}/confirmation-success`
      },
      auto_return: 'approved',
      external_reference: `payment_${user.id}_${planType}_${Date.now()}`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    console.log("Creating preference with data:", JSON.stringify(preferenceData));

    const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${user.id}-${planType}-${Date.now()}`,
      },
      body: JSON.stringify(preferenceData),
    });

    console.log("Preference response status:", preferenceResponse.status);

    if (!preferenceResponse.ok) {
      const errorText = await preferenceResponse.text();
      console.error("Error creating preference:", {
        status: preferenceResponse.status,
        response: errorText,
        headers: Object.fromEntries(preferenceResponse.headers.entries())
      });
      
      throw new Error(`Failed to create payment preference: ${errorText}`);
    }

    const preference = await preferenceResponse.json();
    console.log("Preference created successfully:", preference.id);

    if (!preference.init_point) {
      throw new Error('Failed to create preference - no payment URL returned');
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
      session_id: preference.id,
      amount: price,
      status: 'pending'
    });

    // Save customer info for future reference
    await serviceClient.from('subscribers').upsert({
      user_id: user.id,
      email: user.email,
      created_at: new Date().toISOString(),
    });

    console.log("Checkout session created successfully, redirecting to:", preference.init_point);

    return new Response(JSON.stringify({ url: preference.init_point }), {
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
