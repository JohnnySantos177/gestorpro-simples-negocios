import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Compra, Cliente, Produto } from "@/types";
import { Button } from "@/components/ui/button";
import { STATUS_PEDIDO } from "@/data/constants";
import { ShoppingCart, Edit, Trash2, Plus } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { vendasColumns } from "./Vendas/columns";
import { VendaProdutosForm } from "./Vendas/components/VendaProdutosForm";

const vendaSchema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  status: z.string().min(1, "Status é obrigatório"),
});

type VendaFormData = z.infer<typeof vendaSchema>;

const produtoVendaSchema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  quantidade: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
});

const VendasPage = () => {
  const { filterCompras, addCompra, updateCompra, deleteCompra, clientes, produtos } = useData();
  const { user } = useAuth();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    status: ""
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [itensPedido, setItensPedido] = useState<{
    produtoId: string;
    produtoNome: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }[]>([]);
  const [novoProdutoOpen, setNovoProdutoOpen] = useState(false);

  const vendas = filterCompras(filterOptions);

  const produtoForm = useForm<z.infer<typeof produtoVendaSchema>>({
    resolver: zodResolver(produtoVendaSchema),
    defaultValues: {
      produtoId: "",
      quantidade: 1
    }
  });

  const form = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      clienteId: "",
      formaPagamento: "",
      status: "Pendente",
    },
  });

  const openAddDialog = () => {
    form.reset({
      clienteId: "",
      formaPagamento: "",
      status: "Pendente",
    });
    setItensPedido([]);
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (compra: Compra) => {
    setSelectedCompra(compra);
    form.reset({
      clienteId: compra.clienteId,
      formaPagamento: compra.formaPagamento,
      status: compra.status,
    });
    setItensPedido([...compra.produtos]);
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (compra: Compra) => {
    setSelectedCompra(compra);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const handleAddProduto = (data: z.infer<typeof produtoVendaSchema>) => {
    const produto = produtos.find(p => p.id === data.produtoId);
    
    if (produto) {
      const novoItem = {
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: data.quantidade,
        precoUnitario: produto.precoVenda,
        subtotal: produto.precoVenda * data.quantidade
      };
      
      setItensPedido([...itensPedido, novoItem]);
      setNovoProdutoOpen(false);
      produtoForm.reset();
    }
  };

  const removerProduto = (index: number) => {
    const novosItens = [...itensPedido];
    novosItens.splice(index, 1);
    setItensPedido(novosItens);
  };

  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleAddEditSubmit = (data: VendaFormData) => {
    if (itensPedido.length === 0) {
      return; // Não pode salvar sem produtos
    }
    
    const cliente = clientes.find(c => c.id === data.clienteId);

    if (dialogType === "add") {
      if (!user?.id) {
        // Por segurança, não permitir salvar sem usuário autenticado
        return;
      }
      addCompra({
        clienteId: data.clienteId,
        clienteNome: cliente?.nome || "",
        data: new Date().toISOString(),
        produtos: itensPedido,
        valorTotal: calcularTotal(),
        formaPagamento: data.formaPagamento,
        status: data.status
      });
    } else if (dialogType === "edit" && selectedCompra) {
      if (!user?.id) return;
      updateCompra(selectedCompra.id, {
        clienteId: data.clienteId,
        clienteNome: cliente?.nome || "",
        produtos: itensPedido,
        valorTotal: calcularTotal(),
        formaPagamento: data.formaPagamento,
        status: data.status
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedCompra) {
      deleteCompra(selectedCompra.id);
    }
    setDialogOpen(false);
  };

  const columns = vendasColumns(openEditDialog, openDeleteDialog);

  return (
    <Layout>
      <PageHeader 
        title="Vendas" 
        description="Acompanhe as vendas realizadas"
        icon={<ShoppingCart className="h-6 w-6" />}
        actions={
          <Button onClick={openAddDialog}>Nova Venda</Button>
        }
      />

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.status === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, status: "", page: 1 })}
          >
            Todos
          </Button>
          {STATUS_PEDIDO.map((status) => (
            <Button
              key={status}
              variant={filterOptions.status === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterOptions({ ...filterOptions, status, page: 1 })}
            >
              {status}
            </Button>
          ))}
        </div>
        
        <DataTable
          data={vendas}
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
          title={dialogType === "add" ? "Registrar Venda" : "Editar Venda"}
          description={dialogType === "add" ? "Registre uma nova venda" : "Edite os detalhes da venda"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={form.handleSubmit(handleAddEditSubmit)}
          type={dialogType}
        >
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleAddEditSubmit)}>
              <FormField
                control={form.control}
                name="clienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_PEDIDO.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <VendaProdutosForm
                itensPedido={itensPedido}
                setItensPedido={setItensPedido}
                produtos={produtos}
                novoProdutoOpen={novoProdutoOpen}
                setNovoProdutoOpen={setNovoProdutoOpen}
                produtoForm={produtoForm}
                handleAddProduto={handleAddProduto}
                removerProduto={removerProduto}
                calcularTotal={calcularTotal}
              />

            </form>
          </Form>
        </CrudDialog>
      ) : (
        <CrudDialog
          title="Excluir Venda"
          description={`Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.`}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleDeleteConfirm}
          type="delete"
        >
          <div className="text-center py-4">
            <p>Todos os dados relacionados a esta venda serão perdidos.</p>
          </div>
        </CrudDialog>
      )}
    </Layout>
  );
};

export default VendasPage;
