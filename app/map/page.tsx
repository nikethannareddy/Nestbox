import MapComponent from '@/components/map/MapComponent';

export default function MapPage() {
  // Example markers - replace with your actual nest box locations
  const nestBoxMarkers = [
    {
      position: { lat: 40.7128, lng: -74.0060 },
      title: 'Nest Box #1',
    },
    {
      position: { lat: 40.7209, lng: -74.0007 },
      title: 'Nest Box #2',
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Nest Box Locations</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <MapComponent 
          center={{ lat: 40.7128, lng: -74.0060 }}
          zoom={13}
          markers={nestBoxMarkers}
          className="h-[600px] w-full rounded-lg border"
        />
      </div>
    </div>
  );
}
