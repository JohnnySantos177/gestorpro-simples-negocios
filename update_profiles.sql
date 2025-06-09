-- Atualizar a tabela profiles para incluir todos os campos necessários
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ALTER COLUMN tipo_usuario SET DEFAULT 'usuario',
ALTER COLUMN tipo_plano SET DEFAULT 'padrao';

-- Atualizar o perfil do admin
UPDATE public.profiles
SET 
    tipo_usuario = 'admin_mestre',
    tipo_plano = 'premium',
    is_super_admin = true,
    status = 'active',
    updated_at = NOW()
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'johnnysantos_177@msn.com'
);

-- Garantir que as políticas de RLS estão corretas
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios perfis" ON public.profiles;
CREATE POLICY "Usuários podem ver apenas seus próprios perfis"
ON public.profiles
FOR ALL
USING (
    auth.uid() = id 
    OR 
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND (tipo_usuario = 'admin_mestre' OR is_super_admin = true)
    )
);

-- Garantir que o RLS está ativado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 