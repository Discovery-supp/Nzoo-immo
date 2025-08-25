-- Script pour ajouter des réservations de test pour les clients
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les réservations de test existantes (optionnel)
DELETE FROM reservations WHERE email LIKE '%test%';

-- Insérer des réservations de test
INSERT INTO reservations (
  email,
  full_name,
  phone,
  company,
  space_type,
  start_date,
  end_date,
  amount,
  status,
  created_at,
  updated_at
) VALUES 
-- Réservations pour test.client1@example.com
(
  'test.client1@example.com',
  'Jean Dupont',
  '+33 1 23 45 67 89',
  'Entreprise Test 1',
  'bureau',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '20 days',
  150.00,
  'confirmed',
  NOW() - INTERVAL '30 days',
  NOW()
),
(
  'test.client1@example.com',
  'Jean Dupont',
  '+33 1 23 45 67 89',
  'Entreprise Test 1',
  'salle_reunion',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '8 days',
  200.00,
  'confirmed',
  NOW() - INTERVAL '15 days',
  NOW()
),
-- Réservations pour test.client2@example.com
(
  'test.client2@example.com',
  'Marie Martin',
  '+33 1 98 76 54 32',
  'Société Test 2',
  'domiciliation',
  NOW() - INTERVAL '12 days',
  NOW() + INTERVAL '30 days',
  300.00,
  'confirmed',
  NOW() - INTERVAL '15 days',
  NOW()
),
-- Réservations pour test.client3@example.com
(
  'test.client3@example.com',
  'Pierre Durand',
  '+33 1 11 22 33 44',
  'Compagnie Test 3',
  'bureau',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '25 days',
  180.00,
  'confirmed',
  NOW() - INTERVAL '7 days',
  NOW()
),
(
  'test.client3@example.com',
  'Pierre Durand',
  '+33 1 11 22 33 44',
  'Compagnie Test 3',
  'salle_reunion',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days',
  120.00,
  'pending',
  NOW() - INTERVAL '3 days',
  NOW()
),
-- Réservations pour test.client4@example.com
(
  'test.client4@example.com',
  'Sophie Bernard',
  '+33 1 55 66 77 88',
  'Groupe Test 4',
  'domiciliation',
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '60 days',
  400.00,
  'confirmed',
  NOW() - INTERVAL '3 days',
  NOW()
),
-- Réservations pour test.client5@example.com
(
  'test.client5@example.com',
  'Lucas Petit',
  '+33 1 99 88 77 66',
  'Association Test 5',
  'bureau',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '29 days',
  160.00,
  'confirmed',
  NOW() - INTERVAL '1 day',
  NOW()
),
-- Réservations pour test.client6@example.com (nouveau)
(
  'test.client6@example.com',
  'Emma Roux',
  '+33 1 44 33 22 11',
  'Startup Test 6',
  'salle_reunion',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days',
  100.00,
  'pending',
  NOW(),
  NOW()
),
-- Réservations pour test.client7@example.com
(
  'test.client7@example.com',
  'Thomas Moreau',
  '+33 1 77 66 55 44',
  'Consulting Test 7',
  'bureau',
  NOW() - INTERVAL '40 days',
  NOW() - INTERVAL '35 days',
  170.00,
  'confirmed',
  NOW() - INTERVAL '45 days',
  NOW()
),
(
  'test.client7@example.com',
  'Thomas Moreau',
  '+33 1 77 66 55 44',
  'Consulting Test 7',
  'domiciliation',
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '30 days',
  350.00,
  'confirmed',
  NOW() - INTERVAL '35 days',
  NOW()
),
-- Réservations pour test.client8@example.com
(
  'test.client8@example.com',
  'Julie Leroy',
  '+33 1 33 44 55 66',
  'Agence Test 8',
  'bureau',
  NOW() - INTERVAL '55 days',
  NOW() - INTERVAL '50 days',
  140.00,
  'confirmed',
  NOW() - INTERVAL '60 days',
  NOW()
),
-- Réservations pour test.client9@example.com
(
  'test.client9@example.com',
  'Antoine Simon',
  '+33 1 88 99 00 11',
  'Studio Test 9',
  'salle_reunion',
  NOW() - INTERVAL '85 days',
  NOW() - INTERVAL '85 days',
  90.00,
  'confirmed',
  NOW() - INTERVAL '90 days',
  NOW()
),
-- Réservations pour test.client10@example.com
(
  'test.client10@example.com',
  'Camille Michel',
  '+33 1 22 33 44 55',
  'Bureau Test 10',
  'bureau',
  NOW() - INTERVAL '115 days',
  NOW() - INTERVAL '110 days',
  130.00,
  'confirmed',
  NOW() - INTERVAL '120 days',
  NOW()
),
(
  'test.client10@example.com',
  'Camille Michel',
  '+33 1 22 33 44 55',
  'Bureau Test 10',
  'domiciliation',
  NOW() - INTERVAL '100 days',
  NOW() + INTERVAL '20 days',
  280.00,
  'confirmed',
  NOW() - INTERVAL '105 days',
  NOW()
);

-- Vérifier l'insertion des réservations
SELECT 
  email,
  full_name,
  space_type,
  amount,
  status,
  start_date,
  end_date,
  created_at
FROM reservations 
WHERE email LIKE '%test%'
ORDER BY created_at DESC;

-- Statistiques des réservations de test
SELECT 
  COUNT(*) as total_reservations,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as reservations_confirmees,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as reservations_en_attente,
  SUM(amount) as montant_total,
  AVG(amount) as montant_moyen
FROM reservations 
WHERE email LIKE '%test%';

-- Réservations par client
SELECT 
  email,
  full_name,
  COUNT(*) as nombre_reservations,
  SUM(amount) as montant_total,
  MAX(created_at) as derniere_reservation
FROM reservations 
WHERE email LIKE '%test%'
GROUP BY email, full_name
ORDER BY montant_total DESC;
