-- =====================================================
-- APPROBATION AUTOMATIQUE DES UTILISATEURS
-- =====================================================

-- 1. Mettre à jour tous les utilisateurs en attente vers "approved"
UPDATE public.users 
SET 
    status = 'approved',
    updated_at = NOW()
WHERE status = 'pending';

-- 2. Vérifier le nombre d'utilisateurs mis à jour
SELECT 
    COUNT(*) as users_approved
FROM public.users 
WHERE status = 'approved';

-- 3. Afficher un résumé des statuts
SELECT 
    status,
    COUNT(*) as count
FROM public.users 
GROUP BY status
ORDER BY status;

-- 4. Vérifier que la mise à jour a fonctionné
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone_number,
    status,
    created_at,
    updated_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Tous les utilisateurs en attente ont été approuvés automatiquement !';
    RAISE NOTICE '✅ Les nouvelles inscriptions seront automatiquement approuvées.';
END $$;
