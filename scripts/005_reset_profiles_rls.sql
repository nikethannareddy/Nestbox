-- Completely reset RLS policies for profiles table to fix infinite recursion
-- This is a nuclear approach to eliminate all circular dependencies

-- Disable RLS temporarily to clear all policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles table
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON public.profiles';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create the simplest possible policies that cannot cause recursion
-- Policy 1: Users can access their own profile
CREATE POLICY "profiles_own_access" ON public.profiles 
FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Policy 2: Allow service role full access (for admin operations)
CREATE POLICY "profiles_service_role_access" ON public.profiles 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create a simple admin check function that doesn't query profiles table
CREATE OR REPLACE FUNCTION public.check_admin_role(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple hardcoded admin check to avoid recursion
  RETURN user_email = 'admin@nestbox.app';
END;
$$;

-- Update the handle_new_user function to be simpler
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Simple role assignment based on email
  user_role := CASE 
    WHEN NEW.email = 'admin@nestbox.app' THEN 'admin'
    ELSE 'volunteer'
  END;
  
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.email,
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$;

-- Create admin user if it doesn't exist
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'admin@nestbox.app',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User", "role": "admin"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;
