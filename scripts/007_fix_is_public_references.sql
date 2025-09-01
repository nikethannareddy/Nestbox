-- Fix RLS policies that reference non-existent is_public column in nest_boxes table

-- Drop the problematic policy that references is_public
DROP POLICY IF EXISTS "nest_boxes_select_public" ON nest_boxes;

-- Create a new policy that allows all authenticated users to view nest boxes
CREATE POLICY "nest_boxes_select_authenticated" ON nest_boxes
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Update the database types to match actual schema
-- Note: The nest_boxes table doesn't have an is_public column in the actual database
