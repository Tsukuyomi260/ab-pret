-- =====================================================
-- CRÉATION DE LA TABLE NOTIFICATIONS
-- =====================================================

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'loan', 'payment', 'reminder')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur les colonnes fréquemment utilisées
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications USING btree (id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications USING btree (read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications USING btree (type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

-- Ajouter des commentaires pour documenter la table
COMMENT ON TABLE public.notifications IS 'Table des notifications système et utilisateur';
COMMENT ON COLUMN public.notifications.title IS 'Titre de la notification';
COMMENT ON COLUMN public.notifications.message IS 'Message détaillé de la notification';
COMMENT ON COLUMN public.notifications.type IS 'Type de notification (info, success, warning, error, loan, payment, reminder)';
COMMENT ON COLUMN public.notifications.priority IS 'Priorité de la notification (low, medium, high, urgent)';
COMMENT ON COLUMN public.notifications.read IS 'Indique si la notification a été lue';
COMMENT ON COLUMN public.notifications.data IS 'Données supplémentaires au format JSON';
COMMENT ON COLUMN public.notifications.action IS 'Action suggérée pour la notification';
COMMENT ON COLUMN public.notifications.created_at IS 'Date de création de la notification';

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour updated_at
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON public.notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read notifications" ON public.notifications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre l'insertion à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre la mise à jour à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to update notifications" ON public.notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour permettre la suppression à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to delete notifications" ON public.notifications
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insérer quelques notifications d'exemple pour tester
INSERT INTO public.notifications (title, message, type, priority, data) VALUES
('Bienvenue sur AB-Pret', 'Votre compte a été créé avec succès. Bienvenue dans notre communauté !', 'success', 'medium', '{"action": "explorer_dashboard"}'),
('Système de notifications activé', 'Le système de notifications en temps réel est maintenant actif.', 'info', 'low', '{"action": "voir_parametres"}');

-- Vérifier que la table a été créée
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
