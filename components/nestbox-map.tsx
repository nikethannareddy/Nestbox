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

const NestBoxMap = ({ initialCenter, initialZoom = 13, highlightNestBoxId }: NestBoxMapProps) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [filteredNestBoxes, setFilteredNestBoxes] = useState<NestBox[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedNestBox, setSelectedNestBox] = useState<NestBox | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(initialCenter)
  const [mapZoom, setMapZoom] = useState(initialZoom)
  const mapRef = useRef<google.maps.Map | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const supabase = createClient()

  // Load nest boxes data
  useEffect(() => {
    const loadNestBoxes = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('nest_boxes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setNestBoxes(data || [])
        
        if (highlightNestBoxId && data) {
          const highlightedBox = data.find(box => box.id === highlightNestBoxId)
          if (highlightedBox) {
            setMapCenter([highlightedBox.latitude, highlightedBox.longitude])
            setMapZoom(16)
            setSelectedNestBox(highlightedBox)
          }
        } else if (!initialCenter && data && data.length > 0) {
          setMapCenter([data[0].latitude, data[0].longitude])
        }
      } catch (err) {
        console.error('Error loading nest boxes:', err)
        setError('Failed to load nest boxes. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadNestBoxes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightNestBoxId, supabase])

  // Apply filters when search or status changes
  useEffect(() => {
    let filtered = nestBoxes.filter(box => {
      if (statusFilter !== 'all' && box.status !== statusFilter) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          box.name?.toLowerCase().includes(term) ||
          box.notes?.toLowerCase().includes(term) ||
          box.id.toLowerCase().includes(term)
        )
      }
      return true;
    });
    setFilteredNestBoxes(filtered)
  }, [searchTerm, statusFilter, nestBoxes])

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const handleMarkerClick = useCallback((nestBox: NestBox) => {
    setSelectedNestBox(nestBox)
    if (mapRef.current) {
      mapRef.current.panTo({ lat: nestBox.latitude, lng: nestBox.longitude });
    }
  }, [])

  // Handle info window for selected nest box
  useEffect(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close()
    }

    if (selectedNestBox && mapRef.current) {
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${selectedNestBox.name || `Nest Box ${selectedNestBox.id}`}</h3>
            <p>Status: ${statusLabels[selectedNestBox.status as NestBoxStatus] || 'Unknown'}</p>
            ${selectedNestBox.notes ? `<p>Notes: ${selectedNestBox.notes}</p>` : ''}
            <a href="/nest-boxes/${selectedNestBox.id}" class="text-blue-600 hover:underline">View Details</a>
          </div>
        `,
        position: { lat: selectedNestBox.latitude, lng: selectedNestBox.longitude },
      })

      infoWindow.open(mapRef.current)
      infoWindowRef.current = infoWindow
    }
  }, [selectedNestBox])

  const mapMarkers = useMemo(() => {
    return filteredNestBoxes.map(box => ({
      position: { lat: box.latitude, lng: box.longitude },
      title: box.name || `Nest Box ${box.id}`,
      icon: {
        url: getMarkerIcon(box.status || 'inactive'),
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
      },
    }))
  }, [filteredNestBoxes])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and filter controls */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Search nest boxes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading map data...</p>
            </div>
          </div>
        )}
        {mapCenter && (
          <MapComponent
            center={{ lat: mapCenter[0], lng: mapCenter[1] }}
            zoom={mapZoom}
            onLoad={handleMapLoad}
            markers={mapMarkers}
            onMarkerClick={(_, index) => handleMarkerClick(filteredNestBoxes[index])}
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  )
}

export { NestBoxMap }
