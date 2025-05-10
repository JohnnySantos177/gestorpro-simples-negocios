
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions } from "@/types";
import { Button } from "@/components/ui/button";
import { STATUS_PEDIDO } from "@/data/constants";
import { ShoppingCart } from "lucide-react";

const VendasPage = () => {
  const { filterCompras } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "data",
    sortOrder: "desc",
    page: 1,
    itemsPerPage: 10,
    status: ""
  });

  const vendas = filterCompras(filterOptions);

  const columns = [
    { key: "data", header: "Data", cell: (value: string) => new Date(value).toLocaleDateString() },
    { key: "clienteNome", header: "Cliente" },
    { 
      key: "valorTotal", 
      header: "Total", 
      cell: (value: number) => `R$ ${value.toFixed(2)}` 
    },
    { key: "formaPagamento", header: "Pagamento" },
    { key: "status", header: "Status" }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Vendas" 
        description="Acompanhe as vendas realizadas"
        icon={<ShoppingCart className="h-6 w-6" />}
      >
        <Button>Nova Venda</Button>
      </PageHeader>

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterOptions.status === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOptions({ ...filterOptions, status: "", page: 1 })}
          >
            Todos
          </Button>
          {STATUS_PEDIDO.map((status) => (
            <Button
              key={status}
              variant={filterOptions.status === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterOptions({ ...filterOptions, status, page: 1 })}
            >
              {status}
            </Button>
          ))}
        </div>
        
        <DataTable
          data={vendas}
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

export default VendasPage;
