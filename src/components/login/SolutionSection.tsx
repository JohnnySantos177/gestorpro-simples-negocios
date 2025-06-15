
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, BarChart3, Shield, CheckCircle, BookOpen } from "lucide-react";

export const SolutionSection = () => {
  const featuresData = [
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Mantenha todos os dados dos seus clientes organizados e acessíveis a qualquer momento.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: DollarSign,
      title: "Controle de Estoque",
      description: "Gerencie seu estoque de forma inteligente, evitando perdas e otimizando compras.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: BarChart3,
      title: "Vendas e Faturamento",
      description: "Registre vendas rapidamente e acompanhe seu faturamento em tempo real.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Gestão Financeira",
      description: "Controle completo das suas finanças com relatórios detalhados e fluxo de caixa.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: CheckCircle,
      title: "Assistência Inteligente",
      description: "Sistema intuitivo que te ajuda a tomar as melhores decisões para seu negócio.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: BookOpen,
      title: "Acesso em Qualquer Lugar",
      description: "Gerencie seu negócio de qualquer dispositivo, a qualquer hora e lugar.",
      color: "from-teal-500 to-teal-600"
    }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-6 py-3 rounded-full mb-8 animate-fade-in">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">SOLUÇÃO COMPLETA</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A Solução Completa Para{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sua Gestão
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Tudo que você precisa para organizar e fazer crescer seu negócio, integrado em uma plataforma moderna e intuitiva
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <Card 
              key={index} 
              className="group text-center p-8 hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:scale-105 hover:bg-white animate-fade-in" 
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-gray-600 transition-colors">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="text-center p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl">
            <div className="text-3xl font-bold text-primary mb-2">+1000</div>
            <p className="text-muted-foreground">Empresas atendidas</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl">
            <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
            <p className="text-muted-foreground">Uptime garantido</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-muted-foreground">Suporte disponível</p>
          </div>
        </div>
      </div>
    </section>
  );
};
