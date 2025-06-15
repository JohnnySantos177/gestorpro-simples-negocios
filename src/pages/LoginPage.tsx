
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AdminNavigation } from "@/components/AdminNavigation";
import { HeroSection } from "@/components/login/HeroSection";
import { ProblemsSection } from "@/components/login/ProblemsSection";
import { SolutionSection } from "@/components/login/SolutionSection";
import { TransformSection } from "@/components/login/TransformSection";
import { TestimonialsSection } from "@/components/login/TestimonialsSection";
import { PlansSection } from "@/components/login/PlansSection";
import { FAQSection } from "@/components/login/FAQSection";
import { LoginFormSection } from "@/components/login/LoginFormSection";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  console.log("LoginPage: Rendered, loading:", loading, "user:", !!user);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user && !loading) {
      console.log("LoginPage: User authenticated, redirecting");
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

  // Show loading if auth is still loading
  if (loading) {
    console.log("LoginPage: Auth loading, showing spinner");
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <div className="absolute top-4 left-4 z-50">
        <AdminNavigation />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Problems Section */}
      <ProblemsSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Transform Section */}
      <TransformSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Plans Section */}
      <PlansSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Login Section */}
      <LoginFormSection />
    </div>
  );
};

export default LoginPage;
