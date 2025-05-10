
import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSubscription } from "@/context/SubscriptionContext";
import { formatCurrency } from "@/utils/format";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AssinaturaPage = () => {
  const { isSubscribed, checkoutLoading, initiateCheckout } = useSubscription();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: ""
  });
  
  const handleSubscribe = async () => {
    setSubscriptionModalOpen(true);
  };
  
  const handleSubmitPayment = async () => {
    // Validate form
    if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiry || !paymentInfo.cvv) {
      alert("Por favor preencha todos os campos de pagamento");
      return;
    }
    
    setSubscriptionModalOpen(false);
    await initiateCheckout();
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
        description="Gerencie sua assinatura do Gestor Pro e aproveite todos os recursos premium."
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Plano Premium</CardTitle>
            <CardDescription>
              Acesso completo a todas as funcionalidades do Gestor Pro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 text-center">
              <span className="text-3xl font-bold">{formatCurrency(59.99)}</span>
              <span className="text-muted-foreground ml-1">/mês</span>
            </div>
            
            <Separator className="mb-6" />
            
            <div className="space-y-4">
              {beneficios.map((beneficio, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{beneficio}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              {isSubscribed ? (
                <div className="bg-gestorpro-50 p-4 rounded-lg border border-gestorpro-100 text-center">
                  <p className="font-semibold text-gestorpro-700 mb-2">
                    Você já possui uma assinatura ativa!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aproveite todos os recursos premium do Gestor Pro.
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="w-full bg-gestorpro-500 hover:bg-gestorpro-600"
                >
                  {checkoutLoading ? "Processando..." : "Assinar Agora"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sobre a Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                O Gestor Pro é oferecido como uma assinatura mensal que proporciona acesso completo a todas as funcionalidades do sistema.
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
                    A assinatura é cobrada mensalmente e renovada automaticamente até que você cancele.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Posso usar em múltiplos dispositivos?</h3>
                  <p className="text-sm text-muted-foreground">
                    Sim, você pode acessar o sistema de qualquer dispositivo com acesso à internet.
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
      
      {/* Modal de Pagamento */}
      <Dialog open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Informações de Pagamento</DialogTitle>
            <button 
              onClick={() => setSubscriptionModalOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={paymentInfo.cardNumber}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="NOME COMPLETO"
                value={paymentInfo.cardName}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Data de Validade</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={paymentInfo.expiry}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentInfo.cvv}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mt-4 rounded-lg bg-muted p-4">
              <div className="flex justify-between mb-2">
                <span>Plano Premium</span>
                <span>{formatCurrency(59.99)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(59.99)}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubscriptionModalOpen(false)}
              disabled={checkoutLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitPayment}
              disabled={checkoutLoading}
              className="bg-gestorpro-500 hover:bg-gestorpro-600"
            >
              {checkoutLoading ? "Processando..." : "Pagar e Assinar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AssinaturaPage;
