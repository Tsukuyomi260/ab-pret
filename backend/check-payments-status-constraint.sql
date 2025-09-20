-- =====================================================
-- VÉRIFICATION DE LA CONTRAINTE STATUS DE LA TABLE PAYMENTS
-- =====================================================

-- Vérifier la contrainte CHECK sur status
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.payments'::regclass 
AND conname LIKE '%status%';

-- Vérifier toutes les contraintes CHECK sur payments
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.payments'::regclass 
AND contype = 'c'
ORDER BY conname; 