
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useVisitorMode } from "@/context/VisitorModeContext";
import { supabaseDataService } from "@/services/supabaseDataService";
import { DataContextType } from "@/context/types/dataContext";
import { useClientes } from "@/hooks/useClientes";
import { useProdutos } from "@/hooks/useProdutos";
import { useCompras } from "@/hooks/useCompras";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useFornecedores } from "@/hooks/useFornecedores";
import { useFeedbacks } from "@/hooks/useFeedbacks";
import { usePromocoes } from "@/hooks/usePromocoes";

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { isVisitorMode, targetUserId } = useVisitorMode();

  // Determine which user ID to use for data filtering
  const effectiveUserId = isVisitorMode ? targetUserId : user?.id;

  // Use custom hooks for each entity
  const clientesHook = useClientes(effectiveUserId);
  const produtosHook = useProdutos(effectiveUserId);
  const comprasHook = useCompras(effectiveUserId);
  const transacoesHook = useTransacoes(effectiveUserId);
  const fornecedoresHook = useFornecedores(effectiveUserId);
  const feedbacksHook = useFeedbacks(effectiveUserId);
  const promocoesHook = usePromocoes(effectiveUserId);

  // Combine loading states
  const loading = 
    clientesHook.loading ||
    produtosHook.loading ||
    comprasHook.loading ||
    transacoesHook.loading ||
    fornecedoresHook.loading ||
    feedbacksHook.loading ||
    promocoesHook.loading;

  const fetchData = useCallback(async () => {
    if (!effectiveUserId) return;

    try {
      console.log("DataContext: Fetching data for user:", effectiveUserId);

      await Promise.all([
        clientesHook.getClientes(),
        produtosHook.getProdutos(),
        comprasHook.getCompras(),
        transacoesHook.getTransacoes(),
        fornecedoresHook.getFornecedores(),
        feedbacksHook.getFeedbacks(),
        promocoesHook.getPromocoes()
      ]);

      console.log("DataContext: Data loaded successfully for user:", effectiveUserId);
    } catch (error) {
      console.error("DataContext: Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    }
  }, [effectiveUserId, clientesHook, produtosHook, comprasHook, transacoesHook, fornecedoresHook, feedbacksHook, promocoesHook]);

  // Refresh data when user changes or visitor mode changes
  useEffect(() => {
    console.log("DataContext: Effect triggered - effectiveUserId:", effectiveUserId, "isVisitorMode:", isVisitorMode);
    if (effectiveUserId) {
      fetchData();
    }
  }, [fetchData, effectiveUserId, isVisitorMode]);

  const value = {
    clientes: clientesHook.clientes,
    produtos: produtosHook.produtos,
    compras: comprasHook.compras,
    transacoes: transacoesHook.transacoes,
    fornecedores: fornecedoresHook.fornecedores,
    feedbacks: feedbacksHook.feedbacks,
    promocoes: promocoesHook.promocoes,
    loading,
    getClientes: clientesHook.getClientes,
    createCliente: clientesHook.createCliente,
    updateCliente: clientesHook.updateCliente,
    deleteCliente: clientesHook.deleteCliente,
    getProdutos: produtosHook.getProdutos,
    createProduto: produtosHook.createProduto,
    updateProduto: produtosHook.updateProduto,
    deleteProduto: produtosHook.deleteProduto,
    getCompras: comprasHook.getCompras,
    createCompra: comprasHook.createCompra,
    updateCompra: comprasHook.updateCompra,
    deleteCompra: comprasHook.deleteCompra,
    getTransacoes: transacoesHook.getTransacoes,
    createTransacao: transacoesHook.createTransacao,
    updateTransacao: transacoesHook.updateTransacao,
    deleteTransacao: transacoesHook.deleteTransacao,
    getFornecedores: fornecedoresHook.getFornecedores,
    createFornecedor: fornecedoresHook.createFornecedor,
    updateFornecedor: fornecedoresHook.updateFornecedor,
    deleteFornecedor: fornecedoresHook.deleteFornecedor,
    getFeedbacks: feedbacksHook.getFeedbacks,
    createFeedback: feedbacksHook.createFeedback,
    updateFeedback: feedbacksHook.updateFeedback,
    deleteFeedback: feedbacksHook.deleteFeedback,
    getPromocoes: promocoesHook.getPromocoes,
    createPromocao: promocoesHook.createPromocao,
    updatePromocao: promocoesHook.updatePromocao,
    deletePromocao: promocoesHook.deletePromocao,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
