
import React from "react";
import { CrudDialog } from "@/components/CrudDialog";
import { Compra } from "@/types";

interface VendaViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venda: Compra | null;
}

export function VendaViewDialog({ open, onOpenChange, venda }: VendaViewDialogProps) {
  return (
    <CrudDialog
      title="Detalhes da Venda"
      description="Visualize os detalhes da venda"
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={() => onOpenChange(false)}
      type="edit"
    >
      {venda && (
        <div className="space-y-4">
          <div>
            <strong>Cliente:</strong> {venda.clienteNome}
          </div>
          <div>
            <strong>Data:</strong> {new Date(venda.data).toLocaleDateString()}
          </div>
          <div>
            <strong>Valor Total:</strong> R$ {venda.valorTotal.toFixed(2)}
          </div>
          <div>
            <strong>Forma de Pagamento:</strong> {venda.formaPagamento}
          </div>
          <div>
            <strong>Produtos:</strong>
            <ul className="mt-2 space-y-1">
              {venda.produtos.map((produto, index) => (
                <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                  {produto.produtoNome} - Qtd: {produto.quantidade} - R$ {produto.precoUnitario.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </CrudDialog>
  );
}
