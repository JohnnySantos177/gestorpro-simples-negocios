import { useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";
import { toast } from "sonner";

// Define o email do admin mestre
const MASTER_ADMIN_EMAIL = "johnnysantos_177@msn.com";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUserProfile = useCallback(async (currentUser: User) => {
    const isMasterAdmin = currentUser.email === MASTER_ADMIN_EMAIL;

    try {
      const { data: existingProfile, error: selectError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error("useAuthState: Error selecting profile:", selectError);
        throw selectError;
      }

      let profileData: UserProfile;

      if (existingProfile) {
        if (isMasterAdmin && (!existingProfile.is_super_admin || existingProfile.tipo_usuario !== 'admin_mestre')) {
          const { data: updatedProfile } = await supabase
            .from("profiles")
            .update({
              tipo_usuario: 'admin_mestre',
              tipo_plano: 'premium',
              is_super_admin: true,
              updated_at: new Date().toISOString()
            })
            .eq("id", currentUser.id)
            .select("*")
            .single();

          profileData = {
            id: updatedProfile?.id || existingProfile.id,
            nome: updatedProfile?.nome || existingProfile.nome,
            tipo_plano: (updatedProfile?.tipo_plano as 'padrao' | 'premium') || 'premium',
            tipo_usuario: (updatedProfile?.tipo_usuario as 'usuario' | 'admin_mestre') || 'admin_mestre',
            created_at: updatedProfile?.created_at || existingProfile.created_at,
            updated_at: updatedProfile?.updated_at || existingProfile.updated_at,
            is_super_admin: true
          };
        } else {
          profileData = {
            id: existingProfile.id,
            nome: existingProfile.nome,
            tipo_plano: (existingProfile.tipo_plano as 'padrao' | 'premium') || 'padrao',
            tipo_usuario: (existingProfile.tipo_usuario as 'usuario' | 'admin_mestre') || 'usuario',
            created_at: existingProfile.created_at,
            updated_at: existingProfile.updated_at,
            is_super_admin: existingProfile.is_super_admin || false
          };
        }
      } else {
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: currentUser.id,
            nome: currentUser.user_metadata?.full_name || currentUser.user_metadata?.nome || '',
            tipo_usuario: isMasterAdmin ? "admin_mestre" : "usuario",
            tipo_plano: isMasterAdmin ? "premium" : "padrao",
            is_super_admin: isMasterAdmin,
            updated_at: new Date().toISOString()
          })
          .select("*")
          .single();

        if (newProfile) {
          profileData = {
            id: newProfile.id,
            nome: newProfile.nome,
            tipo_plano: (newProfile.tipo_plano as 'padrao' | 'premium') || 'padrao',
            tipo_usuario: (newProfile.tipo_usuario as 'usuario' | 'admin_mestre') || 'usuario',
            created_at: newProfile.created_at,
            updated_at: newProfile.updated_at,
            is_super_admin: newProfile.is_super_admin || false
          };
        } else {
          profileData = {
            id: currentUser.id,
            nome: currentUser.user_metadata?.full_name || currentUser.user_metadata?.nome || '',
            tipo_plano: isMasterAdmin ? "premium" : "padrao",
            tipo_usuario: isMasterAdmin ? "admin_mestre" : "usuario",
            created_at: currentUser.created_at,
            updated_at: new Date().toISOString(),
            is_super_admin: isMasterAdmin
          };
        }
      }

      setProfile(profileData);
      
      // Use secure admin check via database function
      let adminStatus = false;
      try {
        const { data: isAdminResult, error: adminError } = await supabase
          .rpc('is_admin_secure', { user_id: currentUser.id });
        
        if (!adminError && isAdminResult) {
          adminStatus = true;
        } else {
          // Fallback to profile-based check for master admin
          adminStatus = profileData.is_super_admin || profileData.tipo_usuario === 'admin_mestre' || isMasterAdmin;
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        // Fallback to profile-based check
        adminStatus = profileData.is_super_admin || profileData.tipo_usuario === 'admin_mestre' || isMasterAdmin;
      }
      
      setIsAdmin(adminStatus);
      
    } catch (error) {
      console.error("useAuthState: Error loading profile:", error);
      const fallbackProfile = {
        id: currentUser.id,
        nome: currentUser.user_metadata?.full_name || currentUser.user_metadata?.nome || '',
        tipo_plano: isMasterAdmin ? "premium" : "padrao" as 'padrao' | 'premium',
        tipo_usuario: isMasterAdmin ? "admin_mestre" : "usuario" as 'usuario' | 'admin_mestre',
        created_at: currentUser.created_at,
        updated_at: new Date().toISOString(),
        is_super_admin: isMasterAdmin
      };
      setProfile(fallbackProfile);
      setIsAdmin(isMasterAdmin);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (currentSession: Session | null) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        setLoading(true);
        try {
          await loadUserProfile(currentSession.user);
        } catch (error) {
          console.error("useAuthState: Error loading profile after auth change:", error);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    };
    
    const initializeAuthAndListen = async () => {
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
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      (async () => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          await handleAuthChange(currentSession);
        }
      })();
    });

    initializeAuthAndListen();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

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
