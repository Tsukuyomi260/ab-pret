-- =====================================================
-- VÉRIFICATION DU STATUT DU STORAGE BUCKET
-- =====================================================

-- 1. Vérifier si le bucket existe
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'documents';

-- 2. Vérifier les politiques RLS sur storage.objects
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
AND policyname LIKE '%documents%';

-- 3. Vérifier les colonnes de stockage dans la table users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN (
    'user_identity_card_url',
    'temoin_identity_card_url', 
    'student_card_url',
    'user_identity_card_name',
    'temoin_identity_card_name',
    'student_card_name'
)
ORDER BY column_name;

-- 4. Compter les fichiers dans le bucket (si des politiques le permettent)
SELECT 
    COUNT(*) as total_files,
    COUNT(CASE WHEN name LIKE '%identity%' THEN 1 END) as identity_cards,
    COUNT(CASE WHEN name LIKE '%student%' THEN 1 END) as student_cards
FROM storage.objects 
WHERE bucket_id = 'documents';

-- 5. Afficher un résumé
DO $$
DECLARE
    bucket_exists BOOLEAN;
    policies_count INTEGER;
    columns_count INTEGER;
    files_count INTEGER;
BEGIN
    -- Vérifier si le bucket existe
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets WHERE id = 'documents'
    ) INTO bucket_exists;
    
    -- Compter les politiques
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%documents%';
    
    -- Compter les colonnes de stockage
    SELECT COUNT(*) INTO columns_count
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name IN (
        'user_identity_card_url',
        'temoin_identity_card_url', 
        'student_card_url',
        'user_identity_card_name',
        'temoin_identity_card_name',
        'student_card_name'
    );
    
    -- Compter les fichiers
    SELECT COUNT(*) INTO files_count
    FROM storage.objects 
    WHERE bucket_id = 'documents';
    
    -- Afficher le résumé
    RAISE NOTICE '=== RÉSUMÉ DE LA CONFIGURATION STORAGE ===';
    RAISE NOTICE 'Bucket "documents": %', CASE WHEN bucket_exists THEN '✅ Existe' ELSE '❌ Manquant' END;
    RAISE NOTICE 'Politiques RLS: %', CASE WHEN policies_count >= 4 THEN '✅ Configurées' ELSE '❌ Manquantes' END;
    RAISE NOTICE 'Colonnes de stockage: %', CASE WHEN columns_count >= 3 THEN '✅ Présentes' ELSE '❌ Manquantes' END;
    RAISE NOTICE 'Fichiers stockés: %', files_count;
    
    IF NOT bucket_exists THEN
        RAISE NOTICE '🔧 ACTION REQUISE: Exécutez setup-storage.sql pour créer le bucket';
    END IF;
    
    IF policies_count < 4 THEN
        RAISE NOTICE '🔧 ACTION REQUISE: Exécutez setup-storage.sql pour configurer les politiques RLS';
    END IF;
    
    IF columns_count < 3 THEN
        RAISE NOTICE '🔧 ACTION REQUISE: Exécutez setup-storage.sql pour ajouter les colonnes manquantes';
    END IF;
    
END $$;

