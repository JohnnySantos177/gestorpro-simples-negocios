
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
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

  return (
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
  );
};
