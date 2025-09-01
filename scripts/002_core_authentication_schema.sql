-- Core Authentication Schema for NestBox Application
-- This schema integrates with Supabase Auth API for seamless user management

-- Drop existing profiles table if it exists to start fresh
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create streamlined profiles table that references auth.users
CREATE TABLE public.profiles (
  -- Primary key that references Supabase auth.users(id)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Essential user information
  username TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  
  -- Optional profile fields
  profile_picture TEXT, -- URL to profile image
  bio TEXT,
  
  -- User role for application permissions
  role TEXT NOT NULL DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'admin')),
  
  -- Contact information
  phone TEXT,
  location TEXT,
  
  -- Preferences
  notifications_enabled BOOLEAN DEFAULT true,
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Admins can view all profiles (for user management)
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update user roles (for promotion/demotion)
CREATE POLICY "profiles_admin_update_roles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);

-- Insert default admin user (will be created when admin signs up)
-- This ensures there's always at least one admin account
INSERT INTO public.profiles (
  id,
  email,
  username,
  full_name,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID, -- Placeholder ID
  'admin@nestbox.app',
  'admin',
  'NestBox Administrator',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- Verify schema creation
SELECT 'Core authentication schema created successfully' as status;
