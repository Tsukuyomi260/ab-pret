-- =====================================================
-- DÉSACTIVER LA CONFIRMATION D'EMAIL (VERSION SIMPLIFIÉE)
-- =====================================================

-- 1. Vérifier les utilisateurs non confirmés
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 2. Confirmer manuellement tous les utilisateurs existants
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. Vérifier le résultat
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Vérifier les utilisateurs dans notre table users
SELECT 
    id,
    first_name,
    last_name,
    phone_number,
    email,
    status,
    created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Configuration terminée !';
    RAISE NOTICE '✅ Tous les utilisateurs sont maintenant confirmés';
    RAISE NOTICE '✅ Vous pouvez maintenant vous connecter avec votre téléphone et mot de passe';
END $$;
