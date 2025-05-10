
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Truck, 
  MessageSquare,
  ChartBarIcon, 
  BadgePercent 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { isSubscribed } = useSubscription();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <ChartBarIcon className="h-5 w-5" /> },
    { path: "/clientes", label: "Clientes", icon: <Users className="h-5 w-5" /> },
    { path: "/produtos", label: "Produtos", icon: <Package className="h-5 w-5" /> },
    { path: "/vendas", label: "Vendas", icon: <ShoppingCart className="h-5 w-5" /> },
    { path: "/financeiro", label: "Financeiro", icon: <DollarSign className="h-5 w-5" /> },
    { path: "/fornecedores", label: "Fornecedores", icon: <Truck className="h-5 w-5" /> },
    { path: "/avaliacoes", label: "Avaliações", icon: <MessageSquare className="h-5 w-5" /> },
    { path: "/promocoes", label: "Promoções", icon: <BadgePercent className="h-5 w-5" /> },
    { path: "/assinatura", label: "Assinatura", icon: <DollarSign className="h-5 w-5" /> }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isMobile && "shadow-lg"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-gestorpro-500 p-1">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <span className="font-semibold text-xl">Gestor Pro</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    location.pathname === item.path
                      ? "bg-gestorpro-100 text-gestorpro-700 font-medium"
                      : "text-sidebar-foreground hover:bg-gestorpro-50"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.path === "/assinatura" && !isSubscribed && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      !
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="border-t p-4">
          <div className="rounded-md bg-gestorpro-50 p-4">
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{isSubscribed ? "Assinatura Ativa" : "Versão Gratuita"}</span>
            </p>
            {!isSubscribed && (
              <Button 
                size="sm"
                variant="default" 
                className="w-full bg-gestorpro-500 hover:bg-gestorpro-600"
                asChild
              >
                <Link to="/assinatura">
                  Assinar Agora
                </Link>
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarOpen ? (isMobile ? "ml-0" : "ml-64") : "ml-0"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <button
            onClick={toggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium hover:bg-gray-100"
            aria-label="Toggle Menu"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
            >
              <path
                d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                fill="currentColor"
              />
            </svg>
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            {!isSubscribed && (
              <div className="hidden md:block">
                <Button asChild variant="default" size="sm" className="bg-gestorpro-500 hover:bg-gestorpro-600">
                  <Link to="/assinatura">
                    <span className="mr-1">⭐</span> Assinar Gestor Pro por R$59,99
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="relative">
              <button
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-muted/50"
                aria-label="Perfil"
              >
                <Users className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="container mx-auto p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
