
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Compra } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";

export const useCompras = (effectiveUserId: string | undefined) => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getCompras = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const comprasData = await supabaseDataService.getCompras(effectiveUserId);
      setCompras(comprasData);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
      toast.error("Erro ao carregar compras");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const createCompra = async (compra: Omit<Compra, 'id'>) => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      await supabaseDataService.createCompra({ ...compra, user_id: effectiveUserId });
      await getCompras();
      toast.success("Compra criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar compra:", error);
      toast.error("Erro ao criar compra");
    } finally {
      setLoading(false);
    }
  };

  const updateCompra = async (compra: Compra) => {
    try {
      setLoading(true);
      await supabaseDataService.updateCompra(compra.id, compra);
      await getCompras();
      toast.success("Compra atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar compra:", error);
      toast.error("Erro ao atualizar compra");
    } finally {
      setLoading(false);
    }
  };

  const deleteCompra = async (id: string) => {
    try {
      setLoading(true);
      await supabaseDataService.deleteCompra(id);
      await getCompras();
      toast.success("Compra removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover compra:", error);
      toast.error("Erro ao remover compra");
    } finally {
      setLoading(false);
    }
  };

  return {
    compras,
    loading,
    getCompras,
    createCompra,
    updateCompra,
    deleteCompra,
  };
};
