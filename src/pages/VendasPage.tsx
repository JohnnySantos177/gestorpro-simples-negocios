
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Compra } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Edit, Trash2, Eye } from "lucide-react";
import { CrudDialog } from "@/components/CrudDialog";
import { VendaForm } from "./Vendas/components/VendaForm";
import { useVendasLimits } from "@/hooks/useVendasLimits";
import { VendasLimitBanner } from "@/components/VendasLimitBanner";
import { toast } from "sonner";

const VendasPage = () => {
  const { filterCompras, deleteCompra, compras } = useData();
  const { hasReachedLimit } = useVendasLimits();
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);

  const filteredCompras = filterCompras(filterOptions);

  const openAddDialog = () => {
    if (hasReachedLimit) {
      toast.error("Limite de teste atingido! Assine um plano premium para continuar adicionando vendas.");
      return;
    }
    
    setDialogType("add");
    setSelectedCompra(null);
    setDialogOpen(true);
  };

  const openEditDialog = (compra: Compra) => {
    setSelectedCompra(compra);
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (compra: Compra) => {
    setSelectedCompra(compra);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const openViewDialog = (compra: Compra) => {
    setSelectedCompra(compra);
    setDialogType("edit"); // Use "edit" type but with readOnly prop
    setDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCompra) {
      deleteCompra(selectedCompra.id);
    }
    setDialogOpen(false);
  };

  const columns = [
    { key: "data", header: "Data", cell: (value: string) => new Date(value).toLocaleDateString() },
    { key: "clienteNome", header: "Cliente" },
    { 
      key: "valorTotal", 
      header: "Valor Total", 
      cell: (value: number) => `R$ ${value.toFixed(2)}` 
    },
    { key: "formaPagamento", header: "Forma de Pagamento" },
    { key: "status", header: "Status" },
    { 
      key: "actions", 
      header: "Ações", 
      cell: (_: any, row: Compra) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => openViewDialog(row)}>
            <Eye className="h-4 w-4" />
          </Button>
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
        title="Vendas" 
        description="Gerencie suas vendas"
        icon={<ShoppingCart className="h-6 w-6" />}
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        }
      />

      <VendasLimitBanner />

      <div className="mt-6">
        <DataTable
          data={filteredCompras}
          columns={columns}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          totalItems={compras.length}
          page={filterOptions.page}
          itemsPerPage={filterOptions.itemsPerPage}
        />
      </div>

      {/* Add/Edit/View Dialog */}
      {dialogType !== "delete" ? (
        <CrudDialog
          title={
            dialogType === "add" 
              ? "Nova Venda" 
              : "Editar Venda"
          }
          description={
            dialogType === "add" 
              ? "Registre uma nova venda"
              : "Edite os detalhes da venda"
          }
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={() => {}}
          type={dialogType}
        >
          <VendaForm 
            compra={selectedCompra}
            onClose={() => setDialogOpen(false)}
            readOnly={false}
          />
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
