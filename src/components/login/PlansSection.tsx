
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
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
      ]
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
        'Exportação de dados',
        '2 meses grátis'
      ],
      popular: true
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
      ]
    }
  ];

  return (
    <section id="plans" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Escolha o Plano Ideal Para Seu Negócio
          </h2>
          <p className="text-xl text-muted-foreground">
            Preços transparentes e sem surpresas
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary border-2' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatCurrency(plan.displayPrice)}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => initiateCheckout(plan.id)}
                  disabled={checkoutLoading || isSubscribed}
                >
                  {checkoutLoading ? "Processando..." : isSubscribed ? "Plano Ativo" : "Assinar Agora"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
