
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionStatus: SubscriptionStatus;
  checkoutLoading: boolean;
  subscriptionPrice: number;
  initiateCheckout: (planType?: 'monthly' | 'quarterly' | 'semiannual') => Promise<void>;
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
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(8990); // Default R$89.90 in cents
  
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
        
        if (data && data.price && !isNaN(data.price) && data.price > 0) {
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
        // Don't show error toast for missing Mercado Pago key - just silently fail
        if (!error.message?.includes("temporarily unavailable")) {
          toast.error("Erro ao verificar status da assinatura");
        }
        setIsSubscribed(false);
        setSubscriptionStatus("inactive");
        return;
      }
      
      // Handle the case where subscription service is unavailable
      if (data?.error) {
        console.warn("Subscription service issue:", data.error);
        setIsSubscribed(false);
        setSubscriptionStatus("inactive");
        return;
      }
      
      setIsSubscribed(data.subscribed || false);
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
      setIsSubscribed(false);
      setSubscriptionStatus("inactive");
    }
  };
  
  const initiateCheckout = async (planType: 'monthly' | 'quarterly' | 'semiannual' = 'monthly') => {
    setCheckoutLoading(true);
    try {
      console.log("Iniciating checkout for plan:", planType);
      
      // Check if user is authenticated
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error("Você precisa estar logado para fazer uma assinatura");
        return;
      }

      // Plan prices
      const planPrices = {
        monthly: 8990, // R$ 89,90
        quarterly: 7990, // R$ 79,90 per month
        semiannual: 6990 // R$ 69,90 per month
      };

      const price = planPrices[planType];

      // Input validation
      if (!price || price <= 0) {
        toast.error("Preço da assinatura inválido");
        return;
      }

      console.log("Calling create-checkout function with:", { price, planType });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          price,
          planType,
          isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        }
      });
      
      console.log("Create-checkout response:", { data, error });
      
      if (error) {
        console.error("Error initiating checkout:", error);
        
        // Handle specific error cases
        if (error.message?.includes("temporarily unavailable")) {
          toast.error("Serviço de pagamento temporariamente indisponível. Tente novamente mais tarde.");
        } else if (error.message?.includes("not configured")) {
          toast.error("Serviço de pagamento não configurado. Entre em contato com o suporte.");
        } else {
          toast.error("Erro ao iniciar o checkout: " + (error.message || "Erro desconhecido"));
        }
        return;
      }
      
      if (!data) {
        toast.error("Resposta vazia do serviço de pagamento");
        return;
      }

      if (data.error) {
        console.error("Checkout service error:", data.error);
        toast.error("Erro no serviço: " + data.error);
        return;
      }
      
      if (data.url) {
        console.log("Redirecting to checkout URL:", data.url);
        // Security improvement: validate URL before redirect
        try {
          const url = new URL(data.url);
          if (url.hostname.includes('mercadopago.com') || url.hostname.includes('mercadolibre.com')) {
            toast.info("Redirecionando para página de pagamento...");
            // Add a small delay to show the toast
            setTimeout(() => {
              // Para mobile, usar window.location.href em vez de window.open
              if (window.innerWidth < 768) {
                window.location.href = data.url;
              } else {
                window.open(data.url, '_blank');
              }
            }, 1000);
          } else {
            throw new Error("Invalid redirect URL");
          }
        } catch (urlError) {
          console.error("Invalid checkout URL:", urlError);
          toast.error("URL de pagamento inválida");
        }
      } else {
        console.error("No URL returned from checkout service");
        toast.error("Erro: Link de pagamento não foi gerado");
      }
    } catch (error) {
      console.error("Error in mobile checkout:", error);
      toast.error("Erro ao processar pagamento: " + (error.message || "Erro desconhecido"));
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
