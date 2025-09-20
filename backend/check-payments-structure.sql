-- =====================================================
-- VÉRIFICATION DE LA STRUCTURE DE LA TABLE PAYMENTS
-- =====================================================

-- Vérifier toutes les colonnes de la table payments
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payments'
ORDER BY ordinal_position;

-- Vérifier les contraintes NOT NULL
SELECT 
    column_name,
    'NOT NULL' as constraint_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payments'
AND is_nullable = 'NO'
ORDER BY column_name; 