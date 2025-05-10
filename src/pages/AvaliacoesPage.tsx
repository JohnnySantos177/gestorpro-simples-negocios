import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Feedback } from "@/types";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const AvaliacoesPage = () => {
  const { feedbacks } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    respondido: ""
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
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Avaliações" 
        description="Gerencie as avaliações dos clientes"
        icon={<MessageSquare className="h-6 w-6" />}
        actions={<Button>Nova Avaliação</Button>}
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
          totalItems={0}
          page={filterOptions.page}
          itemsPerPage={filterOptions.itemsPerPage}
        />
      </div>
    </Layout>
  );
};

export default AvaliacoesPage;
