-- =====================================================
-- CORRECTION DES POLITIQUES RLS POUR L'ÉPARGNE
-- =====================================================
-- Ce script corrige les politiques RLS pour permettre au webhook
-- de créer des comptes d'épargne et des plans d'épargne

-- 1. Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can view their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can insert their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can update their own savings accounts" ON public.savings_accounts;
DROP POLICY IF EXISTS "Users can view their own savings plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can insert their own savings plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can update their own savings plans" ON public.savings_plans;
DROP POLICY IF EXISTS "Users can view their own savings transactions" ON public.savings_transactions;
DROP POLICY IF EXISTS "Users can insert their own savings transactions" ON public.savings_transactions;
DROP POLICY IF EXISTS "Users can update their own savings transactions" ON public.savings_transactions;

-- 2. Créer des politiques plus permissives pour savings_accounts
-- Permettre aux utilisateurs de voir leurs propres comptes
CREATE POLICY "Users can view their own savings accounts" ON public.savings_accounts
    FOR SELECT USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de créer leurs propres comptes
CREATE POLICY "Users can insert their own savings accounts" ON public.savings_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de mettre à jour leurs propres comptes
CREATE POLICY "Users can update their own savings accounts" ON public.savings_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Permettre au service (webhook) de créer des comptes d'épargne
-- Cette politique permet l'insertion si l'utilisateur existe dans la table users
CREATE POLICY "Service can create savings accounts for existing users" ON public.savings_accounts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = user_id
        )
    );

-- 3. Créer des politiques pour savings_plans
-- Permettre aux utilisateurs de voir leurs propres plans
CREATE POLICY "Users can view their own savings plans" ON public.savings_plans
    FOR SELECT USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de créer leurs propres plans
CREATE POLICY "Users can insert their own savings plans" ON public.savings_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de mettre à jour leurs propres plans
CREATE POLICY "Users can update their own savings plans" ON public.savings_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Permettre au service (webhook) de créer des plans d'épargne
CREATE POLICY "Service can create savings plans for existing users" ON public.savings_plans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = user_id
        )
    );

-- 4. Créer des politiques pour savings_transactions
-- Permettre aux utilisateurs de voir leurs propres transactions
CREATE POLICY "Users can view their own savings transactions" ON public.savings_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Permettre aux utilisateurs de créer leurs propres transactions
CREATE POLICY "Users can insert their own savings transactions" ON public.savings_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de mettre à jour leurs propres transactions
CREATE POLICY "Users can update their own savings transactions" ON public.savings_transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Permettre au service (webhook) de créer des transactions d'épargne
CREATE POLICY "Service can create savings transactions for existing users" ON public.savings_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = user_id
        )
    );

-- 5. Vérifier que RLS est activé
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Afficher les politiques créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('savings_accounts', 'savings_plans', 'savings_transactions')
ORDER BY tablename, policyname;
