import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";

interface Plan {
  id: 'monthly' | 'quarterly' | 'semiannual';
  name: string;
  price: number;
  displayPrice: number;
  interval: string;
  description: string;
  badge: string | null;
}

interface PlanCardProps {
  plan: Plan;
  selectedPlan: 'monthly' | 'quarterly' | 'semiannual';
  isSubscribed: boolean;
  checkoutLoading: boolean;
  onSubscribe: (planId: 'monthly' | 'quarterly' | 'semiannual') => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  selectedPlan,
  isSubscribed,
  checkoutLoading,
  onSubscribe
}) => {
  return (
    <Card 
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
          onClick={() => onSubscribe(plan.id)}
          disabled={checkoutLoading || isSubscribed}
          className="w-full bg-totalgestor-500 hover:bg-totalgestor-600"
          variant={selectedPlan === plan.id ? "default" : "outline"}
        >
          {checkoutLoading ? "Processando..." : isSubscribed ? "Plano Ativo" : "Assinar TotalGestor"}
        </Button>
      </CardContent>
    </Card>
  );
};
