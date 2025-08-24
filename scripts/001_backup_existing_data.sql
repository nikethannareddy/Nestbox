-- =====================================================
-- BACKUP EXISTING DATA BEFORE MIGRATION
-- =====================================================
-- This script creates backup tables for existing data
-- Run this BEFORE executing the schema migration

-- Create backup schema
CREATE SCHEMA IF NOT EXISTS backup_migration;

-- Backup existing tables with data
CREATE TABLE backup_migration.old_profiles AS SELECT * FROM profiles;
CREATE TABLE backup_migration.old_nest_boxes AS SELECT * FROM nest_boxes;
CREATE TABLE backup_migration.old_activity_logs AS SELECT * FROM activity_logs;
CREATE TABLE backup_migration.old_volunteer_assignments AS SELECT * FROM volunteer_assignments;

-- Log the backup
INSERT INTO backup_migration.migration_log (step, description, executed_at) VALUES 
('backup', 'Backed up existing data before schema migration', NOW())
ON CONFLICT DO NOTHING;

-- Create migration log table if it doesn't exist
CREATE TABLE IF NOT EXISTS backup_migration.migration_log (
    id SERIAL PRIMARY KEY,
    step TEXT NOT NULL,
    description TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT 'Backup completed successfully. Data preserved in backup_migration schema.' as status;
