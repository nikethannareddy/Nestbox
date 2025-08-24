"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Camera, QrCode, Calendar, User, ArrowLeft, Navigation } from "lucide-react"
import Link from "next/link"

// Mock data - in real app this would come from database
const mockNestBoxes = {
  NB001: {
    id: "NB001",
    name: "Oak Grove Box #1",
    location: "Sharon Community Garden",
    coordinates: { lat: 42.1237, lng: -71.1786 },
    status: "active",
    species: "Eastern Bluebird",
    sponsor: "Johnson Family",
    lastActivity: "2024-01-15",
    eggs: 4,
    chicks: 0,
    maintenanceStatus: "good",
    image: "/bluebird-nest-box.png",
    description: "Located in the community park near the oak grove. Popular with Eastern Bluebirds.",
    recentActivity: [
      { date: "2024-01-15", activity: "4 eggs observed", volunteer: "Sarah M." },
      { date: "2024-01-10", activity: "Nest building complete", volunteer: "Mike R." },
      { date: "2024-01-05", activity: "Adult pair spotted", volunteer: "Tom L." },
    ],
  },
  NB002: {
    id: "NB002",
    name: "Meadow View Box #2",
    location: "Borderland State Park Trail",
    coordinates: { lat: 42.1156, lng: -71.1923 },
    status: "inactive",
    species: "House Wren",
    sponsor: "Green Earth Corp",
    lastActivity: "2024-01-08",
    eggs: 0,
    chicks: 0,
    maintenanceStatus: "needs-cleaning",
    image: "/placeholder-nest-box.png",
    description: "Overlooks the wildflower meadow. Needs seasonal cleaning.",
    recentActivity: [
      { date: "2024-01-08", activity: "Box cleaned", volunteer: "Tom L." },
      { date: "2023-12-20", activity: "Fledglings departed", volunteer: "Lisa K." },
    ],
  },
}

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  maintenance: "bg-red-500",
}

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Needs Maintenance",
}

export default function NestBoxPage({ params }: { params: { id: string } }) {
  const [showQR, setShowQR] = useState(false)
  const box = mockNestBoxes[params.id as keyof typeof mockNestBoxes]

  if (!box) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Nest Box Not Found</h1>
            <p className="text-muted-foreground mb-4">The nest box you're looking for doesn't exist.</p>
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

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${box.coordinates.lat},${box.coordinates.lng}`
    window.open(url, "_blank")
  }

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
          <Badge variant="secondary" className={`${statusColors[box.status as keyof typeof statusColors]} text-white`}>
            {statusLabels[box.status as keyof typeof statusLabels]}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image and Basic Info */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img src={box.image || "/placeholder.svg"} alt={box.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{box.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{box.location}</span>
                      </div>
                      <p className="text-primary">ID: {box.id}</p>
                    </div>
                    <Button variant="outline" onClick={() => setShowQR(!showQR)} className="bg-white/80">
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                  </div>

                  {showQR && (
                    <div className="mb-4 p-4 bg-white rounded-lg border">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gray-200 mx-auto mb-2 rounded flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">QR Code for {box.id}</p>
                        <p className="text-xs text-gray-500">nestbox.app/box/{box.id}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-muted-foreground">{box.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {box.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">{activity.activity}</span>
                          <span className="text-sm text-primary">{activity.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>Logged by {activity.volunteer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{box.eggs}</div>
                    <div className="text-sm text-muted-foreground">Eggs</div>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{box.chicks}</div>
                    <div className="text-sm text-muted-foreground">Chicks</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Species:</span>
                    <span className="font-medium text-foreground">{box.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sponsor:</span>
                    <span className="font-medium text-foreground">{box.sponsor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Activity:</span>
                    <span className="font-medium text-foreground">{box.lastActivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maintenance:</span>
                    <span className="font-medium text-foreground capitalize">
                      {box.maintenanceStatus.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/nest-check?box=${box.id}`}>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <Camera className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </Link>
                <Button variant="outline" className="w-full bg-white/80" onClick={openGoogleMaps}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            {/* Google Maps Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100"></div>
                  <div className="text-center z-10">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Google Maps</p>
                    <p className="text-xs text-primary">
                      {box.coordinates.lat}, {box.coordinates.lng}
                    </p>
                  </div>
                  {/* Mock map marker */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div
                      className={`w-4 h-4 rounded-full ${statusColors[box.status as keyof typeof statusColors]} border-2 border-white shadow-lg`}
                    ></div>
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
