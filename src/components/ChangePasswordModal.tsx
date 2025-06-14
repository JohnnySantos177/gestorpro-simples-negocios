
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";

const emailSchema = z.object({
  email: z.string().email("E-mail inválido")
});
const resetSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha"),
  code: z.string().min(8, "O código deve ter pelo menos 8 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type EmailFormType = z.infer<typeof emailSchema>;
type ResetFormType = z.infer<typeof resetSchema>;

export const ChangePasswordModal: React.FC<{ userEmail: string }> = ({ userEmail }) => {
  const { resetPassword, updatePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"start" | "sent" | "reset">("start");
  const [email, setEmail] = useState(userEmail || "");
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<EmailFormType>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: userEmail },
  });

  const resetForm = useForm<ResetFormType>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "", code: "" }
  });

  async function handleSendCode(values: EmailFormType) {
    setLoading(true);
    try {
      await resetPassword(values.email);
      setStatus("sent");
      setEmail(values.email);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword(values: ResetFormType) {
    setLoading(true);
    try {
      // Usar a hash para setSession antes de trocar a senha (Supabase flow)
      const { code, password } = values;
      // Simular a troca, precisa/usuário entrar pelo link do email para validar hash/token
      // Alertar o usuário sobre seguir o link do e-mail!
      window.location.href = `${window.location.origin}/reset-password#access_token=${code}&type=recovery`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          Alterar senha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription>
            Enviaremos um código para seu e-mail para confirmar a alteração de senha.
          </DialogDescription>
        </DialogHeader>

        {status === "start" && (
          <form className="space-y-4" onSubmit={emailForm.handleSubmit(handleSendCode)}>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <Input type="email" {...emailForm.register("email")} disabled={!!userEmail} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar código"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {status === "sent" && (
          <>
            <div className="mb-4 text-sm">
              Um código foi enviado para <strong>{email}</strong>. Siga o link do e-mail ou digite o código abaixo junto com sua nova senha.
            </div>
            <form className="space-y-4" onSubmit={resetForm.handleSubmit(handleSetPassword)}>
              <div>
                <label className="block text-sm font-medium mb-1">Novo senha</label>
                <Input type="password" {...resetForm.register("password")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar nova senha</label>
                <Input type="password" {...resetForm.register("confirmPassword")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código recebido</label>
                <Input type="text" {...resetForm.register("code")} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Validando..." : "Alterar senha"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
