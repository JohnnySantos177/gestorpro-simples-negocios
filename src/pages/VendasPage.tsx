
import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useData } from "@/context/DataContext";
import { FilterOptions } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";
import { ExportButtons } from "@/components/ExportButtons";
import { CrudDialog } from "@/components/CrudDialog";
import { VendaForm } from "./Vendas/components/VendaForm";
import { VendasFilters } from "./Vendas/components/VendasFilters";
import { VendasTable } from "./Vendas/components/VendasTable";
import { VendaViewDialog } from "./Vendas/components/VendaViewDialog";
import { VendaDeleteDialog } from "./Vendas/components/VendaDeleteDialog";
import { useVendasDialogs } from "./Vendas/hooks/useVendasDialogs";

const VendasPage = () => {
  const { filterCompras, deleteCompra, compras } = useData();
  const { isSubscribed } = useSubscription();
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    formaPagamento: ""
  });

  const {
    dialogOpen,
    dialogType,
    selectedVenda,
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
    openViewDialog,
    closeDialog,
    setDialogOpen,
  } = useVendasDialogs();

  const filteredVendas = filterCompras(filterOptions);

  const handleAddDialog = () => {
    if (!isSubscribed && compras.length >= 10) {
      toast.error("Limite atingido! Você pode cadastrar apenas 10 vendas no plano gratuito. Faça upgrade para adicionar mais.");
      return;
    }
    openAddDialog();
  };

  const handleDeleteConfirm = () => {
    if (selectedVenda) {
      deleteCompra(selectedVenda.id);
    }
    closeDialog();
  };

  return (
    <>
      <PageHeader 
        title="Vendas" 
        description="Gerencie suas vendas"
        icon={<ShoppingCart className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <ExportButtons 
              data={compras} 
              type="vendas" 
              disabled={compras.length === 0}
            />
            <Button onClick={handleAddDialog}>Nova Venda</Button>
          </div>
        }
      />

      <div className="mt-6">
        <VendasFilters 
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
        />
        
        <VendasTable
          data={filteredVendas}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          totalItems={compras.length}
          onView={openViewDialog}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      </div>

      {dialogType !== "delete" && dialogType !== "view" ? (
        <CrudDialog
          title={dialogType === "add" ? "Nova Venda" : "Editar Venda"}
          description={dialogType === "add" ? "Adicione uma nova venda" : "Edite os detalhes da venda"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={() => {}} // VendaForm handles the submission internally
          type={dialogType}
        >
          <VendaForm 
            compra={selectedVenda} 
            onClose={closeDialog}
            readOnly={false}
          />
        </CrudDialog>
      ) : dialogType === "view" ? (
        <VendaViewDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          venda={selectedVenda}
        />
      ) : (
        <VendaDeleteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default VendasPage;
