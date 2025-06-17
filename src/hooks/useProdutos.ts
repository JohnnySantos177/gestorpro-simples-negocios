
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Produto } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";

export const useProdutos = (effectiveUserId: string | undefined) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getProdutos = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const produtosData = await supabaseDataService.getProdutos(effectiveUserId);
      setProdutos(produtosData);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const createProduto = async (produto: Omit<Produto, 'id'>) => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      await supabaseDataService.createProduto({ ...produto, user_id: effectiveUserId });
      await getProdutos();
      toast.success("Produto criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast.error("Erro ao criar produto");
    } finally {
      setLoading(false);
    }
  };

  const updateProduto = async (produto: Produto) => {
    try {
      setLoading(true);
      await supabaseDataService.updateProduto(produto.id, produto);
      await getProdutos();
      toast.success("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Erro ao atualizar produto");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      setLoading(true);
      await supabaseDataService.deleteProduto(id);
      await getProdutos();
      toast.success("Produto removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      toast.error("Erro ao remover produto");
    } finally {
      setLoading(false);
    }
  };

  return {
    produtos,
    loading,
    getProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
  };
};
