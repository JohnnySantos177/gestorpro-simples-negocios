
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ManualDialog } from "@/components/manual/ManualDialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { BookOpen, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginFormSection = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log("LoginFormSection: Form submitted");
    
    try {
      if (data.email.toLowerCase() === "johnnysantos_177@msn.com") {
        console.log("LoginFormSection: Admin login attempt detected");
      }
      
      await signIn(data.email, data.password);
    } catch (error: any) {
      console.error("LoginFormSection: Login error:", error);
      
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

  return (
    <section id="login-form" className="py-20 px-4 bg-gradient-to-br from-primary to-secondary text-white">
      <div className="max-w-md mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Comece Sua Transformação Hoje!</CardTitle>
            <CardDescription>
              Faça login ou crie sua conta para começar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          className="h-12"
                          {...field} 
                        />
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
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90" 
                  disabled={isLoading || loading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Entrando...
                    </div>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center mt-6 space-y-4">
              <Link 
                to="/reset-password" 
                className="text-sm text-primary hover:underline"
              >
                Esqueceu sua senha?
              </Link>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Ainda não tem uma conta?
                </p>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                >
                  <Link to="/register">
                    Criar Conta Grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="border-t pt-4">
                <ManualDialog>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manual de Uso
                  </Button>
                </ManualDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
