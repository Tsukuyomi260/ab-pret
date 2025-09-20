-- =====================================================
-- AJOUT DU CHAMP ADDRESS À LA TABLE USERS
-- =====================================================

-- Ajouter le champ address à la table users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.users.address IS 'Adresse complète de l''utilisateur';

-- Mettre à jour les utilisateurs existants avec une adresse par défaut si nécessaire
UPDATE public.users 
SET address = 'Adresse non renseignée' 
WHERE address IS NULL;

-- Vérifier que le champ a été ajouté
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'address';
