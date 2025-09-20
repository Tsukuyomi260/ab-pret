-- =====================================================
-- MISE À JOUR COMPLÈTE DU PROFIL UTILISATEUR
-- =====================================================

-- Script pour ajouter toutes les colonnes manquantes à la table users
-- À exécuter dans Supabase SQL Editor

DO $$
BEGIN
    -- ===== INFORMATIONS PERSONNELLES =====
    
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

    -- ===== INFORMATIONS DU TÉMOIN =====
    
    -- Ajouter la colonne temoin_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'temoin_name') THEN
        ALTER TABLE public.users ADD COLUMN temoin_name VARCHAR(100);
    END IF;

    -- Ajouter la colonne temoin_quartier si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'temoin_quartier') THEN
        ALTER TABLE public.users ADD COLUMN temoin_quartier VARCHAR(100);
    END IF;

    -- Ajouter la colonne temoin_phone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'temoin_phone') THEN
        ALTER TABLE public.users ADD COLUMN temoin_phone VARCHAR(20);
    END IF;

    -- Ajouter la colonne temoin_email si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'temoin_email') THEN
        ALTER TABLE public.users ADD COLUMN temoin_email VARCHAR(255);
    END IF;

    -- ===== INFORMATIONS DE CONTACT D'URGENCE =====
    
    -- Ajouter la colonne emergency_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'emergency_name') THEN
        ALTER TABLE public.users ADD COLUMN emergency_name VARCHAR(100);
    END IF;

    -- Ajouter la colonne emergency_relation si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'emergency_relation') THEN
        ALTER TABLE public.users ADD COLUMN emergency_relation VARCHAR(50);
    END IF;

    -- Ajouter la colonne emergency_phone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'emergency_phone') THEN
        ALTER TABLE public.users ADD COLUMN emergency_phone VARCHAR(20);
    END IF;

    -- Ajouter la colonne emergency_email si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'emergency_email') THEN
        ALTER TABLE public.users ADD COLUMN emergency_email VARCHAR(255);
    END IF;

    -- Ajouter la colonne emergency_address si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'emergency_address') THEN
        ALTER TABLE public.users ADD COLUMN emergency_address TEXT;
    END IF;

    -- ===== DOCUMENTS =====
    
    -- Ajouter la colonne user_identity_card_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'user_identity_card_name') THEN
        ALTER TABLE public.users ADD COLUMN user_identity_card_name VARCHAR(255);
    END IF;

    -- Ajouter la colonne temoin_identity_card_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'temoin_identity_card_name') THEN
        ALTER TABLE public.users ADD COLUMN temoin_identity_card_name VARCHAR(255);
    END IF;

    -- Ajouter la colonne student_card_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'student_card_name') THEN
        ALTER TABLE public.users ADD COLUMN student_card_name VARCHAR(255);
    END IF;

    RAISE NOTICE 'Toutes les colonnes ont été ajoutées avec succès à la table users';

END $$;

-- Vérifier la structure mise à jour
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
