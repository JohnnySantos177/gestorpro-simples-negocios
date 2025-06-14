
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FAQ: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perguntas Frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Como funciona a cobrança?</h3>
            <p className="text-sm text-muted-foreground">
              A assinatura é cobrada de acordo com o plano escolhido e renovada automaticamente até que você cancele.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Posso trocar de plano?</h3>
            <p className="text-sm text-muted-foreground">
              Sim, você pode alterar seu plano a qualquer momento entrando em contato com nosso suporte.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Posso usar em múltiplos dispositivos?</h3>
            <p className="text-sm text-muted-foreground">
              Sim, você pode acessar o sistema de qualquer dispositivo com acesso à internet, incluindo computadores, tablets e smartphones.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">O que acontece se eu cancelar?</h3>
            <p className="text-sm text-muted-foreground">
              Você terá acesso ao sistema até o final do período pago. Seus dados serão mantidos por 30 dias após o cancelamento.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
