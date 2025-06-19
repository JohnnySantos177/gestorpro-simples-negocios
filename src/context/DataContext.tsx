import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";

import { Cliente, Produto, Compra, Transacao, Fornecedor, Promocao, FilterOptions } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";
import { useAuth } from "@/context/AuthContext";
import { useVisitorMode } from "@/context/VisitorModeContext";

type DataContextType = {
  clientes: Cliente[];
  produtos: Produto[];
  compras: Compra[];
  transacoes: Transacao[];
  fornecedores: Fornecedor[];
  promocoes: Promocao[];
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Filter functions
  filterClientes: (options: FilterOptions) => Cliente[];
  filterProdutos: (options: FilterOptions) => Produto[];
  filterCompras: (options: FilterOptions) => Compra[];
  filterTransacoes: (options: FilterOptions) => Transacao[];
  filterFornecedores: (options: FilterOptions) => Fornecedor[];
  
  // CRUD operations for Clientes
  addCliente: (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => boolean;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  
  // CRUD operations for Produtos
  addProduto: (produto: Omit<Produto, 'id'>) => Promise<boolean>;
  updateProduto: (id: string, produto: Partial<Produto>) => Promise<void>;
  deleteProduto: (id: string) => Promise<void>;
  
  // CRUD operations for Compras
  addCompra: (compra: Omit<Compra, 'id'>) => boolean;
  updateCompra: (id: string, compra: Partial<Compra>) => void;
  deleteCompra: (id: string) => void;
  
  // CRUD operations for Transacoes
  addTransacao: (transacao: Omit<Transacao, 'id'>) => boolean;
  updateTransacao: (id: string, transacao: Partial<Transacao>) => void;
  deleteTransacao: (id: string) => void;
  
  // CRUD operations for Fornecedores
  addFornecedor: (fornecedor: Omit<Fornecedor, 'id' | 'dataCadastro'>) => boolean;
  updateFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  deleteFornecedor: (id: string) => void;
  
  // CRUD operations for Promocoes
  addPromocao: (promocao: Omit<Promocao, 'id'>) => Promise<void>;
  updatePromocao: (id: string, promocao: Partial<Promocao>) => Promise<void>;
  deletePromocao: (id: string) => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
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
        promocoesData
      ] = await Promise.all([
        supabaseDataService.getClientes(effectiveUserId),
        supabaseDataService.getProdutos(effectiveUserId),
        supabaseDataService.getCompras(effectiveUserId),
        supabaseDataService.getTransacoes(effectiveUserId),
        supabaseDataService.getFornecedores(effectiveUserId),
        supabaseDataService.getPromocoes(effectiveUserId)
      ]);

      setClientes(clientesData);
      setProdutos(produtosData);
      setCompras(comprasData);
      setTransacoes(transacoesData);
      setFornecedores(fornecedoresData);
      setPromocoes(promocoesData);

      console.log("DataContext: Data loaded successfully for user:", effectiveUserId);
    } catch (error) {
      console.error("DataContext: Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Refresh data when user changes or visitor mode changes
  useEffect(() => {
    console.log("DataContext: Effect triggered - effectiveUserId:", effectiveUserId, "isVisitorMode:", isVisitorMode);
    if (effectiveUserId) {
      fetchData();
    }
  }, [fetchData, effectiveUserId, isVisitorMode]);

  // Filter functions
  const filterClientes = useCallback((options: FilterOptions): Cliente[] => {
    let result = [...clientes];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchLower) ||
        cliente.email.toLowerCase().includes(searchLower) ||
        cliente.telefone.toLowerCase().includes(searchLower)
      );
    }
    
    if (options.grupo && options.grupo !== "Todos") {
      result = result.filter(cliente => cliente.grupo === options.grupo);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[options.sortBy as keyof Cliente];
      const bValue = b[options.sortBy as keyof Cliente];
      if (options.sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    // Apply pagination
    const startIndex = (options.page - 1) * options.itemsPerPage;
    return result.slice(startIndex, startIndex + options.itemsPerPage);
  }, [clientes]);

  const filterProdutos = useCallback((options: FilterOptions): Produto[] => {
    let result = [...produtos];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(produto => 
        produto.nome.toLowerCase().includes(searchLower) ||
        (produto.descricao && produto.descricao.toLowerCase().includes(searchLower))
      );
    }
    
    if (options.categoria && options.categoria !== "Todas") {
      result = result.filter(produto => produto.categoria === options.categoria);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[options.sortBy as keyof Produto];
      const bValue = b[options.sortBy as keyof Produto];
      if (options.sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    return result;
  }, [produtos]);

  const filterCompras = useCallback((options: FilterOptions): Compra[] => {
    let result = [...compras];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(compra => 
        compra.clienteNome.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (options.sortBy === 'data') {
        return options.sortOrder === 'asc'
          ? new Date(a.data).getTime() - new Date(b.data).getTime()
          : new Date(b.data).getTime() - new Date(a.data).getTime();
      }
      const aValue = a[options.sortBy as keyof Compra];
      const bValue = b[options.sortBy as keyof Compra];
      if (options.sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    return result;
  }, [compras]);

  const filterTransacoes = useCallback((options: FilterOptions): Transacao[] => {
    let result = [...transacoes];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(transacao => 
        transacao.descricao.toLowerCase().includes(searchLower) ||
        transacao.categoria.toLowerCase().includes(searchLower)
      );
    }
    
    if (options.tipo && options.tipo !== "") {
      result = result.filter(transacao => transacao.tipo === options.tipo);
    }
    
    if (options.categoria && options.categoria !== "") {
      result = result.filter(transacao => transacao.categoria === options.categoria);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (options.sortBy === 'data') {
        return options.sortOrder === 'asc'
          ? new Date(a.data).getTime() - new Date(b.data).getTime()
          : new Date(b.data).getTime() - new Date(a.data).getTime();
      }
      const aValue = a[options.sortBy as keyof Transacao];
      const bValue = b[options.sortBy as keyof Transacao];
      if (options.sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    // Apply pagination
    const startIndex = (options.page - 1) * options.itemsPerPage;
    return result.slice(startIndex, startIndex + options.itemsPerPage);
  }, [transacoes]);

  const filterFornecedores = useCallback((options: FilterOptions): Fornecedor[] => {
    let result = [...fornecedores];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(fornecedor => 
        fornecedor.nome.toLowerCase().includes(searchLower) ||
        (fornecedor.contato && fornecedor.contato.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[options.sortBy as keyof Fornecedor];
      const bValue = b[options.sortBy as keyof Fornecedor];
      if (options.sortOrder === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    // Apply pagination
    const startIndex = (options.page - 1) * options.itemsPerPage;
    return result.slice(startIndex, startIndex + options.itemsPerPage);
  }, [fornecedores]);

  // CRUD operations for Clientes
  const addCliente = useCallback(async (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>): Promise<boolean> => {
    try {
      if (!user?.id) return false;
      await supabaseDataService.createCliente({ ...clienteData, user_id: user.id });
      await refreshData();
      toast.success("Cliente adicionado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast.error("Erro ao adicionar cliente");
      return false;
    }
  }, [user?.id, refreshData]);

  const updateCliente = useCallback(async (id: string, clienteData: Partial<Cliente>) => {
    try {
      const cliente = clientes.find(c => c.id === id);
      if (!cliente) return;
      
      const updatedCliente = { ...cliente, ...clienteData };
      await supabaseDataService.updateCliente(updatedCliente);
      setClientes(prev => prev.map(c => c.id === id ? updatedCliente : c));
      toast.success("Cliente atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente");
    }
  }, [clientes]);

  const deleteCliente = useCallback(async (id: string) => {
    try {
      await supabaseDataService.deleteCliente(id);
      setClientes(prev => prev.filter(c => c.id !== id));
      toast.success("Cliente removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      toast.error("Erro ao remover cliente");
    }
  }, []);

  // CRUD operations for Produtos
  const addProduto = useCallback(async (produtoData: Omit<Produto, 'id'>): Promise<boolean> => {
    try {
      if (!user?.id) return false;
      
      await supabaseDataService.createProduto({ ...produtoData, user_id: user.id });
      await refreshData();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast.error("Erro ao adicionar produto");
      return false;
    }
  }, [user?.id, refreshData]);

  const updateProduto = useCallback(async (id: string, produtoData: Partial<Produto>) => {
    try {
      const produto = produtos.find(p => p.id === id);
      if (!produto) return;
      
      const updatedProduto = { ...produto, ...produtoData };
      await supabaseDataService.updateProduto(updatedProduto);
      await refreshData();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Erro ao atualizar produto");
    }
  }, [produtos, refreshData]);

  const deleteProduto = useCallback(async (id: string) => {
    try {
      await supabaseDataService.deleteProduto(id);
      await refreshData();
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      toast.error("Erro ao remover produto");
    }
  }, [refreshData]);

  // CRUD operations for Compras
  const addCompra = useCallback(async (compraData: Omit<Compra, 'id'>): Promise<boolean> => {
    try {
      if (!user?.id) return false;
      await supabaseDataService.createCompra({ ...compraData, user_id: user.id });
      // Atualizar o estoque de cada produto vendido
      for (const item of compraData.produtos) {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (produto) {
          const novaQuantidade = produto.quantidade - item.quantidade;
          await updateProduto(produto.id, { quantidade: novaQuantidade });
        }
      }
      await refreshData();
      toast.success("Venda registrada com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao adicionar compra:", error);
      toast.error("Erro ao adicionar compra");
      return false;
    }
  }, [user?.id, produtos, updateProduto, refreshData]);

  const updateCompra = useCallback(async (id: string, compraData: Partial<Compra>) => {
    try {
      const compra = compras.find(c => c.id === id);
      if (!compra) return;
      
      const updatedCompra = { ...compra, ...compraData };
      await supabaseDataService.updateCompra(updatedCompra);
      await refreshData();
    } catch (error) {
      console.error("Erro ao atualizar compra:", error);
      toast.error("Erro ao atualizar compra");
    }
  }, [compras, refreshData]);

  const deleteCompra = useCallback(async (id: string) => {
    try {
      // Encontrar a compra a ser excluída
      const compra = compras.find(c => c.id === id);
      if (compra) {
        // Para cada produto vendido, devolver a quantidade ao estoque
        for (const item of compra.produtos) {
          const produto = produtos.find(p => p.id === item.produtoId);
          if (produto) {
            const novaQuantidade = produto.quantidade + item.quantidade;
            await updateProduto(produto.id, { quantidade: novaQuantidade });
          }
        }
      }
      await supabaseDataService.deleteCompra(id);
      await refreshData();
    } catch (error) {
      console.error("Erro ao remover compra:", error);
      toast.error("Erro ao remover compra");
    }
  }, [compras, produtos, updateProduto, refreshData]);

  // CRUD operations for Transacoes
  const addTransacao = useCallback((transacaoData: Omit<Transacao, 'id'>): boolean => {
    try {
      if (!user?.id) return false;
      
      supabaseDataService.createTransacao({ ...transacaoData, user_id: user.id });
      refreshData();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Erro ao adicionar transação");
      return false;
    }
  }, [user?.id, refreshData]);

  const updateTransacao = useCallback(async (id: string, transacaoData: Partial<Transacao>) => {
    try {
      const transacao = transacoes.find(t => t.id === id);
      if (!transacao) return;
      
      const updatedTransacao = { ...transacao, ...transacaoData };
      await supabaseDataService.updateTransacao(updatedTransacao);
      await refreshData();
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      toast.error("Erro ao atualizar transação");
    }
  }, [transacoes, refreshData]);

  const deleteTransacao = useCallback(async (id: string) => {
    try {
      await supabaseDataService.deleteTransacao(id);
      await refreshData();
    } catch (error) {
      console.error("Erro ao remover transação:", error);
      toast.error("Erro ao remover transação");
    }
  }, [refreshData]);

  // CRUD operations for Fornecedores
  const addFornecedor = useCallback((fornecedorData: Omit<Fornecedor, 'id' | 'dataCadastro'>): boolean => {
    try {
      if (!user?.id) return false;
      
      supabaseDataService.createFornecedor({ ...fornecedorData, user_id: user.id });
      refreshData();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
      toast.error("Erro ao adicionar fornecedor");
      return false;
    }
  }, [user?.id, refreshData]);

  const updateFornecedor = useCallback(async (id: string, fornecedorData: Partial<Fornecedor>) => {
    try {
      const fornecedor = fornecedores.find(f => f.id === id);
      if (!fornecedor) return;
      
      const updatedFornecedor = { ...fornecedor, ...fornecedorData };
      await supabaseDataService.updateFornecedor(updatedFornecedor);
      await refreshData();
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      toast.error("Erro ao atualizar fornecedor");
    }
  }, [fornecedores, refreshData]);

  const deleteFornecedor = useCallback(async (id: string) => {
    try {
      await supabaseDataService.deleteFornecedor(id);
      await refreshData();
    } catch (error) {
      console.error("Erro ao remover fornecedor:", error);
      toast.error("Erro ao remover fornecedor");
    }
  }, [refreshData]);

  // CRUD operations for Promocoes
  const addPromocao = useCallback(async (promocaoData: Omit<Promocao, 'id'>) => {
    try {
      if (!user?.id) return;
      
      await supabaseDataService.createPromocao({ ...promocaoData, user_id: user.id });
      await refreshData();
    } catch (error) {
      console.error("Erro ao adicionar promoção:", error);
      toast.error("Erro ao adicionar promoção");
    }
  }, [user?.id, refreshData]);

  const updatePromocao = useCallback(async (id: string, promocaoData: Partial<Promocao>) => {
    try {
      const promocao = promocoes.find(p => p.id === id);
      if (!promocao) return;
      
      const updatedPromocao = { ...promocao, ...promocaoData };
      await supabaseDataService.updatePromocao(updatedPromocao);
      await refreshData();
    } catch (error) {
      console.error("Erro ao atualizar promoção:", error);
      toast.error("Erro ao atualizar promoção");
    }
  }, [promocoes, refreshData]);

  const deletePromocao = useCallback(async (id: string) => {
    try {
      await supabaseDataService.deletePromocao(id);
      await refreshData();
    } catch (error) {
      console.error("Erro ao remover promoção:", error);
      toast.error("Erro ao remover promoção");
    }
  }, [refreshData]);

  const value = {
    clientes,
    produtos,
    compras,
    transacoes,
    fornecedores,
    promocoes,
    loading,
    refreshData,
    filterClientes,
    filterProdutos,
    filterCompras,
    filterTransacoes,
    filterFornecedores,
    addCliente,
    updateCliente,
    deleteCliente,
    addProduto,
    updateProduto,
    deleteProduto,
    addCompra,
    updateCompra,
    deleteCompra,
    addTransacao,
    updateTransacao,
    deleteTransacao,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    addPromocao,
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
