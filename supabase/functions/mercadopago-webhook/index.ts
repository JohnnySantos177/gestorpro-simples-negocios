
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { validateWebhookSignature, generateEventId } from "../_shared/webhookValidation.ts";
import { rateLimitManager } from "../_shared/rateLimitManager.ts";
import { calculateSubscriptionEndDate } from "../_shared/mercadopago.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = rateLimitManager.isAllowed(clientIP, 'webhook');
    
    if (!rateLimitResult.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response("Rate limit exceeded", { 
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      });
    }

    // Get webhook signature
    const signature = req.headers.get("x-signature");
    if (!signature) {
      console.error("Missing webhook signature");
      return new Response("Missing signature", { status: 401, headers: corsHeaders });
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return new Response("Webhook secret not configured", { status: 500, headers: corsHeaders });
    }

    // Read and validate request body
    const bodyText = await req.text();
    if (!bodyText) {
      console.error("Empty request body");
      return new Response("Empty body", { status: 400, headers: corsHeaders });
    }

    // Validate webhook signature
    const isValidSignature = validateWebhookSignature({
      signature,
      body: bodyText,
      secret: webhookSecret
    });

    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 401, headers: corsHeaders });
    }

    const webhookData = JSON.parse(bodyText);
    console.log("Webhook recebido do Mercado Pago:", JSON.stringify(webhookData, null, 2));

    const { type, data } = webhookData;
    
    if (type === "payment") {
      const paymentId = data?.id;
      
      if (!paymentId) {
        console.log("Payment ID não encontrado no webhook");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Generate event ID for idempotency
      const eventId = generateEventId(paymentId, Date.now());
      
      // Check if this event was already processed
      const { data: existingEvent } = await supabaseClient
        .from('webhook_events')
        .select('id')
        .eq('event_id', eventId)
        .single();

      if (existingEvent) {
        console.log("Event already processed, skipping:", eventId);
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Record this webhook event
      await supabaseClient
        .from('webhook_events')
        .insert({
          event_id: eventId,
          event_type: type,
          payment_id: paymentId,
          signature_hash: signature
        });

      console.log("Processando pagamento ID:", paymentId);

      // Fetch payment details from Mercado Pago
      const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN");
      
      if (!mercadoPagoToken) {
        console.error("Token do Mercado Pago não configurado");
        return new Response("Token not configured", { status: 500, headers: corsHeaders });
      }

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!paymentResponse.ok) {
        console.error("Erro ao buscar pagamento:", await paymentResponse.text());
        return new Response("Payment not found", { status: 404, headers: corsHeaders });
      }

      const payment = await paymentResponse.json();
      console.log("Detalhes do pagamento:", JSON.stringify(payment, null, 2));

      // Verify payment status
      if (payment.status === "approved") {
        const externalReference = payment.external_reference;
        
        if (!externalReference) {
          console.log("External reference não encontrada");
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        // Validate external reference format
        const referenceMatch = externalReference.match(/^payment_([^_]+)_([^_]+)_/);
        
        if (!referenceMatch) {
          console.log("Formato de external_reference inválido:", externalReference);
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        const userId = referenceMatch[1];
        const planType = referenceMatch[2];

        // Validate plan type
        if (!['monthly', 'quarterly', 'semiannual'].includes(planType)) {
          console.log("Tipo de plano inválido:", planType);
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        console.log("Atualizando usuário:", userId, "para plano:", planType);

        // Calculate subscription end date
        const startDate = new Date();
        const endDate = calculateSubscriptionEndDate(planType, startDate);

        // Update user profile to premium
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            tipo_plano: 'premium',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (profileError) {
          console.error("Erro ao atualizar perfil:", profileError);
        } else {
          console.log("Perfil atualizado para premium");
        }

        // Create/update subscription record
        const { error: subscriptionError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            mercado_pago_subscription_id: paymentId,
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            payment_provider: 'mercado_pago',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (subscriptionError) {
          console.error("Erro ao criar assinatura:", subscriptionError);
        } else {
          console.log("Assinatura criada/atualizada com sucesso");
        }

        // Record payment
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            user_id: userId,
            external_reference: externalReference,
            status: payment.status,
            amount: Math.round(payment.transaction_amount * 100), // convert to cents
            currency: payment.currency_id,
            payment_method: payment.payment_method_id,
            installments: payment.installments || 1,
            metadata: {
              mercado_pago_id: paymentId,
              plan_type: planType,
              payment_date: payment.date_created,
              webhook_event_id: eventId
            }
          });

        if (paymentError) {
          console.error("Erro ao registrar pagamento:", paymentError);
        } else {
          console.log("Pagamento registrado com sucesso");
        }

        // Security audit log
        await supabaseClient.from('security_audit_logs').insert({
          user_id: userId,
          action: 'subscription_activated',
          resource_type: 'subscription',
          success: true,
          metadata: {
            payment_id: paymentId,
            plan_type: planType,
            amount: payment.transaction_amount,
            payment_method: payment.payment_method_id,
            webhook_signature_verified: true,
            event_id: eventId
          },
        });

        console.log("Processamento do webhook concluído com sucesso");
      } else {
        console.log("Pagamento não aprovado, status:", payment.status);
      }
    } else {
      console.log("Tipo de webhook não processado:", type);
    }

    return new Response("OK", { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("Erro no webhook:", error);
    
    // Log security event for failed webhook processing
    try {
      await supabaseClient.from('security_audit_logs').insert({
        action: 'webhook_processing_failed',
        resource_type: 'webhook',
        success: false,
        error_message: error.message,
        metadata: {
          error_stack: error.stack,
          user_agent: req.headers.get('user-agent'),
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")
        }
      });
    } catch (logError) {
      console.error("Failed to log security event:", logError);
    }

    return new Response("Internal server error", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
