import React, { useState } from "react";
import { OptimizedLayout } from "@/components/OptimizedLayout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Fornecedor } from "@/types";
import { Button } from "@/components/ui/button";
import { Truck, Edit, Trash2 } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";
import { useFornecedorForm } from "@/hooks/useFornecedorForm";
import { FornecedorDialogs } from "@/components/fornecedores/FornecedorDialogs";
import { FornecedorFormData } from "@/components/fornecedores/FornecedorForm";
import { ExportButtons } from "@/components/ExportButtons";

const FornecedoresPage = () => {
  const { filterFornecedores, addFornecedor, updateFornecedor, deleteFornecedor, fornecedores } = useData();
  const { isSubscribed } = useSubscription();
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "nome",
    sortOrder: "asc",
    page: 1,
    itemsPerPage: 10
  });

  const {
    form,
    dialogOpen,
    dialogType,
    selectedFornecedor,
    setDialogOpen,
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
  } = useFornecedorForm();

  const filteredFornecedores = filterFornecedores(filterOptions);

  const handleOpenAddDialog = () => {
    if (!isSubscribed && fornecedores.length >= 10) {
      toast.error("Limite atingido! Você pode cadastrar apenas 10 fornecedores no plano gratuito. Faça upgrade para adicionar mais.");
      return;
    }
    openAddDialog();
  };

  const handleAddEditSubmit = (data: FornecedorFormData) => {
    if (dialogType === "add") {
      const success = addFornecedor({
        nome: data.nome,
        contato: data.contato,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        cnpj: data.cnpj,
        prazoEntrega: data.prazoEntrega,
        observacoes: data.observacoes || "",
      });
      
      if (!success) {
        return;
      }
    } else if (dialogType === "edit" && selectedFornecedor) {
      updateFornecedor(selectedFornecedor.id, {
        nome: data.nome,
        contato: data.contato,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        cnpj: data.cnpj,
        prazoEntrega: data.prazoEntrega,
        observacoes: data.observacoes || "",
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedFornecedor) {
      deleteFornecedor(selectedFornecedor.id);
    }
    setDialogOpen(false);
  };

  const columns = [
    { key: "nome", header: "Nome" },
    { key: "contato", header: "Contato" },
    { key: "telefone", header: "Telefone" },
    { key: "email", header: "Email" },
    { key: "cidade", header: "Cidade" },
    { key: "estado", header: "Estado" },
    { key: "prazoEntrega", header: "Prazo de Entrega (dias)" },
    { 
      key: "actions", 
      header: "Ações", 
      cell: (_: any, row: Fornecedor) => (
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
        title="Fornecedores" 
        description="Gerencie seus fornecedores"
        icon={<Truck className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <ExportButtons 
              data={fornecedores} 
              type="fornecedores" 
              disabled={fornecedores.length === 0}
            />
            <Button onClick={handleOpenAddDialog}>Novo Fornecedor</Button>
          </div>
        }
      />

      <div className="mt-6">
        <DataTable
          data={filteredFornecedores}
          columns={columns}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          totalItems={fornecedores.length}
          page={filterOptions.page}
          itemsPerPage={filterOptions.itemsPerPage}
        />
      </div>

      <FornecedorDialogs
        dialogOpen={dialogOpen}
        dialogType={dialogType}
        selectedFornecedor={selectedFornecedor}
        form={form}
        onOpenChange={setDialogOpen}
        onAddEditSubmit={handleAddEditSubmit}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </OptimizedLayout>
  );
};

export default FornecedoresPage;
