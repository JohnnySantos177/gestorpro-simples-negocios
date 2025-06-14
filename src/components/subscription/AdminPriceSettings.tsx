
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminPriceSettingsProps {
  subscriptionPrice: number;
}

export const AdminPriceSettings: React.FC<AdminPriceSettingsProps> = ({ subscriptionPrice }) => {
  const [adminPrice, setAdminPrice] = useState<number>(subscriptionPrice);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAdminPrice(isNaN(value) ? 0 : value * 100); // Convert to cents
  };

  const handleUpdatePrice = async () => {
    if (adminPrice <= 0) {
      toast.error("O preço deve ser maior que zero");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('manage-subscription-price', {
        body: { price: adminPrice }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Preço da assinatura atualizado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao atualizar preço: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Administrador</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="subscription-price">Preço da Assinatura (R$)</Label>
            <div className="flex gap-2">
              <Input 
                id="subscription-price" 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="89.90"
                defaultValue={(adminPrice / 100).toFixed(2)}
                onChange={handlePriceChange}
              />
              <Button 
                onClick={handleUpdatePrice}
                disabled={isUpdating}
              >
                {isUpdating ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
