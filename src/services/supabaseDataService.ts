import { clienteService } from "./clienteService";
import { produtoService } from "./produtoService";
import { fornecedorService } from "./fornecedorService";
import { compraService } from "./compraService";
import { transacaoService } from "./transacaoService";
import { promocaoService } from "./promocaoService";

export const supabaseDataService = {
  // CLIENTES
  getClientes: clienteService.getClientes,
  createCliente: clienteService.createCliente,
  updateCliente: clienteService.updateCliente,
  deleteCliente: clienteService.deleteCliente,

  // PRODUTOS
  getProdutos: produtoService.getProdutos,
  createProduto: produtoService.createProduto,
  updateProduto: produtoService.updateProduto,
  deleteProduto: produtoService.deleteProduto,

  // FORNECEDORES
  getFornecedores: fornecedorService.getFornecedores,
  createFornecedor: fornecedorService.createFornecedor,
  updateFornecedor: fornecedorService.updateFornecedor,
  deleteFornecedor: fornecedorService.deleteFornecedor,

  // COMPRAS (VENDAS)
  getCompras: compraService.getCompras,
  createCompra: compraService.createCompra,
  updateCompra: compraService.updateCompra,
  deleteCompra: compraService.deleteCompra,

  // TRANSACOES
  getTransacoes: transacaoService.getTransacoes,
  createTransacao: transacaoService.createTransacao,
  updateTransacao: transacaoService.updateTransacao,
  deleteTransacao: transacaoService.deleteTransacao,

  // PROMOCOES
  getPromocoes: promocaoService.getPromocoes,
  createPromocao: promocaoService.createPromocao,
  updatePromocao: promocaoService.updatePromocao,
  deletePromocao: promocaoService.deletePromocao
};
