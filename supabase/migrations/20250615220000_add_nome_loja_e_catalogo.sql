-- Adiciona campo nome_loja (slug amigável) ao perfil do usuário
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nome_loja TEXT UNIQUE;

-- Adiciona campo para marcar produto como público no catálogo
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS publicar_no_catalogo BOOLEAN DEFAULT FALSE;

-- Adiciona campo para URL da foto do produto
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS foto_url TEXT; 