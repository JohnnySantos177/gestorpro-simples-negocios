
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
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CrudDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  type: "add" | "edit" | "delete";
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading}
            variant={type === "delete" ? "destructive" : "default"}
          >
            {isLoading ? "Processando..." : type === "add" ? "Adicionar" : type === "edit" ? "Salvar" : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
