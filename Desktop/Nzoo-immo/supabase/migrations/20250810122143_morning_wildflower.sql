/*
  # Initialize admin users table and default admin user

  1. New Tables
    - `admin_users` - Table for admin authentication
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text, default 'user')
      - `full_name` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Disable RLS on `admin_users` table for custom authentication
    - Insert default admin user with credentials: admin/admin123

  3. Default Data
    - Create default admin user for immediate access
*/

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  full_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Disable RLS on admin_users table for custom authentication
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Insert default admin user
INSERT INTO admin_users (username, email, password_hash, role, full_name)
VALUES ('admin', 'admin@nzooimmo.com', 'admin123', 'admin', 'Administrateur')
ON CONFLICT (username) DO UPDATE SET
  password_hash = 'admin123',
  role = 'admin',
  full_name = 'Administrateur',
  is_active = true,
  updated_at = now();

-- Insert additional test users
INSERT INTO admin_users (username, email, password_hash, role, full_name)
VALUES 
  ('user1', 'user1@nzooimmo.com', 'user123', 'user', 'Utilisateur Test 1'),
  ('manager', 'manager@nzooimmo.com', 'manager123', 'admin', 'Manager Test')
ON CONFLICT (username) DO NOTHING;

-- Grant full permissions on admin_users table
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON admin_users TO anon;
GRANT ALL ON admin_users TO public;