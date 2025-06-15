
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart } from "lucide-react";

export const ManualDashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            6. Dashboard e Relatórios
          </CardTitle>
          <CardDescription>
            Tenha uma visão geral do seu negócio através do painel principal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">O que você encontra no Dashboard:</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Resumo de Vendas:</strong> Total de vendas do mês e comparações</li>
              <li><strong>Produtos em Estoque Baixo:</strong> Alertas de reposição</li>
              <li><strong>Clientes Recentes:</strong> Últimos cadastros</li>
              <li><strong>Receitas vs Despesas:</strong> Gráfico financeiro</li>
              <li><strong>Top Produtos:</strong> Mais vendidos do período</li>
              <li><strong>Estatísticas Gerais:</strong> Números totais do sistema</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Como interpretar os dados:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><span className="text-green-600 font-semibold">Verde:</span> Indicadores positivos</li>
              <li><span className="text-red-600 font-semibold">Vermelho:</span> Alertas que precisam de atenção</li>
              <li><span className="text-blue-600 font-semibold">Azul:</span> Informações neutras</li>
              <li>Use os filtros de período para análises específicas</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Dicas de uso:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Acesse o dashboard diariamente para monitorar seu negócio</li>
              <li>Fique atento aos alertas de estoque baixo</li>
              <li>Analise os produtos mais vendidos para estratégias de estoque</li>
              <li>Compare os períodos para identificar tendências</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm"><strong>Lembre-se:</strong> O dashboard é atualizado em tempo real conforme você registra vendas, produtos e transações.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">
            Agora que você conhece as funcionalidades principais, comece seguindo esta ordem:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Cadastre seus fornecedores principais</li>
            <li>Registre seus produtos com estoque atual</li>
            <li>Adicione seus clientes importantes</li>
            <li>Comece a registrar suas vendas</li>
            <li>Mantenha o financeiro atualizado</li>
            <li>Acompanhe o dashboard regularmente</li>
          </ol>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded">
            <p className="text-sm font-medium">
              💡 Dica Final: Use o TotalGestor diariamente para obter o máximo benefício do sistema!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
