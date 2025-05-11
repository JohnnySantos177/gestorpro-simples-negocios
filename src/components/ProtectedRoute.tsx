
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Check if this is a callback URL from email confirmation
  const isAuthCallback = location.hash.includes("access_token");

  // Show loading or redirect if not authenticated
  if (loading) {
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
    return <Outlet />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
