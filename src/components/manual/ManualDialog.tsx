
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Truck, Package, Users, DollarSign, BarChart } from "lucide-react";
import { ManualFornecedores } from "./sections/ManualFornecedores";
import { ManualProdutos } from "./sections/ManualProdutos";
import { ManualClientes } from "./sections/ManualClientes";
import { ManualVendas } from "./sections/ManualVendas";
import { ManualFinanceiro } from "./sections/ManualFinanceiro";
import { ManualDashboard } from "./sections/ManualDashboard";

interface ManualDialogProps {
  children: React.ReactNode;
}

export const ManualDialog: React.FC<ManualDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Manual de Uso - TotalGestor
          </DialogTitle>
          <DialogDescription>
            Guia completo para começar a usar o TotalGestor de forma eficiente
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <Tabs defaultValue="fornecedores" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="fornecedores" className="text-xs">
                <Truck className="h-4 w-4 mr-1" />
                Fornecedores
              </TabsTrigger>
              <TabsTrigger value="produtos" className="text-xs">
                <Package className="h-4 w-4 mr-1" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="clientes" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                Clientes
              </TabsTrigger>
              <TabsTrigger value="vendas" className="text-xs">
                <DollarSign className="h-4 w-4 mr-1" />
                Vendas
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="text-xs">
                <DollarSign className="h-4 w-4 mr-1" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="text-xs">
                <BarChart className="h-4 w-4 mr-1" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fornecedores">
              <ManualFornecedores />
            </TabsContent>

            <TabsContent value="produtos">
              <ManualProdutos />
            </TabsContent>

            <TabsContent value="clientes">
              <ManualClientes />
            </TabsContent>

            <TabsContent value="vendas">
              <ManualVendas />
            </TabsContent>

            <TabsContent value="financeiro">
              <ManualFinanceiro />
            </TabsContent>

            <TabsContent value="dashboard">
              <ManualDashboard />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
