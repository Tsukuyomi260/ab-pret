-- =====================================================
-- DÉSACTIVER RLS TEMPORAIREMENT POUR LA TABLE PAYMENTS
-- =====================================================

-- Désactiver RLS complètement
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ RLS désactivé temporairement pour la table payments !';
    RAISE NOTICE '🔓 Le webhook peut maintenant insérer sans restriction';
    RAISE NOTICE '⚠️ ATTENTION: Solution temporaire - réactiver RLS plus tard';
END $$;
