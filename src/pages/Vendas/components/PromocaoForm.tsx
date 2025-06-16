
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useData } from "@/context/DataContext";
import { Promocao } from "@/types";
import { toast } from "sonner";

const promocaoFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  tipoDesconto: z.enum(["percentual", "valor"]),
  valorDesconto: z.number().min(0, "Valor deve ser positivo"),
  produtoId: z.string().optional(),
  categoriaId: z.string().optional(),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  ativo: z.boolean().default(true),
});

type PromocaoFormData = z.infer<typeof promocaoFormSchema>;

interface PromocaoFormProps {
  promocao?: Promocao | null;
  onSubmit: (promocao: Omit<Promocao, "id">) => Promise<boolean>;
  onCancel: () => void;
}

export function PromocaoForm({ promocao, onSubmit, onCancel }: PromocaoFormProps) {
  const { produtos } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PromocaoFormData>({
    resolver: zodResolver(promocaoFormSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      tipoDesconto: "percentual",
      valorDesconto: 0,
      produtoId: "",
      categoriaId: "",
      dataInicio: "",
      dataFim: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (promocao) {
      form.reset({
        nome: promocao.nome,
        descricao: promocao.descricao || "",
        tipoDesconto: promocao.tipoDesconto,
        valorDesconto: promocao.valorDesconto,
        produtoId: promocao.produtoId || "",
        categoriaId: promocao.categoriaId || "",
        dataInicio: promocao.dataInicio.split('T')[0],
        dataFim: promocao.dataFim.split('T')[0],
        ativo: promocao.ativo,
      });
    }
  }, [promocao, form]);

  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  const handleSubmit = async (data: PromocaoFormData) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        nome: data.nome,
        descricao: data.descricao || "",
        tipoDesconto: data.tipoDesconto,
        valorDesconto: data.valorDesconto,
        produtoId: data.produtoId || undefined,
        categoriaId: data.categoriaId || undefined,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        ativo: data.ativo,
      });

      if (success) {
        form.reset();
        onCancel();
      }
    } catch (error) {
      console.error("Erro ao salvar promoção:", error);
      toast.error("Erro ao salvar promoção");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Promoção</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome da promoção" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição da promoção..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipoDesconto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Desconto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                    <SelectItem value="valor">Valor (R$)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valorDesconto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor do Desconto</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="produtoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produto (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Todos os produtos</SelectItem>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataFim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Fim</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Promoção Ativa</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Ativar ou desativar esta promoção
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : promocao ? "Atualizar" : "Criar"} Promoção
          </Button>
        </div>
      </form>
    </Form>
  );
}
