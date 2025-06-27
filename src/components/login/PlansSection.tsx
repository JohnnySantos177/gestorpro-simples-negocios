import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Zap, Shield } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { formatCurrency } from "@/utils/format";

export const PlansSection = () => {
  const { initiateCheckout, checkoutLoading, isSubscribed } = useSubscription();

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Mensal',
      price: 8990,
      displayPrice: 89.90,
      interval: 'mensal',
      description: 'Ideal para começar',
      features: [
        'Acesso completo ao sistema',
        'Gestão de clientes ilimitados',
        'Controle de estoque',
        'Relatórios básicos',
        'Suporte por email'
      ],
      color: 'from-gray-100 to-gray-200',
      textColor: 'text-gray-900'
    },
    {
      id: 'semiannual' as const,
      name: 'Semestral',
      price: 6990,
      displayPrice: 69.90,
      interval: 'mensal',
      description: 'Mais popular - Economize 22%',
      features: [
        'Todos os recursos do plano mensal',
        'Relatórios avançados',
        'Backup automático',
        'Suporte prioritário',
        'Exportação de dados'
      ],
      popular: true,
      color: 'from-primary to-secondary',
      textColor: 'text-white'
    },
    {
      id: 'quarterly' as const,
      name: 'Trimestral',
      price: 7990,
      displayPrice: 79.90,
      interval: 'mensal',
      description: 'Economize 11%',
      features: [
        'Todos os recursos do plano mensal',
        'Relatórios avançados',
        'Backup automático',
        'Suporte prioritário'
      ],
      color: 'from-blue-100 to-indigo-200',
      textColor: 'text-gray-900'
    }
  ];

  return (
    <section id="plans" className="py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-primary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-6 py-3 rounded-full mb-8 animate-fade-in">
            <Star className="h-5 w-5" />
            <span className="font-semibold">PLANOS ESPECIAIS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Escolha o Plano{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ideal Para Seu Negócio
            </span>
          </h2>
          <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Preços transparentes e sem surpresas. Cancele quando quiser.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`group relative transition-all duration-300 hover:scale-105 border-0 shadow-xl hover:shadow-2xl animate-fade-in ${
                plan.popular 
                  ? 'ring-2 ring-primary shadow-primary/20' 
                  : 'shadow-gray-200'
              }`}
              style={{ animationDelay: `${0.6 + index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Mais Popular
                  </div>
                </div>
              )}
              
              <div className={`h-2 rounded-t-lg bg-gradient-to-r ${plan.color}`}></div>
              
              <CardHeader className={`text-center pb-8 ${plan.popular ? 'bg-gradient-to-br from-primary/5 to-secondary/5' : ''} rounded-t-lg`}>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {formatCurrency(plan.displayPrice)}
                  </span>
                  <span className="text-muted-foreground text-lg">/mês</span>
                </div>
                {plan.popular && (
                  <div className="mt-4 inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                    Melhor custo-benefício
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full h-12 font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl' 
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => initiateCheckout(plan.id)}
                  disabled={checkoutLoading || isSubscribed}
                >
                  {checkoutLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </div>
                  ) : isSubscribed ? (
                    "Plano Ativo"
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Assinar Agora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money back guarantee */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '1.4s' }}>
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Garantia de 7 dias - 100% do seu dinheiro de volta</span>
          </div>
        </div>
      </div>
    </section>
  );
};
