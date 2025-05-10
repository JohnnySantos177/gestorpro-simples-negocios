
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { DataProvider } from "./context/DataContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <SubscriptionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/vendas" element={<VendasPage />} />
              <Route path="/financeiro" element={<FinanceiroPage />} />
              <Route path="/fornecedores" element={<FornecedoresPage />} />
              <Route path="/avaliacoes" element={<AvaliacoesPage />} />
              <Route path="/promocoes" element={<PromocoesPage />} />
              <Route path="/assinatura" element={<AssinaturaPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
