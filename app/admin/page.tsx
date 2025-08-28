"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
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
  qr_code: string
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  phone?: string
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
  notes?: string
  assigned_date: string
  created_at: string
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

  useEffect(() => {
    fetchMockData()
  }, [])

  const fetchMockData = async () => {
    try {
      setLoading(true)

      // Mock nest boxes data
      const mockNestBoxes: NestBox[] = [
        {
          id: "box-1",
          name: "Meadow Box A",
          description: "Located near the meadow entrance",
          latitude: 42.1234,
          longitude: -71.5678,
          status: "active",
          qr_code: `${window.location.origin}/box/box-1`,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "box-2",
          name: "Trail Box B",
          description: "Along the main hiking trail",
          latitude: 42.1245,
          longitude: -71.5689,
          status: "active",
          qr_code: `${window.location.origin}/box/box-2`,
          created_at: "2024-01-20T10:00:00Z",
          updated_at: "2024-01-20T10:00:00Z",
        },
        {
          id: "box-3",
          name: "Forest Box C",
          description: "Deep in the forest trail",
          latitude: 42.1256,
          longitude: -71.57,
          status: "active",
          qr_code: `${window.location.origin}/box/box-3`,
          created_at: "2024-01-25T10:00:00Z",
          updated_at: "2024-01-25T10:00:00Z",
        },
      ]

      // Mock volunteers data
      const mockVolunteers: Profile[] = [
        {
          id: "vol-1",
          full_name: "Jane Smith",
          email: "jane@example.com",
          role: "volunteer",
          phone: "(555) 123-4567",
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-10T10:00:00Z",
        },
        {
          id: "vol-2",
          full_name: "Bob Johnson",
          email: "bob@example.com",
          role: "volunteer",
          phone: "(555) 987-6543",
          created_at: "2024-01-12T10:00:00Z",
          updated_at: "2024-01-12T10:00:00Z",
        },
        {
          id: "spon-1",
          full_name: "Sarah Wilson",
          email: "sarah@example.com",
          role: "sponsor",
          created_at: "2024-01-08T10:00:00Z",
          updated_at: "2024-01-08T10:00:00Z",
        },
      ]

      // Mock activity logs with maintenance needed
      const mockActivityLogs: ActivityLog[] = [
        {
          id: "log-1",
          nest_box_id: "box-1",
          volunteer_id: "vol-1",
          observation_date: "2024-12-01T10:00:00Z",
          maintenance_needed: true,
          maintenance_notes: "Door hinge needs adjustment",
        },
        {
          id: "log-2",
          nest_box_id: "box-3",
          volunteer_id: "vol-2",
          observation_date: "2024-12-03T10:00:00Z",
          maintenance_needed: true,
          maintenance_notes: "Needs cleaning and minor repairs",
        },
      ]

      // Mock assignments
      const mockAssignments: VolunteerAssignment[] = [
        {
          id: "assign-1",
          nest_box_id: "box-1",
          volunteer_id: "vol-1",
          status: "assigned",
          notes: "Maintenance task assigned",
          assigned_date: "2024-12-01",
          created_at: "2024-12-01T10:00:00Z",
        },
      ]

      setNestBoxes(mockNestBoxes)
      setVolunteers(mockVolunteers)
      setActivityLogs(mockActivityLogs)
      setAssignments(mockAssignments)
    } catch (error) {
      console.error("Error fetching data:", error)
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

    setIsSubmitting(true)
    try {
      const newBoxId = `box-${Date.now()}`
      const nestBoxData: NestBox = {
        id: newBoxId,
        name: newBox.name,
        description: newBox.description,
        latitude: Number.parseFloat(newBox.coordinates.lat),
        longitude: Number.parseFloat(newBox.coordinates.lng),
        status: "active",
        qr_code: `${window.location.origin}/box/${newBoxId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add to local state
      setNestBoxes([nestBoxData, ...nestBoxes])
      setNewlyCreatedBox(nestBoxData)

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
      alert("Nest box added successfully! (This is a demo)")
    } catch (error) {
      console.error("Error adding nest box:", error)
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
      const newAssignment: VolunteerAssignment = {
        id: `assign-${Date.now()}`,
        nest_box_id: nestBoxId,
        volunteer_id: volunteerId,
        status: "assigned",
        assigned_date: new Date().toISOString().split("T")[0],
        notes: "Maintenance task assigned",
        created_at: new Date().toISOString(),
      }

      setAssignments([...assignments, newAssignment])
      alert("Maintenance task assigned successfully! (This is a demo)")
    } catch (error) {
      console.error("Error assigning maintenance task:", error)
      alert("Error assigning task. Please try again.")
    }
  }

  const completeMaintenanceTask = async (assignmentId: string) => {
    try {
      setAssignments(
        assignments.map((assignment) =>
          assignment.id === assignmentId ? { ...assignment, status: "completed" } : assignment,
        ),
      )
      alert("Maintenance task marked as complete! (This is a demo)")
    } catch (error) {
      console.error("Error completing maintenance task:", error)
      alert("Error updating task. Please try again.")
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Update role in mock database
      setVolunteers(
        volunteers.map((volunteer) =>
          volunteer.id === userId ? { ...volunteer, role: newRole, updated_at: new Date().toISOString() } : volunteer,
        ),
      )

      alert(`User role updated to ${newRole} successfully! (This is a demo)`)
    } catch (error) {
      console.error("Error updating user role:", error)
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
                onClick={handleAddBox}
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
