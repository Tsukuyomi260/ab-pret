-- =====================================================
-- CRÉATION DE LA TABLE SAVINGS_PLANS
-- =====================================================

-- Créer la table savings_plans
CREATE TABLE IF NOT EXISTS savings_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fixed_amount DECIMAL(10,2) NOT NULL,
    frequency INTEGER NOT NULL CHECK (frequency IN (5, 10)),
    duration INTEGER NOT NULL CHECK (duration IN (1, 2, 3, 6)),
    total_deposits INTEGER DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    estimated_benefits DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    completed_deposits INTEGER DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    total_interest_earned DECIMAL(10,2) DEFAULT 0
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_savings_plans_user_id ON savings_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_plans_status ON savings_plans(status);
CREATE INDEX IF NOT EXISTS idx_savings_plans_created_at ON savings_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_savings_plans_user_status ON savings_plans(user_id, status);

-- Activer Row Level Security (RLS)
ALTER TABLE savings_plans ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies s'il y en a
DROP POLICY IF EXISTS "Users can view their own savings plans" ON savings_plans;
DROP POLICY IF EXISTS "Users can insert their own savings plans" ON savings_plans;
DROP POLICY IF EXISTS "Users can update their own savings plans" ON savings_plans;
DROP POLICY IF EXISTS "Users can delete their own savings plans" ON savings_plans;

-- Créer les nouvelles policies RLS
CREATE POLICY "Users can view their own savings plans" ON savings_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings plans" ON savings_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings plans" ON savings_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings plans" ON savings_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Créer la fonction de mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_savings_plans_updated_at ON savings_plans;
CREATE TRIGGER update_savings_plans_updated_at 
    BEFORE UPDATE ON savings_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Vérifier que tout a été créé correctement
SELECT 
    'Table créée avec succès' as status,
    COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'savings_plans';

SELECT 
    'RLS activé' as status,
    rowsecurity as rls_status
FROM pg_tables 
WHERE tablename = 'savings_plans'
AND schemaname = 'public';

SELECT 
    'Policies créées' as status,
    COUNT(*) as nombre_policies
FROM pg_policies 
WHERE tablename = 'savings_plans'
AND schemaname = 'public';
