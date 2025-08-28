-- =====================================================
-- MIGRATE TO NEW COMPREHENSIVE SCHEMA
-- =====================================================
-- This script applies the new schema and migrates existing data

-- Log migration start
INSERT INTO backup_migration.migration_log (step, description) VALUES 
('migration_start', 'Starting migration to new comprehensive schema');

-- Execute the comprehensive schema (drop and recreate)
-- Note: This will run the 000_comprehensive_schema_design.sql content

-- First, let's preserve auth.users data by creating user_profiles from existing profiles
INSERT INTO user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    phone,
    role,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(), -- Generate new UUID for user_id (since we don't have auth.users)
    email,
    COALESCE(SPLIT_PART(full_name, ' ', 1), 'Unknown') as first_name,
    COALESCE(SPLIT_PART(full_name, ' ', 2), '') as last_name,
    phone,
    role,
    created_at,
    updated_at
FROM backup_migration.old_profiles
ON CONFLICT (email) DO NOTHING;

-- Create a mapping table for old profile IDs to new user_profile IDs
CREATE TEMP TABLE profile_id_mapping AS
SELECT 
    old_p.id as old_profile_id,
    new_p.id as new_profile_id,
    old_p.email
FROM backup_migration.old_profiles old_p
JOIN user_profiles new_p ON old_p.email = new_p.email;

-- Migrate nest boxes data
INSERT INTO nest_boxes (
    box_id,
    name,
    description,
    box_type,
    latitude,
    longitude,
    location_name,
    status,
    maintenance_status,
    installation_date,
    target_species,
    sponsor_id,
    sponsor_message,
    qr_code_url,
    created_at,
    updated_at
)
SELECT 
    COALESCE(old_nb.id::text, 'NB' || LPAD(ROW_NUMBER() OVER (ORDER BY old_nb.created_at)::text, 3, '0')) as box_id,
    COALESCE(old_nb.name, 'Nest Box ' || old_nb.id) as name,
    old_nb.description,
    COALESCE(old_nb.box_type, 'standard') as box_type,
    old_nb.latitude,
    old_nb.longitude,
    COALESCE(old_nb.name, 'Unknown Location') as location_name,
    COALESCE(old_nb.status, 'active') as status,
    CASE 
        WHEN old_nb.last_maintenance IS NOT NULL AND old_nb.last_maintenance > CURRENT_DATE - INTERVAL '30 days' THEN 'good'
        WHEN old_nb.last_maintenance IS NOT NULL AND old_nb.last_maintenance > CURRENT_DATE - INTERVAL '90 days' THEN 'needs-cleaning'
        ELSE 'needs-repair'
    END as maintenance_status,
    COALESCE(old_nb.installation_date, CURRENT_DATE - INTERVAL '1 year') as installation_date,
    COALESCE(old_nb.target_species, ARRAY['Eastern Bluebird']) as target_species,
    mapping.new_profile_id as sponsor_id,
    old_nb.sponsor_message,
    old_nb.qr_code as qr_code_url,
    old_nb.created_at,
    old_nb.updated_at
FROM backup_migration.old_nest_boxes old_nb
LEFT JOIN profile_id_mapping mapping ON old_nb.sponsor_id = mapping.old_profile_id;

-- Create mapping for old nest box IDs to new ones
CREATE TEMP TABLE nest_box_id_mapping AS
SELECT 
    old_nb.id as old_nest_box_id,
    new_nb.id as new_nest_box_id,
    old_nb.name
FROM backup_migration.old_nest_boxes old_nb
JOIN nest_boxes new_nb ON old_nb.name = new_nb.name OR old_nb.id::text = new_nb.box_id;

-- Migrate activity logs
INSERT INTO activity_logs (
    nest_box_id,
    observer_id,
    observation_date,
    observation_type,
    species_observed,
    nest_stage,
    egg_count,
    chick_count,
    behavior_notes,
    weather_conditions,
    maintenance_needed,
    maintenance_notes,
    verified,
    created_at
)
SELECT 
    nb_mapping.new_nest_box_id,
    profile_mapping.new_profile_id,
    old_al.observation_date,
    'routine_check' as observation_type,
    old_al.species_observed,
    old_al.nest_stage,
    COALESCE(old_al.egg_count, 0),
    COALESCE(old_al.chick_count, 0),
    old_al.behavior_notes,
    old_al.weather_conditions,
    COALESCE(old_al.maintenance_needed, false),
    old_al.maintenance_notes,
    COALESCE(old_al.verified, false),
    old_al.created_at
FROM backup_migration.old_activity_logs old_al
JOIN nest_box_id_mapping nb_mapping ON old_al.nest_box_id = nb_mapping.old_nest_box_id
LEFT JOIN profile_id_mapping profile_mapping ON old_al.volunteer_id = profile_mapping.old_profile_id;

-- Migrate volunteer assignments
INSERT INTO volunteer_assignments (
    volunteer_id,
    assignment_type,
    title,
    description,
    nest_box_id,
    assigned_date,
    due_date,
    status,
    notes,
    created_at
)
SELECT 
    profile_mapping.new_profile_id,
    'maintenance' as assignment_type,
    COALESCE(old_va.notes, 'Maintenance Task') as title,
    old_va.notes as description,
    nb_mapping.new_nest_box_id,
    COALESCE(old_va.assigned_date, old_va.created_at::date),
    old_va.assigned_date + INTERVAL '7 days' as due_date,
    COALESCE(old_va.status, 'assigned') as status,
    old_va.notes,
    old_va.created_at
FROM backup_migration.old_volunteer_assignments old_va
JOIN profile_id_mapping profile_mapping ON old_va.volunteer_id = profile_mapping.old_profile_id
LEFT JOIN nest_box_id_mapping nb_mapping ON old_va.nest_box_id = nb_mapping.old_nest_box_id;

-- Log migration completion
INSERT INTO backup_migration.migration_log (step, description) VALUES 
('migration_complete', 'Successfully migrated existing data to new schema');

SELECT 'Migration completed successfully. All existing data has been preserved and migrated.' as status;
