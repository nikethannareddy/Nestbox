"use client";

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapComponentProps {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: Array<{
    position: {
      lat: number;
      lng: number;
    };
    title?: string;
    icon?: string;
  }>;
  className?: string;
}

export default function MapComponent({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to New York
  zoom = 12,
  markers = [],
  className = 'h-[400px] w-full rounded-lg'
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      // Replace with your Google Maps API key
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
      });

      try {
        const google = await loader.load();
        
        // Initialize the map
        if (mapRef.current && !mapInstance.current) {
          mapInstance.current = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });

          // Add markers if any
          markers.forEach((marker) => {
            new google.maps.Marker({
              position: marker.position,
              map: mapInstance.current,
              title: marker.title,
              icon: marker.icon,
            });
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [center, zoom, markers]);

  return <div ref={mapRef} className={className} />;
}
