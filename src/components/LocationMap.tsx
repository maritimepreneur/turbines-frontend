"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { Loader2, AlertCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationMapProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  className?: string;
  height?: string;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export default function LocationMap({ 
  onLocationChange, 
  className = "",
  height = "250px" 
}: LocationMapProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reverse geocoding using Nominatim API
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      // Add delay to respect Nominatim rate limit (1 req/sec)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id",
            "User-Agent": "TurbinesApp/1.0", // Nominatim requires User-Agent
          },
        }
      );

      if (!response.ok) {
        console.error("Nominatim API error:", response.status);
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }

      const data = await response.json();
      
      // Check if we got a valid address
      if (data && data.display_name) {
        return data.display_name;
      }
      
      // Try to construct address from address components
      if (data && data.address) {
        const addr = data.address;
        const parts = [
          addr.road || addr.street,
          addr.suburb || addr.neighbourhood,
          addr.city || addr.town || addr.village,
          addr.state,
          addr.country
        ].filter(Boolean);
        
        if (parts.length > 0) {
          return parts.join(", ");
        }
      }
      
      // Fallback to coordinates if no address found
      console.warn("No address found in response:", data);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }, []);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda");
      setLoading(false);
      return;
    }

    const successHandler = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);
      
      const locationData = {
        lat: latitude,
        lng: longitude,
        address,
      };

      setLocation(locationData);
      setLoading(false);
      
      if (onLocationChange) {
        onLocationChange(latitude, longitude, address);
      }
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = "Gagal mendapatkan lokasi";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Izin lokasi ditolak. Mohon aktifkan lokasi di browser.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Informasi lokasi tidak tersedia.";
          break;
        case error.TIMEOUT:
          errorMessage = "Permintaan lokasi timeout.";
          break;
      }
      
      setError(errorMessage);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [reverseGeocode, onLocationChange]);

  if (loading) {
    return (
      <div className={`bg-slate-100 rounded-lg p-6 flex flex-col items-center justify-center ${className}`} style={{ height }}>
        <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
        <p className="text-sm text-slate-600">Mendapatkan lokasi Anda...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center ${className}`} style={{ height }}>
        <AlertCircle className="text-red-500 mb-2" size={32} />
        <p className="text-sm text-red-600 text-center">{error || "Lokasi tidak tersedia"}</p>
      </div>
    );
  }

  const position: LatLngExpression = [location.lat, location.lng];

  return (
    <div className={`relative rounded-lg overflow-hidden border-2 border-blue-200 ${className}`}>
      <div style={{ height }}>
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={true}
          dragging={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">Lokasi Anda</p>
                <p className="text-xs text-slate-600">{location.address}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
