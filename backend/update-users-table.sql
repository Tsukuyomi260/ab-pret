-- Script pour ajouter les colonnes manquantes à la table users
-- À exécuter dans Supabase SQL Editor

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter la colonne filiere si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'filiere') THEN
        ALTER TABLE public.users ADD COLUMN filiere VARCHAR(100);
    END IF;

    -- Ajouter la colonne annee_etude si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'annee_etude') THEN
        ALTER TABLE public.users ADD COLUMN annee_etude VARCHAR(50);
    END IF;

    -- Ajouter la colonne entite si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'entite') THEN
        ALTER TABLE public.users ADD COLUMN entite VARCHAR(100);
    END IF;

    -- Ajouter la colonne address si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE public.users ADD COLUMN address TEXT;
    END IF;

    -- Ajouter la colonne facebook_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'facebook_name') THEN
        ALTER TABLE public.users ADD COLUMN facebook_name VARCHAR(100);
    END IF;

    -- Ajouter les colonnes Momo à la table loans si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loans' AND column_name = 'momo_number') THEN
        ALTER TABLE public.loans ADD COLUMN momo_number VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loans' AND column_name = 'momo_network') THEN
        ALTER TABLE public.loans ADD COLUMN momo_network VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'loans' AND column_name = 'momo_name') THEN
        ALTER TABLE public.loans ADD COLUMN momo_name VARCHAR(100);
    END IF;

END $$;

-- Vérifier la structure mise à jour
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
