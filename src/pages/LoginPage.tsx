
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AdminNavigation } from "@/components/AdminNavigation";
import { ManualDialog } from "@/components/manual/ManualDialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Shield, 
  Clock, 
  BarChart3,
  Users,
  DollarSign
} from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const benefits = [
    {
      icon: CheckCircle,
      title: "Organização Sem Esforço",
      description: "Diga adeus às planilhas e centralize tudo em um só lugar. Clientes, produtos, vendas e finanças na palma da sua mão."
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro Total",
      description: "Saiba exatamente para onde seu dinheiro está indo. Fluxo de caixa, contas a pagar/receber e relatórios claros."
    },
    {
      icon: TrendingUp,
      title: "Venda Mais, Gerencie Melhor",
      description: "Otimize seu estoque, acompanhe suas vendas e nunca perca uma oportunidade de negócio."
    },
    {
      icon: Clock,
      title: "Liberte Seu Tempo",
      description: "Automatize tarefas repetitivas e foque no crescimento estratégico do seu negócio, não na burocracia."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Admin Navigation - only shown for admins */}
      <div className="absolute top-4 left-4 z-10">
        <AdminNavigation />
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Visual Content */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent('<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.1"><circle cx="30" cy="30" r="2"/></g></g></svg>')}")`
          }}></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <img 
                  src="/lovable-uploads/06397695-3081-4591-9816-edb718b6ee10.png" 
                  alt="TotalGestor Logo" 
                  className="h-12 w-12 bg-white rounded-lg p-2"
                />
                <span className="text-2xl font-bold">TotalGestor Pro</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                Cansado(a) do Caos na{" "}
                <span className="text-yellow-300">Gestão?</span>
              </h1>
              
              <h2 className="text-xl xl:text-2xl font-semibold mb-8 text-white/90">
                Recupere o Controle e Multiplique Seus Resultados!
              </h2>
              
              <p className="text-lg mb-10 text-white/80 leading-relaxed">
                O TotalGestor Pro é a ferramenta completa que pequenos negócios precisam para 
                organizar finanças, vendas, estoque e clientes, tudo em um só lugar.
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                      <p className="text-sm text-white/70 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="mt-10 p-6 bg-white/10 rounded-lg backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex text-yellow-300">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
                <blockquote className="text-white/90 italic mb-3">
                  "Desde que comecei a usar o TotalGestor Pro, minha vida mudou! Tenho mais tempo e meu negócio nunca esteve tão organizado."
                </blockquote>
                <cite className="text-white/70 text-sm">— Maria Silva, Dona da Boutique Elegance</cite>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-12 h-12 bg-yellow-300/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-12 w-16 h-16 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6 animate-scale-in">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                  <img 
                    src="/lovable-uploads/06397695-3081-4591-9816-edb718b6ee10.png" 
                    alt="TotalGestor Logo" 
                    className="h-10 w-10"
                  />
                  <span className="text-xl font-bold text-primary">TotalGestor Pro</span>
                </div>

                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Bem-vindo(a) de volta!
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sua jornada para uma gestão descomplicada começa aqui.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">E-mail</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="seu@email.com" 
                              className="h-12 border-border/50 focus:border-primary transition-colors"
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
                          <FormLabel className="text-foreground font-medium">Senha</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="h-12 border-border/50 focus:border-primary transition-colors"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold transition-all duration-200 hover:scale-105" 
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

                <div className="text-center space-y-3">
                  <Link 
                    to="/reset-password" 
                    className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>

                {/* Register CTA */}
                <div className="border-t border-border/20 pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Ainda não tem uma conta?
                    </p>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full h-12 border-primary/20 text-primary hover:bg-primary/5 font-semibold transition-all duration-200 hover:scale-105"
                    >
                      <Link to="/register">
                        <span className="mr-2">🚀</span>
                        Crie sua conta grátis agora!
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Manual Button */}
                <div className="border-t border-border/20 pt-4">
                  <ManualDialog>
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-primary">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manual de Uso
                    </Button>
                  </ManualDialog>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Benefits Preview */}
            <div className="lg:hidden">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 text-center">
                    Por que escolher o TotalGestor Pro?
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Relatórios Claros</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Gestão de Clientes</p>
                    </div>
                    <div className="text-center">
                      <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Dados Seguros</p>
                    </div>
                    <div className="text-center">
                      <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Economize Tempo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
