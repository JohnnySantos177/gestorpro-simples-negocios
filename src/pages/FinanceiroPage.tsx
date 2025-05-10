
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions } from "@/types";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_FINANCEIRAS } from "@/data/constants";
import { DollarSign } from "lucide-react";

const FinanceiroPage = () => {
  const { filterTransacoes } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    tipo: "",
    categoria: ""
  });

  const transacoes = filterTransacoes(filterOptions);

  const columns = [
    { key: "data", header: "Data", cell: (value: string) => new Date(value).toLocaleDateString() },
    { 
      key: "tipo", 
      header: "Tipo", 
      cell: (value: string) => (
        <span className={value === 'entrada' ? 'text-green-600' : 'text-red-600'}>
          {value === 'entrada' ? 'Entrada' : 'Saída'}
        </span>
      )
    },
    { key: "categoria", header: "Categoria" },
    { key: "descricao", header: "Descrição" },
    { 
      key: "valor", 
      header: "Valor", 
      cell: (value: number) => `R$ ${value.toFixed(2)}` 
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Financeiro" 
        description="Gerencie suas finanças"
        icon={<DollarSign className="h-6 w-6" />}
      >
        <div className="flex gap-2">
          <Button variant="outline">Nova Entrada</Button>
          <Button>Nova Saída</Button>
        </div>
      </PageHeader>

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.tipo === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, tipo: "", page: 1 })}
          >
            Todos
          </Button>
          <Button
            variant={filterOptions.tipo === "entrada" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, tipo: "entrada", page: 1 })}
          >
            Entradas
          </Button>
          <Button
            variant={filterOptions.tipo === "saida" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, tipo: "saida", page: 1 })}
          >
            Saídas
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.categoria === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, categoria: "", page: 1 })}
          >
            Todas Categorias
          </Button>
          {CATEGORIAS_FINANCEIRAS.map((categoria) => (
            <Button
              key={categoria}
              variant={filterOptions.categoria === categoria ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterOptions({ ...filterOptions, categoria, page: 1 })}
            >
              {categoria}
            </Button>
          ))}
        </div>
        
        <DataTable
          data={transacoes}
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

export default FinanceiroPage;
