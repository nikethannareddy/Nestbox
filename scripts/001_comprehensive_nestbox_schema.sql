-- NestBox Comprehensive Database Schema
-- This script creates a complete database schema for the NestBox application
-- that properly aligns with all application requirements

-- First, drop existing tables to start fresh
DROP TABLE IF EXISTS public.volunteer_assignments CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.nest_boxes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enhanced User Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'admin', 'sponsor', 'guest')),
  bio TEXT,
  location TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  volunteer_since DATE DEFAULT CURRENT_DATE,
  total_observations INTEGER DEFAULT 0,
  total_maintenance_tasks INTEGER DEFAULT 0,
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sponsors Table
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  sponsorship_level TEXT DEFAULT 'individual' CHECK (sponsorship_level IN ('individual', 'family', 'organization', 'corporate')),
  annual_contribution DECIMAL(10,2),
  payment_method TEXT,
  venmo_handle TEXT,
  dedication_message TEXT,
  is_memorial BOOLEAN DEFAULT false,
  memorial_person TEXT,
  public_recognition BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhanced Nest Boxes Table
CREATE TABLE public.nest_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  elevation INTEGER,
  box_type TEXT NOT NULL DEFAULT 'standard' CHECK (box_type IN ('standard', 'bluebird', 'wren', 'chickadee', 'platform')),
  entrance_hole_size DECIMAL(3,1),
  floor_dimensions TEXT,
  height_from_ground INTEGER,
  facing_direction TEXT,
  habitat_type TEXT,
  target_species TEXT[] DEFAULT '{}',
  installation_date DATE,
  installer_name TEXT,
  sponsor_id UUID REFERENCES public.sponsors(id),
  sponsor_message TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance_needed', 'removed')),
  last_maintenance DATE,
  maintenance_notes TEXT,
  qr_code TEXT UNIQUE,
  photo_url TEXT,
  accessibility_notes TEXT,
  monitoring_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Comprehensive Activity Logs Table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nest_box_id UUID NOT NULL REFERENCES public.nest_boxes(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  observation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  visit_duration INTEGER, -- minutes
  weather_conditions TEXT,
  temperature INTEGER,
  nest_stage TEXT CHECK (nest_stage IN ('empty', 'building', 'eggs', 'chicks', 'fledged', 'abandoned')),
  species_observed TEXT,
  adult_count INTEGER DEFAULT 0,
  egg_count INTEGER DEFAULT 0,
  chick_count INTEGER DEFAULT 0,
  estimated_chick_age INTEGER, -- days
  behavior_notes TEXT,
  predator_evidence BOOLEAN DEFAULT false,
  predator_type TEXT,
  parasites_observed BOOLEAN DEFAULT false,
  parasite_type TEXT,
  nest_material_notes TEXT,
  photos TEXT[], -- array of photo URLs
  maintenance_needed BOOLEAN DEFAULT false,
  maintenance_type TEXT,
  maintenance_notes TEXT,
  maintenance_urgency TEXT CHECK (maintenance_urgency IN ('low', 'medium', 'high', 'urgent')),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Volunteer Assignments Table
CREATE TABLE public.volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nest_box_id UUID NOT NULL REFERENCES public.nest_boxes(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('monitoring', 'maintenance', 'installation', 'removal')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  description TEXT,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  completion_date DATE,
  completion_notes TEXT,
  estimated_hours DECIMAL(4,2),
  actual_hours DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Educational Content Table
CREATE TABLE public.educational_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('bird_guide', 'building_guide', 'maintenance_guide', 'article', 'video', 'pdf')),
  content TEXT,
  summary TEXT,
  author_id UUID REFERENCES public.profiles(id),
  species_focus TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_read_time INTEGER, -- minutes
  tags TEXT[],
  media_urls TEXT[],
  download_url TEXT,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('maintenance_request', 'assignment', 'observation_update', 'system', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_nest_box_id UUID REFERENCES public.nest_boxes(id),
  related_assignment_id UUID REFERENCES public.volunteer_assignments(id),
  is_read BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. System Settings Table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_nest_boxes_location ON public.nest_boxes(latitude, longitude);
CREATE INDEX idx_nest_boxes_status ON public.nest_boxes(status);
CREATE INDEX idx_nest_boxes_sponsor ON public.nest_boxes(sponsor_id);
CREATE INDEX idx_activity_logs_nest_box ON public.activity_logs(nest_box_id);
CREATE INDEX idx_activity_logs_volunteer ON public.activity_logs(volunteer_id);
CREATE INDEX idx_activity_logs_date ON public.activity_logs(observation_date);
CREATE INDEX idx_volunteer_assignments_volunteer ON public.volunteer_assignments(volunteer_id);
CREATE INDEX idx_volunteer_assignments_nest_box ON public.volunteer_assignments(nest_box_id);
CREATE INDEX idx_volunteer_assignments_status ON public.volunteer_assignments(status);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id, is_read);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nest_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for sponsors table
CREATE POLICY "sponsors_select_own" ON public.sponsors FOR SELECT USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "sponsors_insert_own" ON public.sponsors FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "sponsors_update_own" ON public.sponsors FOR UPDATE USING (profile_id = auth.uid());

-- RLS Policies for nest_boxes table (public read, admin write)
CREATE POLICY "nest_boxes_select_all" ON public.nest_boxes FOR SELECT TO authenticated USING (true);
CREATE POLICY "nest_boxes_admin_all" ON public.nest_boxes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for activity_logs table
CREATE POLICY "activity_logs_select_all" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity_logs_insert_own" ON public.activity_logs FOR INSERT WITH CHECK (volunteer_id = auth.uid());
CREATE POLICY "activity_logs_update_own" ON public.activity_logs FOR UPDATE USING (
  volunteer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for volunteer_assignments table
CREATE POLICY "assignments_select_involved" ON public.volunteer_assignments FOR SELECT USING (
  volunteer_id = auth.uid() OR 
  assigned_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "assignments_admin_all" ON public.volunteer_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "assignments_update_own" ON public.volunteer_assignments FOR UPDATE USING (volunteer_id = auth.uid());

-- RLS Policies for educational_content table (public read, admin write)
CREATE POLICY "educational_content_select_published" ON public.educational_content FOR SELECT USING (is_published = true);
CREATE POLICY "educational_content_admin_all" ON public.educational_content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for notifications table
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for system_settings table
CREATE POLICY "system_settings_select_public" ON public.system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "system_settings_admin_all" ON public.system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nest_boxes_updated_at BEFORE UPDATE ON public.nest_boxes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteer_assignments_updated_at BEFORE UPDATE ON public.volunteer_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_educational_content_updated_at BEFORE UPDATE ON public.educational_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'volunteer')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert initial system settings
INSERT INTO public.system_settings (setting_key, setting_value, description, is_public) VALUES
('app_name', '"NestBox"', 'Application name', true),
('app_version', '"1.0.0"', 'Current application version', true),
('maintenance_reminder_days', '30', 'Days between maintenance reminders', false),
('max_observations_per_day', '10', 'Maximum observations per volunteer per day', false),
('default_monitoring_frequency', '"weekly"', 'Default monitoring frequency for new nest boxes', false);
