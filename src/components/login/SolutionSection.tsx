
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, BarChart3, Shield, CheckCircle, BookOpen } from "lucide-react";

export const SolutionSection = () => {
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

  return (
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
  );
};
