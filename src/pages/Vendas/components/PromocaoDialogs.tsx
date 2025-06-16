
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CrudDialog } from "@/components/CrudDialog";
import { PromocaoForm } from "./PromocaoForm";
import { Promocao } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PromocaoDialogsProps {
  dialogOpen: boolean;
  dialogType: "add" | "edit" | "delete" | "view";
  selectedPromocao: Promocao | null;
  onDialogClose: () => void;
  onSubmit: (promocao: Omit<Promocao, "id">) => Promise<boolean>;
  onUpdate: (id: string, promocao: Partial<Promocao>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PromocaoDialogs({
  dialogOpen,
  dialogType,
  selectedPromocao,
  onDialogClose,
  onSubmit,
  onUpdate,
  onDelete,
}: PromocaoDialogsProps) {
  const handleUpdate = async (promocaoData: Omit<Promocao, "id">) => {
    if (selectedPromocao) {
      await onUpdate(selectedPromocao.id, promocaoData);
      return true;
    }
    return false;
  };

  const handleDelete = async () => {
    if (selectedPromocao) {
      await onDelete(selectedPromocao.id);
    }
  };

  if (dialogType === "view" && selectedPromocao) {
    return (
      <Dialog open={dialogOpen} onOpenChange={onDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Promoção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{selectedPromocao.nome}</h3>
              {selectedPromocao.descricao && (
                <p className="text-muted-foreground mt-1">{selectedPromocao.descricao}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Tipo de Desconto:</span>
                <p className="capitalize">{selectedPromocao.tipoDesconto}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Valor do Desconto:</span>
                <p>
                  {selectedPromocao.tipoDesconto === "percentual"
                    ? `${selectedPromocao.valorDesconto}%`
                    : `R$ ${selectedPromocao.valorDesconto.toFixed(2)}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Data de Início:</span>
                <p>{format(new Date(selectedPromocao.dataInicio), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Data de Fim:</span>
                <p>{format(new Date(selectedPromocao.dataFim), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Status:</span>
              <div className="mt-1">
                <Badge variant={selectedPromocao.ativo ? "default" : "secondary"}>
                  {selectedPromocao.ativo ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </div>

            {selectedPromocao.produtoId && (
              <div>
                <span className="text-sm font-medium">Produto Específico:</span>
                <p>Promoção aplicada a produto específico</p>
              </div>
            )}

            {selectedPromocao.categoriaId && (
              <div>
                <span className="text-sm font-medium">Categoria Específica:</span>
                <p>{selectedPromocao.categoriaId}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (dialogType === "delete") {
    return (
      <CrudDialog
        title="Excluir Promoção"
        description="Tem certeza que deseja excluir esta promoção? Esta ação não pode ser desfeita."
        open={dialogOpen}
        onOpenChange={onDialogClose}
        onConfirm={handleDelete}
        type="delete"
      >
        <div className="py-4">
          <p>A promoção "{selectedPromocao?.nome}" será removida permanentemente do sistema.</p>
        </div>
      </CrudDialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={onDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {dialogType === "add" ? "Nova Promoção" : "Editar Promoção"}
          </DialogTitle>
        </DialogHeader>
        <PromocaoForm
          promocao={selectedPromocao}
          onSubmit={dialogType === "add" ? onSubmit : handleUpdate}
          onCancel={onDialogClose}
        />
      </DialogContent>
    </Dialog>
  );
}
