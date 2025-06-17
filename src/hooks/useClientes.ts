
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Cliente } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";

export const useClientes = (effectiveUserId: string | undefined) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getClientes = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const clientesData = await supabaseDataService.getClientes(effectiveUserId);
      setClientes(clientesData);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const createCliente = async (cliente: Omit<Cliente, 'id'>) => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      await supabaseDataService.createCliente({ ...cliente, user_id: effectiveUserId });
      await getClientes();
      toast.success("Cliente criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  };

  const updateCliente = async (cliente: Cliente) => {
    try {
      setLoading(true);
      await supabaseDataService.updateCliente(cliente.id, cliente);
      await getClientes();
      toast.success("Cliente atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente");
    } finally {
      setLoading(false);
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      setLoading(true);
      await supabaseDataService.deleteCliente(id);
      await getClientes();
      toast.success("Cliente removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      toast.error("Erro ao remover cliente");
    } finally {
      setLoading(false);
    }
  };

  return {
    clientes,
    loading,
    getClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
};
