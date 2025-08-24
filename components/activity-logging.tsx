"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, MapPin, Calendar, Clock, Thermometer, Eye, AlertTriangle, CheckCircle, Upload, X } from "lucide-react"

// Mock data for existing logs
const mockActivityLogs = [
  {
    id: "LOG001",
    nestBoxId: "NB001",
    nestBoxName: "Oak Grove Box #1",
    volunteer: "Sarah M.",
    date: "2024-01-15",
    time: "08:30",
    species: "Eastern Bluebird",
    nestStage: "eggs",
    eggCount: 4,
    chickCount: 0,
    behavior: "Female incubating",
    weather: "sunny",
    temperature: 68,
    maintenanceNeeds: "none",
    photos: ["/activity-log-1.png"],
    notes: "Female observed sitting on nest for extended period. Male brought food twice during observation.",
    verified: true,
  },
  {
    id: "LOG002",
    nestBoxId: "NB003",
    nestBoxName: "Riverside Box #3",
    volunteer: "Emma D.",
    date: "2024-01-18",
    time: "07:15",
    species: "Tree Swallow",
    nestStage: "chicks",
    eggCount: 0,
    chickCount: 3,
    behavior: "Feeding young",
    weather: "partly-cloudy",
    temperature: 72,
    maintenanceNeeds: "none",
    photos: ["/activity-log-2.png"],
    notes: "Three healthy chicks observed. Parents very active bringing insects. Chicks appear to be about 1 week old.",
    verified: true,
  },
  {
    id: "LOG003",
    nestBoxId: "NB004",
    nestBoxName: "Pine Hill Box #4",
    volunteer: "Mark T.",
    date: "2024-01-05",
    time: "14:20",
    species: "Chickadee",
    nestStage: "maintenance",
    eggCount: 0,
    chickCount: 0,
    behavior: "none",
    weather: "overcast",
    temperature: 45,
    maintenanceNeeds: "repair",
    photos: ["/activity-log-3.png"],
    notes: "Storm damage to roof. Small crack allowing water entry. Needs repair before next nesting season.",
    verified: false,
  },
]

const nestStages = [
  { value: "empty", label: "Empty/Unused" },
  { value: "building", label: "Nest Building" },
  { value: "eggs", label: "Eggs Present" },
  { value: "chicks", label: "Chicks Present" },
  { value: "fledged", label: "Recently Fledged" },
  { value: "maintenance", label: "Maintenance Required" },
]

const weatherConditions = [
  { value: "sunny", label: "Sunny", icon: "☀️" },
  { value: "partly-cloudy", label: "Partly Cloudy", icon: "⛅" },
  { value: "overcast", label: "Overcast", icon: "☁️" },
  { value: "rainy", label: "Rainy", icon: "🌧️" },
  { value: "windy", label: "Windy", icon: "💨" },
]

const maintenanceOptions = [
  { value: "none", label: "No Issues" },
  { value: "cleaning", label: "Needs Cleaning" },
  { value: "repair", label: "Needs Repair" },
  { value: "replacement", label: "Needs Replacement" },
]

export function ActivityLogging() {
  const [activeTab, setActiveTab] = useState("log-activity")
  const [formData, setFormData] = useState({
    nestBoxId: "",
    species: "",
    nestStage: "",
    eggCount: "",
    chickCount: "",
    behavior: "",
    weather: "",
    temperature: "",
    maintenanceNeeds: "none",
    notes: "",
    photos: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Mock photo upload - in real app would upload to storage
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file))
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
    }
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Mock submission delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setShowSuccess(true)

    // Reset form
    setFormData({
      nestBoxId: "",
      species: "",
      nestStage: "",
      eggCount: "",
      chickCount: "",
      behavior: "",
      weather: "",
      temperature: "",
      maintenanceNeeds: "none",
      notes: "",
      photos: [],
    })

    setTimeout(() => setShowSuccess(false), 3000)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "eggs":
        return "bg-blue-100 text-blue-800"
      case "chicks":
        return "bg-green-100 text-green-800"
      case "building":
        return "bg-yellow-100 text-yellow-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Activity Logging System</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Record detailed observations and help track the health of our nest box community
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="log-activity">Log Activity</TabsTrigger>
          <TabsTrigger value="recent-logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Activity Logging Form */}
        <TabsContent value="log-activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Record New Observation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">Activity logged successfully! Thank you for your contribution.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nestBoxId">Nest Box ID *</Label>
                    <Select value={formData.nestBoxId} onValueChange={(value) => handleInputChange("nestBoxId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nest box" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NB001">NB001 - Oak Grove Box #1</SelectItem>
                        <SelectItem value="NB002">NB002 - Meadow View Box #2</SelectItem>
                        <SelectItem value="NB003">NB003 - Riverside Box #3</SelectItem>
                        <SelectItem value="NB004">NB004 - Pine Hill Box #4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="species">Species Observed</Label>
                    <Select value={formData.species} onValueChange={(value) => handleInputChange("species", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Eastern Bluebird">Eastern Bluebird</SelectItem>
                        <SelectItem value="House Wren">House Wren</SelectItem>
                        <SelectItem value="Tree Swallow">Tree Swallow</SelectItem>
                        <SelectItem value="Chickadee">Chickadee</SelectItem>
                        <SelectItem value="Other">Other (specify in notes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Nest Stage and Counts */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nestStage">Nest Stage *</Label>
                    <Select value={formData.nestStage} onValueChange={(value) => handleInputChange("nestStage", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {nestStages.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eggCount">Egg Count</Label>
                    <Input
                      id="eggCount"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.eggCount}
                      onChange={(e) => handleInputChange("eggCount", e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chickCount">Chick Count</Label>
                    <Input
                      id="chickCount"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.chickCount}
                      onChange={(e) => handleInputChange("chickCount", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Behavior and Weather */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="behavior">Observed Behavior</Label>
                    <Input
                      id="behavior"
                      value={formData.behavior}
                      onChange={(e) => handleInputChange("behavior", e.target.value)}
                      placeholder="e.g., feeding young, nest building, territorial"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weather">Weather Conditions</Label>
                    <Select value={formData.weather} onValueChange={(value) => handleInputChange("weather", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weather" />
                      </SelectTrigger>
                      <SelectContent>
                        {weatherConditions.map((weather) => (
                          <SelectItem key={weather.value} value={weather.value}>
                            {weather.icon} {weather.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Temperature and Maintenance */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="temperature"
                        type="number"
                        value={formData.temperature}
                        onChange={(e) => handleInputChange("temperature", e.target.value)}
                        placeholder="72"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maintenanceNeeds">Maintenance Needs</Label>
                    <Select
                      value={formData.maintenanceNeeds}
                      onValueChange={(value) => handleInputChange("maintenanceNeeds", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select maintenance status" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload photos of your observation (recommended for unusual sightings)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("photo-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Photos
                      </Button>
                    </div>

                    {formData.photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removePhoto(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Detailed observations, unusual behavior, environmental factors, etc."
                    rows={4}
                  />
                </div>

                {/* Auto-filled Information */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Automatically Recorded
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date: {new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Time: {new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>GPS: Auto-detected</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.nestBoxId || !formData.nestStage}
                    className="flex-1"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Observation"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        nestBoxId: "",
                        species: "",
                        nestStage: "",
                        eggCount: "",
                        chickCount: "",
                        behavior: "",
                        weather: "",
                        temperature: "",
                        maintenanceNeeds: "none",
                        notes: "",
                        photos: [],
                      })
                    }
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Logs */}
        <TabsContent value="recent-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivityLogs.map((log) => (
                  <Card key={log.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{log.nestBoxName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {log.date} at {log.time} • Logged by {log.volunteer}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStageColor(log.nestStage)}>
                            {nestStages.find((s) => s.value === log.nestStage)?.label}
                          </Badge>
                          {log.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Species:</span>
                          <span className="ml-2">{log.species}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Eggs:</span>
                          <span className="ml-2">{log.eggCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Chicks:</span>
                          <span className="ml-2">{log.chickCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weather:</span>
                          <span className="ml-2 capitalize">{log.weather.replace("-", " ")}</span>
                        </div>
                      </div>

                      {log.behavior && (
                        <div className="mb-3">
                          <span className="text-sm text-muted-foreground">Behavior: </span>
                          <span className="text-sm">{log.behavior}</span>
                        </div>
                      )}

                      {log.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">{log.notes}</p>
                        </div>
                      )}

                      {log.photos.length > 0 && (
                        <div className="flex gap-2">
                          {log.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo || "/placeholder.svg"}
                              alt={`Observation ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      {log.maintenanceNeeds !== "none" && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Maintenance Required:{" "}
                              {maintenanceOptions.find((m) => m.value === log.maintenanceNeeds)?.label}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports and Analytics */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-2xl mb-1">127</h3>
                <p className="text-sm text-muted-foreground">Total Observations</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-2xl mb-1">23</h3>
                <p className="text-sm text-muted-foreground">Active Nests</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-2xl mb-1">8</h3>
                <p className="text-sm text-muted-foreground">Species Recorded</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-2xl mb-1">3</h3>
                <p className="text-sm text-muted-foreground">Maintenance Needed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Most Active Nest Boxes</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Oak Grove Box #1</span>
                        <Badge variant="secondary">15 logs</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Riverside Box #3</span>
                        <Badge variant="secondary">12 logs</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Meadow View Box #2</span>
                        <Badge variant="secondary">8 logs</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Top Volunteers</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sarah M.</span>
                        <Badge variant="secondary">22 logs</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Emma D.</span>
                        <Badge variant="secondary">18 logs</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mark T.</span>
                        <Badge variant="secondary">14 logs</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
