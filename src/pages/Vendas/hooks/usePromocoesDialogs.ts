
import { useState } from "react";
import { Promocao } from "@/types";

export function usePromocoesDialogs() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete" | "view">("add");
  const [selectedPromocao, setSelectedPromocao] = useState<Promocao | null>(null);

  const openAddDialog = () => {
    setSelectedPromocao(null);
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (promocao: Promocao) => {
    setSelectedPromocao(promocao);
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (promocao: Promocao) => {
    setSelectedPromocao(promocao);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const openViewDialog = (promocao: Promocao) => {
    setSelectedPromocao(promocao);
    setDialogType("view");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  return {
    dialogOpen,
    dialogType,
    selectedPromocao,
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
    openViewDialog,
    closeDialog,
  };
}
