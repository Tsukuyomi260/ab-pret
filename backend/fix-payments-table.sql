-- =====================================================
-- CORRECTION DE LA TABLE PAYMENTS
-- =====================================================

-- Ajouter les colonnes manquantes à la table payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Mettre à jour les enregistrements existants avec des valeurs par défaut
UPDATE public.payments 
SET 
    payment_method = 'mobile_money' 
WHERE payment_method IS NULL;

UPDATE public.payments 
SET 
    payment_date = created_at 
WHERE payment_date IS NULL;

-- Vérifier que toutes les colonnes nécessaires existent
DO $$
BEGIN
    -- Vérifier les colonnes existantes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'payment_method'
    ) THEN
        RAISE EXCEPTION 'La colonne payment_method n''existe toujours pas';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'payment_date'
    ) THEN
        RAISE EXCEPTION 'La colonne payment_date n''existe toujours pas';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'description'
    ) THEN
        RAISE EXCEPTION 'La colonne description n''existe toujours pas';
    END IF;
    
    RAISE NOTICE '✅ Table payments corrigée avec succès !';
    RAISE NOTICE '✅ Colonnes payment_method, payment_date et description ajoutées !';
END $$;
