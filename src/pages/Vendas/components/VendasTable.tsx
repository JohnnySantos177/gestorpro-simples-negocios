
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { FilterOptions, Compra } from "@/types";

interface VendasTableProps {
  data: Compra[];
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
  totalItems: number;
  onView: (venda: Compra) => void;
  onEdit: (venda: Compra) => void;
  onDelete: (venda: Compra) => void;
}

export function VendasTable({ 
  data, 
  filterOptions, 
  onFilterChange, 
  totalItems, 
  onView, 
  onEdit, 
  onDelete 
}: VendasTableProps) {
  const columns = [
    { key: "data", header: "Data", cell: (value: string) => new Date(value).toLocaleDateString() },
    { key: "clienteNome", header: "Cliente" },
    { 
      key: "valorTotal", 
      header: "Valor Total", 
      cell: (value: number) => `R$ ${value.toFixed(2)}` 
    },
    { key: "formaPagamento", header: "Forma de Pagamento" },
    {
      key: "actions",
      header: "Ações",
      cell: (_: any, row: Compra) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      filterOptions={filterOptions}
      onFilterChange={onFilterChange}
      totalItems={totalItems}
      page={filterOptions.page}
      itemsPerPage={filterOptions.itemsPerPage}
    />
  );
}
