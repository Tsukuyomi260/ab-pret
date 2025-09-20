-- Script de nettoyage complet du système d'épargne
-- ⚠️ ATTENTION: Ce script supprime définitivement toutes les données d'épargne

-- Supprimer les tables dans l'ordre correct (en respectant les contraintes de clés étrangères)
DROP TABLE IF EXISTS savings_transactions CASCADE;
DROP TABLE IF EXISTS savings_plans CASCADE;
DROP TABLE IF EXISTS savings_accounts CASCADE;

-- Supprimer les fonctions RPC liées à l'épargne
DROP FUNCTION IF EXISTS create_savings_account CASCADE;
DROP FUNCTION IF EXISTS create_savings_plan CASCADE;
DROP FUNCTION IF EXISTS get_savings_account CASCADE;
DROP FUNCTION IF EXISTS get_savings_plan_status CASCADE;
DROP FUNCTION IF EXISTS get_active_savings_plan CASCADE;
DROP FUNCTION IF EXISTS get_savings_transactions CASCADE;

-- Supprimer les politiques RLS liées à l'épargne
DROP POLICY IF EXISTS "Users can view their own savings accounts" ON savings_accounts;
DROP POLICY IF EXISTS "Users can insert their own savings accounts" ON savings_accounts;
DROP POLICY IF EXISTS "Users can update their own savings accounts" ON savings_accounts;

DROP POLICY IF EXISTS "Users can view their own savings plans" ON savings_plans;
DROP POLICY IF EXISTS "Users can insert their own savings plans" ON savings_plans;
DROP POLICY IF EXISTS "Users can update their own savings plans" ON savings_plans;

DROP POLICY IF EXISTS "Users can view their own savings transactions" ON savings_transactions;
DROP POLICY IF EXISTS "Users can insert their own savings transactions" ON savings_transactions;
DROP POLICY IF EXISTS "Users can update their own savings transactions" ON savings_transactions;

-- Vérifier que les tables ont été supprimées
SELECT 
  'Tables d\'épargne supprimées avec succès' as status,
  COUNT(*) as remaining_savings_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%savings%';
