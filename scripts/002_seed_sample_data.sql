-- Seed sample data for NestBox application
-- This script populates the database with realistic sample data for testing

-- Insert sample educational content
INSERT INTO public.educational_content (title, content_type, content, summary, species_focus, difficulty_level, estimated_read_time, tags, is_featured, is_published) VALUES
('Eastern Bluebird Guide', 'bird_guide', 'The Eastern Bluebird is a small thrush found in open woodlands, farmlands, and orchards. They prefer nest boxes with 1.5-inch entrance holes and should be mounted 5-6 feet high in open areas.', 'Complete guide to Eastern Bluebirds and their nesting preferences', 'Eastern Bluebird', 'beginner', 5, ARRAY['bluebird', 'cavity-nester', 'sharon-ma'], true, true),
('House Wren Identification', 'bird_guide', 'House Wrens are small, energetic birds that readily use nest boxes. They prefer boxes with 1.25-inch entrance holes and will often fill unused boxes with sticks.', 'Learn to identify House Wrens and their nesting behavior', 'House Wren', 'beginner', 3, ARRAY['wren', 'identification', 'behavior'], true, true),
('Building a Standard Nest Box', 'building_guide', 'Step-by-step instructions for building a standard nest box suitable for bluebirds, wrens, and other cavity-nesting birds. Includes materials list and detailed diagrams.', 'Complete building guide with materials and instructions', NULL, 'intermediate', 15, ARRAY['building', 'diy', 'construction'], true, true),
('Tree Swallow Nesting Habits', 'bird_guide', 'Tree Swallows are aerial insectivores that nest in cavities near water. They prefer nest boxes mounted on poles in open areas near ponds or wetlands.', 'Understanding Tree Swallow nesting preferences and behavior', 'Tree Swallow', 'intermediate', 7, ARRAY['swallow', 'water-birds', 'aerial-insectivore'], false, true),
('Nest Box Maintenance Schedule', 'maintenance_guide', 'Regular maintenance is crucial for nest box success. This guide covers when and how to clean boxes, check for damage, and prepare for nesting season.', 'Essential maintenance practices for nest box longevity', NULL, 'beginner', 10, ARRAY['maintenance', 'cleaning', 'schedule'], true, true);

-- Insert sample nest boxes with realistic Sharon, MA locations
INSERT INTO public.nest_boxes (name, description, latitude, longitude, box_type, target_species, installation_date, status, qr_code, photo_url) VALUES
('Borderland Trail Box 1', 'First nest box along the main trail at Borderland State Park', 42.1234, -71.2345, 'bluebird', ARRAY['Eastern Bluebird', 'Tree Swallow'], '2024-03-15', 'active', 'NB001', '/images/nest-boxes/borderland-1.jpg'),
('Community Garden Box', 'Nest box installed near the Sharon Community Garden', 42.1156, -71.1789, 'standard', ARRAY['House Wren', 'Chickadee'], '2024-04-02', 'active', 'NB002', '/images/nest-boxes/garden-1.jpg'),
('Lake Massapoag Platform', 'Platform nest for robins near Lake Massapoag', 42.1089, -71.1923, 'platform', ARRAY['American Robin'], '2024-03-28', 'active', 'NB003', '/images/nest-boxes/lake-platform.jpg'),
('High School Trail Box', 'Educational nest box on Sharon High School nature trail', 42.1201, -71.1834, 'standard', ARRAY['House Wren', 'Eastern Bluebird'], '2024-04-10', 'maintenance_needed', 'NB004', '/images/nest-boxes/school-trail.jpg'),
('Moose Hill Box 2', 'Second box installed at Moose Hill Wildlife Sanctuary', 42.1345, -71.2012, 'chickadee', ARRAY['Black-capped Chickadee', 'White-breasted Nuthatch'], '2024-03-20', 'active', 'NB005', '/images/nest-boxes/moose-hill-2.jpg');

-- Note: In a real application, you would need actual user IDs from auth.users
-- For this sample data, we'll create placeholder entries that would be replaced with real user data
-- The trigger function will handle creating profiles when real users sign up
