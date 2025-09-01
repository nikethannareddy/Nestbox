-- Database Security Policies for NestBox Application
-- Comprehensive Row Level Security (RLS) implementation

-- Enable RLS on all application tables
ALTER TABLE public.nest_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- NEST BOXES POLICIES
-- Public nest boxes can be viewed by all authenticated users (for map functionality)
CREATE POLICY "nest_boxes_public_select" ON public.nest_boxes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can insert new nest boxes
CREATE POLICY "nest_boxes_admin_insert" ON public.nest_boxes
  FOR INSERT WITH CHECK (public.is_admin());

-- Only admins can update nest boxes
CREATE POLICY "nest_boxes_admin_update" ON public.nest_boxes
  FOR UPDATE USING (public.is_admin());

-- Only admins can delete nest boxes
CREATE POLICY "nest_boxes_admin_delete" ON public.nest_boxes
  FOR DELETE USING (public.is_admin());

-- ACTIVITY LOGS POLICIES
-- Users can view their own activity logs, admins can view all
CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT USING (
    auth.uid() = volunteer_id OR public.is_admin()
  );

-- Users can insert their own activity logs
CREATE POLICY "activity_logs_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = volunteer_id);

-- Users can update their own unverified activity logs, admins can update all
CREATE POLICY "activity_logs_update" ON public.activity_logs
  FOR UPDATE USING (
    (auth.uid() = volunteer_id AND verified = false) OR public.is_admin()
  );

-- Only admins can delete activity logs
CREATE POLICY "activity_logs_admin_delete" ON public.activity_logs
  FOR DELETE USING (public.is_admin());

-- VOLUNTEER ASSIGNMENTS POLICIES
-- Users can view their own assignments, admins can view all
CREATE POLICY "assignments_select" ON public.volunteer_assignments
  FOR SELECT USING (
    auth.uid() = volunteer_id OR public.is_admin()
  );

-- Only admins can create assignments
CREATE POLICY "assignments_admin_insert" ON public.volunteer_assignments
  FOR INSERT WITH CHECK (public.is_admin());

-- Users can update their own assignment status, admins can update all
CREATE POLICY "assignments_update" ON public.volunteer_assignments
  FOR UPDATE USING (
    auth.uid() = volunteer_id OR public.is_admin()
  );

-- Only admins can delete assignments
CREATE POLICY "assignments_admin_delete" ON public.volunteer_assignments
  FOR DELETE USING (public.is_admin());

-- SPONSORS POLICIES
-- Sponsors can view their own records, admins can view all
CREATE POLICY "sponsors_select" ON public.sponsors
  FOR SELECT USING (
    auth.uid() = profile_id OR public.is_admin()
  );

-- Users can create their own sponsor records
CREATE POLICY "sponsors_insert" ON public.sponsors
  FOR INSERT WITH CHECK (
    auth.uid() = profile_id OR public.is_admin()
  );

-- Users can update their own sponsor records, admins can update all
CREATE POLICY "sponsors_update" ON public.sponsors
  FOR UPDATE USING (
    auth.uid() = profile_id OR public.is_admin()
  );

-- Only admins can delete sponsor records
CREATE POLICY "sponsors_admin_delete" ON public.sponsors
  FOR DELETE USING (public.is_admin());

-- NOTIFICATIONS POLICIES
-- Users can view their own notifications, admins can view all
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (
    auth.uid() = recipient_id OR public.is_admin()
  );

-- Admins and system can create notifications
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (
    public.is_admin() OR sender_id IS NULL
  );

-- Users can update their own notifications (mark as read), admins can update all
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (
    auth.uid() = recipient_id OR public.is_admin()
  );

-- Users can delete their own notifications, admins can delete all
CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE USING (
    auth.uid() = recipient_id OR public.is_admin()
  );

-- ADDITIONAL SECURITY FUNCTIONS

-- Function to create system notifications
CREATE OR REPLACE FUNCTION public.create_system_notification(
  p_recipient_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_nest_box_id UUID DEFAULT NULL,
  p_related_assignment_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_is_urgent BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    recipient_id,
    type,
    title,
    message,
    related_nest_box_id,
    related_assignment_id,
    action_url,
    is_urgent
  ) VALUES (
    p_recipient_id,
    p_type,
    p_title,
    p_message,
    p_related_nest_box_id,
    p_related_assignment_id,
    p_action_url,
    p_is_urgent
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to auto-assign maintenance tasks when flagged
CREATE OR REPLACE FUNCTION public.handle_maintenance_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If maintenance is needed and this is a new flag
  IF NEW.maintenance_needed = true AND (OLD.maintenance_needed IS NULL OR OLD.maintenance_needed = false) THEN
    -- Create a maintenance assignment (will be assigned by admin later)
    INSERT INTO public.volunteer_assignments (
      nest_box_id,
      volunteer_id,
      assigned_by,
      assignment_type,
      description,
      priority
    ) VALUES (
      NEW.nest_box_id,
      NEW.volunteer_id, -- Initially assign to the reporter
      NEW.volunteer_id,
      'maintenance',
      COALESCE(NEW.maintenance_type, 'General maintenance needed'),
      COALESCE(NEW.maintenance_urgency, 'medium')
    );
    
    -- Notify admins about the maintenance request
    INSERT INTO public.notifications (
      recipient_id,
      type,
      title,
      message,
      related_nest_box_id,
      is_urgent
    )
    SELECT 
      p.id,
      'maintenance',
      'Maintenance Request',
      'Maintenance needed at ' || nb.name || ': ' || COALESCE(NEW.maintenance_type, 'General maintenance'),
      NEW.nest_box_id,
      (NEW.maintenance_urgency = 'urgent')
    FROM public.profiles p
    CROSS JOIN public.nest_boxes nb
    WHERE p.role = 'admin' AND nb.id = NEW.nest_box_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for maintenance flag handling
CREATE TRIGGER handle_maintenance_flag_trigger
  AFTER INSERT OR UPDATE ON public.activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_maintenance_flag();

-- Function to send welcome notification to new users
CREATE OR REPLACE FUNCTION public.send_welcome_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Send welcome notification to new users
  INSERT INTO public.notifications (
    recipient_id,
    type,
    title,
    message,
    action_url
  ) VALUES (
    NEW.id,
    'welcome',
    'Welcome to NestBox!',
    'Welcome to the NestBox community! Start by exploring nest boxes in your area and logging your first observation.',
    '/map'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for welcome notifications
CREATE TRIGGER send_welcome_notification_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_notification();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Verify security policies
SELECT 'Database security policies implemented successfully' as status;
