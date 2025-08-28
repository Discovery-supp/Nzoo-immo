-- Migration pour ajouter les colonnes manquantes à la table spaces
-- Date: 2025-08-02 16:00:00

-- Ajouter les colonnes de prix
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS prix_journalier numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS prix_mensuel numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS prix_annuel numeric DEFAULT 0;

-- Ajouter la colonne pour la photo de l'espace
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS photo_espace text;

-- Ajouter la colonne nombre_occupants si elle n'existe pas
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS nombre_occupants integer DEFAULT 1;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN spaces.prix_journalier IS 'Prix journalier de l''espace en dollars';
COMMENT ON COLUMN spaces.prix_mensuel IS 'Prix mensuel de l''espace en dollars';
COMMENT ON COLUMN spaces.prix_annuel IS 'Prix annuel de l''espace en dollars';
COMMENT ON COLUMN spaces.photo_espace IS 'URL de la photo de l''espace';
COMMENT ON COLUMN spaces.nombre_occupants IS 'Nombre maximum d''occupants de l''espace';
