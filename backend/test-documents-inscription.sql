-- =====================================================
-- TEST ET VÉRIFICATION DES DOCUMENTS APRÈS INSCRIPTION
-- =====================================================

-- 1. Vérifier les utilisateurs récents avec leurs documents
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
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 2. Compter les utilisateurs avec des documents (par type)
SELECT 
  'Carte d''identité utilisateur' as document_type,
  COUNT(*) as total_users,
  COUNT(user_identity_card_name) as avec_document,
  COUNT(user_identity_card_url) as avec_url
FROM users
UNION ALL
SELECT 
  'Carte d''identité témoin' as document_type,
  COUNT(*) as total_users,
  COUNT(temoin_identity_card_name) as avec_document,
  COUNT(temoin_identity_card_url) as avec_url
FROM users
UNION ALL
SELECT 
  'Carte d''étudiant' as document_type,
  COUNT(*) as total_users,
  COUNT(student_card_name) as avec_document,
  COUNT(student_card_url) as avec_url
FROM users;

-- 3. Vérifier les utilisateurs sans aucun document
SELECT 
  id,
  first_name,
  last_name,
  created_at
FROM users 
WHERE user_identity_card_name IS NULL 
  AND temoin_identity_card_name IS NULL 
  AND student_card_name IS NULL
ORDER BY created_at DESC;

-- 4. Vérifier les utilisateurs avec au moins un document
SELECT 
  id,
  first_name,
  last_name,
  CASE 
    WHEN user_identity_card_name IS NOT NULL THEN 'Oui'
    ELSE 'Non'
  END as carte_identite_utilisateur,
  CASE 
    WHEN temoin_identity_card_name IS NOT NULL THEN 'Oui'
    ELSE 'Non'
  END as carte_identite_temoin,
  CASE 
    WHEN student_card_name IS NOT NULL THEN 'Oui'
    ELSE 'Non'
  END as carte_etudiant,
  created_at
FROM users 
WHERE user_identity_card_name IS NOT NULL 
   OR temoin_identity_card_name IS NOT NULL 
   OR student_card_name IS NOT NULL
ORDER BY created_at DESC;

