
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Transacao } from "@/types";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_FINANCEIRAS } from "@/data/constants";
import { DollarSign, Edit, Trash2 } from "lucide-react";
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

const transacaoSchema = z.object({
  tipo: z.enum(['entrada', 'saida']),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.coerce.number().positive("Valor deve ser maior que 0"),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  data: z.string().min(1, "Data é obrigatória"),
});

type TransacaoFormData = z.infer<typeof transacaoSchema>;

const FinanceiroPage = () => {
  const { filterTransacoes, addTransacao, updateTransacao, deleteTransacao } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    tipo: "",
    categoria: ""
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
  const [selectedTransacao, setSelectedTransacao] = useState<Transacao | null>(null);
  const [transacaoTipo, setTransacaoTipo] = useState<'entrada' | 'saida'>('entrada');

  const form = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
    defaultValues: {
      tipo: 'entrada',
      categoria: "",
      descricao: "",
      valor: 0,
      formaPagamento: "",
      data: new Date().toISOString().substring(0, 10),
    },
  });

  const transacoes = filterTransacoes(filterOptions);

  const openAddDialog = (tipo: 'entrada' | 'saida') => {
    setTransacaoTipo(tipo);
    form.reset({
      tipo: tipo,
      categoria: "",
      descricao: "",
      valor: 0,
      formaPagamento: "",
      data: new Date().toISOString().substring(0, 10),
    });
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (transacao: Transacao) => {
    setSelectedTransacao(transacao);
    form.reset({
      tipo: transacao.tipo,
      categoria: transacao.categoria,
      descricao: transacao.descricao,
      valor: transacao.valor,
      formaPagamento: transacao.formaPagamento,
      data: new Date(transacao.data).toISOString().substring(0, 10),
    });
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (transacao: Transacao) => {
    setSelectedTransacao(transacao);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const handleAddEditSubmit = (data: TransacaoFormData) => {
    if (dialogType === "add") {
      addTransacao({
        tipo: data.tipo,
        categoria: data.categoria,
        descricao: data.descricao,
        valor: data.valor,
        formaPagamento: data.formaPagamento,
        data: data.data
      });
    } else if (dialogType === "edit" && selectedTransacao) {
      updateTransacao(selectedTransacao.id, {
        tipo: data.tipo,
        categoria: data.categoria,
        descricao: data.descricao,
        valor: data.valor,
        formaPagamento: data.formaPagamento,
        data: data.data
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedTransacao) {
      deleteTransacao(selectedTransacao.id);
    }
    setDialogOpen(false);
  };

  const columns = [
    { key: "data", header: "Data", cell: (value: string) => new Date(value).toLocaleDateString() },
    { 
      key: "tipo", 
      header: "Tipo", 
      cell: (value: string) => (
        <span className={value === 'entrada' ? 'text-green-600' : 'text-red-600'}>
          {value === 'entrada' ? 'Entrada' : 'Saída'}
        </span>
      )
    },
    { key: "categoria", header: "Categoria" },
    { key: "descricao", header: "Descrição" },
    { 
      key: "valor", 
      header: "Valor", 
      cell: (value: number) => `R$ ${value.toFixed(2)}` 
    },
    { 
      key: "actions", 
      header: "Ações", 
      cell: (_: any, row: Transacao) => (
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
        title="Financeiro" 
        description="Gerencie suas finanças"
        icon={<DollarSign className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openAddDialog('entrada')}>Nova Entrada</Button>
            <Button onClick={() => openAddDialog('saida')}>Nova Saída</Button>
          </div>
        }
      />

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.tipo === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, tipo: "", page: 1 })}
          >
            Todos
          </Button>
          <Button
            variant={filterOptions.tipo === "entrada" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, tipo: "entrada", page: 1 })}
          >
            Entradas
          </Button>
          <Button
            variant={filterOptions.tipo === "saida" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, tipo: "saida", page: 1 })}
          >
            Saídas
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.categoria === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, categoria: "", page: 1 })}
          >
            Todas Categorias
          </Button>
          {CATEGORIAS_FINANCEIRAS.map((categoria) => (
            <Button
              key={categoria}
              variant={filterOptions.categoria === categoria ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterOptions({ ...filterOptions, categoria, page: 1 })}
            >
              {categoria}
            </Button>
          ))}
        </div>
        
        <DataTable
          data={transacoes}
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
          title={
            dialogType === "add" 
              ? transacaoTipo === 'entrada' 
                ? "Registrar Entrada" 
                : "Registrar Saída"
              : "Editar Transação"
          }
          description={
            dialogType === "add" 
              ? transacaoTipo === 'entrada'
                ? "Registre uma nova entrada financeira"
                : "Registre uma nova saída financeira"
              : "Edite os detalhes da transação"
          }
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={form.handleSubmit(handleAddEditSubmit)}
          type={dialogType}
        >
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleAddEditSubmit)}>
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
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
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIAS_FINANCEIRAS.map((categoria) => (
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
              
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descreva a transação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="formaPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                        <SelectItem value="Transferência">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CrudDialog>
      ) : (
        <CrudDialog
          title="Excluir Transação"
          description={`Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.`}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleDeleteConfirm}
          type="delete"
        >
          <div className="text-center py-4">
            <p>Todos os dados relacionados a esta transação serão perdidos.</p>
          </div>
        </CrudDialog>
      )}
    </Layout>
  );
};

export default FinanceiroPage;
