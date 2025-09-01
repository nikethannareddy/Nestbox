"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { NestBoxLogo } from "@/components/nestbox-logo"
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
} from "lucide-react"

interface NestBox {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  status: string
  qr_code_url: string
  installation_date: string
  box_type: string
  habitat_type: string
  target_species: string[]
  entrance_hole_size: number
  height_from_ground: number
  facing_direction: string
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  phone?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

interface ActivityLog {
  id: string
  nest_box_id: string
  volunteer_id: string
  observation_date: string
  maintenance_needed: boolean
  maintenance_notes?: string
}

interface VolunteerAssignment {
  id: string
  nest_box_id: string
  volunteer_id: string
  status: string
  assignment_type: string
  assigned_date: string
  description: string
  priority: string
  completion_date?: string
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<
    "overview" | "add" | "manage" | "volunteers" | "maintenance" | "qr-success"
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
  })
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newlyCreatedBox, setNewlyCreatedBox] = useState<NestBox | null>(null)

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
          setNewBox({
            ...newBox,
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
    if (!user) return

    console.log("[v0] Add nest box button clicked")
    console.log("[v0] Form data:", {
      name: newBox.name,
      location: newBox.location,
      coordinates: newBox.coordinates,
      description: newBox.description,
    })

    const isValid = newBox.name && newBox.coordinates.lat && newBox.coordinates.lng
    console.log("[v0] Form validation:", {
      hasName: !!newBox.name,
      hasLat: !!newBox.coordinates.lat,
      hasLng: !!newBox.coordinates.lng,
      isValid,
    })

    if (!isValid) {
      console.log("[v0] Form validation failed - button should be disabled")
      return
    }

    setIsSubmitting(true)
    try {
      console.log("[v0] Adding nest box to database...")

      const nestBoxData = {
        name: newBox.name,
        description: newBox.description,
        latitude: Number.parseFloat(newBox.coordinates.lat),
        longitude: Number.parseFloat(newBox.coordinates.lng),
        status: "active",
        qr_code_url: `${window.location.origin}/box/`, // Will be updated after insertion
        installation_date: new Date().toISOString().split("T")[0],
        box_type: "standard",
        habitat_type: "mixed",
        target_species: ["bluebird", "chickadee"],
        entrance_hole_size: 1.5,
        height_from_ground: 5,
        facing_direction: "east",
      }

      const { data, error } = await supabase.from("nest_boxes").insert([nestBoxData]).select().single()

      if (error) {
        console.error("[v0] Error inserting nest box:", error)
        alert("Error adding nest box. Please try again.")
        return
      }

      console.log("[v0] Successfully added nest box:", data)

      // Update QR code URL with the actual ID
      const updatedQRCode = `${window.location.origin}/box/${data.id}`
      const { error: updateError } = await supabase
        .from("nest_boxes")
        .update({ qr_code_url: updatedQRCode, qr_code: updatedQRCode })
        .eq("id", data.id)

      if (updateError) {
        console.error("[v0] Error updating QR code:", updateError)
      }

      // Add to local state
      const updatedBox = { ...data, qr_code_url: updatedQRCode, qr_code: updatedQRCode }
      setNestBoxes([updatedBox, ...nestBoxes])
      setNewlyCreatedBox(updatedBox)

      // Reset form
      setNewBox({
        name: "",
        location: "",
        coordinates: { lat: "", lng: "" },
        description: "",
        photo: null,
      })

      // Go to QR success page
      setActiveTab("qr-success")
      alert("Nest box added successfully!")
    } catch (error) {
      console.error("[v0] Error adding nest box:", error)
      alert("Error adding nest box. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateQRCodeSVG = (text: string) => {
    // Simple QR code representation (in real app, use proper QR library)
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
              <div class="qr-code" style="background: url('${generateQRCodeSVG(box.qr_code_url)}') center/contain no-repeat;"></div>
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

  // Get maintenance boxes (boxes that have maintenance needed logs)
  const maintenanceBoxes = nestBoxes.filter((box) =>
    activityLogs.some((log) => log.nest_box_id === box.id && log.maintenance_needed),
  )

  // Get assigned maintenance tasks
  const assignedTasks = assignments.filter((assignment) => assignment.status === "assigned")

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
            <a href="/" className="hover:opacity-80 transition-opacity">
              <NestBoxLogo />
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/map" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                Explore
              </a>
              <a href="/learn" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                Build
              </a>
              <a href="/nest-check" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                Monitor
              </a>
              <a href="/about" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                About
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <User className="h-4 w-4 mr-2" />
                {user?.full_name || "Admin"}
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
                    <div className="flex items-center gap-4">
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
                  <Label htmlFor="name">Name/Location</Label>
                  <Input
                    id="name"
                    value={newBox.name}
                    onChange={(e) => setNewBox({ ...newBox, name: e.target.value })}
                    placeholder="e.g., Meadow View Box"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location Description</Label>
                  <Input
                    id="location"
                    value={newBox.location}
                    onChange={(e) => setNewBox({ ...newBox, location: e.target.value })}
                    placeholder="e.g., Sharon Community Garden"
                  />
                </div>
              </div>

              <div>
                <Label>GPS Coordinates</Label>
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
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      value={newBox.coordinates.lat}
                      onChange={(e) =>
                        setNewBox({ ...newBox, coordinates: { ...newBox.coordinates, lat: e.target.value } })
                      }
                      placeholder="42.1237"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      value={newBox.coordinates.lng}
                      onChange={(e) =>
                        setNewBox({ ...newBox, coordinates: { ...newBox.coordinates, lng: e.target.value } })
                      }
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
                  onChange={(e) => setNewBox({ ...newBox, description: e.target.value })}
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
                    onChange={(e) => setNewBox({ ...newBox, photo: e.target.files?.[0] || null })}
                  />
                  <Camera className="w-5 h-5 text-primary" />
                </div>
              </div>

              <Button
                onClick={async () => {
                  console.log("[v0] Button clicked - immediate handler")
                  console.log("[v0] Current form state:", {
                    name: newBox.name,
                    lat: newBox.coordinates.lat,
                    lng: newBox.coordinates.lng,
                    isSubmitting,
                    buttonDisabled: !newBox.name || !newBox.coordinates.lat || !newBox.coordinates.lng || isSubmitting,
                  })
                  await handleAddBox()
                }}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!newBox.name || !newBox.coordinates.lat || !newBox.coordinates.lng || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Nest Box...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Nest Box & Generate QR Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* QR Success Tab */}
        {activeTab === "qr-success" && newlyCreatedBox && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground text-center">Nest Box Created Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-white p-6 rounded-lg border-2 border-primary inline-block">
                <div className="w-48 h-48 bg-gray-100 border border-gray-300 flex items-center justify-center mb-4 mx-auto">
                  <QrCode className="w-24 h-24 text-primary" />
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printQRCode(box)}
                        className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print QR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
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
