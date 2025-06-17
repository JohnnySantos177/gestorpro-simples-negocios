
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";

import { Cliente, Produto, Compra, Transacao, Fornecedor, Feedback, Promocao } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";
import { useAuth } from "@/context/AuthContext";
import { useVisitorMode } from "@/context/VisitorModeContext";

type DataContextType = {
  clientes: Cliente[];
  produtos: Produto[];
  compras: Compra[];
  transacoes: Transacao[];
  fornecedores: Fornecedor[];
  feedbacks: Feedback[];
  promocoes: Promocao[];
  loading: boolean;
  getClientes: () => Promise<void>;
  createCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  updateCliente: (cliente: Cliente) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  getProdutos: () => Promise<void>;
  createProduto: (produto: Omit<Produto, 'id'>) => Promise<void>;
  updateProduto: (produto: Produto) => Promise<void>;
  deleteProduto: (id: string) => Promise<void>;
  getCompras: () => Promise<void>;
  createCompra: (compra: Omit<Compra, 'id'>) => Promise<void>;
  updateCompra: (compra: Compra) => Promise<void>;
  deleteCompra: (id: string) => Promise<void>;
  getTransacoes: () => Promise<void>;
  createTransacao: (transacao: Omit<Transacao, 'id'>) => Promise<void>;
  updateTransacao: (transacao: Transacao) => Promise<void>;
  deleteTransacao: (id: string) => Promise<void>;
  getFornecedores: () => Promise<void>;
  createFornecedor: (fornecedor: Omit<Fornecedor, 'id'>) => Promise<void>;
  updateFornecedor: (fornecedor: Fornecedor) => Promise<void>;
  deleteFornecedor: (id: string) => Promise<void>;
    
  getFeedbacks: () => Promise<void>;
  createFeedback: (feedback: Omit<Feedback, 'id'>) => Promise<void>;
  updateFeedback: (feedback: Feedback) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;

  getPromocoes: () => Promise<void>;
  createPromocao: (promocao: Omit<Promocao, 'id'>) => Promise<void>;
  updatePromocao: (promocao: Promocao) => Promise<void>;
  deletePromocao: (id: string) => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { user } = useAuth();
  const { isVisitorMode, targetUserId } = useVisitorMode();

  // Determine which user ID to use for data filtering
  const effectiveUserId = isVisitorMode ? targetUserId : user?.id;

  const fetchData = useCallback(async () => {
    if (!effectiveUserId) return;

    try {
      setLoading(true);
      console.log("DataContext: Fetching data for user:", effectiveUserId);

      const [
        clientesData,
        produtosData,
        comprasData,
        transacoesData,
        fornecedoresData,
        feedbacksData,
        promocoesData
      ] = await Promise.all([
        supabaseDataService.getClientes(effectiveUserId),
        supabaseDataService.getProdutos(effectiveUserId),
        supabaseDataService.getCompras(effectiveUserId),
        supabaseDataService.getTransacoes(effectiveUserId),
        supabaseDataService.getFornecedores(effectiveUserId),
        supabaseDataService.getFeedbacks(effectiveUserId),
        supabaseDataService.getPromocoes(effectiveUserId)
      ]);

      setClientes(clientesData);
      setProdutos(produtosData);
      setCompras(comprasData);
      setTransacoes(transacoesData);
      setFornecedores(fornecedoresData);
      setFeedbacks(feedbacksData);
      setPromocoes(promocoesData);

      console.log("DataContext: Data loaded successfully for user:", effectiveUserId);
    } catch (error) {
      console.error("DataContext: Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  // Refresh data when user changes or visitor mode changes
  useEffect(() => {
    console.log("DataContext: Effect triggered - effectiveUserId:", effectiveUserId, "isVisitorMode:", isVisitorMode);
    if (effectiveUserId) {
      fetchData();
    }
  }, [fetchData, effectiveUserId, isVisitorMode]);

  // CRUD operations for Clientes
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
      await supabaseDataService.updateCliente(cliente);
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

  // CRUD operations for Produtos
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
      await supabaseDataService.updateProduto(produto);
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

  // CRUD operations for Compras
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
      await supabaseDataService.updateCompra(compra);
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

  // CRUD operations for Transacoes
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
      await supabaseDataService.updateTransacao(transacao);
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

  // CRUD operations for Fornecedores
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
      await supabaseDataService.updateFornecedor(fornecedor);
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

  // CRUD operations for Feedbacks
  const getFeedbacks = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const feedbacksData = await supabaseDataService.getFeedbacks(effectiveUserId);
      setFeedbacks(feedbacksData);
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      toast.error("Erro ao carregar feedbacks");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const createFeedback = async (feedback: Omit<Feedback, 'id'>) => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      await supabaseDataService.createFeedback({ ...feedback, user_id: effectiveUserId });
      await getFeedbacks();
      toast.success("Feedback criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar feedback:", error);
      toast.error("Erro ao criar feedback");
    } finally {
      setLoading(false);
    }
  };

  const updateFeedback = async (feedback: Feedback) => {
    try {
      setLoading(true);
      await supabaseDataService.updateFeedback(feedback);
      await getFeedbacks();
      toast.success("Feedback atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar feedback:", error);
      toast.error("Erro ao atualizar feedback");
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      setLoading(true);
      await supabaseDataService.deleteFeedback(id);
      await getFeedbacks();
      toast.success("Feedback removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover feedback:", error);
      toast.error("Erro ao remover feedback");
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for Promocoes
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
      await supabaseDataService.updatePromocao(promocao);
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

  const value = {
    clientes,
    produtos,
    compras,
    transacoes,
    fornecedores,
    feedbacks,
    promocoes,
    loading,
    getClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    getProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
    getCompras,
    createCompra,
    updateCompra,
    deleteCompra,
    getTransacoes,
    createTransacao,
    updateTransacao,
    deleteTransacao,
    getFornecedores,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    getFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getPromocoes,
    createPromocao,
    updatePromocao,
    deletePromocao,
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
