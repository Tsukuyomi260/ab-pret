-- =====================================================
-- SCRIPT D'INSPECTION DE LA BASE DE DONNÉES SUPABASE
-- =====================================================

-- 1. VÉRIFIER LES TABLES EXISTANTES
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. VÉRIFIER LES COLONNES DE CHAQUE TABLE
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND c.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- 3. VÉRIFIER LES INDEX EXISTANTS
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. VÉRIFIER LES CONTRAINTES (PRIMARY KEY, FOREIGN KEY, CHECK)
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 5. VÉRIFIER LES POLITIQUES RLS
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. VÉRIFIER LES TRIGGERS
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. VÉRIFIER LES FONCTIONS
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 8. COMPTER LES ENREGISTREMENTS PAR TABLE
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM public.users
UNION ALL
SELECT 
    'loans' as table_name,
    COUNT(*) as record_count
FROM public.loans
UNION ALL
SELECT 
    'payments' as table_name,
    COUNT(*) as record_count
FROM public.payments
UNION ALL
SELECT 
    'savings_accounts' as table_name,
    COUNT(*) as record_count
FROM public.savings_accounts
UNION ALL
SELECT 
    'savings_transactions' as table_name,
    COUNT(*) as record_count
FROM public.savings_transactions
UNION ALL
SELECT 
    'otp_codes' as table_name,
    COUNT(*) as record_count
FROM public.otp_codes;

-- 9. VÉRIFIER LES UTILISATEURS EXISTANTS (SANS MOTS DE PASSE)
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
LIMIT 10;

-- 10. VÉRIFIER LES PRÊTS EXISTANTS
SELECT 
    l.id,
    l.amount,
    l.purpose,
    l.status,
    l.created_at,
    u.first_name || ' ' || u.last_name as user_name
FROM public.loans l
LEFT JOIN public.users u ON l.user_id = u.id
ORDER BY l.created_at DESC
LIMIT 10;

-- 11. VÉRIFIER LES COMPTES ÉPARGNE
SELECT 
    sa.id,
    sa.balance,
    sa.monthly_goal,
    sa.interest_rate,
    sa.created_at,
    u.first_name || ' ' || u.last_name as user_name
FROM public.savings_accounts sa
LEFT JOIN public.users u ON sa.user_id = u.id
ORDER BY sa.created_at DESC
LIMIT 10;

-- 12. VÉRIFIER LES CODES OTP RÉCENTS
SELECT 
    phone_number,
    type,
    used,
    expires_at,
    created_at
FROM public.otp_codes
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- REQUÊTES DE DIAGNOSTIC SPÉCIFIQUES
-- =====================================================

-- Vérifier si RLS est activé sur les tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Vérifier les permissions sur les tables
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
ORDER BY table_name, privilege_type;

-- Vérifier les séquences (pour les IDs auto-incrémentés)
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name;
