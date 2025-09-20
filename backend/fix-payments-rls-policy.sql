-- =====================================================
-- CORRECTION DE LA POLITIQUE RLS POUR LA TABLE PAYMENTS
-- =====================================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

-- Créer une nouvelle politique plus permissive pour l'insertion
-- Permettre l'insertion par le service role (webhook) ET par les utilisateurs authentifiés
CREATE POLICY "Allow payments insertion" ON public.payments
    FOR INSERT WITH CHECK (
        -- Permettre l'insertion par le service role (webhook)
        auth.role() = 'service_role' 
        OR 
        -- Permettre l'insertion par l'utilisateur authentifié
        auth.uid() = user_id
    );

-- Politique pour la lecture : les utilisateurs peuvent voir leurs propres paiements
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (
        auth.role() = 'service_role' 
        OR 
        auth.uid() = user_id
    );

-- Politique pour la mise à jour : les utilisateurs peuvent modifier leurs propres paiements
CREATE POLICY "Users can update their own payments" ON public.payments
    FOR UPDATE USING (
        auth.role() = 'service_role' 
        OR 
        auth.uid() = user_id
    );

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS mises à jour pour la table payments !';
    RAISE NOTICE '🔓 Le service role (webhook) peut maintenant insérer des paiements';
    RAISE NOTICE '👤 Les utilisateurs peuvent toujours voir/modifier leurs propres paiements';
    RAISE NOTICE '🛡️ Sécurité maintenue avec les bonnes restrictions';
END $$;
