
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
import { BookOpen, ArrowRight, Sparkles, Lock } from "lucide-react";

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
    <section id="login-form" className="py-24 px-4 bg-gradient-to-br from-primary via-primary/95 to-secondary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full mb-6">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">COMECE AGORA</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comece Sua{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Transformação Hoje!
            </span>
          </h2>
          <p className="text-white/90 text-lg">
            Faça login ou crie sua conta para começar
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Acesso Seguro
            </CardTitle>
            <CardDescription className="text-base">
              Entre na sua conta e transforme sua gestão
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">E-mail</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          className="h-12 bg-white border-2 border-gray-200 focus:border-primary transition-all duration-200 rounded-xl"
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
                      <FormLabel className="text-foreground font-semibold">Senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="h-12 bg-white border-2 border-gray-200 focus:border-primary transition-all duration-200 rounded-xl"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                  disabled={isLoading || loading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Entrando...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Entrar Agora
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center mt-6 space-y-4">
              <Link 
                to="/reset-password" 
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
              >
                Esqueceu sua senha?
              </Link>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Ainda não tem uma conta?
                </p>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full h-12 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <Link to="/register">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Criar Conta Grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <ManualDialog>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manual de Uso
                  </Button>
                </ManualDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security badge */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="inline-flex items-center gap-2 text-white/80 text-sm">
            <Lock className="h-4 w-4" />
            <span>Seus dados estão 100% seguros e protegidos</span>
          </div>
        </div>
      </div>
    </section>
  );
};
