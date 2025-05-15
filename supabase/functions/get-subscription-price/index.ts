
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default price in cents (R$59.99)
const DEFAULT_PRICE = 5999;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Get the price from the settings table
    const { data, error } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'subscription_price')
      .single();

    let price = DEFAULT_PRICE;
    
    // If we found a price in the settings table, use it
    if (data && !error) {
      const parsedPrice = parseInt(data.value);
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        price = parsedPrice;
      }
    }
    
    return new Response(JSON.stringify({ price }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting subscription price:", error);
    return new Response(JSON.stringify({ error: error.message, price: DEFAULT_PRICE }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
