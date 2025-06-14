
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
import { Badge } from "@/components/ui/badge";

const AssinaturaPage = () => {
  const { isSubscribed, checkoutLoading, initiateCheckout, checkSubscriptionStatus, subscriptionPrice } = useSubscription();
  const { isAdmin } = useAuth();
  const [adminPrice, setAdminPrice] = useState<number>(subscriptionPrice);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'semiannual'>('monthly');
  
  // Check subscription status when the page loads
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  // Plan configurations
  const plans = [
    {
      id: 'monthly' as const,
      name: 'Mensal',
      price: 8990, // R$ 89,90 in cents
      displayPrice: 89.90,
      interval: 'month',
      description: 'Renovação mensal',
      badge: null
    },
    {
      id: 'quarterly' as const,
      name: 'Trimestral',
      price: 7990, // R$ 79,90 in cents
      displayPrice: 79.90,
      interval: 'month',
      description: 'Cobrança a cada 3 meses',
      badge: 'Economia de 11%'
    },
    {
      id: 'semiannual' as const,
      name: 'Semestral',
      price: 6990, // R$ 69,90 in cents
      displayPrice: 69.90,
      interval: 'month',
      description: 'Cobrança a cada 6 meses',
      badge: 'Economia de 22%'
    }
  ];

  const handleSubscribe = async (planId: 'monthly' | 'quarterly' | 'semiannual') => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    // For now, we'll use the existing checkout with the selected plan price
    // In a real implementation, you'd pass the plan details to the checkout
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
        description="Escolha o plano Premium ideal para seu negócio e aproveite todos os recursos do TotalGestor."
      />
      
      {isSubscribed && (
        <div className="mb-8 bg-totalgestor-50 p-4 rounded-lg border border-totalgestor-100 text-center">
          <p className="font-semibold text-totalgestor-700 mb-2">
            Você já possui uma assinatura ativa!
          </p>
          <p className="text-sm text-muted-foreground">
            Aproveite todos os recursos premium do TotalGestor.
          </p>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Plans Section */}
        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Planos Premium</h2>
            <p className="text-muted-foreground">
              Escolha a frequência de pagamento que melhor se adequa ao seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${selectedPlan === plan.id ? 'ring-2 ring-totalgestor-500' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default" className="bg-totalgestor-500">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{formatCurrency(plan.displayPrice)}</span>
                    <span className="text-muted-foreground ml-1">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkoutLoading || isSubscribed}
                    className="w-full bg-totalgestor-500 hover:bg-totalgestor-600"
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                  >
                    {checkoutLoading ? "Processando..." : isSubscribed ? "Plano Ativo" : "Assinar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <Card>
            <CardHeader>
              <CardTitle>Todos os planos incluem:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {beneficios.map((beneficio, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-totalgestor-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{beneficio}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin controls */}
          {isAdmin && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Configurações de Administrador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-price">Preço da Assinatura (R$)</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="subscription-price" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="89.90"
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
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex-1">
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
                    Seus dados de pagamento são protegidos com criptografia de ponta a ponta.
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
        </div>
      </div>
    </Layout>
  );
};

export default AssinaturaPage;
