-- =====================================================
-- NestBox Application - Comprehensive Database Schema
-- =====================================================
-- This script drops existing tables and creates a complete
-- schema that aligns with all application requirements

-- Drop existing tables (in dependency order)
DROP TABLE IF EXISTS volunteer_assignments CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS nest_boxes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS kv_store_3dde6980 CASCADE;

-- =====================================================
-- CORE USER MANAGEMENT
-- =====================================================

-- Enhanced user profiles with comprehensive information
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('guest', 'volunteer', 'sponsor', 'admin')) DEFAULT 'guest',
    bio TEXT,
    location TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    emergency_contact JSONB,
    volunteer_skills TEXT[],
    availability JSONB,
    is_active BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User authentication sessions and security
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NEST BOX MANAGEMENT
-- =====================================================

-- Comprehensive nest box information
CREATE TABLE nest_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    box_id TEXT UNIQUE NOT NULL, -- Human-readable ID like "NB001"
    name TEXT NOT NULL,
    description TEXT,
    box_type TEXT NOT NULL CHECK (box_type IN ('standard', 'platform', 'cavity', 'custom')),
    
    -- Location information
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name TEXT NOT NULL,
    location_description TEXT,
    elevation INTEGER,
    habitat_type TEXT,
    
    -- Physical specifications
    entrance_hole_diameter DECIMAL(4, 2),
    floor_dimensions TEXT,
    height_from_ground DECIMAL(5, 2),
    mounting_type TEXT,
    materials TEXT[],
    
    -- Status and maintenance
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance', 'retired')) DEFAULT 'active',
    maintenance_status TEXT NOT NULL CHECK (maintenance_status IN ('excellent', 'good', 'needs-cleaning', 'needs-repair', 'critical')) DEFAULT 'good',
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    
    -- Target species and usage
    target_species TEXT[],
    primary_species TEXT,
    
    -- Installation and management
    installation_date DATE NOT NULL,
    installed_by UUID REFERENCES user_profiles(id),
    managed_by UUID REFERENCES user_profiles(id),
    
    -- QR Code and digital features
    qr_code_url TEXT,
    qr_code_data JSONB,
    
    -- Sponsorship
    sponsor_id UUID REFERENCES user_profiles(id),
    sponsor_message TEXT,
    sponsor_dedication TEXT,
    sponsor_type TEXT CHECK (sponsor_type IN ('individual', 'family', 'organization', 'memorial')),
    
    -- Metadata
    is_public BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nest box photos and media
CREATE TABLE nest_box_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nest_box_id UUID REFERENCES nest_boxes(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'document', 'audio')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    caption TEXT,
    taken_by UUID REFERENCES user_profiles(id),
    taken_at TIMESTAMPTZ,
    is_primary BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY LOGGING & OBSERVATIONS
-- =====================================================

-- Comprehensive activity logging
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nest_box_id UUID REFERENCES nest_boxes(id) ON DELETE CASCADE,
    observer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Observation details
    observation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    observation_type TEXT NOT NULL CHECK (observation_type IN ('routine_check', 'maintenance', 'emergency', 'research', 'educational')),
    
    -- Bird activity
    species_observed TEXT,
    nest_stage TEXT CHECK (nest_stage IN ('no_activity', 'nest_building', 'eggs', 'chicks', 'fledglings', 'abandoned')),
    adult_count INTEGER DEFAULT 0,
    egg_count INTEGER DEFAULT 0,
    chick_count INTEGER DEFAULT 0,
    fledgling_count INTEGER DEFAULT 0,
    
    -- Behavior observations
    behavior_notes TEXT,
    feeding_activity BOOLEAN DEFAULT false,
    territorial_behavior BOOLEAN DEFAULT false,
    predator_activity BOOLEAN DEFAULT false,
    
    -- Environmental conditions
    weather_conditions TEXT,
    temperature DECIMAL(5, 2),
    wind_conditions TEXT,
    precipitation TEXT,
    
    -- Maintenance and condition
    maintenance_performed TEXT[],
    maintenance_needed BOOLEAN DEFAULT false,
    maintenance_priority TEXT CHECK (maintenance_priority IN ('low', 'medium', 'high', 'urgent')),
    maintenance_notes TEXT,
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
    
    -- Additional data
    duration_minutes INTEGER,
    photos_taken INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMPTZ,
    
    -- Metadata
    gps_coordinates POINT,
    device_info JSONB,
    custom_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log media (photos, videos from observations)
CREATE TABLE activity_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_log_id UUID REFERENCES activity_logs(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'audio')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    caption TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VOLUNTEER MANAGEMENT
-- =====================================================

-- Volunteer assignments and tasks
CREATE TABLE volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES user_profiles(id),
    
    -- Assignment details
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('maintenance', 'monitoring', 'installation', 'training', 'event')),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    
    -- Scope and location
    nest_box_id UUID REFERENCES nest_boxes(id),
    location_specific BOOLEAN DEFAULT false,
    estimated_hours DECIMAL(4, 2),
    required_skills TEXT[],
    
    -- Scheduling
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    
    -- Status tracking
    status TEXT NOT NULL CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'overdue')) DEFAULT 'assigned',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    
    -- Completion details
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    actual_hours DECIMAL(4, 2),
    completion_notes TEXT,
    completion_photos TEXT[],
    
    -- Communication
    notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteer training and certifications
CREATE TABLE volunteer_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    training_type TEXT NOT NULL,
    training_name TEXT NOT NULL,
    description TEXT,
    completed_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url TEXT,
    instructor TEXT,
    score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SPONSORSHIP SYSTEM
-- =====================================================

-- Sponsorship tiers and packages
CREATE TABLE sponsorship_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    annual_cost DECIMAL(10, 2) NOT NULL,
    benefits TEXT[],
    max_nest_boxes INTEGER,
    includes_updates BOOLEAN DEFAULT true,
    includes_recognition BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsorship records
CREATE TABLE sponsorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES sponsorship_tiers(id),
    
    -- Sponsorship details
    sponsorship_type TEXT NOT NULL CHECK (sponsorship_type IN ('individual', 'family', 'organization', 'memorial')),
    sponsor_name TEXT NOT NULL, -- Display name for recognition
    dedication_message TEXT,
    memorial_person TEXT,
    
    -- Financial details
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_frequency TEXT CHECK (payment_frequency IN ('one_time', 'monthly', 'quarterly', 'annually')) DEFAULT 'annually',
    
    -- Status and dates
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'refunded')) DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT false,
    
    -- Recognition preferences
    public_recognition BOOLEAN DEFAULT true,
    newsletter_feature BOOLEAN DEFAULT true,
    website_listing BOOLEAN DEFAULT true,
    
    -- Payment tracking
    payment_method TEXT,
    payment_reference TEXT,
    last_payment_date DATE,
    next_payment_due DATE,
    
    -- Communication preferences
    update_frequency TEXT CHECK (update_frequency IN ('weekly', 'monthly', 'quarterly', 'annually')) DEFAULT 'quarterly',
    preferred_contact TEXT CHECK (preferred_contact IN ('email', 'mail', 'phone')) DEFAULT 'email',
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID REFERENCES sponsorships(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'chargeback')),
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Payment processing
    payment_method TEXT NOT NULL,
    payment_processor TEXT,
    processor_transaction_id TEXT,
    processor_fee DECIMAL(10, 2),
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    processed_at TIMESTAMPTZ,
    
    -- Details
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EDUCATIONAL CONTENT MANAGEMENT
-- =====================================================

-- Educational resources and content
CREATE TABLE educational_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content details
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('article', 'guide', 'video', 'pdf', 'interactive', 'quiz')),
    category TEXT NOT NULL CHECK (category IN ('bird_identification', 'nest_box_building', 'maintenance', 'conservation', 'seasonal_tips')),
    
    -- Content body
    content TEXT, -- Markdown or HTML content
    excerpt TEXT,
    featured_image_url TEXT,
    
    -- Educational metadata
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_read_time INTEGER, -- in minutes
    target_audience TEXT[],
    learning_objectives TEXT[],
    
    -- File attachments
    pdf_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    download_files JSONB DEFAULT '[]',
    
    -- Organization
    tags TEXT[],
    related_species TEXT[],
    seasonal_relevance TEXT[],
    
    -- Publishing
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    author_id UUID REFERENCES user_profiles(id),
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- SEO and metadata
    meta_description TEXT,
    meta_keywords TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bird species information
CREATE TABLE bird_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic information
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    family_name TEXT,
    
    -- Physical characteristics
    size_range TEXT,
    wingspan_range TEXT,
    weight_range TEXT,
    coloring_description TEXT,
    distinctive_features TEXT[],
    
    -- Behavior and habitat
    habitat_preferences TEXT[],
    nesting_behavior TEXT,
    diet_description TEXT,
    migration_pattern TEXT,
    breeding_season TEXT,
    
    -- Nest box preferences
    preferred_box_type TEXT,
    entrance_hole_size DECIMAL(4, 2),
    box_height_preference TEXT,
    habitat_placement TEXT[],
    
    -- Regional information
    local_status TEXT CHECK (local_status IN ('common', 'uncommon', 'rare', 'seasonal', 'migrant')),
    conservation_status TEXT,
    best_viewing_times TEXT[],
    
    -- Media
    photo_urls TEXT[],
    audio_urls TEXT[],
    
    -- Educational content
    identification_tips TEXT[],
    fun_facts TEXT[],
    conservation_notes TEXT,
    
    -- Metadata
    is_target_species BOOLEAN DEFAULT false,
    priority_species BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNICATION & NOTIFICATIONS
-- =====================================================

-- System notifications and alerts
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Notification details
    type TEXT NOT NULL CHECK (type IN ('maintenance_due', 'activity_update', 'assignment', 'system', 'sponsorship', 'educational')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    nest_box_id UUID REFERENCES nest_boxes(id),
    activity_log_id UUID REFERENCES activity_logs(id),
    assignment_id UUID REFERENCES volunteer_assignments(id),
    
    -- Delivery
    delivery_method TEXT[] DEFAULT ARRAY['in_app'],
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication templates
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & REPORTING
-- =====================================================

-- System metrics and analytics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    metric_unit TEXT,
    dimensions JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Aggregation info
    aggregation_period TEXT CHECK (aggregation_period IN ('hour', 'day', 'week', 'month', 'year')),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event tracking for analytics
CREATE TABLE event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    
    -- Event details
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- Context
    session_id TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    
    -- Timing
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- Application settings and configuration
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);

-- Nest boxes indexes
CREATE INDEX idx_nest_boxes_box_id ON nest_boxes(box_id);
CREATE INDEX idx_nest_boxes_status ON nest_boxes(status);
CREATE INDEX idx_nest_boxes_location ON nest_boxes USING GIST(ST_Point(longitude, latitude));
CREATE INDEX idx_nest_boxes_sponsor ON nest_boxes(sponsor_id);
CREATE INDEX idx_nest_boxes_species ON nest_boxes USING GIN(target_species);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_nest_box ON activity_logs(nest_box_id);
CREATE INDEX idx_activity_logs_observer ON activity_logs(observer_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(observation_date);
CREATE INDEX idx_activity_logs_species ON activity_logs(species_observed);

-- Volunteer assignments indexes
CREATE INDEX idx_volunteer_assignments_volunteer ON volunteer_assignments(volunteer_id);
CREATE INDEX idx_volunteer_assignments_status ON volunteer_assignments(status);
CREATE INDEX idx_volunteer_assignments_due_date ON volunteer_assignments(due_date);

-- Sponsorships indexes
CREATE INDEX idx_sponsorships_sponsor ON sponsorships(sponsor_id);
CREATE INDEX idx_sponsorships_status ON sponsorships(status);
CREATE INDEX idx_sponsorships_dates ON sponsorships(start_date, end_date);

-- Notifications indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nest_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Nest boxes policies (public read, admin write)
CREATE POLICY "Anyone can view public nest boxes" ON nest_boxes
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage nest boxes" ON nest_boxes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Activity logs policies
CREATE POLICY "Users can view activity logs for public nest boxes" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM nest_boxes 
            WHERE id = activity_logs.nest_box_id AND is_public = true
        )
    );

CREATE POLICY "Volunteers can create activity logs" ON activity_logs
    FOR INSERT WITH CHECK (
        auth.uid() = observer_id AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('volunteer', 'admin')
        )
    );

-- Educational content policies (public read)
CREATE POLICY "Anyone can view published educational content" ON educational_content
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage educational content" ON educational_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nest_boxes_updated_at BEFORE UPDATE ON nest_boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_logs_updated_at BEFORE UPDATE ON activity_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_assignments_updated_at BEFORE UPDATE ON volunteer_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsorships_updated_at BEFORE UPDATE ON sponsorships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default sponsorship tiers
INSERT INTO sponsorship_tiers (name, description, annual_cost, benefits, max_nest_boxes) VALUES
('Bronze Supporter', 'Basic sponsorship with quarterly updates', 75.00, ARRAY['Quarterly updates', 'Name recognition', 'Impact reports'], 1),
('Silver Guardian', 'Enhanced sponsorship with more benefits', 150.00, ARRAY['Monthly updates', 'Priority support', 'Exclusive content', 'Name recognition'], 2),
('Gold Champion', 'Premium sponsorship with full benefits', 300.00, ARRAY['Weekly updates', 'Direct contact', 'Exclusive events', 'Priority placement', 'Custom dedication'], 5);

-- Insert default app settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', '"NestBox"', 'string', 'Application name', true),
('site_description', '"Community-driven bird conservation platform"', 'string', 'Site description', true),
('contact_email', '"info@nestbox.app"', 'string', 'Contact email address', true),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false),
('max_file_upload_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', false);

-- Insert common bird species for Sharon, MA
INSERT INTO bird_species (common_name, scientific_name, family_name, local_status, preferred_box_type, entrance_hole_size) VALUES
('Eastern Bluebird', 'Sialia sialis', 'Turdidae', 'common', 'standard', 1.5),
('House Wren', 'Troglodytes aedon', 'Troglodytidae', 'common', 'standard', 1.25),
('Tree Swallow', 'Tachycineta bicolor', 'Hirundinidae', 'common', 'standard', 1.5),
('Black-capped Chickadee', 'Poecile atricapillus', 'Paridae', 'common', 'standard', 1.125),
('White-breasted Nuthatch', 'Sitta carolinensis', 'Sittidae', 'common', 'standard', 1.25);

COMMENT ON TABLE user_profiles IS 'Enhanced user profiles with comprehensive volunteer and sponsor information';
COMMENT ON TABLE nest_boxes IS 'Complete nest box management with location, maintenance, and sponsorship tracking';
COMMENT ON TABLE activity_logs IS 'Comprehensive observation and maintenance logging system';
COMMENT ON TABLE sponsorships IS 'Full sponsorship management with tiers, payments, and recognition';
COMMENT ON TABLE educational_content IS 'Educational resources and content management system';
COMMENT ON TABLE bird_species IS 'Local bird species information and nest box preferences';
