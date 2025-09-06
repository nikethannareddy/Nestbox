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
  initialCenter?: [number, number]
  initialZoom?: number
  highlightNestBoxId?: string
}

export function NestBoxMap({ initialCenter, initialZoom = 13, highlightNestBoxId }: NestBoxMapProps) {
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(initialCenter || null)
  const [zoom, setZoom] = useState(initialZoom)
  const [highlightedBox, setHighlightedBox] = useState<string | null>(highlightNestBoxId || null)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any | null>(null)
  const markersRef = useRef<any[]>([])

  const supabase = createClient()

  const uniqueSpecies = useMemo(() => {
    if (!nestBoxes || nestBoxes.length === 0) return []
    const species = nestBoxes
      .flatMap((box) => box.target_species || [])
      .filter((species): species is string => species !== null && species !== undefined)
    return [...new Set(species)]
  }, [nestBoxes])

  const filteredBoxes = useMemo(() => {
    if (!nestBoxes || nestBoxes.length === 0) return []
    return nestBoxes.filter((box) => {
      const matchesSearch =
        box.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        box.qr_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (box.target_species && box.target_species.join(", ").toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || box.status === statusFilter
      const matchesSpecies =
        speciesFilter === "all" || (box.target_species && box.target_species.includes(speciesFilter))

      return matchesSearch && matchesStatus && matchesSpecies
    })
  }, [nestBoxes, searchTerm, statusFilter, speciesFilter])

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
      const box = nestBoxes.find((box) => box.id === highlightNestBoxId)
      if (box) {
        setCurrentLocation([box.latitude, box.longitude])
        setZoom(18)
      }
    }
  }, [highlightNestBoxId, nestBoxes])

  const fetchNestBoxes = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching nest boxes from database")
      const { data, error } = await supabase.from("nest_boxes").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Database error:", error)
        throw error
      }

      console.log("[v0] Fetched nest boxes:", data)
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
      console.error("[v0] Error fetching nest boxes:", err)
      setError("Failed to load nest boxes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const highlightNestBox = (boxId: string) => {
    const box = nestBoxes.find((b) => b.id === boxId)
    if (box) {
      setHighlightedBox(boxId)
      setCurrentLocation([box.latitude, box.longitude])
      setZoom(18)

      // Center map on the highlighted nest box
      if (googleMapRef.current) {
        googleMapRef.current.setCenter({ lat: box.latitude, lng: box.longitude })
        googleMapRef.current.setZoom(18)
      }

      // Scroll to the nest box in the list if it exists
      const element = document.getElementById(`nest-box-${boxId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("ring-2", "ring-emerald-500")
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-emerald-500")
        }, 3000)
      }
    }
  }

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
          <Button onClick={fetchNestBoxes} variant="outline" className="mt-4 bg-transparent">
            Try Again
          </Button>
        </div>
      )
    }

    if (filteredBoxes.length === 0) {
      return <div className="text-center py-12 text-gray-500">No nest boxes found. Try adjusting your filters.</div>
    }

    return (
      <div className="space-y-4">
        {filteredBoxes.map((box) => (
          <div
            key={box.id}
            id={`nest-box-${box.id}`}
            className={`p-4 border rounded-lg transition-all duration-200 ${
              highlightedBox === box.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-emerald-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-lg">{box.name}</h4>
                
                <div className="flex items-center mt-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      statusColors[box.status as keyof typeof statusColors] || "bg-gray-300"
                    }`}
                  ></span>
                  <span className="text-sm text-gray-700">
                    {statusLabels[box.status as keyof typeof statusLabels] || box.status}
                  </span>
                </div>
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
              <Link href={`/box/${box.id}`} className="flex-1">
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

  const initializeGoogleMap = () => {
    if (!mapRef.current || !window.google) return

    const center = currentLocation || [42.3601, -71.0589] // Default to Boston
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: center[0], lng: center[1] },
      zoom: zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    })

    googleMapRef.current = map
    updateMapMarkers()
  }

  const updateMapMarkers = () => {
    if (!googleMapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add markers for filtered nest boxes
    filteredBoxes.forEach((box) => {
      const marker = new window.google.maps.Marker({
        position: { lat: box.latitude, lng: box.longitude },
        map: googleMapRef.current,
        title: box.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getMarkerColor(box.status),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      })

      // Create info window for each marker
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-lg mb-2">${box.name}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Status:</strong> ${statusLabels[box.status as keyof typeof statusLabels] || box.status}</p>
              <p><strong>Species:</strong> ${box.target_species?.join(", ") || "Various"}</p>
              <p><strong>Location:</strong> ${box.latitude.toFixed(6)}, ${box.longitude.toFixed(6)}</p>
              <p><strong>Description:</strong> ${box.description || "No description"}</p>
            </div>
            <div class="mt-3 flex gap-2">
              <a href="/box/${box.id}" class="inline-block px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700">
                View Details
              </a>
              <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${box.latitude},${box.longitude}', '_blank')" 
                      class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                Directions
              </button>
            </div>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(googleMapRef.current, marker)
        setHighlightedBox(box.id)
        highlightNestBox(box.id)
      })

      // Highlight marker if it's the selected one
      if (highlightedBox === box.id) {
        marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        })
        infoWindow.open(googleMapRef.current, marker)
      }

      markersRef.current.push(marker)
    })
  }

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981" // green
      case "inactive":
        return "#9ca3af" // gray
      case "maintenance":
        return "#ef4444" // red
      case "retired":
        return "#6b7280" // dark gray
      default:
        return "#3b82f6" // blue
    }
  }

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeGoogleMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        initializeGoogleMap()
      }
      document.head.appendChild(script)
    }

    if (nestBoxes.length > 0) {
      loadGoogleMaps()
    }
  }, [nestBoxes, currentLocation, zoom])

  useEffect(() => {
    if (googleMapRef.current) {
      updateMapMarkers()
    }
  }, [filteredBoxes, highlightedBox])

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

      {/* Map and Results */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-96 lg:h-[600px]">
            <CardContent className="p-0 h-full">
              <div ref={mapRef} className="h-full w-full rounded-lg" style={{ minHeight: "400px" }} />
            </CardContent>
          </Card>
        </div>

        {/* Nest Box List */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-semibold">Nest Boxes ({filteredBoxes.length})</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">{renderNestBoxes()}</div>
        </div>
      </div>
    </div>
  )
}
