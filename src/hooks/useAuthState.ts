
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

    try {
      // First try to get existing profile
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
        // Profile exists, check if we need to update it for master admin
        const needsUpdate = isMasterAdmin && (!existingProfile.is_super_admin || existingProfile.tipo_usuario !== 'admin_mestre');
        
        if (needsUpdate) {
          const { data: updatedProfile, error: updateError } = await supabase
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

          if (updateError) {
            console.error("useAuthState: Error updating profile:", updateError);
            // Use existing profile even if update fails
            profileData = {
              id: existingProfile.id,
              nome: existingProfile.nome,
              tipo_plano: (existingProfile.tipo_plano as 'padrao' | 'premium') || 'padrao',
              tipo_usuario: (existingProfile.tipo_usuario as 'usuario' | 'admin_mestre') || 'usuario',
              created_at: existingProfile.created_at,
              updated_at: existingProfile.updated_at,
              is_super_admin: existingProfile.is_super_admin || isMasterAdmin
            };
          } else {
            profileData = {
              id: updatedProfile.id,
              nome: updatedProfile.nome,
              tipo_plano: (updatedProfile.tipo_plano as 'padrao' | 'premium') || 'padrao',
              tipo_usuario: (updatedProfile.tipo_usuario as 'usuario' | 'admin_mestre') || 'usuario',
              created_at: updatedProfile.created_at,
              updated_at: updatedProfile.updated_at,
              is_super_admin: updatedProfile.is_super_admin || false
            };
          }
        } else {
          // Use existing profile as is
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
        // Profile doesn't exist, create one
        const { data: newProfile, error: insertError } = await supabase
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

        if (insertError) {
          console.error("useAuthState: Error inserting profile:", insertError);
          // Create fallback profile
          profileData = {
            id: currentUser.id,
            nome: currentUser.user_metadata?.full_name || currentUser.user_metadata?.nome || '',
            tipo_plano: isMasterAdmin ? "premium" : "padrao",
            tipo_usuario: isMasterAdmin ? "admin_mestre" : "usuario",
            created_at: currentUser.created_at,
            updated_at: new Date().toISOString(),
            is_super_admin: isMasterAdmin
          };
        } else {
          profileData = {
            id: newProfile.id,
            nome: newProfile.nome,
            tipo_plano: (newProfile.tipo_plano as 'padrao' | 'premium') || 'padrao',
            tipo_usuario: (newProfile.tipo_usuario as 'usuario' | 'admin_mestre') || 'usuario',
            created_at: newProfile.created_at,
            updated_at: newProfile.updated_at,
            is_super_admin: newProfile.is_super_admin || false
          };
        }
      }

      console.log("useAuthState: Profile loaded and set:", profileData);
      setProfile(profileData);
      
      // Set admin status based on profile data
      const adminStatus = profileData.is_super_admin || profileData.tipo_usuario === 'admin_mestre' || isMasterAdmin;
      setIsAdmin(adminStatus);
      console.log("useAuthState: Admin status set to:", adminStatus);
      
    } catch (error) {
      console.error("useAuthState: Unexpected error loading profile:", error);
      // Fallback in case of unexpected error
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
            await loadUserProfile(initialSession.user);
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
      async (event, session) => {
        if (!mounted) return;
        
        console.log('useAuthState: Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use the new loadUserProfile function
          await loadUserProfile(session.user);
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
