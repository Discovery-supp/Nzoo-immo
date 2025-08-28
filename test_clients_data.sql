-- Script pour ajouter des clients de test dans la base de données
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les clients de test existants (optionnel)
DELETE FROM admin_users WHERE email LIKE '%test%' AND role = 'clients';

-- Insérer des clients de test
INSERT INTO admin_users (
  email,
  username,
  full_name,
  phone,
  company,
  role,
  is_active,
  password_hash,
  created_at,
  updated_at
) VALUES 
-- Client de test 1
(
  'test.client1@example.com',
  'testclient1',
  'Jean Dupont',
  '+33 1 23 45 67 89',
  'Entreprise Test 1',
  'clients',
  true,
  '$2a$10$test.hash.for.client1',
  NOW() - INTERVAL '30 days',
  NOW()
),
-- Client de test 2
(
  'test.client2@example.com',
  'testclient2',
  'Marie Martin',
  '+33 1 98 76 54 32',
  'Société Test 2',
  'clients',
  true,
  '$2a$10$test.hash.for.client2',
  NOW() - INTERVAL '15 days',
  NOW()
),
-- Client de test 3
(
  'test.client3@example.com',
  'testclient3',
  'Pierre Durand',
  '+33 1 11 22 33 44',
  'Compagnie Test 3',
  'clients',
  true,
  '$2a$10$test.hash.for.client3',
  NOW() - INTERVAL '7 days',
  NOW()
),
-- Client de test 4
(
  'test.client4@example.com',
  'testclient4',
  'Sophie Bernard',
  '+33 1 55 66 77 88',
  'Groupe Test 4',
  'clients',
  false,
  '$2a$10$test.hash.for.client4',
  NOW() - INTERVAL '3 days',
  NOW()
),
-- Client de test 5
(
  'test.client5@example.com',
  'testclient5',
  'Lucas Petit',
  '+33 1 99 88 77 66',
  'Association Test 5',
  'clients',
  true,
  '$2a$10$test.hash.for.client5',
  NOW() - INTERVAL '1 day',
  NOW()
),
-- Client de test 6 (nouveau ce mois)
(
  'test.client6@example.com',
  'testclient6',
  'Emma Roux',
  '+33 1 44 33 22 11',
  'Startup Test 6',
  'clients',
  true,
  '$2a$10$test.hash.for.client6',
  NOW(),
  NOW()
),
-- Client de test 7
(
  'test.client7@example.com',
  'testclient7',
  'Thomas Moreau',
  '+33 1 77 66 55 44',
  'Consulting Test 7',
  'clients',
  true,
  '$2a$10$test.hash.for.client7',
  NOW() - INTERVAL '45 days',
  NOW()
),
-- Client de test 8
(
  'test.client8@example.com',
  'testclient8',
  'Julie Leroy',
  '+33 1 33 44 55 66',
  'Agence Test 8',
  'clients',
  true,
  '$2a$10$test.hash.for.client8',
  NOW() - INTERVAL '60 days',
  NOW()
),
-- Client de test 9
(
  'test.client9@example.com',
  'testclient9',
  'Antoine Simon',
  '+33 1 88 99 00 11',
  'Studio Test 9',
  'clients',
  false,
  '$2a$10$test.hash.for.client9',
  NOW() - INTERVAL '90 days',
  NOW()
),
-- Client de test 10
(
  'test.client10@example.com',
  'testclient10',
  'Camille Michel',
  '+33 1 22 33 44 55',
  'Bureau Test 10',
  'clients',
  true,
  '$2a$10$test.hash.for.client10',
  NOW() - INTERVAL '120 days',
  NOW()
);

-- Vérifier l'insertion
SELECT 
  email,
  full_name,
  company,
  is_active,
  created_at,
  role
FROM admin_users 
WHERE email LIKE '%test%' AND role = 'clients'
ORDER BY created_at DESC;

-- Compter le nombre total de clients
SELECT 
  COUNT(*) as total_clients,
  COUNT(CASE WHEN is_active = true THEN 1 END) as clients_actifs,
  COUNT(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN 1 END) as nouveaux_ce_mois
FROM admin_users 
WHERE role = 'clients';
