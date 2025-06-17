
import { clienteService } from "./clienteService";
import { produtoService } from "./produtoService";
import { fornecedorService } from "./fornecedorService";
import { compraService } from "./compraService";
import { transacaoService } from "./transacaoService";
import { feedbackService } from "./feedbackService";
import { promocaoService } from "./promocaoService";

export const supabaseDataService = {
  // CLIENTES
  getClientes: (userId: string) => clienteService.getClientes(userId),
  createCliente: clienteService.createCliente,
  updateCliente: clienteService.updateCliente,
  deleteCliente: clienteService.deleteCliente,

  // PRODUTOS
  getProdutos: (userId: string) => produtoService.getProdutos(userId),
  createProduto: produtoService.createProduto,
  updateProduto: produtoService.updateProduto,
  deleteProduto: produtoService.deleteProduto,

  // FORNECEDORES
  getFornecedores: (userId: string) => fornecedorService.getFornecedores(userId),
  createFornecedor: fornecedorService.createFornecedor,
  updateFornecedor: fornecedorService.updateFornecedor,
  deleteFornecedor: fornecedorService.deleteFornecedor,

  // COMPRAS (VENDAS)
  getCompras: (userId: string) => compraService.getCompras(userId),
  createCompra: compraService.createCompra,
  updateCompra: compraService.updateCompra,
  deleteCompra: compraService.deleteCompra,

  // TRANSACOES
  getTransacoes: (userId: string) => transacaoService.getTransacoes(userId),
  createTransacao: transacaoService.createTransacao,
  updateTransacao: transacaoService.updateTransacao,
  deleteTransacao: transacaoService.deleteTransacao,

  // FEEDBACKS
  getFeedbacks: (userId: string) => feedbackService.getFeedbacks(userId),
  createFeedback: feedbackService.createFeedback,
  updateFeedback: feedbackService.updateFeedback,
  deleteFeedback: feedbackService.deleteFeedback,

  // PROMOCOES
  getPromocoes: (userId: string) => promocaoService.getPromocoes(userId),
  createPromocao: promocaoService.createPromocao,
  updatePromocao: promocaoService.updatePromocao,
  deletePromocao: promocaoService.deletePromocao
};
