-- =====================================================
-- VÉRIFICATION DE L'ÉTAT ACTUEL DE LA BASE DE DONNÉES
-- =====================================================

-- 1. Vérifier les tables existantes
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Vérifier si la table notifications existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications'
        ) THEN '✅ Table notifications EXISTE'
        ELSE '❌ Table notifications N''EXISTE PAS'
    END as status_notifications;

-- 3. Vérifier si la table loans existe et ses contraintes
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'loans'
        ) THEN '✅ Table loans EXISTE'
        ELSE '❌ Table loans N''EXISTE PAS'
    END as status_loans;

-- 4. Si la table loans existe, vérifier ses contraintes
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'loans'
    ) THEN
        RAISE NOTICE '📋 Contraintes sur la table loans:';
        
        -- Lister les contraintes CHECK
        FOR r IN 
            SELECT 
                conname as constraint_name,
                pg_get_constraintdef(oid) as definition
            FROM pg_constraint 
            WHERE conrelid = 'public.loans'::regclass 
            AND contype = 'c'
        LOOP
            RAISE NOTICE '   - %: %', r.constraint_name, r.definition;
        END LOOP;
        
        -- Lister les colonnes
        RAISE NOTICE '📊 Colonnes de la table loans:';
        FOR r IN 
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'loans'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '   - %: % (%s, nullable: %s, default: %s)', 
                r.column_name, 
                r.data_type, 
                r.is_nullable, 
                r.column_default;
        END LOOP;
    END IF;
END $$;

-- 5. Vérifier les utilisateurs existants
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as users_approved,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as users_pending,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as users_rejected
FROM public.users;

-- 6. Vérifier les prêts existants
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'loans'
    ) THEN
        RAISE NOTICE '📊 Statistiques des prêts:';
        
        -- Compter les prêts par statut
        FOR r IN 
            SELECT 
                status,
                COUNT(*) as count,
                MIN(amount) as min_amount,
                MAX(amount) as max_amount,
                AVG(amount) as avg_amount
            FROM public.loans 
            GROUP BY status
        LOOP
            RAISE NOTICE '   - %: % prêts (montant: %s - %s FCFA, moyenne: %s FCFA)', 
                r.status, 
                r.count, 
                r.min_amount, 
                r.max_amount, 
                ROUND(r.avg_amount, 2);
        END LOOP;
    END IF;
END $$;

-- 7. Résumé de l'état
SELECT 
    'RÉSUMÉ DE L''ÉTAT ACTUEL' as section,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications')
        THEN '✅ Système de notifications COMPLET'
        ELSE '⚠️  Système de notifications INCOMPLET (table manquante)'
    END as notifications_status,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loans')
        THEN '✅ Système de prêts ACTIF'
        ELSE '❌ Système de prêts INACTIF (table manquante)'
    END as loans_status,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
        THEN '✅ Système d''utilisateurs ACTIF'
        ELSE '❌ Système d''utilisateurs INACTIF (table manquante)'
    END as users_status;
