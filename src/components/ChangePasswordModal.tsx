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
  const { resetPassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"start" | "sent">("start");
  const [email, setEmail] = useState(userEmail || "");
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<EmailFormType>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: userEmail },
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
            Enviaremos um link de redefinição de senha para seu e-mail.
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
                {loading ? "Enviando..." : "Enviar link"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {status === "sent" && (
          <div className="space-y-4">
            <div className="mb-3 text-sm">
              Um link de redefinição foi enviado para <strong>{email}</strong>.<br />
              Por favor, acesse seu e-mail e clique no link recebido para cadastrar uma nova senha.<br />
              <span className="block text-xs mt-2 text-muted-foreground">
                O campo de código manual foi removido para maior segurança – use apenas o link do e-mail!
              </span>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Fechar</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
