-- Ajouter les colonnes pour la gestion des prêts en retard
-- Exécuter ce script dans Supabase SQL Editor

-- Ajouter la colonne pour le taux de pénalité quotidien
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS daily_penalty_rate DECIMAL(5,2) DEFAULT 2.0;

-- Ajouter la colonne pour le montant total des pénalités
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS total_penalty_amount DECIMAL(12,2) DEFAULT 0;

-- Ajouter la colonne pour la dernière date de calcul des pénalités
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS last_penalty_calculation TIMESTAMP WITH TIME ZONE;

-- Ajouter un index sur le statut pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);

-- Ajouter un index sur la date d'approbation pour optimiser les calculs d'échéance
CREATE INDEX IF NOT EXISTS idx_loans_approved_at ON public.loans(approved_at);

-- Mettre à jour les prêts existants avec le taux de pénalité par défaut
UPDATE public.loans 
SET daily_penalty_rate = 2.0 
WHERE daily_penalty_rate IS NULL;

-- Commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN public.loans.daily_penalty_rate IS 'Taux de pénalité quotidien en pourcentage (défaut: 2.0%)';
COMMENT ON COLUMN public.loans.total_penalty_amount IS 'Montant total des pénalités accumulées en FCFA';
COMMENT ON COLUMN public.loans.last_penalty_calculation IS 'Date de la dernière mise à jour des pénalités';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'loans' 
AND column_name IN ('daily_penalty_rate', 'total_penalty_amount', 'last_penalty_calculation')
ORDER BY column_name;
