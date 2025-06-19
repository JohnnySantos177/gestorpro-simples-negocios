import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/ui/stats-card";
import { useData } from "@/context/DataContext";
import { useVisitorMode } from "@/context/VisitorModeContext";
import { VisitorBanner } from "@/components/VisitorBanner";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/format";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { clientes, produtos, compras, transacoes, loading } = useData();
  const { isVisitorMode, targetUserId } = useVisitorMode();
  const { user } = useAuth();

  console.log("Index renderizou", { isVisitorMode, targetUserId });

  // Get the display name for the current context
  const getDisplayContext = () => {
    if (isVisitorMode && targetUserId) {
      return `painel do usuário ${targetUserId}`;
    }
    return "seu painel do TotalGestor";
  };

  // Calculate statistics
  const totalClientes = clientes.length;
  const totalProdutos = produtos.length;
  const totalVendas = compras.length;
  
  const faturamentoTotal = compras.reduce((total, compra) => total + Number(compra.valorTotal), 0);
  const faturamentoMesAtual = compras
    .filter(compra => {
      const compraDate = new Date(compra.data);
      const now = new Date();
      return compraDate.getMonth() === now.getMonth() && compraDate.getFullYear() === now.getFullYear();
    })
    .reduce((total, compra) => total + Number(compra.valorTotal), 0);

  const faturamentoMesAnterior = compras
    .filter(compra => {
      const compraDate = new Date(compra.data);
      const now = new Date();
      const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return compraDate.getMonth() === mesAnterior.getMonth() && compraDate.getFullYear() === mesAnterior.getFullYear();
    })
    .reduce((total, compra) => total + Number(compra.valorTotal), 0);

  const crescimentoPercentual = faturamentoMesAnterior > 0 
    ? ((faturamentoMesAtual - faturamentoMesAnterior) / faturamentoMesAnterior) * 100 
    : faturamentoMesAtual > 0 ? 100 : 0;

  // Prepare chart data
  const vendasPorPeriodo = React.useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const vendasPorMes = new Array(12).fill(0);
    
    compras.forEach(compra => {
      const mes = new Date(compra.data).getMonth();
      vendasPorMes[mes] += Number(compra.valorTotal);
    });

    return meses.map((mes, index) => ({
      mes,
      vendas: vendasPorMes[index]
    }));
  }, [compras]);

  const statusEstoque = React.useMemo(() => {
    const estoqueNormal = produtos.filter(p => p.quantidade > 10).length;
    const estoqueBaixo = produtos.filter(p => p.quantidade <= 10 && p.quantidade > 0).length;
    const estoqueZerado = produtos.filter(p => p.quantidade === 0).length;

    return [
      { name: 'Estoque Normal', value: estoqueNormal, color: '#8b5cf6' },
      { name: 'Estoque Baixo', value: estoqueBaixo, color: '#ef4444' },
      { name: 'Estoque Zerado', value: estoqueZerado, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [produtos]);

  const produtosMaisVendidos = React.useMemo(() => {
    const vendasPorProduto = {};
    
    compras.forEach(compra => {
      if (compra.produtos && Array.isArray(compra.produtos)) {
        compra.produtos.forEach((item: any) => {
          const produtoId = item.produtoId || item.produto_id;
          const quantidade = Number(item.quantidade) || 0;
          
          if (produtoId) {
            vendasPorProduto[produtoId] = (vendasPorProduto[produtoId] || 0) + quantidade;
          }
        });
      }
    });

    return Object.entries(vendasPorProduto)
      .map(([produtoId, quantidade]) => {
        const produto = produtos.find(p => p.id === produtoId);
        return {
          nome: produto?.nome || 'Produto não encontrado',
          quantidade: quantidade as number
        };
      })
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [compras, produtos]);

  const resumoFinanceiro = React.useMemo(() => {
    const receitas = transacoes.filter(t => t.tipo === 'entrada').reduce((sum, t) => sum + Number(t.valor), 0);
    const despesas = transacoes.filter(t => t.tipo === 'saida').reduce((sum, t) => sum + Number(t.valor), 0);
    const lucro = receitas - despesas;

    return { receitas, despesas, lucro };
  }, [transacoes]);

  if (isVisitorMode && !targetUserId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {isVisitorMode && <VisitorBanner />}
      <div className={isVisitorMode ? "pt-16" : ""}>
        <PageHeader
          title="Bom dia!"
          description={`Bem-vindo ao ${getDisplayContext()}. Veja os principais indicadores do negócio.`}
        />

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total de Clientes"
            value={totalClientes}
            icon={<Users className="h-6 w-6" />}
          />
          <StatsCard
            title="Total de Produtos"
            value={totalProdutos}
            icon={<Package className="h-6 w-6" />}
          />
          <StatsCard
            title="Total de Vendas"
            value={totalVendas}
            icon={<ShoppingCart className="h-6 w-6" />}
          />
          <StatsCard
            title="Faturamento Mensal"
            value={formatCurrency(faturamentoMesAtual)}
            description={`${crescimentoPercentual > 0 ? '+' : ''}${crescimentoPercentual.toFixed(1)}% vs. mês anterior`}
            icon={<DollarSign className="h-6 w-6" />}
            trend={crescimentoPercentual > 0 ? "up" : crescimentoPercentual < 0 ? "down" : "neutral"}
            trendValue={`${Math.abs(crescimentoPercentual).toFixed(1)}%`}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vendasPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Vendas']} />
                  <Line type="monotone" dataKey="vendas" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status do Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusEstoque}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusEstoque.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusEstoque.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value} ({((item.value / totalProdutos) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {produtosMaisVendidos.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={produtosMaisVendidos} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nome" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma venda registrada ainda
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Receitas</span>
                </div>
                <span className="font-bold text-green-600">
                  {formatCurrency(resumoFinanceiro.receitas)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Despesas</span>
                </div>
                <span className="font-bold text-red-600">
                  {formatCurrency(resumoFinanceiro.despesas)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Lucro</span>
                </div>
                <span className={`font-bold ${resumoFinanceiro.lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(resumoFinanceiro.lucro)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Index;
