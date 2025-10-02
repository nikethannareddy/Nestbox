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
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [volunteers, setVolunteers] = useState<Profile[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([])

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    
    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }
    
    // Load data
    const loadData = async () => {
      try {
        const supabase = createClient()
        
        // Fetch nest boxes
        const { data: boxes } = await supabase
          .from('nest_boxes')
          .select('*')
          .order('created_at', { ascending: false })
        
        // Fetch volunteers
        const { data: volunteersData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        // Fetch activity logs
        const { data: logs } = await supabase
          .from('activity_logs')
          .select('*')
          .order('observation_date', { ascending: false })
          .limit(10)
        
        // Fetch assignments
        const { data: assignmentsData } = await supabase
          .from('volunteer_assignments')
          .select('*')
          .order('due_date', { ascending: true })
        
        setNestBoxes(boxes || [])
        setVolunteers(volunteersData || [])
        setActivityLogs(logs || [])
        setAssignments(assignmentsData || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-emerald-900">Loading...</h2>
          <p className="text-emerald-700">Please wait while we verify your access.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <h2 className="text-xl font-semibold mb-2 text-emerald-900">Loading Dashboard...</h2>
          <p className="text-emerald-700">Please wait while we load your data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Admin Dashboard</h1>
            <p className="text-emerald-700">Welcome back, {user?.firstName || 'Admin'}!</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/nest-boxes/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Nest Box
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nest Boxes</CardTitle>
              <div className="h-4 w-4 text-emerald-500">
                <MapPin className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nestBoxes.length}</div>
              <p className="text-xs text-muted-foreground">
                {nestBoxes.filter(box => box.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
              <div className="h-4 w-4 text-emerald-500">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {volunteers.filter(v => v.role === 'volunteer').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {volunteers.filter(v => v.role === 'admin').length} admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <div className="h-4 w-4 text-emerald-500">
                <Flag className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                {activityLogs.filter(log => log.verified).length} verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
              <div className="h-4 w-4 text-emerald-500">
                <Wrench className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => a.status !== 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {assignments.filter(a => a.status === 'completed').length} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add more admin dashboard content here */}
        
      </main>
    </div>
  )
}
