
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Truck, 
  MessageSquare,
  BadgePercent,
  LogOut,
  ShieldAlert,
  User
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PWAInstallButton } from "@/components/PWAInstallButton";

// Importar o ícone ChartBar corretamente
import { BarChart as ChartBarIcon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
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
    { path: "/", label: "Dashboard", icon: ChartBarIcon },
    { path: "/clientes", label: "Clientes", icon: Users },
    { path: "/produtos", label: "Produtos", icon: Package },
    { path: "/vendas", label: "Vendas", icon: ShoppingCart },
    { path: "/financeiro", label: "Financeiro", icon: DollarSign },
    { path: "/fornecedores", label: "Fornecedores", icon: Truck },
    { path: "/avaliacoes", label: "Avaliações", icon: MessageSquare },
    { path: "/promocoes", label: "Promoções", icon: BadgePercent },
    ...(profile?.tipo_plano === 'premium' ? [] : [{ path: "/assinatura", label: "Assinatura", icon: DollarSign }])
  ];
  
  // Adicionar item de admin se o usuário for administrador
  const menuItems = isAdmin 
    ? [...baseMenuItems, { path: "/admin", label: "Admin", icon: ShieldAlert }]
    : baseMenuItems;

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/06397695-3081-4591-9816-edb718b6ee10.png" 
                  alt="TotalGestor Logo" 
                  className="h-8 w-8"
                />
                <span className="font-semibold text-lg text-black group-data-[collapsible=icon]:hidden">
                  TotalGestor
                </span>
                {isAdmin && <ShieldAlert className="h-4 w-4 text-red-500 group-data-[collapsible=icon]:hidden" />}
              </Link>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild
                        isActive={location.pathname === item.path}
                      >
                        <Link to={item.path}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                          {item.path === "/assinatura" && !isSubscribed && (
                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                              !
                            </span>
                          )}
                          {item.path === "/admin" && (
                            <ShieldAlert className="ml-auto h-4 w-4 text-red-500" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="p-4">
              <div className="rounded-md bg-primary/10 p-4">
                <p className="text-sm text-primary mb-4 group-data-[collapsible=icon]:hidden">
                  <span className="font-medium">{profile?.tipo_plano === 'premium' ? "Plano Premium" : "Plano Padrão"}</span>
                </p>
                {profile?.tipo_plano !== 'premium' && !isAdmin && (
                  <Button 
                    size="sm"
                    variant="default" 
                    className="w-full group-data-[collapsible=icon]:hidden"
                    asChild
                  >
                    <Link to="/assinatura">
                      Assinar Agora
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            
            <div className="ml-auto flex items-center gap-4">
              <PWAInstallButton />
              
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
