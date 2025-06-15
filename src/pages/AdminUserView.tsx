import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type UserData = {
  id: string;
  nome: string | null;
  email: string | null;
  tipo_plano: string | null;
  tipo_usuario: string | null;
  total_clientes: number;
  total_produtos: number;
  total_vendas: number;
};

const AdminUserView = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário é administrador, caso contrário, redirecionar
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Você não tem permissão para acessar esta página");
      navigate("/");
      return;
    }

    // Carregar informações do usuário usando a view que já funciona
    const loadUserDetails = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // Corrigida a tipagem: .from<any, any>
        const { data, error } = await supabase
          .from<any, any>('super_admin_user_overview')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data && !('code' in data)) {
          setUserData({
            id: data.id,
            nome: data.nome,
            email: data.email,
            tipo_plano: data.tipo_plano,
            tipo_usuario: data.tipo_usuario,
            total_clientes: Number(data.total_clientes) || 0,
            total_produtos: Number(data.total_produtos) || 0,
            total_vendas: Number(data.total_vendas) || 0,
          });
        } else {
          setUserData(null);
        }
      } catch (error: any) {
        console.error("Erro ao buscar detalhes do usuário:", error);
        toast.error(`Erro ao carregar detalhes: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadUserDetails();
  }, [isAdmin, navigate, userId]);

  // Voltar para o painel de administrador
  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  return (
    <Layout>
      <div className="mb-4">
        <Button variant="ghost" onClick={handleBackToAdmin} className="text-totalgestor-500 hover:text-totalgestor-600 hover:bg-totalgestor-100">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Painel Admin
        </Button>
      </div>

      <PageHeader 
        title={`Painel de ${userData?.nome || userData?.email || 'Usuário'}`}
        description={`Visualizando dados do usuário ID: ${userId}`}
      />

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-totalgestor-500 border-t-transparent rounded-full"></div>
        </div>
      ) : userData ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{userData.email || "Email não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Nome:</span>
                  <span>{userData.nome || "Nome não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Plano:</span>
                  <span>{userData.tipo_plano === 'premium' ? 'Premium' : 'Padrão'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">ID:</span>
                  <span className="text-sm text-muted-foreground">{userId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Dados de Clientes</h3>
                  <p>Total de clientes: {userData.total_clientes}</p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Dados de Produtos</h3>
                  <p>Total de produtos: {userData.total_produtos}</p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Dados de Vendas</h3>
                  <p>Total de vendas: R$ {userData.total_vendas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Usuário não encontrado</p>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default AdminUserView;
