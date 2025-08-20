-- Migration pour corriger les politiques RLS du stockage Supabase
-- Cette migration permet la création de buckets et l'upload d'images

-- 1. Créer le bucket space-images s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'space-images',
  'space-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Supprimer les politiques existantes du bucket (si elles existent)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;

-- 3. Créer une politique permissive pour l'upload d'images
CREATE POLICY "Anyone can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'space-images');

-- 4. Créer une politique pour permettre la lecture publique des images
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'space-images');

-- 5. Créer une politique pour permettre la mise à jour des images
CREATE POLICY "Anyone can update images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'space-images');

-- 6. Créer une politique pour permettre la suppression des images
CREATE POLICY "Anyone can delete images" ON storage.objects
    FOR DELETE USING (bucket_id = 'space-images');

-- 7. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Politiques de stockage corrigées pour le bucket space-images';
    RAISE NOTICE 'L''application peut maintenant uploader des images';
END $$;
