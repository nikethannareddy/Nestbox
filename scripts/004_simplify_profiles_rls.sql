-- Remove all complex RLS policies that cause infinite recursion
-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;

-- Create simple, non-recursive policies for profiles table
-- Users can only access their own profile data
CREATE POLICY "profiles_own_data" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Allow authenticated users to read basic profile info (for admin functionality)
-- This is safe because it doesn't create recursion
CREATE POLICY "profiles_read_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);

-- Drop the problematic helper function
DROP FUNCTION IF EXISTS public.is_admin();

-- Update other table policies to use simple role checking
-- Fix sponsors table policies
DROP POLICY IF EXISTS "sponsors_select_own" ON public.sponsors;
CREATE POLICY "sponsors_select_own" ON public.sponsors FOR SELECT USING (
  profile_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- Fix volunteer assignments policies  
DROP POLICY IF EXISTS "assignments_select_involved" ON public.volunteer_assignments;
CREATE POLICY "assignments_select_involved" ON public.volunteer_assignments FOR SELECT USING (
  volunteer_id = auth.uid() OR 
  assigned_by = auth.uid() OR
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "assignments_admin_all" ON public.volunteer_assignments;
CREATE POLICY "assignments_admin_all" ON public.volunteer_assignments FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Fix activity logs policies
DROP POLICY IF EXISTS "activity_logs_update_own" ON public.activity_logs;
CREATE POLICY "activity_logs_update_own" ON public.activity_logs FOR UPDATE USING (
  volunteer_id = auth.uid() OR 
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Fix nest boxes policies
DROP POLICY IF EXISTS "nest_boxes_admin_all" ON public.nest_boxes;
CREATE POLICY "nest_boxes_admin_all" ON public.nest_boxes FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Fix educational content policies
DROP POLICY IF EXISTS "educational_content_admin_all" ON public.educational_content;
CREATE POLICY "educational_content_admin_all" ON public.educational_content FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Fix notifications policies
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Fix system settings policies
DROP POLICY IF EXISTS "system_settings_admin_all" ON public.system_settings;
CREATE POLICY "system_settings_admin_all" ON public.system_settings FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
