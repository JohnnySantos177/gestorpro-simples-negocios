
import React from "react";

export const TransformSection = () => {
  return (
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
  );
};
