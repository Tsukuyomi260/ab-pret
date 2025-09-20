-- =====================================================
-- MISE À JOUR DES EMAILS DES UTILISATEURS EXISTANTS
-- =====================================================

-- 1. Vérifier les utilisateurs actuels
SELECT 
    id,
    first_name,
    last_name,
    phone_number,
    email,
    created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Vérifier les emails dans auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Mettre à jour les emails temporaires avec des emails plus lisibles
-- (Optionnel - seulement si vous voulez des emails plus propres)
UPDATE public.users 
SET email = CONCAT(
    LOWER(REPLACE(first_name, ' ', '')),
    '.',
    LOWER(REPLACE(last_name, ' ', '')),
    '@campusfinance.bj'
)
WHERE email LIKE 'user.%@gmail.com'
AND first_name IS NOT NULL 
AND last_name IS NOT NULL;

-- 4. Vérifier le résultat
SELECT 
    id,
    first_name,
    last_name,
    phone_number,
    email,
    created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Emails des utilisateurs mis à jour !';
    RAISE NOTICE '✅ Les nouveaux utilisateurs pourront saisir leur email réel';
    RAISE NOTICE '✅ Les utilisateurs existants ont des emails plus lisibles';
END $$;
