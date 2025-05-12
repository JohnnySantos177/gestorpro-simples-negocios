
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Lista de emails de administradores do sistema
const ADMIN_EMAILS = ['admin@gestorpro.com', 'teste@gmail.com'];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar se o usuário é um administrador
  const checkIfUserIsAdmin = (userEmail: string | undefined) => {
    if (!userEmail) return false;
    return ADMIN_EMAILS.includes(userEmail.toLowerCase());
  };

  useEffect(() => {
    // Handle email confirmation or password reset from URL hash
    const handleAuthFromHash = async () => {
      if (typeof window !== 'undefined') {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
          
          if (type === "recovery") {
            toast.success("Você pode redefinir sua senha agora.");
          } else if (type === "signup") {
            // Redirect to confirmation success page instead of showing just a toast
            navigate("/confirmation-success");
            return;
          }
        }
      }
    };

    // Check for hash parameters in URL
    handleAuthFromHash();

    // Check for confirmation success in URL params
    const params = new URLSearchParams(location.search);
    if (params.get("confirmed") === "true") {
      navigate("/confirmation-success");
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Define admin status
      if (session?.user) {
        setIsAdmin(checkIfUserIsAdmin(session.user.email));
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Update admin status on auth changes
        if (session?.user) {
          setIsAdmin(checkIfUserIsAdmin(session.user.email));
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast.success("Login realizado com sucesso!");
      
      // Redirect after login if there's a stored redirect path
      if (typeof window !== 'undefined') {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          window.location.href = redirectPath;
        }
      }
    } catch (error: any) {
      if (error.message === "Email not confirmed") {
        toast.error("Por favor, confirme seu e-mail antes de fazer login.");
      } else {
        toast.error(`Erro ao fazer login: ${error.message}`);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirmation-success`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.");
    } catch (error: any) {
      toast.error(`Erro ao criar conta: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast.success("Você saiu do sistema");
    } catch (error: any) {
      toast.error(`Erro ao sair: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
    } catch (error: any) {
      toast.error(`Erro ao enviar e-mail de recuperação: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      toast.success("Senha atualizada com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao atualizar senha: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
