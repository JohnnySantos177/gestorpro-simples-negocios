
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionStatus: SubscriptionStatus;
  checkoutLoading: boolean;
  subscriptionPrice: number;
  initiateCheckout: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
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
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("inactive");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(5999); // Default R$59.99 in cents
  
  // Check subscription status on mount and when auth state changes
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkSubscriptionStatus();
      } catch (error) {
        console.error("Error checking initial subscription status:", error);
      }
    };
    
    // Get current subscription price
    const getPrice = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-subscription-price');
        
        if (error) {
          console.error("Error getting subscription price:", error);
          return;
        }
        
        if (data && data.price) {
          setSubscriptionPrice(data.price);
        }
      } catch (error) {
        console.error("Error fetching subscription price:", error);
      }
    };
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkStatus();
        getPrice();
      } else if (event === 'SIGNED_OUT') {
        setIsSubscribed(false);
        setSubscriptionStatus("inactive");
      }
    });

    checkStatus();
    getPrice();
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  const checkSubscriptionStatus = async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        setIsSubscribed(false);
        setSubscriptionStatus("inactive");
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error("Error checking subscription status:", error);
        toast.error("Erro ao verificar status da assinatura");
        return;
      }
      
      setIsSubscribed(data.subscribed);
      setSubscriptionStatus(data.subscribed ? "active" : "inactive");
      
      // If subscribed, store the info in localStorage as well for offline access
      if (data.subscribed) {
        const subscription = {
          status: "active",
          startedAt: new Date().toISOString(),
          expiresAt: data.subscription_end,
        };
        localStorage.setItem("gestorpro_subscription", JSON.stringify(subscription));
      } else {
        localStorage.removeItem("gestorpro_subscription");
      }
    } catch (error) {
      console.error("Error in checkSubscriptionStatus:", error);
    }
  };
  
  const initiateCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { price: subscriptionPrice }
      });
      
      if (error) {
        console.error("Error initiating checkout:", error);
        toast.error("Erro ao iniciar o checkout");
        return;
      }
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
        toast.info("Redirecionando para página de pagamento");
      } else {
        toast.error("Erro ao gerar link de pagamento");
      }
    } catch (error) {
      console.error("Error in initiateCheckout:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  const value = {
    isSubscribed,
    subscriptionStatus,
    checkoutLoading,
    subscriptionPrice,
    initiateCheckout,
    checkSubscriptionStatus
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
