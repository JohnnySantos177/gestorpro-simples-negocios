
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

  // Create a Supabase client using the anon key for auth
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Parse request body if it exists
    let price = 5999; // Default price in cents (R$59.99)
    if (req.body) {
      const requestData = await req.json();
      if (requestData.price && !isNaN(requestData.price)) {
        price = parseInt(requestData.price);
      }
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Initialize Stripe with secret key
    const stripe = new Stripe("sk_test_51RNhaPQVGReNUF6iM9HtcrW7XLbfOCZEcCz2R0jdaI2rDO7jjyUJV5N5WqsvHGKZP19Ed0tBL5KvcAaunHcdDtz200i1aUi3bC", {
      apiVersion: "2023-10-16",
    });

    // Check if user already has a Stripe customer ID
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: subscribers } = await serviceClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = subscribers?.stripe_customer_id;

    if (!customerId) {
      // Look for existing customer in Stripe
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
      await serviceClient.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        created_at: new Date().toISOString(),
      });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'TotalGestor Pro Subscription',
              description: 'Acesso completo a plataforma TotalGestor Pro',
            },
            unit_amount: price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get("origin")}/confirmation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/assinatura`,
    });

    // Track the checkout session in your database
    await serviceClient.from('checkout_sessions').insert({
      user_id: user.id,
      session_id: session.id,
      amount: price,
      status: 'pending'
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
