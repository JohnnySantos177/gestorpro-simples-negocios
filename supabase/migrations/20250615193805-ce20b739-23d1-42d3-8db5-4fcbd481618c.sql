
-- Enable RLS on all tables that currently lack protection
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for all tables
-- PRODUTOS policies
CREATE POLICY "produtos_owner_select" ON public.produtos
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "produtos_owner_insert" ON public.produtos
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "produtos_owner_update" ON public.produtos
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "produtos_owner_delete" ON public.produtos
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- USER_CONTACTS policies
CREATE POLICY "user_contacts_owner_select" ON public.user_contacts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "user_contacts_owner_insert" ON public.user_contacts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_contacts_owner_update" ON public.user_contacts
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "user_contacts_owner_delete" ON public.user_contacts
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- FEEDBACKS policies
CREATE POLICY "feedbacks_owner_select" ON public.feedbacks
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "feedbacks_owner_insert" ON public.feedbacks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "feedbacks_owner_update" ON public.feedbacks
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "feedbacks_owner_delete" ON public.feedbacks
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- CHECKOUT_SESSIONS policies
CREATE POLICY "checkout_sessions_owner_select" ON public.checkout_sessions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "checkout_sessions_owner_insert" ON public.checkout_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "checkout_sessions_owner_update" ON public.checkout_sessions
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- SUBSCRIPTIONS policies
CREATE POLICY "subscriptions_owner_select" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "subscriptions_owner_insert" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "subscriptions_owner_update" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- PAYMENTS policies
CREATE POLICY "payments_owner_select" ON public.payments
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "payments_owner_insert" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- SETTINGS policies (admin only)
CREATE POLICY "settings_admin_select" ON public.settings
  FOR SELECT USING (public.is_admin_secure(auth.uid()));

CREATE POLICY "settings_admin_insert" ON public.settings
  FOR INSERT WITH CHECK (public.is_admin_secure(auth.uid()));

CREATE POLICY "settings_admin_update" ON public.settings
  FOR UPDATE USING (public.is_admin_secure(auth.uid()));

CREATE POLICY "settings_admin_delete" ON public.settings
  FOR DELETE USING (public.is_admin_secure(auth.uid()));

-- TRANSACOES policies
CREATE POLICY "transacoes_owner_select" ON public.transacoes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "transacoes_owner_insert" ON public.transacoes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "transacoes_owner_update" ON public.transacoes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "transacoes_owner_delete" ON public.transacoes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- ADMIN_LOGS policies (admin only)
CREATE POLICY "admin_logs_admin_select" ON public.admin_logs
  FOR SELECT USING (public.is_admin_secure(auth.uid()));

CREATE POLICY "admin_logs_admin_insert" ON public.admin_logs
  FOR INSERT WITH CHECK (public.is_admin_secure(auth.uid()));

-- FORNECEDORES policies
CREATE POLICY "fornecedores_owner_select" ON public.fornecedores
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "fornecedores_owner_insert" ON public.fornecedores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "fornecedores_owner_update" ON public.fornecedores
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "fornecedores_owner_delete" ON public.fornecedores
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- PROMOCOES policies
CREATE POLICY "promocoes_owner_select" ON public.promocoes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "promocoes_owner_insert" ON public.promocoes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "promocoes_owner_update" ON public.promocoes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "promocoes_owner_delete" ON public.promocoes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- PROFILES policies
CREATE POLICY "profiles_owner_select" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- COMPRAS policies
CREATE POLICY "compras_owner_select" ON public.compras
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "compras_owner_insert" ON public.compras
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "compras_owner_update" ON public.compras
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "compras_owner_delete" ON public.compras
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- CLIENTES policies
CREATE POLICY "clientes_owner_select" ON public.clientes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "clientes_owner_insert" ON public.clientes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "clientes_owner_update" ON public.clientes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "clientes_owner_delete" ON public.clientes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- SUBSCRIBERS policies
CREATE POLICY "subscribers_owner_select" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

CREATE POLICY "subscribers_owner_insert" ON public.subscribers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "subscribers_owner_update" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_secure(auth.uid()));

-- SECURITY_AUDIT_LOGS policies (admin only for viewing, service role for inserting)
CREATE POLICY "security_audit_logs_admin_select" ON public.security_audit_logs
  FOR SELECT USING (public.is_admin_secure(auth.uid()));

CREATE POLICY "security_audit_logs_service_insert" ON public.security_audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR public.is_admin_secure(auth.uid()));

-- Create webhook events table for preventing replay attacks
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payment_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signature_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_payment_id ON public.webhook_events(payment_id);

-- Add RLS to webhook events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage webhook events
CREATE POLICY "Service role can manage webhook events" ON public.webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create security monitoring trigger
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access to sensitive tables for security monitoring
  IF TG_OP IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE') AND TG_TABLE_NAME IN ('subscriptions', 'payments', 'checkout_sessions', 'settings') THEN
    INSERT INTO public.security_audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      success,
      metadata
    ) VALUES (
      auth.uid(),
      'table_access_' || TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      true,
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add monitoring triggers to sensitive tables
DROP TRIGGER IF EXISTS log_subscriptions_access ON public.subscriptions;
CREATE TRIGGER log_subscriptions_access
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

DROP TRIGGER IF EXISTS log_payments_access ON public.payments;
CREATE TRIGGER log_payments_access
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

DROP TRIGGER IF EXISTS log_settings_access ON public.settings;
CREATE TRIGGER log_settings_access
  AFTER INSERT OR UPDATE OR DELETE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();
