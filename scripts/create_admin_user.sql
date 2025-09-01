-- Script to promote a user to admin status
-- INSTRUCTIONS:
-- 1. First sign up through /auth page with your email
-- 2. Replace 'your-email@example.com' below with your actual email
-- 3. Run this script in Supabase SQL Editor

-- Promote user to admin
UPDATE public.profiles 
SET 
  is_admin = true,
  is_superuser = true,
  role = 'admin',
  updated_at = now()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'  -- Replace with your actual email
);

-- Verify the admin user was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_admin,
  p.is_superuser,
  p.created_at
FROM public.profiles p
WHERE p.is_admin = true;

-- If no results, check if user exists in auth.users
SELECT email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'your-email@example.com';  -- Replace with your actual email
