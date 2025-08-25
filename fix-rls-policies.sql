-- =====================================================
-- CORRECTION DES POLITIQUES RLS POUR LE BUCKET DOCUMENTS
-- =====================================================

-- 1. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- 2. Créer de nouvelles politiques RLS plus permissives
-- Politique pour permettre l'insertion de fichiers (authentifiés uniquement)
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture des fichiers (authentifiés uniquement)
CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Politique pour permettre la mise à jour des fichiers (authentifiés uniquement)
CREATE POLICY "Authenticated users can update documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Politique pour permettre la suppression des fichiers (authentifiés uniquement)
CREATE POLICY "Authenticated users can delete documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- 3. Vérifier que les politiques ont été créées
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%documents%'
ORDER BY policyname;

-- 4. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS corrigées pour le bucket documents !';
    RAISE NOTICE '📱 Les utilisateurs authentifiés peuvent maintenant uploader leurs documents';
    RAISE NOTICE '🔒 Les utilisateurs non authentifiés sont toujours bloqués';
END $$;
