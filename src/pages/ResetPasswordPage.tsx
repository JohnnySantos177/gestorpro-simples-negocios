
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Reset password request schema
const requestResetSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

// New password schema
const newPasswordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;
type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword, updatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);
  const [hasResetToken, setHasResetToken] = useState(false);

  // Check if we have a reset token in the URL
  useEffect(() => {
    const checkForToken = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });
        
        if (!error) {
          setHasResetToken(true);
        }
      }
    };
    
    checkForToken();
  }, []);

  // Form for requesting password reset
  const requestResetForm = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  // Form for setting a new password
  const newPasswordForm = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Handle requesting password reset
  const onRequestReset = async (data: RequestResetFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setIsResetEmailSent(true);
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting new password
  const onSetNewPassword = async (data: NewPasswordFormValues) => {
    setIsLoading(true);
    try {
      await updatePassword(data.password);
      navigate("/login");
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  // If user has already received the reset email
  if (isResetEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Verifique seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link to="/login">
              <Button variant="outline">Voltar ao login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If user has a reset token and needs to set a new password
  if (hasResetToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Definir nova senha</CardTitle>
            <CardDescription>Crie uma nova senha para sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...newPasswordForm}>
              <form onSubmit={newPasswordForm.handleSubmit(onSetNewPassword)} className="space-y-4">
                <FormField
                  control={newPasswordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirme a Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Atualizando..." : "Definir nova senha"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-sm text-center">
            <Link to="/login" className="text-gestorpro-600 hover:underline">
              Voltar ao login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Initial password reset request form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Recuperação de Senha</CardTitle>
          <CardDescription>
            Digite seu e-mail para receber um link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...requestResetForm}>
            <form onSubmit={requestResetForm.handleSubmit(onRequestReset)} className="space-y-4">
              <FormField
                control={requestResetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-sm text-center">
          <Link to="/login" className="text-gestorpro-600 hover:underline">
            Voltar ao login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
