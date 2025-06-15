
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export const ManualClientes: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            3. Cadastro de Clientes
          </CardTitle>
          <CardDescription>
            Registre seus clientes para facilitar as vendas e manter um histórico de relacionamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Como cadastrar um cliente:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Vá para <Badge variant="outline">Clientes</Badge> no menu</li>
              <li>Clique em <Badge variant="default">Novo Cliente</Badge></li>
              <li>Informações obrigatórias:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>Nome:</strong> Nome completo ou razão social</li>
                </ul>
              </li>
              <li>Informações recomendadas:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>E-mail:</strong> Para comunicação</li>
                  <li><strong>Telefone:</strong> Contato direto</li>
                  <li><strong>Endereço completo:</strong> Para entregas</li>
                  <li><strong>Grupo:</strong> Organize por tipo de cliente</li>
                </ul>
              </li>
              <li>Adicione observações importantes sobre o cliente</li>
              <li>Salve o cadastro</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Organizando clientes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use <strong>Grupos</strong> para categorizar (ex: VIP, Atacado, Varejo)</li>
              <li>Mantenha dados de contato sempre atualizados</li>
              <li>Use o campo <strong>Observações</strong> para notas importantes</li>
              <li>Pesquise por nome, e-mail ou telefone</li>
            </ul>
          </div>

          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm"><strong>Dica:</strong> Um cadastro completo de clientes facilita a criação de vendas e o relacionamento com o cliente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
