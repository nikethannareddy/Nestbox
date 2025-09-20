"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { AppHeader } from "@/components/layout/header"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { NestBoxLogo } from "@/components/nestbox-logo"
import Link from "next/link"
import {
  MapPin,
  QrCode,
  Plus,
  Edit,
  Camera,
  Navigation,
  Printer,
  User,
  Users,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Flag,
} from "lucide-react"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { NestBoxesList } from "@/components/admin/nest-boxes-list"
import { VolunteersList } from "@/components/admin/volunteers-list"
import { ActivityLogsList } from "@/components/admin/activity-logs-list"
import { AssignmentsList } from "@/components/admin/assignments-list"

// Updated interfaces to match the database schema
interface NestBox {
  id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  elevation?: number
  box_type: "standard" | "bluebird" | "wren" | "chickadee" | "platform"
  entrance_hole_size?: number
  floor_dimensions?: string
  height_from_ground?: number
  facing_direction?: string
  habitat_type?: string
  target_species: string[]
  installation_date?: string
  installer_name?: string
  sponsor_id?: string
  sponsor_message?: string
  status: "active" | "inactive" | "maintenance_needed" | "removed"
  last_maintenance?: string
  maintenance_notes?: string
  qr_code?: string
  photo_url?: string
  accessibility_notes?: string
  monitoring_frequency?: string
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  role: "volunteer" | "admin" | "sponsor" | "guest"
  bio?: string
  location?: string
  emergency_contact?: string
  emergency_phone?: string
  volunteer_since?: string
  total_observations: number
  total_maintenance_tasks: number
  preferred_contact_method: "email" | "phone" | "both"
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

interface ActivityLog {
  id: string
  nest_box_id: string
  volunteer_id: string
  observation_date: string
  visit_duration?: number
  weather_conditions?: string
  temperature?: number
  nest_stage?: "empty" | "building" | "eggs" | "chicks" | "fledged" | "abandoned"
  species_observed?: string
  adult_count: number
  egg_count: number
  chick_count: number
  estimated_chick_age?: number
  behavior_notes?: string
  predator_evidence: boolean
  predator_type?: string
  parasites_observed: boolean
  parasite_type?: string
  nest_material_notes?: string
  photos: string[]
  maintenance_needed: boolean
  maintenance_type?: string
  maintenance_notes?: string
  maintenance_urgency?: "low" | "medium" | "high" | "urgent"
  verified: boolean
  verified_by?: string
  verified_at?: string
  created_at: string
}

interface VolunteerAssignment {
  id: string
  nest_box_id: string
  volunteer_id: string
  assigned_by?: string
  assignment_type: "monitoring" | "maintenance" | "installation" | "removal"
  priority: "low" | "medium" | "high" | "urgent"
  description?: string
  assigned_date: string
  due_date?: string
  status: "assigned" | "in_progress" | "completed" | "cancelled"
  completion_date?: string
  completion_notes?: string
  estimated_hours?: number
  actual_hours?: number
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([]);
  const [volunteers, setVolunteers] = useState<Profile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle authentication and data loading
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      // If still loading auth, wait
      if (authLoading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.replace('/auth');
        return;
      }

      // If not admin, redirect to dashboard
      if (user?.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }

      // If we get here, user is authenticated and is admin
      try {
        setDataLoading(true);
        const supabase = createClient();
        
        // Fetch all data in parallel
        const [
          { data: boxes, error: boxesError },
          { data: volunteersData, error: volunteersError },
          { data: logs, error: logsError },
          { data: assignmentsData, error: assignmentsError }
        ] = await Promise.all([
          supabase.from('nest_boxes').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('activity_logs')
            .select('*')
            .order('observation_date', { ascending: false })
            .limit(10),
          supabase.from('volunteer_assignments')
            .select('*')
            .order('due_date', { ascending: true })
        ]);

        // Check for errors
        if (boxesError) throw boxesError;
        if (volunteersError) throw volunteersError;
        if (logsError) throw logsError;
        if (assignmentsError) throw assignmentsError;

        // Update state
        setNestBoxes(boxes || []);
        setVolunteers(volunteersData || []);
        setActivityLogs(logs || []);
        setAssignments(assignmentsData || []);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setDataLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [authLoading, isAuthenticated, user, router]);

  // Show loading state while checking auth or loading data
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if there was an error loading data
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-6 space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // If we get here, user is authenticated and is admin
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="nest-boxes">Nest Boxes</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <DashboardOverview 
                nestBoxes={nestBoxes}
                volunteers={volunteers}
                activityLogs={activityLogs}
                assignments={assignments}
              />
            </TabsContent>
            
            <TabsContent value="nest-boxes">
              <NestBoxesList boxes={nestBoxes} />
            </TabsContent>
            
            <TabsContent value="volunteers">
              <VolunteersList volunteers={volunteers} />
            </TabsContent>
            
            <TabsContent value="activity">
              <ActivityLogsList logs={activityLogs} />
            </TabsContent>
            
            <TabsContent value="assignments">
              <AssignmentsList assignments={assignments} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
