-- =====================================================
-- RUN COMPLETE MIGRATION SEQUENCE
-- =====================================================
-- This script runs all migration steps in the correct order

-- Step 1: Backup existing data
\echo 'Step 1: Backing up existing data...'
\i scripts/001_backup_existing_data.sql

-- Step 2: Apply new comprehensive schema
\echo 'Step 2: Applying new comprehensive schema...'
\i scripts/000_comprehensive_schema_design.sql

-- Step 3: Migrate existing data to new structure
\echo 'Step 3: Migrating existing data...'
\i scripts/002_migrate_to_new_schema.sql

-- Step 4: Seed sample data for testing
\echo 'Step 4: Seeding sample data...'
\i scripts/003_seed_sample_data.sql

-- Step 5: Verify migration success
\echo 'Step 5: Verifying migration...'
\i scripts/004_verify_migration.sql

-- Step 6: Update statistics for performance
\echo 'Step 6: Updating database statistics...'
\i scripts/005_cleanup_migration.sql

\echo 'Migration completed successfully!'
\echo 'Database is ready for testing.'
