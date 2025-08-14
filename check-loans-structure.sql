-- =====================================================
-- VÉRIFICATION DE LA STRUCTURE DE LA TABLE LOANS
-- =====================================================

-- 1. Vérifier toutes les colonnes de la table loans
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'loans'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes NOT NULL
SELECT 
    column_name,
    'NOT NULL' as constraint_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'loans'
AND is_nullable = 'NO'
ORDER BY column_name;

-- 3. Vérifier les contraintes CHECK existantes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
ORDER BY conname;

-- 4. Vérifier les valeurs par défaut
SELECT 
    column_name,
    column_default,
    CASE 
        WHEN column_default IS NOT NULL THEN '✅ Valeur par défaut'
        ELSE '❌ Pas de valeur par défaut'
    END as default_status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'loans'
ORDER BY column_name;

-- 5. Résumé des colonnes obligatoires
SELECT 
    'COLONNES OBLIGATOIRES (NOT NULL)' as section,
    string_agg(column_name, ', ' ORDER BY column_name) as required_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'loans'
AND is_nullable = 'NO';

-- 6. Résumé des colonnes optionnelles
SELECT 
    'COLONNES OPTIONNELLES (NULLABLE)' as section,
    string_agg(column_name, ', ' ORDER BY column_name) as optional_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'loans'
AND is_nullable = 'YES';


