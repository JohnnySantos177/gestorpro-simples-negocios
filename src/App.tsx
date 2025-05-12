
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { DataProvider } from "./context/DataContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { AuthProvider } from "./context/AuthContext"; 

import Index from "./pages/Index";
import ClientesPage from "./pages/ClientesPage";
import ProdutosPage from "./pages/ProdutosPage";
import VendasPage from "./pages/VendasPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import FornecedoresPage from "./pages/FornecedoresPage";
import AvaliacoesPage from "./pages/AvaliacoesPage";
import PromocoesPage from "./pages/PromocoesPage";
import AssinaturaPage from "./pages/AssinaturaPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmationSuccessPage from "./pages/ConfirmationSuccessPage";
import AdminPanel from "./pages/AdminPanel";
import AdminUserView from "./pages/AdminUserView";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Create a new QueryClient instance outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <DataProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/confirmation-success" element={<ConfirmationSuccessPage />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/clientes" element={<ClientesPage />} />
                    <Route path="/produtos" element={<ProdutosPage />} />
                    <Route path="/vendas" element={<VendasPage />} />
                    <Route path="/financeiro" element={<FinanceiroPage />} />
                    <Route path="/fornecedores" element={<FornecedoresPage />} />
                    <Route path="/avaliacoes" element={<AvaliacoesPage />} />
                    <Route path="/promocoes" element={<PromocoesPage />} />
                    <Route path="/assinatura" element={<AssinaturaPage />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/admin/view/:userId" element={<AdminUserView />} />
                  </Route>
                  
                  {/* Fallback route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </DataProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
