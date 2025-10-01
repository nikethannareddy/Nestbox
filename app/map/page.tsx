"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { NestBoxMap } from "@/components/nestbox-map"
import Link from 'next/link'
import Script from 'next/script'

export default function MapPage() {
  const searchParams = useSearchParams()
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Get the nest box location from URL parameters
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const nestBoxId = searchParams.get('nestBoxId')

  // Handle script load errors
  const handleScriptError = () => {
    const errorMsg = 'Failed to load Google Maps API. Please check your API key and network connection.'
    console.error(errorMsg)
    setMapError(errorMsg)
  }

  // This effect will run when the component mounts or when the URL parameters change
  useEffect(() => {
    console.log('MapPage mounted with params:', { lat, lng, nestBoxId })
    
    // Log when Google Maps API is loaded
    const checkGoogleMaps = setInterval(() => {
      if (window.google?.maps) {
        console.log('Google Maps API is loaded:', window.google.maps)
        clearInterval(checkGoogleMaps)
      }
    }, 500)

    return () => clearInterval(checkGoogleMaps)
  }, [lat, lng, nestBoxId])

  return (
    <>
      {/* Google Maps API Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onError={handleScriptError}
      />
      
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
          <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
            {mapError ? (
              <div className="h-full flex items-center justify-center bg-red-50 text-red-600 p-4 text-center">
                <div>
                  <p className="font-medium">Error loading map</p>
                  <p className="text-sm mt-2">{mapError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <NestBoxMap 
                initialCenter={lat && lng ? [parseFloat(lat), parseFloat(lng)] : undefined}
                initialZoom={nestBoxId ? 18 : 13}
                highlightNestBoxId={nestBoxId || undefined}
                onError={(error) => {
                  console.error('NestBoxMap error:', error)
                  setMapError(error.message || 'Failed to load the map. Please try again.')
                }}
              />
            )}
          </div>
        </main>
      </div>
    </>
  )
}
