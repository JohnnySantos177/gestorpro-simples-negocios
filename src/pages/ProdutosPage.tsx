
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/ui/data-table";
import { useData } from "@/context/DataContext";
import { FilterOptions } from "@/types";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_PRODUTOS } from "@/data/constants";
import { Package } from "lucide-react";

const ProdutosPage = () => {
  const { filterProdutos } = useData();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "nome",
    sortOrder: "asc",
    page: 1,
    itemsPerPage: 10,
    categoria: "Todas"
  });

  const produtos = filterProdutos(filterOptions);

  const columns = [
    { key: "nome", header: "Nome" },
    { key: "categoria", header: "Categoria" },
    { key: "precoVenda", header: "Preço", cell: (value: number) => `R$ ${value.toFixed(2)}` },
    { key: "quantidade", header: "Estoque" },
    { key: "fornecedorNome", header: "Fornecedor" }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Produtos" 
        description="Gerencie seu catálogo de produtos"
        icon={<Package className="h-6 w-6" />}
      >
        <Button>Novo Produto</Button>
      </PageHeader>

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIAS_PRODUTOS.map((categoria) => (
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
          data={produtos}
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

export default ProdutosPage;
