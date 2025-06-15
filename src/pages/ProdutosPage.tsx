import React, { useState, useEffect } from "react";
import { OptimizedLayout } from "@/components/OptimizedLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Produto } from "@/types";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_PRODUTOS } from "@/data/constants";
import { Package, Edit, Trash2, RefreshCw } from "lucide-react";
import { ProdutoDialogs } from "@/components/produtos/ProdutoDialogs";
import { useProdutoForm, ProdutoFormData } from "@/hooks/useProdutoForm";
import { ExportButtons } from "@/components/ExportButtons";

const ProdutosPage = () => {
  const { filterProdutos, fornecedores, addProduto, updateProduto, deleteProduto, refreshData, loading } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "nome",
    sortOrder: "asc",
    page: 1,
    itemsPerPage: 10,
    categoria: "Todas"
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const form = useProdutoForm();

  // Atualizar dados automaticamente a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

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
      descricao: produto.descricao || "",
      categoria: produto.categoria,
      precoCompra: produto.precoCompra,
      precoVenda: produto.precoVenda,
      quantidade: produto.quantidade,
      fornecedorId: produto.fornecedorId || "",
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (produto: Produto) => {
    setDialogType('delete');
    setSelectedProduto(produto);
    setDialogOpen(true);
  };

  const handleAddEditSubmit = async (data: ProdutoFormData) => {
    console.log('Form submitted:', data);
    
    // Buscar nome do fornecedor se fornecedorId estiver definido
    const fornecedorNome = data.fornecedorId && data.fornecedorId !== "sem-fornecedor"
      ? fornecedores.find(f => f.id === data.fornecedorId)?.nome || ""
      : "";

    // Prepare the complete product data with all required fields
    const produtoData = {
      nome: data.nome,
      descricao: data.descricao,
      categoria: data.categoria,
      precoCompra: data.precoCompra,
      precoVenda: data.precoVenda,
      quantidade: data.quantidade,
      fornecedorId: data.fornecedorId === "sem-fornecedor" ? "" : data.fornecedorId,
      fornecedorNome
    };

    if (dialogType === 'add') {
      const success = await addProduto(produtoData);
      if (success) {
        setDialogOpen(false);
      }
    } else if (dialogType === 'edit' && selectedProduto) {
      await updateProduto(selectedProduto.id, produtoData);
      setDialogOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedProduto) {
      await deleteProduto(selectedProduto.id);
      setDialogOpen(false);
    }
  };

  const produtos = filterProdutos(filterOptions);

  const columns = [
    { key: "nome", header: "Nome" },
    { key: "categoria", header: "Categoria" },
    { key: "precoVenda", header: "Preço", cell: (value: number) => `R$ ${value.toFixed(2)}` },
    { 
      key: "quantidade", 
      header: "Estoque", 
      cell: (value: number) => (
        <span className={value <= 10 ? "text-red-500 font-semibold" : "text-green-600"}>
          {value}
        </span>
      )
    },
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
    <OptimizedLayout>
      <PageHeader 
        title="Produtos" 
        description="Gerencie seu catálogo de produtos"
        icon={<Package className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <ExportButtons 
              data={produtos} 
              type="produtos" 
              disabled={produtos.length === 0}
            />
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={openAddDialog}>Novo Produto</Button>
          </div>
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
    </OptimizedLayout>
  );
};

export default ProdutosPage;
