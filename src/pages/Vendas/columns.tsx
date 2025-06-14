
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Compra } from "@/types";

export const vendasColumns = (openEditDialog: (compra: Compra) => void, openDeleteDialog: (compra: Compra) => void) => [
  { key: "data", header: "Data", cell: (value: string) => new Date(value).toLocaleDateString() },
  { key: "clienteNome", header: "Cliente" },
  { 
    key: "valorTotal", 
    header: "Total", 
    cell: (value: number) => `R$ ${value.toFixed(2)}`
  },
  { key: "formaPagamento", header: "Pagamento" },
  { key: "status", header: "Status" },
  { 
    key: "actions", 
    header: "Ações", 
    cell: (_: any, row: Compra) => (
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
