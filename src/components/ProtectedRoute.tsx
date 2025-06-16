import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { OptimizedLayout } from "@/components/OptimizedLayout";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  console.log("ProtectedRoute: Rendered, loading:", loading, "user:", !!user, "mounted:", mounted);
  
  // Check if this is a callback URL from email confirmation
  const isAuthCallback = typeof window !== 'undefined' && window.location.hash.includes("access_token");

  // Show loading while not mounted or still loading auth
  if (!mounted || loading) {
    console.log("ProtectedRoute: Showing loading state");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // If this is an auth callback handling, we don't want to redirect yet
  if (isAuthCallback) {
    console.log("ProtectedRoute: Auth callback detected");
    return <Outlet />;
  }

  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    // Store the intended destination to redirect back after login
    const from = location.pathname;
    if (from !== "/login" && from !== "/register" && from !== "/reset-password") {
      sessionStorage.setItem("redirectAfterLogin", from);
    }
    return <Navigate to="/login" state={{ from }} replace />;
  }

  console.log("ProtectedRoute: User authenticated, showing protected content");
  return (
    <OptimizedLayout>
      <Outlet />
    </OptimizedLayout>
  );
};
