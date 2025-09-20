"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
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
  LogOut,
  User,
  Users,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Flag,
} from "lucide-react"
import { AlertCircle } from "lucide-react" // Import AlertCircle
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
  const { user, logout, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<
    "overview" | "add" | "manage" | "volunteers" | "maintenance" | "issues" | "qr-success"
  >("overview")
  const [loading, setLoading] = useState(true)
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [volunteers, setVolunteers] = useState<Profile[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([])
  const [newBox, setNewBox] = useState({
    name: "",
    location: "",
    coordinates: { lat: "", lng: "" },
    description: "",
    photo: null as File | null,
    box_type: "standard",
    entrance_hole_size: "1.5",
    height_from_ground: "5",
    facing_direction: "east",
    habitat_type: "mixed",
    target_species: [] as string[],
    installer_name: "",
    sponsor_message: "",
  })
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newlyCreatedBox, setNewlyCreatedBox] = useState<NestBox | null>(null)
  const [reportedIssues, setReportedIssues] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchDatabaseData()
  }, [])

  const fetchDatabaseData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching data from database...")

      // Fetch nest boxes from database
      const { data: nestBoxData, error: nestBoxError } = await supabase
        .from("nest_boxes")
        .select("*")
        .order("created_at", { ascending: false })

      if (nestBoxError) {
        console.error("[v0] Error fetching nest boxes:", nestBoxError)
      } else {
        console.log("[v0] Fetched nest boxes:", nestBoxData)
        setNestBoxes(nestBoxData || [])
      }

      // Fetch volunteers from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (profileError) {
        console.error("[v0] Error fetching profiles:", profileError)
      } else {
        console.log("[v0] Fetched profiles:", profileData)
        setVolunteers(profileData || [])
      }

      // Fetch activity logs
      const { data: activityData, error: activityError } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })

      if (activityError) {
        console.error("[v0] Error fetching activity logs:", activityError)
      } else {
        console.log("[v0] Fetched activity logs:", activityData)
        setActivityLogs(activityData || [])
      }

      // Fetch volunteer assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("volunteer_assignments")
        .select("*")
        .order("created_at", { ascending: false })

      if (assignmentError) {
        console.error("[v0] Error fetching assignments:", assignmentError)
      } else {
        console.log("[v0] Fetched assignments:", assignmentData)
        setAssignments(assignmentData || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateNewBox({
            coordinates: {
              lat: position.coords.latitude.toFixed(6),
              lng: position.coords.longitude.toFixed(6),
            },
          })
          setIsGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get current location. Please enter coordinates manually.")
          setIsGettingLocation(false)
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
      setIsGettingLocation(false)
    }
  }

  const handleAddBox = async () => {
    if (!newBox.name.trim() || !newBox.coordinates.lat.trim() || !newBox.coordinates.lng.trim()) {
      console.log("[v0] Button should be disabled - missing required fields")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Adding nest box with data:", newBox)

      const nestBoxData = {
        name: newBox.name,
        description: newBox.description || null,
        latitude: Number.parseFloat(newBox.coordinates.lat),
        longitude: Number.parseFloat(newBox.coordinates.lng),
        box_type: newBox.box_type || "standard",
        entrance_hole_size: newBox.entrance_hole_size ? Number.parseFloat(newBox.entrance_hole_size) : null,
        height_from_ground: newBox.height_from_ground ? Number.parseInt(newBox.height_from_ground) : null,
        facing_direction: newBox.facing_direction || null,
        habitat_type: newBox.habitat_type || null,
        target_species: newBox.target_species || [],
        installation_date: new Date().toISOString().split("T")[0],
        installer_name: newBox.installer_name || null,
        sponsor_message: newBox.sponsor_message || null,
        status: "active",
      }

      console.log("[v0] Inserting nest box data:", nestBoxData)

      const data = await supabase.from("nest_boxes").insert(nestBoxData).select()

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error(`No valid data returned from database insert: ${data}`)
      }

      const insertedBox = data[0]
      console.log("[v0] Successfully inserted nest box:", insertedBox)

      if (!insertedBox?.id) {
        throw new Error(`No ID found in inserted data: ${JSON.stringify(insertedBox)}`)
      }

      setNewlyCreatedBox(insertedBox)
      await fetchDatabaseData()

      // Reset form
      setNewBox({
        name: "",
        location: "",
        coordinates: { lat: "", lng: "" },
        description: "",
        photo: null,
        box_type: "standard",
        entrance_hole_size: "1.5",
        height_from_ground: "5",
        facing_direction: "east",
        habitat_type: "mixed",
        target_species: [],
        installer_name: "",
        sponsor_message: "",
      })
    } catch (error) {
      console.error("[v0] Error adding nest box:", error)
      alert("Error adding nest box. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateQRCode = async (nestBoxId: string) => {
    if (!nestBoxId) {
      throw new Error("No nest box ID provided for QR code generation")
    }

    console.log("[v0] Starting QR code generation for nest box:", nestBoxId)
    setIsSubmitting(true)

    try {
      const qrCodeUrl = `https://nestbox.vercel.app/box/${nestBoxId}`
      console.log("[v0] Generated QR code URL:", qrCodeUrl)

      const response = await fetch(`/api/nestboxes/${nestBoxId}/qrcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: qrCodeUrl }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate QR code: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("[v0] QR code image generated:", result.qrCode.substring(0, 50) + "...")

      // Update database with QR code URL and image
      await supabase
        .from("nest_boxes")
        .update({
          qr_code: result.qrCode, // Store base64 image data for display
        })
        .eq("id", nestBoxId)

      console.log("[v0] Successfully updated QR code URL and image")

      // Fetch updated nest box data
      const updatedData = await supabase.from("nest_boxes").select("*").eq("id", nestBoxId)

      if (updatedData && Array.isArray(updatedData) && updatedData.length > 0) {
        const updatedBox = updatedData[0]
        setNewlyCreatedBox(updatedBox)
        await fetchDatabaseData()
        console.log("[v0] QR code generation completed successfully")
      }
    } catch (error) {
      console.error("[v0] Error in handleGenerateQRCode:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateQRCodeSVG = (text: string) => {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><text x="100" y="100" textAnchor="middle" fontSize="12" fill="black">${text}</text></svg>`
  }

  const printQRCode = (box: NestBox) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>NestBox QR Code - ${box.id}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { border: 2px solid #000; padding: 20px; display: inline-block; }
              .qr-code { width: 200px; height: 200px; border: 1px solid #ccc; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>NestBox ${box.id.slice(0, 8)}</h2>
              <div class="qr-code" style="background: url('${generateQRCodeSVG(box.qr_code)}') center/contain no-repeat;"></div>
              <p><strong>${box.name}</strong></p>
              <p>Lat: ${box.latitude}, Lng: ${box.longitude}</p>
              <p>Scan to log activity</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const assignMaintenanceTask = async (nestBoxId: string, volunteerId: string) => {
    try {
      console.log("[v0] Assigning maintenance task...")

      const assignmentData = {
        nest_box_id: nestBoxId,
        volunteer_id: volunteerId,
        status: "assigned",
        assignment_type: "maintenance",
        assigned_date: new Date().toISOString().split("T")[0],
        description: "Maintenance task assigned",
        priority: "medium",
      }

      const { data, error } = await supabase.from("volunteer_assignments").insert([assignmentData]).select().single()

      if (error) {
        console.error("[v0] Error assigning maintenance task:", error)
        alert("Error assigning task. Please try again.")
        return
      }

      console.log("[v0] Successfully assigned maintenance task:", data)
      setAssignments([data, ...assignments])
      alert("Maintenance task assigned successfully!")
    } catch (error) {
      console.error("[v0] Error assigning maintenance task:", error)
      alert("Error assigning task. Please try again.")
    }
  }

  const completeMaintenanceTask = async (assignmentId: string) => {
    try {
      console.log("[v0] Completing maintenance task...")

      const { data, error } = await supabase
        .from("volunteer_assignments")
        .update({
          status: "completed",
          completion_date: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .select()
        .single()

      if (error) {
        console.error("[v0] Error completing maintenance task:", error)
        alert("Error updating task. Please try again.")
        return
      }

      console.log("[v0] Successfully completed maintenance task:", data)
      setAssignments(assignments.map((assignment) => (assignment.id === assignmentId ? data : assignment)))
      alert("Maintenance task marked as complete!")
    } catch (error) {
      console.error("[v0] Error completing maintenance task:", error)
      alert("Error updating task. Please try again.")
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log("[v0] Updating user role...")

      const { data, error } = await supabase
        .from("profiles")
        .update({
          role: newRole,
          is_admin: newRole === "admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single()

      if (error) {
        console.error("[v0] Error updating user role:", error)
        alert("Error updating user role. Please try again.")
        return
      }

      console.log("[v0] Successfully updated user role:", data)
      setVolunteers(volunteers.map((volunteer) => (volunteer.id === userId ? data : volunteer)))
      alert(`User role updated to ${newRole} successfully!`)
    } catch (error) {
      console.error("[v0] Error updating user role:", error)
      alert("Error updating user role. Please try again.")
    }
  }

  const maintenanceBoxes = nestBoxes.filter((box) =>
    activityLogs.some((log) => log.nest_box_id === box.id && log.maintenance_needed),
  )

  const assignedTasks = assignments.filter((assignment) => assignment.status === "assigned")

  const updateNewBox = (updates: Partial<typeof newBox>) => {
    const updatedBox = { ...newBox, ...updates }
    setNewBox(updatedBox)

    const isEnabled = updatedBox.name.trim() && updatedBox.coordinates.lat.trim() && updatedBox.coordinates.lng.trim()

    console.log("[v0] Form state updated:", {
      name: updatedBox.name,
      lat: updatedBox.coordinates.lat,
      lng: updatedBox.coordinates.lng,
      buttonEnabled: isEnabled,
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-emerald-700">Checking authentication...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to access the admin dashboard.</p>
            <Link
              href="/auth"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-emerald-700">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <NestBoxLogo />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/map" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                Explore
              </Link>
              <Link href="/learn" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                Build
              </Link>
              <Link href="/about" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                asChild
              >
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  {user?.full_name || "Admin"}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Admin Dashboard</h1>
          <p className="text-emerald-700">Manage nest boxes, volunteers, and maintenance tasks</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className={
              activeTab === "overview"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "add" ? "default" : "outline"}
            onClick={() => setActiveTab("add")}
            className={
              activeTab === "add"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Nest Box
          </Button>
          <Button
            variant={activeTab === "manage" ? "default" : "outline"}
            onClick={() => setActiveTab("manage")}
            className={
              activeTab === "manage"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }
          >
            <Edit className="w-4 h-4 mr-2" />
            Manage Boxes
          </Button>
          <Button
            variant={activeTab === "volunteers" ? "default" : "outline"}
            onClick={() => setActiveTab("volunteers")}
            className={
              activeTab === "volunteers"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }
          >
            <Users className="w-4 h-4 mr-2" />
            Volunteers
          </Button>
          <Button
            variant={activeTab === "maintenance" ? "default" : "outline"}
            onClick={() => setActiveTab("maintenance")}
            className={
              activeTab === "maintenance"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }
          >
            <Wrench className="w-4 h-4 mr-2" />
            Maintenance
          </Button>
          <Button
            variant={activeTab === "issues" ? "default" : "outline"}
            onClick={() => setActiveTab("issues")}
            className={
              activeTab === "issues"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }
          >
            <Flag className="w-4 h-4 mr-2" />
            Reported Issues
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-900">Total Nest Boxes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{nestBoxes.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-900">Active Volunteers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-sky-600">
                  {volunteers.filter((v) => v.role === "volunteer").length}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-900">Needs Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{maintenanceBoxes.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-900">Total Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{activityLogs.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Volunteers Management Tab */}
        {activeTab === "volunteers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-emerald-900">Volunteer Management</h2>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Invite Volunteer
              </Button>
            </div>
            {volunteers.map((volunteer) => (
              <Card key={volunteer.id} className="bg-white/80 backdrop-blur-sm border-emerald-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900">{volunteer.full_name}</h3>
                        <p className="text-emerald-700 text-sm">{volunteer.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge
                            variant="default"
                            className={
                              volunteer.role === "admin" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                            }
                          >
                            {volunteer.role}
                          </Badge>
                          <span className="text-sm text-emerald-600">
                            Joined {new Date(volunteer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {volunteer.role === "volunteer" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateUserRole(volunteer.id, "admin")}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Promote to Admin
                        </Button>
                      ) : volunteer.role === "admin" && volunteer.email !== "admin@nestbox.app" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateUserRole(volunteer.id, "volunteer")}
                          className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Demote to Volunteer
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Maintenance Management Tab */}
        {activeTab === "maintenance" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-emerald-900">Maintenance Tasks</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Needs Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {maintenanceBoxes.map((box) => {
                    const maintenanceLog = activityLogs.find(
                      (log) => log.nest_box_id === box.id && log.maintenance_needed,
                    )
                    return (
                      <div key={box.id} className="border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-emerald-900">{box.name}</h4>
                            <p className="text-sm text-emerald-700">
                              Lat: {box.latitude}, Lng: {box.longitude}
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              {maintenanceLog?.maintenance_notes || "Maintenance needed"}
                            </p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">ID: {box.id.slice(0, 8)}</Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <select
                            className="flex-1 px-3 py-2 border border-emerald-200 rounded-md text-sm"
                            onChange={(e) => e.target.value && assignMaintenanceTask(box.id, e.target.value)}
                          >
                            <option value="">Assign to volunteer...</option>
                            {volunteers
                              .filter((v) => v.role === "volunteer")
                              .map((volunteer) => (
                                <option key={volunteer.id} value={volunteer.id}>
                                  {volunteer.full_name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Assigned Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignedTasks.map((assignment) => {
                    const box = nestBoxes.find((b) => b.id === assignment.nest_box_id)
                    const volunteer = volunteers.find((v) => v.id === assignment.volunteer_id)

                    if (!box || !volunteer) return null

                    return (
                      <div key={assignment.id} className="border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-emerald-900">{box.name}</h4>
                            <p className="text-sm text-emerald-700">
                              Lat: {box.latitude}, Lng: {box.longitude}
                            </p>
                            <p className="text-sm text-sky-700 mt-1">Assigned to: {volunteer.full_name}</p>
                          </div>
                          <Badge className="bg-sky-100 text-sky-800">ID: {box.id.slice(0, 8)}</Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => completeMaintenanceTask(assignment.id)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Add Nest Box Tab */}
        {activeTab === "add" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Add New Nest Box</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name/Location *</Label>
                  <Input
                    id="name"
                    value={newBox.name}
                    onChange={(e) => updateNewBox({ name: e.target.value })}
                    placeholder="e.g., Meadow View Box"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location Description</Label>
                  <Input
                    id="location"
                    value={newBox.location}
                    onChange={(e) => updateNewBox({ location: e.target.value })}
                    placeholder="e.g., Sharon Community Garden"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="box-type">Box Type</Label>
                  <Select value={newBox.box_type} onValueChange={(value) => updateNewBox({ box_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="bluebird">Bluebird Special</SelectItem>
                      <SelectItem value="wren">Wren House</SelectItem>
                      <SelectItem value="chickadee">Chickadee Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="entrance-hole">Entrance Hole Size (inches)</Label>
                  <Input
                    id="entrance-hole"
                    type="number"
                    step="0.1"
                    value={newBox.entrance_hole_size}
                    onChange={(e) => updateNewBox({ entrance_hole_size: e.target.value })}
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height from Ground (feet)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={newBox.height_from_ground}
                    onChange={(e) => updateNewBox({ height_from_ground: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="facing">Facing Direction</Label>
                  <Select
                    value={newBox.facing_direction}
                    onValueChange={(value) => updateNewBox({ facing_direction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North</SelectItem>
                      <SelectItem value="northeast">Northeast</SelectItem>
                      <SelectItem value="east">East</SelectItem>
                      <SelectItem value="southeast">Southeast</SelectItem>
                      <SelectItem value="south">South</SelectItem>
                      <SelectItem value="southwest">Southwest</SelectItem>
                      <SelectItem value="west">West</SelectItem>
                      <SelectItem value="northwest">Northwest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="habitat">Habitat Type</Label>
                  <Select value={newBox.habitat_type} onValueChange={(value) => updateNewBox({ habitat_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="forest">Forest</SelectItem>
                      <SelectItem value="meadow">Meadow</SelectItem>
                      <SelectItem value="wetland">Wetland</SelectItem>
                      <SelectItem value="urban">Urban</SelectItem>
                      <SelectItem value="suburban">Suburban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Target Species</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {["bluebird", "chickadee", "wren", "swallow", "nuthatch", "titmouse", "sparrow", "other"].map(
                    (species) => (
                      <div key={species} className="flex items-center space-x-2">
                        <Checkbox
                          id={species}
                          checked={newBox.target_species.includes(species)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateNewBox({ target_species: [...newBox.target_species, species] })
                            } else {
                              updateNewBox({ target_species: newBox.target_species.filter((s) => s !== species) })
                            }
                          }}
                        />
                        <Label htmlFor={species} className="text-sm capitalize">
                          {species}
                        </Label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="installer">Installer Name</Label>
                  <Input
                    id="installer"
                    value={newBox.installer_name}
                    onChange={(e) => updateNewBox({ installer_name: e.target.value })}
                    placeholder="Who installed this box?"
                  />
                </div>
                <div>
                  <Label htmlFor="sponsor">Sponsor Message</Label>
                  <Input
                    id="sponsor"
                    value={newBox.sponsor_message}
                    onChange={(e) => updateNewBox({ sponsor_message: e.target.value })}
                    placeholder="Optional sponsor message"
                  />
                </div>
              </div>

              <div>
                <Label>GPS Coordinates *</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Navigation className="w-4 h-4" />
                    {isGettingLocation ? "Getting Location..." : "Use Current Location"}
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="lat">Latitude *</Label>
                    <Input
                      id="lat"
                      value={newBox.coordinates.lat}
                      onChange={(e) => updateNewBox({ coordinates: { ...newBox.coordinates, lat: e.target.value } })}
                      placeholder="42.1237"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude *</Label>
                    <Input
                      id="lng"
                      value={newBox.coordinates.lng}
                      onChange={(e) => updateNewBox({ coordinates: { ...newBox.coordinates, lng: e.target.value } })}
                      placeholder="-71.1786"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBox.description}
                  onChange={(e) => updateNewBox({ description: e.target.value })}
                  placeholder="Describe the nest box location and any special features..."
                />
              </div>

              <div>
                <Label htmlFor="photo">Upload Photo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateNewBox({ photo: e.target.files?.[0] || null })}
                  />
                  <Camera className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAddBox}
                  disabled={
                    !newBox.name.trim() ||
                    !newBox.coordinates.lat.trim() ||
                    !newBox.coordinates.lng.trim() ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding Nest Box...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Nest Box
                    </>
                  )}
                </Button>

                {newlyCreatedBox && !newlyCreatedBox.qr_code && (
                  <>
                    {console.log("[v0] Showing Generate QR Code button for:", newlyCreatedBox)}
                    <Button
                      onClick={async () => {
                        if (isSubmitting) return

                        console.log("[v0] Generate QR Code button clicked for nest box:", newlyCreatedBox.id)

                        try {
                          await handleGenerateQRCode(newlyCreatedBox.id)
                        } catch (error) {
                          console.error("[v0] QR code generation failed:", error)
                          alert("Failed to generate QR code. Please check console for details.")
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating QR Code...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate QR Code
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "issues" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Reported Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Issues will be loaded from database */}
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reported issues at this time.</p>
                  <p className="text-sm">Issues reported by users will appear here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "qr-success" && newlyCreatedBox && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-center">Nest Box Created Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-white p-6 rounded-lg border-2 border-primary inline-block">
                <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center mb-4 mx-auto">
                  {newlyCreatedBox.qr_code ? (
                    <img
                      src={newlyCreatedBox.qr_code || "/placeholder.svg"}
                      alt={`QR Code for ${newlyCreatedBox.name}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="w-24 h-24 text-primary" />
                  )}
                </div>
                <h3 className="font-bold text-lg">{newlyCreatedBox.name}</h3>
                <p className="text-muted-foreground">
                  Lat: {newlyCreatedBox.latitude}, Lng: {newlyCreatedBox.longitude}
                </p>
                <Badge className="mt-2">ID: {newlyCreatedBox.id.slice(0, 8)}</Badge>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => printQRCode(newlyCreatedBox)} className="bg-primary hover:bg-primary/90">
                  <Printer className="w-4 h-4 mr-2" />
                  Print QR Code
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("manage")}>
                  <Edit className="w-4 h-4 mr-2" />
                  Manage All Boxes
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("add")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Box
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manage Boxes Tab */}
        {activeTab === "manage" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Existing Nest Boxes</h2>
            {nestBoxes.map((box) => (
              <Card key={box.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{box.name}</h3>
                        <p className="text-muted-foreground mb-2">{box.description}</p>
                        <div className="flex items-center gap-2 text-sm text-primary mb-2">
                          <MapPin className="w-4 h-4" />
                          {box.latitude}, {box.longitude}
                        </div>
                        <Badge variant="outline" className="mt-2">
                          ID: {box.id.slice(0, 8)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!box.qr_code && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (isSubmitting) return

                            console.log("[v0] Generate QR Code button clicked for existing nest box:", box.id)

                            try {
                              await handleGenerateQRCode(box.id)
                            } catch (error) {
                              console.error("[v0] QR code generation failed for existing box:", error)
                              alert("Failed to generate QR code. Please check console for details.")
                            }
                          }}
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <QrCode className="w-4 h-4 mr-2" />
                              Generate QR
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printQRCode(box)}
                        className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        disabled={!box.qr_code}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print QR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}