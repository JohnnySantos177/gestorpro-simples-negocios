
import React from "react";
import { CrudDialog } from "@/components/CrudDialog";
import { FornecedorForm, FornecedorFormData } from "./FornecedorForm";
import { Fornecedor } from "@/types";
import { UseFormReturn } from "react-hook-form";

interface FornecedorDialogsProps {
  dialogOpen: boolean;
  dialogType: "add" | "edit" | "delete";
  selectedFornecedor: Fornecedor | null;
  form: UseFormReturn<FornecedorFormData>;
  onOpenChange: (open: boolean) => void;
  onAddEditSubmit: (data: FornecedorFormData) => void;
  onDeleteConfirm: () => void;
}

export const FornecedorDialogs: React.FC<FornecedorDialogsProps> = ({
  dialogOpen,
  dialogType,
  selectedFornecedor,
  form,
  onOpenChange,
  onAddEditSubmit,
  onDeleteConfirm,
}) => {
  if (dialogType === "delete") {
    return (
      <CrudDialog
        title="Excluir Fornecedor"
        description={`Tem certeza que deseja excluir o fornecedor ${selectedFornecedor?.nome}? Esta ação não pode ser desfeita.`}
        open={dialogOpen}
        onOpenChange={onOpenChange}
        onConfirm={onDeleteConfirm}
        type="delete"
      >
        <div className="text-center py-4">
          <p className="mb-2">Todos os dados relacionados a este fornecedor serão perdidos.</p>
          <p className="font-medium text-destructive">Atenção: Os produtos associados a este fornecedor ficarão sem fornecedor.</p>
        </div>
      </CrudDialog>
    );
  }

  return (
    <CrudDialog
      title={dialogType === "add" ? "Adicionar Fornecedor" : "Editar Fornecedor"}
      description={dialogType === "add" ? "Adicione um novo fornecedor ao sistema" : "Edite os detalhes do fornecedor"}
      open={dialogOpen}
      onOpenChange={onOpenChange}
      onConfirm={form.handleSubmit(onAddEditSubmit)}
      type={dialogType}
    >
      <FornecedorForm form={form} onSubmit={onAddEditSubmit} />
    </CrudDialog>
  );
};
