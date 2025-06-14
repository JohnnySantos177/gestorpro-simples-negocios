import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Truck, 
  MessageSquare,
  BadgePercent,
  Camera,
  LogOut,
  ShieldAlert,
  User
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Avatar, 
  AvatarFallback,
  AvatarImage 
} from "@/components/ui/avatar";
import { toast } from "sonner";

// Importar o ícone ChartBar corretamente
import { BarChart as ChartBarIcon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { isSubscribed } = useSubscription();
  const { user, signOut, isAdmin, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Menu items basic para todos os usuários
  const baseMenuItems = [
    { path: "/", label: "Dashboard", icon: <ChartBarIcon className="h-5 w-5" /> },
    { path: "/clientes", label: "Clientes", icon: <Users className="h-5 w-5" /> },
    { path: "/produtos", label: "Produtos", icon: <Package className="h-5 w-5" /> },
    { path: "/vendas", label: "Vendas", icon: <ShoppingCart className="h-5 w-5" /> },
    { path: "/financeiro", label: "Financeiro", icon: <DollarSign className="h-5 w-5" /> },
    { path: "/fornecedores", label: "Fornecedores", icon: <Truck className="h-5 w-5" /> },
    { path: "/avaliacoes", label: "Avaliações", icon: <MessageSquare className="h-5 w-5" /> },
    { path: "/promocoes", label: "Promoções", icon: <BadgePercent className="h-5 w-5" /> },
    ...(profile?.tipo_plano === 'premium' ? [] : [{ path: "/assinatura", label: "Assinatura", icon: <DollarSign className="h-5 w-5" /> }])
  ];
  
  // Adicionar item de admin se o usuário for administrador
  const menuItems = isAdmin 
    ? [...baseMenuItems, { path: "/admin", label: "Admin", icon: <ShieldAlert className="h-5 w-5 text-red-500" /> }]
    : baseMenuItems;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  // Get user avatar URL
  const getUserAvatar = () => {
    if (!user?.user_metadata) return null;
    return user.user_metadata.avatar_url || null;
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
            <img 
              src="/lovable-uploads/06397695-3081-4591-9816-edb718b6ee10.png" 
              alt="TotalGestor Logo" 
              className="h-12 w-12"
            />
            <span className="font-semibold text-2xl text-black">TotalGestor</span>
            {isAdmin && <ShieldAlert className="h-4 w-4 text-red-500 ml-2" />}
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
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-sidebar-foreground hover:bg-primary/10"
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
          <div className="rounded-md bg-primary/10 p-4">
            <p className="text-sm text-primary mb-4">
              <span className="font-medium">{profile?.tipo_plano === 'premium' ? "Plano Premium" : "Plano Padrão"}</span>
            </p>
            {profile?.tipo_plano !== 'premium' && !isAdmin && (
              <Button 
                size="sm"
                variant="default" 
                className="w-full"
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
          {isMobile && (
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
          )}
          
          <div className="ml-auto flex items-center gap-4">
            {isAdmin && (
              <div className="hidden md:flex items-center">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                  Admin
                </span>
              </div>
            )}
            
            {profile?.tipo_plano !== 'premium' && !isAdmin && (
              <div className="hidden md:block">
                <Button asChild variant="default" size="sm">
                  <Link to="/assinatura">
                    <span className="mr-1">⭐</span> Assinar TotalGestor por R$59,99
                  </Link>
                </Button>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUserAvatar() || undefined} alt={user?.email || ""} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.email && (
                      <p className="font-medium">{user.email}</p>
                    )}
                    {user?.user_metadata?.full_name && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.user_metadata.full_name}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to={`/perfil/${user?.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/admin">
                      <ShieldAlert className="mr-2 h-4 w-4 text-red-500" />
                      <span>Painel Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
