-- Création de la table spaces_content pour stocker le contenu des espaces
CREATE TABLE IF NOT EXISTS spaces_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  space_key TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('fr', 'en')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  daily_price DECIMAL(10,2),
  monthly_price DECIMAL(10,2),
  yearly_price DECIMAL(10,2),
  hourly_price DECIMAL(10,2),
  max_occupants INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte d'unicité pour éviter les doublons
  UNIQUE(space_key, language)
);

-- Index pour améliorer les performances (avec IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_spaces_content_language ON spaces_content(language);
CREATE INDEX IF NOT EXISTS idx_spaces_content_active ON spaces_content(is_active);
CREATE INDEX IF NOT EXISTS idx_spaces_content_key_lang ON spaces_content(space_key, language);

-- Fonction pour mettre à jour automatiquement updated_at (avec OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer le trigger s'il existe déjà, puis le recréer
DROP TRIGGER IF EXISTS update_spaces_content_updated_at ON spaces_content;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_spaces_content_updated_at 
  BEFORE UPDATE ON spaces_content 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - permettre l'accès public en lecture, restreint en écriture
ALTER TABLE spaces_content ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow public read access" ON spaces_content;
DROP POLICY IF EXISTS "Allow authenticated users to insert/update" ON spaces_content;

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public read access" ON spaces_content
  FOR SELECT USING (true);

-- Politique pour permettre l'insertion/update aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to insert/update" ON spaces_content
  FOR ALL USING (auth.role() = 'authenticated');

-- Commentaires pour documenter la table
COMMENT ON TABLE spaces_content IS 'Table pour stocker le contenu personnalisable des espaces de travail';
COMMENT ON COLUMN spaces_content.space_key IS 'Clé unique identifiant le type d''espace (ex: coworking, bureau-prive)';
COMMENT ON COLUMN spaces_content.language IS 'Langue du contenu (fr ou en)';
COMMENT ON COLUMN spaces_content.features IS 'Liste des équipements/avantages de l''espace';
COMMENT ON COLUMN spaces_content.is_active IS 'Indique si l''espace est actif et visible';
