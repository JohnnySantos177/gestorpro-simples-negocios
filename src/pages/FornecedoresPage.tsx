
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Fornecedor } from "@/types";
import { Button } from "@/components/ui/button";
import { Truck, Edit, Trash2 } from "lucide-react";
import { CrudDialog } from "@/components/CrudDialog";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const fornecedorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"), // Apenas nome obrigatório
  contato: z.string().optional(), // Não obrigatório
  telefone: z.string().optional(), // Não obrigatório
  email: z.string().optional(), // Não obrigatório
  endereco: z.string().optional(), // Não obrigatório
  cidade: z.string().optional(), // Não obrigatório
  estado: z.string().optional(), // Não obrigatório
  cep: z.string().optional(), // Não obrigatório
  cnpj: z.string().optional(), // Não obrigatório
  prazoEntrega: z.coerce.number().min(1, "Prazo de entrega deve ser maior que 0").optional().default(1),
  observacoes: z.string().optional(),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

const FornecedoresPage = () => {
  const { filterFornecedores, addFornecedor, updateFornecedor, deleteFornecedor, fornecedores } = useData();
  const { isSubscribed } = useSubscription();
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "nome",
    sortOrder: "asc",
    page: 1,
    itemsPerPage: 10
  });
  
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

  const filteredFornecedores = filterFornecedores(filterOptions);

  const openAddDialog = () => {
    // Verificar limite de registros para usuários gratuitos
    if (!isSubscribed && fornecedores.length >= 10) {
      toast.error("Limite atingido! Você pode cadastrar apenas 10 fornecedores no plano gratuito. Faça upgrade para adicionar mais.");
      return;
    }
    
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

  const handleAddEditSubmit = (data: FornecedorFormData) => {
    if (dialogType === "add") {
      const success = addFornecedor({
        nome: data.nome,
        contato: data.contato,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        cnpj: data.cnpj,
        prazoEntrega: data.prazoEntrega,
        observacoes: data.observacoes || "",
      });
      
      if (!success) {
        return; // Don't close the dialog if adding failed
      }
    } else if (dialogType === "edit" && selectedFornecedor) {
      updateFornecedor(selectedFornecedor.id, {
        nome: data.nome,
        contato: data.contato,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        cnpj: data.cnpj,
        prazoEntrega: data.prazoEntrega,
        observacoes: data.observacoes || "",
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedFornecedor) {
      deleteFornecedor(selectedFornecedor.id);
    }
    setDialogOpen(false);
  };

  const columns = [
    { key: "nome", header: "Nome" },
    { key: "contato", header: "Contato" },
    { key: "telefone", header: "Telefone" },
    { key: "email", header: "Email" },
    { key: "cidade", header: "Cidade" },
    { key: "estado", header: "Estado" },
    { key: "prazoEntrega", header: "Prazo de Entrega (dias)" },
    { 
      key: "actions", 
      header: "Ações", 
      cell: (_: any, row: Fornecedor) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Fornecedores" 
        description="Gerencie seus fornecedores"
        icon={<Truck className="h-6 w-6" />}
        actions={
          <Button onClick={openAddDialog}>Novo Fornecedor</Button>
        }
      />

      <div className="mt-6">
        <DataTable
          data={filteredFornecedores}
          columns={columns}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          totalItems={fornecedores.length}
          page={filterOptions.page}
          itemsPerPage={filterOptions.itemsPerPage}
        />
      </div>

      {/* Add/Edit Dialog */}
      {dialogType !== "delete" ? (
        <CrudDialog
          title={dialogType === "add" ? "Adicionar Fornecedor" : "Editar Fornecedor"}
          description={dialogType === "add" ? "Adicione um novo fornecedor ao sistema" : "Edite os detalhes do fornecedor"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={form.handleSubmit(handleAddEditSubmit)}
          type={dialogType}
        >
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleAddEditSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="Estado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prazoEntrega"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de Entrega (dias)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais sobre o fornecedor" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CrudDialog>
      ) : (
        <CrudDialog
          title="Excluir Fornecedor"
          description={`Tem certeza que deseja excluir o fornecedor ${selectedFornecedor?.nome}? Esta ação não pode ser desfeita.`}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleDeleteConfirm}
          type="delete"
        >
          <div className="text-center py-4">
            <p className="mb-2">Todos os dados relacionados a este fornecedor serão perdidos.</p>
            <p className="font-medium text-destructive">Atenção: Os produtos associados a este fornecedor ficarão sem fornecedor.</p>
          </div>
        </CrudDialog>
      )}
    </Layout>
  );
};

export default FornecedoresPage;
