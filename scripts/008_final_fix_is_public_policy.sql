-- Final fix for the is_public column error in nest_boxes RLS policy
-- This removes the problematic policy and creates a correct one

-- Drop the problematic policy that references non-existent is_public column
DROP POLICY IF EXISTS "nest_boxes_select_public" ON nest_boxes;

-- Create a new policy that allows all authenticated users to view nest boxes
-- This matches the actual database schema which doesn't have an is_public column
CREATE POLICY "nest_boxes_select_authenticated" ON nest_boxes
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Verify the policy was created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'nest_boxes' AND policyname = 'nest_boxes_select_authenticated';
