
import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Venda } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Edit, Trash2, Eye } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";
import { ExportButtons } from "@/components/ExportButtons";
import { CrudDialog } from "@/components/CrudDialog";
import { VendaForm } from "./Vendas/components/VendaForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const vendaSchema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  produtos: z.array(z.object({
    produtoId: z.string(),
    quantidade: z.number().min(1),
    precoUnitario: z.number().min(0)
  })).min(1, "Pelo menos um produto é obrigatório"),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  observacoes: z.string().optional(),
});

type VendaFormData = z.infer<typeof vendaSchema>;

const VendasPage = () => {
  const { filterVendas, addVenda, updateVenda, deleteVenda, vendas } = useData();
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
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);

  const form = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      clienteId: "",
      produtos: [],
      formaPagamento: "",
      observacoes: "",
    },
  });

  const filteredVendas = filterVendas(filterOptions);

  const openAddDialog = () => {
    if (!isSubscribed && vendas.length >= 10) {
      toast.error("Limite atingido! Você pode cadastrar apenas 10 vendas no plano gratuito. Faça upgrade para adicionar mais.");
      return;
    }
    
    form.reset({
      clienteId: "",
      produtos: [],
      formaPagamento: "",
      observacoes: "",
    });
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (venda: Venda) => {
    setSelectedVenda(venda);
    form.reset({
      clienteId: venda.clienteId,
      produtos: venda.produtos,
      formaPagamento: venda.formaPagamento,
      observacoes: venda.observacoes || "",
    });
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (venda: Venda) => {
    setSelectedVenda(venda);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const openViewDialog = (venda: Venda) => {
    setSelectedVenda(venda);
    setDialogType("view");
    setDialogOpen(true);
  };

  const handleAddEditSubmit = (data: VendaFormData) => {
    if (dialogType === "add") {
      const success = addVenda({
        clienteId: data.clienteId,
        produtos: data.produtos,
        formaPagamento: data.formaPagamento,
        observacoes: data.observacoes,
      });
      
      if (!success) {
        return;
      }
    } else if (dialogType === "edit" && selectedVenda) {
      updateVenda(selectedVenda.id, {
        clienteId: data.clienteId,
        produtos: data.produtos,
        formaPagamento: data.formaPagamento,
        observacoes: data.observacoes,
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedVenda) {
      deleteVenda(selectedVenda.id);
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
      cell: (_: any, row: Venda) => (
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
              data={vendas} 
              type="vendas" 
              disabled={vendas.length === 0}
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
          totalItems={vendas.length}
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
          onConfirm={form.handleSubmit(handleAddEditSubmit)}
          type={dialogType}
        >
          <VendaForm form={form} />
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
              {selectedVenda.observacoes && (
                <div>
                  <strong>Observações:</strong> {selectedVenda.observacoes}
                </div>
              )}
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
