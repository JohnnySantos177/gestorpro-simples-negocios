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
  // Buscar o perfil para obter o user_id
  const { data: perfil, error: perfilError } = await supabase
    .from("profiles")
    .select("id")
    .eq("nome_loja", nome_loja)
    .single();

  if (perfilError || !perfil) {
    return new Response(JSON.stringify({ error: "Perfil não encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Buscar produtos publicados
  const { data: produtos, error: produtosError } = await supabase
    .from("produtos")
    .select("id, nome, descricao, precoVenda, foto_url")
    .eq("user_id", perfil.id)
    .eq("publicar_no_catalogo", true);

  if (produtosError) {
    return new Response(JSON.stringify({ error: "Erro ao buscar produtos" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(produtos), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}); 