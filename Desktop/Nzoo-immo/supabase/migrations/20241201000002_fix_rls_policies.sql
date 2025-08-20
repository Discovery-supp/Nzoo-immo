-- Migration pour corriger les politiques RLS de la table spaces_content
-- Cette migration permet l'insertion et la mise à jour depuis l'application

-- 1. Supprimer les politiques existantes
DROP POLICY IF EXISTS "Allow public read access" ON spaces_content;
DROP POLICY IF EXISTS "Allow authenticated users to insert/update" ON spaces_content;

-- 2. Créer une politique plus permissive pour l'application
-- Permettre la lecture publique
CREATE POLICY "Allow public read access" ON spaces_content
    FOR SELECT USING (true);

-- Permettre l'insertion et la mise à jour pour tous (pour l'application)
CREATE POLICY "Allow all operations for app" ON spaces_content
    FOR ALL USING (true);

-- 3. Alternative : Si vous voulez être plus restrictif, utilisez cette politique à la place
-- CREATE POLICY "Allow insert update for app" ON spaces_content
--     FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow update for app" ON spaces_content
--     FOR UPDATE USING (true);

-- 4. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Politiques RLS corrigées pour la table spaces_content';
    RAISE NOTICE 'L''application peut maintenant insérer et mettre à jour les données';
END $$;
