import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const produtoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  precoCompra: z.number().min(0, "Preço de compra deve ser positivo"),
  precoVenda: z.number().min(0, "Preço de venda deve ser positivo"),
  quantidade: z.number().min(0, "Quantidade deve ser positiva"),
  fornecedorId: z.string().min(1, "Fornecedor é obrigatório"),
  foto_url: z.string().optional(),
  publicar_no_catalogo: z.boolean().optional(),
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;

export const useProdutoForm = (initialData?: Partial<ProdutoFormData>) => {
  return useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      descricao: initialData?.descricao || "",
      categoria: initialData?.categoria || "",
      precoCompra: initialData?.precoCompra || 0,
      precoVenda: initialData?.precoVenda || 0,
      quantidade: initialData?.quantidade || 0,
      fornecedorId: initialData?.fornecedorId || "sem-fornecedor",
      foto_url: initialData?.foto_url || "",
      publicar_no_catalogo: initialData?.publicar_no_catalogo || false,
    },
  });
};
