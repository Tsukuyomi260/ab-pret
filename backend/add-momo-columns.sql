-- =====================================================
-- AJOUT DES COLONNES MOMO À LA TABLE LOANS
-- =====================================================

-- 1. Ajouter les colonnes Momo si elles n'existent pas
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS momo_number TEXT,
ADD COLUMN IF NOT EXISTS momo_network TEXT,
ADD COLUMN IF NOT EXISTS momo_name TEXT;

-- 2. Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND table_schema = 'public'
AND column_name IN ('momo_number', 'momo_network', 'momo_name')
ORDER BY column_name;

-- 3. Vérifier les données existantes
SELECT 
    id,
    user_id,
    momo_number,
    momo_network,
    momo_name,
    created_at
FROM public.loans 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonnes Momo ajoutées à la table loans !';
    RAISE NOTICE '📱 Les nouvelles demandes de prêt incluront les informations Momo';
    RAISE NOTICE '🔧 Les prêts existants auront des valeurs NULL pour Momo';
END $$;
