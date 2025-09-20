-- Check if RLS is enabled on the profiles table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Check the current policies on the profiles table
SELECT * FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Check the current role and user
SELECT current_user, session_user, current_role;

-- Check the current auth.uid() value
SELECT auth.uid();
