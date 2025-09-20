-- =====================================================
-- VÉRIFICATION DES COLONNES MOMO DANS LA TABLE LOANS
-- =====================================================

-- 1. Vérifier la structure de la table loans
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND table_schema = 'public'
AND column_name LIKE '%momo%'
ORDER BY column_name;

-- 2. Vérifier si les colonnes Momo existent
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'loans' 
            AND table_schema = 'public' 
            AND column_name = 'momo_number'
        ) THEN '✅ momo_number existe'
        ELSE '❌ momo_number manquante'
    END as momo_number_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'loans' 
            AND table_schema = 'public' 
            AND column_name = 'momo_network'
        ) THEN '✅ momo_network existe'
        ELSE '❌ momo_network manquante'
    END as momo_network_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'loans' 
            AND table_schema = 'public' 
            AND column_name = 'momo_name'
        ) THEN '✅ momo_name existe'
        ELSE '❌ momo_name manquante'
    END as momo_name_status;

-- 3. Vérifier les données Momo existantes
SELECT 
    id,
    user_id,
    momo_number,
    momo_network,
    momo_name,
    created_at
FROM public.loans 
WHERE momo_number IS NOT NULL 
   OR momo_network IS NOT NULL 
   OR momo_name IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Compter les prêts avec données Momo
SELECT 
    COUNT(*) as total_loans,
    COUNT(momo_number) as loans_with_momo_number,
    COUNT(momo_network) as loans_with_momo_network,
    COUNT(momo_name) as loans_with_momo_name
FROM public.loans;
