-- Script pour nettoyer les données de test
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer toutes les réservations de test
DELETE FROM reservations WHERE email LIKE '%test%';

-- Supprimer tous les clients de test
DELETE FROM admin_users WHERE email LIKE '%test%' AND role = 'clients';

-- Vérifier le nettoyage
SELECT 
  'Réservations restantes' as type,
  COUNT(*) as count
FROM reservations 
WHERE email LIKE '%test%'

UNION ALL

SELECT 
  'Clients restants' as type,
  COUNT(*) as count
FROM admin_users 
WHERE email LIKE '%test%' AND role = 'clients';

-- Afficher le nombre total de clients et réservations
SELECT 
  'Total clients' as type,
  COUNT(*) as count
FROM admin_users 
WHERE role = 'clients'

UNION ALL

SELECT 
  'Total réservations' as type,
  COUNT(*) as count
FROM reservations;
