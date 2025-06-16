
import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Compra } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Edit, Trash2, Eye } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";
import { ExportButtons } from "@/components/ExportButtons";
import { CrudDialog } from "@/components/CrudDialog";
import { VendaForm } from "./Vendas/components/VendaForm";

const VendasPage = () => {
  const { filterCompras, addCompra, updateCompra, deleteCompra, compras } = useData();
  const { isSubscribed } = useSubscription();
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    formaPagamento: ""
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete" | "view">("add");
  const [selectedVenda, setSelectedVenda] = useState<Compra | null>(null);

  const filteredVendas = filterCompras(filterOptions);

  const openAddDialog = () => {
    if (!isSubscribed && compras.length >= 10) {
      toast.error("Limite atingido! Você pode cadastrar apenas 10 vendas no plano gratuito. Faça upgrade para adicionar mais.");
      return;
    }
    
    setSelectedVenda(null);
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (venda: Compra) => {
    setSelectedVenda(venda);
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (venda: Compra) => {
    setSelectedVenda(venda);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const openViewDialog = (venda: Compra) => {
    setSelectedVenda(venda);
    setDialogType("view");
    setDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedVenda) {
      deleteCompra(selectedVenda.id);
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
            <Button onClick={openAddDialog}>Nova Venda</Button>
          </div>
        }
      />

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.formaPagamento === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, formaPagamento: "", page: 1 })}
          >
            Todas
          </Button>
          <Button
            variant={filterOptions.formaPagamento === "Dinheiro" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, formaPagamento: "Dinheiro", page: 1 })}
          >
            Dinheiro
          </Button>
          <Button
            variant={filterOptions.formaPagamento === "Cartão de Crédito" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, formaPagamento: "Cartão de Crédito", page: 1 })}
          >
            Cartão de Crédito
          </Button>
          <Button
            variant={filterOptions.formaPagamento === "PIX" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, formaPagamento: "PIX", page: 1 })}
          >
            PIX
          </Button>
        </div>
        
        <DataTable
          data={filteredVendas}
          columns={columns}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          totalItems={compras.length}
          page={filterOptions.page}
          itemsPerPage={filterOptions.itemsPerPage}
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
            onClose={() => setDialogOpen(false)}
            readOnly={false}
          />
        </CrudDialog>
      ) : dialogType === "view" ? (
        <CrudDialog
          title="Detalhes da Venda"
          description="Visualize os detalhes da venda"
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={() => setDialogOpen(false)}
          type="edit"
        >
          {selectedVenda && (
            <div className="space-y-4">
              <div>
                <strong>Cliente:</strong> {selectedVenda.clienteNome}
              </div>
              <div>
                <strong>Data:</strong> {new Date(selectedVenda.data).toLocaleDateString()}
              </div>
              <div>
                <strong>Valor Total:</strong> R$ {selectedVenda.valorTotal.toFixed(2)}
              </div>
              <div>
                <strong>Forma de Pagamento:</strong> {selectedVenda.formaPagamento}
              </div>
              <div>
                <strong>Produtos:</strong>
                <ul className="mt-2 space-y-1">
                  {selectedVenda.produtos.map((produto, index) => (
                    <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {produto.produtoNome} - Qtd: {produto.quantidade} - R$ {produto.precoUnitario.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CrudDialog>
      ) : (
        <CrudDialog
          title="Excluir Venda"
          description="Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita."
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleDeleteConfirm}
          type="delete"
        >
          <div className="py-4">
            <p>Esta venda será removida permanentemente do sistema.</p>
          </div>
        </CrudDialog>
      )}
    </>
  );
};

export default VendasPage;
