import React, { useState, useEffect } from "react";
import { OptimizedLayout } from "@/components/OptimizedLayout";
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
import { Eye, RefreshCw, Crown, Settings, Pencil, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useVisitorMode } from "@/context/VisitorModeContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

type UserOverview = {
  id: string;
  nome: string | null;
  email: string | null;
  tipo_plano: string | null;
  tipo_usuario: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  total_clientes: number;
  total_produtos: number;
  total_vendas: number;
  nome_completo: string | null;
  telefone: string | null;
  empresa: string | null;
  cargo: string | null;
  cidade: string | null;
  estado: string | null;
  nome_loja?: string | null;
};

const editUserSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tipo_plano: z.enum(["padrao", "premium"]),
  telefone: z.string().optional(),
  nome_loja: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(5999); // Default R$59.99 in cents
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<UserOverview | null>(null);
  const [newPlan, setNewPlan] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOverview | null>(null);
  const editUserForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nome: "",
      tipo_plano: "padrao",
      telefone: "",
      nome_loja: "",
    },
  });

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

  // Carregar lista de usuários usando a view que criamos
  const loadUsers = async () => {
    try {
      setLoading(true);

      console.log("AdminPanel: Loading users from super_admin_user_overview");

      // ATENÇÃO: Corrigida a tipagem para .from<any, any>
      const { data, error } = await supabase
        .from<any, any>('super_admin_user_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("AdminPanel: Error loading users:", error);
        throw error;
      }

      const parsedUsers: UserOverview[] = (data || []).map((user: any) => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_plano: user.tipo_plano,
        tipo_usuario: user.tipo_usuario,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        nome_completo: user.nome_completo || null,
        telefone: user.telefone || null,
        empresa: user.empresa || null,
        cargo: user.cargo || null,
        cidade: user.cidade || null,
        estado: user.estado || null,
        total_clientes: Number(user.total_clientes) || 0,
        total_produtos: Number(user.total_produtos) || 0,
        total_vendas: Number(user.total_vendas) || 0,
        nome_loja: user.nome_loja || null,
      }));

      setUsers(parsedUsers);
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

  // Visualizar painel do usuário COMO visitante
  const { enterVisitorMode } = useVisitorMode();
  const viewUserDashboard = async (userId: string) => {
    try {
      setSelectedUserId(userId);
      toast.success("Entrando como visitante nessa conta do usuário...");
      navigate("/", { replace: true });
      setTimeout(() => enterVisitorMode(userId), 100);
    } catch (error: any) {
      toast.error(`Erro ao visualizar usuário: ${error.message}`);
    }
  };

  // Abrir dialog para alterar plano
  const openChangePlanDialog = (user: UserOverview) => {
    setSelectedUserForPlan(user);
    setNewPlan(user.tipo_plano || 'padrao');
    setIsChangePlanDialogOpen(true);
  };

  // Alterar plano do usuário
  const handleChangePlan = async () => {
    if (!selectedUserForPlan) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tipo_plano: newPlan })
        .eq('id', selectedUserForPlan.id);

      if (error) throw error;

      toast.success("Plano alterado com sucesso!");
      setIsChangePlanDialogOpen(false);
      setSelectedUserForPlan(null);
      loadUsers(); // Recarregar a lista
    } catch (error: any) {
      toast.error(`Erro ao alterar plano: ${error.message}`);
    }
  };

  const openEditDialog = (user: UserOverview) => {
    setSelectedUser(user);
    editUserForm.setValue("nome", user.nome || "");
    editUserForm.setValue("tipo_plano", (user.tipo_plano as "padrao" | "premium") || "padrao");
    editUserForm.setValue("telefone", user.telefone || "");
    editUserForm.setValue("nome_loja", user.nome_loja || "");
    setIsEditDialogOpen(true);
  };

  const onEditUser = async (data: EditUserFormValues) => {
    if (!selectedUser) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: data.nome,
          tipo_plano: data.tipo_plano,
          telefone: data.telefone,
          nome_loja: data.nome_loja,
        })
        .eq("id", selectedUser.id);
      if (error) throw error;
      toast.success("Usuário atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editUserForm.reset();
      loadUsers();
    } catch (error: any) {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    }
  };

  const onDeleteUser = async (userId: string) => {
    if (userId === (useAuth().user?.id)) {
      toast.error("Você não pode excluir sua própria conta!");
      return;
    }
    try {
      // Exclui do Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
      // Exclui do profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (profileError) throw profileError;
      toast.success("Usuário excluído com sucesso!");
      loadUsers();
    } catch (error: any) {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    }
  };

  return (
    <>
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
                  <div className="text-lg font-semibold">Usuários Premium</div>
                  <div className="text-3xl font-bold">
                    {users.filter(user => user.tipo_plano === 'premium').length}
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
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome / Email</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Dados do Negócio</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="font-medium flex items-center gap-2">
                                  {user.nome || user.nome_completo || "Nome não informado"}
                                  {user.tipo_usuario === 'admin_mestre' && (
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email || "Email não informado"}
                                </div>
                                {user.telefone && (
                                  <div className="text-sm text-muted-foreground">
                                    {user.telefone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.tipo_plano === 'premium' ? 'default' : 'secondary'}>
                                {user.tipo_plano === 'premium' ? 'Premium' : 'Padrão'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>Clientes: {user.total_clientes}</div>
                                <div>Produtos: {user.total_produtos}</div>
                                <div>Vendas: R$ {(user.total_vendas || 0).toFixed(2)}</div>
                                {user.empresa && (
                                  <div className="text-muted-foreground">{user.empresa}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => viewUserDashboard(user.id)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar Painel
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => openChangePlanDialog(user)}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Alterar Plano
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
                                      onDeleteUser(user.id);
                                    }
                                  }}
                                  disabled={user.id === (useAuth().user?.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
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
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Input 
                      id="subscription-price" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="59.99"
                      defaultValue={(subscriptionPrice / 100).toFixed(2)}
                      onChange={handlePriceChange}
                      className="w-full"
                    />
                    <Button 
                      onClick={handleUpdatePrice}
                      disabled={isUpdating}
                      className="w-full sm:w-auto"
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

      {/* Dialog para alterar plano */}
      <Dialog open={isChangePlanDialogOpen} onOpenChange={setIsChangePlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano do Usuário</DialogTitle>
            <DialogDescription>
              Altere o plano de {selectedUserForPlan?.nome || selectedUserForPlan?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Novo Plano</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padrao">Padrão</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePlanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan}>
              Alterar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Edite as informações do usuário
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(onEditUser)} className="space-y-4">
              <FormField
                control={editUserForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="tipo_plano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Plano</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="padrao">Padrão</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(99) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="nome_loja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da loja (slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: minha-loja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
