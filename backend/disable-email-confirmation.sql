-- =====================================================
-- DÉSACTIVER LA CONFIRMATION D'EMAIL DANS SUPABASE
-- =====================================================

-- 1. Vérifier les paramètres actuels
SELECT 
    name,
    value,
    description
FROM auth.config 
WHERE name LIKE '%email%';

-- 2. Désactiver la confirmation d'email
UPDATE auth.config 
SET value = 'false'
WHERE name = 'enable_signup';

-- 3. Désactiver la confirmation d'email pour les nouveaux utilisateurs
UPDATE auth.config 
SET value = 'false'
WHERE name = 'enable_email_confirmations';

-- 4. Vérifier les utilisateurs non confirmés
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

-- 5. Confirmer manuellement les utilisateurs existants
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 6. Vérifier la configuration mise à jour
SELECT 
    name,
    value,
    description
FROM auth.config 
WHERE name LIKE '%email%' OR name LIKE '%signup%';

-- 7. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Configuration email mise à jour !';
    RAISE NOTICE '✅ Confirmation email désactivée pour les nouveaux utilisateurs';
    RAISE NOTICE '✅ Utilisateurs existants confirmés manuellement';
END $$;
