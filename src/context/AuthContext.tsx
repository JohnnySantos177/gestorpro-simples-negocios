import React, { createContext, useContext, ReactNode, useCallback } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types";
import { useVisitorMode } from "./VisitorModeContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";

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
  const { handleAsyncError } = useErrorHandler();

  const signIn = useCallback(
    handleAsyncError(async (email: string, password: string) => {
      console.log("AuthContext: Sign in attempt");
      await authService.signIn(email, password);
    }, 'signIn'),
    [handleAsyncError]
  );

  // Adiciona telefone ao signUp
  const signUp = useCallback(
    handleAsyncError(async (email: string, password: string, nome?: string, telefone?: string) => {
      console.log("AuthContext: Sign up attempt");
      await authService.signUp(email, password, nome, telefone);
    }, 'signUp'),
    [handleAsyncError]
  );

  const signOut = useCallback(
    handleAsyncError(async () => {
      console.log("AuthContext: Sign out attempt");
      await authService.signOut();
      setProfile(null);
      setIsAdmin(false);
    }, 'signOut'),
    [setProfile, setIsAdmin, handleAsyncError]
  );

  const resetPassword = useCallback(
    handleAsyncError(async (email: string) => {
      console.log("AuthContext: Reset password attempt");
      await authService.resetPassword(email);
    }, 'resetPassword'),
    [handleAsyncError]
  );

  const updatePassword = useCallback(
    handleAsyncError(async (password: string) => {
      console.log("AuthContext: Update password attempt");
      await authService.updatePassword(password);
    }, 'updatePassword'),
    [handleAsyncError]
  );

  const updateProfile = useCallback(
    handleAsyncError(async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("AuthContext: Update profile attempt");
      await authService.updateProfile(user.id, updates);
      await loadUserProfile(user);
    }, 'updateProfile'),
    [user, loadUserProfile, handleAsyncError]
  );

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
