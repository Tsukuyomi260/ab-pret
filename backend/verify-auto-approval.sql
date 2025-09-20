-- =====================================================
-- VÉRIFICATION DE L'APPROBATION AUTOMATIQUE
-- =====================================================

-- 1. Vérifier la configuration de la colonne status
SELECT 
    column_name,
    column_default,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'status';

-- 2. Afficher le résumé des statuts actuels
SELECT 
    status,
    COUNT(*) as count
FROM public.users 
GROUP BY status
ORDER BY status;

-- 3. Afficher les utilisateurs récents
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone_number,
    status,
    role,
    created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Vérifier les politiques RLS pour les utilisateurs approuvés
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Vérification terminée !';
    RAISE NOTICE '✅ Si column_default = approved, l''approbation automatique est active.';
    RAISE NOTICE '✅ Les nouvelles inscriptions auront le statut approved par défaut.';
END $$;
