import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/types";
import { validateEmail, validatePassword, sanitizeInput } from "@/utils/inputValidation";
import { authRateLimiter } from "@/utils/rateLimiter";

export const secureAuthService = {
  signIn: async (email: string, password: string) => {
    // Rate limiting
    const clientId = `${email}_${navigator.userAgent}`;
    if (!authRateLimiter.isAllowed(clientId)) {
      const remaining = authRateLimiter.getRemainingAttempts(clientId);
      throw new Error(`Muitas tentativas de login. Tente novamente em 15 minutos. Tentativas restantes: ${remaining}`);
    }

    // Input validation
    const cleanEmail = sanitizeInput(email).toLowerCase();
    if (!validateEmail(cleanEmail)) {
      throw new Error("E-mail inválido");
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message || "Senha inválida");
    }

    console.log("secureAuthService: Attempting secure sign in");
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: cleanEmail, 
      password 
    });
    
    if (error) {
      console.error("secureAuthService: Sign in error:", error);
      
      // Log failed attempt
      await supabase.from('security_audit_logs').insert({
        user_id: null,
        action: 'auth_signin_failed',
        resource_type: 'authentication',
        success: false,
        error_message: error.message,
        metadata: { email: cleanEmail }
      });
      
      throw error;
    }
    
    // Reset rate limiter on successful login
    authRateLimiter.reset(clientId);
    
    // Log successful attempt
    await supabase.from('security_audit_logs').insert({
      user_id: data.user?.id,
      action: 'auth_signin_success',
      resource_type: 'authentication',
      success: true,
      metadata: { email: cleanEmail }
    });
    
    console.log("secureAuthService: Secure sign in successful");
    toast.success("Login realizado com sucesso!");
  },

  signUp: async (email: string, password: string, nome?: string, telefone?: string) => {
    // Input validation
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanNome = nome ? sanitizeInput(nome) : undefined;
    const cleanTelefone = telefone ? sanitizeInput(telefone) : undefined;

    if (!validateEmail(cleanEmail)) {
      throw new Error("E-mail inválido");
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message || "Senha inválida");
    }

    if (cleanNome && (cleanNome.length < 2 || cleanNome.length > 100)) {
      throw new Error("Nome deve ter entre 2 e 100 caracteres");
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          nome: cleanNome || "",
          telefone: cleanTelefone || "",
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      // Log failed attempt
      await supabase.from('security_audit_logs').insert({
        user_id: null,
        action: 'auth_signup_failed',
        resource_type: 'authentication',
        success: false,
        error_message: error.message,
        metadata: { email: cleanEmail }
      });
      throw error;
    }

    // Update profile with validated data
    if (data.user && (cleanNome || cleanTelefone)) {
      await supabase
        .from("profiles")
        .update({
          nome: cleanNome,
          telefone: cleanTelefone,
        })
        .eq("id", data.user.id);
    }

    // Log successful attempt
    await supabase.from('security_audit_logs').insert({
      user_id: data.user?.id,
      action: 'auth_signup_success',
      resource_type: 'authentication',
      success: true,
      metadata: { email: cleanEmail }
    });

    return data;
  },

  signOut: async () => {
    console.log("authService: Attempting to sign out");
    await supabase.auth.signOut();
    console.log("authService: Sign out successful");
    toast.success("Você saiu do sistema");
  },

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
