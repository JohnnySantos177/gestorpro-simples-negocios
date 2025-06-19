
import { supabase } from "@/integrations/supabase/client";
import { Fornecedor } from "@/types";

export const fornecedorService = {
  async getFornecedores(userId: string): Promise<Fornecedor[]> {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('user_id', userId)
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

  async createFornecedor(fornecedor: Omit<Fornecedor, "id" | "dataCadastro"> & { user_id: string }): Promise<Fornecedor> {
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
        user_id: fornecedor.user_id,
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

  async updateFornecedor(fornecedor: Fornecedor): Promise<void> {
    const dbUpdates: any = {};
    
    if (fornecedor.nome !== undefined) dbUpdates.nome = fornecedor.nome;
    if (fornecedor.contato !== undefined) dbUpdates.contato = fornecedor.contato;
    if (fornecedor.telefone !== undefined) dbUpdates.telefone = fornecedor.telefone;
    if (fornecedor.email !== undefined) dbUpdates.email = fornecedor.email;
    if (fornecedor.endereco !== undefined) dbUpdates.endereco = fornecedor.endereco;
    if (fornecedor.cidade !== undefined) dbUpdates.cidade = fornecedor.cidade;
    if (fornecedor.estado !== undefined) dbUpdates.estado = fornecedor.estado;
    if (fornecedor.cep !== undefined) dbUpdates.cep = fornecedor.cep;
    if (fornecedor.cnpj !== undefined) dbUpdates.cnpj = fornecedor.cnpj;
    if (fornecedor.prazoEntrega !== undefined) dbUpdates.prazo_entrega = fornecedor.prazoEntrega;
    if (fornecedor.observacoes !== undefined) dbUpdates.observacoes = fornecedor.observacoes;

    const { error } = await supabase
      .from('fornecedores')
      .update(dbUpdates)
      .eq('id', fornecedor.id);

    if (error) throw error;
  },

  async deleteFornecedor(id: string): Promise<void> {
    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
