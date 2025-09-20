-- =====================================================
-- SIMPLIFICATION DE LA TABLE PAYMENTS
-- =====================================================

-- Supprimer la table existante
DROP TABLE IF EXISTS public.payments CASCADE;

-- Créer une nouvelle table payments simplifiée
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL DEFAULT 'mobile_money',
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    transaction_id TEXT,
    description TEXT,
    metadata JSONB
);

-- Ajouter les contraintes de clés étrangères
ALTER TABLE public.payments 
ADD CONSTRAINT fk_payments_loan_id 
FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;

ALTER TABLE public.payments 
ADD CONSTRAINT fk_payments_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Créer les index pour les performances
CREATE INDEX idx_payments_loan_id ON public.payments(loan_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);

-- Activer RLS (Row Level Security)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politique RLS simple : permettre tout au service role, restreindre aux utilisateurs
CREATE POLICY "Allow all operations for service role" ON public.payments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Table payments simplifiée créée !';
    RAISE NOTICE '📊 Colonnes: id, loan_id, user_id, amount, method, status, created_at, updated_at, payment_date, transaction_id, description, metadata';
    RAISE NOTICE '🔓 Service role peut tout faire (webhook)';
    RAISE NOTICE '👤 Utilisateurs peuvent voir leurs paiements';
    RAISE NOTICE '🛡️ RLS activé avec politiques simples';
END $$;
