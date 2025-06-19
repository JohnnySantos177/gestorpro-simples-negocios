
import { supabase } from "@/integrations/supabase/client";
import { Promocao } from "@/types";

export const promocaoService = {
  async getPromocoes(userId: string): Promise<Promocao[]> {
    const { data, error } = await supabase
      .from('promocoes')
      .select('*')
      .eq('user_id', userId)
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

  async createPromocao(promocao: Omit<Promocao, "id"> & { user_id: string }): Promise<Promocao> {
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
        user_id: promocao.user_id
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

  async updatePromocao(promocao: Promocao): Promise<void> {
    const dbUpdates: any = {};
    
    if (promocao.nome !== undefined) dbUpdates.nome = promocao.nome;
    if (promocao.descricao !== undefined) dbUpdates.descricao = promocao.descricao;
    if (promocao.tipoDesconto !== undefined) dbUpdates.tipo_desconto = promocao.tipoDesconto;
    if (promocao.valorDesconto !== undefined) dbUpdates.valor_desconto = promocao.valorDesconto;
    if (promocao.produtoId !== undefined) dbUpdates.produto_id = promocao.produtoId;
    if (promocao.categoriaId !== undefined) dbUpdates.categoria_id = promocao.categoriaId;
    if (promocao.dataInicio !== undefined) dbUpdates.data_inicio = promocao.dataInicio;
    if (promocao.dataFim !== undefined) dbUpdates.data_fim = promocao.dataFim;
    if (promocao.ativo !== undefined) dbUpdates.ativo = promocao.ativo;

    const { error } = await supabase
      .from('promocoes')
      .update(dbUpdates)
      .eq('id', promocao.id);

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
