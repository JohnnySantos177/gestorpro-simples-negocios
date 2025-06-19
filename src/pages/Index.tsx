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
  Minus,
  ArrowDown,
  ArrowUp,
  PieChart as PieIcon
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
  Bar,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";

const LOGO_URL = "/lovable-uploads/06397695-3081-4591-9816-edb718b6ee10.png";

const Index = () => {
  const { clientes, produtos, compras, transacoes, loading } = useData();
  const { isVisitorMode, targetUserId } = useVisitorMode();
  const { user, profile } = useAuth();

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

  // Novo cálculo: receitas = vendas + transações de entrada
  const receitasVendas = compras.reduce((sum, c) => sum + Number(c.valorTotal), 0);
  const receitasTransacoes = transacoes.filter(t => t.tipo === 'entrada').reduce((sum, t) => sum + Number(t.valor), 0);
  const despesas = transacoes.filter(t => t.tipo === 'saida').reduce((sum, t) => sum + Number(t.valor), 0);
  const receitas = receitasVendas + receitasTransacoes;
  const lucro = receitas - despesas;

  const resumoFinanceiro = React.useMemo(() => ({ receitas, despesas, lucro }), [receitas, despesas, lucro]);

  // Filtro de ano
  const [anoSelecionado, setAnoSelecionado] = React.useState(new Date().getFullYear());
  const anosDisponiveis = React.useMemo(() => {
    const anos = new Set<number>();
    compras.forEach(c => anos.add(new Date(c.data).getFullYear()));
    transacoes.forEach(t => anos.add(new Date(t.data).getFullYear()));
    return Array.from(anos).sort((a, b) => b - a);
  }, [compras, transacoes]);

  // 1. Fluxo de Caixa Mensal (com filtro de ano)
  const fluxoCaixaPorMes = React.useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const entradasPorMes = new Array(12).fill(0);
    const saidasPorMes = new Array(12).fill(0);
    compras.filter(c => new Date(c.data).getFullYear() === anoSelecionado).forEach(compra => {
      const mes = new Date(compra.data).getMonth();
      entradasPorMes[mes] += Number(compra.valorTotal);
    });
    transacoes.filter(t => t.tipo === 'entrada' && new Date(t.data).getFullYear() === anoSelecionado).forEach(t => {
      const mes = new Date(t.data).getMonth();
      entradasPorMes[mes] += Number(t.valor);
    });
    transacoes.filter(t => t.tipo === 'saida' && new Date(t.data).getFullYear() === anoSelecionado).forEach(t => {
      const mes = new Date(t.data).getMonth();
      saidasPorMes[mes] += Number(t.valor);
    });
    return meses.map((mes, i) => ({
      mes,
      entradas: entradasPorMes[i],
      saidas: saidasPorMes[i],
      saldo: entradasPorMes[i] - saidasPorMes[i]
    }));
  }, [compras, transacoes, anoSelecionado]);

  // 5. Clientes Mais Lucrativos (com filtro de ano)
  const clientesMaisLucrativos = React.useMemo(() => {
    const receitaPorCliente = {};
    compras.filter(c => new Date(c.data).getFullYear() === anoSelecionado).forEach(compra => {
      if (compra.clienteId && compra.clienteNome) {
        receitaPorCliente[compra.clienteId] = (receitaPorCliente[compra.clienteId] || 0) + Number(compra.valorTotal);
      }
    });
    return Object.entries(receitaPorCliente)
      .map(([clienteId, valor]) => {
        const cliente = clientes.find(c => c.id === clienteId);
        return {
          nome: cliente?.nome || 'Cliente não encontrado',
          valor: valor as number
        };
      })
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [compras, clientes, anoSelecionado]);

  // Gráfico de Evolução do Lucro mês a mês (com filtro de ano)
  const evolucaoLucroPorMes = React.useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const entradasPorMes = new Array(12).fill(0);
    const saidasPorMes = new Array(12).fill(0);
    compras.filter(c => new Date(c.data).getFullYear() === anoSelecionado).forEach(compra => {
      const mes = new Date(compra.data).getMonth();
      entradasPorMes[mes] += Number(compra.valorTotal);
    });
    transacoes.filter(t => t.tipo === 'entrada' && new Date(t.data).getFullYear() === anoSelecionado).forEach(t => {
      const mes = new Date(t.data).getMonth();
      entradasPorMes[mes] += Number(t.valor);
    });
    transacoes.filter(t => t.tipo === 'saida' && new Date(t.data).getFullYear() === anoSelecionado).forEach(t => {
      const mes = new Date(t.data).getMonth();
      saidasPorMes[mes] += Number(t.valor);
    });
    return meses.map((mes, i) => ({
      mes,
      lucro: entradasPorMes[i] - saidasPorMes[i]
    }));
  }, [compras, transacoes, anoSelecionado]);

  // Função auxiliar para exportar gráfico com título e logo
  const exportarGrafico = async (id: string, titulo: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Captura o gráfico como canvas
    const chartCanvas = await html2canvas(el, { backgroundColor: null });
    // Cria um novo canvas maior para título e logo
    const padding = 24;
    const logoSize = 48;
    const titleFont = "bold 20px Arial, sans-serif";
    const width = chartCanvas.width + padding * 2;
    const height = chartCanvas.height + padding * 2 + logoSize;
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = width;
    finalCanvas.height = height;
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;

    // Fundo branco
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);

    // Desenha logo
    const logo = new window.Image();
    logo.src = LOGO_URL;
    await new Promise(resolve => { logo.onload = resolve; });
    ctx.drawImage(logo, padding, padding, logoSize, logoSize);

    // Desenha título
    ctx.font = titleFont;
    ctx.fillStyle = "#222";
    ctx.textBaseline = "top";
    ctx.fillText(titulo, padding + logoSize + 12, padding + 12);

    // Desenha o gráfico abaixo do título e logo
    ctx.drawImage(chartCanvas, padding, padding + logoSize + 12);

    // Exporta
    const link = document.createElement('a');
    link.download = `${id}.png`;
    link.href = finalCanvas.toDataURL();
    link.click();
  };

  // Extrair primeiro nome
  const primeiroNome = React.useMemo(() => {
    if (profile && profile.nome) {
      return profile.nome.split(' ')[0];
    }
    return '';
  }, [profile]);

  // Saudação dinâmica conforme horário
  const saudacao = React.useMemo(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'Bom dia';
    if (hora >= 12 && hora < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

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
          title={`${saudacao}${primeiroNome ? `, ${primeiroNome}` : ''}!`}
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

        {/* Resumo Financeiro */}
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resumo Financeiro</CardTitle>
              <PieIcon className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                {/* Blocos visuais */}
                <div className="flex-1 flex flex-col items-center bg-green-50 rounded-lg p-4 shadow-sm">
                  <DollarSign className="h-7 w-7 text-green-600 mb-1" />
                  <span className="text-muted-foreground text-sm mb-1">Receitas</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(resumoFinanceiro.receitas)}</span>
                </div>
                <div className="flex-1 flex flex-col items-center bg-red-50 rounded-lg p-4 shadow-sm">
                  <ArrowDown className="h-7 w-7 text-red-600 mb-1" />
                  <span className="text-muted-foreground text-sm mb-1">Despesas</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(resumoFinanceiro.despesas)}</span>
                </div>
                <div className={`flex-1 flex flex-col items-center ${resumoFinanceiro.lucro >= 0 ? 'bg-blue-50' : 'bg-red-100'} rounded-lg p-4 shadow-sm`}>
                  <ArrowUp className={`h-7 w-7 mb-1 ${resumoFinanceiro.lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                  <span className="text-muted-foreground text-sm mb-1">Lucro</span>
                  <span className={`text-2xl font-bold ${resumoFinanceiro.lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(resumoFinanceiro.lucro)}</span>
                </div>
                {/* Gráfico de pizza */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-muted-foreground text-xs mb-2">Proporção</span>
                  <div className="w-28 h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Receitas', value: resumoFinanceiro.receitas, color: '#22c55e' },
                            { name: 'Despesas', value: resumoFinanceiro.despesas, color: '#ef4444' },
                            { name: 'Lucro', value: Math.max(resumoFinanceiro.lucro, 0), color: '#3b82f6' },
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={48}
                          innerRadius={28}
                          paddingAngle={2}
                        >
                          {[
                            '#22c55e',
                            '#ef4444',
                            '#3b82f6',
                          ].map((color, idx) => (
                            <Cell key={color} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={v => formatCurrency(Number(v))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Receitas</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Despesas</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />Lucro</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtro de ano para os gráficos financeiros */}
        <div className="flex justify-end mb-4">
          <label className="mr-2 font-medium">Ano:</label>
          <select value={anoSelecionado} onChange={e => setAnoSelecionado(Number(e.target.value))} className="border rounded px-2 py-1">
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vendas por Período</CardTitle>
              <button onClick={() => exportarGrafico('grafico-vendas-periodo', 'Vendas por Período')} className="text-xs text-blue-600 underline ml-2">Exportar PNG</button>
            </CardHeader>
            <CardContent>
              <div id="grafico-vendas-periodo" className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={vendasPorPeriodo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Vendas']} />
                    <Line type="monotone" dataKey="vendas" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Status do Estoque</CardTitle>
              <button onClick={() => exportarGrafico('grafico-status-estoque', 'Status do Estoque')} className="text-xs text-blue-600 underline ml-2">Exportar PNG</button>
            </CardHeader>
            <CardContent>
              <div id="grafico-status-estoque" className="w-full h-[300px]">
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
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.value} ({((item.value / totalProdutos) * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <button onClick={() => exportarGrafico('grafico-produtos-mais-vendidos', 'Produtos Mais Vendidos')} className="text-xs text-blue-600 underline ml-2">Exportar PNG</button>
            </CardHeader>
            <CardContent>
              <div id="grafico-produtos-mais-vendidos" className="w-full h-[250px]">
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
              </div>
            </CardContent>
          </Card>

          {/* Gráfico 1: Fluxo de Caixa Mensal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fluxo de Caixa Mensal</CardTitle>
              <button onClick={() => exportarGrafico('grafico-fluxo-caixa', 'Fluxo de Caixa Mensal')} className="text-xs text-blue-600 underline ml-2">Exportar PNG</button>
            </CardHeader>
            <CardContent>
              <div id="grafico-fluxo-caixa" className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={fluxoCaixaPorMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value, name, props) => [formatCurrency(Number(value)), props && props.payload ? `${props.payload.mes} - ${typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : String(name)}` : name]} />
                    <Legend />
                    <Bar dataKey="entradas" fill="#22c55e" name="Entradas" />
                    <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
                    <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nova linha: Clientes Mais Lucrativos */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clientes Mais Lucrativos</CardTitle>
              <button onClick={() => exportarGrafico('grafico-clientes-lucrativos', 'Clientes Mais Lucrativos')} className="text-xs text-blue-600 underline ml-2">Exportar PNG</button>
            </CardHeader>
            <CardContent>
              <div id="grafico-clientes-lucrativos" className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={clientesMaisLucrativos} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nome" type="category" width={120} />
                    <Tooltip formatter={(value, name, props) => [formatCurrency(Number(value)), props && props.payload ? `${props.payload.nome}` : name]} />
                    <Legend />
                    <Bar dataKey="valor" fill="#f59e42" name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico: Evolução do Lucro */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Evolução do Lucro</CardTitle>
              <button onClick={() => exportarGrafico('grafico-lucro', 'Evolução do Lucro')} className="text-xs text-blue-600 underline ml-2">Exportar PNG</button>
            </CardHeader>
            <CardContent>
              <div id="grafico-lucro" className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={evolucaoLucroPorMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value, name, props) => [formatCurrency(Number(value)), props && props.payload ? `${props.payload.mes} - Lucro` : name]} />
                    <Legend />
                    <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={2} name="Lucro" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Responsividade extra: scroll horizontal em telas pequenas */}
      <style>{`
        @media (max-width: 768px) {
          .w-full.h-[250px] { min-width: 400px; overflow-x: auto; }
        }
      `}</style>
    </>
  );
};

export default Index;
