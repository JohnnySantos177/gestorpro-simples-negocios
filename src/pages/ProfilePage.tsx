import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Save } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, profile, loading, uploadAvatar, updateProfile } = useAuth();
  const { isSubscribed } = useSubscription();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: profile?.nome || "",
    },
  });

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      form.setValue('nome', profile.nome);
    }
  }, [profile, form]);

  // Get user avatar URL
  const getUserAvatar = () => {
    if (!user?.user_metadata) return null;
    return user.user_metadata.avatar_url || null;
  };

  // Get user initials for the avatar fallback
  const getUserInitials = () => {
    if (profile?.nome) {
      return profile.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload button click
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    try {
      await uploadAvatar(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  // Handle profile update
  const onUpdateProfile = async (data: ProfileFormValues) => {
    setUpdating(true);
    try {
      await updateProfile(data);
    } finally {
      setUpdating(false);
    }
  };

  React.useEffect(() => {
    setPreviewUrl(getUserAvatar());
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader 
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e configurações de conta"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-2 border-muted">
                  {previewUrl ? (
                    <AvatarImage src={previewUrl} alt={user?.email || "Perfil"} />
                  ) : (
                    <>
                      <AvatarImage src={getUserAvatar() || undefined} alt={user?.email || "Perfil"} />
                      <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden"
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {selectedFile && (
                <Button 
                  onClick={handleUpload}
                  disabled={uploading}
                  size="sm"
                  className="mt-2"
                >
                  {uploading ? "Enviando..." : "Salvar Foto"}
                </Button>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdateProfile)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                  <p className="font-medium">
                    {profile?.created_at && format(new Date(profile.created_at), "PPP", { locale: ptBR })}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Último Acesso</label>
                  <p className="font-medium">
                    {user?.last_sign_in_at 
                      ? format(new Date(user.last_sign_in_at), "PPP 'às' p", { locale: ptBR })
                      : "Primeiro acesso"}
                  </p>
                </div>

                <Button type="submit" disabled={updating} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {updating ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minha Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Badge className={profile?.tipo_plano === 'premium' ? "bg-green-500" : "bg-amber-500"}>
                {profile?.tipo_plano === 'premium' ? "Plano Premium" : "Plano Padrão"}
              </Badge>
            </div>

            {profile?.tipo_plano === 'premium' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Plano</h3>
                  <p className="font-medium">TotalGestor Pro</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="font-medium text-green-600">Ativo</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="mb-4">
                    Você está utilizando o plano padrão do TotalGestor com recursos limitados.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Assine o plano premium para desbloquear todos os recursos.
                  </p>
                </div>
                <Button asChild>
                  <a href="/assinatura">Assinar Agora</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
