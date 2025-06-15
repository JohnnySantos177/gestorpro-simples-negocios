
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { validateCheckoutRequest, sanitizeExternalReference } from "../_shared/checkoutValidation.ts";
import { rateLimitManager } from "../_shared/rateLimitManager.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email || !user?.id) {
      throw new Error("User not authenticated or incomplete user data");
    }

    // Rate limiting check
    const rateLimitResult = rateLimitManager.isAllowed(user.id, 'checkout');
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for user: ${user.id}`);
      return new Response(JSON.stringify({ 
        error: "Muitas tentativas. Tente novamente em alguns minutos.",
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Parse and validate request data
    let requestData;
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestData = JSON.parse(bodyText);
      } else {
        requestData = {};
      }
    } catch (parseError) {
      console.error("Invalid JSON in request body:", parseError);
      return new Response(JSON.stringify({ 
        error: "Dados de requisição inválidos" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Set defaults and validate
    const validatedData = validateCheckoutRequest({
      price: requestData.price || 8990, // Default: R$89.90
      planType: requestData.planType || 'monthly'
    });

    const { price, planType } = validatedData;

    // Verify Mercado Pago token
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN");
    
    if (!mercadoPagoToken) {
      console.error("MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN not configured");
      throw new Error("Payment service not configured");
    }

    console.log("Creating checkout for user:", user.email);
    console.log("Plan type:", planType, "Price:", price);
    console.log("Using PRODUCTION token");

    // Fixed domain for callback URLs
    const origin = "https://gestorpro-simples-negocios.lovable.app";

    // Calculate period description based on plan type
    let periodDescription = "Assinatura Mensal";
    if (planType === 'quarterly') {
      periodDescription = "Assinatura Trimestral (3 meses)";
    } else if (planType === 'semiannual') {
      periodDescription = "Assinatura Semestral (6 meses)";
    }

    // Generate secure external reference
    const timestamp = Date.now();
    const externalReference = `payment_${user.id}_${planType}_${timestamp}`;

    // Validate external reference format
    if (!sanitizeExternalReference(externalReference)) {
      throw new Error("Invalid external reference format");
    }

    // Create payment preference
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
      external_reference: externalReference,
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

    // Create preference with Mercado Pago
    const apiUrl = 'https://api.mercadopago.com/checkout/preferences';
    
    console.log("Making request to:", apiUrl);
    console.log("Using token (first 20 chars):", mercadoPagoToken.substring(0, 20) + "...");

    const preferenceResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${user.id}-${planType}-${timestamp}`,
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

    const redirectUrl = preference.init_point;
    console.log("Using PRODUCTION redirect URL:", redirectUrl);

    // Use service role for database operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Track checkout session
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
    }

    // Update subscriber info
    try {
      await serviceClient.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
      });
      console.log("Subscriber info updated successfully");
    } catch (dbError) {
      console.error("Failed to update subscriber info:", dbError);
    }

    // Security audit log
    await serviceClient.from('security_audit_logs').insert({
      user_id: user.id,
      action: 'checkout_created',
      resource_type: 'checkout',
      success: true,
      metadata: {
        plan_type: planType,
        amount: price,
        preference_id: preference.id,
        external_reference: externalReference,
        rate_limit_remaining: rateLimitResult.remainingRequests
      }
    });

    console.log("Checkout session created successfully, redirecting to:", redirectUrl);

    return new Response(JSON.stringify({ url: redirectUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    console.error("Error stack:", error.stack);
    
    // Log security event for failed checkout
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data.user) {
          const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { persistSession: false } }
          );
          
          await serviceClient.from('security_audit_logs').insert({
            user_id: data.user.id,
            action: 'checkout_failed',
            resource_type: 'checkout',
            success: false,
            error_message: error.message,
            metadata: {
              error_stack: error.stack,
              user_agent: req.headers.get('user-agent')
            }
          });
        }
      }
    } catch (logError) {
      console.error("Failed to log security event:", logError);
    }

    return new Response(JSON.stringify({ 
      error: error.message || "Unable to process request"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
