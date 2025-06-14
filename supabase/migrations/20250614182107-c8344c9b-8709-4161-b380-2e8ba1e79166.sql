
-- First, let's create the missing subscription-related tables that are referenced in the edge functions
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default subscription price if it doesn't exist
INSERT INTO public.settings (key, value, description) 
VALUES ('subscription_price', '8990', 'Default subscription price in cents (R$89.90)')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for settings (admin-only access)
CREATE POLICY "Only admins can view settings" ON public.settings
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update settings" ON public.settings
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert settings" ON public.settings
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete settings" ON public.settings
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Create RLS policies for subscribers (users can only see their own data)
CREATE POLICY "Users can view own subscriber info" ON public.subscribers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriber info" ON public.subscribers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriber info" ON public.subscribers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriber info" ON public.subscribers
  FOR DELETE USING (auth.uid() = user_id);

-- Create a more secure admin verification function that doesn't rely on hardcoded emails
CREATE OR REPLACE FUNCTION public.is_admin_secure(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Check if user has admin role in profiles table
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = user_id 
        AND (tipo_usuario = 'admin_mestre' OR is_super_admin = true)
        AND status = 'active'
    );
END;
$function$;

-- Add comprehensive RLS policies for all main tables (INSERT, UPDATE, DELETE operations)
-- CLIENTES policies
DROP POLICY IF EXISTS "clientes_insert_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_update_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_delete_policy" ON public.clientes;

CREATE POLICY "clientes_insert_policy" ON public.clientes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "clientes_update_policy" ON public.clientes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "clientes_delete_policy" ON public.clientes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- PRODUTOS policies
DROP POLICY IF EXISTS "produtos_insert_policy" ON public.produtos;
DROP POLICY IF EXISTS "produtos_update_policy" ON public.produtos;
DROP POLICY IF EXISTS "produtos_delete_policy" ON public.produtos;

CREATE POLICY "produtos_insert_policy" ON public.produtos
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "produtos_update_policy" ON public.produtos
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "produtos_delete_policy" ON public.produtos
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- COMPRAS policies
DROP POLICY IF EXISTS "compras_insert_policy" ON public.compras;
DROP POLICY IF EXISTS "compras_update_policy" ON public.compras;
DROP POLICY IF EXISTS "compras_delete_policy" ON public.compras;

CREATE POLICY "compras_insert_policy" ON public.compras
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "compras_update_policy" ON public.compras
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "compras_delete_policy" ON public.compras
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- FORNECEDORES policies
DROP POLICY IF EXISTS "fornecedores_insert_policy" ON public.fornecedores;
DROP POLICY IF EXISTS "fornecedores_update_policy" ON public.fornecedores;
DROP POLICY IF EXISTS "fornecedores_delete_policy" ON public.fornecedores;

CREATE POLICY "fornecedores_insert_policy" ON public.fornecedores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "fornecedores_update_policy" ON public.fornecedores
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "fornecedores_delete_policy" ON public.fornecedores
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- TRANSACOES policies
DROP POLICY IF EXISTS "transacoes_insert_policy" ON public.transacoes;
DROP POLICY IF EXISTS "transacoes_update_policy" ON public.transacoes;
DROP POLICY IF EXISTS "transacoes_delete_policy" ON public.transacoes;

CREATE POLICY "transacoes_insert_policy" ON public.transacoes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "transacoes_update_policy" ON public.transacoes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "transacoes_delete_policy" ON public.transacoes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- Create audit log table for better security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.security_audit_logs
  FOR SELECT USING (public.is_admin_secure(auth.uid()));
