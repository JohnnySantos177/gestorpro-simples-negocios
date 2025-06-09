-- Primeiro, vamos verificar se o usuário existe na tabela auth.users
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Obter o ID do usuário
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = 'johnnysantos_177@msn.com';

    IF user_id IS NOT NULL THEN
        -- Atualizar ou inserir o perfil
        INSERT INTO public.profiles (id, nome, tipo_plano, tipo_usuario, created_at, updated_at)
        VALUES (
            user_id,
            'Admin Master',
            'premium',
            'admin_mestre',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            tipo_usuario = 'admin_mestre',
            tipo_plano = 'premium',
            updated_at = NOW();

        -- Registrar a ação no log de admin
        INSERT INTO public.admin_logs (
            id,
            admin_id,
            action,
            target_user_id,
            details,
            created_at
        ) VALUES (
            gen_random_uuid(),
            user_id,
            'update_admin_status',
            user_id,
            jsonb_build_object(
                'tipo_usuario', 'admin_mestre',
                'tipo_plano', 'premium'
            ),
            NOW()
        );
    END IF;
END $$; 