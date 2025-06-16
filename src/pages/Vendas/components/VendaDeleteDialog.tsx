
import React from "react";
import { CrudDialog } from "@/components/CrudDialog";

interface VendaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function VendaDeleteDialog({ open, onOpenChange, onConfirm }: VendaDeleteDialogProps) {
  return (
    <CrudDialog
      title="Excluir Venda"
      description="Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita."
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      type="delete"
    >
      <div className="py-4">
        <p>Esta venda será removida permanentemente do sistema.</p>
      </div>
    </CrudDialog>
  );
}
