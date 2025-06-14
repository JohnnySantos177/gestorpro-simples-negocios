
import { supabase } from "@/integrations/supabase/client";
import { Compra, ItemCompra } from "@/types";

export const compraService = {
  async getCompras(): Promise<Compra[]> {
    const { data, error } = await supabase
      .from('compras')
      .select('*')
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

  async createCompra(compraData: Omit<Compra, "id">): Promise<Compra> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

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
        user_id: user.id
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
  }
};
