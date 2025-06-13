
import { useState, useEffect } from "react";
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
  const [profileLoading, setProfileLoading] = useState(false);

  console.log("useAuthState: Hook rendered, loading:", loading);

  // Simplified profile loading function
  const loadUserProfile = async (currentUser: User) => {
    if (profileLoading) {
      console.log("useAuthState: Profile already loading, skipping");
      return;
    }

    console.log("useAuthState: Loading profile for user:", currentUser.id);
    setProfileLoading(true);
    
    const isMasterAdmin = currentUser.email === MASTER_ADMIN_EMAIL;

    try {
      // Get existing profile
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
        // Use existing profile, update if master admin
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
        // Create new profile
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
          // Fallback profile
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

      console.log("useAuthState: Profile loaded:", profileData);
      setProfile(profileData);
      
      // Set admin status
      const adminStatus = profileData.is_super_admin || profileData.tipo_usuario === 'admin_mestre' || isMasterAdmin;
      setIsAdmin(adminStatus);
      console.log("useAuthState: Admin status set to:", adminStatus);
      
    } catch (error) {
      console.error("useAuthState: Error loading profile:", error);
      // Fallback profile on error
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
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let sessionChecked = false;
    
    console.log("useAuthState: Initializing auth");

    const initializeAuth = async () => {
      try {
        // Handle email confirmation from URL hash
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
            }
            return; // Let the auth state change handler deal with the rest
          }
        }

        // Get initial session only if not already checked
        if (!sessionChecked && mounted) {
          console.log("useAuthState: Getting initial session");
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          sessionChecked = true;
          
          if (mounted && initialSession) {
            console.log("useAuthState: Initial session found");
            setSession(initialSession);
            setUser(initialSession.user);
            // Profile will be loaded by the auth state change listener
          } else if (mounted) {
            setLoading(false);
          }
        }
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
      async (event, session) => {
        if (!mounted) return;
        
        console.log('useAuthState: Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event !== 'TOKEN_REFRESHED') {
          // Load profile only for significant auth events, not token refresh
          await loadUserProfile(session.user);
        } else if (!session) {
          setProfile(null);
          setIsAdmin(false);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      console.log("useAuthState: Cleanup");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent loops

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
