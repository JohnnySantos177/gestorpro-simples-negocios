
import React, { useState } from "react";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/utils/format";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { VisitorBanner } from "@/components/VisitorBanner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const { dashboardStats, updateDashboardStats, produtos } = useData();

  // Pegar data para saudação
  const date = new Date();
  const hours = date.getHours();
  const greeting = 
    hours < 12
      ? "Bom dia"
      : hours < 18
      ? "Boa tarde"
      : "Boa noite";

  // Calcular produtos com estoque baixo (menos de 15% do estoque máximo ou menos de 10 unidades)
  const produtosEstoqueBaixo = produtos.filter(produto => {
    const estoqueMaximo = Math.max(...produtos.map(p => p.quantidade), 50); // Assumindo 50 como máximo padrão
    const limiteBaixo = Math.max(estoqueMaximo * 0.15, 10); // 15% do máximo ou 10 unidades
    return produto.quantidade <= limiteBaixo;
  });

  const temEstoqueBaixo = produtosEstoqueBaixo.length > 0;

  // Dados atualizados para o gráfico de status do estoque com alerta
  const estoqueData = [
    { 
      name: "Estoque Crítico", 
      value: produtosEstoqueBaixo.length,
      color: "#EF4444" // Vermelho para estoque baixo
    },
    { 
      name: "Estoque Normal", 
      value: dashboardStats.estoqueStatus.normal,
      color: "#9b87f5" // Roxo padrão
    },
    { 
      name: "Estoque Alto", 
      value: dashboardStats.estoqueStatus.alto,
      color: "#10B981" // Verde para estoque alto
    },
  ];

  // Configuração de cores dos gráficos
  const chartConfig = {
    vendas: { color: "#9b87f5" },
    produtos: { color: "#9b87f5" },
    estoqueCritico: { color: "#EF4444" },
    estoqueNormal: { color: "#9b87f5" },
    estoqueAlto: { color: "#10B981" },
  };

  return (
    <Layout>
      <VisitorBanner />
      <PageHeader 
        title={`${greeting}!`}
        description="Bem-vindo ao seu painel do TotalGestor. Veja os principais indicadores do seu negócio."
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Clientes"
          value={dashboardStats.totalClientes}
          icon={<Users size={20} />}
        />
        <StatsCard
          title="Total de Produtos"
          value={dashboardStats.totalProdutos}
          icon={<Package size={20} />}
        />
        <StatsCard
          title="Total de Vendas"
          value={dashboardStats.totalVendas}
          icon={<ShoppingCart size={20} />}
        />
        <StatsCard
          title="Faturamento Mensal"
          value={formatCurrency(dashboardStats.faturamentoMensal)}
          icon={<DollarSign size={20} />}
          trend="up"
          trendValue="12% vs. mês anterior"
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboardStats.vendasPorPeriodo}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <XAxis 
                    dataKey="periodo" 
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Vendas"]}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#9b87f5"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#9b87f5" }}
                    activeDot={{ r: 6, fill: "#9b87f5" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Status do Estoque
              {temEstoqueBaixo && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {temEstoqueBaixo && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  <strong>{produtosEstoqueBaixo.length} produto(s)</strong> com estoque crítico!
                </AlertDescription>
              </Alert>
            )}
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estoqueData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({name, percent, value}) => 
                      value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                    labelLine={false}
                  >
                    {estoqueData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} produtos`, 
                      name === "Estoque Crítico" ? "⚠️ " + name : name
                    ]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardStats.produtosMaisVendidos}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 100,
                    bottom: 20,
                  }}
                >
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={90}
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} unidades`, "Quantidade"]}
                    labelFormatter={(label) => `Produto: ${label}`}
                  />
                  <Bar 
                    dataKey="quantidade" 
                    fill="#9b87f5" 
                    barSize={20}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ticket Médio</span>
                <div className="flex items-center">
                  <span className="font-semibold">{formatCurrency(dashboardStats.ticketMedio)}</span>
                  <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Custo Médio por Item</span>
                <div className="flex items-center">
                  <span className="font-semibold">{formatCurrency(120.50)}</span>
                  <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Margem Média</span>
                <div className="flex items-center">
                  <span className="font-semibold">35%</span>
                  <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
