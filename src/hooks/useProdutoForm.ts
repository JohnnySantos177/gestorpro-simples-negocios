
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useData } from "@/context/DataContext";
import { Produto, Fornecedor } from "@/types";

const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  precoCompra: z.number().min(0, "Preço deve ser positivo").optional(),
  precoVenda: z.number().min(0, "Preço deve ser positivo").optional(),
  quantidade: z.number().min(0, "Quantidade deve ser positiva").optional(),
  fornecedorId: z.string().optional(),
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;

export const useProdutoForm = (fornecedores: Fornecedor[]) => {
  const { addProduto, updateProduto, deleteProduto } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      categoria: "",
      precoCompra: 0,
      precoVenda: 0,
      quantidade: 0,
      fornecedorId: "",
    },
  });

  const openAddDialog = () => {
    form.reset({
      nome: "",
      descricao: "",
      categoria: "",
      precoCompra: 0,
      precoVenda: 0,
      quantidade: 0,
      fornecedorId: "",
    });
    setDialogType("add");
    setSelectedProduto(null);
    setDialogOpen(true);
  };

  const openEditDialog = (produto: Produto) => {
    form.reset({
      nome: produto.nome,
      descricao: produto.descricao || "",
      categoria: produto.categoria || "",
      precoCompra: produto.precoCompra,
      precoVenda: produto.precoVenda,
      quantidade: produto.quantidade,
      fornecedorId: produto.fornecedorId || "",
    });
    setDialogType("edit");
    setSelectedProduto(produto);
    setDialogOpen(true);
  };

  const openDeleteDialog = (produto: Produto) => {
    setDialogType("delete");
    setSelectedProduto(produto);
    setDialogOpen(true);
  };

  const handleAddEditSubmit = (data: ProdutoFormData) => {
    if (dialogType === "add") {
      const newProduto = {
        ...data,
        precoCompra: data.precoCompra || 0,
        precoVenda: data.precoVenda || 0,
        quantidade: data.quantidade || 0,
        fornecedorNome: fornecedores.find(f => f.id === data.fornecedorId)?.nome || "",
      };
      addProduto(newProduto);
    } else if (dialogType === "edit" && selectedProduto) {
      const updatedProduto = {
        ...data,
        precoCompra: data.precoCompra || 0,
        precoVenda: data.precoVenda || 0,
        quantidade: data.quantidade || 0,
        fornecedorNome: fornecedores.find(f => f.id === data.fornecedorId)?.nome || "",
      };
      updateProduto(selectedProduto.id, updatedProduto);
    }
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedProduto) {
      deleteProduto(selectedProduto.id);
    }
    setDialogOpen(false);
  };

  return {
    form,
    dialogOpen,
    dialogType,
    selectedProduto,
    setDialogOpen,
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
    handleAddEditSubmit,
    handleDeleteConfirm,
  };
};
