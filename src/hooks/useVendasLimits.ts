
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

export const useVendasLimits = () => {
  const { compras } = useData();
  const { isSubscribed } = useSubscription();
  const { profile } = useAuth();
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [limitType, setLimitType] = useState<"registros" | "tempo" | null>(null);

  useEffect(() => {
    if (isSubscribed) {
      setHasReachedLimit(false);
      setLimitType(null);
      return;
    }

    // Verificar limite de 20 registros
    if (compras.length >= 20) {
      setHasReachedLimit(true);
      setLimitType("registros");
      return;
    }

    // Verificar limite de 7 dias
    if (profile?.created_at) {
      const accountCreatedDate = new Date(profile.created_at);
      const sevenDaysLater = new Date(accountCreatedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now >= sevenDaysLater) {
        setHasReachedLimit(true);
        setLimitType("tempo");
        return;
      }
    }

    setHasReachedLimit(false);
    setLimitType(null);
  }, [compras.length, isSubscribed, profile?.created_at]);

  const getRemainingDays = () => {
    if (!profile?.created_at) return 0;
    
    const accountCreatedDate = new Date(profile.created_at);
    const sevenDaysLater = new Date(accountCreatedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remainingTime = sevenDaysLater.getTime() - now.getTime();
    
    return Math.max(0, Math.ceil(remainingTime / (24 * 60 * 60 * 1000)));
  };

  const getRemainingRegistros = () => {
    return Math.max(0, 20 - compras.length);
  };

  return {
    hasReachedLimit,
    limitType,
    remainingDays: getRemainingDays(),
    remainingRegistros: getRemainingRegistros(),
    totalRegistros: compras.length,
  };
};
