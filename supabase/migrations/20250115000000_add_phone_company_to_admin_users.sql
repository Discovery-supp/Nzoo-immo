/*
  # Add phone and company columns to admin_users table

  This migration adds phone and company columns to the admin_users table
  to support client registration with additional contact information.
*/

-- Add phone column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS phone text;

-- Add company column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS company text;

-- Add comments for documentation
COMMENT ON COLUMN admin_users.phone IS 'Phone number for client contact information';
COMMENT ON COLUMN admin_users.company IS 'Company name for client registration';
