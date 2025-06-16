
// Cliente types
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  grupo: string;
  observacoes: string;
  dataCadastro: string;
}

// Compra types
export interface Compra {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  produtos: ItemCompra[];
  valorTotal: number;
  formaPagamento: string;
  status: string;
}

// Alias for backwards compatibility
export type Venda = Compra;

export interface ItemCompra {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

// Produto types
export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  precoCompra: number;
  precoVenda: number;
  quantidade: number;
  fornecedorId: string;
  fornecedorNome: string;
  dataValidade?: string;
  codigoBarra?: string;
  localizacao?: string;
  dataCadastro: string;
}

// Fornecedor types
export interface Fornecedor {
  id: string;
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  cnpj: string;
  prazoEntrega: number;
  observacoes: string;
  dataCadastro: string;
}

// Transacao types
export interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  formaPagamento: string;
  compraId?: string;
  fornecedorId?: string;
  clienteId?: string;
}

// Feedback types
export interface Feedback {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  avaliacao: number;
  comentario: string;
  respondido: boolean;
  resposta?: string;
}

// Promocao types
export interface Promocao {
  id: string;
  nome: string;
  descricao: string;
  tipoDesconto: 'percentual' | 'valor';
  valorDesconto: number;
  produtoId?: string;
  categoriaId?: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
}

// FilterOptions type
export interface FilterOptions {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  itemsPerPage: number;
  [key: string]: any;
}

// DashboardStats type
export interface DashboardStats {
  totalClientes: number;
  totalProdutos: number;
  totalVendas: number;
  totalCompras: number;
  faturamentoMensal: number;
  ticketMedio: number;
  produtosMaisVendidos: {
    nome: string;
    quantidade: number;
  }[];
  vendasPorPeriodo: {
    periodo: string;
    valor: number;
  }[];
  estoqueStatus: {
    baixo: number;
    normal: number;
    alto: number;
  };
}

// UserProfile type - updated to match database schema
export interface UserProfile {
  id: string;
  nome: string | null;
  tipo_plano: 'padrao' | 'premium';
  tipo_usuario: 'usuario' | 'admin_mestre';
  created_at: string;
  updated_at: string;
  is_super_admin?: boolean;
  email?: string; // Para facilitar o painel, email pode ser opcional
  telefone?: string | null;
}
