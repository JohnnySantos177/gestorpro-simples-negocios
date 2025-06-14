
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Fornecedor } from "@/types";
import { FornecedorFormData } from "@/components/fornecedores/FornecedorForm";

const fornecedorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  cnpj: z.string().optional(),
  prazoEntrega: z.coerce.number().min(1, "Prazo de entrega deve ser maior que 0").optional().default(1),
  observacoes: z.string().optional(),
});

export const useFornecedorForm = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);

  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: "",
      contato: "",
      telefone: "",
      email: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      cnpj: "",
      prazoEntrega: 1,
      observacoes: "",
    },
  });

  const openAddDialog = () => {
    form.reset({
      nome: "",
      contato: "",
      telefone: "",
      email: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      cnpj: "",
      prazoEntrega: 1,
      observacoes: "",
    });
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    form.reset({
      nome: fornecedor.nome,
      contato: fornecedor.contato,
      telefone: fornecedor.telefone,
      email: fornecedor.email,
      endereco: fornecedor.endereco,
      cidade: fornecedor.cidade,
      estado: fornecedor.estado,
      cep: fornecedor.cep,
      cnpj: fornecedor.cnpj,
      prazoEntrega: fornecedor.prazoEntrega,
      observacoes: fornecedor.observacoes,
    });
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setDialogType("delete");
    setDialogOpen(true);
  };

  return {
    form,
    dialogOpen,
    dialogType,
    selectedFornecedor,
    setDialogOpen,
    openAddDialog,
    openEditDialog,
    openDeleteDialog,
  };
};
