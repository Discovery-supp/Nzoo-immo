-- Migration pour ajouter la colonne is_published à la table spaces
-- Date: 2025-08-02 18:00:00

-- Ajouter la colonne is_published
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN spaces.is_published IS 'Indique si l''espace est publié et visible sur le site public';

-- Mettre à jour les espaces existants pour qu'ils soient publiés par défaut
UPDATE spaces 
SET is_published = true 
WHERE is_published IS NULL;
