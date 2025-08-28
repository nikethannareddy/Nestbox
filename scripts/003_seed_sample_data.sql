-- =====================================================
-- SEED SAMPLE DATA FOR TESTING
-- =====================================================
-- This script populates the new schema with sample data for testing

-- Log seeding start
INSERT INTO backup_migration.migration_log (step, description) VALUES 
('seeding_start', 'Starting to seed sample data for testing');

-- Insert sample user profiles (if not already migrated)
INSERT INTO user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    role,
    phone,
    bio,
    location,
    is_active
) VALUES 
(gen_random_uuid(), 'admin@nestbox.com', 'Admin', 'User', 'admin', '555-0001', 'System administrator for NestBox platform', 'Sharon, MA', true),
(gen_random_uuid(), 'volunteer1@example.com', 'Sarah', 'Johnson', 'volunteer', '555-0002', 'Passionate bird enthusiast and conservation volunteer', 'Sharon, MA', true),
(gen_random_uuid(), 'volunteer2@example.com', 'Mike', 'Chen', 'volunteer', '555-0003', 'Weekend bird watcher and nest box maintainer', 'Sharon, MA', true),
(gen_random_uuid(), 'sponsor1@example.com', 'Jennifer', 'Smith', 'sponsor', '555-0004', 'Local business owner supporting bird conservation', 'Sharon, MA', true),
(gen_random_uuid(), 'sponsor2@example.com', 'Robert', 'Williams', 'sponsor', '555-0005', 'Memorial sponsor in memory of beloved family member', 'Sharon, MA', true)
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for sample data
CREATE TEMP TABLE sample_users AS
SELECT id, email, role, first_name, last_name FROM user_profiles 
WHERE email IN ('admin@nestbox.com', 'volunteer1@example.com', 'volunteer2@example.com', 'sponsor1@example.com', 'sponsor2@example.com');

-- Insert sample nest boxes (if not already migrated)
INSERT INTO nest_boxes (
    box_id,
    name,
    description,
    box_type,
    latitude,
    longitude,
    location_name,
    location_description,
    status,
    maintenance_status,
    installation_date,
    target_species,
    primary_species,
    sponsor_id,
    sponsor_message,
    sponsor_type,
    qr_code_url,
    is_public,
    featured
)
SELECT 
    'NB' || LPAD((ROW_NUMBER() OVER (ORDER BY s.email))::text, 3, '0') as box_id,
    locations.name,
    locations.description,
    'standard' as box_type,
    locations.lat,
    locations.lng,
    locations.location_name,
    locations.location_description,
    'active' as status,
    'good' as maintenance_status,
    CURRENT_DATE - (random() * 365)::int as installation_date,
    locations.target_species,
    locations.primary_species,
    CASE WHEN s.role = 'sponsor' THEN s.id ELSE NULL END as sponsor_id,
    CASE WHEN s.role = 'sponsor' THEN s.first_name || ' ' || s.last_name || ' Family Dedication' ELSE NULL END as sponsor_message,
    CASE WHEN s.role = 'sponsor' THEN 'family' ELSE NULL END as sponsor_type,
    'https://nestbox.app/qr/' || 'NB' || LPAD((ROW_NUMBER() OVER (ORDER BY s.email))::text, 3, '0') as qr_code_url,
    true as is_public,
    ROW_NUMBER() OVER (ORDER BY s.email) <= 3 as featured
FROM sample_users s
CROSS JOIN (
    VALUES 
    ('Oak Grove Box #1', 'Located in the community park near the oak grove. Popular with Eastern Bluebirds.', 42.1237, -71.1786, 'Sharon Community Garden', 'Near the main entrance by the oak trees', ARRAY['Eastern Bluebird', 'Tree Swallow'], 'Eastern Bluebird'),
    ('Meadow View Box #2', 'Overlooks the wildflower meadow. Great for House Wrens.', 42.1156, -71.1923, 'Borderland State Park Trail', 'Along the main trail overlooking the meadow', ARRAY['House Wren', 'Chickadee'], 'House Wren'),
    ('Riverside Box #3', 'Memorial box near the riverside trail. Excellent condition.', 42.1282, -71.1776, 'Riverside Trail', 'Near the wooden bridge over the stream', ARRAY['Tree Swallow', 'Eastern Bluebird'], 'Tree Swallow'),
    ('Pine Hill Box #4', 'School-sponsored box in pine grove. Educational site.', 42.1205, -71.1834, 'Pine Hill Elementary School', 'In the school nature area behind the playground', ARRAY['Chickadee', 'Nuthatch'], 'Black-capped Chickadee'),
    ('Conservation Box #5', 'Conservation department demonstration box.', 42.1189, -71.1798, 'Sharon Conservation Land', 'On the conservation trail near the parking area', ARRAY['Eastern Bluebird', 'House Wren'], 'Eastern Bluebird')
) AS locations(name, description, lat, lng, location_name, location_description, target_species, primary_species)
WHERE ROW_NUMBER() OVER (ORDER BY s.email) <= 5
ON CONFLICT (box_id) DO NOTHING;

-- Insert sample activity logs
INSERT INTO activity_logs (
    nest_box_id,
    observer_id,
    observation_date,
    observation_type,
    species_observed,
    nest_stage,
    adult_count,
    egg_count,
    chick_count,
    behavior_notes,
    weather_conditions,
    maintenance_needed,
    maintenance_priority,
    verified,
    created_at
)
SELECT 
    nb.id as nest_box_id,
    vol.id as observer_id,
    CURRENT_DATE - (random() * 30)::int as observation_date,
    'routine_check' as observation_type,
    nb.primary_species,
    activities.nest_stage,
    activities.adult_count,
    activities.egg_count,
    activities.chick_count,
    activities.behavior_notes,
    activities.weather_conditions,
    activities.maintenance_needed,
    CASE WHEN activities.maintenance_needed THEN 'medium' ELSE 'low' END as maintenance_priority,
    true as verified,
    NOW() - (random() * INTERVAL '30 days') as created_at
FROM nest_boxes nb
CROSS JOIN sample_users vol
CROSS JOIN (
    VALUES 
    ('eggs', 2, 4, 0, 'Adult pair actively tending nest. Both parents observed bringing nesting material.', 'Clear, mild temperature', false),
    ('chicks', 2, 0, 3, 'Three healthy chicks observed. Parents feeding regularly throughout observation period.', 'Partly cloudy, light breeze', false),
    ('nest_building', 1, 0, 0, 'Single adult observed carrying nesting material. Nest construction approximately 50% complete.', 'Overcast, no precipitation', true),
    ('fledglings', 2, 0, 0, 'Fledglings have successfully left the nest. Box is clean and ready for potential second brood.', 'Sunny, warm', false),
    ('no_activity', 0, 0, 0, 'No current activity observed. Box is in good condition and available for new occupants.', 'Light rain, cool', false)
) AS activities(nest_stage, adult_count, egg_count, chick_count, behavior_notes, weather_conditions, maintenance_needed)
WHERE vol.role = 'volunteer'
AND ROW_NUMBER() OVER (ORDER BY nb.box_id, vol.email, activities.nest_stage) <= 15;

-- Insert sample volunteer assignments
INSERT INTO volunteer_assignments (
    volunteer_id,
    assigned_by,
    assignment_type,
    title,
    description,
    priority,
    nest_box_id,
    assigned_date,
    due_date,
    status,
    estimated_hours
)
SELECT 
    vol.id as volunteer_id,
    admin.id as assigned_by,
    assignments.assignment_type,
    assignments.title,
    assignments.description,
    assignments.priority,
    nb.id as nest_box_id,
    CURRENT_DATE - (random() * 14)::int as assigned_date,
    CURRENT_DATE + (random() * 14)::int as due_date,
    assignments.status,
    assignments.estimated_hours
FROM sample_users vol
CROSS JOIN sample_users admin
CROSS JOIN nest_boxes nb
CROSS JOIN (
    VALUES 
    ('maintenance', 'Routine Nest Box Cleaning', 'Perform routine cleaning and inspection of nest box. Check for damage and ensure proper drainage.', 'medium', 'assigned', 1.5),
    ('monitoring', 'Weekly Activity Check', 'Conduct weekly observation and log any bird activity. Record species, behavior, and nesting stage.', 'low', 'in_progress', 0.5),
    ('maintenance', 'Repair Entrance Hole', 'Entrance hole has been enlarged by woodpeckers. Install protective guard and repair as needed.', 'high', 'assigned', 2.0),
    ('installation', 'Install New Mounting Hardware', 'Replace old mounting hardware with new weather-resistant bolts and brackets.', 'medium', 'completed', 1.0)
) AS assignments(assignment_type, title, description, priority, status, estimated_hours)
WHERE vol.role = 'volunteer' 
AND admin.role = 'admin'
AND ROW_NUMBER() OVER (ORDER BY vol.email, nb.box_id) <= 8;

-- Insert sample sponsorships
INSERT INTO sponsorships (
    sponsor_id,
    tier_id,
    sponsorship_type,
    sponsor_name,
    dedication_message,
    amount,
    status,
    start_date,
    end_date,
    public_recognition,
    update_frequency
)
SELECT 
    sponsor.id as sponsor_id,
    tier.id as tier_id,
    sponsorship_data.sponsorship_type,
    sponsorship_data.sponsor_name,
    sponsorship_data.dedication_message,
    tier.annual_cost,
    'active' as status,
    CURRENT_DATE - INTERVAL '30 days' as start_date,
    CURRENT_DATE + INTERVAL '11 months' as end_date,
    true as public_recognition,
    'quarterly' as update_frequency
FROM sample_users sponsor
CROSS JOIN sponsorship_tiers tier
CROSS JOIN (
    VALUES 
    ('family', 'The Johnson Family', 'In support of local bird conservation and environmental education for our children.'),
    ('memorial', 'In Memory of Robert Chen', 'A beloved father and nature enthusiast who taught us to appreciate the beauty of birds.'),
    ('organization', 'Sharon Elementary School', 'Supporting environmental education and connecting students with nature.'),
    ('individual', 'Jennifer Smith', 'Proud to support the important work of bird conservation in our community.')
) AS sponsorship_data(sponsorship_type, sponsor_name, dedication_message)
WHERE sponsor.role = 'sponsor'
AND tier.name = 'Bronze Supporter'
AND ROW_NUMBER() OVER (ORDER BY sponsor.email) <= 2;

-- Insert sample educational content
INSERT INTO educational_content (
    title,
    slug,
    content_type,
    category,
    content,
    excerpt,
    difficulty_level,
    estimated_read_time,
    target_audience,
    learning_objectives,
    tags,
    related_species,
    status,
    published_at,
    author_id
)
SELECT 
    content_data.title,
    content_data.slug,
    content_data.content_type,
    content_data.category,
    content_data.content,
    content_data.excerpt,
    content_data.difficulty_level,
    content_data.estimated_read_time,
    content_data.target_audience,
    content_data.learning_objectives,
    content_data.tags,
    content_data.related_species,
    'published' as status,
    CURRENT_DATE - (random() * 60)::int as published_at,
    admin.id as author_id
FROM sample_users admin
CROSS JOIN (
    VALUES 
    (
        'Building Your First Nest Box',
        'building-your-first-nest-box',
        'guide',
        'nest_box_building',
        '# Building Your First Nest Box\n\nBuilding a nest box is a rewarding way to help local birds...',
        'Learn how to build a basic nest box with simple tools and materials.',
        'beginner',
        15,
        ARRAY['beginners', 'families', 'students'],
        ARRAY['Understand basic nest box design', 'Learn essential tools and materials', 'Follow step-by-step construction'],
        ARRAY['building', 'construction', 'DIY', 'beginner'],
        ARRAY['Eastern Bluebird', 'House Wren'],
        'published'
    ),
    (
        'Identifying Common Nest Box Birds',
        'identifying-common-nest-box-birds',
        'article',
        'bird_identification',
        '# Common Nest Box Birds of Sharon, MA\n\nLearn to identify the most common species...',
        'A comprehensive guide to identifying birds that use nest boxes in Sharon, Massachusetts.',
        'intermediate',
        20,
        ARRAY['volunteers', 'bird watchers', 'families'],
        ARRAY['Identify key field marks', 'Understand behavior patterns', 'Recognize bird calls'],
        ARRAY['identification', 'birds', 'field guide', 'Sharon'],
        ARRAY['Eastern Bluebird', 'House Wren', 'Tree Swallow', 'Black-capped Chickadee'],
        'published'
    )
) AS content_data(title, slug, content_type, category, content, excerpt, difficulty_level, estimated_read_time, target_audience, learning_objectives, tags, related_species, status)
WHERE admin.role = 'admin'
LIMIT 2;

-- Insert sample notifications
INSERT INTO notifications (
    recipient_id,
    type,
    title,
    message,
    nest_box_id,
    priority,
    delivery_method
)
SELECT 
    vol.id as recipient_id,
    notification_data.type,
    notification_data.title,
    notification_data.message,
    nb.id as nest_box_id,
    notification_data.priority,
    ARRAY['in_app', 'email'] as delivery_method
FROM sample_users vol
CROSS JOIN nest_boxes nb
CROSS JOIN (
    VALUES 
    ('maintenance_due', 'Maintenance Due', 'Nest box maintenance is due for your assigned location.', 'medium'),
    ('activity_update', 'New Activity Logged', 'New bird activity has been observed at one of your monitored nest boxes.', 'low'),
    ('assignment', 'New Assignment', 'You have been assigned a new volunteer task.', 'medium')
) AS notification_data(type, title, message, priority)
WHERE vol.role = 'volunteer'
AND ROW_NUMBER() OVER (ORDER BY vol.email, nb.box_id) <= 5;

-- Log seeding completion
INSERT INTO backup_migration.migration_log (step, description) VALUES 
('seeding_complete', 'Successfully seeded sample data for testing');

SELECT 'Sample data seeding completed successfully.' as status;
