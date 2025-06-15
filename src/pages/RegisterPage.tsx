import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { validateEmail, validatePassword, sanitizeInput } from "@/utils/inputValidation";

const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  telefone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
      telefone: "",
    },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      // Additional client-side validation
      const emailValidation = validateEmail(values.email);
      if (!emailValidation) {
        toast.error("E-mail inválido");
        return;
      }

      const passwordValidation = validatePassword(values.password);
      if (!passwordValidation.valid) {
        toast.error(passwordValidation.message || "Senha inválida");
        return;
      }

      // Sanitize inputs
      const sanitizedValues = {
        nome: sanitizeInput(values.nome),
        email: sanitizeInput(values.email).toLowerCase(),
        password: values.password, // Don't sanitize password
        telefone: values.telefone ? sanitizeInput(values.telefone) : undefined,
      };

      setLoading(true);
      await signUp(sanitizedValues.email, sanitizedValues.password, sanitizedValues.nome, sanitizedValues.telefone);
      toast.success("Conta criada! Verifique seu e-mail para ativar o cadastro.");
      navigate("/login");
    } catch (error: any) {
      toast.error(`Erro ao criar conta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container flex items-center justify-center">
        <div className="w-full max-w-md">
          <PageHeader
            title="Criar uma conta"
            description="Crie sua conta para começar a usar o sistema"
          />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(99) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
