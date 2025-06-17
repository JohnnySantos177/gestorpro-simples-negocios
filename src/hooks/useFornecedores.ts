
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Fornecedor } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";

export const useFornecedores = (effectiveUserId: string | undefined) => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getFornecedores = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const fornecedoresData = await supabaseDataService.getFornecedores(effectiveUserId);
      setFornecedores(fornecedoresData);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const createFornecedor = async (fornecedor: Omit<Fornecedor, 'id'>) => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      await supabaseDataService.createFornecedor({ ...fornecedor, user_id: effectiveUserId });
      await getFornecedores();
      toast.success("Fornecedor criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error);
      toast.error("Erro ao criar fornecedor");
    } finally {
      setLoading(false);
    }
  };

  const updateFornecedor = async (fornecedor: Fornecedor) => {
    try {
      setLoading(true);
      await supabaseDataService.updateFornecedor(fornecedor.id, fornecedor);
      await getFornecedores();
      toast.success("Fornecedor atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      toast.error("Erro ao atualizar fornecedor");
    } finally {
      setLoading(false);
    }
  };

  const deleteFornecedor = async (id: string) => {
    try {
      setLoading(true);
      await supabaseDataService.deleteFornecedor(id);
      await getFornecedores();
      toast.success("Fornecedor removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover fornecedor:", error);
      toast.error("Erro ao remover fornecedor");
    } finally {
      setLoading(false);
    }
  };

  return {
    fornecedores,
    loading,
    getFornecedores,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
  };
};
