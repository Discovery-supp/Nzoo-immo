/*
  # Fonction de mise à jour automatique des statuts de réservation

  1. Fonctions
    - `update_expired_reservations()` - Met à jour automatiquement les statuts expirés
    - Réservations "en attente" avec date de fin < aujourd'hui → "annulé"
    - Réservations "confirmé" avec date de fin < aujourd'hui → "terminé"

  2. Sécurité
    - Fonction avec privilèges élevés pour contourner RLS
    - Accessible aux utilisateurs authentifiés et anonymes

  3. Utilisation
    - Appelée manuellement depuis l'interface admin
    - Peut être programmée pour s'exécuter automatiquement
*/

-- Créer la fonction de mise à jour automatique des statuts
CREATE OR REPLACE FUNCTION update_expired_reservations()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count integer := 0;
  cancelled_count integer := 0;
  completed_count integer := 0;
  result jsonb;
BEGIN
  RAISE NOTICE 'Starting automatic status update for expired reservations...';

  -- Mettre à jour les réservations "en attente" expirées vers "annulé"
  UPDATE reservations 
  SET 
    status = 'cancelled',
    updated_at = now(),
    admin_notes = COALESCE(admin_notes || ' | ', '') || 'Statut mis à jour automatiquement: annulé (date expirée)'
  WHERE 
    status = 'pending' 
    AND end_date < CURRENT_DATE;
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  RAISE NOTICE 'Updated % pending reservations to cancelled', cancelled_count;

  -- Mettre à jour les réservations "confirmé" expirées vers "terminé"
  UPDATE reservations 
  SET 
    status = 'completed',
    updated_at = now(),
    admin_notes = COALESCE(admin_notes || ' | ', '') || 'Statut mis à jour automatiquement: terminé (date expirée)'
  WHERE 
    status = 'confirmed' 
    AND end_date < CURRENT_DATE;
  
  GET DIAGNOSTICS completed_count = ROW_COUNT;
  RAISE NOTICE 'Updated % confirmed reservations to completed', completed_count;

  updated_count := cancelled_count + completed_count;

  -- Retourner le résultat
  SELECT jsonb_build_object(
    'success', true,
    'total_updated', updated_count,
    'cancelled_count', cancelled_count,
    'completed_count', completed_count,
    'message', format('Mise à jour automatique terminée: %s réservations mises à jour (%s annulées, %s terminées)', 
                     updated_count, cancelled_count, completed_count)
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating expired reservations: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erreur lors de la mise à jour automatique des statuts'
    );
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION update_expired_reservations() TO authenticated;
GRANT EXECUTE ON FUNCTION update_expired_reservations() TO anon;
GRANT EXECUTE ON FUNCTION update_expired_reservations() TO public;

-- Ajouter un commentaire pour documenter la fonction
COMMENT ON FUNCTION update_expired_reservations() IS 'Met à jour automatiquement les statuts des réservations expirées: pending->cancelled, confirmed->completed';