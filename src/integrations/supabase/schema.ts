
import { Database } from './types';

// Define our database schema
export type Tables = Database['public']['Tables'];

// Define our table types
export type ClienteTable = {
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
  user_id: string;
};

export type ProdutoTable = {
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
  user_id: string;
};

export type FornecedorTable = {
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
  user_id: string;
};

export type CompraTable = {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  produtos: string; // JSON string of products
  valorTotal: number;
  formaPagamento: string;
  status: string;
  user_id: string;
};

export type TransacaoTable = {
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
  user_id: string;
};

export type FeedbackTable = {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  avaliacao: number;
  comentario: string;
  respondido: boolean;
  resposta?: string;
  user_id: string;
};

export type PromocaoTable = {
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
  user_id: string;
};

export type SubscriptionTable = {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  start_date: string;
  end_date: string;
  payment_provider: 'kwify';
  created_at: string;
};

export type CheckoutSessionTable = {
  id: string;
  user_id: string;
  session_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};
