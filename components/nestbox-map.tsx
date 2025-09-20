"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
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

const debounce = (fn: any, delay: number) => {
  let timeoutId: any;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export function NestBoxMap({ initialCenter, initialZoom = 13, highlightNestBoxId }: NestBoxMapProps) {
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<NestBoxStatus>("active")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>(
    initialCenter ? { lat: initialCenter[0], lng: initialCenter[1] } : { lat: 0, lng: 0 }
  )
  const [zoom, setZoom] = useState(initialZoom)
  const [highlightedBox, setHighlightedBox] = useState<string | null>(highlightNestBoxId || null)
  const [isMounted, setIsMounted] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Track if we've already fetched data
  const hasFetched = useRef(false)

  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

  // Fetch nest boxes
  const fetchNestBoxes = useCallback(async () => {
    if (hasFetched.current) return
    
    try {
      setLoading(true)
      setError(null)
      
      const client = createClient()
      
      const { data, error: fetchError } = await client
        .from("nest_boxes")
        .select('*')
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      
      if (!isMounted) return
      
      setNestBoxes(data || [])

      // Set initial location
      if (initialCenter) {
        setCurrentLocation({ lat: initialCenter[0], lng: initialCenter[1] })
      } else if (data?.[0]) {
        const firstBox = data[0]
        setCurrentLocation({ lat: firstBox.latitude, lng: firstBox.longitude })
      }
    } catch (err) {
      console.error("Error fetching nest boxes:", err)
      if (isMounted) {
        setError("Failed to load nest boxes. Please try again.")
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [initialCenter, isMounted])

  // Initial data fetch
  useEffect(() => {
    if (isMounted && !hasFetched.current) {
      hasFetched.current = true
      fetchNestBoxes()
    }
  }, [isMounted, fetchNestBoxes])

  // Handle nest box highlighting
  useEffect(() => {
    if (highlightNestBoxId && nestBoxes.length > 0) {
      setHighlightedBox(highlightNestBoxId)
      const box = nestBoxes.find((box) => box.id === highlightNestBoxId)
      if (box) {
        setCurrentLocation({ lat: box.latitude, lng: box.longitude })
        setZoom(18)
      }
    }
  }, [highlightNestBoxId, nestBoxes])

  // Filter and process nest boxes
  const filteredBoxes = useMemo(() => {
    if (!nestBoxes || nestBoxes.length === 0) return []
    
    return nestBoxes
      .filter((box) => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          !searchLower ||
          box.name?.toLowerCase().includes(searchLower) ||
          box.qr_code?.toLowerCase().includes(searchLower) ||
          (box.target_species?.some(s => s.toLowerCase().includes(searchLower)))

        const matchesStatus = statusFilter === "active" || box.status === statusFilter
        const matchesSpecies =
          speciesFilter === "all" || 
          (box.target_species?.includes(speciesFilter))

        return matchesSearch && matchesStatus && matchesSpecies
      })
      .map(box => ({
        position: { lat: box.latitude, lng: box.longitude },
        title: box.name || `Nest Box ${box.qr_code}`,
        status: box.status,
        id: box.id,
        icon: {
          url: getMarkerIcon(box.status),
          scaledSize: { width: 32, height: 32 }
        }
      }))
  }, [nestBoxes, searchTerm, statusFilter, speciesFilter])

  // Handle marker click
  const handleMarkerClick = useCallback((marker: any, index: number) => {
    const box = filteredBoxes[index]
    if (box) {
      setHighlightedBox(box.id)
      setCurrentLocation(box.position)
      setZoom(18)
    }
  }, [filteredBoxes])

  // Handle map click
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    // Clear selection when clicking on the map
    setHighlightedBox(null)
  }, [])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchNestBoxes} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading map data...</p>
        </div>
      </div>
    )
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
              {nestBoxes.flatMap((box) => box.target_species || []).filter((species): species is string => species !== null && species !== undefined).map((species) => (
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
            <p className="text-gray-500">No location data available</p>
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
              No nest boxes found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
