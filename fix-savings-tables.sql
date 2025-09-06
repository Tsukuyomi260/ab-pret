-- =====================================================
-- CORRECTION DES TABLES D'ÉPARGNE
-- =====================================================

-- Supprimer les tables existantes s'il y en a (pour éviter les conflits)
DROP TABLE IF EXISTS public.savings_transactions CASCADE;
DROP TABLE IF EXISTS public.savings_accounts CASCADE;
DROP TABLE IF EXISTS public.savings_plans CASCADE;

-- Créer la table savings_accounts
CREATE TABLE public.savings_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    monthly_goal DECIMAL(15,2) DEFAULT 50000.00,
    monthly_saved DECIMAL(15,2) DEFAULT 0.00,
    interest_rate DECIMAL(5,2) DEFAULT 3.50,
    total_interest DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Créer la table savings_transactions
CREATE TABLE public.savings_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    savings_account_id UUID NOT NULL REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'interest')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Créer la table savings_plans
CREATE TABLE public.savings_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Créer les index pour les performances
CREATE INDEX idx_savings_accounts_user_id ON public.savings_accounts(user_id);
CREATE INDEX idx_savings_transactions_account_id ON public.savings_transactions(savings_account_id);
CREATE INDEX idx_savings_transactions_user_id ON public.savings_transactions(user_id);
CREATE INDEX idx_savings_transactions_created_at ON public.savings_transactions(created_at);
CREATE INDEX idx_savings_plans_user_id ON public.savings_plans(user_id);
CREATE INDEX idx_savings_plans_status ON public.savings_plans(status);
CREATE INDEX idx_savings_plans_user_status ON public.savings_plans(user_id, status);

-- Activer Row Level Security (RLS)
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_plans ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies s'il y en a
DROP POLICY IF EXISTS "Users can view their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can insert their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can update their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can view their own savings transactions" ON public.savings_transactions;
DROP POLICY IF EXISTS "Users can insert their own savings transactions" ON public.savings_transactions;
DROP POLICY IF EXISTS "Users can view their own savings plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can insert their own savings plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can update their own savings plans" ON public.savings_plans;

-- Créer les policies RLS pour savings_accounts
CREATE POLICY "Users can view their own savings accounts" ON public.savings_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings accounts" ON public.savings_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings accounts" ON public.savings_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Créer les policies RLS pour savings_transactions
CREATE POLICY "Users can view their own savings transactions" ON public.savings_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings transactions" ON public.savings_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Créer les policies RLS pour savings_plans
CREATE POLICY "Users can view their own savings plans" ON public.savings_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings plans" ON public.savings_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings plans" ON public.savings_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Créer le trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger sur savings_accounts et savings_plans
DROP TRIGGER IF EXISTS update_savings_accounts_updated_at ON public.savings_accounts;
CREATE TRIGGER update_savings_accounts_updated_at
    BEFORE UPDATE ON public.savings_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_savings_plans_updated_at ON public.savings_plans;
CREATE TRIGGER update_savings_plans_updated_at
    BEFORE UPDATE ON public.savings_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur les tables
COMMENT ON TABLE public.savings_accounts IS 'Table des comptes d''épargne des utilisateurs';
COMMENT ON TABLE public.savings_transactions IS 'Table des transactions d''épargne';
COMMENT ON TABLE public.savings_plans IS 'Table des plans d''épargne des utilisateurs';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables d''épargne créées avec succès !';
END $$;
