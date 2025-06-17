
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Feedback } from "@/types";
import { supabaseDataService } from "@/services/supabaseDataService";

export const useFeedbacks = (effectiveUserId: string | undefined) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getFeedbacks = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      const feedbacksData = await supabaseDataService.getFeedbacks(effectiveUserId);
      setFeedbacks(feedbacksData);
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      toast.error("Erro ao carregar feedbacks");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  const createFeedback = async (feedback: Omit<Feedback, 'id'>) => {
    if (!effectiveUserId) return;
    try {
      setLoading(true);
      await supabaseDataService.createFeedback({ ...feedback, user_id: effectiveUserId });
      await getFeedbacks();
      toast.success("Feedback criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar feedback:", error);
      toast.error("Erro ao criar feedback");
    } finally {
      setLoading(false);
    }
  };

  const updateFeedback = async (feedback: Feedback) => {
    try {
      setLoading(true);
      await supabaseDataService.updateFeedback(feedback.id, feedback);
      await getFeedbacks();
      toast.success("Feedback atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar feedback:", error);
      toast.error("Erro ao atualizar feedback");
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      setLoading(true);
      await supabaseDataService.deleteFeedback(id);
      await getFeedbacks();
      toast.success("Feedback removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover feedback:", error);
      toast.error("Erro ao remover feedback");
    } finally {
      setLoading(false);
    }
  };

  return {
    feedbacks,
    loading,
    getFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
  };
};
