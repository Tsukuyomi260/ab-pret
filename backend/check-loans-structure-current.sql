-- =====================================================
-- VÉRIFICATION DE LA STRUCTURE ACTUELLE DE LA TABLE LOANS
-- =====================================================

-- Vérifier la structure actuelle de la table loans
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'loans' 
ORDER BY ordinal_position;

-- Vérifier les contraintes de la table
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'loans';

-- Vérifier les contraintes de vérification
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'loans' AND constraint_type = 'CHECK'
);

-- Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'loans';
