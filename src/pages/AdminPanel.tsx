
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserDetails = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(5999); // Default R$59.99 in cents
  const [isUpdating, setIsUpdating] = useState(false);

  // Verificar se o usuário é administrador, caso contrário, redirecionar
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Você não tem permissão para acessar esta página");
      navigate("/");
    } else {
      // Get current subscription price
      fetchSubscriptionPrice();
    }
  }, [isAdmin, navigate]);

  const fetchSubscriptionPrice = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-subscription-price');
      
      if (error) {
        console.error("Error getting subscription price:", error);
        return;
      }
      
      if (data && data.price) {
        setSubscriptionPrice(data.price);
      }
    } catch (error) {
      console.error("Error fetching subscription price:", error);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSubscriptionPrice(isNaN(value) ? 0 : value * 100); // Convert to cents
  };

  const handleUpdatePrice = async () => {
    if (subscriptionPrice <= 0) {
      toast.error("O preço deve ser maior que zero");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('manage-subscription-price', {
        body: { price: subscriptionPrice }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Preço da assinatura atualizado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao atualizar preço: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Carregar lista de usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários do Supabase Auth
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        throw error;
      }
      
      if (data && data.users) {
        const formattedUsers = data.users.map(user => ({
          id: user.id,
          email: user.email || "Sem e-mail",
          created_at: new Date(user.created_at).toLocaleString('pt-BR'),
          last_sign_in_at: user.last_sign_in_at 
            ? new Date(user.last_sign_in_at).toLocaleString('pt-BR') 
            : null
        }));
        
        setUsers(formattedUsers);
      }
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error);
      toast.error(`Erro ao carregar usuários: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Visualizar painel do usuário
  const viewUserDashboard = async (userId: string) => {
    try {
      setSelectedUserId(userId);
      
      // Aqui podemos configurar uma sessão de visualização do usuário
      // Por enquanto, apenas vamos salvar o ID do usuário selecionado
      toast.success("Visualizando painel do usuário selecionado");
      
      // Futuramente, podemos implementar a troca real de contexto
      // para visualizar os dados específicos deste usuário
      localStorage.setItem("adminViewingUserId", userId);
      
      // Redirecionar para o dashboard com o contexto do usuário selecionado
      navigate(`/admin/view/${userId}`);
    } catch (error: any) {
      toast.error(`Erro ao visualizar usuário: ${error.message}`);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Painel de Administrador"
        description="Gerencie usuários e configure o sistema"
      />

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Estatísticas Gerais</CardTitle>
              <CardDescription>Visão geral dos usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold">Total de Usuários</div>
                  <div className="text-3xl font-bold">{users.length}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold">Usuários Ativos</div>
                  <div className="text-3xl font-bold">
                    {users.filter(user => user.last_sign_in_at).length}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold">Novos Usuários (7 dias)</div>
                  <div className="text-3xl font-bold">
                    {users.filter(user => {
                      const createdAt = new Date(user.created_at);
                      const sevenDaysAgo = new Date();
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                      return createdAt > sevenDaysAgo;
                    }).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>Gerenciar e visualizar usuários do sistema</CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={loadUsers} 
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.created_at}</TableCell>
                            <TableCell>{user.last_sign_in_at || "Nunca"}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => viewUserDashboard(user.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar Painel
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configurações de Assinatura</CardTitle>
              <CardDescription>Defina os valores e configurações da assinatura do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 max-w-lg">
                <div className="grid gap-2">
                  <Label htmlFor="subscription-price">Preço da Assinatura Mensal (R$)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="subscription-price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="59.99"
                      defaultValue={(subscriptionPrice / 100).toFixed(2)}
                      onChange={handlePriceChange}
                    />
                    <Button 
                      onClick={handleUpdatePrice}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Atualizando..." : "Atualizar"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Este é o valor que será cobrado dos usuários mensalmente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segurança e Permissões</CardTitle>
              <CardDescription>Configurações de segurança e controle de acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Todas as tabelas do sistema estão protegidas por Row-Level Security (RLS), garantindo que cada usuário tenha acesso apenas aos seus próprios dados.
              </p>
              <p className="text-muted-foreground mb-4">
                Como administrador, você tem a capacidade de visualizar os painéis de todos os usuários através da lista acima.
              </p>
              <p className="font-medium mb-1">Credenciais de Administrador</p>
              <p className="text-sm text-muted-foreground mb-4">
                Email: johnnysantos_177@msn.com
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default AdminPanel;
