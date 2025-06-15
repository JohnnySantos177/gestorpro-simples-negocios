
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, DollarSign } from "lucide-react";

export const ProblemsSection = () => {
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

  return (
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
  );
};
