
import React, { memo, useMemo, useCallback } from "react";
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
  User,
  BarChart as ChartBarIcon,
  BookOpen
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
import { ManualDialog } from "@/components/manual/ManualDialog";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface OptimizedLayoutProps {
  children: React.ReactNode;
}

const MenuItems = memo(({ items, currentPath }: { 
  items: Array<{ path: string; label: string; icon: any; special?: boolean }>;
  currentPath: string;
}) => {
  const { isSubscribed } = useSubscription();
  
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton 
            asChild
            isActive={currentPath === item.path}
          >
            <Link to={item.path}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.path === "/assinatura" && !isSubscribed && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  !
                </span>
              )}
              {item.special && (
                <ShieldAlert className="ml-auto h-4 w-4 text-red-500" />
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
});

const UserDropdown = memo(({ user, isAdmin, onLogout }: {
  user: any;
  isAdmin: boolean;
  onLogout: () => void;
}) => {
  const getUserInitials = useCallback(() => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  }, [user]);

  const getUserAvatar = useCallback(() => {
    if (!user?.user_metadata) return null;
    return user.user_metadata.avatar_url || null;
  }, [user]);

  return (
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
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export const OptimizedLayout: React.FC<OptimizedLayoutProps> = memo(({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin, profile } = useAuth();
  const { handleAsyncError } = useErrorHandler();

  const menuItems = useMemo(() => {
    const baseItems = [
      { path: "/", label: "Dashboard", icon: ChartBarIcon },
      { path: "/clientes", label: "Clientes", icon: Users },
      { path: "/produtos", label: "Produtos", icon: Package },
      { path: "/vendas", label: "Vendas", icon: ShoppingCart },
      { path: "/financeiro", label: "Financeiro", icon: DollarSign },
      { path: "/fornecedores", label: "Fornecedores", icon: Truck },
      { path: "/avaliacoes", label: "Avaliações", icon: MessageSquare },
      { path: "/promocoes", label: "Promoções", icon: BadgePercent },
      ...(profile?.tipo_plano !== 'premium' ? [{ path: "/assinatura", label: "Assinatura", icon: DollarSign }] : [])
    ];
    
    return isAdmin 
      ? [...baseItems, { path: "/admin", label: "Admin", icon: ShieldAlert, special: true }]
      : baseItems;
  }, [isAdmin, profile?.tipo_plano]);

  const handleLogout = useCallback(
    handleAsyncError(async () => {
      await signOut();
      navigate('/login');
    }, 'logout'),
    [signOut, navigate, handleAsyncError]
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/e07ab7a0-dbbd-4bb6-ab59-43f4c9fec7d4.png" 
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
                <MenuItems items={menuItems} currentPath={location.pathname} />
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
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            
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
              
              <ManualDialog>
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manual
                </Button>
              </ManualDialog>
              
              <UserDropdown user={user} isAdmin={isAdmin} onLogout={handleLogout} />
            </div>
          </header>
          
          <div className="p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
});

OptimizedLayout.displayName = 'OptimizedLayout';
