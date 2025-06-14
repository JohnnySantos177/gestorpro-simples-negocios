
import React, { createContext, useContext, useState, ReactNode } from "react";

type VisitorModeContextType = {
  isVisitorMode: boolean;
  targetUserId: string | null;
  enterVisitorMode: (userId: string) => void;
  exitVisitorMode: () => void;
};

const VisitorModeContext = createContext<VisitorModeContextType | undefined>(undefined);

export const VisitorModeProvider = ({ children }: { children: ReactNode }) => {
  const [isVisitorMode, setVisitorMode] = useState<boolean>(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const enterVisitorMode = (userId: string) => {
    setVisitorMode(true);
    setTargetUserId(userId);
    sessionStorage.setItem("visitorMode", "1");
    sessionStorage.setItem("visitorModeUserId", userId);
  };

  const exitVisitorMode = () => {
    setVisitorMode(false);
    setTargetUserId(null);
    sessionStorage.removeItem("visitorMode");
    sessionStorage.removeItem("visitorModeUserId");
  };

  // Restore after reload
  React.useEffect(() => {
    if (sessionStorage.getItem("visitorMode") === "1") {
      setVisitorMode(true);
      setTargetUserId(sessionStorage.getItem("visitorModeUserId") || null);
    }
  }, []);

  return (
    <VisitorModeContext.Provider
      value={{ isVisitorMode, targetUserId, enterVisitorMode, exitVisitorMode }}
    >
      {children}
    </VisitorModeContext.Provider>
  );
};

export function useVisitorMode() {
  const ctx = useContext(VisitorModeContext);
  if (!ctx) throw new Error("useVisitorMode must be used inside VisitorModeProvider");
  return ctx;
}
