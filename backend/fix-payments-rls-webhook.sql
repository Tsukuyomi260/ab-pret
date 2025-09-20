-- =====================================================
-- CORRECTION RLS POUR PERMETTRE AU WEBHOOK D'INSÉRER
-- =====================================================

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Allow payments insertion" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

-- Créer une politique simple qui permet tout au service role
CREATE POLICY "Service role can do everything" ON public.payments
    FOR ALL USING (auth.role() = 'service_role');

-- Créer une politique pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view their payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Vérifier que RLS est activé
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS corrigées pour la table payments !';
    RAISE NOTICE '🔓 Service role peut maintenant insérer/modifier/lire tous les paiements';
    RAISE NOTICE '👤 Utilisateurs authentifiés peuvent voir leurs propres paiements';
    RAISE NOTICE '🛡️ RLS activé avec politiques simplifiées';
END $$;
