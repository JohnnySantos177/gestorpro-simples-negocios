
import { supabase } from "@/integrations/supabase/client";
import { Promocao } from "@/types";

export const promocaoService = {
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
