
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
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Use PRODUCTION token
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN");
    
    if (!mercadoPagoToken) {
      console.error("MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN not configured");
      throw new Error("Payment service not configured");
    }

    console.log("Creating checkout for user:", user.email);
    console.log("Plan type:", planType, "Price:", price);
    console.log("Using PRODUCTION token");

    // Use domínio fixo para URLs de retorno
    const origin = "https://gestorpro-simples-negocios.lovable.app";

    // Calculate period description based on plan type
    let periodDescription = "Assinatura Mensal";
    if (planType === 'quarterly') {
      periodDescription = "Assinatura Trimestral (3 meses)";
    } else if (planType === 'semiannual') {
      periodDescription = "Assinatura Semestral (6 meses)";
    }

    // Create payment preference - URL correta da API
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
        failure: `${origin}/assinatura?error=payment_failed`,
        pending: `${origin}/confirmation-success?status=pending`
      },
      auto_return: 'approved',
      external_reference: `payment_${user.id}_${planType}_${Date.now()}`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1
      },
      notification_url: `https://jxzbartwbukfbqtylvtk.supabase.co/functions/v1/mercadopago-webhook`,
      statement_descriptor: "TOTALGESTOR",
      binary_mode: false
    };

    console.log("Creating preference with data:", JSON.stringify(preferenceData, null, 2));

    // URL correta da API do Mercado Pago para criar preferências
    const apiUrl = 'https://api.mercadopago.com/checkout/preferences';
    
    console.log("Making request to:", apiUrl);
    console.log("Using token (first 20 chars):", mercadoPagoToken.substring(0, 20) + "...");

    const preferenceResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${user.id}-${planType}-${Date.now()}`,
      },
      body: JSON.stringify(preferenceData),
    });

    console.log("Preference response status:", preferenceResponse.status);
    const responseText = await preferenceResponse.text();
    console.log("Preference response body:", responseText);

    if (!preferenceResponse.ok) {
      console.error("Error creating preference:", {
        status: preferenceResponse.status,
        statusText: preferenceResponse.statusText,
        response: responseText,
      });
      
      // Try to parse error response for more details
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        if (errorJson.message) {
          errorDetails = errorJson.message;
        } else if (errorJson.cause && errorJson.cause.length > 0) {
          errorDetails = errorJson.cause.map((c: any) => c.description || c.code).join(', ');
        } else if (errorJson.error) {
          errorDetails = errorJson.error;
        }
      } catch (e) {
        // Keep original error text if parsing fails
        console.log("Could not parse error response as JSON");
      }
      
      throw new Error(`Failed to create payment preference: ${errorDetails}`);
    }

    const preference = JSON.parse(responseText);
    console.log("Preference created successfully:", {
      id: preference.id,
      init_point: preference.init_point
    });

    if (!preference.init_point) {
      throw new Error('Failed to create preference - no payment URL returned');
    }

    // Use production URL for live environment
    const redirectUrl = preference.init_point;

    console.log("Using PRODUCTION redirect URL:", redirectUrl);

    // Use the service role key to perform writes in Supabase
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Track the checkout session in your database
    try {
      await serviceClient.from('checkout_sessions').insert({
        user_id: user.id,
        session_id: preference.id,
        amount: price,
        status: 'pending'
      });
      console.log("Checkout session logged successfully");
    } catch (dbError) {
      console.error("Failed to log checkout session:", dbError);
      // Don't fail the checkout for logging errors
    }

    // Save customer info for future reference
    try {
      await serviceClient.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
      });
      console.log("Subscriber info updated successfully");
    } catch (dbError) {
      console.error("Failed to update subscriber info:", dbError);
      // Don't fail the checkout for logging errors
    }

    console.log("Checkout session created successfully, redirecting to:", redirectUrl);

    return new Response(JSON.stringify({ url: redirectUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Unable to process request"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
