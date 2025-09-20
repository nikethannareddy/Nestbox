import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapComponentProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    icon?: google.maps.Icon | string;
  }>;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (marker: google.maps.Marker, index: number) => void;
  onLoad?: (map: google.maps.Map) => void;
  className?: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places'],
});

// Export as a named export to match the import in nestbox-map.tsx
export const MapComponent = ({
  center,
  zoom = 12,
  markers = [],
  onMapClick,
  onMarkerClick,
  onLoad,
  className = 'h-full w-full',
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;
    let map: google.maps.Map | null = null;
    let mapContainer: HTMLDivElement | null = null;

    loader.load().then(google => {
      if (!isMounted || !mapRef.current) return;

      // Create a new container for the map
      mapContainer = document.createElement('div');
      mapContainer.style.width = '100%';
      mapContainer.style.height = '100%';
      
      // Clear existing content
      while (mapRef.current.firstChild) {
        mapRef.current.removeChild(mapRef.current.firstChild);
      }
      
      // Add the new container
      mapRef.current.appendChild(mapContainer);

      // Initialize the map
      map = new google.maps.Map(mapContainer, {
        center,
        zoom,
        mapTypeId: 'terrain',
        disableDefaultUI: true,
        zoomControl: true,
      });

      mapInstance.current = map;
      setIsLoaded(true);
      
      if (onLoad) {
        onLoad(map);
      }
    }).catch(err => {
      console.error("Failed to load Google Maps", err);
    });

    return () => {
      isMounted = false;
      
      // Clean up the map instance
      if (map) {
        google.maps.event.clearInstanceListeners(map);
      }
      
      // Clean up the container
      if (mapContainer && mapContainer.parentNode === mapRef.current) {
        mapRef.current?.removeChild(mapContainer);
      }
      
      mapInstance.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setCenter(center);
    }
  }, [center]);

  // Update zoom
  useEffect(() => {
    if (mapInstance.current && zoom) {
      mapInstance.current.setZoom(zoom);
    }
  }, [zoom]);

  // Handle map click
  useEffect(() => {
    if (!mapInstance.current || !onMapClick) return;

    const listener = mapInstance.current.addListener('click', onMapClick);
    return () => google.maps.event.removeListener(listener);
  }, [onMapClick]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current) return;

    // Using a ref to keep track of markers to avoid re-rendering
    const markerInstances: google.maps.Marker[] = [];

    markers.forEach((markerData, index) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstance.current,
        title: markerData.title,
        icon: markerData.icon,
      });

      if (onMarkerClick) {
        marker.addListener('click', () => {
          onMarkerClick(marker, index);
        });
      }
      markerInstances.push(marker);
    });

    return () => {
      markerInstances.forEach(marker => marker.setMap(null));
    };
  }, [markers, onMarkerClick]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <p>Google Maps API key is not configured.</p>
      </div>
    );
  }

  return (
    <div className={className} ref={mapRef}>
      {!isLoaded && (
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