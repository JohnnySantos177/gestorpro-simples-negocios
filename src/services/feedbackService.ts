
import { supabase } from "@/integrations/supabase/client";
import { Feedback } from "@/types";

export const feedbackService = {
  async getFeedbacks(userId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('user_id', userId)
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

  async createFeedback(feedback: Omit<Feedback, "id"> & { user_id: string }): Promise<Feedback> {
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
        user_id: feedback.user_id
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

  async updateFeedback(feedback: Feedback): Promise<void> {
    const dbUpdates: any = {};
    
    if (feedback.clienteId !== undefined) dbUpdates.cliente_id = feedback.clienteId;
    if (feedback.clienteNome !== undefined) dbUpdates.cliente_nome = feedback.clienteNome;
    if (feedback.data !== undefined) dbUpdates.data = feedback.data;
    if (feedback.avaliacao !== undefined) dbUpdates.avaliacao = feedback.avaliacao;
    if (feedback.comentario !== undefined) dbUpdates.comentario = feedback.comentario;
    if (feedback.respondido !== undefined) dbUpdates.respondido = feedback.respondido;
    if (feedback.resposta !== undefined) dbUpdates.resposta = feedback.resposta;

    const { error } = await supabase
      .from('feedbacks')
      .update(dbUpdates)
      .eq('id', feedback.id);

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
