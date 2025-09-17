/*
  # Add contract and subscription fields to reservations table

  This migration adds fields to support differentiated offer management:
  - contract_accepted: For offers without date management (e.g., domiciliation)
  - selected_months: Number of months selected for subscription-based offers
  - subscription_type: Type of subscription (daily, monthly, yearly)
*/

-- Add contract_accepted column
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS contract_accepted boolean DEFAULT false;

-- Add selected_months column
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS selected_months integer;

-- Add subscription_type column if it doesn't exist
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'daily';

-- Add comments for documentation
COMMENT ON COLUMN reservations.contract_accepted IS 'Whether the contract was accepted for offers without date management';
COMMENT ON COLUMN reservations.selected_months IS 'Number of months selected for subscription-based offers';
COMMENT ON COLUMN reservations.subscription_type IS 'Type of subscription: daily, monthly, yearly';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_contract_accepted ON reservations(contract_accepted);
CREATE INDEX IF NOT EXISTS idx_reservations_subscription_type ON reservations(subscription_type);
