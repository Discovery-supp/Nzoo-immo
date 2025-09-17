-- Migration pour créer la table des paiements mobile money
-- Date: 2025-01-21
-- Description: Création de la table pour gérer les paiements par mobile money

-- Créer la table pour les paiements mobile money
CREATE TABLE IF NOT EXISTS mobile_money_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  phone_number TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('ORANGE', 'AIRTEL', 'MPESE')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  client_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_url TEXT,
  error_message TEXT
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_mobile_money_payments_status ON mobile_money_payments(status);
CREATE INDEX IF NOT EXISTS idx_mobile_money_payments_client_email ON mobile_money_payments(client_email);
CREATE INDEX IF NOT EXISTS idx_mobile_money_payments_reservation_id ON mobile_money_payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_mobile_money_payments_created_at ON mobile_money_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_mobile_money_payments_operator ON mobile_money_payments(operator);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_mobile_money_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_mobile_money_payments_updated_at ON mobile_money_payments;
CREATE TRIGGER trigger_update_mobile_money_payments_updated_at
  BEFORE UPDATE ON mobile_money_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_mobile_money_payments_updated_at();

-- Créer une vue pour les statistiques des paiements
CREATE OR REPLACE VIEW mobile_money_payments_stats AS
SELECT 
  COUNT(*) as total_payments,
  COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_payments,
  COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_payments,
  COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_payments,
  COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_payments,
  COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 0) as total_amount_successful,
  COALESCE(AVG(CASE WHEN status = 'SUCCESS' THEN amount END), 0) as average_amount_successful
FROM mobile_money_payments;

-- Créer une vue pour les paiements avec détails des réservations
CREATE OR REPLACE VIEW mobile_money_payments_with_reservations AS
SELECT 
  mmp.*,
  r.full_name as client_name,
  r.space_type,
  r.start_date,
  r.end_date,
  r.total_price
FROM mobile_money_payments mmp
LEFT JOIN reservations r ON mmp.reservation_id = r.id;

-- Créer des politiques RLS (Row Level Security) si nécessaire
-- Note: Ces politiques peuvent être ajustées selon vos besoins de sécurité

-- Politique pour permettre la lecture des paiements (ajustez selon vos besoins)
-- ALTER TABLE mobile_money_payments ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres paiements
-- CREATE POLICY "Users can view their own payments" ON mobile_money_payments
--   FOR SELECT USING (auth.email() = client_email);

-- Politique pour permettre aux admins de voir tous les paiements
-- CREATE POLICY "Admins can view all payments" ON mobile_money_payments
--   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insérer des données de test (optionnel, pour le développement)
-- INSERT INTO mobile_money_payments (transaction_id, amount, currency, phone_number, operator, status, reservation_id, client_email, description)
-- VALUES 
--   ('TXN_TEST_001', 100.00, 'EUR', '0991234567', 'ORANGE', 'SUCCESS', NULL, 'test@example.com', 'Paiement de test 1'),
--   ('TXN_TEST_002', 150.00, 'EUR', '0997654321', 'AIRTEL', 'PENDING', NULL, 'test2@example.com', 'Paiement de test 2'),
--   ('TXN_TEST_003', 75.00, 'EUR', '0991111111', 'MPESE', 'FAILED', NULL, 'test3@example.com', 'Paiement de test 3')
-- ON CONFLICT (transaction_id) DO NOTHING;

-- Commentaires sur la structure
COMMENT ON TABLE mobile_money_payments IS 'Table pour gérer les paiements par mobile money (Orange Money, Airtel Money, M-Pesa)';
COMMENT ON COLUMN mobile_money_payments.transaction_id IS 'ID unique de la transaction (généré par CinetPay ou le système)';
COMMENT ON COLUMN mobile_money_payments.amount IS 'Montant du paiement en décimal';
COMMENT ON COLUMN mobile_money_payments.currency IS 'Devise du paiement (par défaut EUR)';
COMMENT ON COLUMN mobile_money_payments.phone_number IS 'Numéro de téléphone du client';
COMMENT ON COLUMN mobile_money_payments.operator IS 'Opérateur mobile money (ORANGE, AIRTEL, MPESE)';
COMMENT ON COLUMN mobile_money_payments.status IS 'Statut du paiement (PENDING, SUCCESS, FAILED, CANCELLED)';
COMMENT ON COLUMN mobile_money_payments.reservation_id IS 'Référence vers la réservation associée';
COMMENT ON COLUMN mobile_money_payments.client_email IS 'Email du client';
COMMENT ON COLUMN mobile_money_payments.payment_url IS 'URL de paiement générée par CinetPay';
COMMENT ON COLUMN mobile_money_payments.error_message IS 'Message d''erreur en cas d''échec du paiement';

-- Vérifier que la table a été créée correctement
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'mobile_money_payments'
ORDER BY ordinal_position;






