
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AboutSubscription: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Sobre a Assinatura</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          O TotalGestor é oferecido como uma assinatura que proporciona acesso completo a todas as funcionalidades do sistema. Escolha a frequência que melhor se adequa ao seu fluxo de caixa.
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Pagamento Seguro</h3>
            <p className="text-sm text-muted-foreground">
              Seus dados de pagamento são protegidos com criptografia de ponta a ponta via Mercado Pago.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Cancelamento Flexível</h3>
            <p className="text-sm text-muted-foreground">
              Você pode cancelar sua assinatura a qualquer momento, sem taxas adicionais.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Garantia de Satisfação</h3>
            <p className="text-sm text-muted-foreground">
              Oferecemos garantia de 7 dias. Se não estiver satisfeito, devolveremos seu dinheiro.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Economia com Planos Longos</h3>
            <p className="text-sm text-muted-foreground">
              Quanto maior o período escolhido, maior sua economia. O plano semestral oferece 22% de desconto comparado ao mensal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
