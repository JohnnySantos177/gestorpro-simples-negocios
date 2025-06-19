
import { supabase } from "@/integrations/supabase/client";
import { Transacao } from "@/types";

export const transacaoService = {
  async getTransacoes(userId: string): Promise<Transacao[]> {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_id', userId)
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

  async createTransacao(transacao: Omit<Transacao, "id"> & { user_id: string }): Promise<Transacao> {
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
        user_id: transacao.user_id
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

  async updateTransacao(transacao: Transacao): Promise<void> {
    const dbUpdates: any = {};
    
    if (transacao.tipo !== undefined) dbUpdates.tipo = transacao.tipo;
    if (transacao.categoria !== undefined) dbUpdates.categoria = transacao.categoria;
    if (transacao.descricao !== undefined) dbUpdates.descricao = transacao.descricao;
    if (transacao.valor !== undefined) dbUpdates.valor = transacao.valor;
    if (transacao.data !== undefined) dbUpdates.data = transacao.data;
    if (transacao.formaPagamento !== undefined) dbUpdates.forma_pagamento = transacao.formaPagamento;
    if (transacao.compraId !== undefined) dbUpdates.compra_id = transacao.compraId;
    if (transacao.fornecedorId !== undefined) dbUpdates.fornecedor_id = transacao.fornecedorId;
    if (transacao.clienteId !== undefined) dbUpdates.cliente_id = transacao.clienteId;

    const { error } = await supabase
      .from('transacoes')
      .update(dbUpdates)
      .eq('id', transacao.id);

    if (error) throw error;
  },

  async deleteTransacao(id: string): Promise<void> {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
