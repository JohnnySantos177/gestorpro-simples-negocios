
import React from "react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
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
  );
};
