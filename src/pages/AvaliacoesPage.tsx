
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Feedback } from "@/types";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";
import { CrudDialog } from "@/components/CrudDialog";
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

const feedbackSchema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório"),
  clienteNome: z.string().min(1, "Nome do cliente é obrigatório"),
  avaliacao: z.number().min(1).max(5),
  comentario: z.string().min(1, "Comentário é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  respondido: z.boolean().default(false),
  resposta: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const AvaliacoesPage = () => {
  const { feedbacks, addFeedback, updateFeedback, deleteFeedback, clientes } = useData();
  const { isSubscribed } = useSubscription();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    respondido: ""
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit" | "delete" | "respond">("add");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      clienteId: "",
      clienteNome: "",
      avaliacao: 5,
      comentario: "",
      data: new Date().toISOString().substring(0, 10),
      respondido: false,
      resposta: "",
    },
  });

  // Filtragem básica para avaliações
  const filteredFeedbacks = () => {
    let result = [...feedbacks];
    
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      result = result.filter(
        feedback => 
          feedback.clienteNome.toLowerCase().includes(searchLower) ||
          feedback.comentario.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterOptions.respondido === "sim") {
      result = result.filter(feedback => feedback.respondido);
    } else if (filterOptions.respondido === "nao") {
      result = result.filter(feedback => !feedback.respondido);
    }
    
    // Ordenação
    result.sort((a, b) => {
      if (filterOptions.sortBy === "data") {
        return filterOptions.sortOrder === 'asc'
          ? new Date(a.data).getTime() - new Date(b.data).getTime()
          : new Date(b.data).getTime() - new Date(a.data).getTime();
      } else if (filterOptions.sortBy === "avaliacao") {
        return filterOptions.sortOrder === 'asc'
          ? a.avaliacao - b.avaliacao
          : b.avaliacao - a.avaliacao;
      } else {
        const aValue = a[filterOptions.sortBy as keyof Feedback];
        const bValue = b[filterOptions.sortBy as keyof Feedback];
        if (filterOptions.sortOrder === 'asc') {
          return String(aValue).localeCompare(String(bValue));
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      }
    });
    
    // Paginação
    const startIndex = (filterOptions.page - 1) * filterOptions.itemsPerPage;
    return result.slice(startIndex, startIndex + filterOptions.itemsPerPage);
  };

  const openAddDialog = () => {
    // Verificar limite de registros para usuários gratuitos
    if (!isSubscribed && feedbacks.length >= 10) {
      toast.error("Limite atingido! Você pode cadastrar apenas 10 avaliações no plano gratuito. Faça upgrade para adicionar mais.");
      return;
    }

    form.reset({
      clienteId: "",
      clienteNome: "",
      avaliacao: 5,
      comentario: "",
      data: new Date().toISOString().substring(0, 10),
      respondido: false,
      resposta: "",
    });
    setDialogType("add");
    setDialogOpen(true);
  };

  const openEditDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    form.reset({
      clienteId: feedback.clienteId,
      clienteNome: feedback.clienteNome,
      avaliacao: feedback.avaliacao,
      comentario: feedback.comentario,
      data: new Date(feedback.data).toISOString().substring(0, 10),
      respondido: feedback.respondido,
      resposta: feedback.resposta || "",
    });
    setDialogType("edit");
    setDialogOpen(true);
  };

  const openDeleteDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setDialogType("delete");
    setDialogOpen(true);
  };

  const openRespondDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    form.reset({
      clienteId: feedback.clienteId,
      clienteNome: feedback.clienteNome,
      avaliacao: feedback.avaliacao,
      comentario: feedback.comentario,
      data: new Date(feedback.data).toISOString().substring(0, 10),
      respondido: true,
      resposta: feedback.resposta || "",
    });
    setDialogType("respond");
    setDialogOpen(true);
  };

  const handleAddEditSubmit = (data: FeedbackFormData) => {
    if (dialogType === "add") {
      addFeedback({
        clienteId: data.clienteId,
        clienteNome: data.clienteNome,
        avaliacao: data.avaliacao,
        comentario: data.comentario,
        data: data.data,
        respondido: data.respondido,
        resposta: data.resposta,
      });
    } else if ((dialogType === "edit" || dialogType === "respond") && selectedFeedback) {
      updateFeedback(selectedFeedback.id, {
        clienteId: data.clienteId,
        clienteNome: data.clienteNome,
        avaliacao: data.avaliacao,
        comentario: data.comentario,
        data: data.data,
        respondido: data.respondido,
        resposta: data.resposta,
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedFeedback) {
      deleteFeedback(selectedFeedback.id);
    }
    setDialogOpen(false);
  };

  const columns = [
    { key: "data", header: "Data", cell: (value: string) => new Date(value).toLocaleDateString() },
    { key: "clienteNome", header: "Cliente" },
    { 
      key: "avaliacao", 
      header: "Avaliação", 
      cell: (value: number) => {
        return (
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <span key={index} className={index < value ? "text-yellow-500" : "text-gray-300"}>★</span>
            ))}
          </div>
        );
      } 
    },
    { key: "comentario", header: "Comentário" },
    { 
      key: "respondido", 
      header: "Respondido", 
      cell: (value: boolean) => value ? "Sim" : "Não" 
    },
    {
      key: "actions",
      header: "Ações",
      cell: (_: any, row: Feedback) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => openRespondDialog(row)}>
            {row.respondido ? "Ver Resposta" : "Responder"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(row)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => openDeleteDialog(row)}>
            Excluir
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Avaliações" 
        description="Gerencie as avaliações dos clientes"
        icon={<MessageSquare className="h-6 w-6" />}
        actions={<Button onClick={openAddDialog}>Nova Avaliação</Button>}
      />

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.respondido === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, respondido: "", page: 1 })}
          >
            Todas
          </Button>
          <Button
            variant={filterOptions.respondido === "sim" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, respondido: "sim", page: 1 })}
          >
            Respondidas
          </Button>
          <Button
            variant={filterOptions.respondido === "nao" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, respondido: "nao", page: 1 })}
          >
            Não Respondidas
          </Button>
        </div>
        
        <DataTable
          data={filteredFeedbacks()}
          columns={columns}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          totalItems={feedbacks.length}
          page={filterOptions.page}
          itemsPerPage={filterOptions.itemsPerPage}
        />
      </div>

      {/* Add/Edit Dialog */}
      {dialogType !== "delete" ? (
        <CrudDialog
          title={
            dialogType === "add" 
              ? "Nova Avaliação" 
              : dialogType === "respond"
                ? "Responder Avaliação"
                : "Editar Avaliação"
          }
          description={
            dialogType === "add"
              ? "Adicione uma nova avaliação de cliente"
              : dialogType === "respond"
                ? "Responda ao feedback do cliente"
                : "Edite os detalhes da avaliação"
          }
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={form.handleSubmit(handleAddEditSubmit)}
          type={dialogType}
        >
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleAddEditSubmit)}>
              {dialogType !== "respond" && (
                <>
                  <FormField
                    control={form.control}
                    name="clienteNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="avaliacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avaliação (1-5)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="5"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
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
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comentario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comentário</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <FormField
                control={form.control}
                name="resposta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dialogType === "respond" ? "Sua Resposta" : "Resposta (opcional)"}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {dialogType === "respond" && (
                <FormField
                  control={form.control}
                  name="respondido"
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />
              )}
            </form>
          </Form>
        </CrudDialog>
      ) : (
        <CrudDialog
          title="Excluir Avaliação"
          description="Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita."
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleDeleteConfirm}
          type="delete"
        >
          <div className="py-4">
            <p>Esta avaliação será removida permanentemente do sistema.</p>
          </div>
        </CrudDialog>
      )}
    </Layout>
  );
};

export default AvaliacoesPage;
