-- =====================================================
-- AJOUT SIMPLIFIÉ DES CONTRAINTES DE MONTANT
-- =====================================================

-- Vérifier que la table loans existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loans') THEN
        RAISE EXCEPTION 'La table loans n''existe pas. Appliquez d''abord le schéma de base.';
    END IF;
END $$;

-- Ajouter une contrainte CHECK pour le montant minimum (seulement si elle n'existe pas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_loan_amount_minimum'
    ) THEN
        ALTER TABLE public.loans 
        ADD CONSTRAINT check_loan_amount_minimum 
        CHECK (amount >= 1000.00);
        
        RAISE NOTICE '✅ Contrainte de montant minimum ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  Contrainte de montant minimum existe déjà';
    END IF;
END $$;

-- Ajouter une contrainte CHECK pour le montant maximum (seulement si elle n'existe pas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_loan_amount_maximum'
    ) THEN
        ALTER TABLE public.loans 
        ADD CONSTRAINT check_loan_amount_maximum 
        CHECK (amount <= 500000.00);
        
        RAISE NOTICE '✅ Contrainte de montant maximum ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️  Contrainte de montant maximum existe déjà';
    END IF;
END $$;

-- Vérifier que les contraintes ont été ajoutées
SELECT 
    'RÉSUMÉ DES CONTRAINTES AJOUTÉES' as section,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
AND conname LIKE 'check_loan_amount%'
ORDER BY conname;

-- Message de confirmation
SELECT 
    '🎯 CONTRAINTES DE MONTANT ACTIVES' as status,
    'Montant minimum: 1000 FCFA' as detail_1,
    'Montant maximum: 500000 FCFA' as detail_2,
    'Validation côté base de données: ACTIVE' as detail_3;
