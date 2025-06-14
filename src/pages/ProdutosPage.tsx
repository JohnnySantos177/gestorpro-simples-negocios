
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Produto } from "@/types";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_PRODUTOS } from "@/data/constants";
import { Package, Edit, Trash2 } from "lucide-react";
import { ProdutoDialogs } from "@/components/produtos/ProdutoDialogs";
import { useProdutoForm } from "@/hooks/useProdutoForm";

const ProdutosPage = () => {
  const { filterProdutos, fornecedores } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "nome",
    sortOrder: "asc",
    page: 1,
    itemsPerPage: 10,
    categoria: "Todas"
  });

  const form = useProdutoForm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const openAddDialog = () => {
    setDialogType('add');
    setSelectedProduto(null);
    form.reset();
    setDialogOpen(true);
  };

  const openEditDialog = (produto: Produto) => {
    setDialogType('edit');
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
    setDialogOpen(true);
  };

  const openDeleteDialog = (produto: Produto) => {
    setDialogType('delete');
    setSelectedProduto(produto);
    setDialogOpen(true);
  };

  const handleAddEditSubmit = async (data: any) => {
    // Handle form submission logic here
    console.log('Form submitted:', data);
    setDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    // Handle delete logic here
    console.log('Delete confirmed');
    setDialogOpen(false);
  };

  const produtos = filterProdutos(filterOptions);

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

      <ProdutoDialogs
        dialogOpen={dialogOpen}
        dialogType={dialogType}
        selectedProduto={selectedProduto}
        form={form}
        fornecedores={fornecedores}
        onOpenChange={setDialogOpen}
        onAddEditSubmit={handleAddEditSubmit}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </Layout>
  );
};

export default ProdutosPage;
