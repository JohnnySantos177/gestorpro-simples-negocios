
import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSubscription } from "@/context/SubscriptionContext";
import { formatCurrency } from "@/utils/format";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AssinaturaPage = () => {
  const { isSubscribed, checkoutLoading, initiateCheckout, checkSubscriptionStatus, subscriptionPrice } = useSubscription();
  const { isAdmin } = useAuth();
  const [adminPrice, setAdminPrice] = useState<number>(subscriptionPrice);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check subscription status when the page loads
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);
  
  // Format the price for display (dividing by 100 to convert from cents)
  const priceInReais = subscriptionPrice / 100;

  const handleSubscribe = async () => {
    await initiateCheckout();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAdminPrice(isNaN(value) ? 0 : value * 100); // Convert to cents
  };

  const handleUpdatePrice = async () => {
    if (adminPrice <= 0) {
      toast.error("O preço deve ser maior que zero");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('manage-subscription-price', {
        body: { price: adminPrice }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Preço da assinatura atualizado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao atualizar preço: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const beneficios = [
    "Acesso a todos os módulos do sistema",
    "Dados armazenados de forma segura",
    "Atualizações contínuas do sistema",
    "Relatórios avançados e análises de negócios",
    "Suporte técnico prioritário",
    "Backup automático dos seus dados",
    "Acesso via dispositivos móveis",
    "Exportação dos relatórios em múltiplos formatos"
  ];
  
  return (
    <Layout>
      <PageHeader
        title="Assinatura"
        description="Gerencie sua assinatura do TotalGestor e aproveite todos os recursos premium."
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Plano Premium</CardTitle>
            <CardDescription>
              Acesso completo a todas as funcionalidades do TotalGestor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 text-center">
              <span className="text-3xl font-bold">{formatCurrency(priceInReais)}</span>
              <span className="text-muted-foreground ml-1">/mês</span>
            </div>
            
            <Separator className="mb-6" />
            
            <div className="space-y-4">
              {beneficios.map((beneficio, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-totalgestor-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{beneficio}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              {isSubscribed ? (
                <div className="bg-totalgestor-50 p-4 rounded-lg border border-totalgestor-100 text-center">
                  <p className="font-semibold text-totalgestor-700 mb-2">
                    Você já possui uma assinatura ativa!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aproveite todos os recursos premium do TotalGestor.
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="w-full bg-totalgestor-500 hover:bg-totalgestor-600"
                >
                  {checkoutLoading ? "Processando..." : "Assinar com Stripe"}
                </Button>
              )}
            </div>

            {/* Admin controls */}
            {isAdmin && (
              <div className="mt-8 border-t pt-6">
                <h3 className="font-semibold mb-4">Configurações de Administrador</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-price">Preço da Assinatura (R$)</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="subscription-price" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="59.99"
                        defaultValue={(adminPrice / 100).toFixed(2)}
                        onChange={handlePriceChange}
                      />
                      <Button 
                        onClick={handleUpdatePrice}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Atualizando..." : "Atualizar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sobre a Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                O TotalGestor é oferecido como uma assinatura mensal que proporciona acesso completo a todas as funcionalidades do sistema.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Pagamento Seguro com Stripe</h3>
                  <p className="text-sm text-muted-foreground">
                    Seus dados de pagamento são protegidos com criptografia de ponta a ponta pela plataforma Stripe.
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
                    Oferecemos garantia de 30 dias. Se não estiver satisfeito, devolveremos seu dinheiro.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Como funciona a cobrança?</h3>
                  <p className="text-sm text-muted-foreground">
                    A assinatura é cobrada mensalmente através da Stripe e renovada automaticamente até que você cancele.
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
                
                <div>
                  <h3 className="font-semibold mb-1">Há contratos de fidelidade?</h3>
                  <p className="text-sm text-muted-foreground">
                    Não, você pode cancelar a qualquer momento sem multas ou taxas adicionais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AssinaturaPage;
