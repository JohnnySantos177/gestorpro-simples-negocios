import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";
import { supabase } from "@/lib/supabase";

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco_venda: number; // Corrigido: era precoVenda
  foto_url?: string;
}

interface Perfil {
  nome: string;
  nome_loja: string;
  id: string; // Corrigido: era user_id, mas o campo correto é id
}

const CatalogoPage: React.FC = () => {
  const { nome_loja } = useParams<{ nome_loja: string }>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCatalogo = async () => {
      setLoading(true);
      setNotFound(false);
      
      try {
        console.log('Buscando catálogo para:', nome_loja);

        // Buscar perfil pelo nome_loja
        const { data: perfilData, error: perfilError } = await supabase
          .from('profiles')
          .select('nome, nome_loja, id') // Corrigido: usar 'id' em vez de 'user_id'
          .eq('nome_loja', nome_loja)
          .single();

        if (perfilError || !perfilData) {
          console.error('Erro ao buscar perfil:', perfilError);
          throw new Error("Perfil não encontrado");
        }

        console.log('Perfil encontrado:', perfilData);
        setPerfil(perfilData);

        // Buscar produtos publicados do usuário
        const { data: produtosData, error: produtosError } = await supabase
          .from('produtos')
          .select('id, nome, descricao, preco_venda, foto_url') // Corrigido: preco_venda
          .eq('user_id', perfilData.id) // user_id referencia o id do profiles
          .eq('publicar_no_catalogo', true);
          // Removido: .eq('ativo', true) - coluna não existe

        if (produtosError) {
          console.error('Erro ao buscar produtos:', produtosError);
          // Não lance erro aqui, apenas deixe produtos vazio
        }

        console.log('Produtos encontrados:', produtosData?.length || 0);
        console.log('Dados dos produtos:', produtosData);
        setProdutos(produtosData || []);

      } catch (err) {
        console.error('Erro ao buscar catálogo:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (nome_loja) {
      fetchCatalogo();
    }
  }, [nome_loja]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          Carregando catálogo...
        </div>
      </div>
    );
  }

  if (notFound || !perfil) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Catálogo não encontrado</div>
          <p className="text-muted-foreground">
            O catálogo "{nome_loja}" não existe ou não está disponível.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="mb-8 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Catálogo de {perfil.nome}
            </CardTitle>
            <Badge className="mt-2">{perfil.nome_loja}</Badge>
          </CardHeader>
        </Card>

        <div className="grid gap-8 md:grid-cols-3 sm:grid-cols-2">
          {produtos.length === 0 ? (
            <div className="col-span-full text-center">
              <div className="text-muted-foreground text-lg mb-2">
                Nenhum produto publicado no catálogo
              </div>
              <p className="text-sm text-muted-foreground">
                Os produtos aparecerão aqui quando forem marcados para publicação no catálogo.
              </p>
            </div>
          ) : (
            produtos.map((produto) => (
              <Card 
                key={produto.id} 
                className="hover:shadow-xl transition-shadow duration-200 overflow-hidden"
              >
                {produto.foto_url && (
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={produto.foto_url} 
                      alt={produto.nome} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" 
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg line-clamp-2">
                      {produto.nome}
                    </h3>
                    {produto.descricao && (
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {produto.descricao}
                      </p>
                    )}
                    <div className="text-primary font-semibold text-xl mt-2">
                      {formatCurrency(produto.preco_venda)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogoPage;
