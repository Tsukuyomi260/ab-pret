-- =====================================================
-- VÉRIFICATION DE TOUTES LES CONTRAINTES
-- =====================================================

-- Contraintes de la table loans
SELECT 
    'LOANS' as table_name,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
AND contype = 'c'
ORDER BY conname;

-- Contraintes de la table payments
SELECT 
    'PAYMENTS' as table_name,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.payments'::regclass 
AND contype = 'c'
ORDER BY conname; 