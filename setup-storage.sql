-- =====================================================
-- CONFIGURATION DU STOCKAGE SUPABASE
-- =====================================================

-- 1. Créer le bucket pour les documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- 2. Créer les politiques RLS pour le bucket documents
-- Politique pour permettre l'insertion de fichiers
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre la lecture des fichiers
CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre la mise à jour des fichiers
CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre la suppression des fichiers
CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Ajouter les colonnes pour les URLs des photos dans la table users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_identity_card_url TEXT,
ADD COLUMN IF NOT EXISTS temoin_identity_card_url TEXT;

-- 4. Vérifier la configuration
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'documents';

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Configuration du stockage terminée !';
    RAISE NOTICE '✅ Bucket "documents" créé avec succès';
    RAISE NOTICE '✅ Politiques RLS configurées';
    RAISE NOTICE '✅ Colonnes pour URLs des photos ajoutées';
END $$;
