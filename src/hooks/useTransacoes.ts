
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Transacao } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";

export const useTransacoes = (effectiveUserId: string | undefined) => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getTransacoes = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const transacoesData = await supabaseDataService.getTransacoes(effectiveUserId);
      setTransacoes(transacoesData);
    } catch (error) {
      console.error("Erro ao buscar transacoes:", error);
      toast.error("Erro ao carregar transacoes");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const createTransacao = async (transacao: Omit<Transacao, 'id'>) => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      await supabaseDataService.createTransacao({ ...transacao, user_id: effectiveUserId });
      await getTransacoes();
      toast.success("Transacao criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar transacao:", error);
      toast.error("Erro ao criar transacao");
    } finally {
      setLoading(false);
    }
  };

  const updateTransacao = async (transacao: Transacao) => {
    try {
      setLoading(true);
      await supabaseDataService.updateTransacao(transacao.id, transacao);
      await getTransacoes();
      toast.success("Transacao atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar transacao:", error);
      toast.error("Erro ao atualizar transacao");
    } finally {
      setLoading(false);
    }
  };

  const deleteTransacao = async (id: string) => {
    try {
      setLoading(true);
      await supabaseDataService.deleteTransacao(id);
      await getTransacoes();
      toast.success("Transacao removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover transacao:", error);
      toast.error("Erro ao remover transacao");
    } finally {
      setLoading(false);
    }
  };

  return {
    transacoes,
    loading,
    getTransacoes,
    createTransacao,
    updateTransacao,
    deleteTransacao,
  };
};
