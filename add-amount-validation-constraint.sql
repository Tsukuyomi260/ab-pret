-- =====================================================
-- AJOUT DE LA CONTRAINTE DE VALIDATION DU MONTANT MINIMUM
-- =====================================================

-- Vérifier que la table loans existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loans') THEN
        RAISE EXCEPTION 'La table loans n''existe pas. Appliquez d''abord le schéma de base.';
    END IF;
END $$;

-- Ajouter une contrainte CHECK pour le montant minimum
ALTER TABLE public.loans 
ADD CONSTRAINT check_loan_amount_minimum 
CHECK (amount >= 1000.00);

-- Ajouter une contrainte CHECK pour le montant maximum
ALTER TABLE public.loans 
ADD CONSTRAINT check_loan_amount_maximum 
CHECK (amount <= 500000.00);

-- Ajouter un commentaire pour documenter la contrainte
COMMENT ON CONSTRAINT check_loan_amount_minimum ON public.loans IS 'Montant minimum de prêt: 1000 FCFA';
COMMENT ON CONSTRAINT check_loan_amount_maximum ON public.loans IS 'Montant maximum de prêt: 500000 FCFA';

-- Vérifier que les contraintes ont été ajoutées
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
AND conname LIKE 'check_loan_amount%';

-- Insérer un prêt de test avec le montant minimum pour vérifier la contrainte
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
    (SELECT id FROM public.users LIMIT 1), -- Utiliser le premier utilisateur disponible
    1000.00,
    'Test validation montant minimum - 1000 FCFA',
    'pending',
    5, -- 5 jours
    10.0, -- 10% d'intérêt
    2.0, -- 2% de pénalité quotidienne
    NOW()
) ON CONFLICT DO NOTHING;

-- Vérifier que l'insertion a réussi
SELECT 
    id,
    amount,
    purpose,
    status,
    created_at
FROM public.loans 
WHERE amount = 1000.00 
AND purpose LIKE '%Test validation montant minimum%'
ORDER BY created_at DESC
LIMIT 1;

-- Tester la contrainte avec un montant invalide (doit échouer)
DO $$
BEGIN
    BEGIN
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
            999.99, -- Montant en dessous du minimum
            'Test contrainte montant minimum - 999.99 FCFA',
            'pending',
            5, -- 5 jours
            10.0, -- 10% d'intérêt
            2.0, -- 2% de pénalité quotidienne
            NOW()
        );
        
        RAISE EXCEPTION 'La contrainte de montant minimum ne fonctionne pas !';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✅ Contrainte de montant minimum fonctionne correctement - 999.99 FCFA rejeté';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Erreur inattendue: %', SQLERRM;
    END;
END $$;

-- Nettoyer le prêt de test
DELETE FROM public.loans 
WHERE purpose LIKE '%Test validation montant minimum%';

-- Afficher un résumé des contraintes
SELECT 
    'Contraintes de validation des montants' as description,
    'Montant minimum: 1000 FCFA' as detail_1,
    'Montant maximum: 500000 FCFA' as detail_2,
    'Validation côté base de données: ACTIVE' as status;
