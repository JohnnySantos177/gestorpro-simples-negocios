
-- Cria a view de overview dos usuários para o painel admin mestre
CREATE OR REPLACE VIEW public.super_admin_user_overview AS
SELECT
  p.id,
  p.nome,
  p.email,
  p.tipo_plano,
  p.tipo_usuario,
  p.status,
  p.created_at,
  p.updated_at,
  p.telefone,
  c.nome_completo,
  c.empresa,
  c.cargo,
  c.cidade,
  c.estado,
  COALESCE((
    SELECT COUNT(*) FROM clientes cl WHERE cl.user_id = p.id
  ), 0) AS total_clientes,
  COALESCE((
    SELECT COUNT(*) FROM produtos pr WHERE pr.user_id = p.id
  ), 0) AS total_produtos,
  COALESCE((
    SELECT SUM(co.valor_total) FROM compras co WHERE co.user_id = p.id
  ), 0) AS total_vendas
FROM profiles p
LEFT JOIN user_contacts c ON c.user_id = p.id;
