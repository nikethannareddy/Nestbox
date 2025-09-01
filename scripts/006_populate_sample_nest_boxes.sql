-- Create sample nest boxes for testing
INSERT INTO public.nest_boxes (
  qr_code,
  location_name,
  latitude,
  longitude,
  installation_date,
  box_type,
  habitat_type,
  entrance_hole_size,
  height_from_ground,
  facing_direction,
  target_species,
  description,
  status
) VALUES 
(
  'NB001',
  'Central Park Oak Grove',
  40.7829,
  -73.9654,
  '2024-03-15',
  'standard',
  'deciduous_forest',
  1.25,
  6.0,
  'southeast',
  ARRAY['Eastern Bluebird', 'Tree Swallow'],
  'Located near the main walking trail, easily accessible for monitoring',
  'active'
),
(
  'NB002', 
  'Riverside Meadow',
  40.7589,
  -73.9851,
  '2024-02-20',
  'platform',
  'grassland',
  NULL,
  8.0,
  'south',
  ARRAY['American Robin', 'Mourning Dove'],
  'Open platform design in meadow area with good visibility',
  'active'
),
(
  'NB003',
  'Pine Hill Trail',
  40.7505,
  -73.9934,
  '2024-01-10',
  'specialty',
  'coniferous_forest',
  1.5,
  12.0,
  'east',
  ARRAY['Chickadee', 'Nuthatch'],
  'Mounted on tall pine tree, requires ladder for maintenance',
  'active'
),
(
  'NB004',
  'Wetland Boardwalk',
  40.7712,
  -73.9776,
  '2024-04-01',
  'standard',
  'wetland',
  1.0,
  5.0,
  'northeast',
  ARRAY['House Wren', 'Carolina Wren'],
  'Near water feature, popular with wrens and small songbirds',
  'active'
),
(
  'NB005',
  'Community Garden',
  40.7648,
  -73.9808,
  '2024-03-28',
  'standard',
  'urban',
  1.25,
  7.0,
  'southwest',
  ARRAY['House Sparrow', 'European Starling'],
  'In urban community garden, educational display nearby',
  'maintenance_needed'
);

-- Add some activity logs for the nest boxes
INSERT INTO public.activity_logs (
  nest_box_id,
  volunteer_id,
  activity_type,
  observations,
  weather_conditions,
  temperature,
  notes
) VALUES 
(
  (SELECT id FROM public.nest_boxes WHERE qr_code = 'NB001'),
  (SELECT id FROM public.profiles WHERE email = 'sushma_n@hotmail.com' LIMIT 1),
  'monitoring',
  'Active nest with 3 eggs observed',
  'sunny',
  72,
  'Bluebird pair actively using the box, eggs appear healthy'
),
(
  (SELECT id FROM public.nest_boxes WHERE qr_code = 'NB002'),
  (SELECT id FROM public.profiles WHERE email = 'sushma_n@hotmail.com' LIMIT 1),
  'maintenance',
  'Cleaned out old nesting material',
  'partly_cloudy',
  68,
  'Routine cleaning completed, box ready for new occupants'
);
