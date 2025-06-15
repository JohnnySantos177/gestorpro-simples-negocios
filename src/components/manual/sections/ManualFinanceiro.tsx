
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

export const ManualFinanceiro: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            5. Controle Financeiro
          </CardTitle>
          <CardDescription>
            Acompanhe suas finanças com controle de receitas, despesas e fluxo de caixa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Funcionalidades do financeiro:</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Receitas:</strong> Registre entradas de dinheiro (vendas, outros recebimentos)</li>
              <li><strong>Despesas:</strong> Controle gastos (compras, aluguel, funcionários, etc.)</li>
              <li><strong>Categorização:</strong> Organize por tipo de transação</li>
              <li><strong>Relatórios:</strong> Visualize resumos por período</li>
              <li><strong>Saldo:</strong> Acompanhe o saldo atual e projeções</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Como usar:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Acesse <Badge variant="outline">Financeiro</Badge></li>
              <li>Use <Badge variant="default">Nova Transação</Badge> para adicionar entradas</li>
              <li>Selecione o tipo: <Badge variant="secondary">Receita</Badge> ou <Badge variant="destructive">Despesa</Badge></li>
              <li>Categorize adequadamente</li>
              <li>Acompanhe os relatórios mensais</li>
            </ol>
          </div>

          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm"><strong>Importante:</strong> Mantenha o financeiro sempre atualizado para ter uma visão real da saúde do seu negócio.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
