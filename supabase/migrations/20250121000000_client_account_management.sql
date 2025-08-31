-- Migration pour la gestion des comptes clients
-- Date: 2025-01-21

-- 1. Créer la table clients si elle n'existe pas
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  activity TEXT,
  address TEXT,
  total_reservations INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_reservation_date TIMESTAMP WITH TIME ZONE,
  account_status VARCHAR(20) DEFAULT 'active',
  account_type VARCHAR(20) DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Créer un index sur l'email pour les performances
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- 3. Ajouter la colonne client_id à la table reservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

-- 4. Créer la fonction pour créer ou récupérer un client
CREATE OR REPLACE FUNCTION get_or_create_client(
  client_email text,
  client_full_name text,
  client_phone text,
  client_company text DEFAULT NULL,
  client_activity text DEFAULT NULL,
  client_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  client_uuid uuid;
BEGIN
  -- Try to find an existing client by email
  SELECT id INTO client_uuid FROM clients WHERE email = client_email;

  IF client_uuid IS NULL THEN
    -- If client does not exist, create a new one
    INSERT INTO clients (full_name, email, phone, company, activity, address, total_reservations, total_spent, account_status, account_type)
    VALUES (client_full_name, client_email, client_phone, client_company, client_activity, client_address, 0, 0, 'active', 'standard')
    RETURNING id INTO client_uuid;
  ELSE
    -- If client exists, update their information if necessary
    UPDATE clients
    SET
      full_name = COALESCE(client_full_name, full_name),
      phone = COALESCE(client_phone, phone),
      company = COALESCE(client_company, company),
      activity = COALESCE(client_activity, activity),
      address = COALESCE(client_address, address),
      updated_at = now()
    WHERE id = client_uuid;
  END IF;

  RETURN client_uuid;
END;
$$;

-- 5. Créer la fonction pour mettre à jour les statistiques du client
CREATE OR REPLACE FUNCTION update_client_stats(client_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE clients
  SET
    total_reservations = (
      SELECT COUNT(*) 
      FROM reservations 
      WHERE client_id = client_uuid
    ),
    total_spent = (
      SELECT COALESCE(SUM(amount), 0)
      FROM reservations 
      WHERE client_id = client_uuid
    ),
    last_reservation_date = (
      SELECT MAX(created_at)
      FROM reservations 
      WHERE client_id = client_uuid
    ),
    updated_at = now()
  WHERE id = client_uuid;
END;
$$;

-- 6. Créer la fonction pour lier une réservation à un client
CREATE OR REPLACE FUNCTION link_reservation_to_client(
  reservation_uuid uuid,
  client_uuid uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE reservations
  SET client_id = client_uuid
  WHERE id = reservation_uuid;
END;
$$;

-- 7. Créer des triggers pour maintenir automatiquement les statistiques
CREATE OR REPLACE FUNCTION update_client_stats_on_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.client_id IS NOT NULL THEN
    PERFORM update_client_stats(NEW.client_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_client_stats_on_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.client_id IS NOT NULL THEN
    PERFORM update_client_stats(NEW.client_id);
  END IF;
  IF OLD.client_id IS NOT NULL AND OLD.client_id != NEW.client_id THEN
    PERFORM update_client_stats(OLD.client_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_client_stats_on_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.client_id IS NOT NULL THEN
    PERFORM update_client_stats(OLD.client_id);
  END IF;
  RETURN OLD;
END;
$$;

-- 8. Créer les triggers
DROP TRIGGER IF EXISTS trigger_update_client_stats_on_insert ON reservations;
CREATE TRIGGER trigger_update_client_stats_on_insert
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_client_stats_on_insert();

DROP TRIGGER IF EXISTS trigger_update_client_stats_on_update ON reservations;
CREATE TRIGGER trigger_update_client_stats_on_update
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_client_stats_on_update();

DROP TRIGGER IF EXISTS trigger_update_client_stats_on_delete ON reservations;
CREATE TRIGGER trigger_update_client_stats_on_delete
  AFTER DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_client_stats_on_delete();

-- 9. Créer une vue pour résumer les réservations des clients
CREATE OR REPLACE VIEW client_reservations_summary AS
SELECT 
  c.id as client_id,
  c.full_name,
  c.email,
  c.phone,
  c.company,
  c.activity,
  c.total_reservations,
  c.total_spent,
  c.last_reservation_date,
  c.created_at as client_since
FROM clients c
ORDER BY c.total_reservations DESC, c.last_reservation_date DESC;

-- 10. Créer la table pour les logs d'emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  reservation_data JSONB,
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_or_create_client(text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_client_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION link_reservation_to_client(uuid, uuid) TO authenticated;
GRANT SELECT ON client_reservations_summary TO authenticated;
GRANT INSERT, SELECT ON email_logs TO authenticated;