-- Corriger le rôle de Myv et Joel de 'user' à 'admin'
UPDATE admin_users 
SET role = 'admin', updated_at = now()
WHERE email LIKE '%myv%' OR full_name LIKE '%Myv%' 
   OR email LIKE '%joel%' OR full_name LIKE '%Joel%';

-- Vérifier le changement
SELECT id, username, email, role, full_name, is_active 
FROM admin_users 
WHERE email LIKE '%myv%' OR full_name LIKE '%Myv%'
   OR email LIKE '%joel%' OR full_name LIKE '%Joel%';
