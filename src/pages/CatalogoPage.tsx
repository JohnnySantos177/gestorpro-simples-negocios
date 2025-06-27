import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  precoVenda: number;
  foto_url?: string;
}

interface Perfil {
  nome: string;
  nome_loja: string;
}

const getFunctionsBaseUrl = () => {
  // Em produção, use a URL do Supabase Cloud
  if (import.meta.env.PROD) {
    return 'https://<SEU-PROJETO>.functions.supabase.co'; // Substitua <SEU-PROJETO> pelo seu subdomínio do Supabase
  }
  // Em dev, use o proxy local
  return '/functions/v1';
};

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
        const baseUrl = getFunctionsBaseUrl();
        // Buscar perfil pelo nome_loja
        const perfilRes = await fetch(`${baseUrl}/public-catalogo-perfil/${nome_loja}`);
        if (!perfilRes.ok) throw new Error("Perfil não encontrado");
        const perfilData = await perfilRes.json();
        setPerfil(perfilData);
        // Buscar produtos publicados
        const produtosRes = await fetch(`${baseUrl}/public-catalogo-produtos/${nome_loja}`);
        if (!produtosRes.ok) throw new Error("Produtos não encontrados");
        const produtosData = await produtosRes.json();
        setProdutos(produtosData);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (nome_loja) fetchCatalogo();
  }, [nome_loja]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Carregando catálogo...</div>;
  }
  if (notFound || !perfil) {
    return <div className="flex justify-center items-center min-h-[60vh] text-red-500">Catálogo não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="mb-8 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Catálogo de {perfil.nome}</CardTitle>
            <Badge className="mt-2">{perfil.nome_loja}</Badge>
          </CardHeader>
        </Card>
        <div className="grid gap-8 md:grid-cols-3 sm:grid-cols-2">
          {produtos.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">Nenhum produto publicado no catálogo.</div>
          ) : (
            produtos.map((produto) => (
              <Card key={produto.id} className="hover:shadow-xl transition-shadow duration-200">
                {produto.foto_url && (
                  <img src={produto.foto_url} alt={produto.nome} className="w-full h-48 object-cover rounded-t" />
                )}
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-lg">{produto.nome}</span>
                    <span className="text-muted-foreground text-sm">{produto.descricao}</span>
                    <span className="text-primary font-semibold text-xl">{formatCurrency(produto.precoVenda)}</span>
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