"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Heart, MapPin, Award, TrendingUp, Download } from "lucide-react"

// Mock sponsor data
const sponsorData = {
  totalContributions: 450,
  nestBoxesSponsored: 3,
  impactMetrics: {
    birdsHelped: 47,
    eggsHatched: 23,
    fledglingsRaised: 19,
    speciesSupported: 5,
  },
  sponsoredBoxes: [
    {
      id: "NB001",
      name: "Oak Grove Box #1",
      location: "Oak Grove Park",
      species: "Eastern Bluebird",
      status: "active",
      dedication: "In memory of Robert Chen",
      lastActivity: "2024-01-15",
      totalObservations: 12,
      currentOccupants: "4 eggs",
      image: "/bluebird-nest-box.png",
    },
    {
      id: "NB007",
      name: "Meadow View Box #7",
      location: "Wildflower Meadow",
      species: "House Wren",
      status: "active",
      dedication: "Johnson Family Dedication",
      lastActivity: "2024-01-18",
      totalObservations: 8,
      currentOccupants: "2 chicks",
      image: "/placeholder.svg",
    },
    {
      id: "NB012",
      name: "Riverside Box #12",
      location: "Riverside Trail",
      species: "Tree Swallow",
      status: "inactive",
      dedication: "Conservation Champion",
      lastActivity: "2024-01-10",
      totalObservations: 15,
      currentOccupants: "Empty",
      image: "/placeholder.svg",
    },
  ],
  recentUpdates: [
    {
      id: "UPD001",
      date: "2024-01-18",
      title: "New chicks hatched at Meadow View Box #7",
      description: "Two healthy House Wren chicks have hatched! Parents are actively feeding.",
      image: "/placeholder.svg",
      nestBoxId: "NB007",
    },
    {
      id: "UPD002",
      date: "2024-01-15",
      title: "Eastern Bluebird eggs discovered",
      description: "Four beautiful blue eggs found in Oak Grove Box #1. Incubation period has begun.",
      image: "/bluebird-nest-box.png",
      nestBoxId: "NB001",
    },
    {
      id: "UPD003",
      date: "2024-01-12",
      title: "Quarterly Impact Report Available",
      description:
        "Your Q4 2023 impact report is ready for download, showing the conservation results of your sponsorship.",
      image: "/placeholder.svg",
      nestBoxId: null,
    },
  ],
}

export function SponsorDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("year")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Sponsor Dashboard</h1>
          <p className="text-muted-foreground">Track your conservation impact and sponsored nest boxes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button size="sm">
            <Heart className="h-4 w-4 mr-2" />
            Sponsor More
          </Button>
        </div>
      </div>

      {/* Impact Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-2xl mb-1">${sponsorData.totalContributions}</h3>
            <p className="text-sm text-muted-foreground">Total Contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-2xl mb-1">{sponsorData.nestBoxesSponsored}</h3>
            <p className="text-sm text-muted-foreground">Nest Boxes Sponsored</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-2xl mb-1">{sponsorData.impactMetrics.birdsHelped}</h3>
            <p className="text-sm text-muted-foreground">Birds Helped</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-2xl mb-1">{sponsorData.impactMetrics.fledglingsRaised}</h3>
            <p className="text-sm text-muted-foreground">Fledglings Raised</p>
          </CardContent>
        </Card>
      </div>

      {/* Conservation Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Conservation Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{sponsorData.impactMetrics.eggsHatched}</div>
              <p className="text-sm text-muted-foreground">Eggs Successfully Hatched</p>
              <Progress value={85} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{sponsorData.impactMetrics.fledglingsRaised}</div>
              <p className="text-sm text-muted-foreground">Young Birds Fledged</p>
              <Progress value={76} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {sponsorData.impactMetrics.speciesSupported}
              </div>
              <p className="text-sm text-muted-foreground">Species Supported</p>
              <Progress value={62} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">92%</div>
              <p className="text-sm text-muted-foreground">Nesting Success Rate</p>
              <Progress value={92} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="nest-boxes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nest-boxes">My Nest Boxes</TabsTrigger>
          <TabsTrigger value="updates">Recent Updates</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
        </TabsList>

        {/* Sponsored Nest Boxes */}
        <TabsContent value="nest-boxes" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsorData.sponsoredBoxes.map((box) => (
              <Card key={box.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                    <img src={box.image || "/placeholder.svg"} alt={box.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{box.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {box.location}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(box.status)}`}>
                        {box.status}
                      </span>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Dedication:</p>
                      <p className="text-sm">{box.dedication}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Species</p>
                        <p className="font-medium">{box.species}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Status</p>
                        <p className="font-medium">{box.currentOccupants}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Observations</p>
                        <p className="font-medium">{box.totalObservations}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Activity</p>
                        <p className="font-medium">{new Date(box.lastActivity).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Updates */}
        <TabsContent value="updates" className="space-y-4">
          {sponsorData.recentUpdates.map((update) => (
            <Card key={update.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img src={update.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{update.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{update.description}</p>
                    {update.nestBoxId && (
                      <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                        View Nest Box →
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recognition */}
        <TabsContent value="recognition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conservation Champion Recognition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Bronze Conservation Champion</h3>
                <p className="text-muted-foreground mb-4">
                  Thank you for your continued support of local bird conservation
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">3</div>
                    <div className="text-muted-foreground">Nest Boxes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">$450</div>
                    <div className="text-muted-foreground">Contributed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">47</div>
                    <div className="text-muted-foreground">Birds Helped</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Digital Recognition</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Featured on NestBox Map</span>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Annual Report Recognition</span>
                    <span className="text-xs text-green-600 font-medium">Included</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Community Newsletter Feature</span>
                    <span className="text-xs text-blue-600 font-medium">Upcoming</span>
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
