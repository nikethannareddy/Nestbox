-- Fix infinite recursion in profiles table RLS policies
-- The issue is that the admin policy tries to query the profiles table while accessing it

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Create a helper function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use auth.jwt() to get user metadata instead of querying profiles table
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  );
END;
$$;

-- Create new admin policies that don't cause recursion
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR public.is_admin()
);

CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT WITH CHECK (
  auth.uid() = id OR public.is_admin()
);

CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR public.is_admin()
);

CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE USING (
  auth.uid() = id OR public.is_admin()
);

-- Update the handle_new_user function to set admin role in user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Determine role based on email or default to volunteer
  user_role := CASE 
    WHEN NEW.email = 'admin@nestbox.app' THEN 'admin'
    ELSE COALESCE(NEW.raw_user_meta_data ->> 'role', 'volunteer')
  END;
  
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.email,
    user_role
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
