
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/types";

export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    console.log("authService: Attempting to sign in with:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    
    if (error) {
      console.error("authService: Sign in error:", error);
      throw error;
    }
    
    console.log("authService: Sign in successful");
    toast.success("Login realizado com sucesso!");
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, nome?: string) => {
    console.log("authService: Attempting to sign up with:", email);
    
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
      console.error("authService: Sign up error:", error);
      throw error;
    }
    
    console.log("authService: Sign up successful");
    toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.");
  },

  // Sign out
  signOut: async () => {
    console.log("authService: Attempting to sign out");
    await supabase.auth.signOut();
    console.log("authService: Sign out successful");
    toast.success("Você saiu do sistema");
  },

  // Reset password
  resetPassword: async (email: string) => {
    console.log("authService: Attempting to reset password for:", email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error("authService: Reset password error:", error);
      throw error;
    }
    
    console.log("authService: Reset password successful");
    toast.success("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
  },

  // Update password
  updatePassword: async (password: string) => {
    console.log("authService: Attempting to update password");
    
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      console.error("authService: Update password error:", error);
      throw error;
    }
    
    console.log("authService: Update password successful");
    toast.success("Senha atualizada com sucesso!");
  },

  // Update profile
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    console.log("authService: Attempting to update profile for:", userId);
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error("authService: Update profile error:", error);
      throw error;
    }

    console.log("authService: Update profile successful");
    toast.success("Perfil atualizado com sucesso!");
  },

  // Upload user avatar
  uploadAvatar: async (userId: string, file: File): Promise<string | null> => {
    console.log("authService: Attempting to upload avatar for:", userId);
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("authService: Upload avatar error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    await supabase.auth.updateUser({
      data: { avatar_url: data.publicUrl }
    });

    console.log("authService: Upload avatar successful");
    toast.success("Foto de perfil atualizada com sucesso!");
    return data.publicUrl;
  }
};
