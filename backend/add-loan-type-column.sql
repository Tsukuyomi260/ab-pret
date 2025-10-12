-- Script SQL pour ajouter la colonne loan_type à la table loans
-- Exécuter ce script dans Supabase SQL Editor

-- Ajouter la colonne loan_type (catégorie du prêt)
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS loan_type TEXT;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.loans.loan_type IS 'Catégorie du prêt (education, business, personal, emergency)';

-- Créer un index pour optimiser les requêtes par type
CREATE INDEX IF NOT EXISTS idx_loans_loan_type ON public.loans(loan_type);

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND column_name = 'loan_type'
ORDER BY column_name;

-- Afficher un exemple de prêt avec la nouvelle colonne
SELECT id, user_id, amount, loan_type, status, created_at
FROM public.loans
LIMIT 5;

