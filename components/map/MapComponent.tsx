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
    icon?: string;
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

export default function MapComponent({
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
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Load the Google Maps API key from environment variables
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.error('Google Maps API key is not set. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
      return;
    }
    setApiKey(key);
  }, []);

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    let isMounted = true;

    const initMap = async () => {
      try {
        const google = await loader.load();
        
        if (!isMounted || !mapRef.current) return;

        // Create the map instance
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        mapInstance.current = map;
        setMapLoaded(true);

        // Add click event listener if provided
        if (onMapClick) {
          map.addListener('click', onMapClick);
        }

        // Clean up function
        return () => {
          if (mapInstance.current) {
            google.maps.event.clearInstanceListeners(map);
          }
        };
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      // Clean up markers
      mapMarkers.current.forEach(marker => marker.setMap(null));
      mapMarkers.current = [];
    };
  }, [apiKey, center.lat, center.lng, zoom, onMapClick]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;

    // Clear existing markers
    mapMarkers.current.forEach(marker => marker.setMap(null));
    mapMarkers.current = [];

    // Add new markers
    markers.forEach((markerData, index) => {
      if (!mapInstance.current) return;

      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map: mapInstance.current,
        title: markerData.title || '',
        icon: markerData.icon || undefined,
      });

      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(marker, index));
      }

      mapMarkers.current.push(marker);
    });
  }, [markers, mapLoaded, onMarkerClick]);

  // Update center when it changes
  useEffect(() => {
    if (mapInstance.current && mapLoaded) {
      mapInstance.current.setCenter(center);
    }
  }, [center.lat, center.lng, mapLoaded]);

  // Update zoom when it changes
  useEffect(() => {
    if (mapInstance.current && mapLoaded) {
      mapInstance.current.setZoom(zoom);
    }
  }, [zoom, mapLoaded]);

  return (
    <div className={className} ref={mapRef}>
      {!apiKey && (
        <div className="flex h-full items-center justify-center bg-gray-100">
          <p>Google Maps API key is not configured.</p>
        </div>
      )}
      {apiKey && !mapLoaded && (
        <div className="flex h-full items-center justify-center bg-gray-100">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
}
