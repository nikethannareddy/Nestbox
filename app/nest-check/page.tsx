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
import { Camera, QrCode, CheckCircle, Upload, Home, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// Common Sharon, MA birds
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

interface NestBox {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  status: string
  created_at: string
}

export default function NestCheckPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const boxId = searchParams.get("box")

  const [loading, setLoading] = useState(true)
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [selectedBox, setSelectedBox] = useState(boxId || "")
  const [selectedBoxData, setSelectedBoxData] = useState<NestBox | null>(null)
  const [species, setSpecies] = useState("")
  const [activityType, setActivityType] = useState("")
  const [nestStage, setNestStage] = useState("")
  const [eggCount, setEggCount] = useState("")
  const [chickCount, setChickCount] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [needsMaintenance, setNeedsMaintenance] = useState(false)
  const [maintenanceNotes, setMaintenanceNotes] = useState("")
  const [volunteerNotes, setVolunteerNotes] = useState("")
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchMockNestBoxes()
  }, [])

  useEffect(() => {
    if (selectedBox) {
      const box = nestBoxes.find((b) => b.id === selectedBox)
      setSelectedBoxData(box || null)
    }
  }, [selectedBox, nestBoxes])

  const fetchMockNestBoxes = async () => {
    try {
      setLoading(true)

      const mockNestBoxes: NestBox[] = [
        {
          id: "box-1",
          name: "Meadow Box A",
          description: "Located near the meadow entrance",
          latitude: 42.1234,
          longitude: -71.5678,
          status: "active",
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "box-2",
          name: "Trail Box B",
          description: "Along the main hiking trail",
          latitude: 42.1245,
          longitude: -71.5689,
          status: "active",
          created_at: "2024-01-20T10:00:00Z",
        },
        {
          id: "box-3",
          name: "Forest Box C",
          description: "Deep in the forest trail",
          latitude: 42.1256,
          longitude: -71.57,
          status: "active",
          created_at: "2024-01-25T10:00:00Z",
        },
      ]

      setNestBoxes(mockNestBoxes)
    } catch (error) {
      console.error("Error fetching nest boxes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQRScan = () => {
    // Mock QR scan - in real app this would use camera
    if (nestBoxes.length > 0) {
      const mockScannedId = nestBoxes[0].id
      setSelectedBox(mockScannedId)
      setShowQRScanner(false)
      alert(`Scanned nest box: ${nestBoxes[0].name}`)
    }
  }

  const handleSubmit = async () => {
    if (!user || !selectedBox || !species || !activityType) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const activityData = {
        nest_box_id: selectedBox,
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

      console.log("Nest Check submitted successfully (demo):", activityData)
      alert("Observation submitted successfully! (This is a demo)")
      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting nest check:", error)
      alert("Error submitting observation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedBox("")
    setSelectedBoxData(null)
    setSpecies("")
    setActivityType("")
    setNestStage("")
    setEggCount("")
    setChickCount("")
    setPhoto(null)
    setNeedsMaintenance(false)
    setMaintenanceNotes("")
    setVolunteerNotes("")
    setSubmitted(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-emerald-700">Loading nest boxes...</span>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Nest Check Complete!</h2>
            <p className="text-slate-600 mb-6">Your observation has been recorded for {selectedBoxData?.name}.</p>
            <div className="space-y-3">
              <Button onClick={resetForm} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Log Another Check
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Monitor NestBox</h1>
              <p className="text-emerald-700 text-sm">Quick and easy nest box observation logging</p>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-200">
              <CardTitle className="text-emerald-900">Record Your Observation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 bg-white/50 p-6">
              {/* QR Scanner Section */}
              <div className="text-center p-6 bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-200">
                <QrCode className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-emerald-900 mb-2">Find Your Nest Box</h3>
                <p className="text-sm text-emerald-700 mb-4">
                  Scan the QR code on the nest box to automatically fill in details
                </p>
                <Button
                  onClick={() => setShowQRScanner(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>

                {showQRScanner && (
                  <div className="mt-4 p-4 bg-white rounded border border-emerald-200">
                    <div className="aspect-square bg-slate-100 rounded mb-3 flex items-center justify-center">
                      <Camera className="w-16 h-16 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Camera viewfinder would appear here</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleQRScan}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Mock Scan Box
                      </Button>
                      <Button
                        onClick={() => setShowQRScanner(false)}
                        variant="outline"
                        size="sm"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Selection */}
              <div>
                <Label htmlFor="nestbox" className="text-emerald-900 font-medium">
                  Or Select Nest Box Manually
                </Label>
                <Select value={selectedBox} onValueChange={setSelectedBox}>
                  <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
                    <SelectValue placeholder="Choose a nest box..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nestBoxes.map((box) => (
                      <SelectItem key={box.id} value={box.id}>
                        {box.name} - Lat: {box.latitude}, Lng: {box.longitude}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBoxData && (
                <>
                  {/* Selected Box Info */}
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">{selectedBoxData.name}</span>
                    </div>
                    <p className="text-sm text-emerald-700">{selectedBoxData.description}</p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Lat: {selectedBoxData.latitude}, Lng: {selectedBoxData.longitude}
                    </p>
                  </div>

                  {/* Species Selection */}
                  <div>
                    <Label htmlFor="species" className="text-emerald-900 font-medium">
                      Bird Species *
                    </Label>
                    <Select value={species} onValueChange={setSpecies}>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
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
                    <Label htmlFor="activity" className="text-emerald-900 font-medium">
                      Activity Observed *
                    </Label>
                    <Select value={activityType} onValueChange={setActivityType}>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
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
                    <Label htmlFor="nest-stage" className="text-emerald-900 font-medium">
                      Nest Stage
                    </Label>
                    <Select value={nestStage} onValueChange={setNestStage}>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500">
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
                      <Label htmlFor="egg-count" className="text-emerald-900 font-medium">
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
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="chick-count" className="text-emerald-900 font-medium">
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
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Volunteer Notes */}
                  <div>
                    <Label htmlFor="volunteer-notes" className="text-emerald-900 font-medium">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="volunteer-notes"
                      value={volunteerNotes}
                      onChange={(e) => setVolunteerNotes(e.target.value)}
                      placeholder="Add any additional observations or notes about the nest box or bird activity..."
                      rows={3}
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <Label htmlFor="photo" className="text-emerald-900 font-medium">
                      Photo (Optional)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        className="flex-1 border-emerald-200 focus:border-emerald-500"
                      />
                      <Upload className="w-5 h-5 text-emerald-600" />
                    </div>
                    {photo && <p className="text-sm text-emerald-600 mt-1">Photo selected: {photo.name}</p>}
                  </div>

                  {/* Maintenance Flag */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="maintenance" checked={needsMaintenance} onCheckedChange={setNeedsMaintenance} />
                      <Label htmlFor="maintenance" className="text-sm font-medium text-emerald-900">
                        This nest box needs maintenance
                      </Label>
                    </div>

                    {needsMaintenance && (
                      <div>
                        <Label htmlFor="maintenance-notes" className="text-emerald-900 font-medium">
                          Maintenance Notes
                        </Label>
                        <Textarea
                          id="maintenance-notes"
                          value={maintenanceNotes}
                          onChange={(e) => setMaintenanceNotes(e.target.value)}
                          placeholder="Describe what maintenance is needed..."
                          rows={3}
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedBox || !species || !activityType || !user}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Nest Check"
                    )}
                  </Button>

                  {!user && <p className="text-sm text-red-600 text-center">Please sign in to submit observations.</p>}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
