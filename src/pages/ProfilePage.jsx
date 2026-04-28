import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapPage() {
  const [dropPoints, setDropPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([3.139, 101.6869]);

  useEffect(() => {
    async function load() {
      const points = await base44.entities.DropPoint.filter({ active: true });
      setDropPoints(points);
      setLoading(false);
    }
    load();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-80px)]">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-4">
        <div className="bg-card/90 backdrop-blur-lg rounded-2xl border border-border p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Drop Points</h1>
              <p className="text-xs text-muted-foreground">{dropPoints.length} active locations</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full">
              <Navigation className="h-3 w-3" />
              Near You
            </div>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {dropPoints.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]} icon={greenIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-semibold text-sm">{point.name}</p>
                <p className="text-xs text-gray-500">{point.address}</p>
                <p className="text-xs mt-1">
                  Capacity: <span className="font-medium capitalize">{point.capacity}</span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Bottom List */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] px-4 pb-4">
        <div className="bg-card/90 backdrop-blur-lg rounded-2xl border border-border p-3 shadow-lg max-h-40 overflow-y-auto">
          <div className="space-y-2">
            {dropPoints.map((point) => (
              <div key={point.id} className="flex items-center gap-2.5 py-1.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{point.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{point.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}