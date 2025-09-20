-- =====================================================
-- VÉRIFICATION DES VALEURS STATUS DE LA TABLE LOANS
-- =====================================================

-- Vérifier la définition de la colonne status
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND column_name = 'status';

-- Vérifier s'il y a des contraintes CHECK sur status
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.loans'::regclass 
AND conname LIKE '%status%';

-- Vérifier les valeurs actuelles dans la table
SELECT DISTINCT status FROM public.loans ORDER BY status; 