-- Script pour corriger la contrainte de statut des prêts
-- Ajoute 'rejected' aux valeurs autorisées pour le statut des prêts

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_status_check;

-- 2. Créer une nouvelle contrainte avec 'rejected' inclus
ALTER TABLE public.loans 
ADD CONSTRAINT loans_status_check 
CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected'));

-- 3. Vérifier que la contrainte a été appliquée
-- (Cette requête sera exécutée pour vérifier)
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'loans_status_check' 
AND conrelid = 'public.loans'::regclass;
