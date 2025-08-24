"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Hammer, Bird, Play, Volume2, Home, TreePine, CheckCircle, Info, Download, FileText } from "lucide-react"

const sharonMABirds = [
  {
    id: "bluebird",
    name: "Eastern Bluebird",
    scientificName: "Sialia sialis",
    image: "/eastern-bluebird.png",
    audio: "/bluebird-call.mp3",
    description:
      "Beautiful blue and orange songbird commonly seen in Sharon's open fields and parks. State bird of Massachusetts.",
    nestingHabits: "Cavity nester, prefers boxes 5-6 feet high in open areas like Sharon Community Garden",
    seasonalBehavior: "Year-round resident in Sharon, most active March-August during breeding season",
    conservationStatus: "Stable",
    sharonLocations: ["Sharon Community Garden", "Borderland State Park", "Open fields along Bay Road"],
    nestBoxSpecs: {
      holeSize: "1.5 inches",
      floorSize: "5x5 inches",
      height: "8 inches",
      mounting: "5-6 feet high in open areas",
    },
  },
  {
    id: "wren",
    name: "House Wren",
    scientificName: "Troglodytes aedon",
    image: "/house-wren.png",
    audio: "/wren-call.mp3",
    description: "Small brown bird with a loud, bubbling song. Very common in Sharon's residential areas and parks.",
    nestingHabits: "Cavity nester, will use almost any enclosed space including nest boxes in backyards",
    seasonalBehavior: "Summer resident in Sharon (April-September), migrates south for winter",
    conservationStatus: "Stable",
    sharonLocations: ["Residential neighborhoods", "Sharon Center", "Borderland State Park trails"],
    nestBoxSpecs: {
      holeSize: "1.25 inches",
      floorSize: "4x4 inches",
      height: "6-8 inches",
      mounting: "5-10 feet high near shrubs",
    },
  },
  {
    id: "swallow",
    name: "Tree Swallow",
    scientificName: "Tachycineta bicolor",
    image: "/tree-swallow.png",
    audio: "/swallow-call.mp3",
    description:
      "Iridescent blue-green above, white below. Excellent aerial insect hunters seen over Sharon's ponds and wetlands.",
    nestingHabits: "Cavity nester, prefers boxes near water sources like Massapoag Lake",
    seasonalBehavior: "Summer resident (March-September), winters in Central America",
    conservationStatus: "Declining",
    sharonLocations: ["Massapoag Lake", "Borderland State Park ponds", "Wetland areas"],
    nestBoxSpecs: {
      holeSize: "1.25 inches",
      floorSize: "5x5 inches",
      height: "6 inches",
      mounting: "4-8 feet high near water",
    },
  },
  {
    id: "chickadee",
    name: "Black-capped Chickadee",
    scientificName: "Poecile atricapillus",
    image: "/chickadee.png",
    audio: "/chickadee-call.mp3",
    description:
      "Small, friendly bird with distinctive black cap and white cheeks. Year-round resident throughout Sharon.",
    nestingHabits: "Cavity nester, excavates own holes but will use nest boxes in wooded areas",
    seasonalBehavior: "Year-round resident, most active at feeders during winter months",
    conservationStatus: "Stable",
    sharonLocations: [
      "Throughout Sharon's wooded areas",
      "Residential yards with mature trees",
      "Borderland State Park",
    ],
    nestBoxSpecs: {
      holeSize: "1.125 inches",
      floorSize: "4x4 inches",
      height: "8 inches",
      mounting: "5-15 feet high in wooded areas",
    },
  },
  {
    id: "nuthatch",
    name: "White-breasted Nuthatch",
    scientificName: "Sitta carolinensis",
    image: "/nuthatch.png",
    audio: "/nuthatch-call.mp3",
    description: "Compact bird that walks headfirst down tree trunks. Common in Sharon's mature oak and maple forests.",
    nestingHabits: "Cavity nester, prefers natural tree cavities but will use appropriately sized nest boxes",
    seasonalBehavior: "Year-round resident, often seen with chickadee flocks in winter",
    conservationStatus: "Stable",
    sharonLocations: ["Mature forests", "Large residential trees", "Borderland State Park oak groves"],
    nestBoxSpecs: {
      holeSize: "1.25 inches",
      floorSize: "4x4 inches",
      height: "8 inches",
      mounting: "5-12 feet high on mature trees",
    },
  },
]

const nestBoxTypes = [
  {
    id: "traditional",
    name: "Traditional Nest Boxes",
    icon: <Home className="h-6 w-6" />,
    description: "Enclosed boxes perfect for Sharon's cavity-nesting birds",
    species: ["Eastern Bluebird", "House Wren", "Black-capped Chickadee", "White-breasted Nuthatch"],
    features: ["Species-specific hole sizes", "Predator protection", "Easy monitoring"],
    image: "/traditional-nest-box.png",
  },
  {
    id: "platform",
    name: "Open Platform Nests",
    icon: <TreePine className="h-6 w-6" />,
    description: "Flat platforms for birds that prefer open nesting",
    species: ["American Robin", "Eastern Phoebe", "Barn Swallow"],
    features: ["Natural feel", "Easy access", "Weather protection"],
    image: "/platform-nest.png",
  },
]

const buildingSteps = [
  {
    step: 1,
    title: "Planning & Materials",
    description: "Choose the right design for Sharon's common birds",
    details: [
      "Select cedar or pine lumber (untreated)",
      'Choose hole size: 1.5" for bluebirds, 1.25" for wrens',
      "Gather galvanized screws and hinges",
      "Plan installation location",
    ],
    safetyTips: ["Use untreated wood only", "Avoid pressure-treated lumber", "Choose bird-safe finishes"],
  },
  {
    step: 2,
    title: "Cutting & Drilling",
    description: "Prepare all pieces with proper dimensions",
    details: [
      "Cut front, back, sides, bottom, and roof pieces",
      "Drill entrance hole at correct height",
      "Add ventilation holes near top",
      "Create drainage holes in bottom",
    ],
    safetyTips: ["Wear safety glasses", "Pre-drill screw holes", "Sand all rough edges"],
  },
  {
    step: 3,
    title: "Assembly & Finishing",
    description: "Build and prepare for outdoor installation",
    details: [
      "Assemble with galvanized screws",
      "Install hinged front for cleaning access",
      "Apply natural wood finish if desired",
      "Attach mounting hardware",
    ],
    safetyTips: ["Use proper ventilation when finishing", "Test hinges before installation", "Ensure drainage works"],
  },
]

export function EducationalContent() {
  return (
    <div className="space-y-8">
      <Tabs defaultValue="nest-boxes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nest-boxes">What Are Nest Boxes</TabsTrigger>
          <TabsTrigger value="building">Build a Nest Box</TabsTrigger>
          <TabsTrigger value="birds">Bird Guide</TabsTrigger>
        </TabsList>

        {/* What Are Nest Boxes Section */}
        <TabsContent value="nest-boxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Home className="h-5 w-5" />
                What Are Nest Boxes?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Nest boxes provide safe nesting sites for Sharon's cavity-nesting birds. With development reducing
                  natural tree cavities, these artificial homes help maintain healthy bird populations in our community.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {nestBoxTypes.map((type) => (
                    <Card key={type.id} className="border-border/20">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0">
                            {type.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-serif text-lg font-semibold mb-2 text-foreground">{type.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{type.description}</p>

                            <div className="space-y-2">
                              <div>
                                <h4 className="text-sm font-medium mb-1 text-foreground">Perfect for:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {type.species.map((species) => (
                                    <Badge key={species} variant="secondary" className="text-xs">
                                      {species}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium mb-1 text-foreground">Features:</h4>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {type.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3 text-primary" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build a Nest Box Section */}
        <TabsContent value="building" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Hammer className="h-5 w-5" />
                Build a Nest Box
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Follow these essential steps to build safe, effective nest boxes for Sharon's birds. Always
                    prioritize safety and use bird-safe materials.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      CAD Plans
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      PDF Guide
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {buildingSteps.map((step) => (
                    <Card key={step.step} className="border-border/20">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-serif text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                            <p className="text-muted-foreground mb-4">{step.description}</p>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2 text-foreground">Key Steps:</h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                  {step.details.map((detail, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                      {detail}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2 text-foreground">Safety Tips:</h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                  {step.safetyTips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <Info className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bird Guide Section */}
        <TabsContent value="birds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bird className="h-5 w-5" />
                Common Birds in Sharon, MA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                These five species are the most common nest box users in Sharon. Learn to identify them and understand
                their specific needs.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharonMABirds.map((bird) => (
                  <Dialog key={bird.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow border-border/20">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-muted/30 rounded-lg mb-3 overflow-hidden">
                            <img
                              src={bird.image || "/placeholder.svg"}
                              alt={bird.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold text-sm mb-1 text-foreground">{bird.name}</h3>
                          <p className="text-xs text-muted-foreground italic mb-2">{bird.scientificName}</p>
                          <Badge variant="secondary" className="text-xs">
                            {bird.conservationStatus}
                          </Badge>
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                          {bird.name}
                          <Badge variant="secondary">{bird.conservationStatus}</Badge>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div className="aspect-video bg-muted/30 rounded-lg overflow-hidden">
                          <img
                            src={bird.image || "/placeholder.svg"}
                            alt={bird.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2 text-foreground">Description</h4>
                              <p className="text-sm text-muted-foreground">{bird.description}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 text-foreground">Nesting Habits</h4>
                              <p className="text-sm text-muted-foreground">{bird.nestingHabits}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 text-foreground">Seasonal Behavior</h4>
                              <p className="text-sm text-muted-foreground">{bird.seasonalBehavior}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 text-foreground">Where to Find in Sharon</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {bird.sharonLocations.map((location, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-primary" />
                                    {location}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                                <Volume2 className="h-4 w-4" />
                                Bird Call
                              </h4>
                              <Button variant="outline" size="sm" className="w-full bg-transparent">
                                <Play className="h-4 w-4 mr-2" />
                                Play Call
                              </Button>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 text-foreground">Nest Box Specifications</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Hole Size:</span>
                                  <span className="text-foreground">{bird.nestBoxSpecs.holeSize}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Floor Size:</span>
                                  <span className="text-foreground">{bird.nestBoxSpecs.floorSize}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Height:</span>
                                  <span className="text-foreground">{bird.nestBoxSpecs.height}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Mounting:</span>
                                  <span className="text-foreground">{bird.nestBoxSpecs.mounting}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
