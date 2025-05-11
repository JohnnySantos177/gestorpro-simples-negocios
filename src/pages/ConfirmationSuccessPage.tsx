
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const ConfirmationSuccessPage = () => {
  useEffect(() => {
    // Log confirmation success for debugging
    console.log("Confirmation success page loaded");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-center">
            {/* Logo do Gestor Pro */}
            <div className="flex items-center justify-center mb-2">
              <span className="font-bold text-2xl text-gestorpro-600">Gestor</span>
              <span className="font-bold text-2xl text-primary">Pro</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Sua confirmação foi feita com sucesso!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Por favor, vá para a tela de login</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login">
            <Button className="bg-gestorpro-500 hover:bg-gestorpro-600">Ir para Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmationSuccessPage;
