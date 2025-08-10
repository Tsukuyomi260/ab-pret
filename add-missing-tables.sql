-- =====================================================
-- AJOUT DES TABLES MANQUANTES
-- =====================================================

-- Table des comptes d'épargne
CREATE TABLE IF NOT EXISTS public.savings_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    monthly_goal DECIMAL(15,2) DEFAULT 0.00,
    interest_rate DECIMAL(5,2) DEFAULT 2.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table des transactions d'épargne
CREATE TABLE IF NOT EXISTS public.savings_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    savings_account_id UUID NOT NULL REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'interest')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_savings_accounts_user_id ON public.savings_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_account_id ON public.savings_transactions(savings_account_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_user_id ON public.savings_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_created_at ON public.savings_transactions(created_at);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger sur savings_accounts
DROP TRIGGER IF EXISTS update_savings_accounts_updated_at ON public.savings_accounts;
CREATE TRIGGER update_savings_accounts_updated_at
    BEFORE UPDATE ON public.savings_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour savings_accounts
CREATE POLICY "Users can view their own savings account" ON public.savings_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings account" ON public.savings_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings account" ON public.savings_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Politiques RLS pour savings_transactions
CREATE POLICY "Users can view their own savings transactions" ON public.savings_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings transactions" ON public.savings_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques admin (si l'utilisateur a le rôle admin)
CREATE POLICY "Admins can view all savings accounts" ON public.savings_accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all savings transactions" ON public.savings_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Commentaires sur les tables
COMMENT ON TABLE public.savings_accounts IS 'Table des comptes d''épargne des utilisateurs';
COMMENT ON TABLE public.savings_transactions IS 'Table des transactions d''épargne';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Tables savings_accounts et savings_transactions créées avec succès !';
    RAISE NOTICE '✅ Index, triggers et politiques RLS configurés !';
END $$;
