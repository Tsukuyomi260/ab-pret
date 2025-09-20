-- =====================================================
-- DÉSACTIVER RLS POUR LA TABLE PAYMENTS (SOLUTION TEMPORAIRE)
-- =====================================================

-- Désactiver RLS pour la table payments
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Allow payments insertion" ON public.payments;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ RLS désactivé pour la table payments !';
    RAISE NOTICE '🔓 Le webhook peut maintenant insérer sans restriction';
    RAISE NOTICE '⚠️ ATTENTION: Solution temporaire - réactiver RLS plus tard';
END $$;
