-- Add admin role to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND (is_admin = true OR is_superuser = true)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create a function to check if user is superuser
CREATE OR REPLACE FUNCTION public.is_superuser()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_superuser = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Update RLS policies to allow admins to manage all profiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin() OR is_superuser());

CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_superuser())
  WITH CHECK (is_superuser() OR auth.uid() = id);

-- Create a function to promote a user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_id UUID)
RETURNS void AS $$
BEGIN
  IF is_superuser() THEN
    UPDATE profiles 
    SET is_admin = true
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to promote to superuser (only callable by existing superusers)
CREATE OR REPLACE FUNCTION public.promote_to_superuser(user_id UUID)
RETURNS void AS $$
BEGIN
  IF is_superuser() THEN
    UPDATE profiles 
    SET is_admin = true, is_superuser = true
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to demote admin (only callable by superusers)
CREATE OR REPLACE FUNCTION public.demote_admin(user_id UUID)
RETURNS void AS $$
BEGIN
  IF is_superuser() AND user_id != auth.uid() THEN
    UPDATE profiles 
    SET is_admin = false, is_superuser = false
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admin user management
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_admin,
  p.is_superuser,
  u.last_sign_in_at,
  u.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE is_admin()
ORDER BY p.created_at DESC;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_superuser() TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_superuser(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.demote_admin(UUID) TO authenticated;
GRANT SELECT ON admin_users_view TO authenticated;
