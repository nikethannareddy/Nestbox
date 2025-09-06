-- Fix RLS policies for nest_boxes table to allow admin insertions
-- This script addresses the "new row violates row-level security policy" error

-- Drop existing problematic policies
DROP POLICY IF EXISTS "nest_boxes_select_all" ON nest_boxes;
DROP POLICY IF EXISTS "nest_boxes_insert_admin" ON nest_boxes;
DROP POLICY IF EXISTS "nest_boxes_update_admin" ON nest_boxes;
DROP POLICY IF EXISTS "nest_boxes_delete_admin" ON nest_boxes;

-- Create new simple RLS policies for nest_boxes table
-- Allow public read access (for map display)
CREATE POLICY "nest_boxes_select_all" ON nest_boxes
    FOR SELECT USING (true);

-- Allow authenticated users to insert nest boxes
CREATE POLICY "nest_boxes_insert_authenticated" ON nest_boxes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update nest boxes
CREATE POLICY "nest_boxes_update_authenticated" ON nest_boxes
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow admins to delete nest boxes
CREATE POLICY "nest_boxes_delete_admin" ON nest_boxes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.is_admin = true OR profiles.is_superuser = true)
        )
    );

-- Ensure RLS is enabled
ALTER TABLE nest_boxes ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'nest_boxes'
ORDER BY policyname;
