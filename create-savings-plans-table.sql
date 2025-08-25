-- Script pour créer la table savings_plans
-- Cette table stocke les plans d'épargne configurés par les utilisateurs

-- Créer la table savings_plans si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.savings_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fixed_amount DECIMAL(10,2) NOT NULL,
    frequency INTEGER NOT NULL CHECK (frequency IN (5, 10)), -- 5 ou 10 jours
    duration INTEGER NOT NULL CHECK (duration IN (1, 2, 3, 6)), -- 1, 2, 3 ou 6 mois
    total_deposits INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    estimated_benefits DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    completed_deposits INTEGER DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    total_interest_earned DECIMAL(10,2) DEFAULT 0
);

-- Créer un index sur user_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_savings_plans_user_id ON public.savings_plans(user_id);

-- Créer un index sur status pour filtrer les plans actifs
CREATE INDEX IF NOT EXISTS idx_savings_plans_status ON public.savings_plans(status);

-- Créer un index sur created_at pour trier par date de création
CREATE INDEX IF NOT EXISTS idx_savings_plans_created_at ON public.savings_plans(created_at);

-- Activer RLS (Row Level Security)
ALTER TABLE public.savings_plans ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs peuvent voir leurs propres plans
CREATE POLICY "Users can view their own savings plans" ON public.savings_plans
    FOR SELECT USING (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent créer leurs propres plans
CREATE POLICY "Users can create their own savings plans" ON public.savings_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent modifier leurs propres plans
CREATE POLICY "Users can update their own savings plans" ON public.savings_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent supprimer leurs propres plans
CREATE POLICY "Users can delete their own savings plans" ON public.savings_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_savings_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER trigger_update_savings_plans_updated_at
    BEFORE UPDATE ON public.savings_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_plans_updated_at();

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.savings_plans IS 'Table des plans d''épargne configurés par les utilisateurs';
COMMENT ON COLUMN public.savings_plans.id IS 'Identifiant unique du plan';
COMMENT ON COLUMN public.savings_plans.user_id IS 'Identifiant de l''utilisateur propriétaire du plan';
COMMENT ON COLUMN public.savings_plans.fixed_amount IS 'Montant fixe à déposer à chaque échéance (en FCFA)';
COMMENT ON COLUMN public.savings_plans.frequency IS 'Fréquence des dépôts en jours (5 ou 10)';
COMMENT ON COLUMN public.savings_plans.duration IS 'Durée du plan en mois (1, 2, 3 ou 6)';
COMMENT ON COLUMN public.savings_plans.total_deposits IS 'Nombre total de dépôts prévus sur la durée du plan';
COMMENT ON COLUMN public.savings_plans.total_amount IS 'Montant total à épargner (total_deposits * fixed_amount)';
COMMENT ON COLUMN public.savings_plans.estimated_benefits IS 'Bénéfices estimés (intérêts) sur la durée du plan';
COMMENT ON COLUMN public.savings_plans.status IS 'Statut du plan (active, completed, cancelled)';
COMMENT ON COLUMN public.savings_plans.created_at IS 'Date de création du plan';
COMMENT ON COLUMN public.savings_plans.updated_at IS 'Date de dernière modification du plan';
COMMENT ON COLUMN public.savings_plans.start_date IS 'Date de début du plan';
COMMENT ON COLUMN public.savings_plans.end_date IS 'Date de fin prévue du plan';
COMMENT ON COLUMN public.savings_plans.completed_deposits IS 'Nombre de dépôts déjà effectués';
COMMENT ON COLUMN public.savings_plans.current_balance IS 'Solde actuel du plan';
COMMENT ON COLUMN public.savings_plans.total_interest_earned IS 'Total des intérêts gagnés sur le plan';

-- Afficher un message de confirmation
SELECT 'Table savings_plans créée avec succès !' as message;
