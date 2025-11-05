-- ============================================
-- Script : Ajouter les colonnes de personnalisation
-- Table: savings_plans
-- ============================================
--
-- Ce script ajoute les colonnes nécessaires pour la personnalisation des plans d'épargne :
-- - goal : ID de l'objectif sélectionné (graduation, rent, motorcycle, etc.)
-- - goal_label : Label de l'objectif (pour l'affichage)
-- - personalized_at : Date de personnalisation
-- - plan_name : Nom personnalisé du plan (peut déjà exister)
--
-- INSTRUCTIONS:
-- 1. Ouvrir Supabase Dashboard
-- 2. Aller dans SQL Editor
-- 3. Copier-coller ce script
-- 4. Cliquer sur "Run"
-- ============================================

-- Vérifier si la colonne plan_name existe, sinon l'ajouter
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'savings_plans' 
        AND column_name = 'plan_name'
    ) THEN
        ALTER TABLE public.savings_plans 
        ADD COLUMN plan_name TEXT;
    END IF;
END $$;

-- Ajouter la colonne goal (ID de l'objectif)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'savings_plans' 
        AND column_name = 'goal'
    ) THEN
        ALTER TABLE public.savings_plans 
        ADD COLUMN goal TEXT;
    END IF;
END $$;

-- Ajouter la colonne goal_label (Label de l'objectif)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'savings_plans' 
        AND column_name = 'goal_label'
    ) THEN
        ALTER TABLE public.savings_plans 
        ADD COLUMN goal_label TEXT;
    END IF;
END $$;

-- Ajouter la colonne personalized_at (Date de personnalisation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'savings_plans' 
        AND column_name = 'personalized_at'
    ) THEN
        ALTER TABLE public.savings_plans 
        ADD COLUMN personalized_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'savings_plans' 
AND column_name IN ('plan_name', 'goal', 'goal_label', 'personalized_at')
ORDER BY column_name;

-- Résultat attendu:
-- personalized_at | timestamp with time zone | YES
-- goal            | text                     | YES
-- goal_label      | text                     | YES
-- plan_name       | text                     | YES

