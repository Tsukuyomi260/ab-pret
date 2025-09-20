-- =====================================================
-- VÉRIFICATION DES CONTRAINTES DE LA TABLE PAYMENTS
-- =====================================================

-- Vérifier toutes les contraintes CHECK sur la table payments
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.payments'::regclass 
AND contype = 'c'
ORDER BY conname;

-- Vérifier spécifiquement la contrainte sur method
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.payments'::regclass 
AND conname LIKE '%method%'; 