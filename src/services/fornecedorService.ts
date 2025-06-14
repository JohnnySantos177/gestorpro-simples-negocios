
import { supabase } from "@/integrations/supabase/client";
import { Fornecedor } from "@/types";

export const fornecedorService = {
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
  }
};
