"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { NestBoxMap } from "@/components/nestbox-map"
import { AppHeader } from "@/components/layout/header"

export default function MapPage() {
  const searchParams = useSearchParams()
  
  // Get the nest box location from URL parameters
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const nestBoxId = searchParams.get('nestBoxId')

  // This effect will run when the component mounts or when the URL parameters change
  useEffect(() => {
    if (lat && lng && nestBoxId) {
      // The map will handle centering on the coordinates
      // The actual implementation depends on your map component
      console.log(`Navigated to nest box ${nestBoxId} at (${lat}, ${lng})`)
    }
  }, [lat, lng, nestBoxId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <NestBoxMap 
          initialCenter={lat && lng ? [parseFloat(lat), parseFloat(lng)] : undefined}
          initialZoom={nestBoxId ? 18 : undefined}
          highlightNestBoxId={nestBoxId || undefined}
        />
      </main>
    </div>
  )
}
