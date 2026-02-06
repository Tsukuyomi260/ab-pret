-- Script pour ajouter la colonne loyalty_status à la table users
-- Date: 2026-02-06

-- 1. Ajouter la colonne loyalty_status si elle n'existe pas
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS loyalty_status TEXT;

-- 2. Ajouter la colonne loyalty_last_reset pour suivre la date du dernier reset
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS loyalty_last_reset TIMESTAMP WITH TIME ZONE;

-- 3. Ajouter un commentaire pour documenter les colonnes
COMMENT ON COLUMN public.users.loyalty_status IS 'Statut de fidélité de l''utilisateur: Gold, Diamond, ou Prestige';
COMMENT ON COLUMN public.users.loyalty_last_reset IS 'Date du dernier reset du compteur de fidélité (après avoir atteint 5 étoiles)';

-- 4. Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_users_loyalty_status 
ON public.users(loyalty_status);

-- 4. Afficher la structure de la table pour vérification
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'loyalty_status';

-- Note: Les valeurs possibles sont:
-- - NULL ou vide: Pas encore de statut (première série de 5)
-- - 'Gold': Première série de 5 remboursements complétée
-- - 'Diamond': Deuxième série de 5 remboursements complétée
-- - 'Prestige': Troisième série et plus de 5 remboursements complétées
