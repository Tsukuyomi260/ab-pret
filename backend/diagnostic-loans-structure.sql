-- =====================================================
-- DIAGNOSTIC SIMPLE DE LA TABLE LOANS
-- =====================================================

-- 1. Vérifier les colonnes existantes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'loans' 
ORDER BY ordinal_position;

-- 2. Vérifier le nombre total de colonnes
SELECT COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_name = 'loans';

-- 3. Vérifier si les colonnes problématiques existent
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'duration') 
        THEN '✅ duration existe' 
        ELSE '❌ duration n''existe PAS' 
    END as check_duration,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'duration_months') 
        THEN '✅ duration_months existe' 
        ELSE '❌ duration_months n''existe PAS' 
    END as check_duration_months,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'interest_rate') 
        THEN '✅ interest_rate existe' 
        ELSE '❌ interest_rate n''existe PAS' 
    END as check_interest_rate;

-- 4. Vérifier les contraintes NOT NULL
SELECT 
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loans' 
    AND is_nullable = 'NO'
ORDER BY ordinal_position;
