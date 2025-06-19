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
import { MobileOptimizations } from "@/components/MobileOptimizations";
import { AppContentGuard } from "@/AppContentGuard";

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
                  <AppContentGuard>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/confirmation-success" element={<ConfirmationSuccessPage />} />
                      <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/clientes" element={<ClientesPage />} />
                        <Route path="/produtos" element={<ProdutosPage />} />
                        <Route path="/vendas" element={<VendasPage />} />
                        <Route path="/financeiro" element={<FinanceiroPage />} />
                        <Route path="/fornecedores" element={<FornecedoresPage />} />
                        <Route path="/promocoes" element={<PromocoesPage />} />
                        <Route path="/assinatura" element={<AssinaturaPage />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/admin/users" element={<UserManagementPage />} />
                        <Route path="/admin/user/:userId" element={<AdminUserView />} />
                        <Route path="/perfil/:userId" element={<ProfilePage />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppContentGuard>
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
