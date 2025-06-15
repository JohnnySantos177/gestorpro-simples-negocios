
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AdminNavigation } from "@/components/AdminNavigation";
import { ManualDialog } from "@/components/manual/ManualDialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, loading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  console.log("LoginPage: Rendered, loading:", loading, "user:", !!user);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user && !loading) {
      console.log("LoginPage: User authenticated, redirecting");
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log("LoginPage: Form submitted");
    
    try {
      if (data.email.toLowerCase() === "johnnysantos_177@msn.com") {
        console.log("LoginPage: Admin login attempt detected");
      }
      
      await signIn(data.email, data.password);
    } catch (error: any) {
      console.error("LoginPage: Login error:", error);
      
      if (error.message === "Email not confirmed") {
        toast.error("Por favor, confirme seu e-mail antes de fazer login.");
      } else if (error.code === "invalid_credentials") {
        toast.error("E-mail ou senha incorretos. Por favor, tente novamente.");
      } else {
        toast.error(`Erro ao fazer login: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if auth is still loading
  if (loading) {
    console.log("LoginPage: Auth loading, showing spinner");
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Admin Navigation - only shown for admins */}
        <div className="flex justify-center">
          <AdminNavigation />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>Entre com sua conta para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                <Button type="submit" className="w-full" disabled={isLoading || loading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center">
              <Link to="/reset-password" className="text-gestorpro-600 hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="text-sm text-center">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-gestorpro-600 hover:underline">
                Cadastre-se
              </Link>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <ManualDialog>
                <Button variant="outline" size="sm" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manual de Uso
                </Button>
              </ManualDialog>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
