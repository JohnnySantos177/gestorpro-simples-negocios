
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Compra, Transacao, Cliente, Produto } from '@/types';

interface ExportData {
  vendas?: Compra[];
  transacoes?: Transacao[];
  clientes?: Cliente[];
  produtos?: Produto[];
}

export const exportToPDF = (data: ExportData, type: 'vendas' | 'transacoes' | 'clientes' | 'produtos') => {
  const doc = new jsPDF();
  
  // Configurações gerais
  doc.setFontSize(16);
  doc.text(`Relatório de ${type.charAt(0).toUpperCase() + type.slice(1)}`, 20, 20);
  
  doc.setFontSize(10);
  doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

  let tableData: any[] = [];
  let headers: string[] = [];

  switch (type) {
    case 'vendas':
      headers = ['Data', 'Cliente', 'Valor Total', 'Forma Pagamento', 'Status'];
      tableData = data.vendas?.map(venda => [
        new Date(venda.data).toLocaleDateString('pt-BR'),
        venda.clienteNome,
        `R$ ${venda.valorTotal.toFixed(2)}`,
        venda.formaPagamento,
        venda.status
      ]) || [];
      break;

    case 'transacoes':
      headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'];
      tableData = data.transacoes?.map(transacao => [
        new Date(transacao.data).toLocaleDateString('pt-BR'),
        transacao.tipo === 'entrada' ? 'Entrada' : 'Saída',
        transacao.categoria,
        transacao.descricao,
        `R$ ${transacao.valor.toFixed(2)}`
      ]) || [];
      break;

    case 'clientes':
      headers = ['Nome', 'Email', 'Telefone', 'Grupo', 'Data Cadastro'];
      tableData = data.clientes?.map(cliente => [
        cliente.nome,
        cliente.email,
        cliente.telefone,
        cliente.grupo,
        new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')
      ]) || [];
      break;

    case 'produtos':
      headers = ['Nome', 'Categoria', 'Preço', 'Quantidade', 'Fornecedor'];
      tableData = data.produtos?.map(produto => [
        produto.nome,
        produto.categoria,
        `R$ ${produto.preco.toFixed(2)}`,
        produto.quantidade.toString(),
        produto.fornecedorNome || 'N/A'
      ]) || [];
      break;
  }

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Salvar o arquivo
  doc.save(`${type}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportToExcel = (data: ExportData, type: 'vendas' | 'transacoes' | 'clientes' | 'produtos') => {
  let worksheetData: any[] = [];
  let headers: string[] = [];

  switch (type) {
    case 'vendas':
      headers = ['Data', 'Cliente', 'Valor Total', 'Forma Pagamento', 'Status', 'Produtos'];
      worksheetData = data.vendas?.map(venda => ({
        'Data': new Date(venda.data).toLocaleDateString('pt-BR'),
        'Cliente': venda.clienteNome,
        'Valor Total': venda.valorTotal,
        'Forma Pagamento': venda.formaPagamento,
        'Status': venda.status,
        'Produtos': venda.produtos.map(p => `${p.produtoNome} (${p.quantidade})`).join(', ')
      })) || [];
      break;

    case 'transacoes':
      headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Forma Pagamento'];
      worksheetData = data.transacoes?.map(transacao => ({
        'Data': new Date(transacao.data).toLocaleDateString('pt-BR'),
        'Tipo': transacao.tipo === 'entrada' ? 'Entrada' : 'Saída',
        'Categoria': transacao.categoria,
        'Descrição': transacao.descricao,
        'Valor': transacao.valor,
        'Forma Pagamento': transacao.formaPagamento
      })) || [];
      break;

    case 'clientes':
      headers = ['Nome', 'Email', 'Telefone', 'Grupo', 'Endereço', 'Data Cadastro'];
      worksheetData = data.clientes?.map(cliente => ({
        'Nome': cliente.nome,
        'Email': cliente.email,
        'Telefone': cliente.telefone,
        'Grupo': cliente.grupo,
        'Endereço': cliente.endereco,
        'Data Cadastro': new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')
      })) || [];
      break;

    case 'produtos':
      headers = ['Nome', 'Descrição', 'Categoria', 'Preço', 'Quantidade', 'Fornecedor', 'Data Cadastro'];
      worksheetData = data.produtos?.map(produto => ({
        'Nome': produto.nome,
        'Descrição': produto.descricao,
        'Categoria': produto.categoria,
        'Preço': produto.preco,
        'Quantidade': produto.quantidade,
        'Fornecedor': produto.fornecedorNome || 'N/A',
        'Data Cadastro': new Date(produto.dataCadastro).toLocaleDateString('pt-BR')
      })) || [];
      break;
  }

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(worksheetData);

  // Ajustar largura das colunas
  const colWidths = headers.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));

  // Salvar arquivo
  XLSX.writeFile(wb, `${type}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
