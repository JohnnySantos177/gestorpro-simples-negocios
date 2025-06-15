
-- Consolidate and clean up RLS policies for better security
-- Remove all existing conflicting policies first
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.clientes;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.produtos;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.compras;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.fornecedores;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.transacoes;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.feedbacks;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.user_contacts;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.promocoes;

-- Drop duplicate policies
DROP POLICY IF EXISTS "clientes_select_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_insert_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_update_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_delete_policy" ON public.clientes;

DROP POLICY IF EXISTS "produtos_select_policy" ON public.produtos;
DROP POLICY IF EXISTS "produtos_insert_policy" ON public.produtos;
DROP POLICY IF EXISTS "produtos_update_policy" ON public.produtos;
DROP POLICY IF EXISTS "produtos_delete_policy" ON public.produtos;

-- Clean up other duplicate policies for all tables
DROP POLICY IF EXISTS "compras_select_policy" ON public.compras;
DROP POLICY IF EXISTS "compras_insert_policy" ON public.compras;
DROP POLICY IF EXISTS "compras_update_policy" ON public.compras;
DROP POLICY IF EXISTS "compras_delete_policy" ON public.compras;

DROP POLICY IF EXISTS "fornecedores_select_policy" ON public.fornecedores;
DROP POLICY IF EXISTS "fornecedores_insert_policy" ON public.fornecedores;
DROP POLICY IF EXISTS "fornecedores_update_policy" ON public.fornecedores;
DROP POLICY IF EXISTS "fornecedores_delete_policy" ON public.fornecedores;

DROP POLICY IF EXISTS "transacoes_select_policy" ON public.transacoes;
DROP POLICY IF EXISTS "transacoes_insert_policy" ON public.transacoes;
DROP POLICY IF EXISTS "transacoes_update_policy" ON public.transacoes;
DROP POLICY IF EXISTS "transacoes_delete_policy" ON public.transacoes;

DROP POLICY IF EXISTS "feedbacks_select_policy" ON public.feedbacks;
DROP POLICY IF EXISTS "feedbacks_insert_policy" ON public.feedbacks;
DROP POLICY IF EXISTS "feedbacks_update_policy" ON public.feedbacks;
DROP POLICY IF EXISTS "feedbacks_delete_policy" ON public.feedbacks;

DROP POLICY IF EXISTS "user_contacts_select_policy" ON public.user_contacts;
DROP POLICY IF EXISTS "user_contacts_insert_policy" ON public.user_contacts;
DROP POLICY IF EXISTS "user_contacts_update_policy" ON public.user_contacts;
DROP POLICY IF EXISTS "user_contacts_delete_policy" ON public.user_contacts;

DROP POLICY IF EXISTS "promocoes_select_policy" ON public.promocoes;
DROP POLICY IF EXISTS "promocoes_insert_policy" ON public.promocoes;
DROP POLICY IF EXISTS "promocoes_update_policy" ON public.promocoes;
DROP POLICY IF EXISTS "promocoes_delete_policy" ON public.promocoes;

-- Create standardized, secure RLS policies for all main tables
-- Using a consistent naming pattern and the secure admin function

-- CLIENTES table policies
CREATE POLICY "clientes_owner_select" ON public.clientes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "clientes_owner_insert" ON public.clientes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "clientes_owner_update" ON public.clientes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "clientes_owner_delete" ON public.clientes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- PRODUTOS table policies
CREATE POLICY "produtos_owner_select" ON public.produtos
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "produtos_owner_insert" ON public.produtos
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "produtos_owner_update" ON public.produtos
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "produtos_owner_delete" ON public.produtos
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- COMPRAS table policies
CREATE POLICY "compras_owner_select" ON public.compras
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "compras_owner_insert" ON public.compras
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "compras_owner_update" ON public.compras
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "compras_owner_delete" ON public.compras
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- FORNECEDORES table policies
CREATE POLICY "fornecedores_owner_select" ON public.fornecedores
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "fornecedores_owner_insert" ON public.fornecedores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "fornecedores_owner_update" ON public.fornecedores
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "fornecedores_owner_delete" ON public.fornecedores
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- TRANSACOES table policies
CREATE POLICY "transacoes_owner_select" ON public.transacoes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "transacoes_owner_insert" ON public.transacoes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "transacoes_owner_update" ON public.transacoes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "transacoes_owner_delete" ON public.transacoes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- FEEDBACKS table policies
CREATE POLICY "feedbacks_owner_select" ON public.feedbacks
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "feedbacks_owner_insert" ON public.feedbacks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "feedbacks_owner_update" ON public.feedbacks
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "feedbacks_owner_delete" ON public.feedbacks
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- USER_CONTACTS table policies
CREATE POLICY "user_contacts_owner_select" ON public.user_contacts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "user_contacts_owner_insert" ON public.user_contacts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_contacts_owner_update" ON public.user_contacts
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "user_contacts_owner_delete" ON public.user_contacts
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- PROMOCOES table policies
CREATE POLICY "promocoes_owner_select" ON public.promocoes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "promocoes_owner_insert" ON public.promocoes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "promocoes_owner_update" ON public.promocoes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "promocoes_owner_delete" ON public.promocoes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- Add missing RLS policies for subscription-related tables
CREATE POLICY "subscriptions_owner_select" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "subscriptions_owner_insert" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "subscriptions_owner_update" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "payments_owner_select" ON public.payments
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "payments_owner_insert" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "checkout_sessions_owner_select" ON public.checkout_sessions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- Ensure all tables have RLS enabled
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Create audit trigger for security monitoring
CREATE OR REPLACE FUNCTION public.audit_rls_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access to sensitive tables for security monitoring
  IF TG_OP = 'SELECT' AND TG_TABLE_NAME IN ('subscriptions', 'payments', 'checkout_sessions') THEN
    INSERT INTO public.security_audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      success,
      metadata
    ) VALUES (
      auth.uid(),
      'table_access',
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      true,
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_subscriptions_access ON public.subscriptions;
CREATE TRIGGER audit_subscriptions_access
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_rls_access();

DROP TRIGGER IF EXISTS audit_payments_access ON public.payments;
CREATE TRIGGER audit_payments_access
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_rls_access();
