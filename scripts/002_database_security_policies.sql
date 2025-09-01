-- Comprehensive Row Level Security Policies for NestBox Application
-- Ensures proper data protection based on user roles and ownership

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nest_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is volunteer or admin
CREATE OR REPLACE FUNCTION is_volunteer_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('volunteer', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES TABLE POLICIES
-- Users can view their own profile, admins can view all profiles
CREATE POLICY "profiles_select_own_or_admin" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR is_admin()
  );

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile, admins can update any profile
CREATE POLICY "profiles_update_own_or_admin" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR is_admin()
  );

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin_only" ON profiles
  FOR DELETE USING (is_admin());

-- NEST BOXES TABLE POLICIES
-- All authenticated users can view public nest boxes
CREATE POLICY "nest_boxes_select_public" ON nest_boxes
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (is_public = true OR is_admin())
  );

-- Only admins can insert nest boxes
CREATE POLICY "nest_boxes_insert_admin_only" ON nest_boxes
  FOR INSERT WITH CHECK (is_admin());

-- Only admins can update nest boxes
CREATE POLICY "nest_boxes_update_admin_only" ON nest_boxes
  FOR UPDATE USING (is_admin());

-- Only admins can delete nest boxes
CREATE POLICY "nest_boxes_delete_admin_only" ON nest_boxes
  FOR DELETE USING (is_admin());

-- ACTIVITY LOGS TABLE POLICIES
-- Users can view their own activity logs, admins can view all
CREATE POLICY "activity_logs_select_own_or_admin" ON activity_logs
  FOR SELECT USING (
    auth.uid() = volunteer_id OR is_admin()
  );

-- Volunteers can create activity logs for themselves
CREATE POLICY "activity_logs_insert_own" ON activity_logs
  FOR INSERT WITH CHECK (
    auth.uid() = volunteer_id AND is_volunteer_or_admin()
  );

-- Users can update their own activity logs, admins can update any
CREATE POLICY "activity_logs_update_own_or_admin" ON activity_logs
  FOR UPDATE USING (
    auth.uid() = volunteer_id OR is_admin()
  );

-- Users can delete their own activity logs, admins can delete any
CREATE POLICY "activity_logs_delete_own_or_admin" ON activity_logs
  FOR DELETE USING (
    auth.uid() = volunteer_id OR is_admin()
  );

-- VOLUNTEER ASSIGNMENTS TABLE POLICIES
-- Users can view their own assignments, admins can view all
CREATE POLICY "assignments_select_own_or_admin" ON volunteer_assignments
  FOR SELECT USING (
    auth.uid() = volunteer_id OR is_admin()
  );

-- Only admins can create assignments
CREATE POLICY "assignments_insert_admin_only" ON volunteer_assignments
  FOR INSERT WITH CHECK (is_admin());

-- Volunteers can update their own assignment status, admins can update any
CREATE POLICY "assignments_update_own_or_admin" ON volunteer_assignments
  FOR UPDATE USING (
    (auth.uid() = volunteer_id AND is_volunteer_or_admin()) OR is_admin()
  );

-- Only admins can delete assignments
CREATE POLICY "assignments_delete_admin_only" ON volunteer_assignments
  FOR DELETE USING (is_admin());

-- SPONSORS TABLE POLICIES
-- All authenticated users can view sponsors (for public recognition)
CREATE POLICY "sponsors_select_authenticated" ON sponsors
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage sponsors
CREATE POLICY "sponsors_insert_admin_only" ON sponsors
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "sponsors_update_admin_only" ON sponsors
  FOR UPDATE USING (is_admin());

CREATE POLICY "sponsors_delete_admin_only" ON sponsors
  FOR DELETE USING (is_admin());

-- SPONSORSHIPS TABLE POLICIES
-- All authenticated users can view sponsorships (for public recognition)
CREATE POLICY "sponsorships_select_authenticated" ON sponsorships
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage sponsorships
CREATE POLICY "sponsorships_insert_admin_only" ON sponsorships
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "sponsorships_update_admin_only" ON sponsorships
  FOR UPDATE USING (is_admin());

CREATE POLICY "sponsorships_delete_admin_only" ON sponsorships
  FOR DELETE USING (is_admin());

-- EDUCATIONAL CONTENT TABLE POLICIES
-- All authenticated users can view educational content
CREATE POLICY "educational_content_select_authenticated" ON educational_content
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage educational content
CREATE POLICY "educational_content_insert_admin_only" ON educational_content
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "educational_content_update_admin_only" ON educational_content
  FOR UPDATE USING (is_admin());

CREATE POLICY "educational_content_delete_admin_only" ON educational_content
  FOR DELETE USING (is_admin());

-- NOTIFICATIONS TABLE POLICIES
-- Users can view their own notifications, admins can view all
CREATE POLICY "notifications_select_own_or_admin" ON notifications
  FOR SELECT USING (
    auth.uid() = user_id OR is_admin()
  );

-- System can create notifications (handled by triggers), admins can create any
CREATE POLICY "notifications_insert_system_or_admin" ON notifications
  FOR INSERT WITH CHECK (
    is_admin() OR auth.uid() IS NOT NULL
  );

-- Users can update their own notifications (mark as read), admins can update any
CREATE POLICY "notifications_update_own_or_admin" ON notifications
  FOR UPDATE USING (
    auth.uid() = user_id OR is_admin()
  );

-- Users can delete their own notifications, admins can delete any
CREATE POLICY "notifications_delete_own_or_admin" ON notifications
  FOR DELETE USING (
    auth.uid() = user_id OR is_admin()
  );

-- Create system notification function for automated messages
CREATE OR REPLACE FUNCTION create_system_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (p_user_id, p_title, p_message, p_type)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create welcome notification for new users
CREATE OR REPLACE FUNCTION handle_new_user_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_system_notification(
    NEW.id,
    'Welcome to NestBox!',
    'Thank you for joining our bird conservation community. Start by exploring nest boxes in your area.',
    'welcome'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user notifications
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_notification();

-- Trigger to flag nest boxes needing maintenance
CREATE OR REPLACE FUNCTION check_maintenance_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- If maintenance issues are reported, flag the nest box
  IF NEW.maintenance_required = true AND (OLD.maintenance_required IS NULL OR OLD.maintenance_required = false) THEN
    UPDATE nest_boxes 
    SET needs_maintenance = true, updated_at = NOW()
    WHERE id = NEW.nest_box_id;
    
    -- Notify admins about maintenance needed
    INSERT INTO notifications (user_id, title, message, type)
    SELECT 
      p.id,
      'Maintenance Required',
      'Nest box ' || nb.name || ' requires maintenance based on volunteer report.',
      'maintenance'
    FROM profiles p
    CROSS JOIN nest_boxes nb
    WHERE p.role = 'admin' AND nb.id = NEW.nest_box_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for maintenance flagging
DROP TRIGGER IF EXISTS on_maintenance_reported ON activity_logs;
CREATE TRIGGER on_maintenance_reported
  AFTER INSERT OR UPDATE ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION check_maintenance_needed();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
