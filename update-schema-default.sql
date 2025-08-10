-- =====================================================
-- MISE À JOUR DU SCHÉMA POUR APPROBATION AUTOMATIQUE
-- =====================================================

-- 1. Modifier la valeur par défaut du statut pour les nouvelles inscriptions
ALTER TABLE public.users 
ALTER COLUMN status SET DEFAULT 'approved';

-- 2. Vérifier la contrainte CHECK pour s'assurer que 'approved' est accepté
-- (Si la contrainte n'existe pas, on peut l'ajouter)
DO $$
BEGIN
    -- Vérifier si la contrainte existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'users_status_check'
    ) THEN
        -- Ajouter la contrainte si elle n'existe pas
        ALTER TABLE public.users 
        ADD CONSTRAINT users_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
    END IF;
END $$;

-- 3. Vérifier la configuration
SELECT 
    column_name,
    column_default,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'status';

-- 4. Afficher les contraintes existantes
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%status%';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Schéma mis à jour : nouvelles inscriptions seront automatiquement approuvées !';
    RAISE NOTICE '✅ Valeur par défaut du statut : approved';
END $$;
