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
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    let map: google.maps.Map | null = null;
    let isMounted = true;

    const initMap = async () => {
      try {
        await loader.load();
        
        if (!isMounted || !mapRef.current) return;
        
        // Clear any existing map instance
        if (mapInstance.current) {
          google.maps.event.clearInstanceListeners(mapInstance.current);
          mapInstance.current = null;
        }

        map = new window.google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        if (onLoad) {
          onLoad(map);
        }

        if (onMapClick) {
          map.addListener('click', onMapClick);
        }

        mapInstance.current = map;
        setIsLoaded(true);
        setMapError(null);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to load Google Maps. Please try again.');
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (map) {
        try {
          // Clear all event listeners
          google.maps.event.clearInstanceListeners(map);
          
          // Remove the map instance
          if (mapRef.current) {
            const mapContainer = mapRef.current;
            if (mapContainer && mapContainer.firstChild) {
              // Remove all child nodes
              while (mapContainer.firstChild) {
                mapContainer.removeChild(mapContainer.firstChild);
              }
            }
          }
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
      }
      markersRef.current = [];
    };
  }, [center.lat, center.lng, zoom, onLoad, onMapClick]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker, index) => {
      const mapMarker = new google.maps.Marker({
        position: marker.position,
        map: mapInstance.current,
        title: marker.title,
        icon: marker.icon,
      });

      if (onMarkerClick) {
        mapMarker.addListener('click', () => {
          onMarkerClick(mapMarker, index);
        });
      }

      markersRef.current.push(mapMarker);
    });
  }, [markers, onMarkerClick]);

  return (
    <div className={className} ref={mapRef}>
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="bg-background p-4 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-medium mb-2">Map Error</h3>
            <p className="mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reload Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};