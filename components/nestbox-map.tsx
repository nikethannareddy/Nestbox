"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from "@/lib/supabase/client"
import type { NestBox } from "@/lib/types/database"
import { Loader2 } from "lucide-react"

interface NestBoxMapProps {
  initialCenter?: [number, number]
  initialZoom?: number
  highlightNestBoxId?: string
  onError?: (error: Error) => void
}

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
}

const NestBoxMap = ({ 
  initialCenter, 
  initialZoom = 13, 
  highlightNestBoxId,
  onError
}: NestBoxMapProps) => {
  console.log('NestBoxMap rendering with:', { initialCenter, initialZoom, highlightNestBoxId })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nestBoxes, setNestBoxes] = useState<NestBox[]>([])
  const [selectedNestBox, setSelectedNestBox] = useState<NestBox | null>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const supabase = createClient()

  // Initialize map when container is available
  const initializeMap = useCallback((container: HTMLDivElement) => {
    console.log('Initializing map with container:', container)
    if (!window.google?.maps) {
      const errorMsg = 'Google Maps API is not loaded'
      console.error(errorMsg)
      setError(errorMsg)
      if (onError) onError(new Error(errorMsg))
      return
    }

    try {
      const center = initialCenter ? 
        { lat: initialCenter[0], lng: initialCenter[1] } : 
        { lat: 42.3601, lng: -71.0589 } // Default to Boston

      const map = new window.google.maps.Map(container, {
        center,
        zoom: initialZoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      mapInstance.current = map
      console.log('Map instance created successfully')

      // Add click listener to close info window when clicking on the map
      map.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close()
        }
      })

      // Load nest boxes after map is initialized
      loadNestBoxes()

      // Clean up
      return () => {
        console.log('Cleaning up map...')
        if (mapInstance.current) {
          window.google.maps.event.clearInstanceListeners(mapInstance.current)
        }
        markersRef.current.forEach(marker => marker.setMap(null))
        markersRef.current = []
      }
    } catch (err) {
      console.error('Error initializing map:', err)
      const errorMsg = 'Failed to initialize the map. Please try again.'
      setError(errorMsg)
      if (onError) onError(new Error(errorMsg))
    }
  }, [initialCenter, initialZoom, onError])

  // Set up the container ref
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node
      initializeMap(node)
    }
  }, [initializeMap])

  // Load nest boxes data
  const loadNestBoxes = useCallback(async () => {
    console.log('Loading nest boxes...')
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('nest_boxes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Loaded nest boxes:', data?.length || 0)
      setNestBoxes(data || [])
      
      if (highlightNestBoxId && data) {
        const highlightedBox = data.find(box => box.id === highlightNestBoxId)
        console.log('Highlighted box:', highlightedBox)
        if (highlightedBox) {
          setSelectedNestBox(highlightedBox)
          if (mapInstance.current) {
            mapInstance.current.setCenter({ 
              lat: highlightedBox.latitude, 
              lng: highlightedBox.longitude 
            })
            mapInstance.current.setZoom(16)
          }
        }
      }
    } catch (err) {
      console.error('Error loading nest boxes:', err)
      const errorMessage = 'Failed to load nest boxes. Please try again later.'
      setError(errorMessage)
      if (onError) onError(new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [highlightNestBoxId, onError, supabase])

  // Update markers when nest boxes change
  useEffect(() => {
    if (!mapInstance.current || !window.google?.maps) return

    console.log('Updating markers...')
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    const newMarkers = nestBoxes.map(nestBox => {
      const marker = new window.google.maps.Marker({
        position: { lat: nestBox.latitude, lng: nestBox.longitude },
        map: mapInstance.current,
        title: `Nest Box ${nestBox.id.slice(0, 8)}`,
        icon: {
          url: getMarkerIcon(nestBox.status),
          scaledSize: new window.google.maps.Size(32, 32),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(16, 32)
        }
      })

      // Add click listener
      marker.addListener('click', () => {
        setSelectedNestBox(nestBox)
        
        // Close any open info window
        if (infoWindowRef.current) {
          infoWindowRef.current.close()
        }

        // Create and open new info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold">Nest Box ${nestBox.id.slice(0, 8)}</h3>
              <p>Status: ${statusLabels[nestBox.status as keyof typeof statusLabels] || nestBox.status}</p>
              <p>Type: ${nestBox.type || 'N/A'}</p>
              <p>Last Checked: ${nestBox.last_checked ? new Date(nestBox.last_checked).toLocaleDateString() : 'N/A'}</p>
            </div>
          `
        })

        infoWindow.open(mapInstance.current, marker)
        infoWindowRef.current = infoWindow
      })

      return marker
    })

    markersRef.current = newMarkers
    console.log(`Added ${newMarkers.length} markers to the map`)

    // Cleanup function
    return () => {
      console.log('Cleaning up markers...')
      newMarkers.forEach(marker => marker.setMap(null))
    }
  }, [nestBoxes])

  // Handle selected nest box changes
  useEffect(() => {
    if (!selectedNestBox || !mapInstance.current) return

    console.log('Selected nest box changed:', selectedNestBox.id)
    
    // Pan to selected nest box
    mapInstance.current.panTo({
      lat: selectedNestBox.latitude,
      lng: selectedNestBox.longitude
    })
  }, [selectedNestBox])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Error loading map</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={setContainerRef}
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  )
}

// Helper function to get marker icon
const getMarkerIcon = (status: string): string => {
  const color = statusColors[status as keyof typeof statusColors] || 'gray'
  // Return a base64 encoded SVG for the marker
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-6 h-6">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
    </svg>
  `)}`
}

export { NestBoxMap }
