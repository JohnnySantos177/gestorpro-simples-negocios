
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Edit, Trash2 } from "lucide-react";

export const ManualFornecedores: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            1. Cadastro de Fornecedores
          </CardTitle>
          <CardDescription>
            O primeiro passo é cadastrar seus fornecedores para facilitar o controle de produtos e compras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Como cadastrar um fornecedor:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Acesse o menu <Badge variant="outline">Fornecedores</Badge> na barra lateral</li>
              <li>Clique no botão <Badge variant="default">Novo Fornecedor</Badge></li>
              <li>Preencha as informações obrigatórias:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>Nome:</strong> Nome da empresa fornecedora</li>
                  <li><strong>Contato:</strong> Pessoa responsável</li>
                  <li><strong>Telefone:</strong> Para contato direto</li>
                </ul>
              </li>
              <li>Preencha informações adicionais se desejar:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>E-mail, endereço completo, CNPJ</li>
                  <li>Prazo de entrega padrão</li>
                  <li>Observações importantes</li>
                </ul>
              </li>
              <li>Clique em <Badge variant="default">Salvar</Badge></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Gerenciando fornecedores:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><Edit className="h-4 w-4 inline mr-1" />Use o ícone de edição para alterar dados</li>
              <li><Trash2 className="h-4 w-4 inline mr-1" />Use o ícone de lixeira para excluir (cuidado!)</li>
              <li>Use a barra de pesquisa para encontrar fornecedores rapidamente</li>
              <li>Ordene por nome, cidade ou prazo de entrega</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm"><strong>Dica:</strong> Cadastre seus principais fornecedores primeiro. Isso facilitará o cadastro de produtos posteriormente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
