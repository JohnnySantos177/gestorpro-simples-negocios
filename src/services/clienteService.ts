
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

export const clienteService = {
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      nome: item.nome,
      email: item.email || '',
      telefone: item.telefone || '',
      endereco: item.endereco || '',
      cidade: item.cidade || '',
      estado: item.estado || '',
      cep: item.cep || '',
      grupo: item.grupo || '',
      observacoes: item.observacoes || '',
      dataCadastro: item.data_cadastro
    }));
  },

  async createCliente(cliente: Omit<Cliente, "id" | "dataCadastro">): Promise<Cliente> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        cidade: cliente.cidade,
        estado: cliente.estado,
        cep: cliente.cep,
        grupo: cliente.grupo,
        observacoes: cliente.observacoes,
        user_id: user.id,
        data_cadastro: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      nome: data.nome,
      email: data.email || '',
      telefone: data.telefone || '',
      endereco: data.endereco || '',
      cidade: data.cidade || '',
      estado: data.estado || '',
      cep: data.cep || '',
      grupo: data.grupo || '',
      observacoes: data.observacoes || '',
      dataCadastro: data.data_cadastro
    };
  },

  async updateCliente(id: string, updates: Partial<Cliente>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
    if (updates.endereco !== undefined) dbUpdates.endereco = updates.endereco;
    if (updates.cidade !== undefined) dbUpdates.cidade = updates.cidade;
    if (updates.estado !== undefined) dbUpdates.estado = updates.estado;
    if (updates.cep !== undefined) dbUpdates.cep = updates.cep;
    if (updates.grupo !== undefined) dbUpdates.grupo = updates.grupo;
    if (updates.observacoes !== undefined) dbUpdates.observacoes = updates.observacoes;

    const { error } = await supabase
      .from('clientes')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCliente(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
