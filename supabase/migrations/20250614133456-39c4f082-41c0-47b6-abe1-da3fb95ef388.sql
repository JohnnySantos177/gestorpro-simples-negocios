
-- Primeiro, vamos remover todas as políticas RLS existentes que podem estar causando conflitos
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.clientes;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.produtos;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.compras;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.fornecedores;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.transacoes;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.feedbacks;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.user_contacts;
DROP POLICY IF EXISTS "Allow access only to own data or admin" ON public.promocoes;

-- Agora vamos criar políticas RLS específicas para cada operação (SELECT, INSERT, UPDATE, DELETE)
-- CLIENTES
CREATE POLICY "clientes_select_policy" ON public.clientes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "clientes_insert_policy" ON public.clientes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "clientes_update_policy" ON public.clientes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "clientes_delete_policy" ON public.clientes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- PRODUTOS
CREATE POLICY "produtos_select_policy" ON public.produtos
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "produtos_insert_policy" ON public.produtos
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "produtos_update_policy" ON public.produtos
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "produtos_delete_policy" ON public.produtos
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- COMPRAS
CREATE POLICY "compras_select_policy" ON public.compras
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "compras_insert_policy" ON public.compras
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "compras_update_policy" ON public.compras
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "compras_delete_policy" ON public.compras
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- FORNECEDORES
CREATE POLICY "fornecedores_select_policy" ON public.fornecedores
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "fornecedores_insert_policy" ON public.fornecedores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "fornecedores_update_policy" ON public.fornecedores
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "fornecedores_delete_policy" ON public.fornecedores
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- TRANSACOES
CREATE POLICY "transacoes_select_policy" ON public.transacoes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "transacoes_insert_policy" ON public.transacoes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "transacoes_update_policy" ON public.transacoes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "transacoes_delete_policy" ON public.transacoes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- FEEDBACKS
CREATE POLICY "feedbacks_select_policy" ON public.feedbacks
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "feedbacks_insert_policy" ON public.feedbacks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "feedbacks_update_policy" ON public.feedbacks
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "feedbacks_delete_policy" ON public.feedbacks
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- USER_CONTACTS
CREATE POLICY "user_contacts_select_policy" ON public.user_contacts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "user_contacts_insert_policy" ON public.user_contacts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_contacts_update_policy" ON public.user_contacts
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "user_contacts_delete_policy" ON public.user_contacts
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- PROMOCOES
CREATE POLICY "promocoes_select_policy" ON public.promocoes
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "promocoes_insert_policy" ON public.promocoes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "promocoes_update_policy" ON public.promocoes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "promocoes_delete_policy" ON public.promocoes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
