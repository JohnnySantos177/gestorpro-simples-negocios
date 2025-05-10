
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions } from "@/types";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

const FornecedoresPage = () => {
  const { filterFornecedores } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "nome",
    sortOrder: "asc",
    page: 1,
    itemsPerPage: 10
  });

  const fornecedores = filterFornecedores(filterOptions);

  const columns = [
    { key: "nome", header: "Nome" },
    { key: "contato", header: "Contato" },
    { key: "telefone", header: "Telefone" },
    { key: "email", header: "Email" },
    { key: "cidade", header: "Cidade" },
    { key: "estado", header: "Estado" },
    { key: "prazoEntrega", header: "Prazo de Entrega (dias)" }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Fornecedores" 
        description="Gerencie seus fornecedores"
        icon={<Truck className="h-6 w-6" />}
      >
        <Button>Novo Fornecedor</Button>
      </PageHeader>

      <div className="mt-6">
        <DataTable
          data={fornecedores}
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

export default FornecedoresPage;
