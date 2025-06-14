
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Compra, Transacao, Cliente, Produto, Fornecedor } from '@/types';

interface ExportData {
  vendas?: Compra[];
  transacoes?: Transacao[];
  clientes?: Cliente[];
  produtos?: Produto[];
  fornecedores?: Fornecedor[];
}

export const exportToPDF = (data: ExportData, type: 'vendas' | 'transacoes' | 'clientes' | 'produtos' | 'fornecedores') => {
  const doc = new jsPDF();
  
  // Configurar cabeçalho da empresa
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TotalGestor - Sistema de Gestão', 105, 15, { align: 'center' });
  
  // Configurar título do relatório
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Relatório de ${type.charAt(0).toUpperCase() + type.slice(1)}`, 105, 25, { align: 'center' });
  
  // Configurar data de geração
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 105, 32, { align: 'center' });

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
        `R$ ${produto.precoVenda.toFixed(2)}`,
        produto.quantidade.toString(),
        produto.fornecedorNome || 'N/A'
      ]) || [];
      break;

    case 'fornecedores':
      headers = ['Nome', 'Contato', 'Telefone', 'Email', 'Cidade', 'Estado'];
      tableData = data.fornecedores?.map(fornecedor => [
        fornecedor.nome,
        fornecedor.contato,
        fornecedor.telefone,
        fornecedor.email,
        fornecedor.cidade,
        fornecedor.estado
      ]) || [];
      break;
  }

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 45, // Aumentar o startY para dar espaço ao cabeçalho
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

export const exportToExcel = (data: ExportData, type: 'vendas' | 'transacoes' | 'clientes' | 'produtos' | 'fornecedores') => {
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
        'Preço': produto.precoVenda,
        'Quantidade': produto.quantidade,
        'Fornecedor': produto.fornecedorNome || 'N/A',
        'Data Cadastro': new Date(produto.dataCadastro).toLocaleDateString('pt-BR')
      })) || [];
      break;

    case 'fornecedores':
      headers = ['Nome', 'Contato', 'Telefone', 'Email', 'Endereço', 'Cidade', 'Estado', 'CNPJ', 'Prazo Entrega'];
      worksheetData = data.fornecedores?.map(fornecedor => ({
        'Nome': fornecedor.nome,
        'Contato': fornecedor.contato,
        'Telefone': fornecedor.telefone,
        'Email': fornecedor.email,
        'Endereço': fornecedor.endereco,
        'Cidade': fornecedor.cidade,
        'Estado': fornecedor.estado,
        'CNPJ': fornecedor.cnpj,
        'Prazo Entrega': `${fornecedor.prazoEntrega} dias`
      })) || [];
      break;
  }

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  
  // Criar cabeçalho com informações da empresa e data
  const headerData = [
    ['TotalGestor - Sistema de Gestão'],
    [`Relatório de ${type.charAt(0).toUpperCase() + type.slice(1)}`],
    [`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`],
    [], // Linha em branco
  ];

  // Combinar cabeçalho com dados
  const combinedData = [...headerData, headers, ...worksheetData.map(row => headers.map(header => row[header]))];
  
  // Criar worksheet com os dados combinados
  const ws = XLSX.utils.aoa_to_sheet(combinedData);

  // Configurar estilos para o cabeçalho
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  
  // Aplicar estilos ao cabeçalho da empresa (primeira linha)
  if (ws['A1']) {
    ws['A1'].s = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' }
    };
  }
  
  // Aplicar estilos ao título do relatório (segunda linha)
  if (ws['A2']) {
    ws['A2'].s = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'center' }
    };
  }

  // Aplicar estilos à data (terceira linha)
  if (ws['A3']) {
    ws['A3'].s = {
      font: { italic: true },
      alignment: { horizontal: 'center' }
    };
  }

  // Aplicar estilos aos cabeçalhos das colunas (quinta linha)
  const headerRowIndex = 5; // 0-indexed (linha 5 no Excel)
  for (let col = 0; col < headers.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex - 1, c: col });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E3F2FD' } },
        alignment: { horizontal: 'center' }
      };
    }
  }

  // Mesclar células para o cabeçalho
  if (!ws['!merges']) ws['!merges'] = [];
  
  // Mesclar título da empresa
  ws['!merges'].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: headers.length - 1 }
  });

  // Mesclar título do relatório
  ws['!merges'].push({
    s: { r: 1, c: 0 },
    e: { r: 1, c: headers.length - 1 }
  });

  // Mesclar data de geração
  ws['!merges'].push({
    s: { r: 2, c: 0 },
    e: { r: 2, c: headers.length - 1 }
  });

  // Ajustar largura das colunas
  const colWidths = headers.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, type.charAt(0).toUpperCase() + type.slice(1));

  // Salvar arquivo
  XLSX.writeFile(wb, `${type}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
