
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const AdminNavigation = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link to="/admin">
          <Shield className="h-4 w-4 mr-2" />
          Painel Admin
        </Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to="/admin/usuarios">
          <Users className="h-4 w-4 mr-2" />
          Gerenciar Usuários
        </Link>
      </Button>
    </div>
  );
};
