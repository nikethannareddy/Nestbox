-- Drop and recreate profiles table with proper Supabase Auth integration
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create enhanced profiles table that integrates with Supabase Auth
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  email text UNIQUE NOT NULL,
  full_name text,
  profile_picture text, -- URL to profile picture
  bio text,
  phone text,
  location text,
  role text DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'admin', 'sponsor')),
  volunteer_since date DEFAULT CURRENT_DATE,
  total_observations integer DEFAULT 0,
  total_maintenance_tasks integer DEFAULT 0,
  emergency_contact text,
  emergency_phone text,
  preferred_contact_method text DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
  notifications_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update user roles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create default admin user profile (will be created when admin signs up)
-- Note: The actual auth.users record must be created through Supabase Auth
