"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamic import to avoid SSR issues with Leaflet
const DynamicMap = dynamic(
    () => import("./StaticMapContent"),
    {
        loading: () => (
            <div className="bg-slate-100 rounded-lg p-6 flex flex-col items-center justify-center" style={{ height: "300px" }}>
                <Loader2 className="animate-spin text-sky-500 mb-2" size={32} />
                <p className="text-sm text-slate-600">Loading map...</p>
            </div>
        ),
        ssr: false,
    }
);

interface StaticLocationMapProps {
    latitude: number;
    longitude: number;
    title?: string;
    className?: string;
    height?: string;
}

export default function StaticLocationMap({
    latitude,
    longitude,
    title = "Location",
    className = "",
    height = "300px",
}: StaticLocationMapProps) {
    return (
        <DynamicMap
            latitude={latitude}
            longitude={longitude}
            title={title}
            className={className}
            height={height}
        />
    );
}
