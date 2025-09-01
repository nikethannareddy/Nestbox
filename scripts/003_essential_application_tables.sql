-- Essential Application Tables for NestBox
-- Streamlined schema with only necessary fields for core functionality

-- Nest Boxes Table - Core functionality for tracking nest box locations and status
CREATE TABLE public.nest_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic information
  name TEXT NOT NULL,
  description TEXT,
  
  -- Location data (required for map functionality)
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_description TEXT,
  
  -- Box specifications
  box_type TEXT DEFAULT 'standard' CHECK (box_type IN ('standard', 'platform', 'specialty')),
  target_species TEXT[] DEFAULT '{}',
  
  -- Installation details
  installation_date DATE DEFAULT CURRENT_DATE,
  installer_name TEXT,
  
  -- Status and maintenance
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'removed')),
  last_maintenance DATE,
  maintenance_notes TEXT,
  
  -- QR Code for identification
  qr_code TEXT UNIQUE,
  
  -- Sponsorship
  sponsor_id UUID REFERENCES public.profiles(id),
  sponsor_message TEXT,
  
  -- Media
  photo_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table - For recording observations and maintenance activities
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  nest_box_id UUID NOT NULL REFERENCES public.nest_boxes(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Observation details
  observation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  species_observed TEXT,
  nest_stage TEXT CHECK (nest_stage IN ('empty', 'building', 'eggs', 'chicks', 'fledged')),
  
  -- Counts
  adult_count INTEGER DEFAULT 0,
  egg_count INTEGER DEFAULT 0,
  chick_count INTEGER DEFAULT 0,
  
  -- Conditions
  weather_conditions TEXT,
  temperature INTEGER, -- in Fahrenheit
  
  -- Maintenance flags
  maintenance_needed BOOLEAN DEFAULT false,
  maintenance_type TEXT,
  maintenance_urgency TEXT CHECK (maintenance_urgency IN ('low', 'medium', 'high', 'urgent')),
  
  -- Notes and media
  notes TEXT,
  photos TEXT[], -- Array of photo URLs
  
  -- Verification (for data quality)
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer Assignments Table - For assigning maintenance tasks
CREATE TABLE public.volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  nest_box_id UUID NOT NULL REFERENCES public.nest_boxes(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Assignment details
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('maintenance', 'monitoring', 'installation', 'removal')),
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Scheduling
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Status tracking
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  completion_date DATE,
  completion_notes TEXT,
  
  -- Time tracking
  estimated_hours DECIMAL(4,2),
  actual_hours DECIMAL(4,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors Table - For tracking sponsorship information
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sponsor information
  profile_id UUID REFERENCES public.profiles(id), -- If sponsor is also a user
  organization_name TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Sponsorship details
  sponsorship_level TEXT DEFAULT 'basic' CHECK (sponsorship_level IN ('basic', 'premium', 'corporate')),
  annual_contribution DECIMAL(10,2),
  
  -- Memorial/dedication options
  is_memorial BOOLEAN DEFAULT false,
  memorial_person TEXT,
  dedication_message TEXT,
  
  -- Payment information
  payment_method TEXT CHECK (payment_method IN ('venmo', 'check', 'cash', 'online')),
  venmo_handle TEXT,
  
  -- Preferences
  public_recognition BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table - For system communications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipients
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id), -- NULL for system notifications
  
  -- Notification content
  type TEXT NOT NULL CHECK (type IN ('maintenance', 'assignment', 'observation', 'system', 'welcome')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  related_nest_box_id UUID REFERENCES public.nest_boxes(id),
  related_assignment_id UUID REFERENCES public.volunteer_assignments(id),
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX nest_boxes_location_idx ON public.nest_boxes(latitude, longitude);
CREATE INDEX nest_boxes_status_idx ON public.nest_boxes(status);
CREATE INDEX nest_boxes_qr_code_idx ON public.nest_boxes(qr_code);
CREATE INDEX activity_logs_nest_box_idx ON public.activity_logs(nest_box_id);
CREATE INDEX activity_logs_volunteer_idx ON public.activity_logs(volunteer_id);
CREATE INDEX activity_logs_date_idx ON public.activity_logs(observation_date);
CREATE INDEX volunteer_assignments_volunteer_idx ON public.volunteer_assignments(volunteer_id);
CREATE INDEX volunteer_assignments_status_idx ON public.volunteer_assignments(status);
CREATE INDEX notifications_recipient_idx ON public.notifications(recipient_id);
CREATE INDEX notifications_unread_idx ON public.notifications(recipient_id, is_read);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_nest_boxes_updated_at
  BEFORE UPDATE ON public.nest_boxes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_volunteer_assignments_updated_at
  BEFORE UPDATE ON public.volunteer_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Verify table creation
SELECT 'Essential application tables created successfully' as status;
