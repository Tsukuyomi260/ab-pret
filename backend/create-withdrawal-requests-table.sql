-- Script pour créer la table withdrawal_requests (demandes de retrait)
-- Date: 2025-01-13

-- 1. Créer la table withdrawal_requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  savings_plan_id UUID NOT NULL REFERENCES public.savings_plans(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES public.users(id),
  notes TEXT,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

-- 2. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id 
ON public.withdrawal_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_savings_plan_id 
ON public.withdrawal_requests(savings_plan_id);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status 
ON public.withdrawal_requests(status);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at 
ON public.withdrawal_requests(created_at DESC);

-- 3. Créer un index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status_created_at 
ON public.withdrawal_requests(status, created_at DESC);

-- 4. Ajouter des commentaires pour documenter la table
COMMENT ON TABLE public.withdrawal_requests IS 'Demandes de retrait des plans d''épargne';
COMMENT ON COLUMN public.withdrawal_requests.id IS 'Identifiant unique de la demande';
COMMENT ON COLUMN public.withdrawal_requests.user_id IS 'ID de l''utilisateur qui fait la demande';
COMMENT ON COLUMN public.withdrawal_requests.savings_plan_id IS 'ID du plan d''épargne concerné';
COMMENT ON COLUMN public.withdrawal_requests.amount IS 'Montant à retirer';
COMMENT ON COLUMN public.withdrawal_requests.phone_number IS 'Numéro de téléphone pour recevoir le transfert';
COMMENT ON COLUMN public.withdrawal_requests.recipient_name IS 'Nom du bénéficiaire du transfert';
COMMENT ON COLUMN public.withdrawal_requests.status IS 'Statut de la demande (pending, approved, rejected, completed)';
COMMENT ON COLUMN public.withdrawal_requests.created_at IS 'Date de création de la demande';
COMMENT ON COLUMN public.withdrawal_requests.processed_at IS 'Date de traitement de la demande';
COMMENT ON COLUMN public.withdrawal_requests.processed_by IS 'ID de l''admin qui a traité la demande';
COMMENT ON COLUMN public.withdrawal_requests.notes IS 'Notes ou commentaires de l''admin';

-- 5. Créer une politique RLS pour sécuriser l'accès
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir uniquement leurs propres demandes
CREATE POLICY "Users can view their own withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres demandes
CREATE POLICY "Users can create their own withdrawal requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique : Les admins peuvent voir toutes les demandes
CREATE POLICY "Admins can view all withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Politique : Les admins peuvent mettre à jour toutes les demandes
CREATE POLICY "Admins can update all withdrawal requests"
ON public.withdrawal_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Créer une fonction pour vérifier si un plan est éligible au retrait
CREATE OR REPLACE FUNCTION public.is_plan_eligible_for_withdrawal(plan_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  plan_record RECORD;
BEGIN
  -- Récupérer le plan
  SELECT 
    current_balance,
    target_amount,
    status,
    is_overdue
  INTO plan_record
  FROM public.savings_plans
  WHERE id = plan_id;
  
  -- Vérifier les conditions
  IF plan_record.status = 'active' 
     AND plan_record.current_balance >= plan_record.target_amount
     AND NOT plan_record.is_overdue THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Afficher la structure de la table pour vérification
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'withdrawal_requests'
ORDER BY ordinal_position;

-- 8. Vérifier les index créés
SELECT 
    indexname, 
    indexdef
FROM pg_indexes
WHERE tablename = 'withdrawal_requests'
  AND schemaname = 'public'
ORDER BY indexname;

