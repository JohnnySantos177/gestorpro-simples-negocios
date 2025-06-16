
import React from 'react';
import {
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster as Sonner } from 'sonner';

import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ConfirmationSuccessPage from "@/pages/ConfirmationSuccessPage";
import ClientesPage from "@/pages/ClientesPage";
import ProdutosPage from "@/pages/ProdutosPage";
import VendasPage from "@/pages/VendasPage";
import FinanceiroPage from "@/pages/FinanceiroPage";
import FornecedoresPage from "@/pages/FornecedoresPage";
import AvaliacoesPage from "@/pages/AvaliacoesPage";
import PromocoesPage from "@/pages/PromocoesPage";
import AssinaturaPage from "@/pages/AssinaturaPage";
import AdminPanel from "@/pages/AdminPanel";
import UserManagementPage from "@/pages/UserManagementPage";
import AdminUserView from "@/pages/AdminUserView";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { DataProvider } from "@/context/DataContext";
import { VisitorModeProvider } from "@/context/VisitorModeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OptimizedLayout } from "@/components/OptimizedLayout";
import { MobileOptimizations } from "@/components/MobileOptimizations";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <VisitorModeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <DataProvider>
                <TooltipProvider>
                  <MobileOptimizations />
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/confirmation-success" element={<ConfirmationSuccessPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<OptimizedLayout><Index /></OptimizedLayout>} />
                      <Route path="/clientes" element={<OptimizedLayout><ClientesPage /></OptimizedLayout>} />
                      <Route path="/produtos" element={<OptimizedLayout><ProdutosPage /></OptimizedLayout>} />
                      <Route path="/vendas" element={<OptimizedLayout><VendasPage /></OptimizedLayout>} />
                      <Route path="/financeiro" element={<OptimizedLayout><FinanceiroPage /></OptimizedLayout>} />
                      <Route path="/fornecedores" element={<OptimizedLayout><FornecedoresPage /></OptimizedLayout>} />
                      <Route path="/avaliacoes" element={<OptimizedLayout><AvaliacoesPage /></OptimizedLayout>} />
                      <Route path="/promocoes" element={<OptimizedLayout><PromocoesPage /></OptimizedLayout>} />
                      <Route path="/assinatura" element={<OptimizedLayout><AssinaturaPage /></OptimizedLayout>} />
                      <Route path="/admin" element={<OptimizedLayout><AdminPanel /></OptimizedLayout>} />
                      <Route path="/admin/users" element={<OptimizedLayout><UserManagementPage /></OptimizedLayout>} />
                      <Route path="/admin/user/:userId" element={<OptimizedLayout><AdminUserView /></OptimizedLayout>} />
                      <Route path="/perfil/:userId" element={<OptimizedLayout><ProfilePage /></OptimizedLayout>} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </DataProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </VisitorModeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
