-- =====================================================
-- CORRECTION DES COLONNES DE DOCUMENTS
-- =====================================================

-- Script pour ajouter les colonnes de documents manquantes
-- À exécuter dans Supabase SQL Editor

DO $$
BEGIN
    -- ===== COLONNES DES NOMS DE FICHIERS =====
    
    -- Ajouter la colonne user_identity_card_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'user_identity_card_name') THEN
        ALTER TABLE public.users ADD COLUMN user_identity_card_name VARCHAR(255);
        RAISE NOTICE 'Colonne user_identity_card_name ajoutée';
    ELSE
        RAISE NOTICE 'Colonne user_identity_card_name existe déjà';
    END IF;

    -- Ajouter la colonne temoin_identity_card_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'temoin_identity_card_name') THEN
        ALTER TABLE public.users ADD COLUMN temoin_identity_card_name VARCHAR(255);
        RAISE NOTICE 'Colonne temoin_identity_card_name ajoutée';
    ELSE
        RAISE NOTICE 'Colonne temoin_identity_card_name existe déjà';
    END IF;

    -- Ajouter la colonne student_card_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'student_card_name') THEN
        ALTER TABLE public.users ADD COLUMN student_card_name VARCHAR(255);
        RAISE NOTICE 'Colonne student_card_name ajoutée';
    ELSE
        RAISE NOTICE 'Colonne student_card_name existe déjà';
    END IF;

    -- ===== COLONNES DES URLs DE FICHIERS =====
    
    -- Ajouter la colonne user_identity_card_url si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'user_identity_card_url') THEN
        ALTER TABLE public.users ADD COLUMN user_identity_card_url TEXT;
        RAISE NOTICE 'Colonne user_identity_card_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne user_identity_card_url existe déjà';
    END IF;

    -- Ajouter la colonne temoin_identity_card_url si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'temoin_identity_card_url') THEN
        ALTER TABLE public.users ADD COLUMN temoin_identity_card_url TEXT;
        RAISE NOTICE 'Colonne temoin_identity_card_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne temoin_identity_card_url existe déjà';
    END IF;

    -- Ajouter la colonne student_card_url si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'student_card_url') THEN
        ALTER TABLE public.users ADD COLUMN student_card_url TEXT;
        RAISE NOTICE 'Colonne student_card_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne student_card_url existe déjà';
    END IF;

    RAISE NOTICE 'Toutes les colonnes de documents ont été vérifiées/ajoutées';

END $$;

-- Vérifier la structure finale
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN (
    'user_identity_card_name',
    'temoin_identity_card_name', 
    'student_card_name',
    'user_identity_card_url',
    'temoin_identity_card_url',
    'student_card_url'
  )
ORDER BY column_name;
