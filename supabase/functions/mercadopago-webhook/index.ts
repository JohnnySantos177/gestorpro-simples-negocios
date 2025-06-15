
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { enhancedWebhookSecurity } from "../_shared/enhancedWebhookSecurity.ts";
import { enhancedSecurity } from "../_shared/enhancedSecurity.ts";
import { calculateSubscriptionEndDate } from "../_shared/mercadopago.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: enhancedSecurity.getSecurityHeaders() });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Enhanced request validation
    const requestValidation = enhancedSecurity.validateRequest(req);
    if (!requestValidation.valid) {
      await enhancedSecurity.logSecurityEvent(
        null,
        'webhook_request_validation_failed',
        'webhook',
        false,
        { error: requestValidation.error },
        requestValidation.error,
        req
      );
      return enhancedSecurity.createErrorResponse('Invalid request', 400);
    }

    // Enhanced rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = await enhancedSecurity.rateLimitCheck(clientIP, 20, 60000); // 20 requests per minute
    
    if (!rateLimitResult.allowed) {
      await enhancedSecurity.logSecurityEvent(
        null,
        'webhook_rate_limit_exceeded',
        'webhook',
        false,
        { ip: clientIP, remaining: rateLimitResult.remaining },
        'Rate limit exceeded',
        req
      );
      
      return new Response("Rate limit exceeded", { 
        status: 429,
        headers: {
          ...enhancedSecurity.getSecurityHeaders(),
          'Retry-After': '60'
        }
      });
    }

    // Get and validate webhook signature
    const signature = req.headers.get("x-signature");
    if (!signature) {
      await enhancedSecurity.logSecurityEvent(
        null,
        'webhook_missing_signature',
        'webhook',
        false,
        { ip: clientIP },
        'Missing webhook signature',
        req
      );
      return enhancedSecurity.createErrorResponse("Missing signature", 401);
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return enhancedSecurity.createErrorResponse("Configuration error", 500);
    }

    // Read and validate request body
    const bodyText = await req.text();
    if (!bodyText) {
      await enhancedSecurity.logSecurityEvent(
        null,
        'webhook_empty_body',
        'webhook',
        false,
        { ip: clientIP },
        'Empty request body',
        req
      );
      return enhancedSecurity.createErrorResponse("Empty body", 400);
    }

    // Enhanced signature validation
    const isValidSignature = await enhancedWebhookSecurity.validateSignature({
      signature,
      body: bodyText,
      secret: webhookSecret
    });

    if (!isValidSignature) {
      await enhancedSecurity.logSecurityEvent(
        null,
        'webhook_invalid_signature',
        'webhook',
        false,
        { ip: clientIP, signatureLength: signature.length },
        'Invalid webhook signature',
        req
      );
      return enhancedSecurity.createErrorResponse("Invalid signature", 401);
    }

    // Parse and sanitize webhook data
    const webhookData = enhancedSecurity.sanitizeInput(JSON.parse(bodyText));
    console.log("Enhanced webhook received from Mercado Pago:", JSON.stringify(webhookData, null, 2));

    const { type, data } = webhookData;
    
    if (type === "payment") {
      const paymentId = data?.id;
      
      if (!paymentId) {
        console.log("Payment ID not found in webhook");
        return enhancedSecurity.createSecureResponse("OK", 200);
      }

      // Generate secure event ID for idempotency
      const eventId = await enhancedWebhookSecurity.generateSecureEventId(paymentId, Date.now());
      
      // Check for replay attacks
      const isReplay = await enhancedWebhookSecurity.checkReplayAttack(eventId, paymentId);
      if (isReplay) {
        console.log("Replay attack detected, skipping:", eventId);
        return enhancedSecurity.createSecureResponse("OK", 200);
      }

      // Record this webhook event
      await enhancedWebhookSecurity.recordWebhookEvent(eventId, type, paymentId, signature);

      console.log("Processing payment ID:", paymentId);

      // Fetch payment details from Mercado Pago with enhanced security
      const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN");
      
      if (!mercadoPagoToken) {
        console.error("Mercado Pago token not configured");
        return enhancedSecurity.createErrorResponse("Token not configured", 500);
      }

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'TotalGestor-Webhook/1.0'
        },
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error("Error fetching payment:", errorText);
        
        await enhancedSecurity.logSecurityEvent(
          null,
          'webhook_payment_fetch_failed',
          'payment',
          false,
          { paymentId, status: paymentResponse.status },
          'Failed to fetch payment details',
          req
        );
        
        return enhancedSecurity.createErrorResponse("Payment not found", 404);
      }

      const payment = await paymentResponse.json();
      console.log("Payment details:", JSON.stringify(payment, null, 2));

      // Process approved payments with enhanced validation
      if (payment.status === "approved") {
        const externalReference = payment.external_reference;
        
        if (!externalReference) {
          console.log("External reference not found");
          return enhancedSecurity.createSecureResponse("OK", 200);
        }

        // Enhanced validation of external reference format
        const referenceMatch = externalReference.match(/^payment_([a-f0-9-]{36})_([a-z]+)_/);
        
        if (!referenceMatch) {
          await enhancedSecurity.logSecurityEvent(
            null,
            'webhook_invalid_reference_format',
            'payment',
            false,
            { externalReference, paymentId },
            'Invalid external reference format',
            req
          );
          console.log("Invalid external_reference format:", externalReference);
          return enhancedSecurity.createSecureResponse("OK", 200);
        }

        const userId = referenceMatch[1];
        const planType = referenceMatch[2];

        // Enhanced plan type validation
        if (!['monthly', 'quarterly', 'semiannual'].includes(planType)) {
          await enhancedSecurity.logSecurityEvent(
            userId,
            'webhook_invalid_plan_type',
            'subscription',
            false,
            { planType, paymentId },
            'Invalid plan type',
            req
          );
          console.log("Invalid plan type:", planType);
          return enhancedSecurity.createSecureResponse("OK", 200);
        }

        console.log("Updating user:", userId, "to plan:", planType);

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = calculateSubscriptionEndDate(planType, startDate);

        // Enhanced database operations with proper error handling
        try {
          // Update user profile to premium
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({
              tipo_plano: 'premium',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (profileError) {
            throw new Error(`Profile update failed: ${profileError.message}`);
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
            }, {
              onConflict: 'user_id',
            });

          if (subscriptionError) {
            throw new Error(`Subscription update failed: ${subscriptionError.message}`);
          }

          // Record payment with enhanced metadata
          const { error: paymentError } = await supabaseClient
            .from('payments')
            .insert({
              user_id: userId,
              external_reference: externalReference,
              status: payment.status,
              amount: Math.round(payment.transaction_amount * 100),
              currency: payment.currency_id,
              payment_method: payment.payment_method_id,
              installments: payment.installments || 1,
              metadata: {
                mercado_pago_id: paymentId,
                plan_type: planType,
                payment_date: payment.date_created,
                webhook_event_id: eventId,
                ip_address: clientIP,
                signature_verified: true
              }
            });

          if (paymentError) {
            throw new Error(`Payment record failed: ${paymentError.message}`);
          }

          // Enhanced security audit logging
          await enhancedSecurity.logSecurityEvent(
            userId,
            'subscription_activated',
            'subscription',
            true,
            {
              payment_id: paymentId,
              plan_type: planType,
              amount: payment.transaction_amount,
              payment_method: payment.payment_method_id,
              event_id: eventId,
              ip_address: clientIP,
              signature_verified: true
            },
            undefined,
            req
          );

          console.log("Webhook processing completed successfully");
          
        } catch (dbError) {
          console.error("Database operation failed:", dbError);
          
          await enhancedSecurity.logSecurityEvent(
            userId,
            'webhook_database_error',
            'subscription',
            false,
            { paymentId, planType },
            dbError.message,
            req
          );
          
          return enhancedSecurity.createErrorResponse("Database error", 500);
        }
        
      } else {
        console.log("Payment not approved, status:", payment.status);
        
        await enhancedSecurity.logSecurityEvent(
          null,
          'webhook_payment_not_approved',
          'payment',
          true,
          { paymentId, status: payment.status },
          undefined,
          req
        );
      }
    } else {
      console.log("Webhook type not processed:", type);
    }

    return enhancedSecurity.createSecureResponse("OK", 200);

  } catch (error) {
    console.error("Enhanced webhook error:", error);
    
    // Enhanced error logging
    await enhancedSecurity.logSecurityEvent(
      null,
      'webhook_processing_failed',
      'webhook',
      false,
      {
        error_message: error.message,
        error_stack: error.stack?.substring(0, 1000),
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")
      },
      error.message,
      req
    );

    return enhancedSecurity.createErrorResponse("Internal server error", 500);
  }
});
