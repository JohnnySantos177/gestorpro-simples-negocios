import React from "react";
import { useVisitorMode } from "@/context/VisitorModeContext";

export const AppContentGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isVisitorMode, targetUserId } = useVisitorMode();

  // Só renderiza as rotas quando o contexto está estável
  if (isVisitorMode && !targetUserId) {
    return null; // ou um loading
  }

  return <>{children}</>;
}; 