-- Migration de correction pour la table spaces_content
-- Cette migration peut être exécutée même si certains objets existent déjà

-- 1. Vérifier et créer la table si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spaces_content') THEN
        CREATE TABLE spaces_content (
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
            UNIQUE(space_key, language)
        );
        RAISE NOTICE 'Table spaces_content créée';
    ELSE
        RAISE NOTICE 'Table spaces_content existe déjà';
    END IF;
END $$;

-- 2. Créer les index s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_spaces_content_language ON spaces_content(language);
CREATE INDEX IF NOT EXISTS idx_spaces_content_active ON spaces_content(is_active);
CREATE INDEX IF NOT EXISTS idx_spaces_content_key_lang ON spaces_content(space_key, language);

-- 3. Créer ou remplacer la fonction update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Supprimer le trigger s'il existe et le recréer
DROP TRIGGER IF EXISTS update_spaces_content_updated_at ON spaces_content;
CREATE TRIGGER update_spaces_content_updated_at 
    BEFORE UPDATE ON spaces_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Activer RLS
ALTER TABLE spaces_content ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les politiques existantes et les recréer
DROP POLICY IF EXISTS "Allow public read access" ON spaces_content;
DROP POLICY IF EXISTS "Allow authenticated users to insert/update" ON spaces_content;

CREATE POLICY "Allow public read access" ON spaces_content
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert/update" ON spaces_content
    FOR ALL USING (auth.role() = 'authenticated');

-- 7. Ajouter les commentaires
COMMENT ON TABLE spaces_content IS 'Table pour stocker le contenu personnalisable des espaces de travail';
COMMENT ON COLUMN spaces_content.space_key IS 'Clé unique identifiant le type d''espace (ex: coworking, bureau-prive)';
COMMENT ON COLUMN spaces_content.language IS 'Langue du contenu (fr ou en)';
COMMENT ON COLUMN spaces_content.features IS 'Liste des équipements/avantages de l''espace';
COMMENT ON COLUMN spaces_content.is_active IS 'Indique si l''espace est actif et visible';

-- 8. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration de correction terminée avec succès pour la table spaces_content';
END $$;
