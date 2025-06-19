
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

export const clienteService = {
  async getClientes(userId: string): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
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

  async createCliente(cliente: Omit<Cliente, "id" | "dataCadastro"> & { user_id: string }): Promise<Cliente> {
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
        user_id: cliente.user_id,
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

  async updateCliente(cliente: Cliente): Promise<void> {
    const dbUpdates: any = {};
    
    if (cliente.nome !== undefined) dbUpdates.nome = cliente.nome;
    if (cliente.email !== undefined) dbUpdates.email = cliente.email;
    if (cliente.telefone !== undefined) dbUpdates.telefone = cliente.telefone;
    if (cliente.endereco !== undefined) dbUpdates.endereco = cliente.endereco;
    if (cliente.cidade !== undefined) dbUpdates.cidade = cliente.cidade;
    if (cliente.estado !== undefined) dbUpdates.estado = cliente.estado;
    if (cliente.cep !== undefined) dbUpdates.cep = cliente.cep;
    if (cliente.grupo !== undefined) dbUpdates.grupo = cliente.grupo;
    if (cliente.observacoes !== undefined) dbUpdates.observacoes = cliente.observacoes;

    const { error } = await supabase
      .from('clientes')
      .update(dbUpdates)
      .eq('id', cliente.id);

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
