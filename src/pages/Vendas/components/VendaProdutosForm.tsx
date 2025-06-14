
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Produto } from "@/types";

interface VendaProdutosFormProps {
  itensPedido: {
    produtoId: string;
    produtoNome: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }[];
  setItensPedido: React.Dispatch<React.SetStateAction<any[]>>;
  produtos: Produto[];
  novoProdutoOpen: boolean;
  setNovoProdutoOpen: (open: boolean) => void;
  produtoForm: any;
  handleAddProduto: (data: any) => void;
  removerProduto: (index: number) => void;
  calcularTotal: () => number;
}

export function VendaProdutosForm({
  itensPedido,
  setItensPedido,
  produtos,
  novoProdutoOpen,
  setNovoProdutoOpen,
  produtoForm,
  handleAddProduto,
  removerProduto,
  calcularTotal,
}: VendaProdutosFormProps) {
  return (
    <div className="border p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Produtos</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => setNovoProdutoOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar Produto
        </Button>
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
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removerProduto(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="border-t pt-4 text-right font-medium">
            Total: R$ {calcularTotal().toFixed(2)}
          </div>
        </div>
      )}

      {novoProdutoOpen && (
        <div className="border p-4 rounded-md bg-muted/50 mt-4">
          <h4 className="font-medium mb-4">Adicionar Produto</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={produtoForm.control}
                name="produtoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {produtos.map((produto) => (
                          <SelectItem key={produto.id} value={produto.id}>
                            {produto.nome} - R$ {produto.precoVenda.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={produtoForm.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
  );
}
