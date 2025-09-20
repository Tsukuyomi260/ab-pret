-- =====================================================
-- AJOUT DES COLONNES MANQUANTES À LA TABLE LOANS
-- =====================================================

-- Vérifier et ajouter les colonnes manquantes
DO $$ 
BEGIN
    -- 1. Ajouter la colonne duration si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'duration') THEN
        ALTER TABLE public.loans ADD COLUMN duration INTEGER DEFAULT 12;
        RAISE NOTICE '✅ Colonne duration ajoutée avec valeur par défaut 12';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne duration existe déjà';
    END IF;
    
    -- 2. Ajouter la colonne interest_rate si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'interest_rate') THEN
        ALTER TABLE public.loans ADD COLUMN interest_rate DECIMAL(5,2) DEFAULT 10.0;
        RAISE NOTICE '✅ Colonne interest_rate ajoutée avec valeur par défaut 10.0';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne interest_rate existe déjà';
    END IF;
    
    -- 3. Ajouter la colonne monthly_payment si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'monthly_payment') THEN
        ALTER TABLE public.loans ADD COLUMN monthly_payment DECIMAL(15,2);
        RAISE NOTICE '✅ Colonne monthly_payment ajoutée (nullable)';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne monthly_payment existe déjà';
    END IF;
    
    -- 4. Ajouter la colonne loan_type si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'loan_type') THEN
        ALTER TABLE public.loans ADD COLUMN loan_type VARCHAR(50) DEFAULT 'general';
        RAISE NOTICE '✅ Colonne loan_type ajoutée avec valeur par défaut general';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne loan_type existe déjà';
    END IF;
    
    -- 5. Ajouter la colonne daily_penalty_rate si elle n'existe pas
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'daily_penalty_rate') THEN
        ALTER TABLE public.loans ADD COLUMN daily_penalty_rate DECIMAL(5,2) DEFAULT 2.0;
        RAISE NOTICE '✅ Colonne daily_penalty_rate ajoutée avec valeur par défaut 2.0';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne daily_penalty_rate existe déjà';
    END IF;
    
    -- 6. Ajouter la colonne purpose si elle n'existe pas (peut-être déjà présente)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'purpose') THEN
        ALTER TABLE public.loans ADD COLUMN purpose TEXT;
        RAISE NOTICE '✅ Colonne purpose ajoutée (nullable)';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne purpose existe déjà';
    END IF;
    
    RAISE NOTICE '🎯 Vérification et ajout des colonnes terminé !';
END $$;

-- Vérifier la structure finale
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'loans' 
ORDER BY ordinal_position;

-- Vérifier le nombre total de colonnes
SELECT COUNT(*) as nombre_colonnes_final
FROM information_schema.columns 
WHERE table_name = 'loans';
