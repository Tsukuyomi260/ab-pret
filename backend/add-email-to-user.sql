-- =====================================================
-- AJOUTER UN EMAIL À L'UTILISATEUR EXISTANT
-- =====================================================

-- 1. Vérifier l'utilisateur actuel
SELECT 
    id,
    first_name,
    last_name,
    phone_number,
    email,
    created_at
FROM public.users 
WHERE phone_number = '53489846';

-- 2. Mettre à jour l'email de l'utilisateur
UPDATE public.users 
SET email = 'onel.ezin@campusfinance.bj'
WHERE phone_number = '53489846';

-- 3. Vérifier le résultat
SELECT 
    id,
    first_name,
    last_name,
    phone_number,
    email,
    created_at
FROM public.users 
WHERE phone_number = '53489846';

-- 4. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Email ajouté à l''utilisateur onel EZIN !';
    RAISE NOTICE '✅ Nouvel email: onel.ezin@campusfinance.bj';
    RAISE NOTICE '✅ Vous pouvez maintenant vous connecter avec cet email ou le téléphone';
END $$;
