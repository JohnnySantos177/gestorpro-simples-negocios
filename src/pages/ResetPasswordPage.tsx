import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const passwordSchema = z.object({
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha"),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export default function ResetPasswordPage() {
  const [tokenDetected, setTokenDetected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  // Detect Supabase recovery token on hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && /access_token=/.test(hash)) {
      setTokenDetected(true);
    }
  }, []);

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    setSubmitting(true);
    const password = data.password;
    // Atualiza senha - supabase já recuperou a sessão com o token da URL
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      setResetSuccess(true);
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Agora você pode acessar o aplicativo com sua nova senha.",
        variant: "default", // Corrigido: só aceita "default" ou "destructive"
      });
      setTimeout(() => navigate("/login"), 2000);
    } else {
      toast({
        title: "Erro",
        description: error.message || "Houve um erro ao redefinir a senha.",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-center">Redefinir senha</h1>
        {/* Mensagem clara ao clicar no link */}
        {tokenDetected ? (
          <>
            <div className="mb-4 text-green-700 bg-green-100 rounded p-3 text-sm text-center border border-green-200">
              Link de redefinição validado.<br />
              Agora você pode cadastrar uma nova senha para a sua conta.
            </div>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium mb-1">Nova senha</label>
                <Input
                  type="password"
                  {...form.register("password")}
                  disabled={submitting || resetSuccess}
                  autoComplete="new-password"
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar nova senha</label>
                <Input
                  type="password"
                  {...form.register("confirmPassword")}
                  disabled={submitting || resetSuccess}
                  autoComplete="new-password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || resetSuccess}
              >
                {submitting ? "Salvando..." : "Redefinir senha"}
              </Button>
            </form>
          </>
        ) : (
          <div className="mb-2 text-sm text-yellow-700 bg-yellow-100 border border-yellow-200 rounded p-3 text-center">
            Link inválido ou expirado.<br />
            Solicite uma nova redefinição de senha em sua conta.
          </div>
        )}
      </div>
    </div>
  );
}
