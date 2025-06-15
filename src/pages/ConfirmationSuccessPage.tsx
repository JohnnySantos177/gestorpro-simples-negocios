
import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";

const ConfirmationSuccessPage = () => {
  const { checkSubscriptionStatus } = useSubscription();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const status = searchParams.get("status");

  useEffect(() => {
    // Se veio do Mercado Pago, aguardar um pouco para o webhook processar
    if (sessionId || status) {
      console.log("Confirmação recebida do Mercado Pago", { sessionId, status });
      
      // Aguardar 3 segundos para dar tempo do webhook processar
      const timer = setTimeout(() => {
        checkSubscriptionStatus();
        toast.success("Verificando status da sua assinatura...");
      }, 3000);

      return () => clearTimeout(timer);
    }
    
    // Verificar status imediatamente se não veio do Mercado Pago
    checkSubscriptionStatus();
  }, [sessionId, status, checkSubscriptionStatus]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-center">
            {/* Logo do TotalGestor - agora maior */}
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/lovable-uploads/06397695-3081-4591-9816-edb718b6ee10.png" 
                alt="TotalGestor Logo" 
                className="h-20 w-20 mr-2" 
              />
              <span className="font-bold text-3xl text-totalgestor-500">TotalGestor</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Pagamento Processado!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Seu pagamento foi processado com sucesso. 
          </p>
          {status === "pending" && (
            <p className="text-yellow-600 text-sm mb-4">
              ⚠️ Seu pagamento está pendente de confirmação. Você receberá uma notificação quando for aprovado.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Estamos ativando sua assinatura premium. Isso pode levar alguns minutos.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login">
            <Button className="bg-totalgestor-500 hover:bg-totalgestor-600 text-white">
              Ir para Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmationSuccessPage;
