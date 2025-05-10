
import React, { useState } from "react";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  TrendingDown
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

const Dashboard = () => {
  const { dashboardStats, updateDashboardStats } = useData();

  // Pegar data para saudação
  const date = new Date();
  const hours = date.getHours();
  const greeting = 
    hours < 12
      ? "Bom dia"
      : hours < 18
      ? "Boa tarde"
      : "Boa noite";

  // Cores para os gráficos
  const COLORS = ["#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA", "#E5DEFF"];

  // Dados para o gráfico de status do estoque
  const estoqueData = [
    { name: "Estoque Baixo", value: dashboardStats.estoqueStatus.baixo },
    { name: "Estoque Normal", value: dashboardStats.estoqueStatus.normal },
    { name: "Estoque Alto", value: dashboardStats.estoqueStatus.alto },
  ];

  return (
    <Layout>
      <PageHeader 
        title={`${greeting}!`}
        description="Bem-vindo ao seu painel do Gestor Pro. Veja os principais indicadores do seu negócio."
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
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboardStats.vendasPorPeriodo}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 20,
                  }}
                >
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Vendas"]}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#9b87f5"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estoqueData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {estoqueData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} produtos`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardStats.produtosMaisVendidos}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 10,
                    left: 80,
                    bottom: 20,
                  }}
                >
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={70}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} unidades`]}
                  />
                  <Bar dataKey="quantidade" fill="#9b87f5" barSize={20} />
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
