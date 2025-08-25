/*
  # Add address and activity columns to admin_users table

  This migration adds address and activity columns to the admin_users table
  to support complete client profile information.
*/

-- Add address column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS address text;

-- Add activity column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS activity text;

-- Add comments for documentation
COMMENT ON COLUMN admin_users.address IS 'Address for client profile information';
COMMENT ON COLUMN admin_users.activity IS 'Activity/business type for client profile';
