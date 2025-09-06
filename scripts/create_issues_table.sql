-- Create reported_issues table for issue reporting functionality
CREATE TABLE IF NOT EXISTS public.reported_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nest_box_id UUID REFERENCES public.nest_boxes(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  resolved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reported_issues ENABLE ROW LEVEL SECURITY;

-- Create policies for reported_issues
CREATE POLICY "Anyone can insert issues" ON public.reported_issues
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view issues" ON public.reported_issues
  FOR SELECT USING (true);

CREATE POLICY "Admins can update issues" ON public.reported_issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR is_superuser = true)
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reported_issues_updated_at 
  BEFORE UPDATE ON public.reported_issues 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
