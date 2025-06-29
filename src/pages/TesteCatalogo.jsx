import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Importante para pegar o :slug da URL
import { supabase } from "@/lib/supabase";

export default function CatalogoPublico() {
  const [perfil, setPerfil] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Pega o 'slug' da URL, por exemplo: 'minha-loja' em /c/minha-loja
  const { slug } = useParams();

  useEffect(() => {
    // Se não houver slug na URL, não faz nada
    if (!slug) {
      setLoading(false);
      setErro("Nenhum slug de loja fornecido na URL.");
      return;
    }

    const fetchCatalogoData = async () => {
      setLoading(true);
      setErro(null);

      try {
        // 1. Busca o perfil da loja usando o slug da URL
        // A tabela é 'profiles' e a coluna é 'nome_loja', baseado no seu código de teste
        const { data: perfilData, error: perfilError } = await supabase
          .from('profiles')
          .select('id, nome_loja, user_id') // Seleciona os campos necessários
          .eq('nome_loja', slug)
          .single();

        if (perfilError) {
          throw new Error(perfilError.message);
        }
        
        if (!perfilData) {
          throw new Error("Catálogo não encontrado. Verifique se o link está correto.");
        }

        setPerfil(perfilData);

        // 2. Com o user_id do perfil, busca os produtos
        // A tabela é 'products' e a coluna é 'user_id'
        const { data: produtosData, error: produtosError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', perfilData.user_id) // Usa o user_id do perfil encontrado
          .eq('publicar_no_catalogo', true); // Garante que só produtos marcados apareçam

        if (produtosError) {
          throw new Error(produtosError.message);
        }
        
        setProdutos(produtosData || []);

      } catch (error) {
        console.error("Erro ao carregar o catálogo:", error);
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogoData();
  }, [slug]); // Roda o efeito sempre que o slug na URL mudar

  if (loading) {
    return <div className="p-8 text-center">Carregando catálogo...</div>;
  }

  if (erro) {
    return <div className="p-8 text-center text-red-600">Erro: {erro}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold">Catálogo de {perfil?.nome_loja}</h1>
      </header>
      
      {produtos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <div key={produto.id} className="border rounded-lg shadow-lg overflow-hidden">
              <img 
                src={produto.foto_url || 'https://via.placeholder.com/300'} 
                alt={produto.nome} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{produto.nome}</h2>
                <p className="text-gray-600 mt-2">{produto.descricao}</p>
                <p className="text-lg font-bold mt-4">R$ {produto.preco_venda}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-12">Nenhum produto encontrado neste catálogo.</p>
      )}
    </div>
  );
}
    </div>
  );
}
