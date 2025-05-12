
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdminUserView = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário é administrador, caso contrário, redirecionar
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Você não tem permissão para acessar esta página");
      navigate("/");
      return;
    }

    // Carregar informações do usuário
    const loadUserDetails = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Buscar detalhes do usuário
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        
        if (error) {
          throw error;
        }
        
        if (data && data.user) {
          setUserEmail(data.user.email || "Usuário sem email");
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
        <Button variant="ghost" onClick={handleBackToAdmin}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Painel Admin
        </Button>
      </div>

      <PageHeader 
        title={`Painel de ${userEmail}`}
        description={`Visualizando dados do usuário ID: ${userId}`}
      />

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{userEmail}</span>
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
              <p className="text-muted-foreground">
                Aqui você pode ver todos os dados específicos deste usuário.
                Essa funcionalidade requer implementação personalizada baseada nos
                dados específicos que você deseja visualizar para cada usuário.
              </p>

              <div className="mt-4 space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Dados de Clientes</h3>
                  <p>Total de clientes: 24</p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Dados de Produtos</h3>
                  <p>Total de produtos: 58</p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Dados de Vendas</h3>
                  <p>Total de vendas: 137</p>
                  <p>Faturamento: R$ 15.420,75</p>
                </div>
              </div>

              <div className="mt-6">
                <Button>
                  Baixar Relatório Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default AdminUserView;
