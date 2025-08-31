-- =====================================================
-- AJOUT DU STATUT 'COMPLETED' À LA TABLE LOANS
-- =====================================================

-- 1. Vérifier la contrainte actuelle sur status
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
AND conname LIKE '%status%';

-- 2. Supprimer l'ancienne contrainte si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.loans'::regclass 
        AND conname LIKE '%status%'
    ) THEN
        ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_status_check;
        RAISE NOTICE '✅ Ancienne contrainte status supprimée';
    ELSE
        RAISE NOTICE 'ℹ️ Aucune contrainte status existante';
    END IF;
END $$;

-- 3. Ajouter la nouvelle contrainte avec 'completed'
ALTER TABLE public.loans 
ADD CONSTRAINT loans_status_check 
CHECK (status IN ('pending', 'approved', 'active', 'completed'));

-- 4. Vérifier que la contrainte a été ajoutée
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
AND conname = 'loans_status_check';

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Statut "completed" ajouté à la table loans !';
    RAISE NOTICE '🎯 Les prêts remboursés pourront maintenant avoir le statut "completed"';
    RAISE NOTICE '📊 Le webhook pourra mettre à jour le statut automatiquement';
END $$; 