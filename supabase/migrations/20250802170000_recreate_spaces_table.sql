-- Migration pour supprimer et recréer la table spaces
-- Date: 2025-08-02 17:00:00

-- Supprimer la table spaces existante
DROP TABLE IF EXISTS spaces CASCADE;

-- Recréer la table spaces avec tous les champs nécessaires
CREATE TABLE spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'coworking',
  description text NOT NULL,
  prix_journalier numeric DEFAULT 0,
  prix_mensuel numeric DEFAULT 0,
  prix_annuel numeric DEFAULT 0,
  nombre_occupants integer DEFAULT 1,
  photo_espace text,
  is_active boolean NOT NULL DEFAULT true,
  features text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  availability_status text NOT NULL DEFAULT 'available',
  display_order integer DEFAULT 0,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Créer un index sur le nom pour les recherches
CREATE INDEX idx_spaces_name ON spaces(name);

-- Créer un index sur le type pour filtrer par type d'espace
CREATE INDEX idx_spaces_type ON spaces(type);

-- Créer un index sur is_active pour filtrer les espaces actifs
CREATE INDEX idx_spaces_active ON spaces(is_active);

-- Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_spaces_updated_at 
    BEFORE UPDATE ON spaces 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON TABLE spaces IS 'Table des espaces de coworking et bureaux';
COMMENT ON COLUMN spaces.id IS 'Identifiant unique de l''espace';
COMMENT ON COLUMN spaces.name IS 'Nom de l''espace';
COMMENT ON COLUMN spaces.type IS 'Type d''espace (coworking, bureau-prive, salle-reunion)';
COMMENT ON COLUMN spaces.description IS 'Description détaillée de l''espace';
COMMENT ON COLUMN spaces.prix_journalier IS 'Prix journalier de l''espace en dollars';
COMMENT ON COLUMN spaces.prix_mensuel IS 'Prix mensuel de l''espace en dollars';
COMMENT ON COLUMN spaces.prix_annuel IS 'Prix annuel de l''espace en dollars';
COMMENT ON COLUMN spaces.nombre_occupants IS 'Nombre maximum d''occupants de l''espace';
COMMENT ON COLUMN spaces.photo_espace IS 'URL de la photo principale de l''espace';
COMMENT ON COLUMN spaces.is_active IS 'Indique si l''espace est actif et disponible';
COMMENT ON COLUMN spaces.features IS 'Liste des fonctionnalités de l''espace';
COMMENT ON COLUMN spaces.images IS 'Liste des URLs des images de l''espace';
COMMENT ON COLUMN spaces.availability_status IS 'Statut de disponibilité (available, occupied, maintenance)';
COMMENT ON COLUMN spaces.display_order IS 'Ordre d''affichage de l''espace';
COMMENT ON COLUMN spaces.admin_notes IS 'Notes administratives privées';
COMMENT ON COLUMN spaces.created_at IS 'Date de création de l''espace';
COMMENT ON COLUMN spaces.updated_at IS 'Date de dernière modification de l''espace';
