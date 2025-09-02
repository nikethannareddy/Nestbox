"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, Navigation, Loader2 } from "lucide-react"
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

const maintenanceStatusColors = {
  excellent: "bg-green-500",
  good: "bg-blue-500",
  "needs-cleaning": "bg-yellow-500",
  "needs-repair": "bg-red-500",
  critical: "bg-red-700",
}

interface NestBoxMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  highlightNestBoxId?: string;
}

export function NestBoxMap({ 
  initialCenter,
  initialZoom = 13,
  highlightNestBoxId
}: NestBoxMapProps) {
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(
    initialCenter || null
  )
  const [zoom, setZoom] = useState(initialZoom)
  const [highlightedBox, setHighlightedBox] = useState<string | null>(highlightNestBoxId || null)
  const mapRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchNestBoxes()
    
    // Initialize map here (pseudo-code, replace with your actual map implementation)
    // const map = initializeMap(mapRef.current, {
    //   center: initialCenter || [defaultLat, defaultLng],
    //   zoom: initialZoom
    // })
    
    // if (highlightNestBoxId) {
    //   highlightNestBox(highlightNestBoxId)
    // }
  }, [highlightNestBoxId])

  useEffect(() => {
    if (highlightNestBoxId) {
      setHighlightedBox(highlightNestBoxId)
      // Center map on the highlighted nest box
      const box = nestBoxes.find(box => box.id === highlightNestBoxId)
      if (box) {
        setCurrentLocation([box.latitude, box.longitude])
        setZoom(18)
      }
    }
  }, [highlightNestBoxId, nestBoxes])

  const fetchNestBoxes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('nest_boxes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setNestBoxes(data || [])
      
      // If we have an initial center from QR code, use that
      if (initialCenter) {
        setCurrentLocation(initialCenter)
      } else if (data?.length > 0) {
        // Otherwise center on the first nest box
        const firstBox = data[0]
        setCurrentLocation([firstBox.latitude, firstBox.longitude])
      }
      
    } catch (err) {
      console.error('Error fetching nest boxes:', err)
      setError('Failed to load nest boxes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Rest of the component remains the same...
  // [Previous implementation continues...]
  
  // Add this new method to handle highlighting a specific nest box
  const highlightNestBox = (boxId: string) => {
    const box = nestBoxes.find(b => b.id === boxId)
    if (box) {
      setHighlightedBox(boxId)
      setCurrentLocation([box.latitude, box.longitude])
      setZoom(18)
      
      // Scroll to the nest box in the list if it exists
      const element = document.getElementById(`nest-box-${boxId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add a temporary highlight class
        element.classList.add('ring-2', 'ring-emerald-500')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-emerald-500')
        }, 3000)
      }
    }
  }

  // Update the JSX to include the highlighted state for nest boxes
  const renderNestBoxes = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-emerald-800">Loading nest boxes...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-600">
          {error}
          <Button 
            onClick={fetchNestBoxes}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )
    }

    const filteredBoxes = nestBoxes.filter(box => {
      const matchesSearch = box.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          box.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (box.target_species && box.target_species.join(", ").toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || box.status === statusFilter
      const matchesSpecies = speciesFilter === 'all' || box.target_species.includes(speciesFilter)

      return matchesSearch && matchesStatus && matchesSpecies
    })

    if (filteredBoxes.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No nest boxes found. Try adjusting your filters.
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {filteredBoxes.map(box => (
          <div 
            key={box.id}
            id={`nest-box-${box.id}`}
            className={`p-4 border rounded-lg transition-all duration-200 ${
              highlightedBox === box.id 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-lg">{box.name}</h4>
                <p className="text-xs text-gray-600">ID: {box.qr_code}</p>
                <div className="flex items-center mt-2">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    statusColors[box.status as keyof typeof statusColors] || 'bg-gray-300'
                  }`}></span>
                  <span className="text-sm text-gray-700">
                    {statusLabels[box.status as keyof typeof statusLabels] || box.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[box.status]}`}></div>
                <div
                  className={`w-3 h-3 rounded-full ${maintenanceStatusColors[box.maintenance_status || "good"]}`}
                ></div>
              </div>
            </div>

            <div className="space-y-1 text-xs mb-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="text-right text-xs">{`${box.latitude}, ${box.longitude}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Species:</span>
                <span>{box.target_species.join(", ") || "Various"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary" className="text-xs">
                  {statusLabels[box.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sponsor:</span>
                <span className="text-right text-xs">{getSponsorName(box)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/box/${box.qr_code}`} className="flex-1">
                <Button size="sm" className="w-full text-xs bg-amber-600 hover:bg-amber-700">
                  View Details
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/80"
                onClick={(e) => {
                  e.preventDefault()
                  openGoogleMaps(box)
                }}
              >
                <Navigation className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const openGoogleMaps = (box: NestBox) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${box.latitude},${box.longitude}`
    window.open(url, "_blank")
  }

  const getLastActivity = (box: NestBox) => {
    // This would typically come from a join with activity_logs
    // For now, we'll use the updated_at timestamp
    return new Date(box.updated_at).toLocaleDateString()
  }

  const getSponsorName = (box: NestBox & { sponsor?: any }) => {
    if (box.sponsor_dedication) return box.sponsor_dedication
    if (box.sponsor?.full_name) return box.sponsor.full_name
    return "Community Sponsored"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading nest boxes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchNestBoxes} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            NestBox Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, species, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                {uniqueSpecies.map((species) => (
                  <SelectItem key={species} value={species}>
                    {species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Active ({nestBoxes.filter((b) => b.status === "active").length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Inactive ({nestBoxes.filter((b) => b.status === "inactive").length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Maintenance ({nestBoxes.filter((b) => b.status === "maintenance").length})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder and Results */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card className="h-96 lg:h-[600px]">
            <CardContent className="p-0 h-full">
              <div className="h-full bg-muted/30 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-50"></div>
                <div className="text-center z-10">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">Google Maps Integration</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Interactive map showing {filteredBoxes.length} nest boxes with clickable markers
                  </p>
                </div>

                {filteredBoxes.slice(0, 4).map((box, index) => {
                  const positions = [
                    { top: "20%", left: "20%" },
                    { top: "30%", right: "24%" },
                    { bottom: "24%", left: "32%" },
                    { bottom: "32%", right: "20%" },
                  ]
                  const position = positions[index] || positions[0]

                  return (
                    <Link key={box.id} href={`/box/${box.qr_code}`}>
                      <div
                        className="absolute cursor-pointer hover:scale-110 transition-transform group"
                        style={position}
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${statusColors[box.status]} border-2 border-white shadow-lg`}
                        ></div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {box.name}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nest Box List */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-semibold">Nest Boxes ({filteredBoxes.length})</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {renderNestBoxes()}
          </div>
        </div>
      </div>
    </div>
  )
}

const uniqueSpecies = useMemo(() => {
  const species = nestBoxes
    .flatMap((box) => box.target_species)
    .filter((species): species is string => species !== null)
  return [...new Set(species)]
}, [nestBoxes])
