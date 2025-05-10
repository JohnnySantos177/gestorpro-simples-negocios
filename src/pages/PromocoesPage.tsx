
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Promocao, Produto } from "@/types";
import { Button } from "@/components/ui/button";
import { BadgePercent, Edit, Trash2 } from "lucide-react";
import { CrudDialog } from "@/components/CrudDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CATEGORIAS_PRODUTOS } from "@/data/constants";

const promocaoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  tipoDesconto: z.enum(["percentual", "valor"], {
    required_error: "Tipo de desconto é obrigatório",
  }),
  valorDesconto: z.coerce.number().positive("Valor deve ser maior que 0"),
  aplicacao: z.enum(["geral", "categoria", "produto"], {
    required_error: "Tipo de aplicação é obrigatório",
  }),
  categoriaId: z.string().optional(),
  produtoId: z.string().optional(),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de término é obrigatória"),
  ativo: z.boolean().default(true),
}).refine(data => {
  if (data.aplicacao === "categoria" && !data.categoriaId) {
    return false;
  }
  if (data.aplicacao === "produto" && !data.produtoId) {
    return false;
  }
  return true;
}, {
  message: "Selecione uma categoria ou produto dependendo do tipo de aplicação",
  path: ["aplicacao"],
});

type PromocaoFormData = z.infer<typeof promocaoSchema>;

const PromocoesPage = () => {
  const { promocoes, produtos, addPromocao, updatePromocao, deletePromocao } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "dataInicio",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    ativo: ""
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
  const [selectedPromocao, setSelectedPromocao] = useState<Promocao | null>(null);

  const form = useForm<PromocaoFormData>({
    resolver: zodResolver(promocaoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      tipoDesconto: "percentual",
      valorDesconto: 0,
      aplicacao: "geral",
      dataInicio: new Date().toISOString().substring(0, 10),
      dataFim: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().substring(0, 10),
      ativo: true,
    },
  });

  const aplicacaoValue = form.watch("aplicacao");
  const tipoDesconto = form.watch("tipoDesconto");

  // Filtragem básica para promoções
  const filteredPromocoes = () => {
    let result = [...promocoes];
    
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      result = result.filter(
        promocao => 
          promocao.nome.toLowerCase().includes(searchLower) ||
          promocao.descricao.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterOptions.ativo === "ativo") {
      result = result.filter(promocao => promocao.ativo);
    } else if (filterOptions.ativo === "inativo") {
      result = result.filter(promocao => !promocao.ativo);
    }
    
    // Ordenação
    result.sort((a, b) => {
      if (filterOptions.sortBy === "dataInicio" || filterOptions.sortBy === "dataFim") {
        return filterOptions.sortOrder === 'asc'
          ? new Date(a[filterOptions.sortBy as keyof Promocao] as string).getTime() - new Date(b[filterOptions.sortBy as keyof Promocao] as string).getTime()
          : new Date(b[filterOptions.sortBy as keyof Promocao] as string).getTime() - new Date(a[filterOptions.sortBy as keyof Promocao] as string).getTime();
      } else {
        const aValue = a[filterOptions.sortBy as keyof Promocao];
        const bValue = b[filterOptions.sortBy as keyof Promocao];
        if (filterOptions.sortOrder === 'asc') {
          return String(aValue).localeCompare(String(bValue));
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      }
    });
    
    // Paginação
    const startIndex = (filterOptions.page - 1) * filterOptions.itemsPerPage;
    return result.slice(startIndex, startIndex + filterOptions.itemsPerPage);
  };

  const openAddDialog = () => {
    form.reset({
      nome: "",
      descricao: "",
      tipoDesconto: "percentual",
      valorDesconto: 0,
      aplicacao: "geral",
      dataInicio: new Date().toISOString().substring(0, 10),
      dataFim: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().substring(0, 10),
      ativo: true,
    });
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (promocao: Promocao) => {
    setSelectedPromocao(promocao);
    form.reset({
      nome: promocao.nome,
      descricao: promocao.descricao,
      tipoDesconto: promocao.tipoDesconto,
      valorDesconto: promocao.valorDesconto,
      aplicacao: promocao.produtoId ? "produto" : promocao.categoriaId ? "categoria" : "geral",
      categoriaId: promocao.categoriaId || undefined,
      produtoId: promocao.produtoId || undefined,
      dataInicio: new Date(promocao.dataInicio).toISOString().substring(0, 10),
      dataFim: new Date(promocao.dataFim).toISOString().substring(0, 10),
      ativo: promocao.ativo,
    });
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (promocao: Promocao) => {
    setSelectedPromocao(promocao);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const handleAddEditSubmit = (data: PromocaoFormData) => {
    const promocaoData = {
      nome: data.nome,
      descricao: data.descricao,
      tipoDesconto: data.tipoDesconto,
      valorDesconto: data.valorDesconto,
      produtoId: data.aplicacao === "produto" ? data.produtoId : undefined,
      categoriaId: data.aplicacao === "categoria" ? data.categoriaId : undefined,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      ativo: data.ativo,
    };
    
    if (dialogType === "add") {
      addPromocao(promocaoData);
    } else if (dialogType === "edit" && selectedPromocao) {
      updatePromocao(selectedPromocao.id, promocaoData);
    }
    
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedPromocao) {
      deletePromocao(selectedPromocao.id);
    }
    setDialogOpen(false);
  };

  const columns = [
    { key: "nome", header: "Nome" },
    { 
      key: "tipoDesconto", 
      header: "Tipo", 
      cell: (value: string) => value === 'percentual' ? 'Percentual' : 'Valor Fixo' 
    },
    { 
      key: "valorDesconto", 
      header: "Desconto", 
      cell: (value: number, row: Promocao) => 
        row.tipoDesconto === 'percentual' ? `${value}%` : `R$ ${value.toFixed(2)}` 
    },
    { 
      key: "dataInicio", 
      header: "Início", 
      cell: (value: string) => new Date(value).toLocaleDateString() 
    },
    { 
      key: "dataFim", 
      header: "Término", 
      cell: (value: string) => new Date(value).toLocaleDateString() 
    },
    { 
      key: "ativo", 
      header: "Status", 
      cell: (value: boolean) => (
        <span className={value ? 'text-green-600' : 'text-red-600'}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    { 
      key: "actions", 
      header: "Ações", 
      cell: (_: any, row: Promocao) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Promoções" 
        description="Gerencie suas promoções e descontos"
        icon={<BadgePercent className="h-6 w-6" />}
        actions={
          <Button onClick={openAddDialog}>Nova Promoção</Button>
        }
      />

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.ativo === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, ativo: "", page: 1 })}
          >
            Todas
          </Button>
          <Button
            variant={filterOptions.ativo === "ativo" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, ativo: "ativo", page: 1 })}
          >
            Ativas
          </Button>
          <Button
            variant={filterOptions.ativo === "inativo" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, ativo: "inativo", page: 1 })}
          >
            Inativas
          </Button>
        </div>
        
        <DataTable
          data={filteredPromocoes()}
          columns={columns}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          totalItems={0}
          page={filterOptions.page}
          itemsPerPage={filterOptions.itemsPerPage}
        />
      </div>

      {/* Add/Edit Dialog */}
      {dialogType !== "delete" ? (
        <CrudDialog
          title={dialogType === "add" ? "Criar Promoção" : "Editar Promoção"}
          description={dialogType === "add" ? "Adicione uma nova promoção" : "Edite os detalhes da promoção"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={form.handleSubmit(handleAddEditSubmit)}
          type={dialogType}
        >
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleAddEditSubmit)}>
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da promoção" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição da promoção" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoDesconto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Desconto</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentual">Percentual (%)</SelectItem>
                          <SelectItem value="valor">Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valorDesconto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {tipoDesconto === "percentual" ? "Percentual (%)" : "Valor (R$)"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step={tipoDesconto === "percentual" ? "1" : "0.01"} 
                          min="0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="aplicacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aplicar a</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione onde aplicar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="geral">Todos os Produtos</SelectItem>
                        <SelectItem value="categoria">Categoria Específica</SelectItem>
                        <SelectItem value="produto">Produto Específico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {aplicacaoValue === "categoria" && (
                <FormField
                  control={form.control}
                  name="categoriaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIAS_PRODUTOS.filter(cat => cat !== "Todas").map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {aplicacaoValue === "produto" && (
                <FormField
                  control={form.control}
                  name="produtoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {produtos.map((produto) => (
                            <SelectItem key={produto.id} value={produto.id}>
                              {produto.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dataFim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Término</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        A promoção está ativa e será aplicada automaticamente
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CrudDialog>
      ) : (
        <CrudDialog
          title="Excluir Promoção"
          description={`Tem certeza que deseja excluir a promoção "${selectedPromocao?.nome}"? Esta ação não pode ser desfeita.`}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleDeleteConfirm}
          type="delete"
        >
          <div className="text-center py-4">
            <p>Todos os dados relacionados a esta promoção serão perdidos.</p>
          </div>
        </CrudDialog>
      )}
    </Layout>
  );
};

export default PromocoesPage;
