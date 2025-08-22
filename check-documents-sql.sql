-- =====================================================
-- VÉRIFICATION DES DOCUMENTS DANS LA BASE DE DONNÉES
-- =====================================================

-- 1. Vérifier la structure de la table users
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN (
    'user_identity_card_name',
    'temoin_identity_card_name', 
    'student_card_name',
    'user_identity_card_url',
    'temoin_identity_card_url',
    'student_card_url'
  )
ORDER BY column_name;

-- 2. Vérifier les données actuelles des documents
SELECT 
  id,
  first_name,
  last_name,
  user_identity_card_name,
  temoin_identity_card_name,
  student_card_name,
  user_identity_card_url,
  temoin_identity_card_url,
  student_card_url,
  created_at
FROM users 
WHERE user_identity_card_name IS NOT NULL 
   OR temoin_identity_card_name IS NOT NULL 
   OR student_card_name IS NOT NULL
ORDER BY created_at DESC;

-- 3. Compter les utilisateurs avec/sans documents
SELECT 
  'Avec carte d''identité utilisateur' as document_type,
  COUNT(*) as count
FROM users 
WHERE user_identity_card_name IS NOT NULL
UNION ALL
SELECT 
  'Avec carte d''identité témoin' as document_type,
  COUNT(*) as count
FROM users 
WHERE temoin_identity_card_name IS NOT NULL
UNION ALL
SELECT 
  'Avec carte d''étudiant' as document_type,
  COUNT(*) as count
FROM users 
WHERE student_card_name IS NOT NULL
UNION ALL
SELECT 
  'Sans aucun document' as document_type,
  COUNT(*) as count
FROM users 
WHERE user_identity_card_name IS NULL 
  AND temoin_identity_card_name IS NULL 
  AND student_card_name IS NULL;

-- 4. Vérifier les 5 derniers utilisateurs inscrits
SELECT 
  id,
  first_name,
  last_name,
  user_identity_card_name,
  temoin_identity_card_name,
  student_card_name,
  created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
