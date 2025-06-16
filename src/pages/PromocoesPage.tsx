
import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromocaoDialogs } from "./Vendas/components/PromocaoDialogs";
import { usePromocoesDialogs } from "./Vendas/hooks/usePromocoesDialogs";
import { useData } from "@/context/DataContext";
import { Plus, Search, Eye, Edit, Trash2, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PromocoesPage = () => {
  const {
    promocoes,
    addPromocao,
    updatePromocao,
    deletePromocao,
    loading,
  } = useData();

  const {
    dialogOpen,
    dialogType,
    selectedPromocao,
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
    openViewDialog,
    closeDialog,
  } = usePromocoesDialogs();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");

  const filteredPromocoes = useMemo(() => {
    return promocoes.filter((promocao) => {
      const matchesSearch = promocao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (promocao.descricao && promocao.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "todos" || 
        (statusFilter === "ativa" && promocao.ativo) ||
        (statusFilter === "inativa" && !promocao.ativo);
      
      const matchesTipo = tipoFilter === "todos" || promocao.tipoDesconto === tipoFilter;

      return matchesSearch && matchesStatus && matchesTipo;
    });
  }, [promocoes, searchTerm, statusFilter, tipoFilter]);

  const isPromocaoAtiva = (promocao: any) => {
    const hoje = new Date();
    const inicio = new Date(promocao.dataInicio);
    const fim = new Date(promocao.dataFim);
    
    return promocao.ativo && hoje >= inicio && hoje <= fim;
  };

  const getStatusBadge = (promocao: any) => {
    if (!promocao.ativo) {
      return <Badge variant="secondary">Inativa</Badge>;
    }
    
    const hoje = new Date();
    const inicio = new Date(promocao.dataInicio);
    const fim = new Date(promocao.dataFim);
    
    if (hoje < inicio) {
      return <Badge variant="outline">Programada</Badge>;
    } else if (hoje > fim) {
      return <Badge variant="destructive">Expirada</Badge>;
    } else {
      return <Badge variant="default">Ativa</Badge>;
    }
  };

  const formatarDesconto = (promocao: any) => {
    if (promocao.tipoDesconto === "percentual") {
      return `${promocao.valorDesconto}%`;
    }
    return `R$ ${promocao.valorDesconto.toFixed(2)}`;
  };

  // Estatísticas
  const promocoesAtivas = promocoes.filter(p => isPromocaoAtiva(p)).length;
  const promocoesInativas = promocoes.filter(p => !p.ativo).length;
  const promocoesExpiradas = promocoes.filter(p => {
    const hoje = new Date();
    const fim = new Date(p.dataFim);
    return p.ativo && hoje > fim;
  }).length;

  return (
    <>
      <PageHeader
        title="Promoções"
        description="Gerencie suas promoções e descontos"
      />
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Promoções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promocoes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promoções Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{promocoesAtivas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promoções Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{promocoesInativas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promoções Expiradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{promocoesExpiradas}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Promoções</CardTitle>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Promoção
            </Button>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar promoções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativa">Ativas</SelectItem>
                <SelectItem value="inativa">Inativas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="percentual">Percentual</SelectItem>
                <SelectItem value="valor">Valor fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando promoções...</div>
          ) : filteredPromocoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "todos" || tipoFilter !== "todos"
                ? "Nenhuma promoção encontrada com os filtros aplicados."
                : "Nenhuma promoção cadastrada. Clique em 'Nova Promoção' para começar."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromocoes.map((promocao) => (
                    <TableRow key={promocao.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promocao.nome}</div>
                          {promocao.descricao && (
                            <div className="text-sm text-muted-foreground">
                              {promocao.descricao.length > 50
                                ? `${promocao.descricao.substring(0, 50)}...`
                                : promocao.descricao}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {promocao.tipoDesconto === "percentual" ? "Percentual" : "Valor fixo"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatarDesconto(promocao)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(promocao.dataInicio), "dd/MM/yyyy", { locale: ptBR })}</div>
                          <div className="text-muted-foreground">
                            até {format(new Date(promocao.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(promocao)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(promocao)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(promocao)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(promocao)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PromocaoDialogs
        dialogOpen={dialogOpen}
        dialogType={dialogType}
        selectedPromocao={selectedPromocao}
        onDialogClose={closeDialog}
        onSubmit={addPromocao}
        onUpdate={updatePromocao}
        onDelete={deletePromocao}
      />
    </>
  );
};

export default PromocoesPage;
