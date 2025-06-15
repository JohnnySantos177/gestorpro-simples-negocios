
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertCircle } from "lucide-react";

export const ManualVendas: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            4. Registrando Vendas
          </CardTitle>
          <CardDescription>
            Com fornecedores, produtos e clientes cadastrados, você pode registrar suas vendas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Como registrar uma venda:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Acesse <Badge variant="outline">Vendas</Badge> no menu</li>
              <li>Clique em <Badge variant="default">Nova Venda</Badge></li>
              <li>Selecione ou cadastre o cliente</li>
              <li>Adicione produtos à venda:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Selecione o produto</li>
                  <li>Defina a quantidade</li>
                  <li>Confirme o preço (pode ser alterado)</li>
                </ul>
              </li>
              <li>Escolha a forma de pagamento</li>
              <li>Defina o status da venda (Pendente, Paga, Cancelada)</li>
              <li>Finalize a venda</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Status das vendas:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><Badge variant="secondary">Pendente</Badge> - Venda registrada, aguardando pagamento</li>
              <li><Badge variant="default">Paga</Badge> - Venda concluída com sucesso</li>
              <li><Badge variant="destructive">Cancelada</Badge> - Venda cancelada</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Funcionalidades importantes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>O estoque é automaticamente reduzido quando a venda é finalizada</li>
              <li>Histórico completo de vendas por cliente</li>
              <li>Relatórios de vendas por período</li>
              <li>Controle de formas de pagamento</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-sm"><strong>Lembre-se:</strong> Vendas finalizadas reduzem automaticamente o estoque. Verifique sempre a disponibilidade antes de confirmar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
