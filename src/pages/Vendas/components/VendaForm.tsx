
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useData } from "@/context/DataContext";
import { Compra, ItemCompra } from "@/types";
import { Plus, Trash2 } from "lucide-react";

const vendaSchema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  clienteNome: z.string().min(1, "Nome do cliente é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  status: z.string().min(1, "Status é obrigatório"),
});

type VendaFormData = z.infer<typeof vendaSchema>;

interface VendaFormProps {
  compra?: Compra | null;
  onClose: () => void;
  readOnly?: boolean;
}

export function VendaForm({ compra, onClose, readOnly = false }: VendaFormProps) {
  const { clientes, produtos, addCompra, updateCompra } = useData();
  const [itensPedido, setItensPedido] = useState<ItemCompra[]>([]);
  const [novoProdutoOpen, setNovoProdutoOpen] = useState(false);

  const form = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      clienteId: "",
      clienteNome: "",
      data: new Date().toISOString().split("T")[0],
      formaPagamento: "dinheiro",
      status: "concluida",
    },
  });

  const produtoForm = useForm({
    defaultValues: {
      produtoId: "",
      quantidade: 1,
    },
  });

  useEffect(() => {
    if (compra) {
      form.reset({
        clienteId: compra.clienteId,
        clienteNome: compra.clienteNome,
        data: compra.data.split("T")[0],
        formaPagamento: compra.formaPagamento,
        status: compra.status,
      });
      setItensPedido(compra.produtos || []);
    }
  }, [compra, form]);

  const handleAddProduto = (data: any) => {
    const produto = produtos.find(p => p.id === data.produtoId);
    if (!produto) return;

    const novoItem: ItemCompra = {
      produtoId: produto.id,
      produtoNome: produto.nome,
      quantidade: Number(data.quantidade),
      precoUnitario: produto.precoVenda,
      subtotal: Number(data.quantidade) * produto.precoVenda,
    };

    setItensPedido(prev => [...prev, novoItem]);
    setNovoProdutoOpen(false);
    produtoForm.reset();
  };

  const removerProduto = (index: number) => {
    setItensPedido(prev => prev.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => total + item.subtotal, 0);
  };

  const onSubmit = (data: VendaFormData) => {
    if (readOnly) return;

    const vendaData: Omit<Compra, "id"> = {
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      data: data.data,
      formaPagamento: data.formaPagamento,
      status: data.status,
      produtos: itensPedido,
      valorTotal: calcularTotal(),
    };

    if (compra) {
      updateCompra(compra.id, vendaData);
    } else {
      addCompra(vendaData);
    }
    
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  const cliente = clientes.find(c => c.id === value);
                  form.setValue("clienteNome", cliente?.nome || "");
                }} defaultValue={field.value} disabled={readOnly}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
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
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="formaPagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Produtos Section */}
        <div className="border p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Produtos</h3>
            {!readOnly && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setNovoProdutoOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Produto
              </Button>
            )}
          </div>
          
          {itensPedido.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto adicionado
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 font-medium text-sm">
                <div>Produto</div>
                <div>Preço Unit.</div>
                <div>Qtd</div>
                <div>Subtotal</div>
                <div></div>
              </div>
              {itensPedido.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 text-sm items-center">
                  <div>{item.produtoNome}</div>
                  <div>R$ {item.precoUnitario.toFixed(2)}</div>
                  <div>{item.quantidade}</div>
                  <div>R$ {item.subtotal.toFixed(2)}</div>
                  <div>
                    {!readOnly && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removerProduto(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 text-right font-medium">
                Total: R$ {calcularTotal().toFixed(2)}
              </div>
            </div>
          )}

          {novoProdutoOpen && !readOnly && (
            <div className="border p-4 rounded-md bg-muted/50 mt-4">
              <h4 className="font-medium mb-4">Adicionar Produto</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Produto</label>
                    <Select onValueChange={(value) => produtoForm.setValue("produtoId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map((produto) => (
                          <SelectItem key={produto.id} value={produto.id}>
                            {produto.nome} - R$ {produto.precoVenda.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantidade</label>
                    <Input 
                      type="number" 
                      min="1" 
                      {...produtoForm.register("quantidade", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setNovoProdutoOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={produtoForm.handleSubmit(handleAddProduto)}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {compra ? "Atualizar" : "Criar"} Venda
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
