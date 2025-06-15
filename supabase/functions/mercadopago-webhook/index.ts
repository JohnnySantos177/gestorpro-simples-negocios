
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
    const webhookData = await req.json();
    console.log("Webhook recebido do Mercado Pago:", JSON.stringify(webhookData, null, 2));

    // Mercado Pago envia diferentes tipos de notificação
    const { type, data } = webhookData;
    
    if (type === "payment") {
      const paymentId = data?.id;
      
      if (!paymentId) {
        console.log("Payment ID não encontrado no webhook");
        return new Response("OK", { status: 200 });
      }

      console.log("Processando pagamento ID:", paymentId);

      // Buscar detalhes do pagamento no Mercado Pago
      const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN");
      
      if (!mercadoPagoToken) {
        console.error("Token do Mercado Pago não configurado");
        return new Response("Token not configured", { status: 500 });
      }

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!paymentResponse.ok) {
        console.error("Erro ao buscar pagamento:", await paymentResponse.text());
        return new Response("Payment not found", { status: 404 });
      }

      const payment = await paymentResponse.json();
      console.log("Detalhes do pagamento:", JSON.stringify(payment, null, 2));

      // Verificar se o pagamento foi aprovado
      if (payment.status === "approved") {
        const externalReference = payment.external_reference;
        
        if (!externalReference) {
          console.log("External reference não encontrada");
          return new Response("OK", { status: 200 });
        }

        // Extrair user_id e plan_type do external_reference
        // Formato: payment_{user_id}_{plan_type}_{timestamp}
        const referenceMatch = externalReference.match(/^payment_([^_]+)_([^_]+)_/);
        
        if (!referenceMatch) {
          console.log("Formato de external_reference inválido:", externalReference);
          return new Response("OK", { status: 200 });
        }

        const userId = referenceMatch[1];
        const planType = referenceMatch[2];

        console.log("Atualizando usuário:", userId, "para plano:", planType);

        // Calcular data de fim da assinatura baseado no tipo de plano
        const startDate = new Date();
        let endDate = new Date();
        
        switch (planType) {
          case 'quarterly':
            endDate.setMonth(endDate.getMonth() + 3);
            break;
          case 'semiannual':
            endDate.setMonth(endDate.getMonth() + 6);
            break;
          default: // monthly
            endDate.setMonth(endDate.getMonth() + 1);
            break;
        }

        // Atualizar perfil do usuário para premium
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

        // Criar/atualizar registro de assinatura
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

        // Registrar o pagamento
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            user_id: userId,
            external_reference: externalReference,
            status: payment.status,
            amount: Math.round(payment.transaction_amount * 100), // converter para centavos
            currency: payment.currency_id,
            payment_method: payment.payment_method_id,
            installments: payment.installments || 1,
            metadata: {
              mercado_pago_id: paymentId,
              plan_type: planType,
              payment_date: payment.date_created,
            }
          });

        if (paymentError) {
          console.error("Erro ao registrar pagamento:", paymentError);
        } else {
          console.log("Pagamento registrado com sucesso");
        }

        // Log de auditoria de segurança
        await supabaseClient.from('security_audit_logs').insert({
          user_id: userId,
          action: 'subscription_activated',
          resource_type: 'subscription',
          success: true,
          metadata: {
            payment_id: paymentId,
            plan_type: planType,
            amount: payment.transaction_amount,
            payment_method: payment.payment_method_id
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
    return new Response("Internal server error", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
