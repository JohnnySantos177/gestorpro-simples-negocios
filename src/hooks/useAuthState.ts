
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  console.log("useAuthState: Hook rendered");

  // Load user profile function
  const loadUserProfile = async (userId: string) => {
    console.log("useAuthState: Loading profile for user:", userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('useAuthState: Error loading profile:', error);
        return;
      }

      const profileData: UserProfile = {
        id: data.id,
        nome: data.nome,
        tipo_plano: (data.tipo_plano as 'padrao' | 'premium') || 'padrao',
        tipo_usuario: (data.tipo_usuario as 'usuario' | 'admin_mestre') || 'usuario',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      console.log("useAuthState: Profile loaded:", profileData);
      setProfile(profileData);
      setIsAdmin(profileData.tipo_usuario === 'admin_mestre');
    } catch (error) {
      console.error('useAuthState: Error loading profile:', error);
      setProfile(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("useAuthState: Initializing auth");

    const initializeAuth = async () => {
      try {
        // Handle email confirmation or password reset from URL hash
        if (typeof window !== 'undefined') {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          const type = hashParams.get("type");
          
          if (accessToken) {
            console.log("useAuthState: Setting session from URL hash");
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            if (type === "recovery") {
              toast.success("Você pode redefinir sua senha agora.");
            } else if (type === "signup") {
              navigate("/confirmation-success");
              return;
            }
          }
        }

        // Check for confirmation success in URL params - only check once
        const params = new URLSearchParams(location.search);
        if (params.get("confirmed") === "true") {
          navigate("/confirmation-success");
          return;
        }

        // Get initial session
        console.log("useAuthState: Getting initial session");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (initialSession) {
          console.log("useAuthState: Initial session found");
          setSession(initialSession);
          setUser(initialSession.user);
          // Defer profile loading to avoid blocking
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(initialSession.user.id);
            }
          }, 0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('useAuthState: Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener - NOT async to prevent deadlocks
    console.log("useAuthState: Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('useAuthState: Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile loading to prevent loops
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id);
            }
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      console.log("useAuthState: Cleanup");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove navigate and location.search from dependencies to prevent loops

  return {
    session,
    user,
    profile,
    loading,
    isAdmin,
    setProfile,
    setIsAdmin,
    setLoading,
    loadUserProfile
  };
};
