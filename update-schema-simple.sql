-- =====================================================
-- MISE À JOUR SIMPLIFIÉE DU SCHÉMA
-- =====================================================

-- 1. Modifier la valeur par défaut du statut pour les nouvelles inscriptions
ALTER TABLE public.users 
ALTER COLUMN status SET DEFAULT 'approved';

-- 2. Vérifier la configuration actuelle
SELECT 
    column_name,
    column_default,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'status';

-- 3. Afficher un résumé des statuts actuels
SELECT 
    status,
    COUNT(*) as count
FROM public.users 
GROUP BY status
ORDER BY status;

-- 4. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Schéma mis à jour avec succès !';
    RAISE NOTICE '✅ Nouvelles inscriptions seront automatiquement approuvées.';
    RAISE NOTICE '✅ Valeur par défaut du statut : approved';
END $$;
