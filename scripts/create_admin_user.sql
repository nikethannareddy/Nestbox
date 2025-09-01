-- Create admin user in profiles table
-- This should be run after the admin user signs up through the UI
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  -- This will be filled in after admin@nestbox.app signs up
  '00000000-0000-0000-0000-000000000000', -- Placeholder UUID
  'admin@nestbox.app',
  'NestBox Administrator',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();
