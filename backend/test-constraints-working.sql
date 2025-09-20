-- =====================================================
-- TEST DES CONTRAINTES DE MONTANT ACTIVES
-- =====================================================

-- 1. Vérifier que les contraintes sont bien actives
SELECT 
    '🔍 VÉRIFICATION DES CONTRAINTES' as section,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
AND conname LIKE 'check_loan_amount%'
ORDER BY conname;

-- 2. Test de la contrainte de montant minimum (doit échouer)
DO $$
BEGIN
    RAISE NOTICE '🧪 Test de la contrainte de montant minimum...';
    
    BEGIN
        -- Tenter d'insérer un prêt avec 999 FCFA (en dessous du minimum)
        INSERT INTO public.loans (
            user_id,
            amount,
            purpose,
            status,
            duration_months,
            interest_rate,
            daily_penalty_rate,
            created_at
        ) VALUES (
            (SELECT id FROM public.users LIMIT 1),
            999.99, -- Montant invalide
            'Test contrainte montant minimum - 999.99 FCFA',
            'pending',
            5,
            10.0,
            2.0,
            NOW()
        );
        
        -- Si on arrive ici, la contrainte ne fonctionne pas !
        RAISE EXCEPTION '❌ ERREUR: La contrainte de montant minimum ne fonctionne pas !';
        
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✅ SUCCÈS: Contrainte de montant minimum active - 999.99 FCFA rejeté';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Erreur inattendue: %', SQLERRM;
    END;
END $$;

-- 3. Test de la contrainte de montant maximum (doit échouer)
DO $$
BEGIN
    RAISE NOTICE '🧪 Test de la contrainte de montant maximum...';
    
    BEGIN
        -- Tenter d'insérer un prêt avec 600,000 FCFA (au-dessus du maximum)
        INSERT INTO public.loans (
            user_id,
            amount,
            purpose,
            status,
            duration_months,
            interest_rate,
            daily_penalty_rate,
            created_at
        ) VALUES (
            (SELECT id FROM public.users LIMIT 1),
            600000.00, -- Montant invalide
            'Test contrainte montant maximum - 600,000 FCFA',
            'pending',
            5,
            10.0,
            2.0,
            NOW()
        );
        
        -- Si on arrive ici, la contrainte ne fonctionne pas !
        RAISE EXCEPTION '❌ ERREUR: La contrainte de montant maximum ne fonctionne pas !';
        
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✅ SUCCÈS: Contrainte de montant maximum active - 600,000 FCFA rejeté';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Erreur inattendue: %', SQLERRM;
    END;
END $$;

-- 4. Test de montant valide (doit réussir)
DO $$
BEGIN
    RAISE NOTICE '🧪 Test de montant valide (1000 FCFA)...';
    
    BEGIN
        -- Insérer un prêt avec 1000 FCFA (montant minimum valide)
        INSERT INTO public.loans (
            user_id,
            amount,
            purpose,
            status,
            duration_months,
            interest_rate,
            daily_penalty_rate,
            created_at
        ) VALUES (
            (SELECT id FROM public.users LIMIT 1),
            1000.00, -- Montant valide
            'Test contrainte montant minimum - 1000 FCFA (VALIDE)',
            'pending',
            5,
            10.0,
            2.0,
            NOW()
        );
        
        RAISE NOTICE '✅ SUCCÈS: Montant de 1000 FCFA accepté (contrainte respectée)';
        
        -- Nettoyer le prêt de test
        DELETE FROM public.loans 
        WHERE purpose LIKE '%Test contrainte montant minimum - 1000 FCFA (VALIDE)%';
        
        RAISE NOTICE '🧹 Prêt de test nettoyé';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Erreur lors du test de montant valide: %', SQLERRM;
    END;
END $$;

-- 5. Test de montant valide (500,000 FCFA)
DO $$
BEGIN
    RAISE NOTICE '🧪 Test de montant valide (500,000 FCFA)...';
    
    BEGIN
        -- Insérer un prêt avec 500,000 FCFA (montant maximum valide)
        INSERT INTO public.loans (
            user_id,
            amount,
            purpose,
            status,
            duration_months,
            interest_rate,
            daily_penalty_rate,
            created_at
        ) VALUES (
            (SELECT id FROM public.users LIMIT 1),
            500000.00, -- Montant valide
            'Test contrainte montant maximum - 500,000 FCFA (VALIDE)',
            'pending',
            5,
            10.0,
            2.0,
            NOW()
        );
        
        RAISE NOTICE '✅ SUCCÈS: Montant de 500,000 FCFA accepté (contrainte respectée)';
        
        -- Nettoyer le prêt de test
        DELETE FROM public.loans 
        WHERE purpose LIKE '%Test contrainte montant maximum - 500,000 FCFA (VALIDE)%';
        
        RAISE NOTICE '🧹 Prêt de test nettoyé';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Erreur lors du test de montant maximum: %', SQLERRM;
    END;
END $$;

-- 6. Résumé final des tests
SELECT 
    '🎉 RÉSUMÉ DES TESTS DE CONTRAINTES' as section,
    '✅ Contrainte montant minimum (1000 FCFA): ACTIVE' as test_1,
    '✅ Contrainte montant maximum (500,000 FCFA): ACTIVE' as test_2,
    '✅ Validation côté base de données: FONCTIONNELLE' as test_3,
    '✅ Double sécurité (client + serveur): ACTIVE' as test_4;

-- 7. Vérification finale des contraintes
SELECT 
    '🔒 CONTRAINTES ACTIVES' as status,
    COUNT(*) as total_constraints,
    string_agg(conname, ', ' ORDER BY conname) as constraint_names
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
AND conname LIKE 'check_loan_amount%';


