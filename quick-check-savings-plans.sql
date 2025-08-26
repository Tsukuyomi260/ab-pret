-- =====================================================
-- VÉRIFICATION RAPIDE DE LA TABLE SAVINGS_PLANS
-- =====================================================

-- 1. La table existe-t-elle ?
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'savings_plans'
        ) 
        THEN '✅ Table savings_plans EXISTE'
        ELSE '❌ Table savings_plans N''EXISTE PAS'
    END as table_status;

-- 2. Si elle existe, afficher sa structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'savings_plans'
ORDER BY ordinal_position;

-- 3. Vérifier les RLS policies
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'savings_plans'
AND schemaname = 'public';

-- 4. Compter les enregistrements
SELECT 
    COUNT(*) as nombre_plans
FROM savings_plans;

-- 5. Voir les 3 derniers plans créés
SELECT 
    id,
    user_id,
    fixed_amount,
    frequency,
    duration,
    status,
    created_at
FROM savings_plans 
ORDER BY created_at DESC 
LIMIT 3;

