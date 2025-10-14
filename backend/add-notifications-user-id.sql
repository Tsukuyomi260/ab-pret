-- Script pour ajouter la colonne user_id à la table notifications
-- Date: 2025-01-12

-- 1. Ajouter la colonne user_id si elle n'existe pas
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Ajouter une contrainte de clé étrangère vers la table users
ALTER TABLE public.notifications
ADD CONSTRAINT fk_notifications_user_id
FOREIGN KEY (user_id) 
REFERENCES public.users(id)
ON DELETE CASCADE;

-- 3. Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON public.notifications(user_id);

-- 4. Créer un index composite pour user_id et read
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read 
ON public.notifications(user_id, read);

-- 5. Créer un index pour user_id et created_at (pour les requêtes triées)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at 
ON public.notifications(user_id, created_at DESC);

-- 6. Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.notifications.user_id IS 'ID de l''utilisateur destinataire de la notification';

-- 7. Afficher la structure de la table pour vérification
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- 8. Vérifier les index créés
SELECT 
    indexname, 
    indexdef
FROM pg_indexes
WHERE tablename = 'notifications'
  AND schemaname = 'public'
ORDER BY indexname;

-- Note: Pour les notifications existantes sans user_id, vous pouvez :
-- - Les supprimer si elles ne sont plus nécessaires :
--   DELETE FROM public.notifications WHERE user_id IS NULL;
-- 
-- - Ou les assigner à un utilisateur spécifique (admin par exemple)
--   UPDATE public.notifications 
--   SET user_id = 'ADMIN_USER_UUID_HERE'
--   WHERE user_id IS NULL;

