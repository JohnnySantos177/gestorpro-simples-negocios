import React, { useEffect } from "react";
import { OptimizedLayout } from "@/components/OptimizedLayout";
import { PageHeader } from "@/components/PageHeader";
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

  // Calcular produtos com estoque normal (entre o limite baixo e 70% do máximo)
  const produtosEstoqueNormal = produtos.filter(produto => {
    const estoqueMaximo = Math.max(...produtos.map(p => p.quantidade), 50);
    const limiteBaixo = Math.max(estoqueMaximo * 0.15, 10);
    const limiteAlto = estoqueMaximo * 0.7;
    return produto.quantidade > limiteBaixo && produto.quantidade <= limiteAlto;
  });

  // Calcular produtos com estoque alto (acima de 70% do máximo)
  const produtosEstoqueAlto = produtos.filter(produto => {
    const estoqueMaximo = Math.max(...produtos.map(p => p.quantidade), 50);
    const limiteAlto = estoqueMaximo * 0.7;
    return produto.quantidade > limiteAlto;
  });

  const temEstoqueBaixo = produtosEstoqueBaixo.length > 0;
  const totalProdutos = produtos.length;

  // Dados atualizados para o gráfico de status do estoque com percentuais corretos
  const estoqueData = [
    { 
      name: "Estoque Crítico", 
      value: produtosEstoqueBaixo.length,
      percent: totalProdutos > 0 ? (produtosEstoqueBaixo.length / totalProdutos * 100).toFixed(1) : 0,
      color: "#EF4444" // Vermelho para estoque baixo
    },
    { 
      name: "Estoque Normal", 
      value: produtosEstoqueNormal.length,
      percent: totalProdutos > 0 ? (produtosEstoqueNormal.length / totalProdutos * 100).toFixed(1) : 0,
      color: "#7C3AED" // Roxo médio
    },
    { 
      name: "Estoque Alto", 
      value: produtosEstoqueAlto.length,
      percent: totalProdutos > 0 ? (produtosEstoqueAlto.length / totalProdutos * 100).toFixed(1) : 0,
      color: "#A855F7" // Roxo claro
    },
  ].filter(item => item.value > 0); // Só mostrar categorias que têm produtos

  // Configuração de cores dos gráficos
  const chartConfig = {
    vendas: { color: "#9b87f5" },
    produtos: { color: "#9b87f5" },
    estoqueCritico: { color: "#EF4444" },
    estoqueNormal: { color: "#7C3AED" },
    estoqueAlto: { color: "#A855F7" },
  };

  return (
    <OptimizedLayout>
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
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 30,
                  }}
                >
                  <XAxis 
                    dataKey="periodo" 
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    width={50}
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
                    dot={{ r: 3, fill: "#9b87f5" }}
                    activeDot={{ r: 5, fill: "#9b87f5" }}
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
            {totalProdutos > 0 ? (
              <>
                <div className="h-[180px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={estoqueData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({name, percent}) => 
                          `${name}: ${percent}%`
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
                        formatter={(value: number, name: string, props: any) => [
                          `${value} produtos (${props.payload.percent}%)`, 
                          name === "Estoque Crítico" ? "⚠️ " + name : name
                        ]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-3 space-y-1">
                  {estoqueData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value} ({item.percent}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-gray-500">
                <p>Nenhum produto cadastrado</p>
              </div>
            )}
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
                    top: 10,
                    right: 20,
                    left: 80,
                    bottom: 10,
                  }}
                >
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={70}
                    tick={{ fontSize: 9 }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} unidades`, "Quantidade"]}
                    labelFormatter={(label) => `Produto: ${label}`}
                  />
                  <Bar 
                    dataKey="quantidade" 
                    fill="#9b87f5" 
                    barSize={18}
                    radius={[0, 3, 3, 0]}
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
    </OptimizedLayout>
  );
};

export default Dashboard;
