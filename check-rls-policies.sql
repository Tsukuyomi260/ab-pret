-- =====================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- =====================================================

-- 1. Vérifier les politiques sur storage.objects
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%documents%'
ORDER BY policyname;

-- 2. Vérifier les politiques sur storage.buckets
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'buckets' 
AND schemaname = 'storage'
AND policyname LIKE '%documents%'
ORDER BY policyname;

-- 3. Vérifier les politiques sur public.users (si elles existent)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public'
ORDER BY policyname;

-- 4. Vérifier les politiques sur public.loans (si elles existent)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'loans' 
AND schemaname = 'public'
ORDER BY policyname;

-- 5. Afficher un résumé des politiques RLS
DO $$
DECLARE
    storage_policies_count INTEGER;
    bucket_policies_count INTEGER;
    users_policies_count INTEGER;
    loans_policies_count INTEGER;
BEGIN
    -- Compter les politiques storage.objects
    SELECT COUNT(*) INTO storage_policies_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%documents%';
    
    -- Compter les politiques storage.buckets
    SELECT COUNT(*) INTO bucket_policies_count
    FROM pg_policies 
    WHERE tablename = 'buckets' 
    AND schemaname = 'storage'
    AND policyname LIKE '%documents%';
    
    -- Compter les politiques public.users
    SELECT COUNT(*) INTO users_policies_count
    FROM pg_policies 
    WHERE tablename = 'users' 
    AND schemaname = 'public';
    
    -- Compter les politiques public.loans
    SELECT COUNT(*) INTO loans_policies_count
    FROM pg_policies 
    WHERE tablename = 'loans' 
    AND schemaname = 'public';
    
    -- Afficher le résumé
    RAISE NOTICE '=== RÉSUMÉ DES POLITIQUES RLS ===';
    RAISE NOTICE 'Storage.objects (documents): % politiques', storage_policies_count;
    RAISE NOTICE 'Storage.buckets (documents): % politiques', bucket_policies_count;
    RAISE NOTICE 'Public.users: % politiques', users_policies_count;
    RAISE NOTICE 'Public.loans: % politiques', loans_policies_count;
    
    -- Vérifications spécifiques
    IF storage_policies_count >= 4 THEN
        RAISE NOTICE '✅ Politiques storage.objects: CONFIGURÉES';
    ELSE
        RAISE NOTICE '❌ Politiques storage.objects: MANQUANTES';
        RAISE NOTICE '🔧 Exécutez setup-storage.sql pour configurer les politiques';
    END IF;
    
    IF bucket_policies_count >= 1 THEN
        RAISE NOTICE '✅ Politiques storage.buckets: CONFIGURÉES';
    ELSE
        RAISE NOTICE '⚠️ Politiques storage.buckets: MANQUANTES (optionnel)';
    END IF;
    
    IF users_policies_count >= 1 THEN
        RAISE NOTICE '✅ Politiques public.users: CONFIGURÉES';
    ELSE
        RAISE NOTICE '⚠️ Politiques public.users: MANQUANTES (optionnel)';
    END IF;
    
    IF loans_policies_count >= 1 THEN
        RAISE NOTICE '✅ Politiques public.loans: CONFIGURÉES';
    ELSE
        RAISE NOTICE '⚠️ Politiques public.loans: MANQUANTES (optionnel)';
    END IF;
    
END $$;

-- 6. Vérifier les permissions sur le bucket documents
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'buckets' 
AND table_schema = 'storage'
AND grantee IN ('anon', 'authenticated', 'service_role');

-- 7. Vérifier les permissions sur storage.objects
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'objects' 
AND table_schema = 'storage'
AND grantee IN ('anon', 'authenticated', 'service_role');

