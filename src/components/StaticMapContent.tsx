"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface StaticMapContentProps {
    latitude: number;
    longitude: number;
    title?: string;
    className?: string;
    height?: string;
}

export default function StaticMapContent({
    latitude,
    longitude,
    title = "Location",
    className = "",
    height = "300px",
}: StaticMapContentProps) {
    const position: LatLngExpression = [latitude, longitude];

    return (
        <div className={`relative rounded-lg overflow-hidden border border-gray-300 ${className}`}>
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
                                <p className="font-semibold mb-1">{title}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}
