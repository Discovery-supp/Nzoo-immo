-- Migration pour les relances intelligentes IA
-- Date: 2025-01-15

-- =====================================================
-- TABLE: ai_follow_ups
-- =====================================================

-- Créer la table des relances IA
CREATE TABLE IF NOT EXISTS ai_follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  strategy_id text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  scheduled_date timestamptz NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ai_confidence integer NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  generated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_ai_follow_ups_client_id ON ai_follow_ups(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_follow_ups_strategy_id ON ai_follow_ups(strategy_id);
CREATE INDEX IF NOT EXISTS idx_ai_follow_ups_status ON ai_follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_ai_follow_ups_scheduled_date ON ai_follow_ups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_ai_follow_ups_priority ON ai_follow_ups(priority);
CREATE INDEX IF NOT EXISTS idx_ai_follow_ups_generated_at ON ai_follow_ups(generated_at);

-- =====================================================
-- TABLE: ai_follow_up_strategies
-- =====================================================

-- Créer la table des stratégies de relance
CREATE TABLE IF NOT EXISTS ai_follow_up_strategies (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  trigger_conditions jsonb NOT NULL DEFAULT '[]',
  ai_prompt text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  channels text[] NOT NULL DEFAULT '{}',
  cooldown_days integer NOT NULL DEFAULT 7,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

 -- Insérer les stratégies par défaut
 INSERT INTO ai_follow_up_strategies (id, name, description, trigger_conditions, ai_prompt, priority, channels, cooldown_days) VALUES
 (
   'welcome_new_client',
   'Bienvenue Nouveau Client',
   'Accueil personnalisé pour les nouveaux clients',
   '[
     {"type": "days_since_last", "operator": "less_than", "value": 7},
     {"type": "total_spent", "operator": "greater_than", "value": 0}
   ]',
   'Génère un message de bienvenue chaleureux et personnalisé pour un nouveau client qui vient de faire sa première réservation. Inclus des informations utiles sur les services et encourage l''engagement.',
   'high',
   ARRAY['email'],
   30
 ),
 (
   'inactive_client_reminder',
   'Rappel Client Inactif',
   'Relance pour les clients inactifs depuis plus de 30 jours',
   '[
     {"type": "days_since_last", "operator": "greater_than", "value": 30},
     {"type": "total_spent", "operator": "greater_than", "value": 50}
   ]',
   'Génère un message de relance amical pour un client qui n''a pas réservé depuis plus de 30 jours. Rappelle les avantages de nos services et propose une offre spéciale pour le faire revenir.',
   'medium',
   ARRAY['email', 'sms'],
   14
 ),
 (
   'high_value_client_retention',
   'Rétention Client à Forte Valeur',
   'Relance spéciale pour les clients à forte valeur',
   '[
     {"type": "total_spent", "operator": "greater_than", "value": 500},
     {"type": "days_since_last", "operator": "greater_than", "value": 14}
   ]',
   'Génère un message VIP pour un client à forte valeur qui n''a pas réservé récemment. Offre un service premium personnalisé et montre que nous apprécions leur fidélité.',
   'urgent',
   ARRAY['email', 'sms'],
   7
 ),
 (
   'cancelled_reservation_followup',
   'Suivi Réservation Annulée',
   'Relance après annulation de réservation',
   '[
     {"type": "reservation_status", "operator": "equals", "value": "cancelled"}
   ]',
   'Génère un message empathique pour un client qui a annulé sa réservation. Comprends les raisons possibles et propose des alternatives ou des solutions.',
   'high',
   ARRAY['email'],
   3
 ),
 (
   'seasonal_promotion',
   'Promotion Saisonnière',
   'Offres spéciales selon la saison',
   '[
     {"type": "days_since_last", "operator": "greater_than", "value": 7}
   ]',
   'Génère un message promotionnel saisonnier attractif. Adapte le contenu selon la période de l''année et les besoins typiques des clients.',
   'medium',
   ARRAY['email', 'push'],
   21
 )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  trigger_conditions = EXCLUDED.trigger_conditions,
  ai_prompt = EXCLUDED.ai_prompt,
  priority = EXCLUDED.priority,
  channels = EXCLUDED.channels,
  cooldown_days = EXCLUDED.cooldown_days,
  updated_at = now();

-- =====================================================
-- TABLE: ai_follow_up_settings
-- =====================================================

-- Créer la table des paramètres IA
CREATE TABLE IF NOT EXISTS ai_follow_up_settings (
  id text PRIMARY KEY DEFAULT 'default',
  high_risk_threshold integer NOT NULL DEFAULT 70,
  low_engagement_threshold integer NOT NULL DEFAULT 40,
  critical_inactivity_days integer NOT NULL DEFAULT 30,
  check_interval_minutes integer NOT NULL DEFAULT 60,
  daily_follow_up_limit integer NOT NULL DEFAULT 50,
  auto_mode_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insérer les paramètres par défaut
INSERT INTO ai_follow_up_settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TABLE: ai_follow_up_logs
-- =====================================================

-- Créer la table des logs pour le suivi des actions IA
CREATE TABLE IF NOT EXISTS ai_follow_up_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  client_id text,
  strategy_id text,
  follow_up_id uuid REFERENCES ai_follow_ups(id) ON DELETE SET NULL,
  details jsonb,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Créer les index pour les logs
CREATE INDEX IF NOT EXISTS idx_ai_follow_up_logs_action ON ai_follow_up_logs(action);
CREATE INDEX IF NOT EXISTS idx_ai_follow_up_logs_client_id ON ai_follow_up_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_follow_up_logs_created_at ON ai_follow_up_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_follow_up_logs_success ON ai_follow_up_logs(success);

-- =====================================================
-- FONCTIONS RPC
-- =====================================================

-- Fonction pour analyser un client et générer des insights
CREATE OR REPLACE FUNCTION analyze_client_ai(client_email text)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  client_reservations record;
  total_spent numeric := 0;
  last_activity timestamptz;
  days_since_last integer;
  risk_score integer := 0;
  engagement_score integer := 100;
  result jsonb;
BEGIN
  -- Récupérer les réservations du client
  SELECT 
    COUNT(*) as total_reservations,
    SUM(amount) as total_amount,
    MAX(created_at) as last_reservation_date,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancellations
  INTO client_reservations
  FROM reservations 
  WHERE email = client_email;

  -- Calculer les métriques
  total_spent := COALESCE(client_reservations.total_amount, 0);
  last_activity := COALESCE(client_reservations.last_reservation_date, now());
  days_since_last := EXTRACT(EPOCH FROM (now() - last_activity)) / 86400;

  -- Calculer le score de risque
  IF days_since_last > 90 THEN
    risk_score := risk_score + 40;
  ELSIF days_since_last > 60 THEN
    risk_score := risk_score + 30;
  ELSIF days_since_last > 30 THEN
    risk_score := risk_score + 20;
  ELSIF days_since_last > 14 THEN
    risk_score := risk_score + 10;
  END IF;

  IF total_spent > 1000 THEN
    risk_score := risk_score + 30;
  ELSIF total_spent > 500 THEN
    risk_score := risk_score + 20;
  ELSIF total_spent > 100 THEN
    risk_score := risk_score + 10;
  END IF;

  risk_score := risk_score + (client_reservations.cancellations * 5);
  risk_score := LEAST(risk_score, 100);

  -- Calculer le score d'engagement
  IF days_since_last > 90 THEN
    engagement_score := engagement_score - 60;
  ELSIF days_since_last > 60 THEN
    engagement_score := engagement_score - 40;
  ELSIF days_since_last > 30 THEN
    engagement_score := engagement_score - 20;
  ELSIF days_since_last > 14 THEN
    engagement_score := engagement_score - 10;
  END IF;

  -- Augmenter selon la fréquence
  IF client_reservations.total_reservations > 0 THEN
    engagement_score := engagement_score + LEAST((client_reservations.total_reservations / GREATEST(days_since_last / 30, 1)) * 10, 30);
  END IF;

  engagement_score := GREATEST(LEAST(engagement_score, 100), 0);

  -- Construire le résultat
  result := jsonb_build_object(
    'clientId', client_email,
    'riskScore', risk_score,
    'engagementScore', engagement_score,
    'lifetimeValue', total_spent,
    'lastActivity', last_activity,
    'daysSinceLast', days_since_last,
    'totalReservations', client_reservations.total_reservations,
    'cancellations', client_reservations.cancellations
  );

  RETURN result;
END;
$$;

-- Fonction pour générer automatiquement des relances
CREATE OR REPLACE FUNCTION generate_automatic_follow_ups()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  client_record record;
  insight jsonb;
  strategy_record record;
  follow_up_id uuid;
  generated_count integer := 0;
  result jsonb;
BEGIN
  -- Parcourir tous les clients uniques
  FOR client_record IN 
    SELECT DISTINCT email 
    FROM reservations 
    WHERE email IS NOT NULL
  LOOP
    -- Analyser le client
    insight := analyze_client_ai(client_record.email);
    
    -- Vérifier si une relance est nécessaire
    IF (insight->>'riskScore')::integer > 50 OR 
       (insight->>'engagementScore')::integer < 40 OR
       (insight->>'daysSinceLast')::integer > 30 OR
       ((insight->>'lifetimeValue')::numeric > 500 AND (insight->>'daysSinceLast')::integer > 14) THEN
      
      -- Trouver une stratégie appropriée
      SELECT * INTO strategy_record
      FROM ai_follow_up_strategies
      WHERE is_active = true
      ORDER BY priority DESC
      LIMIT 1;
      
      IF FOUND THEN
        -- Créer la relance
        INSERT INTO ai_follow_ups (
          client_id, 
          strategy_id, 
          subject, 
          message, 
          channel, 
          scheduled_date, 
          priority, 
          ai_confidence
        ) VALUES (
          client_record.email,
          strategy_record.id,
          'Relance automatique - ' || strategy_record.name,
          'Message généré automatiquement pour ' || client_record.email,
          strategy_record.channels[1],
          now() + interval '2 days',
          strategy_record.priority,
          75
        ) RETURNING id INTO follow_up_id;
        
        generated_count := generated_count + 1;
        
        -- Logger l'action
        INSERT INTO ai_follow_up_logs (action, client_id, strategy_id, follow_up_id, details)
        VALUES ('generated', client_record.email, strategy_record.id, follow_up_id, insight);
      END IF;
    END IF;
  END LOOP;
  
  result := jsonb_build_object(
    'success', true,
    'generatedCount', generated_count,
    'message', 'Relances générées avec succès'
  );
  
  RETURN result;
END;
$$;

-- Fonction pour envoyer une relance
CREATE OR REPLACE FUNCTION send_follow_up(follow_up_uuid uuid)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  follow_up_record record;
  success boolean := true;
  result jsonb;
BEGIN
  -- Récupérer la relance
  SELECT * INTO follow_up_record
  FROM ai_follow_ups
  WHERE id = follow_up_uuid;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Relance non trouvée'
    );
  END IF;
  
  -- Simuler l'envoi (à remplacer par une vraie logique d'envoi)
  UPDATE ai_follow_ups
  SET status = 'sent', sent_at = now()
  WHERE id = follow_up_uuid;
  
  -- Logger l'action
  INSERT INTO ai_follow_up_logs (action, client_id, strategy_id, follow_up_id, details, success)
  VALUES ('sent', follow_up_record.client_id, follow_up_record.strategy_id, follow_up_uuid, 
          jsonb_build_object('channel', follow_up_record.channel), true);
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Relance envoyée avec succès',
    'channel', follow_up_record.channel
  );
  
  RETURN result;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables
CREATE TRIGGER update_ai_follow_ups_updated_at 
  BEFORE UPDATE ON ai_follow_ups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_follow_up_strategies_updated_at 
  BEFORE UPDATE ON ai_follow_up_strategies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_follow_up_settings_updated_at 
  BEFORE UPDATE ON ai_follow_up_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE ai_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_follow_up_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_follow_up_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_follow_up_logs ENABLE ROW LEVEL SECURITY;

-- Politiques pour les administrateurs (accès complet)
CREATE POLICY "Admin full access on ai_follow_ups" ON ai_follow_ups
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access on ai_follow_up_strategies" ON ai_follow_up_strategies
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access on ai_follow_up_settings" ON ai_follow_up_settings
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access on ai_follow_up_logs" ON ai_follow_up_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques pour les utilisateurs (lecture seule)
CREATE POLICY "Users read access on ai_follow_ups" ON ai_follow_ups
  FOR SELECT USING (auth.jwt() ->> 'role' = 'user');

CREATE POLICY "Users read access on ai_follow_up_strategies" ON ai_follow_up_strategies
  FOR SELECT USING (auth.jwt() ->> 'role' = 'user');

CREATE POLICY "Users read access on ai_follow_up_settings" ON ai_follow_up_settings
  FOR SELECT USING (auth.jwt() ->> 'role' = 'user');

CREATE POLICY "Users read access on ai_follow_up_logs" ON ai_follow_up_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'user');

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue pour les statistiques des relances
CREATE OR REPLACE VIEW ai_follow_up_stats AS
SELECT 
  COUNT(*) as total_follow_ups,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_follow_ups,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_follow_ups,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_follow_ups,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_follow_ups,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority_follow_ups,
  AVG(ai_confidence) as avg_confidence,
  COUNT(DISTINCT client_id) as unique_clients
FROM ai_follow_ups;

-- Vue pour les insights clients
CREATE OR REPLACE VIEW client_ai_insights AS
SELECT 
  email as client_id,
  analyze_client_ai(email) as insights
FROM (
  SELECT DISTINCT email 
  FROM reservations 
  WHERE email IS NOT NULL
) clients;

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON TABLE ai_follow_ups IS 'Table des relances intelligentes générées par IA';
COMMENT ON TABLE ai_follow_up_strategies IS 'Table des stratégies de relance configurables';
COMMENT ON TABLE ai_follow_up_settings IS 'Table des paramètres de configuration IA';
COMMENT ON TABLE ai_follow_up_logs IS 'Table des logs pour le suivi des actions IA';

COMMENT ON FUNCTION analyze_client_ai IS 'Analyse un client et génère des insights pour les relances IA';
COMMENT ON FUNCTION generate_automatic_follow_ups IS 'Génère automatiquement des relances basées sur l''analyse des clients';
COMMENT ON FUNCTION send_follow_up IS 'Envoie une relance spécifique';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

-- Vérification que tout a été créé correctement
DO $$
BEGIN
  RAISE NOTICE 'Migration AI Follow-ups terminée avec succès!';
  RAISE NOTICE 'Tables créées: ai_follow_ups, ai_follow_up_strategies, ai_follow_up_settings, ai_follow_up_logs';
  RAISE NOTICE 'Fonctions créées: analyze_client_ai, generate_automatic_follow_ups, send_follow_up';
  RAISE NOTICE 'Vues créées: ai_follow_up_stats, client_ai_insights';
END $$;
