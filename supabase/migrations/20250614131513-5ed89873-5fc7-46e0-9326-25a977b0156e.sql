
-- Função para checar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = user_id 
        AND (tipo_usuario = 'admin_mestre' OR is_super_admin = true)
    );
END;
$function$;

-- Para cada tabela, a política segue o padrão:
-- 1. Habilita RLS
-- 2. Permite SELECT para o próprio usuário ou para admins

-- CLIENTES
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.clientes;

CREATE POLICY "Allow access only to own data or admin"
  ON public.clientes
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- PRODUTOS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.produtos;

CREATE POLICY "Allow access only to own data or admin"
  ON public.produtos
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- COMPRAS
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.compras;

CREATE POLICY "Allow access only to own data or admin"
  ON public.compras
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- FORNECEDORES
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.fornecedores;

CREATE POLICY "Allow access only to own data or admin"
  ON public.fornecedores
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- TRANSACOES
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.transacoes;

CREATE POLICY "Allow access only to own data or admin"
  ON public.transacoes
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- FEEDBACKS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.feedbacks;

CREATE POLICY "Allow access only to own data or admin"
  ON public.feedbacks
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- USER_CONTACTS
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.user_contacts;

CREATE POLICY "Allow access only to own data or admin"
  ON public.user_contacts
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- PROMOCOES
ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.promocoes;

CREATE POLICY "Allow access only to own data or admin"
  ON public.promocoes
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );
