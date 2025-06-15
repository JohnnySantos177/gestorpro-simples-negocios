
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";

export const ProblemsSection = () => {
  const problemsData = [
    {
      icon: Clock,
      title: "Desorganização e Falta de Tempo",
      description: "Você perde tempo procurando informações espalhadas em planilhas, anotações e sistemas diferentes.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Falta de Visão dos Resultados",
      description: "Sem relatórios claros, fica difícil saber se o negócio está indo bem ou onde melhorar.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro Deficiente",
      description: "Contas em atraso, fluxo de caixa descontrolado e dificuldade para acompanhar a rentabilidade.",
      color: "from-amber-500 to-amber-600"
    }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23f3f4f6\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\"/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-6 animate-fade-in">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">ATENÇÃO: Problemas Comuns</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Você Está Perdendo{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Tempo e Dinheiro?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Estes problemas são mais comuns do que você imagina em pequenos negócios
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {problemsData.map((problem, index) => (
            <Card 
              key={index} 
              className="group text-center p-8 hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105 animate-fade-in" 
              style={{ animationDelay: `${0.6 + index * 0.2}s` }}
            >
              <CardContent className="pt-6">
                <div className={`w-20 h-20 bg-gradient-to-r ${problem.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <problem.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-gray-600 transition-colors">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <p className="text-lg text-gray-600 mb-4">
            <strong>A boa notícia?</strong> Todos esses problemas têm solução!
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>
      </div>
    </section>
  );
};
