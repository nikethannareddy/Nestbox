'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppHeader } from "@/components/layout/header"
import { NestBoxMap } from "@/components/nestbox-map"
import { Button } from "@/components/ui/button"

export default function MapPage() {
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Get the nest box location from URL parameters
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const nestBoxId = searchParams.get('nestBoxId')
  
  // Default to a reasonable center if no coordinates provided
  const defaultCenter: [number, number] = [39.9526, -75.1652] // Default to Philadelphia
  const initialCenter = lat && lng ? [parseFloat(lat), parseFloat(lng)] : defaultCenter

  useEffect(() => {
    setIsClient(true)
    
    // Set a timeout to handle cases where the map fails to load
    const timer = setTimeout(() => {
      if (document.readyState === 'complete' && !document.querySelector('.map-container')) {
        setMapError('Map is taking longer than expected to load. Please try refreshing the page.')
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timer)
  }, [lat, lng, nestBoxId])

  // Only render on client-side to avoid hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Map Loading Issue</h2>
          <p className="text-gray-600 mb-6">{mapError}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="h-[calc(100vh-64px)] w-full">
        <NestBoxMap 
          initialCenter={initialCenter} 
          highlightNestBoxId={nestBoxId || undefined}
        />
      </div>
    </div>
  )
}
