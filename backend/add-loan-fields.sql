-- Script SQL pour ajouter les nouveaux champs à la table loans
-- Exécuter ce script dans Supabase SQL Editor

-- Ajouter le champ employment_status (statut professionnel)
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS employment_status TEXT;

-- Ajouter le champ guarantee (garantie)
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS guarantee TEXT;

-- Ajouter des commentaires pour documenter les champs
COMMENT ON COLUMN loans.employment_status IS 'Statut professionnel de l''emprunteur (self-employed, student)';
COMMENT ON COLUMN loans.guarantee IS 'Description de la garantie fournie par l''emprunteur';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND column_name IN ('employment_status', 'guarantee')
ORDER BY column_name;
