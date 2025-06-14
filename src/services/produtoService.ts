
import { supabase } from "@/integrations/supabase/client";
import { Produto } from "@/types";

export const produtoService = {
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
  }
};
