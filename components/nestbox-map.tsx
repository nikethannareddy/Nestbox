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
import { MapComponent } from "@/components/map/MapComponent"

const statusColors = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  maintenance: "bg-red-500",
  maintenance_needed: "bg-yellow-500",
  removed: "bg-gray-600",
  retired: "bg-gray-600",
}

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  maintenance: "Maintenance",
  maintenance_needed: "Needs Maintenance",
  removed: "Removed",
  retired: "Retired",
} as const;

type NestBoxStatus = keyof typeof statusLabels;

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

const getMarkerIcon = (status: string): string => {
  const basePath = '/markers/';
  
  switch (status) {
    case 'active':
      return `${basePath}nestbox-active.png`;
    case 'inactive':
      return `${basePath}nestbox-inactive.png`;
    case 'maintenance_needed':
      return `${basePath}nestbox-maintenance.png`;
    case 'removed':
      return `${basePath}nestbox-removed.png`;
    default:
      return `${basePath}nestbox-default.png`;
  }
};

export function NestBoxMap({ initialCenter, initialZoom = 13, highlightNestBoxId }: NestBoxMapProps) {
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<NestBoxStatus>("active")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    initialCenter ? { lat: initialCenter[0], lng: initialCenter[1] } : null
  )
  const [zoom, setZoom] = useState(initialZoom)
  const [highlightedBox, setHighlightedBox] = useState<string | null>(highlightNestBoxId || null)

  const uniqueSpecies = useMemo(() => {
    if (!nestBoxes || nestBoxes.length === 0) return []
    const species = nestBoxes
      .flatMap((box) => box.target_species || [])
      .filter((species): species is string => species !== null && species !== undefined)
    return [...new Set(species)]
  }, [nestBoxes])

  const filteredBoxes = useMemo(() => {
    if (!nestBoxes || nestBoxes.length === 0) return []
    return nestBoxes
      .filter((box) => {
        const matchesSearch =
          box.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          box.qr_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (box.target_species && box.target_species.join(", ").toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatus = statusFilter === "active" || box.status === statusFilter
        const matchesSpecies =
          speciesFilter === "all" || (box.target_species && box.target_species.includes(speciesFilter))

        return matchesSearch && matchesStatus && matchesSpecies
      })
      .map(box => ({
        position: { lat: box.latitude, lng: box.longitude },
        title: box.name || `Nest Box ${box.qr_code}`,
        status: box.status,
        id: box.id,
        icon: {
          url: getMarkerIcon(box.status),
          scaledSize: typeof window !== 'undefined' && window.google?.maps ? new window.google.maps.Size(32, 32) : { width: 32, height: 32 }
        }
      }))
  }, [nestBoxes, searchTerm, statusFilter, speciesFilter])

  const handleMarkerClick = (marker: any, index: number) => {
    const box = filteredBoxes[index];
    if (box) {
      setHighlightedBox(box.id);
      // You can add additional logic here, like showing an info window
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    // Handle map click if needed
    console.log('Map clicked at:', e.latLng?.toJSON());
  };

  useEffect(() => {
    fetchNestBoxes()
  }, [])

  useEffect(() => {
    if (highlightNestBoxId) {
      setHighlightedBox(highlightNestBoxId)
      // Center map on the highlighted nest box
      const box = nestBoxes.find((box) => box.id === highlightNestBoxId)
      if (box) {
        setCurrentLocation({ lat: box.latitude, lng: box.longitude })
        setZoom(18)
      }
    }
  }, [highlightNestBoxId, nestBoxes])

  const fetchNestBoxes = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching nest boxes from database")
      const client = await createClient()
      const { data, error } = await client.from("nest_boxes").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Database error:", error)
        throw error
      }

      console.log("[v0] Fetched nest boxes:", data)
      setNestBoxes(data || [])

      // If we have an initial center from QR code, use that
      if (initialCenter) {
        setCurrentLocation({ lat: initialCenter[0], lng: initialCenter[1] })
      } else if (data?.length > 0) {
        // Otherwise center on the first nest box
        const firstBox = data[0]
        setCurrentLocation({ lat: firstBox.latitude, lng: firstBox.longitude })
      }
    } catch (err) {
      console.error("[v0] Error fetching nest boxes:", err)
      setError("Failed to load nest boxes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and filter controls */}
      <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search nest boxes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as NestBoxStatus)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Species" />
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
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-lg overflow-hidden border border-gray-200">
        {currentLocation ? (
          <MapComponent
            center={currentLocation}
            zoom={zoom}
            markers={filteredBoxes.map(box => ({
              ...box,
              icon: box.icon.url
            }))}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            className="h-full w-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                <p className="text-gray-500">Loading map...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-500 mb-2">Error loading map</p>
                <Button variant="outline" onClick={fetchNestBoxes}>
                  Retry
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">No location data available</p>
            )}
          </div>
        )}
      </div>

      {/* Nest boxes list */}
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Nest Boxes ({filteredBoxes.length})</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredBoxes.length > 0 ? (
            filteredBoxes.map((box, index) => (
              <div
                key={box.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  highlightedBox === box.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleMarkerClick(null, index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: statusColors[box.status as keyof typeof statusColors] || '#999' }}
                    />
                    <span className="font-medium">{box.title}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {box.status ? statusLabels[box.status as keyof typeof statusLabels] : 'Unknown'}
                  </div>
                </div>
                {(box as any).target_species && (box as any).target_species.length > 0 && (
                  <div className="mt-1 text-sm text-gray-500">
                    {(box as any).target_species.join(', ')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              {loading ? 'Loading...' : 'No nest boxes found'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
