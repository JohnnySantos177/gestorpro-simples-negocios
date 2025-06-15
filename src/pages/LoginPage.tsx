
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
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/format";
import { 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Shield, 
  Clock, 
  BarChart3,
  Users,
  DollarSign,
  Star,
  ArrowRight
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, loading, user } = useAuth();
  const { initiateCheckout, checkoutLoading, isSubscribed } = useSubscription();
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

  const problemsData = [
    {
      icon: Clock,
      title: "Desorganização e Falta de Tempo",
      description: "Você perde tempo procurando informações espalhadas em planilhas, anotações e sistemas diferentes."
    },
    {
      icon: TrendingUp,
      title: "Falta de Visão dos Resultados",
      description: "Sem relatórios claros, fica difícil saber se o negócio está indo bem ou onde melhorar."
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro Deficiente",
      description: "Contas em atraso, fluxo de caixa descontrolado e dificuldade para acompanhar a rentabilidade."
    }
  ];

  const featuresData = [
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Mantenha todos os dados dos seus clientes organizados e acessíveis a qualquer momento."
    },
    {
      icon: DollarSign,
      title: "Controle de Estoque",
      description: "Gerencie seu estoque de forma inteligente, evitando perdas e otimizando compras."
    },
    {
      icon: BarChart3,
      title: "Vendas e Faturamento",
      description: "Registre vendas rapidamente e acompanhe seu faturamento em tempo real."
    },
    {
      icon: Shield,
      title: "Gestão Financeira",
      description: "Controle completo das suas finanças com relatórios detalhados e fluxo de caixa."
    },
    {
      icon: CheckCircle,
      title: "Assistência Inteligente",
      description: "Sistema intuitivo que te ajuda a tomar as melhores decisões para seu negócio."
    },
    {
      icon: BookOpen,
      title: "Acesso em Qualquer Lugar",
      description: "Gerencie seu negócio de qualquer dispositivo, a qualquer hora e lugar."
    }
  ];

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Mensal',
      price: 8990,
      displayPrice: 89.90,
      interval: 'mensal',
      description: 'Ideal para começar',
      features: [
        'Acesso completo ao sistema',
        'Gestão de clientes ilimitados',
        'Controle de estoque',
        'Relatórios básicos',
        'Suporte por email'
      ]
    },
    {
      id: 'semiannual' as const,
      name: 'Semestral',
      price: 6990,
      displayPrice: 69.90,
      interval: 'mensal',
      description: 'Mais popular - Economize 22%',
      features: [
        'Todos os recursos do plano mensal',
        'Relatórios avançados',
        'Backup automático',
        'Suporte prioritário',
        'Exportação de dados',
        '2 meses grátis'
      ],
      popular: true
    },
    {
      id: 'quarterly' as const,
      name: 'Trimestral',
      price: 7990,
      displayPrice: 79.90,
      interval: 'mensal',
      description: 'Economize 11%',
      features: [
        'Todos os recursos do plano mensal',
        'Relatórios avançados',
        'Backup automático',
        'Suporte prioritário'
      ]
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      business: "Boutique Elegance",
      content: "Desde que comecei a usar o TotalGestor Pro, minha vida mudou! Tenho mais tempo e meu negócio nunca esteve tão organizado.",
      rating: 5
    },
    {
      name: "João Santos",
      business: "Tech Solutions",
      content: "O sistema é muito intuitivo e me ajudou a ter controle total sobre minhas finanças. Recomendo!",
      rating: 5
    },
    {
      name: "Ana Costa",
      business: "Café & Cia",
      content: "Excelente ferramenta! Consegui organizar meu estoque e aumentar minhas vendas em 30%.",
      rating: 5
    }
  ];

  const faqData = [
    {
      question: "Como funciona a cobrança?",
      answer: "A assinatura é cobrada de acordo com o plano escolhido e renovada automaticamente até que você cancele."
    },
    {
      question: "Posso trocar de plano?",
      answer: "Sim, você pode alterar seu plano a qualquer momento entrando em contato com nosso suporte."
    },
    {
      question: "Posso usar em múltiplos dispositivos?",
      answer: "Sim, você pode acessar o sistema de qualquer dispositivo com acesso à internet."
    },
    {
      question: "O que acontece se eu cancelar?",
      answer: "Você terá acesso ao sistema até o final do período pago. Seus dados serão mantidos por 30 dias."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <div className="absolute top-4 left-4 z-50">
        <AdminNavigation />
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img 
              src="/lovable-uploads/06397695-3081-4591-9816-edb718b6ee10.png" 
              alt="TotalGestor Logo" 
              className="h-16 w-16 bg-white rounded-lg p-3"
            />
            <h1 className="text-3xl font-bold">TotalGestor Pro</h1>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Simplifique Sua Gestão e Multiplique Seus Resultados
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-4xl mx-auto">
            O sistema completo que pequenos negócios precisam para organizar finanças, vendas, estoque e clientes em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
              onClick={() => document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Começar Agora - É Grátis
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg"
              onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Você Está Perdendo Tempo e Dinheiro?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Estes problemas são mais comuns do que você imagina em pequenos negócios
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {problemsData.map((problem, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <problem.icon className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{problem.title}</h3>
                  <p className="text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              A Solução Completa Para Sua Gestão
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tudo que você precisa para organizar e fazer crescer seu negócio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Transform Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Transforme Sua Gestão em 30 Dias
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-4xl font-bold mb-2">+200%</div>
              <p className="text-white/90">Aumento na organização dos dados</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">-80%</div>
              <p className="text-white/90">Redução no tempo gasto com planilhas</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">+150%</div>
              <p className="text-white/90">Melhoria no controle financeiro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              O Que Nossos Clientes Dizem
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Escolha o Plano Ideal Para Seu Negócio
            </h2>
            <p className="text-xl text-muted-foreground">
              Preços transparentes e sem surpresas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary border-2' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatCurrency(plan.displayPrice)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => initiateCheckout(plan.id)}
                    disabled={checkoutLoading || isSubscribed}
                  >
                    {checkoutLoading ? "Processando..." : isSubscribed ? "Plano Ativo" : "Assinar Agora"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Perguntas Frequentes
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Login Section */}
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
    </div>
  );
};

export default LoginPage;
