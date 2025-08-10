-- =====================================================
-- SCHEMA COMPLET POUR AB CAMPUS FINANCE
-- =====================================================

-- ===== TABLE USERS (Déjà existante, mise à jour) =====
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    filiere VARCHAR(100),
    annee_etude VARCHAR(50),
    entite VARCHAR(100),
    -- Informations du témoin
    temoin_name VARCHAR(100),
    temoin_quartier VARCHAR(100),
    temoin_phone VARCHAR(20),
    temoin_email VARCHAR(255),
    -- Informations de contact d'urgence
    emergency_name VARCHAR(100),
    emergency_relation VARCHAR(50),
    emergency_phone VARCHAR(20),
    emergency_email VARCHAR(255),
    emergency_address TEXT,
    -- Documents
    user_identity_card_name VARCHAR(255),
    temoin_identity_card_name VARCHAR(255),
    student_card_name VARCHAR(255),
    -- Statut et rôle
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLE LOANS =====
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    purpose TEXT NOT NULL,
    loan_type VARCHAR(50) DEFAULT 'general',
    duration INTEGER DEFAULT 12, -- en mois
    interest_rate DECIMAL(5,2) DEFAULT 10.0, -- pourcentage
    monthly_payment DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected')),
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLE PAYMENTS =====
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'mobile_money',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLE SAVINGS_ACCOUNTS =====
CREATE TABLE IF NOT EXISTS public.savings_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0,
    monthly_goal DECIMAL(15,2) DEFAULT 50000,
    monthly_saved DECIMAL(15,2) DEFAULT 0,
    interest_rate DECIMAL(5,2) DEFAULT 3.5,
    total_interest DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLE SAVINGS_TRANSACTIONS =====
CREATE TABLE IF NOT EXISTS public.savings_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'interest')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLE OTP_CODES =====
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(20) DEFAULT 'registration' CHECK (type IN ('registration', 'login', 'reset')),
    request_id VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== INDEXES POUR PERFORMANCE =====

-- Users
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Loans
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON public.loans(created_at);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON public.payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Savings
CREATE INDEX IF NOT EXISTS idx_savings_accounts_user_id ON public.savings_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_user_id ON public.savings_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_type ON public.savings_transactions(type);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_created_at ON public.savings_transactions(created_at);

-- OTP
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_number ON public.otp_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_used ON public.otp_codes(used);

-- ===== FONCTIONS ET TRIGGERS =====

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at 
    BEFORE UPDATE ON public.loans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_accounts_updated_at 
    BEFORE UPDATE ON public.savings_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- ===== POLITIQUES RLS =====

-- Users
CREATE POLICY "Allow insert for registration" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for admin" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Allow update for admin" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Loans
CREATE POLICY "Allow users to read own loans" ON public.loans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own loans" ON public.loans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin to read all loans" ON public.loans
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Allow admin to update loans" ON public.loans
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Payments
CREATE POLICY "Allow users to read own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin to read all payments" ON public.payments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Savings Accounts
CREATE POLICY "Allow users to read own savings account" ON public.savings_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own savings account" ON public.savings_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own savings account" ON public.savings_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Savings Transactions
CREATE POLICY "Allow users to read own savings transactions" ON public.savings_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own savings transactions" ON public.savings_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- OTP Codes
CREATE POLICY "Allow insert for OTP generation" ON public.otp_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for OTP verification" ON public.otp_codes
    FOR SELECT USING (true);

CREATE POLICY "Allow update for OTP usage" ON public.otp_codes
    FOR UPDATE USING (true);

-- ===== DONNÉES DE TEST (OPTIONNEL) =====

-- Insérer un utilisateur admin par défaut (à modifier en production)
-- INSERT INTO public.users (
--     first_name, 
--     last_name, 
--     email, 
--     phone_number, 
--     password, 
--     status, 
--     role
-- ) VALUES (
--     'Admin',
--     'AB CAMPUS FINANCE',
--     'admin@abpret.com',
--     '+229 90 00 00 00',
--     'admin123', -- À changer en production
--     'approved',
--     'admin'
-- );

-- ===== COMMENTAIRES =====
COMMENT ON TABLE public.users IS 'Table des utilisateurs de l''application AB CAMPUS FINANCE';
COMMENT ON TABLE public.loans IS 'Table des prêts demandés par les utilisateurs';
COMMENT ON TABLE public.payments IS 'Table des paiements effectués pour les prêts';
COMMENT ON TABLE public.savings_accounts IS 'Table des comptes épargne des utilisateurs';
COMMENT ON TABLE public.savings_transactions IS 'Table des transactions d''épargne';
COMMENT ON TABLE public.otp_codes IS 'Table des codes OTP pour authentification';
