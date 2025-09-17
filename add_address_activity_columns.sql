-- Script pour ajouter les colonnes address et activity à la table admin_users
-- À exécuter dans l'interface SQL de Supabase

-- Ajouter la colonne address
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS address text;

-- Ajouter la colonne activity
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS activity text;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN admin_users.address IS 'Address for client profile information';
COMMENT ON COLUMN admin_users.activity IS 'Activity/business type for client profile';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
AND column_name IN ('address', 'activity')
ORDER BY column_name;
