
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

export const useProdutoForm = (defaultValues?: Partial<ProdutoFormData>) => {
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
      ...defaultValues,
    },
  });

  return form;
};
