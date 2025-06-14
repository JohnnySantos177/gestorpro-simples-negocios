
import React from "react";
import { useVisitorMode } from "@/context/VisitorModeContext";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const VisitorBanner = () => {
  const { isVisitorMode, targetUserId, exitVisitorMode } = useVisitorMode();
  const navigate = useNavigate();

  if (!isVisitorMode || !targetUserId) return null;

  const handleExit = () => {
    exitVisitorMode();
    navigate("/admin");
  };

  return (
    <div className="w-full bg-yellow-200 text-yellow-900 px-4 py-2 flex items-center justify-between z-50 fixed top-0 left-0 shadow-lg">
      <div className="flex items-center gap-2">
        <EyeOff className="mr-2" />
        <span>
          Modo Visitante ativado — você está visualizando o painel do usuário <b>{targetUserId}</b>. Nenhuma ação de edição será permitida.
        </span>
      </div>
      <Button size="sm" variant="outline" onClick={handleExit}>Sair do modo visitante</Button>
    </div>
  );
};
