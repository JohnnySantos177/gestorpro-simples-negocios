import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CrudDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  type: "add" | "edit" | "delete" | "respond";
}

export function CrudDialog({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  children,
  type,
}: CrudDialogProps) {
  const { toast } = useToast();
  
  const handleConfirm = () => {
    onConfirm();
    
    let message = "";
    if (type === "add") {
      message = "Item adicionado com sucesso!";
    } else if (type === "edit") {
      message = "Item atualizado com sucesso!";
    } else if (type === "delete") {
      message = "Item excluído com sucesso!";
    } else if (type === "respond") {
      message = "Resposta enviada com sucesso!";
    }
    
    toast({
      title: "Sucesso!",
      description: message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        {(type === 'add' || type === 'edit') && (
          <DialogFooter>
            <Button type="button" onClick={handleConfirm} disabled={isLoading}>
              {type === 'add' ? 'Adicionar' : 'Salvar'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
