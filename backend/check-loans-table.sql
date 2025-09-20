-- Vérifier la structure de la table loans
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'loans' 
ORDER BY ordinal_position;
