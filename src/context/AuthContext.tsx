import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types";
import { useVisitorMode } from "./VisitorModeContext";

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    session,
    user,
    profile,
    loading,
    isAdmin,
    setProfile,
    setIsAdmin,
    loadUserProfile,
    setUser,
    setSession,
  } = useAuthState();

  const { isVisitorMode, targetUserId } = useVisitorMode();

  // Visitor mode: fetch user/profile for the target user
  const [visitorProfile, setVisitorProfile] = React.useState<UserProfile | null>(null);
  const [visitorLoading, setVisitorLoading] = React.useState(false);

  React.useEffect(() => {
    if (isVisitorMode && targetUserId && (!visitorProfile || visitorProfile.id !== targetUserId)) {
      setVisitorLoading(true);
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", targetUserId)
          .maybeSingle()
          .then(({ data }) => {
            setVisitorProfile(data as UserProfile);
          })
          .then(() => setVisitorLoading(false)); // Corrigido: usar .then ao invés de .finally
      });
    } else if (!isVisitorMode) {
      setVisitorProfile(null);
    }
    // eslint-disable-next-line
  }, [isVisitorMode, targetUserId]);

  const effectiveUser = isVisitorMode && visitorProfile
    ? { ...user, id: visitorProfile.id } // keep the object shape
    : user;

  const effectiveProfile = isVisitorMode && visitorProfile
    ? visitorProfile
    : profile;

  const effectiveIsAdmin = isVisitorMode ? false : isAdmin;

  const effectiveLoading = loading || (isVisitorMode && visitorLoading);

  console.log("AuthContext: Provider rendered, loading:", loading);

  // Wrapper functions - remove unnecessary loading state manipulation
  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Sign in attempt");
      await authService.signIn(email, password);
    } catch (error: any) {
      console.error("AuthContext: Sign in error:", error);
      throw error;
    }
  };

  // Adiciona telefone ao signUp
  const signUp = async (email: string, password: string, nome?: string, telefone?: string) => {
    try {
      console.log("AuthContext: Sign up attempt");
      await authService.signUp(email, password, nome, telefone);
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthContext: Sign out attempt");
      await authService.signOut();
      setProfile(null);
      setIsAdmin(false);
      setUser && setUser(null);
      setSession && setSession(null);
    } catch (error: any) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("AuthContext: Reset password attempt");
      await authService.resetPassword(email);
    } catch (error: any) {
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      console.log("AuthContext: Update password attempt");
      await authService.updatePassword(password);
    } catch (error: any) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("User not authenticated");

    try {
      console.log("AuthContext: Update profile attempt");
      await authService.updateProfile(user.id, updates);
      await loadUserProfile(user);
    } catch (error: any) {
      throw error;
    }
  };

  const value = {
    session,
    user: effectiveUser,
    profile: effectiveProfile,
    loading: effectiveLoading,
    isAdmin: effectiveIsAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
