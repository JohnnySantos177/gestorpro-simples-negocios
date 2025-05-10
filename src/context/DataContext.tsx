import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  Cliente, Produto, Fornecedor, Compra, Transacao, 
  Feedback, Promocao, FilterOptions, DashboardStats 
} from "../types";
import { useSubscription } from "./SubscriptionContext";
import { toast } from "sonner";

interface DataContextType {
  // Data arrays
  clientes: Cliente[];
  produtos: Produto[];
  fornecedores: Fornecedor[];
  compras: Compra[];
  transacoes: Transacao[];
  feedbacks: Feedback[];
  promocoes: Promocao[];
  
  // CRUD operations
  addCliente: (cliente: Omit<Cliente, "id" | "dataCadastro">) => boolean;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  
  addProduto: (produto: Omit<Produto, "id" | "dataCadastro">) => boolean;
  updateProduto: (id: string, produto: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  
  addFornecedor: (fornecedor: Omit<Fornecedor, "id" | "dataCadastro">) => boolean;
  updateFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  deleteFornecedor: (id: string) => void;
  
  addCompra: (compra: Omit<Compra, "id">) => boolean;
  updateCompra: (id: string, compra: Partial<Compra>) => void;
  deleteCompra: (id: string) => void;
  
  addTransacao: (transacao: Omit<Transacao, "id">) => boolean;
  updateTransacao: (id: string, transacao: Partial<Transacao>) => void;
  deleteTransacao: (id: string) => void;
  
  addFeedback: (feedback: Omit<Feedback, "id">) => boolean;
  updateFeedback: (id: string, feedback: Partial<Feedback>) => void;
  deleteFeedback: (id: string) => void;
  
  addPromocao: (promocao: Omit<Promocao, "id">) => boolean;
  updatePromocao: (id: string, promocao: Partial<Promocao>) => void;
  deletePromocao: (id: string) => void;
  
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
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
  
  // Estado inicial
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem("gestorpro_clientes");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const saved = localStorage.getItem("gestorpro_produtos");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => {
    const saved = localStorage.getItem("gestorpro_fornecedores");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [compras, setCompras] = useState<Compra[]>(() => {
    const saved = localStorage.getItem("gestorpro_compras");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [transacoes, setTransacoes] = useState<Transacao[]>(() => {
    const saved = localStorage.getItem("gestorpro_transacoes");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem("gestorpro_feedbacks");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [promocoes, setPromocoes] = useState<Promocao[]>(() => {
    const saved = localStorage.getItem("gestorpro_promocoes");
    return saved ? JSON.parse(saved) : [];
  });
  
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
  
  // Função para verificar limites de plano gratuito
  const checkFreeLimit = (collection: any[], entity: string): boolean => {
    if (!isSubscribed && collection.length >= 10) {
      toast.error(`Limite atingido! Você pode cadastrar apenas 10 ${entity} no plano gratuito. Faça upgrade para adicionar mais.`);
      return false;
    }
    return true;
  };
  
  // Persistência no localStorage
  useEffect(() => {
    localStorage.setItem("gestorpro_clientes", JSON.stringify(clientes));
  }, [clientes]);
  
  useEffect(() => {
    localStorage.setItem("gestorpro_produtos", JSON.stringify(produtos));
  }, [produtos]);
  
  useEffect(() => {
    localStorage.setItem("gestorpro_fornecedores", JSON.stringify(fornecedores));
  }, [fornecedores]);
  
  useEffect(() => {
    localStorage.setItem("gestorpro_compras", JSON.stringify(compras));
  }, [compras]);
  
  useEffect(() => {
    localStorage.setItem("gestorpro_transacoes", JSON.stringify(transacoes));
  }, [transacoes]);
  
  useEffect(() => {
    localStorage.setItem("gestorpro_feedbacks", JSON.stringify(feedbacks));
  }, [feedbacks]);
  
  useEffect(() => {
    localStorage.setItem("gestorpro_promocoes", JSON.stringify(promocoes));
  }, [promocoes]);
  
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
    
    // Status do estoque
    const estoqueStatus = {
      baixo: produtos.filter(p => p.quantidade <= 5).length,
      normal: produtos.filter(p => p.quantidade > 5 && p.quantidade <= 20).length,
      alto: produtos.filter(p => p.quantidade > 20).length
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
  const addCliente = (cliente: Omit<Cliente, "id" | "dataCadastro">) => {
    if (!checkFreeLimit(clientes, "clientes")) return false;
    
    const newCliente: Cliente = {
      ...cliente,
      id: uuidv4(),
      dataCadastro: new Date().toISOString()
    };
    setClientes([...clientes, newCliente]);
    return true;
  };
  
  const updateCliente = (id: string, clienteUpdate: Partial<Cliente>) => {
    setClientes(
      clientes.map(cliente => 
        cliente.id === id ? { ...cliente, ...clienteUpdate } : cliente
      )
    );
  };
  
  const deleteCliente = (id: string) => {
    setClientes(clientes.filter(cliente => cliente.id !== id));
    // Remover compras, transações e feedbacks relacionados
    setCompras(compras.filter(compra => compra.clienteId !== id));
    setTransacoes(transacoes.filter(transacao => transacao.clienteId !== id));
    setFeedbacks(feedbacks.filter(feedback => feedback.clienteId !== id));
  };
  
  // Produtos
  const addProduto = (produto: Omit<Produto, "id" | "dataCadastro">) => {
    if (!checkFreeLimit(produtos, "produtos")) return false;
    
    const newProduto: Produto = {
      ...produto,
      id: uuidv4(),
      dataCadastro: new Date().toISOString()
    };
    setProdutos([...produtos, newProduto]);
    return true;
  };
  
  const updateProduto = (id: string, produtoUpdate: Partial<Produto>) => {
    setProdutos(
      produtos.map(produto => 
        produto.id === id ? { ...produto, ...produtoUpdate } : produto
      )
    );
  };
  
  const deleteProduto = (id: string) => {
    setProdutos(produtos.filter(produto => produto.id !== id));
    // Atualizar compras que contenham o produto
    setCompras(
      compras.map(compra => ({
        ...compra,
        produtos: compra.produtos.filter(item => item.produtoId !== id),
        valorTotal: compra.produtos
          .filter(item => item.produtoId !== id)
          .reduce((total, item) => total + item.subtotal, 0)
      }))
    );
    // Remover promoções relacionadas ao produto
    setPromocoes(promocoes.filter(promo => promo.produtoId !== id));
  };
  
  // Fornecedores
  const addFornecedor = (fornecedor: Omit<Fornecedor, "id" | "dataCadastro">) => {
    if (!checkFreeLimit(fornecedores, "fornecedores")) return false;
    
    const newFornecedor: Fornecedor = {
      ...fornecedor,
      id: uuidv4(),
      dataCadastro: new Date().toISOString()
    };
    setFornecedores([...fornecedores, newFornecedor]);
    return true;
  };
  
  const updateFornecedor = (id: string, fornecedorUpdate: Partial<Fornecedor>) => {
    setFornecedores(
      fornecedores.map(fornecedor => 
        fornecedor.id === id ? { ...fornecedor, ...fornecedorUpdate } : fornecedor
      )
    );
  };
  
  const deleteFornecedor = (id: string) => {
    setFornecedores(fornecedores.filter(fornecedor => fornecedor.id !== id));
    // Atualizar produtos que pertençam ao fornecedor
    setProdutos(
      produtos.map(produto => 
        produto.fornecedorId === id 
          ? { ...produto, fornecedorId: '', fornecedorNome: 'Sem fornecedor' } 
          : produto
      )
    );
    // Remover transações relacionadas ao fornecedor
    setTransacoes(transacoes.filter(transacao => transacao.fornecedorId !== id));
  };
  
  // Compras
  const addCompra = (compra: Omit<Compra, "id">) => {
    if (!checkFreeLimit(compras, "compras")) return false;
    
    const newCompra: Compra = {
      ...compra,
      id: uuidv4()
    };
    setCompras([...compras, newCompra]);
    
    // Atualizar estoque dos produtos
    newCompra.produtos.forEach(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (produto) {
        updateProduto(produto.id, { 
          quantidade: produto.quantidade - item.quantidade 
        });
      }
    });
    
    // Adicionar transação correspondente
    addTransacao({
      tipo: 'entrada',
      categoria: 'Vendas',
      descricao: `Venda para ${newCompra.clienteNome}`,
      valor: newCompra.valorTotal,
      data: newCompra.data,
      formaPagamento: newCompra.formaPagamento,
      compraId: newCompra.id,
      clienteId: newCompra.clienteId
    });
    
    return true;
  };
  
  const updateCompra = (id: string, compraUpdate: Partial<Compra>) => {
    const compraAntiga = compras.find(c => c.id === id);
    
    setCompras(
      compras.map(compra => 
        compra.id === id ? { ...compra, ...compraUpdate } : compra
      )
    );
    
    // Atualizar transação correspondente
    if (compraAntiga && compraUpdate.valorTotal !== undefined) {
      const transacao = transacoes.find(t => t.compraId === id);
      if (transacao) {
        updateTransacao(transacao.id, { valor: compraUpdate.valorTotal });
      }
    }
  };
  
  const deleteCompra = (id: string) => {
    setCompras(compras.filter(compra => compra.id !== id));
    // Remover transações relacionadas
    setTransacoes(transacoes.filter(transacao => transacao.compraId !== id));
  };
  
  // Transações
  const addTransacao = (transacao: Omit<Transacao, "id">) => {
    if (!checkFreeLimit(transacoes, "transações")) return false;
    
    const newTransacao: Transacao = {
      ...transacao,
      id: uuidv4()
    };
    setTransacoes([...transacoes, newTransacao]);
    return true;
  };
  
  const updateTransacao = (id: string, transacaoUpdate: Partial<Transacao>) => {
    setTransacoes(
      transacoes.map(transacao => 
        transacao.id === id ? { ...transacao, ...transacaoUpdate } : transacao
      )
    );
  };
  
  const deleteTransacao = (id: string) => {
    setTransacoes(transacoes.filter(transacao => transacao.id !== id));
  };
  
  // Feedbacks
  const addFeedback = (feedback: Omit<Feedback, "id">) => {
    if (!checkFreeLimit(feedbacks, "avaliações")) return false;
    
    const newFeedback: Feedback = {
      ...feedback,
      id: uuidv4()
    };
    setFeedbacks([...feedbacks, newFeedback]);
    return true;
  };
  
  const updateFeedback = (id: string, feedbackUpdate: Partial<Feedback>) => {
    setFeedbacks(
      feedbacks.map(feedback => 
        feedback.id === id ? { ...feedback, ...feedbackUpdate } : feedback
      )
    );
  };
  
  const deleteFeedback = (id: string) => {
    setFeedbacks(feedbacks.filter(feedback => feedback.id !== id));
  };
  
  // Promoções
  const addPromocao = (promocao: Omit<Promocao, "id">) => {
    if (!checkFreeLimit(promocoes, "promoções")) return false;
    
    const newPromocao: Promocao = {
      ...promocao,
      id: uuidv4()
    };
    setPromocoes([...promocoes, newPromocao]);
    return true;
  };
  
  const updatePromocao = (id: string, promocaoUpdate: Partial<Promocao>) => {
    setPromocoes(
      promocoes.map(promocao => 
        promocao.id === id ? { ...promocao, ...promocaoUpdate } : promocao
      )
    );
  };
  
  const deletePromocao = (id: string) => {
    setPromocoes(promocoes.filter(promocao => promocao.id !== id));
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
  
  const value = {
    clientes,
    produtos,
    fornecedores,
    compras,
    transacoes,
    feedbacks,
    promocoes,
    
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
    filterTransacoes
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
