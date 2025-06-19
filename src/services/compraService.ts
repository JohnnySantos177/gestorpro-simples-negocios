
import { supabase } from "@/integrations/supabase/client";
import { Compra, ItemCompra } from "@/types";

export const compraService = {
  async getCompras(userId: string): Promise<Compra[]> {
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const compras = data.map(row => ({
      id: row.id,
      clienteId: row.cliente_id,
      clienteNome: row.cliente_nome,
      data: row.data,
      produtos: Array.isArray(row.produtos) ? (row.produtos as unknown as ItemCompra[]) : [],
      valorTotal: row.valor_total,
      formaPagamento: row.forma_pagamento,
      status: row.status,
    }));

    return compras;
  },

  async createCompra(compraData: Omit<Compra, "id"> & { user_id: string }): Promise<Compra> {
    const { data, error } = await supabase
      .from('compras')
      .insert({
        cliente_id: compraData.clienteId,
        cliente_nome: compraData.clienteNome,
        data: compraData.data,
        produtos: compraData.produtos as any,
        valor_total: compraData.valorTotal,
        forma_pagamento: compraData.formaPagamento,
        status: compraData.status,
        user_id: compraData.user_id
      })
      .select()
      .single();

    if (error) throw error;
    
    const newCompra = {
      id: data.id,
      clienteId: data.cliente_id,
      clienteNome: data.cliente_nome,
      data: data.data,
      produtos: Array.isArray(data.produtos) ? (data.produtos as unknown as ItemCompra[]) : [],
      valorTotal: data.valor_total,
      formaPagamento: data.forma_pagamento,
      status: data.status,
    };

    return newCompra;
  },

  async updateCompra(compra: Compra): Promise<void> {
    const dbUpdates: any = {};
    
    if (compra.clienteId !== undefined) dbUpdates.cliente_id = compra.clienteId;
    if (compra.clienteNome !== undefined) dbUpdates.cliente_nome = compra.clienteNome;
    if (compra.data !== undefined) dbUpdates.data = compra.data;
    if (compra.produtos !== undefined) dbUpdates.produtos = compra.produtos;
    if (compra.valorTotal !== undefined) dbUpdates.valor_total = compra.valorTotal;
    if (compra.formaPagamento !== undefined) dbUpdates.forma_pagamento = compra.formaPagamento;
    if (compra.status !== undefined) dbUpdates.status = compra.status;

    const { error } = await supabase
      .from('compras')
      .update(dbUpdates)
      .eq('id', compra.id);

    if (error) throw error;
  },

  async deleteCompra(id: string): Promise<void> {
    const { error } = await supabase
      .from('compras')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
