
import React from "react";
import { CrudDialog } from "@/components/CrudDialog";
import { ProdutoForm, ProdutoFormData } from "./ProdutoForm";
import { UseFormReturn } from "react-hook-form";
import { Produto, Fornecedor } from "@/types";

interface ProdutoDialogsProps {
  dialogOpen: boolean;
  dialogType: "add" | "edit" | "delete";
  selectedProduto: Produto | null;
  form: UseFormReturn<ProdutoFormData>;
  fornecedores: Fornecedor[];
  onOpenChange: (open: boolean) => void;
  onAddEditSubmit: (data: ProdutoFormData) => void;
  onDeleteConfirm: () => void;
}

export const ProdutoDialogs: React.FC<ProdutoDialogsProps> = ({
  dialogOpen,
  dialogType,
  selectedProduto,
  form,
  fornecedores,
  onOpenChange,
  onAddEditSubmit,
  onDeleteConfirm,
}) => {
  if (dialogType === "delete") {
    return (
      <CrudDialog
        title="Excluir Produto"
        description={`Tem certeza que deseja excluir o produto ${selectedProduto?.nome}? Esta ação não pode ser desfeita.`}
        open={dialogOpen}
        onOpenChange={onOpenChange}
        onConfirm={onDeleteConfirm}
        type="delete"
      >
        <div className="text-center py-4">
          <p>Todos os dados relacionados a este produto serão perdidos.</p>
        </div>
      </CrudDialog>
    );
  }

  return (
    <CrudDialog
      title={dialogType === "add" ? "Adicionar Produto" : "Editar Produto"}
      description={dialogType === "add" ? "Adicione um novo produto ao catálogo" : "Edite os detalhes do produto"}
      open={dialogOpen}
      onOpenChange={onOpenChange}
      onConfirm={form.handleSubmit(onAddEditSubmit)}
      type={dialogType}
    >
      <ProdutoForm
        form={form}
        onSubmit={onAddEditSubmit}
        fornecedores={fornecedores}
      />
    </CrudDialog>
  );
};
