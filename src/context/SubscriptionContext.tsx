
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionStatus: SubscriptionStatus;
  checkoutLoading: boolean;
  initiateCheckout: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    // Check if the user has a valid subscription in localStorage
    const saved = localStorage.getItem("gestorpro_subscription");
    if (saved) {
      const subscription = JSON.parse(saved);
      // Check if subscription is still valid
      if (new Date(subscription.expiresAt) > new Date()) {
        return true;
      }
    }
    return false;
  });
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("inactive");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  useEffect(() => {
    // Update the subscription status when isSubscribed changes
    setSubscriptionStatus(isSubscribed ? "active" : "inactive");
  }, [isSubscribed]);
  
  const initiateCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // Simulated checkout with a direct price
      const price = 5999; // R$59,99
      
      // In a real app, this would make a call to your backend or Stripe
      const sessionUrl = `#subscription-modal`;
      
      // For now we'll just simulate the checkout
      // window.open(sessionUrl, "_blank");
      
      // Simulated transaction for the demo
      toast.success("Redirecionando para pagamento...");
      
      setTimeout(() => {
        handleSuccessfulSubscription();
        setCheckoutLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
      setCheckoutLoading(false);
    }
  };
  
  const handleSuccessfulSubscription = () => {
    // Store subscription info in localStorage
    const subscription = {
      status: "active",
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    localStorage.setItem("gestorpro_subscription", JSON.stringify(subscription));
    
    setIsSubscribed(true);
    setSubscriptionStatus("active");
    toast.success("Assinatura ativada com sucesso!");
  };
  
  const value = {
    isSubscribed,
    subscriptionStatus,
    checkoutLoading,
    initiateCheckout
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
