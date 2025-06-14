
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Produto, Fornecedor } from "@/types";

// Match ProdutoFormData in ProdutoForm.tsx!
export const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  precoCompra: z.coerce.number().min(0, "Preço de compra deve ser maior que 0"),
  precoVenda: z.coerce.number().min(0, "Preço de venda deve ser maior que 0"),
  quantidade: z.coerce.number().min(0, "Quantidade deve ser maior que 0"),
  fornecedorId: z.string().optional(),
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;

export const useProdutoForm = (fornecedores: Fornecedor[]) => {
  const { addProduto, updateProduto, deleteProduto } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  // EXPLICIT GENERIC: ProdutoFormData
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
    setDialogOpen(true);
    setSelectedProduto(null); // ensure no selectedProduto on add
  };

  const openEditDialog = (produto: Produto) => {
    setSelectedProduto(produto);
    form.reset({
      nome: produto.nome ?? "",
      descricao: produto.descricao ?? "",
      categoria: produto.categoria ?? "",
      precoCompra: produto.precoCompra ?? 0,
      precoVenda: produto.precoVenda ?? 0,
      quantidade: produto.quantidade ?? 0,
      fornecedorId: produto.fornecedorId ?? "",
    });
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (produto: Produto) => {
    setSelectedProduto(produto);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const handleAddEditSubmit = (data: ProdutoFormData) => {
    const fornecedor = fornecedores.find((f) => f.id === data.fornecedorId);

    if (dialogType === "add") {
      addProduto({
        nome: data.nome,
        descricao: data.descricao,
        categoria: data.categoria,
        precoCompra: data.precoCompra,
        precoVenda: data.precoVenda,
        quantidade: data.quantidade,
        fornecedorId: data.fornecedorId,
        fornecedorNome: fornecedor?.nome || "",
      });
    } else if (dialogType === "edit" && selectedProduto) {
      updateProduto(selectedProduto.id, {
        nome: data.nome,
        descricao: data.descricao,
        categoria: data.categoria,
        precoCompra: data.precoCompra,
        precoVenda: data.precoVenda,
        quantidade: data.quantidade,
        fornecedorId: data.fornecedorId,
        fornecedorNome: fornecedor?.nome || "",
      });
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
