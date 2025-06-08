
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/types";

export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    console.log("Attempting to sign in with:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    
    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }
    
    console.log("Sign in successful:", data);
    toast.success("Login realizado com sucesso!");
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, nome?: string) => {
    const { error } = await supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirmation-success`,
        data: {
          nome: nome || ''
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.");
  },

  // Sign out
  signOut: async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu do sistema");
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }
    
    toast.success("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
  },

  // Update password
  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      throw error;
    }
    
    toast.success("Senha atualizada com sucesso!");
  },

  // Update profile
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;

    toast.success("Perfil atualizado com sucesso!");
  },

  // Upload user avatar
  uploadAvatar: async (userId: string, file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    await supabase.auth.updateUser({
      data: { avatar_url: data.publicUrl }
    });

    toast.success("Foto de perfil atualizada com sucesso!");
    return data.publicUrl;
  }
};
