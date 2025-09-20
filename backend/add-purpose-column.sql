-- =====================================================
-- AJOUT DE LA COLONNE PURPOSE MANQUANTE
-- =====================================================

-- Ajouter la colonne purpose si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'loans' AND column_name = 'purpose') THEN
        ALTER TABLE public.loans ADD COLUMN purpose TEXT;
        RAISE NOTICE '✅ Colonne purpose ajoutée avec succès !';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne purpose existe déjà';
    END IF;
END $$;

-- Vérifier que la colonne a été ajoutée
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'loans' 
    AND column_name = 'purpose';

-- Vérifier la structure complète mise à jour
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'loans' 
ORDER BY ordinal_position;
