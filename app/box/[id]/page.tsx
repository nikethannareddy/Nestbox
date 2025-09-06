"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  QrCode,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Upload,
  Loader2,
  Eye,
  AlertTriangle,
  Flag,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { NestBox } from "@/lib/types/database"

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  maintenance: "bg-red-500",
  retired: "bg-gray-600",
}

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Needs Maintenance",
  retired: "Retired",
}

const sharonBirds = [
  "Eastern Bluebird",
  "House Wren",
  "Tree Swallow",
  "Black-capped Chickadee",
  "White-breasted Nuthatch",
  "Tufted Titmouse",
  "Carolina Wren",
  "House Sparrow",
]

const activityTypes = [
  "Eggs seen",
  "Chicks active",
  "Adult feeding",
  "Empty box",
  "Nest building",
  "Adult pair spotted",
]

const nestStages = ["Empty", "Building", "Eggs", "Chicks", "Fledged"]

interface ActivityLog {
  id: string
  nest_box_id: string
  observer_name: string
  observation_date: string
  species_observed: string
  nest_stage: string
  egg_count: number
  chick_count: number
  behavior_notes: string
  maintenance_needed: boolean
  maintenance_notes: string
  verified: boolean
}

export default function NestBoxPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [showQR, setShowQR] = useState(false)
  const [box, setBox] = useState<NestBox | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showActivityForm, setShowActivityForm] = useState(false)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [species, setSpecies] = useState("")
  const [activityType, setActivityType] = useState("")
  const [nestStage, setNestStage] = useState("")
  const [eggCount, setEggCount] = useState("")
  const [chickCount, setChickCount] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [needsMaintenance, setNeedsMaintenance] = useState(false)
  const [maintenanceNotes, setMaintenanceNotes] = useState("")
  const [volunteerNotes, setVolunteerNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [issueType, setIssueType] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [reporterEmail, setReporterEmail] = useState("")
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchNestBox()
    fetchActivityLogs()
  }, [params.id])

  const fetchNestBox = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching nest box with ID:", params.id)

      const { data, error } = await supabase.from("nest_boxes").select("*").eq("id", params.id).single()

      if (error) {
        console.error("[v0] Database error:", error)
        throw error
      }

      console.log("[v0] Fetched nest box:", data)
      setBox(data)
    } catch (err) {
      console.error("[v0] Error fetching nest box:", err)
      setError("Failed to load nest box details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("observation_date", { ascending: false })
        .limit(50)

      if (error) {
        console.error("[v0] Error fetching activity logs:", error)
        return
      }

      console.log("[v0] Fetched activity logs from database:", data)

      // Filter by nest_box_id and limit to 10 in JavaScript since custom client doesn't support chaining after .eq()
      const filteredData = data?.filter((log) => log.nest_box_id === params.id).slice(0, 10) || []

      const transformedLogs = filteredData.map((log) => ({
        id: log.id,
        nest_box_id: log.nest_box_id,
        observer_name: log.volunteer_id || "Unknown Observer",
        observation_date: log.observation_date,
        species_observed: log.species_observed,
        nest_stage: log.nest_stage,
        egg_count: log.egg_count || 0,
        chick_count: log.chick_count || 0,
        behavior_notes: log.behavior_notes,
        maintenance_needed: log.maintenance_needed,
        maintenance_notes: log.maintenance_notes,
        verified: log.verified,
      }))

      console.log("[v0] Transformed activity logs:", transformedLogs)
      setActivityLogs(transformedLogs)
    } catch (err) {
      console.error("[v0] Error fetching activity logs:", err)
    }
  }

  const handleActivitySubmit = async () => {
    if (!user || !species || !activityType) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const activityData = {
        nest_box_id: params.id,
        volunteer_id: user.id,
        observation_date: new Date().toISOString(),
        species_observed: species,
        nest_stage: nestStage || null,
        egg_count: eggCount ? Number.parseInt(eggCount) : null,
        chick_count: chickCount ? Number.parseInt(chickCount) : null,
        behavior_notes: `${activityType}${volunteerNotes ? ` - ${volunteerNotes}` : ""}`,
        maintenance_needed: needsMaintenance,
        maintenance_notes: needsMaintenance ? maintenanceNotes : null,
        weather_conditions: null,
        photos: photo ? [photo.name] : null,
        verified: false,
      }

      console.log("[v0] Submitting activity data:", activityData)

      const result = await supabase.from("activity_logs").insert(activityData)

      console.log("[v0] Insert result:", result)

      // Reset form fields
      setSpecies("")
      setActivityType("")
      setNestStage("")
      setEggCount("")
      setChickCount("")
      setPhoto(null)
      setNeedsMaintenance(false)
      setMaintenanceNotes("")
      setVolunteerNotes("")
      setShowActivityForm(false)

      // Refresh activity logs
      await fetchActivityLogs()

      alert("Observation submitted successfully!")
    } catch (error) {
      console.error("[v0] Error submitting activity:", error)
      alert("Error submitting observation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIssueSubmit = async () => {
    if (!issueType || !issueDescription || !reporterName || !reporterEmail) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmittingIssue(true)

    try {
      const issueData = {
        nest_box_id: params.id,
        issue_type: issueType,
        description: issueDescription,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        reported_date: new Date().toISOString(),
        status: "open",
        priority: "medium",
      }

      console.log("[v0] Submitting issue data:", issueData)

      const result = await supabase.from("reported_issues").insert(issueData)

      console.log("[v0] Issue insert result:", result)

      // Reset form fields
      setIssueType("")
      setIssueDescription("")
      setReporterName("")
      setReporterEmail("")
      setShowIssueForm(false)

      alert("Issue reported successfully! Thank you for helping us maintain our nest boxes.")
    } catch (error) {
      console.error("[v0] Error reporting issue:", error)
      alert("Error reporting issue. Please try again.")
    } finally {
      setIsSubmittingIssue(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Loading Nest Box</h1>
            <p className="text-muted-foreground">Please wait while we fetch the details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !box) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Nest Box Not Found</h1>
            <p className="text-muted-foreground mb-4">{error || "The nest box you're looking for doesn't exist."}</p>
            <Link href="/map">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Map
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const qrCodeUrl = box.qr_code_url || `${window.location.origin}/box/${box.id}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/map">
            <Button variant="outline" className="bg-white/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </Link>
          <Badge variant="secondary" className={`${statusColors[box?.status as keyof typeof statusColors]} text-white`}>
            {statusLabels[box?.status as keyof typeof statusLabels]}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image and Basic Info */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={box?.image_url || "/placeholder.svg"}
                    alt={box?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{box?.name}</h1>
                      <p className="text-primary">ID: {box?.id.slice(0, 8)}</p>
                    </div>
                    <Button
                      variant="outline"
                      className={`${statusColors[box?.status as keyof typeof statusColors]} text-white border-none`}
                    >
                      {statusLabels[box?.status as keyof typeof statusLabels]}
                    </Button>
                  </div>

                  <p className="text-muted-foreground">{box?.description || "No description available."}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      setShowActivityForm(!showActivityForm)
                      setShowIssueForm(false)
                    }}
                    variant={showActivityForm ? "secondary" : "default"}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {showActivityForm ? "Cancel Logging" : "Log Activity"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowIssueForm(!showIssueForm)
                      setShowActivityForm(false)
                    }}
                    variant={showIssueForm ? "secondary" : "outline"}
                    className="w-full"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {showIssueForm ? "Cancel Report" : "Report an Issue"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {(showActivityForm || showIssueForm) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {showActivityForm ? (
                      <>
                        <Eye className="h-5 w-5" />
                        Log Activity
                      </>
                    ) : (
                      <>
                        <Flag className="h-5 w-5" />
                        Report an Issue
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showActivityForm && (
                    <>
                      {!user ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Please sign in to log observations.</p>
                          <Button className="mt-4" onClick={() => (window.location.href = "/auth")}>
                            Sign In to Log Activity
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Species Selection */}
                          <div>
                            <Label htmlFor="species" className="font-medium">
                              Bird Species *
                            </Label>
                            <Select value={species} onValueChange={setSpecies}>
                              <SelectTrigger>
                                <SelectValue placeholder="What bird species did you observe?" />
                              </SelectTrigger>
                              <SelectContent>
                                {sharonBirds.map((bird) => (
                                  <SelectItem key={bird} value={bird}>
                                    {bird}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Activity Type */}
                          <div>
                            <Label htmlFor="activity" className="font-medium">
                              Activity Observed *
                            </Label>
                            <Select value={activityType} onValueChange={setActivityType}>
                              <SelectTrigger>
                                <SelectValue placeholder="What activity did you observe?" />
                              </SelectTrigger>
                              <SelectContent>
                                {activityTypes.map((activity) => (
                                  <SelectItem key={activity} value={activity}>
                                    {activity}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Nest Stage */}
                          <div>
                            <Label htmlFor="nest-stage" className="font-medium">
                              Nest Stage
                            </Label>
                            <Select value={nestStage} onValueChange={setNestStage}>
                              <SelectTrigger>
                                <SelectValue placeholder="What stage is the nest in?" />
                              </SelectTrigger>
                              <SelectContent>
                                {nestStages.map((stage) => (
                                  <SelectItem key={stage} value={stage}>
                                    {stage}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Egg and Chick Counts */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="egg-count" className="font-medium">
                                Egg Count
                              </Label>
                              <Input
                                id="egg-count"
                                type="number"
                                min="0"
                                max="10"
                                value={eggCount}
                                onChange={(e) => setEggCount(e.target.value)}
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label htmlFor="chick-count" className="font-medium">
                                Chick Count
                              </Label>
                              <Input
                                id="chick-count"
                                type="number"
                                min="0"
                                max="10"
                                value={chickCount}
                                onChange={(e) => setChickCount(e.target.value)}
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Volunteer Notes */}
                          <div>
                            <Label htmlFor="volunteer-notes" className="font-medium">
                              Additional Notes
                            </Label>
                            <Textarea
                              id="volunteer-notes"
                              value={volunteerNotes}
                              onChange={(e) => setVolunteerNotes(e.target.value)}
                              placeholder="Add any additional observations..."
                              rows={3}
                            />
                          </div>

                          {/* Photo Upload */}
                          <div>
                            <Label htmlFor="photo" className="font-medium">
                              Photo (Optional)
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                                className="flex-1"
                              />
                              <Upload className="w-5 h-5 text-primary" />
                            </div>
                            {photo && <p className="text-sm text-primary mt-1">Photo selected: {photo.name}</p>}
                          </div>

                          {/* Maintenance Flag */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="maintenance"
                                checked={needsMaintenance}
                                onCheckedChange={setNeedsMaintenance}
                              />
                              <Label htmlFor="maintenance" className="text-sm font-medium">
                                This nest box needs maintenance
                              </Label>
                            </div>

                            {needsMaintenance && (
                              <div>
                                <Label htmlFor="maintenance-notes" className="font-medium">
                                  Maintenance Notes
                                </Label>
                                <Textarea
                                  id="maintenance-notes"
                                  value={maintenanceNotes}
                                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                                  placeholder="Describe what maintenance is needed..."
                                  rows={3}
                                />
                              </div>
                            )}
                          </div>

                          {/* Submit Button */}
                          <Button
                            onClick={handleActivitySubmit}
                            disabled={isSubmitting || !species || !activityType}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Observation"
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {showIssueForm && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reporter-name" className="font-medium">
                            Your Name *
                          </Label>
                          <Input
                            id="reporter-name"
                            value={reporterName}
                            onChange={(e) => setReporterName(e.target.value)}
                            placeholder="Enter your name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reporter-email" className="font-medium">
                            Your Email *
                          </Label>
                          <Input
                            id="reporter-email"
                            type="email"
                            value={reporterEmail}
                            onChange={(e) => setReporterEmail(e.target.value)}
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="issue-type" className="font-medium">
                          Issue Type *
                        </Label>
                        <Select value={issueType} onValueChange={setIssueType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the type of issue" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="damage">Physical Damage</SelectItem>
                            <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                            <SelectItem value="vandalism">Vandalism</SelectItem>
                            <SelectItem value="access">Access Issues</SelectItem>
                            <SelectItem value="safety">Safety Concern</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="issue-description" className="font-medium">
                          Description *
                        </Label>
                        <Textarea
                          id="issue-description"
                          value={issueDescription}
                          onChange={(e) => setIssueDescription(e.target.value)}
                          placeholder="Please describe the issue in detail..."
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={handleIssueSubmit}
                        disabled={
                          isSubmittingIssue || !issueType || !issueDescription || !reporterName || !reporterEmail
                        }
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        {isSubmittingIssue ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting Report...
                          </>
                        ) : (
                          <>
                            <Flag className="w-4 h-4 mr-2" />
                            Submit Issue Report
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLogs.length > 0 ? (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <Card key={log.id} className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{log.species_observed}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(log.observation_date).toLocaleDateString()} • Logged by {log.observer_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{log.nest_stage}</Badge>
                              {log.verified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Eggs:</span>
                              <span className="ml-2">{log.egg_count}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Chicks:</span>
                              <span className="ml-2">{log.chick_count}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stage:</span>
                              <span className="ml-2">{log.nest_stage}</span>
                            </div>
                          </div>

                          {log.behavior_notes && (
                            <div className="mb-3">
                              <span className="text-sm text-muted-foreground">Behavior: </span>
                              <span className="text-sm">{log.behavior_notes}</span>
                            </div>
                          )}

                          {log.maintenance_needed && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">Maintenance Required</span>
                              </div>
                              {log.maintenance_notes && (
                                <p className="text-sm text-red-700 mt-1">{log.maintenance_notes}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No activity recorded yet.</p>
                    <p className="text-sm">Be the first to log an observation!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {showQR && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    {box?.qr_code ? (
                      <img
                        src={box.qr_code || "/placeholder.svg"}
                        alt={`QR Code for ${box.name}`}
                        className="w-48 h-48 mx-auto mb-4 rounded border"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 mx-auto mb-4 rounded border flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-2">QR Code for {box?.name}</p>
                    <p className="text-xs text-gray-500 break-all">
                      {box?.qr_code_url || `${window.location.origin}/box/${box?.id}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Nest Box Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Box Type:</span>
                    <span className="font-medium text-foreground capitalize">{box.box_type || "Standard"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrance Hole:</span>
                    <span className="font-medium text-foreground">{box.entrance_hole_size || "1.5"} inches</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Height:</span>
                    <span className="font-medium text-foreground">{box.height_from_ground || 5} ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facing:</span>
                    <span className="font-medium text-foreground capitalize">{box.facing_direction || "East"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Habitat:</span>
                    <span className="font-medium text-foreground capitalize">{box.habitat_type || "Mixed"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Species:</span>
                    <span className="font-medium text-foreground">{box.target_species?.join(", ") || "Various"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installation:</span>
                    <span className="font-medium text-foreground">
                      {box.installation_date ? new Date(box.installation_date).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installer:</span>
                    <span className="font-medium text-foreground">{box.installer_name || "Unknown"}</span>
                  </div>
                  {box.sponsor_message && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sponsor:</span>
                      <span className="font-medium text-foreground">{box.sponsor_message}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium text-foreground">
                      {box.updated_at ? new Date(box.updated_at).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
