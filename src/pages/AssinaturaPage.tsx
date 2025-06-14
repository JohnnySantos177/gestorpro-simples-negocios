
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { PlanCard } from "@/components/subscription/PlanCard";
import { BenefitsList } from "@/components/subscription/BenefitsList";
import { AdminPriceSettings } from "@/components/subscription/AdminPriceSettings";
import { AboutSubscription } from "@/components/subscription/AboutSubscription";
import { FAQ } from "@/components/subscription/FAQ";

const AssinaturaPage = () => {
  const { isSubscribed, checkoutLoading, initiateCheckout, checkSubscriptionStatus, subscriptionPrice } = useSubscription();
  const { isAdmin } = useAuth();
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
    setSelectedPlan(planId);
    await initiateCheckout(planId);
  };
  
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
              <PlanCard
                key={plan.id}
                plan={plan}
                selectedPlan={selectedPlan}
                isSubscribed={isSubscribed}
                checkoutLoading={checkoutLoading}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>

          <BenefitsList />

          {/* Admin controls */}
          {isAdmin && (
            <div className="mt-6">
              <AdminPriceSettings subscriptionPrice={subscriptionPrice} />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <AboutSubscription />
          <FAQ />
        </div>
      </div>
    </Layout>
  );
};

export default AssinaturaPage;
