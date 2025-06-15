
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FAQSection = () => {
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
  );
};
