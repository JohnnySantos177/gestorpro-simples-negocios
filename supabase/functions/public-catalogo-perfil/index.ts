import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors";

serve(async (req) => {
  const url = new URL(req.url);
  const nome_loja = url.pathname.split("/").pop();

  if (!nome_loja) {
    return new Response(JSON.stringify({ error: "nome_loja é obrigatório" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await supabase
    .from("profiles")
    .select("nome, nome_loja")
    .eq("nome_loja", nome_loja)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Perfil não encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}); 