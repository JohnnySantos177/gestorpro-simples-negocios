
import { useState } from "react";
import { Compra } from "@/types";

export function useVendasDialogs() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete" | "view">("add");
  const [selectedVenda, setSelectedVenda] = useState<Compra | null>(null);

  const openAddDialog = () => {
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

  const closeDialog = () => {
    setDialogOpen(false);
  };

  return {
    dialogOpen,
    dialogType,
    selectedVenda,
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
    openViewDialog,
    closeDialog,
    setDialogOpen,
  };
}
