-- ============================================
-- Script de Correction : Autoriser le rejet des prêts
-- ============================================
-- 
-- PROBLÈME: La contrainte loans_status_check n'autorise pas le statut 'rejected'
-- SOLUTION: Mettre à jour la contrainte pour inclure 'rejected'
--
-- INSTRUCTIONS:
-- 1. Ouvrir Supabase Dashboard
-- 2. Aller dans SQL Editor
-- 3. Copier-coller ce script
-- 4. Cliquer sur "Run"
-- ============================================

-- Étape 1: Supprimer l'ancienne contrainte
ALTER TABLE public.loans 
DROP CONSTRAINT IF EXISTS loans_status_check;

-- Étape 2: Créer la nouvelle contrainte avec 'rejected' inclus
ALTER TABLE public.loans 
ADD CONSTRAINT loans_status_check 
CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected'));

-- Étape 3: Vérifier que la contrainte a été appliquée
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'loans_status_check' 
AND conrelid = 'public.loans'::regclass;

-- Résultat attendu:
-- constraint_name: loans_status_check
-- constraint_definition: CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'active'::text, 'completed'::text, 'rejected'::text])))
