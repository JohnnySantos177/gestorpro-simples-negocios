import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS_PRODUTOS } from "@/data/constants";
import { Fornecedor } from "@/types";
import { ProdutoFormData } from "@/hooks/useProdutoForm";
import { supabase } from "@/integrations/supabase/client";

interface ProdutoFormProps {
  form: UseFormReturn<ProdutoFormData>;
  onSubmit: (data: ProdutoFormData) => void;
  fornecedores: Fornecedor[];
}

export const ProdutoForm: React.FC<ProdutoFormProps> = ({
  form,
  onSubmit,
  fornecedores,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Função para upload da imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `produtos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { error } = await supabase.storage.from('lovable-uploads').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('lovable-uploads').getPublicUrl(filePath);
      form.setValue('foto_url', data.publicUrl);
    } catch (err: any) {
      setUploadError('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do produto" {...field} />
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
                <Input placeholder="Descrição do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIAS_PRODUTOS.filter(cat => cat !== "Todas").map((categoria) => (
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
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="precoCompra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Compra</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="precoVenda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Venda</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="quantidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade em Estoque</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fornecedorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fornecedor</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sem-fornecedor">Sem fornecedor</SelectItem>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Upload de imagem */}
        <FormField
          control={form.control}
          name="foto_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto do Produto</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  {uploading && <span className="text-xs text-muted-foreground">Enviando imagem...</span>}
                  {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
                  {field.value && (
                    <img src={field.value} alt="Foto do produto" className="h-24 rounded border mt-2" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Checkbox publicar no catálogo */}
        <FormField
          control={form.control}
          name="publicar_no_catalogo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={e => field.onChange(e.target.checked)}
                  className="h-4 w-4"
                />
              </FormControl>
              <FormLabel className="mb-0">Exibir no catálogo público</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90">
            Adicionar
          </button>
        </div>
      </form>
    </Form>
  );
};
