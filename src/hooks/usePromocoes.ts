
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Promocao } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";

export const usePromocoes = (effectiveUserId: string | undefined) => {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getPromocoes = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const promocoesData = await supabaseDataService.getPromocoes(effectiveUserId);
      setPromocoes(promocoesData);
    } catch (error) {
      console.error("Erro ao buscar promocoes:", error);
      toast.error("Erro ao carregar promocoes");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const createPromocao = async (promocao: Omit<Promocao, 'id'>) => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      await supabaseDataService.createPromocao({ ...promocao, user_id: effectiveUserId });
      await getPromocoes();
      toast.success("Promocao criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar promocao:", error);
      toast.error("Erro ao criar promocao");
    } finally {
      setLoading(false);
    }
  };

  const updatePromocao = async (promocao: Promocao) => {
    try {
      setLoading(true);
      await supabaseDataService.updatePromocao(promocao.id, promocao);
      await getPromocoes();
      toast.success("Promocao atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar promocao:", error);
      toast.error("Erro ao atualizar promocao");
    } finally {
      setLoading(false);
    }
  };

  const deletePromocao = async (id: string) => {
    try {
      setLoading(true);
      await supabaseDataService.deletePromocao(id);
      await getPromocoes();
      toast.success("Promocao removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover promocao:", error);
      toast.error("Erro ao remover promocao");
    } finally {
      setLoading(false);
    }
  };

  return {
    promocoes,
    loading,
    getPromocoes,
    createPromocao,
    updatePromocao,
    deletePromocao,
  };
};
