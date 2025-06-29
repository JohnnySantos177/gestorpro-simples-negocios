import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Componente de teste simples
export default function TesteCatalogo() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    testarConexao();
  }, []);

  const testarConexao = async () => {
    try {
      console.log('=== INICIANDO TESTE ===');
      
      // Teste 1: Verificar conexão básica
      console.log('Teste 1: Verificando Supabase...');
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1);
      
      console.log('Health check:', healthCheck, healthError);

      // Teste 2: Buscar perfil específico
      console.log('Teste 2: Buscando perfil da lojadoze...');
      const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('id, nome_loja')
        .eq('nome_loja', 'lojadoze')
        .single();

      console.log('Perfil:', perfil);
      console.log('Erro perfil:', perfilError);

      if (perfilError) {
        setErro(`Erro ao buscar perfil: ${perfilError.message}`);
        return;
      }

      if (!perfil) {
        setErro('Perfil não encontrado');
        return;
      }

      // Teste 3: Buscar produtos
      console.log('Teste 3: Buscando produtos...');
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', perfil.id)
        .eq('publicar_no_catalogo', true);

      console.log('Produtos:', produtos);
      console.log('Erro produtos:', produtosError);

      if (produtosError) {
        setErro(`Erro ao buscar produtos: ${produtosError.message}`);
        return;
      }

      // Teste 4: Query com JOIN (como seria na aplicação real)
      console.log('Teste 4: Query com JOIN...');
      const { data: produtosJoin, error: joinError } = await supabase
        .from('produtos')
        .select(`
          id,
          nome,
          descricao,
          categoria,
          preco_venda,
          quantidade,
          foto_url,
          profiles!inner(nome_loja)
        `)
        .eq('profiles.nome_loja', 'lojadoze')
        .eq('publicar_no_catalogo', true);

      console.log('Produtos com JOIN:', produtosJoin);
      console.log('Erro JOIN:', joinError);

      setResultado({
        perfil,
        produtos,
        produtosJoin,
        totalProdutos: produtos?.length || 0,
        totalProdutosJoin: produtosJoin?.length || 0
      });

    } catch (error) {
      console.error('Erro geral:', error);
      setErro(`Erro inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testando Conexão...</h1>
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Erro no Teste</h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-700">{erro}</p>
        </div>
        <button 
          onClick={testarConexao}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Testar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resultado dos Testes</h1>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <h3 className="font-semibold text-green-800">✅ Conexão bem-sucedida!</h3>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded">
          <h3 className="font-semibold mb-2">Perfil Encontrado:</h3>
          <pre className="text-sm">{JSON.stringify(resultado.perfil, null, 2)}</pre>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded">
          <h3 className="font-semibold mb-2">Produtos ({resultado.totalProdutos}):</h3>
          <pre className="text-sm overflow-auto max-h-40">
            {JSON.stringify(resultado.produtos, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-4 rounded">
          <h3 className="font-semibold mb-2">Produtos com JOIN ({resultado.totalProdutosJoin}):</h3>
          <pre className="text-sm overflow-auto max-h-40">
            {JSON.stringify(resultado.produtosJoin, null, 2)}
          </pre>
        </div>

        <button 
          onClick={testarConexao}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Executar Testes Novamente
        </button>
      </div>
    </div>
  );
}
