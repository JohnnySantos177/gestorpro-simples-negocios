import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, UserPlus, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/types";

const userSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  tipo_plano: z.enum(['padrao', 'premium']),
});

const editUserSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tipo_plano: z.enum(['padrao', 'premium']),
});

type UserFormValues = z.infer<typeof userSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

interface ProfileData {
  id: string;
  nome: string | null;
  tipo_plano: string | null;
  tipo_usuario: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  id: string;
  email: string;
}

const UserManagementPage = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  const createUserForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
      tipo_plano: "padrao",
    },
  });

  const editUserForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nome: "",
      tipo_plano: "padrao",
    },
  });

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user emails from auth.users (admin only)
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Combine profile and auth data with proper typing
      const usersWithEmails: UserProfile[] = [];
      
      if (profiles && Array.isArray(profiles)) {
        profiles.forEach((profile: ProfileData) => {
          const authUser = authUsers?.find((u: AuthUser) => u.id === profile.id);
          usersWithEmails.push({
            id: profile.id,
            nome: profile.nome || '',
            tipo_plano: (profile.tipo_plano as 'padrao' | 'premium') || 'padrao',
            tipo_usuario: (profile.tipo_usuario as 'usuario' | 'admin_mestre') || 'usuario',
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            email: authUser?.email
          });
        });
      }

      setUsers(usersWithEmails);
    } catch (error: any) {
      console.error('Error loading users:', error);
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

  // Create new user
  const onCreateUser = async (data: UserFormValues) => {
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          nome: data.nome
        }
      });

      if (authError) throw authError;

      // Update profile with correct plan
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            nome: data.nome,
            tipo_plano: data.tipo_plano
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      toast.success("Usuário criado com sucesso!");
      setIsCreateDialogOpen(false);
      createUserForm.reset();
      loadUsers();
    } catch (error: any) {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    }
  };

  // Edit user
  const onEditUser = async (data: EditUserFormValues) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: data.nome,
          tipo_plano: data.tipo_plano
        })
        .eq('id', selectedUser.id);

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

  // Delete user
  const onDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("Você não pode excluir sua própria conta!");
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast.success("Usuário excluído com sucesso!");
      loadUsers();
    } catch (error: any) {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    }
  };

  // Open edit dialog
  const openEditDialog = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    editUserForm.setValue('nome', userProfile.nome || '');
    editUserForm.setValue('tipo_plano', userProfile.tipo_plano);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Gerenciamento de Usuários"
          description="Gerencie todos os usuários do sistema"
        />
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário ao sistema
              </DialogDescription>
            </DialogHeader>
            <Form {...createUserForm}>
              <form onSubmit={createUserForm.handleSubmit(onCreateUser)} className="space-y-4">
                <FormField
                  control={createUserForm.control}
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
                  control={createUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createUserForm.control}
                  name="tipo_plano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Plano</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <DialogFooter>
                  <Button type="submit">Criar Usuário</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((userProfile) => (
          <Card key={userProfile.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {userProfile.nome || 'Nome não informado'}
                    {userProfile.tipo_usuario === 'admin_mestre' && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={userProfile.tipo_plano === 'premium' ? 'default' : 'secondary'}>
                    {userProfile.tipo_plano === 'premium' ? 'Premium' : 'Padrão'}
                  </Badge>
                  {userProfile.tipo_usuario === 'admin_mestre' && (
                    <Badge variant="destructive">Admin</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Criado em: {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}
                </div>
                {userProfile.tipo_usuario !== 'admin_mestre' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(userProfile)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este usuário?')) {
                          onDeleteUser(userProfile.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Dialog */}
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
              <DialogFooter>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default UserManagementPage;
