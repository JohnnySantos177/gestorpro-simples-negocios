
import { supabase } from "@/integrations/supabase/client";
import { Transacao } from "@/types";

export const transacaoService = {
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
  }
};
