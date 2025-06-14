
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

  try {
    // Create a Supabase client using the anon key (this is a read-only operation)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the subscription price from settings
    const { data, error } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'subscription_price')
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription price:", error);
      return new Response(JSON.stringify({ 
        price: 5999 // Default fallback price
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const price = data?.value ? parseInt(data.value) : 5999; // Default R$59.99 in cents
    
    return new Response(JSON.stringify({ 
      price: price
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in get-subscription-price:", error);
    return new Response(JSON.stringify({ 
      price: 5999 // Default fallback price
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
