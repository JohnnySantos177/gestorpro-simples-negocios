
import { useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "./useUserProfile";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { profile, isAdmin, setProfile, setIsAdmin, loadUserProfile } = useUserProfile();

  const handleAuthChange = useCallback(async (currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user || null);

    if (currentSession?.user) {
      setLoading(true);
      try {
        await loadUserProfile(currentSession.user);
      } catch (error) {
        console.error("useAuthState: Error loading profile after auth change:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
    }
  }, [loadUserProfile, setProfile, setIsAdmin]);

  const initializeAuth = useCallback(async () => {
    try {
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
          }
          await handleAuthChange(null);
          return;
        }
      }

      const { data: { session: initialSession } } = await supabase.auth.getSession();
      await handleAuthChange(initialSession);

    } catch (error) {
      console.error('useAuthState: Error during initial auth or hash handling:', error);
      setLoading(false);
    }
  }, [handleAuthChange]);

  useEffect(() => {
    let mounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        handleAuthChange(currentSession);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [handleAuthChange, initializeAuth]);

  return {
    session,
    user,
    profile,
    loading,
    isAdmin,
    setProfile,
    setIsAdmin,
    loadUserProfile,
  };
};
