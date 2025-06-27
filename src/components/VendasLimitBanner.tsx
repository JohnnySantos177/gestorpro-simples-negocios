import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, Calendar, FileText } from "lucide-react";
import { useVendasLimits } from "@/hooks/useVendasLimits";
import { useNavigate } from "react-router-dom";

export const VendasLimitBanner = () => {
  const { hasReachedLimit, limitType, remainingDays, remainingRegistros, totalRegistros } = useVendasLimits();
  const navigate = useNavigate();

  if (hasReachedLimit) {
    return (
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <Crown className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-orange-800">Limite de teste atingido!</strong>
            <p className="text-orange-700 mt-1">
              {limitType === "registros" 
                ? "Você atingiu o limite de 20 vendas de teste." 
                : "Você atingiu o limite de 7 dias de teste."
              }
              {" "}Para acesso ilimitado, assine um plano premium.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/assinatura")}
            className="bg-orange-600 hover:bg-orange-700 ml-4"
          >
            <Crown className="h-4 w-4 mr-2" />
            Assinar TotalGestor
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar aviso quando estiver próximo do limite
  if (remainingDays <= 2 || remainingRegistros <= 5) {
    return (
      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <Calendar className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-yellow-800">Limite de teste se aproximando</strong>
            <p className="text-yellow-700 mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {remainingDays} dias restantes
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {remainingRegistros} vendas restantes ({totalRegistros}/20)
              </span>
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate("/assinatura")}
            className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 ml-4"
          >
            <Crown className="h-4 w-4 mr-2" />
            Assinar TotalGestor
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
