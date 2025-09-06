-- =====================================================
-- RECRÉATION COMPLÈTE DU SYSTÈME D'ÉPARGNE (VERSION CORRIGÉE)
-- =====================================================

-- Supprimer toutes les tables d'épargne existantes (dans l'ordre correct pour éviter les contraintes)
DROP TABLE IF EXISTS public.savings_transactions CASCADE;
DROP TABLE IF EXISTS public.savings_plans CASCADE;
DROP TABLE IF EXISTS public.savings_accounts CASCADE;

-- Supprimer les fonctions et triggers associés
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_savings_account_balance() CASCADE;
DROP FUNCTION IF EXISTS update_savings_plan_after_deposit() CASCADE;

-- =====================================================
-- 1. TABLE SAVINGS_ACCOUNTS (Comptes d'épargne)
-- =====================================================
CREATE TABLE public.savings_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    account_creation_fee_paid BOOLEAN DEFAULT FALSE NOT NULL, -- 1000F pour créer le compte
    account_creation_fee_amount DECIMAL(15,2) DEFAULT 1000.00,
    interest_rate DECIMAL(5,2) DEFAULT 3.50 NOT NULL,
    total_interest_earned DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABLE SAVINGS_PLANS (Plans d'épargne)
-- =====================================================
CREATE TABLE public.savings_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    savings_account_id UUID NOT NULL REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
    
    -- Configuration du plan
    plan_name VARCHAR(100) NOT NULL DEFAULT 'Plan d''épargne',
    fixed_amount DECIMAL(15,2) NOT NULL CHECK (fixed_amount > 0),
    frequency_days INTEGER NOT NULL CHECK (frequency_days IN (5, 10)), -- Tous les 5 ou 10 jours
    duration_months INTEGER NOT NULL CHECK (duration_months IN (1, 2, 3, 6)), -- Durée en mois
    
    -- Calculs (sans GENERATED ALWAYS AS pour éviter les erreurs d'immutabilité)
    total_deposits_required INTEGER NOT NULL,
    total_amount_target DECIMAL(15,2) NOT NULL,
    
    -- État actuel du plan
    completed_deposits INTEGER DEFAULT 0 NOT NULL CHECK (completed_deposits >= 0),
    current_balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (current_balance >= 0),
    total_deposited DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (total_deposited >= 0),
    
    -- Dates importantes
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    next_deposit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Statut du plan
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00 NOT NULL CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT
);

-- =====================================================
-- 3. TABLE SAVINGS_TRANSACTIONS (Transactions d'épargne)
-- =====================================================
CREATE TABLE public.savings_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    savings_account_id UUID NOT NULL REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
    savings_plan_id UUID REFERENCES public.savings_plans(id) ON DELETE SET NULL,
    
    -- Détails de la transaction
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'interest', 'account_creation_fee', 'plan_creation_fee')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    
    -- Métadonnées de paiement
    payment_method VARCHAR(50) DEFAULT 'mobile_money',
    payment_reference VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 4. INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour savings_accounts
CREATE INDEX idx_savings_accounts_user_id ON public.savings_accounts(user_id);
CREATE INDEX idx_savings_accounts_active ON public.savings_accounts(is_active);
CREATE INDEX idx_savings_accounts_created_at ON public.savings_accounts(created_at);

-- Index pour savings_plans
CREATE INDEX idx_savings_plans_user_id ON public.savings_plans(user_id);
CREATE INDEX idx_savings_plans_account_id ON public.savings_plans(savings_account_id);
CREATE INDEX idx_savings_plans_status ON public.savings_plans(status);
CREATE INDEX idx_savings_plans_active ON public.savings_plans(user_id, status) WHERE status = 'active';
CREATE INDEX idx_savings_plans_dates ON public.savings_plans(start_date, end_date);

-- Index pour savings_transactions
CREATE INDEX idx_savings_transactions_user_id ON public.savings_transactions(user_id);
CREATE INDEX idx_savings_transactions_account_id ON public.savings_transactions(savings_account_id);
CREATE INDEX idx_savings_transactions_plan_id ON public.savings_transactions(savings_plan_id);
CREATE INDEX idx_savings_transactions_type ON public.savings_transactions(type);
CREATE INDEX idx_savings_transactions_created_at ON public.savings_transactions(created_at);
CREATE INDEX idx_savings_transactions_payment_status ON public.savings_transactions(payment_status);

-- =====================================================
-- 5. FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour calculer les valeurs du plan
CREATE OR REPLACE FUNCTION calculate_plan_values(
    p_duration_months INTEGER,
    p_frequency_days INTEGER,
    p_fixed_amount DECIMAL(15,2)
) RETURNS TABLE(
    total_deposits_required INTEGER,
    total_amount_target DECIMAL(15,2),
    end_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY SELECT
        (p_duration_months * 30) / p_frequency_days as total_deposits_required,
        p_fixed_amount * ((p_duration_months * 30) / p_frequency_days) as total_amount_target,
        NOW() + INTERVAL '1 month' * p_duration_months as end_date;
END;
$$ language 'plpgsql';

-- Fonction pour mettre à jour le solde du compte après une transaction
CREATE OR REPLACE FUNCTION update_savings_account_balance()
RETURNS TRIGGER AS $$
DECLARE
    account_balance DECIMAL(15,2);
    transaction_amount DECIMAL(15,2);
BEGIN
    -- Récupérer le montant de la transaction
    transaction_amount := NEW.amount;
    
    -- Récupérer le solde actuel du compte
    SELECT balance INTO account_balance 
    FROM public.savings_accounts 
    WHERE id = NEW.savings_account_id;
    
    -- Mettre à jour le solde selon le type de transaction
    IF NEW.type = 'deposit' OR NEW.type = 'interest' THEN
        -- Augmenter le solde
        UPDATE public.savings_accounts 
        SET balance = balance + transaction_amount,
            last_activity_at = NOW()
        WHERE id = NEW.savings_account_id;
    ELSIF NEW.type = 'withdrawal' OR NEW.type = 'account_creation_fee' OR NEW.type = 'plan_creation_fee' THEN
        -- Diminuer le solde
        UPDATE public.savings_accounts 
        SET balance = balance - transaction_amount,
            last_activity_at = NOW()
        WHERE id = NEW.savings_account_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour mettre à jour le plan d'épargne après un dépôt
CREATE OR REPLACE FUNCTION update_savings_plan_after_deposit()
RETURNS TRIGGER AS $$
DECLARE
    plan_record RECORD;
    new_completion_percentage DECIMAL(5,2);
BEGIN
    -- Seulement pour les dépôts liés à un plan
    IF NEW.type = 'deposit' AND NEW.savings_plan_id IS NOT NULL THEN
        -- Récupérer les informations du plan
        SELECT * INTO plan_record 
        FROM public.savings_plans 
        WHERE id = NEW.savings_plan_id;
        
        -- Calculer le nouveau pourcentage de completion
        new_completion_percentage := CASE 
            WHEN plan_record.total_deposits_required > 0 THEN 
                ((plan_record.completed_deposits + 1)::DECIMAL / plan_record.total_deposits_required) * 100
            ELSE 0
        END;
        
        -- Mettre à jour le plan
        UPDATE public.savings_plans 
        SET 
            completed_deposits = completed_deposits + 1,
            total_deposited = total_deposited + NEW.amount,
            current_balance = current_balance + NEW.amount,
            next_deposit_date = next_deposit_date + INTERVAL '1 day' * plan_record.frequency_days,
            completion_percentage = new_completion_percentage,
            updated_at = NOW()
        WHERE id = NEW.savings_plan_id;
        
        -- Vérifier si le plan est terminé
        IF (plan_record.completed_deposits + 1) >= plan_record.total_deposits_required THEN
            UPDATE public.savings_plans 
            SET 
                status = 'completed',
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = NEW.savings_plan_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger pour updated_at sur savings_accounts
CREATE TRIGGER update_savings_accounts_updated_at
    BEFORE UPDATE ON public.savings_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur savings_plans
CREATE TRIGGER update_savings_plans_updated_at
    BEFORE UPDATE ON public.savings_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour le solde du compte
CREATE TRIGGER update_account_balance_after_transaction
    AFTER INSERT ON public.savings_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_account_balance();

-- Trigger pour mettre à jour le plan après un dépôt
CREATE TRIGGER update_plan_after_deposit
    AFTER INSERT ON public.savings_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_plan_after_deposit();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can insert their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can update their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can view their own savings plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can insert their own savings plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can update their own savings plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can view their own savings transactions" ON public.savings_transactions;
DROP POLICY IF EXISTS "Users can insert their own savings transactions" ON public.savings_transactions;

-- Policies pour savings_accounts
CREATE POLICY "Users can view their own savings accounts" ON public.savings_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings accounts" ON public.savings_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings accounts" ON public.savings_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour savings_plans
CREATE POLICY "Users can view their own savings plans" ON public.savings_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings plans" ON public.savings_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings plans" ON public.savings_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour savings_transactions
CREATE POLICY "Users can view their own savings transactions" ON public.savings_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings transactions" ON public.savings_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. COMMENTAIRES
-- =====================================================

COMMENT ON TABLE public.savings_accounts IS 'Comptes d''épargne des utilisateurs avec frais de création de 1000F';
COMMENT ON TABLE public.savings_plans IS 'Plans d''épargne avec durée définie et dépôts réguliers';
COMMENT ON TABLE public.savings_transactions IS 'Transactions d''épargne (dépôts, retraits, intérêts, frais)';

COMMENT ON COLUMN public.savings_accounts.account_creation_fee_paid IS 'Indique si les frais de création de compte (1000F) ont été payés';
COMMENT ON COLUMN public.savings_plans.frequency_days IS 'Fréquence des dépôts en jours (5 ou 10)';
COMMENT ON COLUMN public.savings_plans.duration_months IS 'Durée du plan en mois (1, 2, 3, ou 6)';
COMMENT ON COLUMN public.savings_plans.total_deposits_required IS 'Nombre total de dépôts requis (calculé lors de la création)';
COMMENT ON COLUMN public.savings_plans.completion_percentage IS 'Pourcentage de completion du plan (mis à jour automatiquement)';

-- =====================================================
-- 9. MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SYSTÈME D''ÉPARGNE RECRÉÉ AVEC SUCCÈS !';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tables créées :';
    RAISE NOTICE '- savings_accounts (comptes d''épargne)';
    RAISE NOTICE '- savings_plans (plans d''épargne)';
    RAISE NOTICE '- savings_transactions (transactions)';
    RAISE NOTICE '';
    RAISE NOTICE 'Fonctionnalités :';
    RAISE NOTICE '- Frais de création de compte : 1000F';
    RAISE NOTICE '- Plans avec durée définie (1, 2, 3, 6 mois)';
    RAISE NOTICE '- Dépôts réguliers (tous les 5 ou 10 jours)';
    RAISE NOTICE '- Calculs automatiques des montants et pourcentages';
    RAISE NOTICE '- Retraits possibles à la fin du plan';
    RAISE NOTICE '=====================================================';
END $$;
