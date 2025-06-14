
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const beneficios = [
  "Acesso a todos os módulos do sistema",
  "Dados armazenados de forma segura",
  "Atualizações contínuas do sistema",
  "Relatórios avançados e análises de negócios",
  "Suporte técnico prioritário",
  "Backup automático dos seus dados",
  "Acesso via dispositivos móveis",
  "Exportação dos relatórios em múltiplos formatos"
];

export const BenefitsList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os planos incluem:</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {beneficios.map((beneficio, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-totalgestor-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm">{beneficio}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
