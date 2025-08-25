-- Migration pour ajouter la colonne is_available à la table spaces_content
-- Date: 2025-01-20

-- Ajouter la colonne is_available si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'spaces_content' 
        AND column_name = 'is_available'
    ) THEN
        ALTER TABLE spaces_content 
        ADD COLUMN is_available BOOLEAN DEFAULT true;
        
        -- Mettre à jour les enregistrements existants pour qu'ils soient disponibles par défaut
        UPDATE spaces_content 
        SET is_available = true 
        WHERE is_available IS NULL;
        
        RAISE NOTICE 'Colonne is_available ajoutée à la table spaces_content';
    ELSE
        RAISE NOTICE 'La colonne is_available existe déjà dans la table spaces_content';
    END IF;
END $$;

-- Ajouter un commentaire sur la colonne
COMMENT ON COLUMN spaces_content.is_available IS 'Indique si l''espace est disponible pour la réservation (true = disponible, false = indisponible)';
