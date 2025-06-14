
import { supabase } from "@/integrations/supabase/client";
import { 
  Cliente, Produto, Fornecedor, Compra, Transacao, 
  Feedback, Promocao
} from "@/types";

export const supabaseDataService = {
  // CLIENTES
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      nome: item.nome,
      email: item.email || '',
      telefone: item.telefone || '',
      endereco: item.endereco || '',
      cidade: item.cidade || '',
      estado: item.estado || '',
      cep: item.cep || '',
      grupo: item.grupo || '',
      observacoes: item.observacoes || '',
      dataCadastro: item.data_cadastro
    }));
  },

  async createCliente(cliente: Omit<Cliente, "id" | "dataCadastro">): Promise<Cliente> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep,
        grupo: cliente.grupo,
        observacoes: cliente.observacoes,
        user_id: user.id,
        data_cadastro: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      email: data.email || '',
      telefone: data.telefone || '',
      endereco: data.endereco || '',
      cidade: data.cidade || '',
      estado: data.estado || '',
      cep: data.cep || '',
      grupo: data.grupo || '',
      observacoes: data.observacoes || '',
      dataCadastro: data.data_cadastro
    };
  },

  async updateCliente(id: string, updates: Partial<Cliente>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
    if (updates.endereco !== undefined) dbUpdates.endereco = updates.endereco;
    if (updates.cidade !== undefined) dbUpdates.cidade = updates.cidade;
    if (updates.estado !== undefined) dbUpdates.estado = updates.estado;
    if (updates.cep !== undefined) dbUpdates.cep = updates.cep;
    if (updates.grupo !== undefined) dbUpdates.grupo = updates.grupo;
    if (updates.observacoes !== undefined) dbUpdates.observacoes = updates.observacoes;

    const { error } = await supabase
      .from('clientes')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCliente(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // PRODUTOS
  async getProdutos(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao || '',
      categoria: item.categoria || '',
      precoCompra: Number(item.preco_compra),
      precoVenda: Number(item.preco_venda),
      quantidade: item.quantidade,
      fornecedorId: item.fornecedor_id || '',
      fornecedorNome: item.fornecedor_nome || '',
      dataValidade: item.data_validade || undefined,
      codigoBarra: item.codigo_barra || undefined,
      localizacao: item.localizacao || undefined,
      dataCadastro: item.data_cadastro
    }));
  },

  async createProduto(produto: Omit<Produto, "id" | "dataCadastro">): Promise<Produto> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('produtos')
      .insert({
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        preco_compra: produto.precoCompra,
        preco_venda: produto.precoVenda,
        quantidade: produto.quantidade,
        fornecedor_id: produto.fornecedorId,
        fornecedor_nome: produto.fornecedorNome,
        data_validade: produto.dataValidade,
        codigo_barra: produto.codigoBarra,
        localizacao: produto.localizacao,
        user_id: user.id,
        data_cadastro: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao || '',
      categoria: data.categoria || '',
      precoCompra: Number(data.preco_compra),
      precoVenda: Number(data.preco_venda),
      quantidade: data.quantidade,
      fornecedorId: data.fornecedor_id || '',
      fornecedorNome: data.fornecedor_nome || '',
      dataValidade: data.data_validade || undefined,
      codigoBarra: data.codigo_barra || undefined,
      localizacao: data.localizacao || undefined,
      dataCadastro: data.data_cadastro
    };
  },

  async updateProduto(id: string, updates: Partial<Produto>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
    if (updates.precoCompra !== undefined) dbUpdates.preco_compra = updates.precoCompra;
    if (updates.precoVenda !== undefined) dbUpdates.preco_venda = updates.precoVenda;
    if (updates.quantidade !== undefined) dbUpdates.quantidade = updates.quantidade;
    if (updates.fornecedorId !== undefined) dbUpdates.fornecedor_id = updates.fornecedorId;
    if (updates.fornecedorNome !== undefined) dbUpdates.fornecedor_nome = updates.fornecedorNome;
    if (updates.dataValidade !== undefined) dbUpdates.data_validade = updates.dataValidade;
    if (updates.codigoBarra !== undefined) dbUpdates.codigo_barra = updates.codigoBarra;
    if (updates.localizacao !== undefined) dbUpdates.localizacao = updates.localizacao;

    const { error } = await supabase
      .from('produtos')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProduto(id: string): Promise<void> {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // FORNECEDORES
  async getFornecedores(): Promise<Fornecedor[]> {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      nome: item.nome,
      contato: item.contato || '',
      telefone: item.telefone || '',
      email: item.email || '',
      endereco: item.endereco || '',
      cidade: item.cidade || '',
      estado: item.estado || '',
      cep: item.cep || '',
      cnpj: item.cnpj || '',
      prazoEntrega: item.prazo_entrega || 0,
      observacoes: item.observacoes || '',
      dataCadastro: item.data_cadastro
    }));
  },

  async createFornecedor(fornecedor: Omit<Fornecedor, "id" | "dataCadastro">): Promise<Fornecedor> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('fornecedores')
      .insert({
        nome: fornecedor.nome,
        contato: fornecedor.contato,
        telefone: fornecedor.telefone,
        email: fornecedor.email,
        endereco: fornecedor.endereco,
        cidade: fornecedor.cidade,
        estado: fornecedor.estado,
        cep: fornecedor.cep,
        cnpj: fornecedor.cnpj,
        prazo_entrega: fornecedor.prazoEntrega,
        observacoes: fornecedor.observacoes,
        user_id: user.id,
        data_cadastro: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      contato: data.contato || '',
      telefone: data.telefone || '',
      email: data.email || '',
      endereco: data.endereco || '',
      cidade: data.cidade || '',
      estado: data.estado || '',
      cep: data.cep || '',
      cnpj: data.cnpj || '',
      prazoEntrega: data.prazo_entrega || 0,
      observacoes: data.observacoes || '',
      dataCadastro: data.data_cadastro
    };
  },

  async updateFornecedor(id: string, updates: Partial<Fornecedor>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.contato !== undefined) dbUpdates.contato = updates.contato;
    if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.endereco !== undefined) dbUpdates.endereco = updates.endereco;
    if (updates.cidade !== undefined) dbUpdates.cidade = updates.cidade;
    if (updates.estado !== undefined) dbUpdates.estado = updates.estado;
    if (updates.cep !== undefined) dbUpdates.cep = updates.cep;
    if (updates.cnpj !== undefined) dbUpdates.cnpj = updates.cnpj;
    if (updates.prazoEntrega !== undefined) dbUpdates.prazo_entrega = updates.prazoEntrega;
    if (updates.observacoes !== undefined) dbUpdates.observacoes = updates.observacoes;

    const { error } = await supabase
      .from('fornecedores')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteFornecedor(id: string): Promise<void> {
    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // COMPRAS (VENDAS)
  async getCompras(): Promise<Compra[]> {
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clienteId: item.cliente_id || '',
      clienteNome: item.cliente_nome || '',
      data: item.data,
      produtos: Array.isArray(item.produtos) ? item.produtos : [],
      valorTotal: Number(item.valor_total),
      formaPagamento: item.forma_pagamento,
      status: item.status
    }));
  },

  async createCompra(compra: Omit<Compra, "id">): Promise<Compra> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('compras')
      .insert({
        cliente_id: compra.clienteId,
        cliente_nome: compra.clienteNome,
        data: compra.data,
        produtos: compra.produtos,
        valor_total: compra.valorTotal,
        forma_pagamento: compra.formaPagamento,
        status: compra.status,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      clienteId: data.cliente_id || '',
      clienteNome: data.cliente_nome || '',
      data: data.data,
      produtos: Array.isArray(data.produtos) ? data.produtos : [],
      valorTotal: Number(data.valor_total),
      formaPagamento: data.forma_pagamento,
      status: data.status
    };
  },

  async updateCompra(id: string, updates: Partial<Compra>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.clienteId !== undefined) dbUpdates.cliente_id = updates.clienteId;
    if (updates.clienteNome !== undefined) dbUpdates.cliente_nome = updates.clienteNome;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.produtos !== undefined) dbUpdates.produtos = updates.produtos;
    if (updates.valorTotal !== undefined) dbUpdates.valor_total = updates.valorTotal;
    if (updates.formaPagamento !== undefined) dbUpdates.forma_pagamento = updates.formaPagamento;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('compras')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCompra(id: string): Promise<void> {
    const { error } = await supabase
      .from('compras')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // TRANSACOES
  async getTransacoes(): Promise<Transacao[]> {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      tipo: item.tipo as 'entrada' | 'saida',
      categoria: item.categoria,
      descricao: item.descricao || '',
      valor: Number(item.valor),
      data: item.data,
      formaPagamento: item.forma_pagamento,
      compraId: item.compra_id || undefined,
      fornecedorId: item.fornecedor_id || undefined,
      clienteId: item.cliente_id || undefined
    }));
  },

  async createTransacao(transacao: Omit<Transacao, "id">): Promise<Transacao> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('transacoes')
      .insert({
        tipo: transacao.tipo,
        categoria: transacao.categoria,
        descricao: transacao.descricao,
        valor: transacao.valor,
        data: transacao.data,
        forma_pagamento: transacao.formaPagamento,
        compra_id: transacao.compraId,
        fornecedor_id: transacao.fornecedorId,
        cliente_id: transacao.clienteId,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      tipo: data.tipo as 'entrada' | 'saida',
      categoria: data.categoria,
      descricao: data.descricao || '',
      valor: Number(data.valor),
      data: data.data,
      formaPagamento: data.forma_pagamento,
      compraId: data.compra_id || undefined,
      fornecedorId: data.fornecedor_id || undefined,
      clienteId: data.cliente_id || undefined
    };
  },

  async updateTransacao(id: string, updates: Partial<Transacao>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.tipo !== undefined) dbUpdates.tipo = updates.tipo;
    if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.valor !== undefined) dbUpdates.valor = updates.valor;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.formaPagamento !== undefined) dbUpdates.forma_pagamento = updates.formaPagamento;
    if (updates.compraId !== undefined) dbUpdates.compra_id = updates.compraId;
    if (updates.fornecedorId !== undefined) dbUpdates.fornecedor_id = updates.fornecedorId;
    if (updates.clienteId !== undefined) dbUpdates.cliente_id = updates.clienteId;

    const { error } = await supabase
      .from('transacoes')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTransacao(id: string): Promise<void> {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // FEEDBACKS
  async getFeedbacks(): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clienteId: item.cliente_id,
      clienteNome: item.cliente_nome,
      data: item.data,
      avaliacao: item.avaliacao,
      comentario: item.comentario || '',
      respondido: item.respondido || false,
      resposta: item.resposta || undefined
    }));
  },

  async createFeedback(feedback: Omit<Feedback, "id">): Promise<Feedback> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        cliente_id: feedback.clienteId,
        cliente_nome: feedback.clienteNome,
        data: feedback.data,
        avaliacao: feedback.avaliacao,
        comentario: feedback.comentario,
        respondido: feedback.respondido,
        resposta: feedback.resposta,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      clienteId: data.cliente_id,
      clienteNome: data.cliente_nome,
      data: data.data,
      avaliacao: data.avaliacao,
      comentario: data.comentario || '',
      respondido: data.respondido || false,
      resposta: data.resposta || undefined
    };
  },

  async updateFeedback(id: string, updates: Partial<Feedback>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.clienteId !== undefined) dbUpdates.cliente_id = updates.clienteId;
    if (updates.clienteNome !== undefined) dbUpdates.cliente_nome = updates.clienteNome;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.avaliacao !== undefined) dbUpdates.avaliacao = updates.avaliacao;
    if (updates.comentario !== undefined) dbUpdates.comentario = updates.comentario;
    if (updates.respondido !== undefined) dbUpdates.respondido = updates.respondido;
    if (updates.resposta !== undefined) dbUpdates.resposta = updates.resposta;

    const { error } = await supabase
      .from('feedbacks')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteFeedback(id: string): Promise<void> {
    const { error } = await supabase
      .from('feedbacks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // PROMOCOES
  async getPromocoes(): Promise<Promocao[]> {
    const { data, error } = await supabase
      .from('promocoes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao || '',
      tipoDesconto: item.tipo_desconto as 'percentual' | 'valor',
      valorDesconto: Number(item.valor_desconto),
      produtoId: item.produto_id || undefined,
      categoriaId: item.categoria_id || undefined,
      dataInicio: item.data_inicio,
      dataFim: item.data_fim,
      ativo: item.ativo || false
    }));
  },

  async createPromocao(promocao: Omit<Promocao, "id">): Promise<Promocao> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('promocoes')
      .insert({
        nome: promocao.nome,
        descricao: promocao.descricao,
        tipo_desconto: promocao.tipoDesconto,
        valor_desconto: promocao.valorDesconto,
        produto_id: promocao.produtoId,
        categoria_id: promocao.categoriaId,
        data_inicio: promocao.dataInicio,
        data_fim: promocao.dataFim,
        ativo: promocao.ativo,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao || '',
      tipoDesconto: data.tipo_desconto as 'percentual' | 'valor',
      valorDesconto: Number(data.valor_desconto),
      produtoId: data.produto_id || undefined,
      categoriaId: data.categoria_id || undefined,
      dataInicio: data.data_inicio,
      dataFim: data.data_fim,
      ativo: data.ativo || false
    };
  },

  async updatePromocao(id: string, updates: Partial<Promocao>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.tipoDesconto !== undefined) dbUpdates.tipo_desconto = updates.tipoDesconto;
    if (updates.valorDesconto !== undefined) dbUpdates.valor_desconto = updates.valorDesconto;
    if (updates.produtoId !== undefined) dbUpdates.produto_id = updates.produtoId;
    if (updates.categoriaId !== undefined) dbUpdates.categoria_id = updates.categoriaId;
    if (updates.dataInicio !== undefined) dbUpdates.data_inicio = updates.dataInicio;
    if (updates.dataFim !== undefined) dbUpdates.data_fim = updates.dataFim;
    if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;

    const { error } = await supabase
      .from('promocoes')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deletePromocao(id: string): Promise<void> {
    const { error } = await supabase
      .from('promocoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
