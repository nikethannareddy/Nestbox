-- =====================================================
-- VERIFY MIGRATION SUCCESS
-- =====================================================
-- This script verifies that the migration was successful

-- Log verification start
INSERT INTO backup_migration.migration_log (step, description) VALUES 
('verification_start', 'Starting migration verification');

-- Check table counts
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM user_profiles
UNION ALL
SELECT 
    'nest_boxes' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM nest_boxes
UNION ALL
SELECT 
    'activity_logs' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM activity_logs
UNION ALL
SELECT 
    'volunteer_assignments' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM volunteer_assignments
UNION ALL
SELECT 
    'sponsorships' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM sponsorships
UNION ALL
SELECT 
    'educational_content' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM educational_content
ORDER BY table_name;

-- Verify data integrity
SELECT 
    'Data Integrity Check' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: No orphaned activity logs'
        ELSE 'FAIL: ' || COUNT(*) || ' orphaned activity logs found'
    END as result
FROM activity_logs al
LEFT JOIN nest_boxes nb ON al.nest_box_id = nb.id
WHERE nb.id IS NULL

UNION ALL

SELECT 
    'Foreign Key Check' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: No orphaned volunteer assignments'
        ELSE 'FAIL: ' || COUNT(*) || ' orphaned volunteer assignments found'
    END as result
FROM volunteer_assignments va
LEFT JOIN user_profiles up ON va.volunteer_id = up.id
WHERE up.id IS NULL

UNION ALL

SELECT 
    'Sponsorship Check' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: No orphaned sponsorships'
        ELSE 'FAIL: ' || COUNT(*) || ' orphaned sponsorships found'
    END as result
FROM sponsorships s
LEFT JOIN user_profiles up ON s.sponsor_id = up.id
WHERE up.id IS NULL;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'nest_boxes', 'activity_logs', 'volunteer_assignments', 'sponsorships', 'educational_content')
ORDER BY tablename;

-- Migration summary
SELECT 
    'Migration Summary' as summary_type,
    (SELECT COUNT(*) FROM backup_migration.old_profiles) as old_profiles,
    (SELECT COUNT(*) FROM user_profiles) as new_profiles,
    (SELECT COUNT(*) FROM backup_migration.old_nest_boxes) as old_nest_boxes,
    (SELECT COUNT(*) FROM nest_boxes) as new_nest_boxes,
    (SELECT COUNT(*) FROM backup_migration.old_activity_logs) as old_activity_logs,
    (SELECT COUNT(*) FROM activity_logs) as new_activity_logs;

-- Log verification completion
INSERT INTO backup_migration.migration_log (step, description) VALUES 
('verification_complete', 'Migration verification completed successfully');

SELECT 'Migration verification completed. Check results above for any issues.' as status;
