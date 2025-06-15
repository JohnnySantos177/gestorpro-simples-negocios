
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";

export const ManualProdutos: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            2. Cadastro de Produtos
          </CardTitle>
          <CardDescription>
            Após cadastrar os fornecedores, registre seus produtos para controlar estoque e vendas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Como cadastrar um produto:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Acesse o menu <Badge variant="outline">Produtos</Badge></li>
              <li>Clique em <Badge variant="default">Novo Produto</Badge></li>
              <li>Preencha as informações básicas:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>Nome:</strong> Nome do produto</li>
                  <li><strong>Categoria:</strong> Selecione ou digite uma categoria</li>
                  <li><strong>Preço de Compra:</strong> Quanto você paga pelo produto</li>
                  <li><strong>Preço de Venda:</strong> Quanto você vende o produto</li>
                  <li><strong>Quantidade:</strong> Estoque inicial</li>
                </ul>
              </li>
              <li>Selecione o fornecedor (se aplicável)</li>
              <li>Adicione informações extras se necessário:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Descrição detalhada</li>
                  <li>Data de validade</li>
                  <li>Código de barras</li>
                  <li>Localização no estoque</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Controle de estoque:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Produtos com estoque baixo (≤10) aparecem em <span className="text-red-500 font-semibold">vermelho</span></li>
              <li>Use o botão <Badge variant="outline">Atualizar</Badge> para sincronizar dados</li>
              <li>Filtre por categoria clicando nos botões de categoria</li>
              <li>Use a pesquisa para encontrar produtos específicos</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-3 rounded flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-sm"><strong>Importante:</strong> Mantenha os preços sempre atualizados. O sistema calculará automaticamente a margem de lucro.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
