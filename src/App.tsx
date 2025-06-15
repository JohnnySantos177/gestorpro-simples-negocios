import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sonner } from 'sonner';

import { Index } from "@/pages";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { ConfirmationSuccessPage } from "@/pages/auth/ConfirmationSuccessPage";
import { ClientesPage } from "@/pages/clientes";
import { ProdutosPage } from "@/pages/produtos";
import { VendasPage } from "@/pages/vendas";
import { FinanceiroPage } from "@/pages/financeiro";
import { FornecedoresPage } from "@/pages/fornecedores";
import { AvaliacoesPage } from "@/pages/avaliacoes";
import { PromocoesPage } from "@/pages/promocoes";
import { AssinaturaPage } from "@/pages/assinatura";
import { AdminPanel } from "@/pages/admin";
import { UserManagementPage } from "@/pages/admin/UserManagementPage";
import { AdminUserView } from "@/pages/admin/AdminUserView";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotFound } from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { DataProvider } from "@/context/DataContext";
import { VisitorModeProvider } from "@/context/VisitorModeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OptimizedLayout } from "@/components/OptimizedLayout";

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
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/confirmation-success" element={<ConfirmationSuccessPage />} />
                      <Route element={<ProtectedRoute />}>
                        <Route element={<OptimizedLayout><Outlet /></OptimizedLayout>}>
                          <Route path="/" element={<Index />} />
                          <Route path="/clientes" element={<ClientesPage />} />
                          <Route path="/produtos" element={<ProdutosPage />} />
                          <Route path="/vendas" element={<VendasPage />} />
                          <Route path="/financeiro" element={<FinanceiroPage />} />
                          <Route path="/fornecedores" element={<FornecedoresPage />} />
                          <Route path="/avaliacoes" element={<AvaliacoesPage />} />
                          <Route path="/promocoes" element={<PromocoesPage />} />
                          <Route path="/assinatura" element={<AssinaturaPage />} />
                          <Route path="/admin" element={<AdminPanel />} />
                          <Route path="/admin/users" element={<UserManagementPage />} />
                          <Route path="/admin/user/:userId" element={<AdminUserView />} />
                          <Route path="/perfil/:userId" element={<ProfilePage />} />
                        </Route>
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
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
