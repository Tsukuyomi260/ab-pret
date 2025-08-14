-- =====================================================
-- AJOUT DU CHAMP DAILY_PENALTY_RATE À LA TABLE LOANS
-- =====================================================

-- Ajouter le champ daily_penalty_rate à la table loans
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS daily_penalty_rate DECIMAL(5,2) DEFAULT 2.0;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.loans.daily_penalty_rate IS 'Taux de pénalité quotidienne en pourcentage (défaut: 2%)';

-- Mettre à jour les prêts existants avec la valeur par défaut
UPDATE public.loans 
SET daily_penalty_rate = 2.0 
WHERE daily_penalty_rate IS NULL;

-- Vérifier que le champ a été ajouté
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'loans' AND column_name = 'daily_penalty_rate';
