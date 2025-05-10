
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions, Promocao } from "@/types";
import { Button } from "@/components/ui/button";
import { BadgePercent } from "lucide-react";

const PromocoesPage = () => {
  const { promocoes } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "dataInicio",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    ativo: ""
  });

  // Filtragem básica para promoções
  const filteredPromocoes = () => {
    let result = [...promocoes];
    
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      result = result.filter(
        promocao => 
          promocao.nome.toLowerCase().includes(searchLower) ||
          promocao.descricao.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterOptions.ativo === "ativo") {
      result = result.filter(promocao => promocao.ativo);
    } else if (filterOptions.ativo === "inativo") {
      result = result.filter(promocao => !promocao.ativo);
    }
    
    // Ordenação
    result.sort((a, b) => {
      if (filterOptions.sortBy === "dataInicio" || filterOptions.sortBy === "dataFim") {
        return filterOptions.sortOrder === 'asc'
          ? new Date(a[filterOptions.sortBy as keyof Promocao] as string).getTime() - new Date(b[filterOptions.sortBy as keyof Promocao] as string).getTime()
          : new Date(b[filterOptions.sortBy as keyof Promocao] as string).getTime() - new Date(a[filterOptions.sortBy as keyof Promocao] as string).getTime();
      } else {
        const aValue = a[filterOptions.sortBy as keyof Promocao];
        const bValue = b[filterOptions.sortBy as keyof Promocao];
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
    { key: "nome", header: "Nome" },
    { 
      key: "tipoDesconto", 
      header: "Tipo", 
      cell: (value: string) => value === 'percentual' ? 'Percentual' : 'Valor Fixo' 
    },
    { 
      key: "valorDesconto", 
      header: "Desconto", 
      cell: (value: number, row: Promocao) => 
        row.tipoDesconto === 'percentual' ? `${value}%` : `R$ ${value.toFixed(2)}` 
    },
    { 
      key: "dataInicio", 
      header: "Início", 
      cell: (value: string) => new Date(value).toLocaleDateString() 
    },
    { 
      key: "dataFim", 
      header: "Término", 
      cell: (value: string) => new Date(value).toLocaleDateString() 
    },
    { 
      key: "ativo", 
      header: "Status", 
      cell: (value: boolean) => (
        <span className={value ? 'text-green-600' : 'text-red-600'}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Promoções" 
        description="Gerencie suas promoções e descontos"
        icon={<BadgePercent className="h-6 w-6" />}
      >
        <Button>Nova Promoção</Button>
      </PageHeader>

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.ativo === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, ativo: "", page: 1 })}
          >
            Todas
          </Button>
          <Button
            variant={filterOptions.ativo === "ativo" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, ativo: "ativo", page: 1 })}
          >
            Ativas
          </Button>
          <Button
            variant={filterOptions.ativo === "inativo" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, ativo: "inativo", page: 1 })}
          >
            Inativas
          </Button>
        </div>
        
        <DataTable
          data={filteredPromocoes()}
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

export default PromocoesPage;
