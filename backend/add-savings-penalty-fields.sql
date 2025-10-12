-- Ajouter les colonnes pour la gestion des dépôts d'épargne en retard
-- Exécuter ce script dans Supabase SQL Editor

-- Ajouter la colonne pour le statut de retard
ALTER TABLE public.savings_plans
ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT FALSE;

-- Ajouter la colonne pour la date de début du retard
ALTER TABLE public.savings_plans
ADD COLUMN IF NOT EXISTS overdue_since TIMESTAMP WITH TIME ZONE;

-- Ajouter la colonne pour le nombre de jours de retard
ALTER TABLE public.savings_plans
ADD COLUMN IF NOT EXISTS days_overdue INTEGER DEFAULT 0;

-- Ajouter la colonne pour indiquer si le plan est suspendu
ALTER TABLE public.savings_plans
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Ajouter la colonne pour la date de suspension
ALTER TABLE public.savings_plans
ADD COLUMN IF NOT EXISTS suspended_since TIMESTAMP WITH TIME ZONE;

-- Ajouter la colonne pour les intérêts perdus à cause du retard
ALTER TABLE public.savings_plans
ADD COLUMN IF NOT EXISTS lost_interest_amount DECIMAL(12,2) DEFAULT 0;

-- Ajouter un index sur le statut pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_savings_plans_status ON public.savings_plans(status);

-- Ajouter un index sur le statut de retard
CREATE INDEX IF NOT EXISTS idx_savings_plans_overdue ON public.savings_plans(is_overdue);

-- Ajouter un index sur la date du prochain dépôt
CREATE INDEX IF NOT EXISTS idx_savings_plans_next_deposit ON public.savings_plans(next_deposit_date);

-- Commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN public.savings_plans.is_overdue IS 'Indique si le plan est en retard de dépôt';
COMMENT ON COLUMN public.savings_plans.overdue_since IS 'Date de début du retard';
COMMENT ON COLUMN public.savings_plans.days_overdue IS 'Nombre de jours de retard';
COMMENT ON COLUMN public.savings_plans.is_suspended IS 'Indique si le plan est suspendu (7+ jours de retard)';
COMMENT ON COLUMN public.savings_plans.suspended_since IS 'Date de suspension du plan';
COMMENT ON COLUMN public.savings_plans.lost_interest_amount IS 'Montant des intérêts perdus à cause du retard';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'savings_plans' 
AND column_name IN ('is_overdue', 'overdue_since', 'days_overdue', 'is_suspended', 'suspended_since', 'lost_interest_amount')
ORDER BY column_name;
