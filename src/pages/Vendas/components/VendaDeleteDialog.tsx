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
      <div className="flex justify-end gap-2 px-6 pb-4">
        <button
          type="button"
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          onClick={onConfirm}
        >
          Excluir
        </button>
      </div>
    </CrudDialog>
  );
}
