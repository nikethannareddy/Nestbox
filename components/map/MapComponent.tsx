"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapComponentProps {
  center: {
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
    icon?: google.maps.Symbol | google.maps.Icon | string;
    [key: string]: any;
  }>;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (marker: google.maps.Marker, index: number) => void;
  className?: string;
}

declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

export function MapComponent({
  center,
  zoom = 12,
  markers = [],
  onMapClick,
  onMarkerClick,
  className = 'h-[400px] w-full',
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const mapMarkers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is not configured');
      return;
    }

    if (!mapRef.current) return;

    const loadMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places"],
        });

        await loader.load();

        if (!mapRef.current) return;

        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeId: 'terrain',
          disableDefaultUI: true,
          zoomControl: true,
        });

        // Add click handler if provided
        if (onMapClick) {
          mapInstance.current.addListener('click', onMapClick);
        }

        setMapLoaded(true);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please try again later.');
      }
    };

    loadMap();

    return () => {
      // Clean up event listeners
      if (mapInstance.current && onMapClick) {
        window.google.maps.event.clearInstanceListeners(mapInstance.current);
      }
    };
  }, [apiKey, center.lat, center.lng, zoom, onMapClick]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;

    // Clear existing markers
    mapMarkers.current.forEach(marker => marker.setMap(null));
    mapMarkers.current = [];

    // Add new markers
    markers.forEach((marker, index) => {
      const mapMarker = new window.google.maps.Marker({
        position: marker.position,
        map: mapInstance.current,
        title: marker.title,
        icon: marker.icon,
      });

      if (onMarkerClick) {
        mapMarker.addListener('click', () => onMarkerClick(mapMarker, index));
      }

      mapMarkers.current.push(mapMarker);
    });

    // Fit bounds if markers exist
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(marker => bounds.extend(marker.position));
      mapInstance.current.fitBounds(bounds);
    }
  }, [markers, mapLoaded, onMarkerClick]);

  // Update center when it changes
  useEffect(() => {
    if (mapInstance.current && mapLoaded) {
      mapInstance.current.setCenter(center);
    }
  }, [center, mapLoaded]);

  // Update zoom when it changes
  useEffect(() => {
    if (mapInstance.current && mapLoaded) {
      mapInstance.current.setZoom(zoom);
    }
  }, [zoom, mapLoaded]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-gray-600">Please check your Google Maps API key configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} ref={mapRef}>
      {!mapLoaded && (
        <div className="h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
