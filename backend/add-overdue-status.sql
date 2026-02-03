-- ============================================
-- Autoriser le statut 'overdue' pour les prêts en retard
-- ============================================
-- À exécuter dans Supabase > SQL Editor pour que les pénalités
-- (2% par jour) soient enregistrées et que le prêt passe en "en retard".
-- ============================================

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE public.loans
DROP CONSTRAINT IF EXISTS loans_status_check;

-- 2. Recréer la contrainte avec 'overdue' inclus
ALTER TABLE public.loans
ADD CONSTRAINT loans_status_check
CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected', 'overdue'));

-- 3. Vérification
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.loans'::regclass AND conname = 'loans_status_check';
