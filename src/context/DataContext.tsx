
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  Cliente, Produto, Fornecedor, Compra, Transacao, 
  Feedback, Promocao, FilterOptions, DashboardStats 
} from "../types";
import { useSubscription } from "./SubscriptionContext";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabaseDataService } from "@/services/supabaseDataService";

interface DataContextType {
  // Data arrays
  clientes: Cliente[];
  produtos: Produto[];
  fornecedores: Fornecedor[];
  compras: Compra[];
  transacoes: Transacao[];
  feedbacks: Feedback[];
  promocoes: Promocao[];
  
  // Loading states
  loading: boolean;
  
  // CRUD operations
  addCliente: (cliente: Omit<Cliente, "id" | "dataCadastro">) => Promise<boolean>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  
  addProduto: (produto: Omit<Produto, "id" | "dataCadastro">) => Promise<boolean>;
  updateProduto: (id: string, produto: Partial<Produto>) => Promise<void>;
  deleteProduto: (id: string) => Promise<void>;
  
  addFornecedor: (fornecedor: Omit<Fornecedor, "id" | "dataCadastro">) => Promise<boolean>;
  updateFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => Promise<void>;
  deleteFornecedor: (id: string) => Promise<void>;
  
  addCompra: (compra: Omit<Compra, "id">) => Promise<boolean>;
  updateCompra: (id: string, compra: Partial<Compra>) => Promise<void>;
  deleteCompra: (id: string) => Promise<void>;
  
  addTransacao: (transacao: Omit<Transacao, "id">) => Promise<boolean>;
  updateTransacao: (id: string, transacao: Partial<Transacao>) => Promise<void>;
  deleteTransacao: (id: string) => Promise<void>;
  
  addFeedback: (feedback: Omit<Feedback, "id">) => Promise<boolean>;
  updateFeedback: (id: string, feedback: Partial<Feedback>) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  
  addPromocao: (promocao: Omit<Promocao, "id">) => Promise<boolean>;
  updatePromocao: (id: string, promocao: Partial<Promocao>) => Promise<void>;
  deletePromocao: (id: string) => Promise<void>;
  
  // Dashboard data
  dashboardStats: DashboardStats;
  updateDashboardStats: () => void;
  
  // Helper functions
  getClienteById: (id: string) => Cliente | undefined;
  getProdutoById: (id: string) => Produto | undefined;
  getFornecedorById: (id: string) => Fornecedor | undefined;
  
  // Filtrar e pesquisar
  filterClientes: (options: FilterOptions) => Cliente[];
  filterProdutos: (options: FilterOptions) => Produto[];
  filterFornecedores: (options: FilterOptions) => Fornecedor[];
  filterCompras: (options: FilterOptions) => Compra[];
  filterTransacoes: (options: FilterOptions) => Transacao[];

  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { isSubscribed } = useSubscription();
  const { user, loading: authLoading } = useAuth();
  
  // Estado inicial
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalClientes: 0,
    totalProdutos: 0,
    totalVendas: 0,
    totalCompras: 0,
    faturamentoMensal: 0,
    ticketMedio: 0,
    produtosMaisVendidos: [],
    vendasPorPeriodo: [],
    estoqueStatus: { baixo: 0, normal: 0, alto: 0 }
  });
  
  // Função para verificar limites de plano gratuito - removido para vendas
  const checkFreeLimit = (collection: any[], entity: string): boolean => {
    if (!isSubscribed && collection.length >= 5) {
      toast.error(`Limite atingido! Você pode cadastrar apenas 5 ${entity} no plano gratuito. Faça upgrade para adicionar mais.`);
      return false;
    }
    return true;
  };

  // Função para carregar todos os dados
  const loadData = async () => {
    if (!user || authLoading) return;
    
    setLoading(true);
    try {
      const [
        clientesData,
        produtosData,
        fornecedoresData,
        comprasData,
        transacoesData,
        feedbacksData,
        promocoesData
      ] = await Promise.all([
        supabaseDataService.getClientes(),
        supabaseDataService.getProdutos(),
        supabaseDataService.getFornecedores(),
        supabaseDataService.getCompras(),
        supabaseDataService.getTransacoes(),
        supabaseDataService.getFeedbacks(),
        supabaseDataService.getPromocoes()
      ]);

      setClientes(clientesData);
      setProdutos(produtosData);
      setFornecedores(fornecedoresData);
      setCompras(comprasData);
      setTransacoes(transacoesData);
      setFeedbacks(feedbacksData);
      setPromocoes(promocoesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do servidor');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o usuário estiver autenticado
  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
  }, [user, authLoading]);
  
  // Atualizar estatísticas do dashboard
  const updateDashboardStats = () => {
    // Vendas (transações de entrada)
    const vendas = transacoes.filter(t => t.tipo === 'entrada' && t.categoria === 'Vendas');
    
    // Calcular total de vendas do mês atual
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const vendasMes = vendas.filter(v => new Date(v.data) >= primeiroDiaMes);
    const faturamentoMensal = vendasMes.reduce((total, venda) => total + venda.valor, 0);
    
    // Ticket médio
    const ticketMedio = vendas.length > 0 
      ? vendas.reduce((total, venda) => total + venda.valor, 0) / vendas.length 
      : 0;
    
    // Produtos mais vendidos
    const produtosVendidos: Record<string, { nome: string, quantidade: number }> = {};
    
    compras.forEach(compra => {
      compra.produtos.forEach(item => {
        if (!produtosVendidos[item.produtoId]) {
          produtosVendidos[item.produtoId] = {
            nome: item.produtoNome,
            quantidade: 0
          };
        }
        produtosVendidos[item.produtoId].quantidade += item.quantidade;
      });
    });
    
    const produtosMaisVendidos = Object.values(produtosVendidos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
    
    // Vendas por período (últimos 6 meses)
    const vendasPorPeriodo = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mes = data.getMonth();
      const ano = data.getFullYear();
      
      const vendasMes = vendas.filter(v => {
        const dataVenda = new Date(v.data);
        return dataVenda.getMonth() === mes && dataVenda.getFullYear() === ano;
      });
      
      const totalMes = vendasMes.reduce((total, venda) => total + venda.valor, 0);
      
      vendasPorPeriodo.push({
        periodo: `${data.getMonth() + 1}/${data.getFullYear()}`,
        valor: totalMes
      });
    }
    
    // Status do estoque atualizado com lógica de estoque crítico
    const estoqueMaximo = produtos.length > 0 ? Math.max(...produtos.map(p => p.quantidade), 50) : 50;
    const limiteCritico = Math.max(estoqueMaximo * 0.15, 10); // 15% do máximo ou 10 unidades
    
    const estoqueStatus = {
      baixo: produtos.filter(p => p.quantidade <= limiteCritico).length, // Estoque crítico
      normal: produtos.filter(p => p.quantidade > limiteCritico && p.quantidade <= estoqueMaximo * 0.5).length,
      alto: produtos.filter(p => p.quantidade > estoqueMaximo * 0.5).length
    };
    
    // Atualizar estado do dashboard
    setDashboardStats({
      totalClientes: clientes.length,
      totalProdutos: produtos.length,
      totalVendas: vendas.length,
      totalCompras: compras.length,
      faturamentoMensal,
      ticketMedio,
      produtosMaisVendidos,
      vendasPorPeriodo,
      estoqueStatus
    });
  };
  
  // Atualiza dashboard quando os dados mudam
  useEffect(() => {
    updateDashboardStats();
  }, [clientes, produtos, compras, transacoes]);
  
  // CRUD operations
  
  // Clientes
  const addCliente = async (cliente: Omit<Cliente, "id" | "dataCadastro">) => {
    if (!checkFreeLimit(clientes, "clientes")) return false;
    
    try {
      const newCliente = await supabaseDataService.createCliente(cliente);
      setClientes([newCliente, ...clientes]);
      toast.success('Cliente adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast.error('Erro ao adicionar cliente');
      return false;
    }
  };
  
  const updateCliente = async (id: string, clienteUpdate: Partial<Cliente>) => {
    try {
      await supabaseDataService.updateCliente(id, clienteUpdate);
      setClientes(
        clientes.map(cliente => 
          cliente.id === id ? { ...cliente, ...clienteUpdate } : cliente
        )
      );
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente');
    }
  };
  
  const deleteCliente = async (id: string) => {
    try {
      await supabaseDataService.deleteCliente(id);
      setClientes(clientes.filter(cliente => cliente.id !== id));
      setCompras(compras.filter(compra => compra.clienteId !== id));
      setTransacoes(transacoes.filter(transacao => transacao.clienteId !== id));
      setFeedbacks(feedbacks.filter(feedback => feedback.clienteId !== id));
      toast.success('Cliente removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast.error('Erro ao remover cliente');
    }
  };
  
  // Produtos
  const addProduto = async (produto: Omit<Produto, "id" | "dataCadastro">) => {
    if (!checkFreeLimit(produtos, "produtos")) return false;
    
    try {
      const newProduto = await supabaseDataService.createProduto(produto);
      setProdutos([newProduto, ...produtos]);
      toast.success('Produto adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro ao adicionar produto');
      return false;
    }
  };
  
  const updateProduto = async (id: string, produtoUpdate: Partial<Produto>) => {
    try {
      await supabaseDataService.updateProduto(id, produtoUpdate);
      setProdutos(
        produtos.map(produto => 
          produto.id === id ? { ...produto, ...produtoUpdate } : produto
        )
      );
      toast.success('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    }
  };
  
  const deleteProduto = async (id: string) => {
    try {
      await supabaseDataService.deleteProduto(id);
      setProdutos(produtos.filter(produto => produto.id !== id));
      setCompras(
        compras.map(compra => ({
          ...compra,
          produtos: compra.produtos.filter(item => item.produtoId !== id),
          valorTotal: compra.produtos
            .filter(item => item.produtoId !== id)
            .reduce((total, item) => total + item.subtotal, 0)
        }))
      );
      setPromocoes(promocoes.filter(promo => promo.produtoId !== id));
      toast.success('Produto removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast.error('Erro ao remover produto');
    }
  };
  
  // Fornecedores
  const addFornecedor = async (fornecedor: Omit<Fornecedor, "id" | "dataCadastro">) => {
    if (!checkFreeLimit(fornecedores, "fornecedores")) return false;
    
    try {
      const newFornecedor = await supabaseDataService.createFornecedor(fornecedor);
      setFornecedores([newFornecedor, ...fornecedores]);
      toast.success('Fornecedor adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      toast.error('Erro ao adicionar fornecedor');
      return false;
    }
  };
  
  const updateFornecedor = async (id: string, fornecedorUpdate: Partial<Fornecedor>) => {
    try {
      await supabaseDataService.updateFornecedor(id, fornecedorUpdate);
      setFornecedores(
        fornecedores.map(fornecedor => 
          fornecedor.id === id ? { ...fornecedor, ...fornecedorUpdate } : fornecedor
        )
      );
      toast.success('Fornecedor atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast.error('Erro ao atualizar fornecedor');
    }
  };
  
  const deleteFornecedor = async (id: string) => {
    try {
      await supabaseDataService.deleteFornecedor(id);
      setFornecedores(fornecedores.filter(fornecedor => fornecedor.id !== id));
      setProdutos(
        produtos.map(produto => 
          produto.fornecedorId === id 
            ? { ...produto, fornecedorId: '', fornecedorNome: 'Sem fornecedor' } 
            : produto
        )
      );
      setTransacoes(transacoes.filter(transacao => transacao.fornecedorId !== id));
      toast.success('Fornecedor removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover fornecedor:', error);
      toast.error('Erro ao remover fornecedor');
    }
  };
  
  // Compras - removida verificação de limite
  const addCompra = async (compra: Omit<Compra, "id">) => {
    try {
      console.log('Iniciando processo de venda:', compra);
      
      // Verificar estoque suficiente antes de criar a venda
      const estoqueInsuficiente = [];
      for (const item of compra.produtos) {
        const produto = produtos.find(p => p.id === item.produtoId);
        if (!produto) {
          toast.error(`Produto ${item.produtoNome} não encontrado`);
          return false;
        }
        if (produto.quantidade < item.quantidade) {
          estoqueInsuficiente.push({
            nome: produto.nome,
            disponivel: produto.quantidade,
            solicitado: item.quantidade
          });
        }
      }
      
      if (estoqueInsuficiente.length > 0) {
        const mensagens = estoqueInsuficiente.map(item => 
          `${item.nome}: disponível ${item.disponivel}, solicitado ${item.solicitado}`
        );
        toast.error(`Estoque insuficiente para: ${mensagens.join(', ')}`);
        return false;
      }

      // Criar a venda
      const newCompra = await supabaseDataService.createCompra(compra);
      setCompras([newCompra, ...compras]);
      
      console.log('Venda criada, atualizando estoque...');
      
      // Atualizar estoque dos produtos no estado local e no banco
      const produtosAtualizados = [...produtos];
      for (const item of newCompra.produtos) {
        const produtoIndex = produtosAtualizados.findIndex(p => p.id === item.produtoId);
        if (produtoIndex !== -1) {
          const produto = produtosAtualizados[produtoIndex];
          const novaQuantidade = produto.quantidade - item.quantidade;
          
          console.log(`Atualizando estoque do produto ${produto.nome}: ${produto.quantidade} -> ${novaQuantidade}`);
          
          // Atualizar no banco de dados
          await supabaseDataService.updateProduto(produto.id, { 
            quantidade: novaQuantidade 
          });
          
          // Atualizar no estado local
          produtosAtualizados[produtoIndex] = {
            ...produto,
            quantidade: novaQuantidade
          };
        }
      }
      
      // Atualizar estado dos produtos
      setProdutos(produtosAtualizados);
      
      // Adicionar transação correspondente
      await addTransacao({
        tipo: 'entrada',
        categoria: 'Vendas',
        descricao: `Venda para ${newCompra.clienteNome}`,
        valor: newCompra.valorTotal,
        data: newCompra.data,
        formaPagamento: newCompra.formaPagamento,
        compraId: newCompra.id,
        clienteId: newCompra.clienteId
      });
      
      console.log('Venda e atualização de estoque concluídas com sucesso');
      toast.success('Venda registrada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast.error('Erro ao registrar venda');
      return false;
    }
  };
  
  const updateCompra = async (id: string, compraUpdate: Partial<Compra>) => {
    try {
      await supabaseDataService.updateCompra(id, compraUpdate);
      setCompras(
        compras.map(compra => 
          compra.id === id ? { ...compra, ...compraUpdate } : compra
        )
      );
      
      // Atualizar transação correspondente
      if (compraUpdate.valorTotal !== undefined) {
        const transacao = transacoes.find(t => t.compraId === id);
        if (transacao) {
          await updateTransacao(transacao.id, { valor: compraUpdate.valorTotal });
        }
      }
      
      toast.success('Venda atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      toast.error('Erro ao atualizar venda');
    }
  };
  
  const deleteCompra = async (id: string) => {
    try {
      await supabaseDataService.deleteCompra(id);
      setCompras(compras.filter(compra => compra.id !== id));
      setTransacoes(transacoes.filter(transacao => transacao.compraId !== id));
      toast.success('Venda removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover venda:', error);
      toast.error('Erro ao remover venda');
    }
  };
  
  // Transações
  const addTransacao = async (transacao: Omit<Transacao, "id">) => {
    if (!checkFreeLimit(transacoes, "transações")) return false;
    
    try {
      const newTransacao = await supabaseDataService.createTransacao(transacao);
      setTransacoes([newTransacao, ...transacoes]);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      return false;
    }
  };
  
  const updateTransacao = async (id: string, transacaoUpdate: Partial<Transacao>) => {
    try {
      await supabaseDataService.updateTransacao(id, transacaoUpdate);
      setTransacoes(
        transacoes.map(transacao => 
          transacao.id === id ? { ...transacao, ...transacaoUpdate } : transacao
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
    }
  };
  
  const deleteTransacao = async (id: string) => {
    try {
      await supabaseDataService.deleteTransacao(id);
      setTransacoes(transacoes.filter(transacao => transacao.id !== id));
    } catch (error) {
      console.error('Erro ao remover transação:', error);
    }
  };
  
  // Feedbacks
  const addFeedback = async (feedback: Omit<Feedback, "id">) => {
    if (!checkFreeLimit(feedbacks, "avaliações")) return false;
    
    try {
      const newFeedback = await supabaseDataService.createFeedback(feedback);
      setFeedbacks([newFeedback, ...feedbacks]);
      toast.success('Avaliação adicionada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      toast.error('Erro ao adicionar avaliação');
      return false;
    }
  };
  
  const updateFeedback = async (id: string, feedbackUpdate: Partial<Feedback>) => {
    try {
      await supabaseDataService.updateFeedback(id, feedbackUpdate);
      setFeedbacks(
        feedbacks.map(feedback => 
          feedback.id === id ? { ...feedback, ...feedbackUpdate } : feedback
        )
      );
      toast.success('Avaliação atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      toast.error('Erro ao atualizar avaliação');
    }
  };
  
  const deleteFeedback = async (id: string) => {
    try {
      await supabaseDataService.deleteFeedback(id);
      setFeedbacks(feedbacks.filter(feedback => feedback.id !== id));
      toast.success('Avaliação removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover avaliação:', error);
      toast.error('Erro ao remover avaliação');
    }
  };
  
  // Promoções
  const addPromocao = async (promocao: Omit<Promocao, "id">) => {
    if (!checkFreeLimit(promocoes, "promoções")) return false;
    
    try {
      const newPromocao = await supabaseDataService.createPromocao(promocao);
      setPromocoes([newPromocao, ...promocoes]);
      toast.success('Promoção adicionada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar promoção:', error);
      toast.error('Erro ao adicionar promoção');
      return false;
    }
  };
  
  const updatePromocao = async (id: string, promocaoUpdate: Partial<Promocao>) => {
    try {
      await supabaseDataService.updatePromocao(id, promocaoUpdate);
      setPromocoes(
        promocoes.map(promocao => 
          promocao.id === id ? { ...promocao, ...promocaoUpdate } : promocao
        )
      );
      toast.success('Promoção atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar promoção:', error);
      toast.error('Erro ao atualizar promoção');
    }
  };
  
  const deletePromocao = async (id: string) => {
    try {
      await supabaseDataService.deletePromocao(id);
      setPromocoes(promocoes.filter(promocao => promocao.id !== id));
      toast.success('Promoção removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover promoção:', error);
      toast.error('Erro ao remover promoção');
    }
  };
  
  // Helper functions
  const getClienteById = (id: string) => {
    return clientes.find(cliente => cliente.id === id);
  };
  
  const getProdutoById = (id: string) => {
    return produtos.find(produto => produto.id === id);
  };
  
  const getFornecedorById = (id: string) => {
    return fornecedores.find(fornecedor => fornecedor.id === id);
  };
  
  // Funções de filtro
  const filterClientes = (options: FilterOptions) => {
    let result = [...clientes];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(
        cliente => 
          cliente.nome.toLowerCase().includes(searchLower) ||
          cliente.email.toLowerCase().includes(searchLower) ||
          cliente.telefone.includes(options.search)
      );
    }
    
    if (options.grupo && options.grupo !== "Todos") {
      result = result.filter(cliente => cliente.grupo === options.grupo);
    }
    
    if (options.sortBy) {
      result.sort((a: any, b: any) => {
        if (options.sortOrder === 'asc') {
          return a[options.sortBy] > b[options.sortBy] ? 1 : -1;
        } else {
          return a[options.sortBy] < b[options.sortBy] ? 1 : -1;
        }
      });
    }
    
    // Paginação básica
    const startIndex = (options.page - 1) * options.itemsPerPage;
    return result.slice(startIndex, startIndex + options.itemsPerPage);
  };
  
  const filterProdutos = (options: FilterOptions) => {
    let result = [...produtos];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(
        produto => 
          produto.nome.toLowerCase().includes(searchLower) ||
          produto.descricao.toLowerCase().includes(searchLower)
      );
    }
    
    if (options.categoria && options.categoria !== "Todas") {
      result = result.filter(produto => produto.categoria === options.categoria);
    }
    
    if (options.fornecedorId) {
      result = result.filter(produto => produto.fornecedorId === options.fornecedorId);
    }
    
    if (options.estoqueMinimo !== undefined) {
      result = result.filter(produto => produto.quantidade <= options.estoqueMinimo);
    }
    
    if (options.sortBy) {
      result.sort((a: any, b: any) => {
        if (options.sortOrder === 'asc') {
          return a[options.sortBy] > b[options.sortBy] ? 1 : -1;
        } else {
          return a[options.sortBy] < b[options.sortBy] ? 1 : -1;
        }
      });
    }
    
    // Paginação básica
    const startIndex = (options.page - 1) * options.itemsPerPage;
    return result.slice(startIndex, startIndex + options.itemsPerPage);
  };
  
  const filterFornecedores = (options: FilterOptions) => {
    let result = [...fornecedores];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(
        fornecedor => 
          fornecedor.nome.toLowerCase().includes(searchLower) ||
          fornecedor.email.toLowerCase().includes(searchLower) ||
          fornecedor.telefone.includes(options.search)
      );
    }
    
    if (options.sortBy) {
      result.sort((a: any, b: any) => {
        if (options.sortOrder === 'asc') {
          return a[options.sortBy] > b[options.sortBy] ? 1 : -1;
        } else {
          return a[options.sortBy] < b[options.sortBy] ? 1 : -1;
        }
      });
    }
    
    // Paginação básica
    const startIndex = (options.page - 1) * options.itemsPerPage;
    return result.slice(startIndex, startIndex + options.itemsPerPage);
  };
  
  const filterCompras = (options: FilterOptions) => {
    let result = [...compras];
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      result = result.filter(
        compra => compra.clienteNome.toLowerCase().includes(searchLower)
      );
    }
    
    if (options.clienteId) {
      result = result.filter(compra => compra.clienteId === options.clienteId);
    }
    
    if (options.status) {
      result = result.filter(compra => compra.status === options.status);
    }
    
    if (options.dataInicio && options.dataFim) {
      result = result.filter(compra => 
        new Date(compra.data) >= new Date(options.dataInicio) && 
        new Date(compra.data) <= new Date(options.dataFim)
      );
    }
    
    if (options.sortBy) {
      result.sort((a: any, b: any) => {
        if (options.sortOrder === 'asc') {
          return a[options.sortBy] > b[options.sortBy] ? 1 : -1;
        } else {
          return a[options.sortBy] < b[options.sortBy] ? 1 : -1;
        }
      });
    }
    
    // Paginação básica
    const startIndex = (options.page - 1) * options.itemsPerPage;
    return result.slice(startIndex, startIndex + options.itemsPerPage);
  };
  
  const filterTransacoes = (options: FilterOptions) => {
    let result = [...transacoes];
    
    if (options.tipo) {
      result = result.filter(transacao => transacao.tipo === options.tipo);
    }
    
    if (options.categoria) {
      result = result.filter(transacao => transacao.categoria === options.categoria);
    }
    
    if (options.dataInicio && options.dataFim) {
      result = result.filter(transacao => 
        new Date(transacao.data) >= new Date(options.dataInicio) && 
        new Date(transacao.data) <= new Date(options.dataFim)
      );
    }
    
    if (options.sortBy) {
      result.sort((a: any, b: any) => {
        if (options.sortOrder === 'asc') {
          return a[options.sortBy] > b[options.sortBy] ? 1 : -1;
        } else {
          return a[options.sortBy] < b[options.sortBy] ? 1 : -1;
        }
      });
    }
    
    // Paginação básica
    const startIndex = (options.page - 1) * options.itemsPerPage;
    return result.slice(startIndex, startIndex + options.itemsPerPage);
  };

  const refreshData = async () => {
    await loadData();
  };
  
  const value: DataContextType = {
    clientes,
    produtos,
    fornecedores,
    compras,
    transacoes,
    feedbacks,
    promocoes,
    loading,
    
    addCliente,
    updateCliente,
    deleteCliente,
    
    addProduto,
    updateProduto,
    deleteProduto,
    
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    
    addCompra,
    updateCompra,
    deleteCompra,
    
    addTransacao,
    updateTransacao,
    deleteTransacao,
    
    addFeedback,
    updateFeedback,
    deleteFeedback,
    
    addPromocao,
    updatePromocao,
    deletePromocao,
    
    dashboardStats,
    updateDashboardStats,
    
    getClienteById,
    getProdutoById,
    getFornecedorById,
    
    filterClientes,
    filterProdutos,
    filterFornecedores,
    filterCompras,
    filterTransacoes,

    refreshData
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
