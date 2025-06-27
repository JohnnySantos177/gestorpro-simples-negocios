import { supabase } from "@/integrations/supabase/client";
import { Produto } from "@/types";

export const produtoService = {
  async getProdutos(userId: string): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('user_id', userId)
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
      dataCadastro: item.data_cadastro,
      foto_url: item.foto_url || item.fotoUrl || '',
      publicar_no_catalogo: item.publicar_no_catalogo ?? item.publicarNoCatalogo ?? false,
    }));
  },

  async createProduto(produto: Omit<Produto, "id" | "dataCadastro"> & { user_id: string }): Promise<Produto> {
    // Corrigir fornecedorId para usar null se vier "" ou undefined
    const fornecedorIdFinal = produto.fornecedorId && produto.fornecedorId !== "" ? produto.fornecedorId : null;
    const fornecedorNomeFinal = produto.fornecedorNome ?? "";

    const { data, error } = await supabase
      .from('produtos')
      .insert({
        nome: produto.nome,
        descricao: produto.descricao,
        categoria: produto.categoria,
        preco_compra: produto.precoCompra,
        preco_venda: produto.precoVenda,
        quantidade: produto.quantidade,
        fornecedor_id: fornecedorIdFinal,
        fornecedor_nome: fornecedorNomeFinal,
        data_validade: produto.dataValidade,
        codigo_barra: produto.codigoBarra,
        localizacao: produto.localizacao,
        user_id: produto.user_id,
        data_cadastro: new Date().toISOString(),
        foto_url: produto.foto_url,
        publicar_no_catalogo: produto.publicar_no_catalogo
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

  async updateProduto(produto: Produto): Promise<void> {
    // Corrigir fornecedor_id caso produto.fornecedorId seja "", transformar em null
    const dbUpdates: any = {};
    
    if (produto.nome !== undefined) dbUpdates.nome = produto.nome;
    if (produto.descricao !== undefined) dbUpdates.descricao = produto.descricao;
    if (produto.categoria !== undefined) dbUpdates.categoria = produto.categoria;
    if (produto.precoCompra !== undefined) dbUpdates.preco_compra = produto.precoCompra;
    if (produto.precoVenda !== undefined) dbUpdates.preco_venda = produto.precoVenda;
    if (produto.quantidade !== undefined) dbUpdates.quantidade = produto.quantidade;
    if (produto.fornecedorId !== undefined)
      dbUpdates.fornecedor_id = produto.fornecedorId !== "" ? produto.fornecedorId : null;
    if (produto.fornecedorNome !== undefined) dbUpdates.fornecedor_nome = produto.fornecedorNome;
    if (produto.dataValidade !== undefined) dbUpdates.data_validade = produto.dataValidade;
    if (produto.codigoBarra !== undefined) dbUpdates.codigo_barra = produto.codigoBarra;
    if (produto.localizacao !== undefined) dbUpdates.localizacao = produto.localizacao;
    if (produto.foto_url !== undefined) dbUpdates.foto_url = produto.foto_url;
    if (produto.publicar_no_catalogo !== undefined) dbUpdates.publicar_no_catalogo = produto.publicar_no_catalogo;

    const { error } = await supabase
      .from('produtos')
      .update(dbUpdates)
      .eq('id', produto.id);

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
