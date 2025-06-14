
import { supabase } from "@/integrations/supabase/client";
import { 
  Cliente, Produto, Fornecedor, Compra, Transacao, 
  Feedback, Promocao
} from "@/types";

export const supabaseDataService = {
  // CLIENTES
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createCliente(cliente: Omit<Cliente, "id" | "dataCadastro">): Promise<Cliente> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        ...cliente,
        user_id: user.id,
        data_cadastro: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCliente(id: string, updates: Partial<Cliente>): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCliente(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // PRODUTOS
  async getProdutos(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createProduto(produto: Omit<Produto, "id" | "dataCadastro">): Promise<Produto> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('produtos')
      .insert({
        ...produto,
        user_id: user.id,
        data_cadastro: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduto(id: string, updates: Partial<Produto>): Promise<void> {
    const { error } = await supabase
      .from('produtos')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProduto(id: string): Promise<void> {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // FORNECEDORES
  async getFornecedores(): Promise<Fornecedor[]> {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createFornecedor(fornecedor: Omit<Fornecedor, "id" | "dataCadastro">): Promise<Fornecedor> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('fornecedores')
      .insert({
        ...fornecedor,
        user_id: user.id,
        data_cadastro: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFornecedor(id: string, updates: Partial<Fornecedor>): Promise<void> {
    const { error } = await supabase
      .from('fornecedores')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteFornecedor(id: string): Promise<void> {
    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // COMPRAS (VENDAS)
  async getCompras(): Promise<Compra[]> {
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createCompra(compra: Omit<Compra, "id">): Promise<Compra> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('compras')
      .insert({
        ...compra,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCompra(id: string, updates: Partial<Compra>): Promise<void> {
    const { error } = await supabase
      .from('compras')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCompra(id: string): Promise<void> {
    const { error } = await supabase
      .from('compras')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // TRANSACOES
  async getTransacoes(): Promise<Transacao[]> {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createTransacao(transacao: Omit<Transacao, "id">): Promise<Transacao> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('transacoes')
      .insert({
        ...transacao,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransacao(id: string, updates: Partial<Transacao>): Promise<void> {
    const { error } = await supabase
      .from('transacoes')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTransacao(id: string): Promise<void> {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // FEEDBACKS
  async getFeedbacks(): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createFeedback(feedback: Omit<Feedback, "id">): Promise<Feedback> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        ...feedback,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFeedback(id: string, updates: Partial<Feedback>): Promise<void> {
    const { error } = await supabase
      .from('feedbacks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteFeedback(id: string): Promise<void> {
    const { error } = await supabase
      .from('feedbacks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // PROMOCOES
  async getPromocoes(): Promise<Promocao[]> {
    const { data, error } = await supabase
      .from('promocoes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createPromocao(promocao: Omit<Promocao, "id">): Promise<Promocao> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('promocoes')
      .insert({
        ...promocao,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePromocao(id: string, updates: Partial<Promocao>): Promise<void> {
    const { error } = await supabase
      .from('promocoes')
      .update(updates)
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
