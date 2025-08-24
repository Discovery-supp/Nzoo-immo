-- Script pour ajouter la colonne avatar_url à la table admin_users
-- À exécuter dans l'interface SQL de Supabase

-- Ajouter la colonne avatar_url
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN admin_users.avatar_url IS 'URL of the user profile avatar image';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
AND column_name = 'avatar_url';
