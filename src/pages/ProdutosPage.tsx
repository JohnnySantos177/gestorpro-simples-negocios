
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Produto } from "@/types";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_PRODUTOS } from "@/data/constants";
import { Package, Edit, Trash2 } from "lucide-react";
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

const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  precoCompra: z.coerce.number().min(0, "Preço de compra deve ser maior que 0"),
  precoVenda: z.coerce.number().min(0, "Preço de venda deve ser maior que 0"),
  quantidade: z.coerce.number().min(0, "Quantidade deve ser maior que 0"),
  fornecedorId: z.string().min(1, "Fornecedor é obrigatório"),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

const ProdutosPage = () => {
  const { filterProdutos, addProduto, updateProduto, deleteProduto, fornecedores } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "nome",
    sortOrder: "asc",
    page: 1,
    itemsPerPage: 10,
    categoria: "Todas"
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      categoria: "",
      precoCompra: 0,
      precoVenda: 0,
      quantidade: 0,
      fornecedorId: "",
    },
  });

  const produtos = filterProdutos(filterOptions);

  const openAddDialog = () => {
    form.reset({
      nome: "",
      descricao: "",
      categoria: "",
      precoCompra: 0,
      precoVenda: 0,
      quantidade: 0,
      fornecedorId: "",
    });
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (produto: Produto) => {
    setSelectedProduto(produto);
    form.reset({
      nome: produto.nome,
      descricao: produto.descricao,
      categoria: produto.categoria,
      precoCompra: produto.precoCompra,
      precoVenda: produto.precoVenda,
      quantidade: produto.quantidade,
      fornecedorId: produto.fornecedorId,
    });
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (produto: Produto) => {
    setSelectedProduto(produto);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const handleAddEditSubmit = (data: ProdutoFormData) => {
    const fornecedor = fornecedores.find((f) => f.id === data.fornecedorId);
    
    if (dialogType === "add") {
      addProduto({
        ...data,
        fornecedorNome: fornecedor?.nome || "",
      });
    } else if (dialogType === "edit" && selectedProduto) {
      updateProduto(selectedProduto.id, {
        ...data,
        fornecedorNome: fornecedor?.nome || "",
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedProduto) {
      deleteProduto(selectedProduto.id);
    }
    setDialogOpen(false);
  };

  const columns = [
    { key: "nome", header: "Nome" },
    { key: "categoria", header: "Categoria" },
    { key: "precoVenda", header: "Preço", cell: (value: number) => `R$ ${value.toFixed(2)}` },
    { key: "quantidade", header: "Estoque" },
    { key: "fornecedorNome", header: "Fornecedor" },
    { 
      key: "actions", 
      header: "Ações", 
      cell: (_: any, row: Produto) => (
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
        title="Produtos" 
        description="Gerencie seu catálogo de produtos"
        icon={<Package className="h-6 w-6" />}
        actions={
          <Button onClick={openAddDialog}>Novo Produto</Button>
        }
      />

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIAS_PRODUTOS.map((categoria) => (
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
          data={produtos}
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
          title={dialogType === "add" ? "Adicionar Produto" : "Editar Produto"}
          description={dialogType === "add" ? "Adicione um novo produto ao catálogo" : "Edite os detalhes do produto"}
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
                      <Input placeholder="Nome do produto" {...field} />
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
                      <Input placeholder="Descrição do produto" {...field} />
                    </FormControl>
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
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="precoCompra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Compra</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="precoVenda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade em Estoque</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fornecedorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fornecedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>
                            {fornecedor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CrudDialog>
      ) : (
        <CrudDialog
          title="Excluir Produto"
          description={`Tem certeza que deseja excluir o produto ${selectedProduto?.nome}? Esta ação não pode ser desfeita.`}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleDeleteConfirm}
          type="delete"
        >
          <div className="text-center py-4">
            <p>Todos os dados relacionados a este produto serão perdidos.</p>
          </div>
        </CrudDialog>
      )}
    </Layout>
  );
};

export default ProdutosPage;
