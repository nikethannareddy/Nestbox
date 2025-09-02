"use client"

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { NestBoxMap } from "@/components/nestbox-map"
import Link from 'next/link'

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
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-emerald-900">
                {nestBoxId ? 'Nest Box Location' : 'Explore NestBox'}
              </h1>
              <p className="text-sm text-emerald-700">
                {nestBoxId 
                  ? `Viewing nest box ${nestBoxId.slice(0, 8)}` 
                  : 'Discover and monitor nest boxes in your community'}
              </p>
            </div>
            <Link 
              href="/" 
              className="text-emerald-600 hover:text-emerald-800 transition-colors flex items-center"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

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
