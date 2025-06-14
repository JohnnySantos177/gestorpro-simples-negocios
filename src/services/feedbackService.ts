
import { supabase } from "@/integrations/supabase/client";
import { Feedback } from "@/types";

export const feedbackService = {
  async getFeedbacks(): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clienteId: item.cliente_id,
      clienteNome: item.cliente_nome,
      data: item.data,
      avaliacao: item.avaliacao,
      comentario: item.comentario || '',
      respondido: item.respondido || false,
      resposta: item.resposta || undefined
    }));
  },

  async createFeedback(feedback: Omit<Feedback, "id">): Promise<Feedback> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        cliente_id: feedback.clienteId,
        cliente_nome: feedback.clienteNome,
        data: feedback.data,
        avaliacao: feedback.avaliacao,
        comentario: feedback.comentario,
        respondido: feedback.respondido,
        resposta: feedback.resposta,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      clienteId: data.cliente_id,
      clienteNome: data.cliente_nome,
      data: data.data,
      avaliacao: data.avaliacao,
      comentario: data.comentario || '',
      respondido: data.respondido || false,
      resposta: data.resposta || undefined
    };
  },

  async updateFeedback(id: string, updates: Partial<Feedback>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.clienteId !== undefined) dbUpdates.cliente_id = updates.clienteId;
    if (updates.clienteNome !== undefined) dbUpdates.cliente_nome = updates.clienteNome;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.avaliacao !== undefined) dbUpdates.avaliacao = updates.avaliacao;
    if (updates.comentario !== undefined) dbUpdates.comentario = updates.comentario;
    if (updates.respondido !== undefined) dbUpdates.respondido = updates.respondido;
    if (updates.resposta !== undefined) dbUpdates.resposta = updates.resposta;

    const { error } = await supabase
      .from('feedbacks')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteFeedback(id: string): Promise<void> {
    const { error } = await supabase
      .from('feedbacks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
