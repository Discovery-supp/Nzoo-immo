/*
  # Add avatar_url column to admin_users table

  This migration adds avatar_url column to the admin_users table
  to support user profile avatars.
*/

-- Add avatar_url column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add comment for documentation
COMMENT ON COLUMN admin_users.avatar_url IS 'URL of the user profile avatar image';
