-- =====================================================
-- RECRÉATION DE LA TABLE PAYMENTS (VERSION SIMPLIFIÉE)
-- =====================================================

-- Supprimer la table existante si elle existe
DROP TABLE IF EXISTS public.payments CASCADE;

-- Créer la nouvelle table payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('mobile_money', 'card', 'cash')),
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

-- Politique RLS : les utilisateurs peuvent voir leurs propres paiements
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent insérer leurs propres paiements
CREATE POLICY "Users can insert their own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique RLS : les utilisateurs peuvent mettre à jour leurs propres paiements
CREATE POLICY "Users can update their own payments" ON public.payments
    FOR UPDATE USING (auth.uid() = user_id);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Table payments recréée avec succès !';
    RAISE NOTICE '📊 Colonnes: id, loan_id, user_id, amount, method, status, created_at, updated_at, payment_date, transaction_id, description, metadata';
    RAISE NOTICE '🔒 Contraintes: method IN (mobile_money, card, cash)';
    RAISE NOTICE '🔗 Clés étrangères: loan_id → loans(id), user_id → users(id)';
    RAISE NOTICE '📈 Index créés pour les performances';
    RAISE NOTICE '🛡️ RLS activé avec politiques de sécurité';
END $$;
