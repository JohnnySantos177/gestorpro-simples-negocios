
import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { UserProfile } from "@/types";

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
    loadUserProfile
  } = useAuthState();

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

  const signUp = async (email: string, password: string, nome?: string) => {
    try {
      console.log("AuthContext: Sign up attempt");
      await authService.signUp(email, password, nome);
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

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user) throw new Error("User not authenticated");

      console.log("AuthContext: Upload avatar attempt");
      return await authService.uploadAvatar(user.id, file);
    } catch (error: any) {
      return null;
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
