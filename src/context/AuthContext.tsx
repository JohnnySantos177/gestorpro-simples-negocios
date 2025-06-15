import React, { createContext, useContext, ReactNode, useCallback } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types";
import { useVisitorMode } from "./VisitorModeContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useSecurityAudit } from "@/hooks/useSecurityAudit";
import { secureAuthService } from "@/services/secureAuthService";

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
          .then(() => setVisitorLoading(false));
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

  const { handleError } = useErrorHandler();
  const { logAuthAttempt } = useSecurityAudit();

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log("AuthContext: Sign in attempt");
      await secureAuthService.signIn(email, password);
      await logAuthAttempt('signin', true);
    } catch (error) {
      await logAuthAttempt('signin', false, error instanceof Error ? error.message : 'Unknown error');
      await handleError(error, 'signIn');
    }
  }, [handleError, logAuthAttempt]);

  const signUp = useCallback(async (email: string, password: string, nome?: string, telefone?: string) => {
    try {
      console.log("AuthContext: Sign up attempt");
      await secureAuthService.signUp(email, password, nome, telefone);
      await logAuthAttempt('signup', true);
    } catch (error) {
      await logAuthAttempt('signup', false, error instanceof Error ? error.message : 'Unknown error');
      await handleError(error, 'signUp');
    }
  }, [handleError, logAuthAttempt]);

  const signOut = useCallback(async () => {
    try {
      console.log("AuthContext: Sign out attempt");
      await authService.signOut();
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      await handleError(error, 'signOut');
    }
  }, [setProfile, setIsAdmin, handleError]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      console.log("AuthContext: Reset password attempt");
      await authService.resetPassword(email);
    } catch (error) {
      await handleError(error, 'resetPassword');
    }
  }, [handleError]);

  const updatePassword = useCallback(async (password: string) => {
    try {
      console.log("AuthContext: Update password attempt");
      await authService.updatePassword(password);
    } catch (error) {
      await handleError(error, 'updatePassword');
    }
  }, [handleError]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      console.log("AuthContext: Update profile attempt");
      await authService.updateProfile(user.id, updates);
      await loadUserProfile(user);
    } catch (error) {
      await handleError(error, 'updateProfile');
    }
  }, [user, loadUserProfile, handleError]);

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
