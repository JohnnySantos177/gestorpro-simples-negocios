import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

// Define o email do admin mestre
const MASTER_ADMIN_EMAIL = "johnnysantos_177@msn.com";

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
  const loadUserProfile = async (currentUser: User) => {
    console.log("useAuthState: Loading profile for user:", currentUser.id);
    const isMasterAdmin = currentUser.email === MASTER_ADMIN_EMAIL;
    setIsAdmin(isMasterAdmin); // Set isAdmin immediately based on email

    try {
      // Attempt to upsert the profile in the database
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: currentUser.id,
          tipo_usuario: isMasterAdmin ? "admin_mestre" : "usuario",
          tipo_plano: isMasterAdmin ? "premium" : "padrao",
          is_super_admin: isMasterAdmin, // Ensure this is set correctly on upsert
          updated_at: new Date().toISOString()
        }, {
          onConflict: "id"
        })
        .select("*")
        .single();

      if (error) {
        console.error("useAuthState: Error upserting profile:", error);
        // Even if upsert fails, we still want to set the profile in state
        // based on the current user's data, and isAdmin is already set.
        setProfile({
          id: currentUser.id,
          nome: currentUser.user_metadata?.full_name || null, // Assuming name might be in user_metadata
          tipo_plano: isMasterAdmin ? "premium" : "padrao",
          tipo_usuario: isMasterAdmin ? "admin_mestre" : "usuario",
          created_at: currentUser.created_at,
          updated_at: new Date().toISOString(),
          is_super_admin: isMasterAdmin // Ensure this is true for master admin even on upsert error
        });
        return; // Exit after setting profile and logging error
      }

      console.log("useAuthState: Profile data from upsert:", data);

      const profileData: UserProfile = {
        id: data.id,
        nome: data.nome,
        tipo_plano: (data.tipo_plano as "padrao" | "premium") || "padrao",
        tipo_usuario: (data.tipo_usuario as "usuario" | "admin_mestre") || "usuario",
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_super_admin: isMasterAdmin // Alterado para garantir que isAdmin é apenas para o admin mestre
      };

      console.log("useAuthState: Profile loaded and set:", profileData);
      setProfile(profileData);
      // isAdmin is already set above, no need to set again here
    } catch (error) {
      console.error("useAuthState: Unexpected error loading profile:", error);
      // Fallback in case of unexpected error during upsert or data processing
      setProfile({
        id: currentUser.id,
        nome: currentUser.user_metadata?.full_name || null,
        tipo_plano: isMasterAdmin ? "premium" : "padrao",
        tipo_usuario: isMasterAdmin ? "admin_mestre" : "usuario",
        created_at: currentUser.created_at,
        updated_at: new Date().toISOString(),
        is_super_admin: isMasterAdmin // Ensure this is true for master admin even on unexpected error
      });
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
          // Load profile with the new function
          if (mounted) {
            loadUserProfile(initialSession.user);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('useAuthState: Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    console.log("useAuthState: Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('useAuthState: Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use the new loadUserProfile function
          loadUserProfile(session.user);
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
  }, []);

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
